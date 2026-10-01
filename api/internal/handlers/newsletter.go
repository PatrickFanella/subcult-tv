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
		writeError(w, http.StatusBadRequest, "a valid email is required")
		return
	}

	doubleOptIn := h.Mail != nil && h.Mail.NewsletterEnabled()
	if doubleOptIn {
		ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
		defer cancel()
		if err := h.Mail.RequestDoubleOptIn(ctx, email); err != nil {
			slog.Error("newsletter confirmation email failed", "error", err)
			writeError(w, http.StatusBadGateway, "could not send the confirmation email, please try again")
			return
		}
	}

	_, err := h.DB.Exec(r.Context(),
		`INSERT INTO subscribers (email, unsubscribe_token, confirmed)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL`,
		email, uuid.New().String(), !doubleOptIn,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to subscribe")
		return
	}

	message := "Subscribed. You'll get product updates by email."
	if doubleOptIn {
		message = "Check your inbox and confirm your subscription."
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
		`UPDATE subscribers SET unsubscribed_at = NOW()
		 WHERE unsubscribe_token = $1 AND unsubscribed_at IS NULL
		 RETURNING email`,
		req.Token,
	).Scan(&email)
	if err != nil {
		writeError(w, http.StatusNotFound, "invalid token or already unsubscribed")
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
		"message": "Unsubscribed. You won't get more product updates.",
	})
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
