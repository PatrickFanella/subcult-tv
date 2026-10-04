package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"image/jpeg"
	"io"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

type reviewDraft struct {
	ID        string    `json:"draft_id"`
	Version   int       `json:"version"`
	AccountID string    `json:"account_id"`
	Caption   string    `json:"caption"`
	DueAt     time.Time `json:"due_at"`
	HasMedia  bool      `json:"has_media"`
	Status    string    `json:"status"`
	PostID    string    `json:"post_id"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (h *Handler) preparedDraft(id string) (postingDraft, error) {
	data, err := h.loadPosting()
	if err != nil {
		return postingDraft{}, err
	}
	for _, draft := range data.Drafts {
		if draft.ID == id {
			return draft, nil
		}
	}
	return postingDraft{}, pgx.ErrNoRows
}

func (h *Handler) ReviewDrafts(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	w.Header().Set("Cache-Control", "private, no-store")
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	rows, err := h.DB.Query(r.Context(), `SELECT d.draft_id,d.version,d.account_id,d.caption,d.due_at,length(d.media)>0,COALESCE(s.status,'draft'),COALESCE(s.provider_post_id,''),d.updated_at FROM social_review_drafts d LEFT JOIN social_schedules s USING(request_id) ORDER BY d.updated_at DESC LIMIT 400`)
	if err != nil {
		writeError(w, 503, "Saved drafts are unavailable")
		return
	}
	defer rows.Close()
	result := []reviewDraft{}
	for rows.Next() {
		var d reviewDraft
		if err := rows.Scan(&d.ID, &d.Version, &d.AccountID, &d.Caption, &d.DueAt, &d.HasMedia, &d.Status, &d.PostID, &d.UpdatedAt); err != nil {
			writeError(w, 503, "Saved drafts are unavailable")
			return
		}
		result = append(result, d)
	}
	if rows.Err() != nil {
		writeError(w, 503, "Saved drafts are unavailable")
		return
	}
	writeJSON(w, 200, result)
}

// SaveReviewDraft stores an edit without granting approval or exposing its image.
func (h *Handler) SaveReviewDraft(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access is required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	id := chi.URLParam(r, "id")
	if _, err := h.preparedDraft(id); err != nil {
		writeError(w, 404, "Prepared draft not found. Refresh the review queue")
		return
	}
	if r.ParseMultipartForm(1<<20) != nil {
		writeError(w, 400, "Invalid draft upload")
		return
	}
	defer r.MultipartForm.RemoveAll()
	version, err := strconv.Atoi(r.FormValue("version"))
	caption := strings.TrimSpace(r.FormValue("caption"))
	account := r.FormValue("account_id")
	due, dateErr := time.Parse(time.RFC3339, r.FormValue("due_at"))
	if err != nil || version < 0 || !h.allowedSocial(account) || caption == "" || utf8.RuneCountInString(caption) > 2200 || dateErr != nil {
		writeError(w, 400, "Choose an account, caption and publish time")
		return
	}
	if due.Before(time.Now().Add(24*time.Hour)) || due.After(time.Now().AddDate(0, 0, 90)) {
		writeError(w, 400, "Schedule between 24 hours and 90 days ahead")
		return
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Draft could not be saved")
		return
	}
	defer tx.Rollback(r.Context())
	// Serialize first saves too; row locking alone cannot lock an absent row.
	if _, err = tx.Exec(r.Context(), `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, id); err != nil {
		writeError(w, 503, "Draft could not be saved")
		return
	}
	var oldVersion int
	var media []byte
	var oldRequest string
	err = tx.QueryRow(r.Context(), `SELECT version,media,request_id FROM social_review_drafts WHERE draft_id=$1 FOR UPDATE`, id).Scan(&oldVersion, &media, &oldRequest)
	if err != nil && err != pgx.ErrNoRows {
		writeError(w, 503, "Draft could not be read")
		return
	}
	if oldVersion != version {
		writeError(w, 409, "This draft changed. Refresh before editing")
		return
	}
	var submitted bool
	if err = tx.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM social_schedules WHERE request_id=$1)`, oldRequest).Scan(&submitted); err != nil {
		writeError(w, 503, "Approval status is unavailable")
		return
	}
	if submitted {
		writeError(w, 409, "This draft has already been submitted. Manage it in Postiz")
		return
	}
	file, _, fileErr := r.FormFile("media")
	if fileErr == nil {
		defer file.Close()
		media, err = io.ReadAll(io.LimitReader(file, (900<<10)+1))
		if err != nil || len(media) > 900<<10 {
			writeError(w, 400, "Choose a JPEG under 900 KB")
			return
		}
	} else if fileErr != http.ErrMissingFile {
		writeError(w, 400, "Invalid image upload")
		return
	}
	if len(media) > 0 {
		img, e := jpeg.DecodeConfig(bytes.NewReader(media))
		if e != nil || img.Width < 320 || img.Width > 1440 || img.Height < 1 || float64(img.Width)/float64(img.Height) < 0.8 || float64(img.Width)/float64(img.Height) > 1.91 {
			writeError(w, 400, "Choose a JPEG 320–1440 pixels wide with an aspect ratio between 4:5 and 1.91:1")
			return
		}
		if _, e = jpeg.Decode(bytes.NewReader(media)); e != nil {
			writeError(w, 400, "The JPEG could not be decoded")
			return
		}
	}
	if media == nil {
		media = []byte{}
	}
	var nonce [24]byte
	if _, err = rand.Read(nonce[:]); err != nil {
		writeError(w, 500, "Draft could not be saved")
		return
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	_, err = tx.Exec(r.Context(), `INSERT INTO social_review_drafts(draft_id,version,request_id,account_id,caption,due_at,media,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(draft_id) DO UPDATE SET version=EXCLUDED.version,request_id=EXCLUDED.request_id,account_id=EXCLUDED.account_id,caption=EXCLUDED.caption,due_at=EXCLUDED.due_at,media=EXCLUDED.media,updated_by=EXCLUDED.updated_by,updated_at=NOW()`, id, version+1, hex.EncodeToString(nonce[:]), account, caption, due, media, user)
	if err != nil || tx.Commit(r.Context()) != nil {
		writeError(w, 503, "Draft could not be saved")
		return
	}
	writeJSON(w, 200, map[string]any{"draft_id": id, "version": version + 1, "status": "draft"})
}

func (h *Handler) ReviewDraftMedia(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	w.Header().Set("Cache-Control", "private, no-store")
	if h.DB == nil {
		http.NotFound(w, r)
		return
	}
	version, err := strconv.Atoi(r.URL.Query().Get("version"))
	if err != nil || version < 1 {
		http.NotFound(w, r)
		return
	}
	var media []byte
	if h.DB.QueryRow(r.Context(), `SELECT media FROM social_review_drafts WHERE draft_id=$1 AND version=$2`, chi.URLParam(r, "id"), version).Scan(&media) != nil || len(media) == 0 {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	http.ServeContent(w, r, "preview.jpg", time.Time{}, bytes.NewReader(media))
}

// ApproveReviewDraft submits only the persisted version the owner previewed.
func (h *Handler) ApproveReviewDraft(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin approval is required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	var approval struct {
		Version  int  `json:"version"`
		Approved bool `json:"approved"`
	}
	if json.NewDecoder(io.LimitReader(r.Body, 4096)).Decode(&approval) != nil || !approval.Approved {
		writeError(w, 400, "Explicit approval is required")
		return
	}
	id := chi.URLParam(r, "id")
	snapshot, snapshotErr := h.loadPosting()
	if snapshotErr != nil || snapshot.Stale {
		writeError(w, 503, "Refresh the preparation source before approving")
		return
	}
	draft, err := h.preparedDraft(id)
	if err != nil {
		writeError(w, 409, "Prepared draft is unavailable. Refresh before approving")
		return
	}
	if draft.ExpiresAt != "" {
		expiry, e := time.Parse(time.RFC3339, draft.ExpiresAt)
		if e != nil || !expiry.After(time.Now()) {
			writeError(w, 409, "This draft has expired")
			return
		}
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Draft could not be read")
		return
	}
	defer tx.Rollback(r.Context())
	var version int
	var requestID, account, caption string
	var due time.Time
	var media []byte
	err = tx.QueryRow(r.Context(), `SELECT version,request_id,account_id,caption,due_at,media FROM social_review_drafts WHERE draft_id=$1 FOR UPDATE`, id).Scan(&version, &requestID, &account, &caption, &due, &media)
	if err != nil || version != approval.Version {
		writeError(w, 409, "This draft changed. Refresh before approving")
		return
	}
	if len(media) == 0 {
		writeError(w, 400, "Add an image in Edit before approving")
		return
	}
	var payload bytes.Buffer
	form := multipart.NewWriter(&payload)
	for k, v := range map[string]string{"request_id": requestID, "account_id": account, "caption": caption, "due_at": due.Format(time.RFC3339), "approved": "true"} {
		_ = form.WriteField(k, v)
	}
	part, _ := form.CreateFormFile("media", "image.jpg")
	_, _ = part.Write(media)
	_ = form.Close()
	cloned := r.Clone(r.Context())
	cloned.ContentLength = int64(payload.Len())
	cloned.Method = "POST"
	cloned.Body = io.NopCloser(&payload)
	cloned.Header = r.Header.Clone()
	cloned.Header.Set("Content-Type", form.FormDataContentType())
	cloned.Form = nil
	cloned.PostForm = nil
	cloned.MultipartForm = nil
	// Existing idempotency and uncertain-submission safeguards remain the sole
	// Instagram delivery path. The row lock prevents concurrent edits until it returns.
	h.ApproveSchedule(w, cloned)
}
