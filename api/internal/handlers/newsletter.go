package handlers

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

// Subscribe records a newsletter sign-up (public). When Brevo double
// opt-in is configured, Brevo emails a confirmation link and adds the
// address to the list only after it is clicked; the local row stays
// unconfirmed. Without Brevo, sign-ups are stored locally as before.
func (h *Handler) Subscribe(w http.ResponseWriter, r *http.Request) {
	var req models.SubscribeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	email, ok := normalizeEmail(req.Email)
	if !ok {
		writeError(w, http.StatusBadRequest, "Enter a valid email address.")
		return
	}

	doubleOptIn := h.Mail != nil && h.Mail.NewsletterEnabled()
	if doubleOptIn {
		ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
		defer cancel()
		if err := h.Mail.RequestDoubleOptIn(ctx, email); err != nil {
			slog.Error("newsletter confirmation email failed", "error", err)
			writeError(w, http.StatusBadGateway, "We could not send the confirmation email. Try again in a few minutes.")
			return
		}
	}

	_, err := h.DB.Exec(r.Context(),
		`INSERT INTO subscribers (email, unsubscribe_token, confirmed)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (email) DO UPDATE SET
       confirmed = CASE WHEN subscribers.unsubscribed_at IS NOT NULL THEN EXCLUDED.confirmed ELSE subscribers.confirmed END,
       subscribed_at = CASE WHEN subscribers.unsubscribed_at IS NOT NULL THEN NOW() ELSE subscribers.subscribed_at END,
       unsubscribed_at = NULL`,
		email, uuid.New().String(), !doubleOptIn,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "We could not save your subscription. Try again in a few minutes.")
		return
	}

	message := "Subscribed. The newsletter goes out once a month."
	if doubleOptIn {
		message = "Check your inbox for a confirmation link. You are not subscribed until you click it."
	}
	writeJSON(w, http.StatusCreated, map[string]string{"message": message})
}

// Unsubscribe removes an email from the newsletter using a token (public).
func (h *Handler) Unsubscribe(w http.ResponseWriter, r *http.Request) {
	var req models.UnsubscribeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Token == "" {
		writeError(w, http.StatusBadRequest, "unsubscribe token is required")
		return
	}

	var email string
	err := h.DB.QueryRow(r.Context(),
		`UPDATE subscribers SET confirmed = FALSE, unsubscribed_at = NOW(), provider_event_at = NOW()
		 WHERE unsubscribe_token = $1 AND unsubscribed_at IS NULL
		 RETURNING email`,
		req.Token,
	).Scan(&email)
	if err != nil {
		writeError(w, http.StatusNotFound, "This unsubscribe link is invalid or was already used.")
		return
	}

	if h.Mail != nil && h.Mail.NewsletterEnabled() {
		ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
		defer cancel()
		if err := h.Mail.RemoveFromNewsletter(ctx, email); err != nil {
			slog.Error("newsletter list removal failed", "error", err)
		}
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Unsubscribed. We will not send you the newsletter again.",
	})
}

// SyncSubscribers marks local sign-ups confirmed when Brevo lists them on the
// newsletter list (admin only). It covers confirmations whose webhook never
// arrived. It never unconfirms anyone; unsubscribes still come from the
// unsubscribe link or the webhook.
func (h *Handler) SyncSubscribers(w http.ResponseWriter, r *http.Request) {
	if h.Mail == nil || !h.Mail.NewsletterEnabled() {
		writeError(w, http.StatusServiceUnavailable, "Brevo double opt-in is not configured")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()
	members, err := h.Mail.NewsletterMembers(ctx)
	if err != nil {
		slog.Error("newsletter member sync failed", "error", err)
		writeError(w, http.StatusBadGateway, "Brevo did not return the newsletter list. Try again shortly.")
		return
	}
	tag, err := h.DB.Exec(r.Context(),
		`UPDATE subscribers SET confirmed = TRUE
		 WHERE email = ANY($1) AND unsubscribed_at IS NULL AND NOT confirmed`, members)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update subscribers")
		return
	}
	writeJSON(w, http.StatusOK, map[string]int64{"confirmed": tag.RowsAffected(), "brevo_members": int64(len(members))})
}

// normalizeEmail trims and lowercases an address and checks its syntax.
func normalizeEmail(raw string) (string, bool) {
	addr, err := mail.ParseAddress(strings.TrimSpace(raw))
	if err != nil || addr.Name != "" {
		return "", false
	}
	return strings.ToLower(addr.Address), true
}

// ListSubscribers returns all active subscribers (admin only).
func (h *Handler) ListSubscribers(w http.ResponseWriter, r *http.Request) {
	page, perPage, offset := pagination(r)

	var total int64
	if err := h.DB.QueryRow(r.Context(),
		`SELECT COUNT(*) FROM subscribers WHERE unsubscribed_at IS NULL`,
	).Scan(&total); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to count subscribers")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, email, confirmed, subscribed_at, unsubscribed_at
		 FROM subscribers WHERE unsubscribed_at IS NULL
		 ORDER BY subscribed_at DESC LIMIT $1 OFFSET $2`, perPage, offset,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to query subscribers")
		return
	}
	defer rows.Close()

	var subs []models.Subscriber
	for rows.Next() {
		var s models.Subscriber
		if err := rows.Scan(&s.ID, &s.Email, &s.Confirmed, &s.SubscribedAt, &s.UnsubscribedAt); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan subscriber")
			return
		}
		subs = append(subs, s)
	}

	if subs == nil {
		subs = []models.Subscriber{}
	}

	writeJSON(w, http.StatusOK, models.PaginatedResponse[models.Subscriber]{
		Data:       subs,
		Total:      total,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages(total, perPage),
	})
}
