package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

type draftReroll struct {
	ID            int64      `json:"id"`
	DraftID       string     `json:"draft_id"`
	Mode          string     `json:"mode"`
	Note          string     `json:"note"`
	Caption       string     `json:"caption"`
	ImageSHA256   string     `json:"image_sha256"`
	Status        string     `json:"status"`
	Error         string     `json:"error"`
	ResultDraftID string     `json:"result_draft_id"`
	RequestedAt   time.Time  `json:"requested_at"`
	FinishedAt    *time.Time `json:"finished_at"`
}

var rerollModes = map[string]bool{"text": true, "image": true, "both": true}

// RequestReroll queues one regeneration of an unsubmitted Instagram draft.
// It records intent only; Kvant does the generation and nothing is approved.
func (h *Handler) RequestReroll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	var input struct {
		Mode        string `json:"mode"`
		Note        string `json:"note"`
		Caption     string `json:"caption"`
		ImageSHA256 string `json:"image_sha256"`
	}
	if json.NewDecoder(io.LimitReader(r.Body, 32<<10)).Decode(&input) != nil || !rerollModes[input.Mode] {
		writeError(w, 400, "Choose what to regenerate: text, image or both")
		return
	}
	input.Note = strings.TrimSpace(input.Note)
	input.Caption = strings.TrimSpace(input.Caption)
	if utf8.RuneCountInString(input.Note) > 2000 || utf8.RuneCountInString(input.Caption) > 2200 {
		writeError(w, 400, "Keep the note under 2,000 characters and the caption under 2,200")
		return
	}
	id, err := url.PathUnescape(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, 400, "Invalid draft ID")
		return
	}
	draft, err := h.preparedDraft(id)
	if err != nil {
		writeError(w, 404, "Prepared draft not found. Refresh the review queue")
		return
	}
	if draftPlatform(draft) != "instagram" {
		writeError(w, 409, "Only Instagram drafts can be re-rolled for now")
		return
	}
	// Only a prepared image can be kept: uploads never leave the website host.
	if input.ImageSHA256 != "" {
		known := draft.Media.Image != nil && draft.Media.Image.SHA256 == input.ImageSHA256
		for _, c := range draft.Media.Candidates {
			known = known || c.SHA256 == input.ImageSHA256
		}
		if !known {
			writeError(w, 400, "Only a prepared image can be kept")
			return
		}
	}
	if input.Mode != "image" {
		input.Caption = ""
	} else if input.Caption == "" {
		input.Caption = draft.Text
	}
	if input.Mode != "text" {
		input.ImageSHA256 = ""
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	var submitted bool
	if err = h.DB.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM social_review_drafts d JOIN social_schedules s USING(request_id) WHERE d.draft_id=$1)`, id).Scan(&submitted); err != nil {
		writeError(w, 503, "Approval status is unavailable")
		return
	}
	if submitted {
		writeError(w, 409, "This draft is already queued. Edit it instead of re-rolling")
		return
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	var result draftReroll
	err = h.DB.QueryRow(r.Context(), `INSERT INTO draft_rerolls(draft_id,mode,note,caption,image_sha256,requested_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,draft_id,mode,note,caption,image_sha256,status,error,result_draft_id,requested_at,finished_at`,
		id, input.Mode, input.Note, input.Caption, input.ImageSHA256, user).Scan(&result.ID, &result.DraftID, &result.Mode, &result.Note, &result.Caption, &result.ImageSHA256, &result.Status, &result.Error, &result.ResultDraftID, &result.RequestedAt, &result.FinishedAt)
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		writeError(w, 409, "A re-roll for this draft is already in progress")
		return
	}
	if err != nil {
		writeError(w, 503, "The re-roll could not be queued")
		return
	}
	writeJSON(w, 201, result)
}

// Rerolls lists recent requests so the review queue can show progress.
func (h *Handler) Rerolls(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	rows, err := h.DB.Query(r.Context(), `SELECT id,draft_id,mode,note,caption,image_sha256,status,error,result_draft_id,requested_at,finished_at FROM draft_rerolls WHERE requested_at > NOW()-INTERVAL '14 days' ORDER BY requested_at DESC LIMIT 200`)
	if err != nil {
		writeError(w, 503, "Re-rolls are unavailable")
		return
	}
	defer rows.Close()
	result := []draftReroll{}
	for rows.Next() {
		var d draftReroll
		if err = rows.Scan(&d.ID, &d.DraftID, &d.Mode, &d.Note, &d.Caption, &d.ImageSHA256, &d.Status, &d.Error, &d.ResultDraftID, &d.RequestedAt, &d.FinishedAt); err != nil {
			writeError(w, 503, "Re-rolls are unavailable")
			return
		}
		result = append(result, d)
	}
	if rows.Err() != nil {
		writeError(w, 503, "Re-rolls are unavailable")
		return
	}
	writeJSON(w, 200, result)
}

// rerollLease is how long Kvant may hold a claim before another poll retries it.
const rerollLease = "2 hours"

// ClaimRerolls hands pending requests to the preparation job. The key can
// only read and finish re-roll requests; it cannot approve or schedule.
func (h *Handler) ClaimRerolls(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if !secretAuthorized(r, h.PostingPreparationKey) {
		writeError(w, 401, "Preparation authentication required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	// Claims abandoned three times stop retrying and report the failure.
	h.DB.Exec(r.Context(), `UPDATE draft_rerolls SET status='failed',error='Preparation did not finish after three attempts',finished_at=NOW() WHERE status='running' AND attempts>=3 AND claimed_at < NOW()-INTERVAL '`+rerollLease+`'`)
	rows, err := h.DB.Query(r.Context(), `UPDATE draft_rerolls SET status='running',claimed_at=NOW(),attempts=attempts+1 WHERE id IN (SELECT id FROM draft_rerolls WHERE status='pending' OR (status='running' AND attempts<3 AND claimed_at < NOW()-INTERVAL '`+rerollLease+`') ORDER BY requested_at LIMIT 3 FOR UPDATE SKIP LOCKED) RETURNING id,draft_id,mode,note,caption,image_sha256,status,error,result_draft_id,requested_at,finished_at`)
	if err != nil {
		writeError(w, 503, "Re-rolls are unavailable")
		return
	}
	defer rows.Close()
	result := []draftReroll{}
	for rows.Next() {
		var d draftReroll
		if err = rows.Scan(&d.ID, &d.DraftID, &d.Mode, &d.Note, &d.Caption, &d.ImageSHA256, &d.Status, &d.Error, &d.ResultDraftID, &d.RequestedAt, &d.FinishedAt); err != nil {
			writeError(w, 503, "Re-rolls are unavailable")
			return
		}
		result = append(result, d)
	}
	if rows.Err() != nil {
		writeError(w, 503, "Re-rolls are unavailable")
		return
	}
	writeJSON(w, 200, result)
}

// FinishReroll records the outcome of one claimed request.
func (h *Handler) FinishReroll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if !secretAuthorized(r, h.PostingPreparationKey) {
		writeError(w, 401, "Preparation authentication required")
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var input struct {
		Status        string `json:"status"`
		ResultDraftID string `json:"result_draft_id"`
		Error         string `json:"error"`
	}
	if err != nil || json.NewDecoder(io.LimitReader(r.Body, 8<<10)).Decode(&input) != nil {
		writeError(w, 400, "Invalid re-roll result")
		return
	}
	switch input.Status {
	case "done":
		if input.ResultDraftID == "" || len(input.ResultDraftID) > 200 {
			writeError(w, 400, "A finished re-roll needs its replacement draft ID")
			return
		}
		input.Error = ""
	case "failed":
		input.ResultDraftID = ""
		if input.Error = strings.TrimSpace(input.Error); input.Error == "" {
			input.Error = "Preparation failed"
		}
		if utf8.RuneCountInString(input.Error) > 500 {
			input.Error = string([]rune(input.Error)[:500])
		}
	default:
		writeError(w, 400, "Status must be done or failed")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	var draftID string
	err = h.DB.QueryRow(r.Context(), `UPDATE draft_rerolls SET status=$2,result_draft_id=$3,error=$4,finished_at=NOW() WHERE id=$1 AND status='running' RETURNING draft_id`, id, input.Status, input.ResultDraftID, input.Error).Scan(&draftID)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, 409, "This re-roll is not running")
		return
	}
	if err != nil {
		writeError(w, 503, "The result could not be saved")
		return
	}
	writeJSON(w, 200, map[string]any{"id": id, "draft_id": draftID, "status": input.Status})
}
