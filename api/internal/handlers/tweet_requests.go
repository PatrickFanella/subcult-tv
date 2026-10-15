package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

type tweetRequest struct {
	ID            int64      `json:"id"`
	Account       string     `json:"account"`
	Note          string     `json:"note"`
	Status        string     `json:"status"`
	Attempts      int        `json:"attempts"`
	Error         string     `json:"error"`
	ResultDraftID string     `json:"result_draft_id"`
	RequestedAt   time.Time  `json:"requested_at"`
	FinishedAt    *time.Time `json:"finished_at"`
}

const tweetColumns = `id,account,note,status,attempts,error,result_draft_id,requested_at,finished_at`

func scanTweet(row interface{ Scan(...any) error }) (d tweetRequest, err error) {
	err = row.Scan(&d.ID, &d.Account, &d.Note, &d.Status, &d.Attempts, &d.Error, &d.ResultDraftID, &d.RequestedAt, &d.FinishedAt)
	return
}

func (h *Handler) tweetAdmin(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return false
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return false
	}
	return true
}

// RequestTweet records a single-account drafting request. Approval remains separate.
func (h *Handler) RequestTweet(w http.ResponseWriter, r *http.Request) {
	if !h.tweetAdmin(w, r) {
		return
	}
	if h.PostingPreparationKey == "" {
		writeError(w, 503, "Tweet preparation is not connected")
		return
	}
	var input struct {
		Account string `json:"account"`
		Note    string `json:"note"`
	}
	decoder := json.NewDecoder(io.LimitReader(r.Body, 16<<10))
	if decoder.Decode(&input) != nil {
		writeError(w, 400, "Choose an account and an optional topic")
		return
	}
	input.Note = strings.TrimSpace(input.Note)
	if utf8.RuneCountInString(input.Note) > 2000 {
		writeError(w, 400, "Keep the topic under 2,000 characters")
		return
	}
	snapshot, err := h.loadPosting()
	if err != nil || !snapshot.Connected {
		writeError(w, 503, "Preparation accounts are unavailable. Refresh the review queue")
		return
	}
	known := false
	for _, a := range snapshot.Accounts {
		known = known || (a.Account == input.Account && a.Account != "")
	}
	if !known {
		writeError(w, 400, "Choose a configured preparation account")
		return
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	d, err := scanTweet(h.DB.QueryRow(r.Context(), `INSERT INTO tweet_requests(account,note,requested_by) VALUES($1,$2,$3) RETURNING `+tweetColumns, input.Account, input.Note, user))
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		writeError(w, 409, "A tweet for this account is already being prepared")
		return
	}
	if err != nil {
		writeError(w, 503, "The tweet request could not be queued")
		return
	}
	writeJSON(w, 201, d)
}

func (h *Handler) TweetRequests(w http.ResponseWriter, r *http.Request) {
	if !h.tweetAdmin(w, r) {
		return
	}
	rows, err := h.DB.Query(r.Context(), `SELECT `+tweetColumns+` FROM tweet_requests WHERE status IN ('pending','running') OR requested_at>NOW()-INTERVAL '14 days' ORDER BY requested_at DESC LIMIT 200`)
	if err != nil {
		writeError(w, 503, "Tweet requests are unavailable")
		return
	}
	defer rows.Close()
	result := []tweetRequest{}
	for rows.Next() {
		d, err := scanTweet(rows)
		if err != nil {
			writeError(w, 503, "Tweet requests are unavailable")
			return
		}
		result = append(result, d)
	}
	if rows.Err() != nil {
		writeError(w, 503, "Tweet requests are unavailable")
		return
	}
	writeJSON(w, 200, result)
}

// ClaimTweetRequests leases one job to the preparation-only worker.
func (h *Handler) ClaimTweetRequests(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if !secretAuthorized(r, h.PostingPreparationKey) {
		writeError(w, 401, "Preparation authentication required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	_, err := h.DB.Exec(r.Context(), `UPDATE tweet_requests SET status='failed',error='Preparation did not finish after three attempts',finished_at=NOW() WHERE status='running' AND attempts>=3 AND claimed_at<NOW()-INTERVAL '2 hours'`)
	if err != nil {
		writeError(w, 503, "Tweet requests are unavailable")
		return
	}
	d, err := scanTweet(h.DB.QueryRow(r.Context(), `UPDATE tweet_requests SET status='running',claimed_at=NOW(),attempts=attempts+1 WHERE id IN (SELECT id FROM tweet_requests WHERE status='pending' OR (status='running' AND attempts<3 AND claimed_at<NOW()-INTERVAL '2 hours') ORDER BY requested_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING `+tweetColumns))
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, 200, []tweetRequest{})
		return
	}
	if err != nil {
		writeError(w, 503, "Tweet requests are unavailable")
		return
	}
	writeJSON(w, 200, []tweetRequest{d})
}

func (h *Handler) FinishTweetRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if !secretAuthorized(r, h.PostingPreparationKey) {
		writeError(w, 401, "Preparation authentication required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var input struct {
		Status        string `json:"status"`
		Attempts      int    `json:"attempts"`
		ResultDraftID string `json:"result_draft_id"`
		Error         string `json:"error"`
	}
	if err != nil || id <= 0 || json.NewDecoder(io.LimitReader(r.Body, 8<<10)).Decode(&input) != nil || input.Attempts < 1 || (input.Status != "done" && input.Status != "failed") {
		writeError(w, 400, "Invalid tweet preparation result")
		return
	}
	job, err := scanTweet(h.DB.QueryRow(r.Context(), `SELECT `+tweetColumns+` FROM tweet_requests WHERE id=$1`, id))
	if err != nil || job.Status != "running" || job.Attempts != input.Attempts {
		writeError(w, 409, "This tweet request is not held by this attempt")
		return
	}
	if input.Status == "done" {
		draft, err := h.preparedDraft(input.ResultDraftID)
		if err != nil || draftPlatform(draft) != "x" || draft.Account != job.Account || !strings.HasSuffix(draft.ID, fmt.Sprintf("-ondemand-%d:0", id)) {
			writeError(w, 409, "The generated tweet is not yet available for this account")
			return
		}
		input.Error = ""
	} else {
		input.ResultDraftID = ""
		input.Error = strings.TrimSpace(input.Error)
		if input.Error == "" {
			input.Error = "Tweet preparation failed"
		}
		if utf8.RuneCountInString(input.Error) > 500 {
			input.Error = string([]rune(input.Error)[:500])
		}
	}
	tag, err := h.DB.Exec(r.Context(), `UPDATE tweet_requests SET status=$2,result_draft_id=$3,error=$4,finished_at=NOW() WHERE id=$1 AND status='running' AND attempts=$5`, id, input.Status, input.ResultDraftID, input.Error, input.Attempts)
	if err != nil {
		writeError(w, 503, "The result could not be saved")
		return
	}
	if tag.RowsAffected() != 1 {
		writeError(w, 409, "This tweet request is not held by this attempt")
		return
	}
	writeJSON(w, 200, map[string]any{"id": id, "status": input.Status})
}
