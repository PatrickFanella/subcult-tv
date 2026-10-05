package handlers

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"image/jpeg"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
)

var requestIDPattern = regexp.MustCompile(`^[a-zA-Z0-9-]{16,80}$`)
var mediaIDPattern = regexp.MustCompile(`^[a-f0-9]{48}$`)

func (h *Handler) allowedSocial(id string) bool {
	for _, allowed := range h.SocialAccounts {
		if id == allowed {
			return true
		}
	}
	return false
}
func (h *Handler) socialReady() bool {
	return h.SocialPosting != nil && h.DB != nil && len(h.SocialAccounts) > 0
}

// SocialDelivery is live provider evidence, independent of prepared snapshots.
func (h *Handler) SocialDelivery(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if !h.socialReady() {
		writeError(w, 503, "PostyBirb delivery is not configured")
		return
	}
	accounts, err := h.SocialPosting.Accounts(r.Context())
	if err != nil {
		writeError(w, 502, "PostyBirb accounts are unavailable")
		return
	}
	selected := []postybirb.SocialAccount{}
	for _, a := range accounts {
		if h.allowedSocial(a.ID) && (a.Identifier == "instagram-standalone" || a.Identifier == "instagram") {
			selected = append(selected, a)
		}
	}
	rows, err := h.DB.Query(r.Context(), `SELECT provider_post_id,account_id,caption,due_at,status FROM social_schedules WHERE provider='postybirb' AND due_at BETWEEN now()-INTERVAL '30 days' AND now()+INTERVAL '90 days' ORDER BY due_at`)
	if err != nil {
		writeError(w, 503, "Delivery receipts are unavailable")
		return
	}
	defer rows.Close()
	selectedPosts := []postybirb.SocialPost{}
	for rows.Next() {
		var p postybirb.SocialPost
		var due time.Time
		var status string
		if rows.Scan(&p.ID, &p.Integration.ID, &p.Content, &due, &status) != nil {
			writeError(w, 503, "Delivery receipts are unavailable")
			return
		}
		if !h.allowedSocial(p.Integration.ID) {
			continue
		}
		p.PublishDate = due.UTC().Format(time.RFC3339)
		p.State = "REVIEW"
		for _, a := range selected {
			if a.ID == p.Integration.ID {
				p.Integration.Name = a.Name
			}
		}
		if p.ID != "" {
			state, link, e := h.SocialPosting.SocialStatus(r.Context(), p.ID, p.Integration.ID)
			if e != nil {
				writeError(w, 502, "PostyBirb delivery status is unavailable")
				return
			}
			p.State, p.ReleaseURL = state, link
		}
		if status != "scheduled" {
			p.State = "REVIEW"
		}
		selectedPosts = append(selectedPosts, p)
	}
	if rows.Err() != nil {
		writeError(w, 503, "Delivery receipts are unavailable")
		return
	}
	writeJSON(w, 200, map[string]any{"accounts": selected, "posts": selectedPosts, "checked_at": time.Now().UTC().Format(time.RFC3339), "approval_mode": "manual", "minimum_lead_hours": 24})
}

// ApproveSchedule records approval before attempting one provider submission.
// A timeout never triggers an automatic second submission.
func (h *Handler) ApproveSchedule(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin approval is required")
		return
	}
	if !h.socialReady() {
		writeError(w, 503, "PostyBirb scheduling is not configured")
		return
	}
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		writeError(w, 400, "Choose a JPEG under 900 KB")
		return
	}
	defer r.MultipartForm.RemoveAll()
	id, accountID, caption := r.FormValue("request_id"), r.FormValue("account_id"), strings.TrimSpace(r.FormValue("caption"))
	due, err := time.Parse(time.RFC3339, r.FormValue("due_at"))
	if !requestIDPattern.MatchString(id) || !h.allowedSocial(accountID) || caption == "" || utf8.RuneCountInString(caption) > 2200 || r.FormValue("approved") != "true" || err != nil {
		writeError(w, 400, "Review the account, caption, media and time before approving")
		return
	}
	file, _, err := r.FormFile("media")
	if err != nil {
		writeError(w, 400, "Instagram requires a JPEG image")
		return
	}
	defer file.Close()
	media, err := io.ReadAll(io.LimitReader(file, (900<<10)+1))
	if err != nil || len(media) > 900<<10 {
		writeError(w, 400, "Choose a JPEG under 900 KB")
		return
	}
	img, err := jpeg.DecodeConfig(bytes.NewReader(media))
	if err != nil || img.Width < 320 || img.Width > 1440 || img.Height < 1 || float64(img.Width)/float64(img.Height) < 0.8 || float64(img.Width)/float64(img.Height) > 1.91 {
		writeError(w, 400, "Choose a JPEG 320–1440 pixels wide with an aspect ratio between 4:5 and 1.91:1")
		return
	}
	if _, err = jpeg.Decode(bytes.NewReader(media)); err != nil {
		writeError(w, 400, "The JPEG could not be decoded")
		return
	}
	hash := sha256.New()
	for _, part := range []string{accountID, caption, due.UTC().Format(time.RFC3339)} {
		hash.Write([]byte(part))
		hash.Write([]byte{0})
	}
	hash.Write(media)
	digest := hex.EncodeToString(hash.Sum(nil))
	var oldHash, status, providerID string
	err = h.DB.QueryRow(r.Context(), `SELECT payload_hash,status,provider_post_id FROM social_schedules WHERE request_id=$1`, id).Scan(&oldHash, &status, &providerID)
	if err == nil {
		if oldHash != digest {
			writeError(w, 409, "This approval ID belongs to different content")
			return
		}
		if status != "scheduled" {
			writeError(w, 409, "Submission is pending or uncertain. Check PostyBirb before creating another approval")
			return
		}
		writeJSON(w, 200, map[string]string{"status": status, "post_id": providerID})
		return
	}
	if due.Before(time.Now().Add(24*time.Hour)) || due.After(time.Now().AddDate(0, 0, 90)) {
		writeError(w, 400, "Schedule between 24 hours and 90 days ahead")
		return
	}
	accounts, err := h.SocialPosting.Accounts(r.Context())
	if err != nil {
		writeError(w, 502, "PostyBirb accounts could not be checked")
		return
	}
	var target postybirb.SocialAccount
	for _, a := range accounts {
		if a.ID == accountID {
			target = a
		}
	}
	if target.ID == "" || target.Disabled || (target.Identifier != "instagram" && target.Identifier != "instagram-standalone") {
		writeError(w, 409, "This Instagram account is unavailable")
		return
	}
	var nonce [24]byte
	if _, err = rand.Read(nonce[:]); err != nil {
		writeError(w, 500, "Approval could not be recorded")
		return
	}
	mediaID := hex.EncodeToString(nonce[:])
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	tag, err := h.DB.Exec(r.Context(), `INSERT INTO social_schedules(request_id,payload_hash,account_id,caption,due_at,approved_by,media_id,media,status,provider) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'submitting','postybirb') ON CONFLICT DO NOTHING`, id, digest, accountID, caption, due, user, mediaID, media)
	if err != nil {
		writeError(w, 503, "Approval could not be recorded")
		return
	}
	if tag.RowsAffected() != 1 {
		writeError(w, 409, "This approval is already being processed. Refresh delivery status")
		return
	}
	providerID, err = h.SocialPosting.CreateInstagram(r.Context(), target.ID, caption, media)
	// Even a failed configuration call can leave a private draft. Persist that
	// identity before any scheduling mutation so uncertainty is reconcilable.
	if providerID != "" {
		if _, saveErr := h.DB.Exec(r.Context(), `UPDATE social_schedules SET provider_post_id=$2 WHERE request_id=$1`, id, providerID); saveErr != nil {
			writeError(w, 502, "Private PostyBirb draft created, but its receipt could not be saved. Check PostyBirb before retrying")
			return
		}
	}
	if err == nil {
		err = h.SocialPosting.QueueInstagram(r.Context(), providerID, target.ID, caption, due)
	}
	if err != nil {
		h.DB.Exec(r.Context(), `UPDATE social_schedules SET status='uncertain' WHERE request_id=$1`, id)
		writeError(w, 502, "Scheduling could not be confirmed. Check PostyBirb before retrying; this approval will not be submitted twice")
		return
	}
	if _, err = h.DB.Exec(r.Context(), `UPDATE social_schedules SET status='scheduled' WHERE request_id=$1`, id); err != nil {
		writeError(w, 502, "PostyBirb accepted the schedule, but the local receipt could not be saved. Check PostyBirb before retrying")
		return
	}
	writeJSON(w, 201, map[string]string{"status": "scheduled", "post_id": providerID})
}

// PostingMedia exposes only the individual image explicitly approved for posting.
// Private Studio assets and unapproved uploads never enter this table.
func (h *Handler) PostingMedia(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSuffix(chi.URLParam(r, "id"), ".jpg")
	if h.DB == nil || !mediaIDPattern.MatchString(id) {
		http.NotFound(w, r)
		return
	}
	var media []byte
	if h.DB.QueryRow(r.Context(), `SELECT media FROM social_schedules WHERE media_id=$1`, id).Scan(&media) != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	http.ServeContent(w, r, "image.jpg", time.Time{}, bytes.NewReader(media))
}
