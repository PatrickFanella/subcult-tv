package handlers

import (
	"bytes"
	"context"
	"errors"
	"image/jpeg"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
)

type blueskyReceipt struct {
	DraftID   string    `json:"draft_id"`
	AccountID string    `json:"account_id"`
	Caption   string    `json:"caption"`
	AltText   string    `json:"alt_text"`
	HasMedia  bool      `json:"has_media"`
	Due       time.Time `json:"due_at"`
	Status    string    `json:"status"`
	PostID    string    `json:"post_id"`
	Hash      string    `json:"-"`
}

func (h *Handler) blueskyReady() bool {
	return h.SocialPosting != nil && h.DB != nil && len(h.BlueskyAccounts) > 0
}
func (h *Handler) blueskyAccount(id string) string {
	for name, allowed := range h.BlueskyAccounts {
		if id == allowed {
			return name
		}
	}
	return ""
}
func (h *Handler) blueskyAccounts(ctx context.Context) ([]postybirb.SocialAccount, error) {
	accounts, err := h.SocialPosting.Accounts(ctx)
	result := []postybirb.SocialAccount{}
	for _, a := range accounts {
		if name := h.blueskyAccount(a.ID); name != "" && a.Identifier == "bluesky" {
			a.Profile = name
			result = append(result, a)
		}
	}
	return result, err
}
func (h *Handler) BlueskyDelivery(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	receipts := []blueskyReceipt{}
	posts := []postybirb.SocialPost{}
	accounts := []postybirb.SocialAccount{}
	configured := h.blueskyReady()
	if h.DB != nil {
		rows, err := h.DB.Query(r.Context(), `SELECT draft_id,account_id,caption,alt_text,length(media)>0,due_at,status,provider_post_id,payload_hash FROM bluesky_schedules ORDER BY updated_at DESC LIMIT 400`)
		if err != nil {
			writeError(w, 503, "Bluesky receipts are unavailable")
			return
		}
		defer rows.Close()
		for rows.Next() {
			var a blueskyReceipt
			if rows.Scan(&a.DraftID, &a.AccountID, &a.Caption, &a.AltText, &a.HasMedia, &a.Due, &a.Status, &a.PostID, &a.Hash) != nil {
				writeError(w, 503, "Bluesky receipts are unavailable")
				return
			}
			if h.blueskyAccount(a.AccountID) != "" {
				receipts = append(receipts, a)
			}
		}
		if rows.Err() != nil {
			writeError(w, 503, "Bluesky receipts are unavailable")
			return
		}
	}
	if configured {
		var err error
		accounts, err = h.blueskyAccounts(r.Context())
		if err != nil {
			writeError(w, 502, "PostyBirb Bluesky accounts could not be checked")
			return
		}
		for _, a := range receipts {
			if a.Due.Before(time.Now().AddDate(0, 0, -30)) || a.Due.After(time.Now().AddDate(0, 0, 90)) {
				continue
			}
			var p postybirb.SocialPost
			p.ID, p.Content, p.PublishDate, p.State = a.PostID, a.Caption, a.Due.UTC().Format(time.RFC3339), "REVIEW"
			p.Integration.ID = a.AccountID
			p.Integration.Name = h.blueskyAccount(a.AccountID)
			if a.Status == "scheduled" && a.PostID != "" {
				p.State, p.ReleaseURL, err = h.SocialPosting.BlueskyStatus(r.Context(), a.PostID, a.AccountID)
				if err != nil {
					writeError(w, 502, "PostyBirb Bluesky delivery could not be checked")
					return
				}
			}
			posts = append(posts, p)
		}
	}
	writeJSON(w, 200, map[string]any{"configured": configured, "accounts": accounts, "receipts": receipts, "posts": posts, "checked_at": time.Now().UTC().Format(time.RFC3339)})
}

func (h *Handler) ApproveBlueskyDraft(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin approval required")
		return
	}
	if !h.blueskyReady() {
		writeError(w, 503, "Bluesky scheduling is not connected")
		return
	}
	id, err := url.PathUnescape(chi.URLParam(r, "id"))
	if err != nil || id == "" {
		writeError(w, 400, "Invalid draft ID")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	if r.ParseMultipartForm(1<<20) != nil {
		writeError(w, 400, "Choose a JPEG under 900 KB")
		return
	}
	defer r.MultipartForm.RemoveAll()
	account, caption, alt := r.FormValue("account_id"), strings.TrimSpace(r.FormValue("caption")), strings.TrimSpace(r.FormValue("alt_text"))
	due, dateErr := time.Parse(time.RFC3339, r.FormValue("due_at"))
	if r.FormValue("approved") != "true" || h.blueskyAccount(account) == "" || caption == "" || !utf8.ValidString(caption) || utf8.RuneCountInString(caption) > 300 || len(caption) > 3000 || dateErr != nil {
		writeError(w, 400, "Approve an allowed Bluesky account, text up to 300 characters and a publish time")
		return
	}
	due = due.UTC().Truncate(time.Second)
	media := []byte{}
	file, _, fileErr := r.FormFile("media")
	if fileErr == nil {
		defer file.Close()
		media, err = io.ReadAll(io.LimitReader(file, (900<<10)+1))
		if err != nil || len(media) == 0 || len(media) > 900<<10 {
			writeError(w, 400, "Choose a JPEG under 900 KB")
			return
		}
		cfg, e := jpeg.DecodeConfig(bytes.NewReader(media))
		if e != nil || cfg.Width < 1 || cfg.Height < 1 || cfg.Width > 4000 || cfg.Height > 4000 {
			writeError(w, 400, "Choose a JPEG no larger than 4000 pixels on either side")
			return
		}
		if _, e = jpeg.Decode(bytes.NewReader(media)); e != nil {
			writeError(w, 400, "The JPEG could not be decoded")
			return
		}
		if alt == "" || !utf8.ValidString(alt) || utf8.RuneCountInString(alt) > 2000 {
			writeError(w, 400, "Describe the image in alt text, up to 2000 characters")
			return
		}
	} else if !errors.Is(fileErr, http.ErrMissingFile) {
		writeError(w, 400, "The image could not be read")
		return
	} else if alt != "" {
		writeError(w, 400, "Alt text requires an image")
		return
	}
	hash := schedulePayloadHash(account, caption, due, append(append([]byte(alt), 0), media...))
	// Lock and persist the draft claim before any provider write. Repeated requests
	// return the saved receipt and uncertain requests never submit a second post.
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Approval storage is unavailable")
		return
	}
	defer tx.Rollback(r.Context())
	if _, err = tx.Exec(r.Context(), `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, "bluesky:"+id); err != nil {
		writeError(w, 503, "Approval could not be claimed")
		return
	}
	var old blueskyReceipt
	err = tx.QueryRow(r.Context(), `SELECT draft_id,account_id,caption,alt_text,length(media)>0,due_at,status,provider_post_id,payload_hash FROM bluesky_schedules WHERE draft_id=$1 FOR UPDATE`, id).Scan(&old.DraftID, &old.AccountID, &old.Caption, &old.AltText, &old.HasMedia, &old.Due, &old.Status, &old.PostID, &old.Hash)
	if err == nil {
		if old.Hash == hash && old.Status == "scheduled" {
			writeJSON(w, 200, old)
		} else {
			writeError(w, 409, "This Bluesky draft was already submitted. Check PostyBirb before retrying")
		}
		return
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		writeError(w, 503, "Approval could not be read")
		return
	}
	d, err := h.preparedDraft(id)
	if err != nil {
		writeError(w, 404, "Prepared Bluesky draft not found")
		return
	}
	if draftPlatform(d) != "bluesky" {
		writeError(w, 409, "Only Bluesky drafts use this scheduling path")
		return
	}
	if d.Text != r.FormValue("original_text") {
		writeError(w, 409, "The prepared post changed. Refresh before approving")
		return
	}
	if d.Mode == "radar" && d.expired(time.Now()) {
		writeError(w, 409, "This timely post expired. Regenerate it from current sources")
		return
	}
	if !due.After(time.Now()) || due.After(time.Now().AddDate(0, 0, 90)) {
		writeError(w, 400, "Choose a future publish time within 90 days")
		return
	}
	accounts, err := h.blueskyAccounts(r.Context())
	if err != nil {
		writeError(w, 502, "PostyBirb Bluesky accounts could not be checked")
		return
	}
	ready := false
	for _, a := range accounts {
		if a.ID == account && !a.Disabled {
			ready = true
		}
	}
	if !ready {
		writeError(w, 409, "This Bluesky account is disconnected in PostyBirb")
		return
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	_, err = tx.Exec(r.Context(), `INSERT INTO bluesky_schedules(draft_id,account_id,caption,alt_text,media,due_at,payload_hash,status,approved_by) VALUES($1,$2,$3,$4,$5,$6,$7,'submitting',$8)`, id, account, caption, alt, media, due, hash, user)
	if err != nil {
		var existing string
		// The unique payload hash also prevents identical approvals under a second draft.
		tx.Rollback(r.Context())
		if h.DB.QueryRow(r.Context(), `SELECT draft_id FROM bluesky_schedules WHERE payload_hash=$1`, hash).Scan(&existing) == nil {
			writeError(w, 409, "This exact Bluesky post already has an approval")
			return
		}
		writeError(w, 503, "Approval could not be recorded")
		return
	}
	if tx.Commit(r.Context()) != nil {
		writeError(w, 503, "Approval could not be recorded")
		return
	}
	ctx, cancel := context.WithTimeout(context.WithoutCancel(r.Context()), 90*time.Second)
	defer cancel()
	providerID, err := h.SocialPosting.CreateBluesky(ctx, account, caption, alt, media)
	if providerID != "" {
		if _, saveErr := h.DB.Exec(ctx, `UPDATE bluesky_schedules SET provider_post_id=$2 WHERE draft_id=$1`, id, providerID); saveErr != nil {
			writeError(w, 502, "Private PostyBirb draft created, but its receipt could not be saved. Check PostyBirb before retrying")
			return
		}
	}
	if err == nil {
		err = h.SocialPosting.QueueBluesky(ctx, providerID, account, caption, alt, len(media) > 0, due)
	}
	if err != nil {
		h.DB.Exec(ctx, `UPDATE bluesky_schedules SET status='uncertain',updated_at=NOW() WHERE draft_id=$1`, id)
		writeError(w, 502, "Bluesky scheduling could not be confirmed. Check PostyBirb before retrying")
		return
	}
	if _, err = h.DB.Exec(ctx, `UPDATE bluesky_schedules SET status='scheduled',updated_at=NOW() WHERE draft_id=$1`, id); err != nil {
		writeError(w, 502, "PostyBirb accepted the schedule but its receipt could not be saved. Check PostyBirb before retrying")
		return
	}
	writeJSON(w, 201, blueskyReceipt{DraftID: id, AccountID: account, Caption: caption, AltText: alt, HasMedia: len(media) > 0, Due: due, Status: "scheduled", PostID: providerID})
}
