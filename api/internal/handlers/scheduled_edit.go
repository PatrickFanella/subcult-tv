package handlers

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
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
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
)

// editCutoff keeps edits away from PostyBirb's own scheduler pass.
const editCutoff = 30 * time.Minute

// editTimeout bounds the provider sequence, which must not stop halfway just
// because the browser went away.
const editTimeout = 2 * time.Minute

// EditScheduledDraft changes a post that is already queued in PostyBirb.
//
// A time-only change moves the existing submission. A caption, account or
// image change first creates and validates a replacement, then withdraws the
// queued submission, confirms it can no longer post, and queues the
// replacement. The new time must still be 24 hours to 90 days ahead, and
// nothing changes within 30 minutes of the current time. The receipt is
// claimed against the exact content that was read, so a concurrent edit or
// approval gets a conflict, and any step whose outcome is unknown leaves the
// receipt "uncertain" for reconciliation.
func (h *Handler) EditScheduledDraft(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin approval is required")
		return
	}
	if !h.socialReady() {
		writeError(w, 503, "PostyBirb scheduling is not configured")
		return
	}
	id, err := url.PathUnescape(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, 400, "Invalid draft ID")
		return
	}
	if r.ParseMultipartForm(1<<20) != nil {
		writeError(w, 400, "Invalid edit")
		return
	}
	defer r.MultipartForm.RemoveAll()
	version, err := strconv.Atoi(r.FormValue("version"))
	caption := strings.TrimSpace(r.FormValue("caption"))
	account := r.FormValue("account_id")
	due, dateErr := time.Parse(time.RFC3339, r.FormValue("due_at"))
	if err != nil || version < 1 || !h.allowedSocial(account) || caption == "" || utf8.RuneCountInString(caption) > 2200 || dateErr != nil {
		writeError(w, 400, "Choose an account, caption and publish time")
		return
	}
	due = due.UTC().Truncate(time.Second)
	if due.Before(time.Now().Add(24*time.Hour)) || due.After(time.Now().AddDate(0, 0, 90)) {
		writeError(w, 400, "Schedule between 24 hours and 90 days ahead")
		return
	}
	var upload []byte
	file, _, fileErr := r.FormFile("media")
	if fileErr == nil {
		defer file.Close()
		upload, err = io.ReadAll(io.LimitReader(file, (900<<10)+1))
		if err != nil || len(upload) == 0 || len(upload) > 900<<10 {
			writeError(w, 400, "Choose a JPEG under 900 KB")
			return
		}
		if problem := instagramJPEGProblem(upload); problem != "" {
			writeError(w, 400, problem)
			return
		}
	} else if fileErr != http.ErrMissingFile {
		writeError(w, 400, "Invalid image upload")
		return
	}

	var current int
	var requestID, oldAccount, oldCaption, status, providerID, oldHash string
	var oldDue time.Time
	var oldMedia []byte
	err = h.DB.QueryRow(r.Context(), `SELECT d.version,d.request_id,s.account_id,s.caption,s.due_at,s.media,s.status,s.provider_post_id,s.payload_hash FROM social_review_drafts d JOIN social_schedules s USING(request_id) WHERE d.draft_id=$1 AND s.provider='postybirb'`, id).Scan(&current, &requestID, &oldAccount, &oldCaption, &oldDue, &oldMedia, &status, &providerID, &oldHash)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, 404, "This draft is not queued. Approve it first")
		return
	}
	if err != nil {
		writeError(w, 503, "The queued post could not be read")
		return
	}
	if current != version {
		writeError(w, 409, "This draft changed. Refresh before editing")
		return
	}
	if status != "scheduled" || providerID == "" {
		writeError(w, 409, "Submission is pending or uncertain. Check PostyBirb before editing")
		return
	}
	if oldDue.Before(time.Now().Add(editCutoff)) {
		writeError(w, 409, "This post publishes within 30 minutes. Change it in PostyBirb")
		return
	}
	media := oldMedia
	if upload != nil {
		media = upload
	}
	replace := caption != oldCaption || account != oldAccount || !bytes.Equal(media, oldMedia)
	if !replace && due.Equal(oldDue.UTC().Truncate(time.Second)) {
		writeJSON(w, 200, map[string]any{"status": "scheduled", "post_id": providerID, "version": current, "changed": false})
		return
	}
	if replace {
		accounts, e := h.SocialPosting.Accounts(r.Context())
		if e != nil {
			writeError(w, 502, "PostyBirb accounts could not be checked")
			return
		}
		available := false
		for _, a := range accounts {
			available = available || (a.ID == account && !a.Disabled && (a.Identifier == "instagram" || a.Identifier == "instagram-standalone"))
		}
		if !available {
			writeError(w, 409, "This Instagram account is unavailable")
			return
		}
	}
	mediaID := ""
	if !bytes.Equal(media, oldMedia) {
		var nonce [24]byte
		if _, err = rand.Read(nonce[:]); err != nil {
			writeError(w, 500, "The change could not be prepared")
			return
		}
		mediaID = hex.EncodeToString(nonce[:])
	}
	// Claim the receipt only if it still holds exactly what this edit read:
	// another tab's edit or a concurrent approval gets a conflict instead.
	tag, err := h.DB.Exec(r.Context(), `UPDATE social_schedules SET status='submitting' WHERE request_id=$1 AND status='scheduled' AND provider_post_id=$2 AND payload_hash=$3`, requestID, providerID, oldHash)
	if err != nil || tag.RowsAffected() != 1 {
		writeError(w, 409, "This post changed or is being changed. Refresh before editing")
		return
	}
	// From here on, finish the sequence even if the browser disconnects.
	ctx, cancel := context.WithTimeout(context.WithoutCancel(r.Context()), editTimeout)
	defer cancel()
	setStatus := func(value string) {
		h.DB.Exec(ctx, `UPDATE social_schedules SET status=$2 WHERE request_id=$1`, requestID, value)
	}
	if !replace {
		err = h.SocialPosting.RescheduleInstagram(ctx, providerID, oldAccount, oldCaption, due)
		if errors.Is(err, postybirb.ErrNotQueued) {
			setStatus("scheduled")
			writeError(w, 409, "PostyBirb no longer shows this post as queued. Check PostyBirb")
			return
		}
		if err != nil {
			setStatus("uncertain")
			writeError(w, 502, "The new time could not be confirmed. Check PostyBirb before retrying")
			return
		}
	} else {
		// Prepare and validate the replacement while the original stays
		// queued, so a rejected replacement leaves the post as it was.
		var replacement string
		replacement, err = h.SocialPosting.CreateInstagram(ctx, account, caption, media)
		if err == nil {
			err = h.SocialPosting.ValidateInstagram(ctx, replacement, account, caption)
		}
		if err != nil {
			if replacement != "" {
				h.SocialPosting.DiscardDraft(ctx, replacement)
			}
			setStatus("scheduled")
			writeError(w, 502, "PostyBirb did not accept the edited post. The queued post is unchanged")
			return
		}
		_, err = h.SocialPosting.WithdrawInstagram(ctx, providerID, oldAccount, oldCaption)
		if errors.Is(err, postybirb.ErrNotQueued) {
			h.SocialPosting.DiscardDraft(ctx, replacement)
			setStatus("scheduled")
			writeError(w, 409, "PostyBirb no longer shows this post as queued. Check PostyBirb")
			return
		}
		if err != nil {
			setStatus("uncertain")
			writeError(w, 502, "The queued post could not be withdrawn. Check PostyBirb before retrying")
			return
		}
		// The old submission can no longer post; the receipt now follows the replacement.
		providerID = replacement
		if _, err = h.DB.Exec(ctx, `UPDATE social_schedules SET provider_post_id=$2 WHERE request_id=$1`, requestID, providerID); err != nil {
			writeError(w, 502, "The old post was withdrawn, but the receipt could not be updated. Check PostyBirb before retrying")
			return
		}
		if err = h.SocialPosting.QueueInstagram(ctx, providerID, account, caption, due); err != nil {
			setStatus("uncertain")
			writeError(w, 502, "The old post was withdrawn, but the replacement could not be confirmed. Check PostyBirb before retrying")
			return
		}
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	tx, err := h.DB.Begin(ctx)
	if err == nil {
		defer tx.Rollback(ctx)
		_, err = tx.Exec(ctx, `UPDATE social_schedules SET status='scheduled',account_id=$2,caption=$3,due_at=$4,media=$5,payload_hash=$6,media_id=COALESCE(NULLIF($7,''),media_id) WHERE request_id=$1`, requestID, account, caption, due, media, schedulePayloadHash(account, caption, due, media), mediaID)
	}
	if err == nil {
		_, err = tx.Exec(ctx, `UPDATE social_review_drafts SET version=version+1,account_id=$2,caption=$3,due_at=$4,media=$5,updated_by=$6,updated_at=NOW() WHERE draft_id=$1 AND version=$7`, id, account, caption, due, media, user, current)
	}
	if err != nil || tx.Commit(ctx) != nil {
		writeError(w, 502, "PostyBirb accepted the change, but the local receipt could not be saved. Check PostyBirb before retrying")
		return
	}
	writeJSON(w, 200, map[string]any{"status": "scheduled", "post_id": providerID, "version": current + 1, "changed": true, "replaced": replace})
}
