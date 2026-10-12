package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"slices"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/buffer"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

type BufferProvider interface {
	Channels(context.Context) ([]buffer.Channel, error)
	Posts(context.Context, []string, time.Time) ([]buffer.Post, error)
	Post(context.Context, string) (buffer.Post, error)
	Schedule(context.Context, string, string, []string, time.Time) (buffer.Post, error)
	Reschedule(context.Context, string, string, []string, time.Time) (buffer.Post, error)
	History(context.Context, []string, time.Time) ([]buffer.HistoryPost, error)
}

// bufferHistoryCache keeps Buffer's small hourly request allowance for scheduling.
var bufferHistoryCache struct {
	sync.Mutex
	at    time.Time
	posts []buffer.HistoryPost
}

// BufferHistory lists X posts from the previous 30 days onward with their
// delivery outcome and metrics. It is read-only.
func (h *Handler) BufferHistory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	if h.BufferPosting == nil || len(h.BufferChannels) == 0 {
		writeJSON(w, 200, map[string]any{"configured": false, "posts": []buffer.HistoryPost{}})
		return
	}
	bufferHistoryCache.Lock()
	defer bufferHistoryCache.Unlock()
	if time.Since(bufferHistoryCache.at) > 2*time.Minute || r.URL.Query().Get("refresh") == "1" && time.Since(bufferHistoryCache.at) > 15*time.Second {
		posts, err := h.BufferPosting.History(r.Context(), h.BufferChannels, time.Now().AddDate(0, 0, -30))
		if err != nil {
			writeError(w, 502, "Buffer history could not be checked: "+err.Error())
			return
		}
		bufferHistoryCache.posts, bufferHistoryCache.at = posts, time.Now()
	}
	writeJSON(w, 200, map[string]any{"configured": true, "checked_at": bufferHistoryCache.at.UTC(), "posts": bufferHistoryCache.posts})
}

type bufferReceipt struct {
	DraftID   string    `json:"draft_id"`
	Version   int       `json:"version"`
	ChannelID string    `json:"channel_id"`
	Caption   string    `json:"caption"`
	Replies   []string  `json:"replies"`
	Due       time.Time `json:"due_at"`
	Status    string    `json:"status"`
	PostID    string    `json:"post_id"`
	Hash      string    `json:"-"`
}

func (h *Handler) bufferChannels(ctx context.Context) ([]buffer.Channel, error) {
	channels, err := h.BufferPosting.Channels(ctx)
	if err != nil {
		return nil, err
	}
	result := []buffer.Channel{}
	for _, c := range channels {
		if c.Service == "twitter" && slices.Contains(h.BufferChannels, c.ID) {
			result = append(result, c)
		}
	}
	return result, nil
}
func (h *Handler) BufferDelivery(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	receipts := []bufferReceipt{}
	if h.DB != nil {
		rows, err := h.DB.Query(r.Context(), `SELECT draft_id,version,channel_id,caption,replies,due_at,status,provider_post_id FROM buffer_schedules ORDER BY updated_at DESC LIMIT 400`)
		if err != nil {
			writeError(w, 503, "X scheduling receipts are unavailable")
			return
		}
		defer rows.Close()
		for rows.Next() {
			var a bufferReceipt
			if rows.Scan(&a.DraftID, &a.Version, &a.ChannelID, &a.Caption, &a.Replies, &a.Due, &a.Status, &a.PostID) != nil {
				writeError(w, 503, "X scheduling receipts are unavailable")
				return
			}
			receipts = append(receipts, a)
		}
		if rows.Err() != nil {
			writeError(w, 503, "X scheduling receipts are unavailable")
			return
		}
	}
	configured := h.BufferPosting != nil && len(h.BufferChannels) > 0
	channels := []buffer.Channel{}
	if configured {
		var err error
		channels, err = h.bufferChannels(r.Context())
		if err != nil {
			writeError(w, 502, "Buffer channels could not be checked")
			return
		}
	}
	writeJSON(w, 200, map[string]any{"configured": configured, "channels": channels, "receipts": receipts})
}

var xURLs = regexp.MustCompile(`https?://\S+`)

func xTextLength(s string) int {
	return utf8.RuneCountInString(xURLs.ReplaceAllString(s, "")) + 23*len(xURLs.FindAllString(s, -1))
}

// maxReplies bounds a thread. Buffer's plan allows one scheduled thread per channel.
const maxReplies = 3

// cleanReplies trims self-replies and rejects empty or oversized ones.
func cleanReplies(replies []string) ([]string, bool) {
	if len(replies) > maxReplies {
		return nil, false
	}
	clean := make([]string, 0, len(replies))
	for _, reply := range replies {
		reply = strings.TrimSpace(reply)
		if reply == "" || xTextLength(reply) > 280 {
			return nil, false
		}
		clean = append(clean, reply)
	}
	return clean, true
}

// threadHash binds the replies into the approval hash; a single post keeps its old hash.
func threadHash(replies []string) []byte {
	if len(replies) == 0 {
		return nil
	}
	return []byte(strings.Join(replies, "\x00"))
}
func (h *Handler) ApproveBufferDraft(w http.ResponseWriter, r *http.Request) {
	h.changeBufferDraft(w, r, false)
}
func (h *Handler) EditBufferDraft(w http.ResponseWriter, r *http.Request) {
	h.changeBufferDraft(w, r, true)
}
func (h *Handler) changeBufferDraft(w http.ResponseWriter, r *http.Request, edit bool) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin approval required")
		return
	}
	if h.DB == nil || h.BufferPosting == nil || len(h.BufferChannels) == 0 {
		writeError(w, 503, "Buffer scheduling is not connected")
		return
	}
	id, err := url.PathUnescape(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, 400, "Invalid draft ID")
		return
	}
	var input struct {
		Channel  string   `json:"channel_id"`
		Caption  string   `json:"caption"`
		Replies  []string `json:"replies"`
		Original string   `json:"original_text"`
		Due      string   `json:"due_at"`
		Approved bool     `json:"approved"`
		Version  int      `json:"version"`
	}
	if json.NewDecoder(io.LimitReader(r.Body, 16<<10)).Decode(&input) != nil || !input.Approved {
		writeError(w, 400, "Approve the exact tweet before scheduling")
		return
	}
	input.Caption = strings.TrimSpace(input.Caption)
	replies, repliesOK := cleanReplies(input.Replies)
	if !repliesOK {
		writeError(w, 400, "Write up to 3 replies of up to 280 characters each")
		return
	}
	due, dateErr := time.Parse(time.RFC3339, input.Due)
	if input.Caption == "" || xTextLength(input.Caption) > 280 || dateErr != nil || !due.After(time.Now()) || due.After(time.Now().AddDate(0, 0, 90)) || !slices.Contains(h.BufferChannels, input.Channel) {
		writeError(w, 400, "Choose an X channel, text up to 280 characters and a future time within 90 days")
		return
	}
	due = due.UTC().Truncate(time.Second)
	hash := schedulePayloadHash(input.Channel, input.Caption, due, threadHash(replies))
	if !edit {
		d, e := h.preparedDraft(id)
		if e != nil {
			writeError(w, 404, "Prepared X draft not found")
			return
		}
		if draftPlatform(d) != "x" {
			writeError(w, 409, "Only X drafts use this scheduling path")
			return
		}
		if d.Text != input.Original {
			writeError(w, 409, "The prepared tweet changed. Refresh before approving")
			return
		}
		if d.Mode == "radar" && d.expired(time.Now()) {
			writeError(w, 409, "This timely tweet expired. Regenerate it from current sources")
			return
		}
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Approval storage is unavailable")
		return
	}
	defer tx.Rollback(r.Context())
	if _, err = tx.Exec(r.Context(), `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, "buffer:"+id); err != nil {
		writeError(w, 503, "Approval could not be claimed")
		return
	}
	var old bufferReceipt
	err = tx.QueryRow(r.Context(), `SELECT draft_id,version,channel_id,caption,replies,due_at,status,provider_post_id,payload_hash FROM buffer_schedules WHERE draft_id=$1 FOR UPDATE`, id).Scan(&old.DraftID, &old.Version, &old.ChannelID, &old.Caption, &old.Replies, &old.Due, &old.Status, &old.PostID, &old.Hash)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		writeError(w, 503, "Approval could not be read")
		return
	}
	if !edit && err == nil {
		if old.Hash == hash && old.Status == "scheduled" {
			writeJSON(w, 200, old)
		} else {
			writeError(w, 409, "This tweet was already submitted. Check its receipt before retrying")
		}
		return
	}
	if edit && (err != nil || old.Version != input.Version || old.Status != "scheduled" || old.PostID == "" || old.ChannelID != input.Channel) {
		writeError(w, 409, "The queued tweet changed or is uncertain. Refresh before editing")
		return
	}
	// Serialize matching content across drafts and keep uncertain writes blocked.
	if _, err = tx.Exec(r.Context(), `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, "buffer-content:"+input.Channel+":"+input.Caption); err != nil {
		writeError(w, 503, "Approval could not be claimed")
		return
	}
	var duplicate bool
	if err = tx.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM buffer_schedules WHERE draft_id<>$1 AND channel_id=$2 AND caption=$3)`, id, input.Channel, input.Caption).Scan(&duplicate); err != nil {
		writeError(w, 503, "Approval history could not be checked")
		return
	}
	if duplicate {
		writeError(w, 409, "This exact tweet already has an approval receipt. Check it before approving")
		return
	}
	channels, e := h.bufferChannels(r.Context())
	if e != nil {
		writeError(w, 502, "Buffer channels could not be checked")
		return
	}
	ready := false
	for _, c := range channels {
		ready = ready || (c.ID == input.Channel && !c.Disconnected && !c.Locked && !c.Paused)
	}
	if !ready {
		writeError(w, 409, "This X channel is disconnected, locked or paused in Buffer")
		return
	}
	if edit {
		live, e := h.BufferPosting.Post(r.Context(), old.PostID)
		textChanged := input.Caption != old.Caption || !slices.Equal(replies, old.Replies)
		if e != nil || live.ChannelID != old.ChannelID || live.Text != old.Caption || !slices.Equal(live.Replies(), old.Replies) || live.Status != "scheduled" || !slices.Contains(live.Actions, "updatePostSchedule") || (textChanged && !slices.Contains(live.Actions, "updatePost")) {
			writeError(w, 409, "Buffer no longer shows this exact tweet as editable and scheduled")
			return
		}
	} else {
		posts, e := h.BufferPosting.Posts(r.Context(), []string{input.Channel}, time.Now().AddDate(0, 0, -90))
		if e != nil {
			writeError(w, 502, "Buffer history could not be checked for duplicates")
			return
		}
		for _, p := range posts {
			if p.ChannelID == input.Channel && strings.TrimSpace(p.Text) == input.Caption && (p.Status == "scheduled" || p.Status == "sent" || p.Status == "sending") {
				writeError(w, 409, "This exact tweet already exists in Buffer. Check the queue before approving")
				return
			}
		}
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	if edit {
		_, err = tx.Exec(r.Context(), `UPDATE buffer_schedules SET caption=$2,replies=$5,due_at=$3,payload_hash=$4,status='submitting',updated_at=NOW() WHERE draft_id=$1`, id, input.Caption, due, hash, replies)
	} else {
		_, err = tx.Exec(r.Context(), `INSERT INTO buffer_schedules(draft_id,channel_id,caption,replies,due_at,payload_hash,status,approved_by) VALUES($1,$2,$3,$7,$4,$5,'submitting',$6)`, id, input.Channel, input.Caption, due, hash, user, replies)
	}
	if err != nil || tx.Commit(r.Context()) != nil {
		writeError(w, 503, "Approval could not be recorded")
		return
	}
	// Persist the claim before the provider write. A timeout never permits an automatic retry.
	ctx, cancel := context.WithTimeout(context.WithoutCancel(r.Context()), 45*time.Second)
	defer cancel()
	var post buffer.Post
	if edit {
		post, err = h.BufferPosting.Reschedule(ctx, old.PostID, input.Caption, replies, due)
	} else {
		post, err = h.BufferPosting.Schedule(ctx, input.Channel, input.Caption, replies, due)
	}
	var rejected *buffer.Rejected
	if errors.As(err, &rejected) {
		// Nothing changed in Buffer: release the claim so the owner can adjust and retry.
		if edit {
			h.DB.Exec(ctx, `UPDATE buffer_schedules SET caption=$2,replies=$3,due_at=$4,payload_hash=$5,status='scheduled',updated_at=NOW() WHERE draft_id=$1`, id, old.Caption, old.Replies, old.Due, old.Hash)
		} else {
			h.DB.Exec(ctx, `DELETE FROM buffer_schedules WHERE draft_id=$1 AND status='submitting'`, id)
		}
		writeError(w, 409, rejected.Error())
		return
	}
	if err != nil || post.ID == "" || post.ChannelID != input.Channel || post.Text != input.Caption || !slices.Equal(post.Replies(), replies) || !post.Due.Equal(due) || post.Status != "scheduled" || (edit && post.ID != old.PostID) {
		h.DB.Exec(ctx, `UPDATE buffer_schedules SET status='uncertain',provider_post_id=COALESCE(NULLIF($2,''),provider_post_id),updated_at=NOW() WHERE draft_id=$1`, id, post.ID)
		writeError(w, 502, "Buffer scheduling could not be confirmed. Check Buffer before retrying")
		return
	}
	version := 1
	if edit {
		version = old.Version + 1
	}
	_, err = h.DB.Exec(ctx, `UPDATE buffer_schedules SET version=$2,channel_id=$3,caption=$4,replies=$9,due_at=$5,payload_hash=$6,status='scheduled',provider_post_id=$7,approved_by=$8,updated_at=NOW() WHERE draft_id=$1`, id, version, input.Channel, input.Caption, due, hash, post.ID, user, replies)
	if err != nil {
		writeError(w, 502, "Buffer accepted the tweet but its receipt could not be saved. Check Buffer before retrying")
		return
	}
	writeJSON(w, 201, bufferReceipt{DraftID: id, Version: version, ChannelID: input.Channel, Caption: input.Caption, Replies: replies, Due: due, Status: "scheduled", PostID: post.ID})
}
