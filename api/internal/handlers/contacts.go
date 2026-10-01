package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/brevo"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

// SubmitContact stores a contact form submission (public).
func (h *Handler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	var req models.CreateContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" || req.Email == "" || req.Message == "" {
		writeError(w, http.StatusBadRequest, "name, email, and message are required")
		return
	}

	var c models.Contact
	err := h.DB.QueryRow(r.Context(),
		`INSERT INTO contacts (name, email, subject, message)
		 VALUES ($1,$2,$3,$4)
		 RETURNING id, name, email, subject, message, read, created_at`,
		req.Name, req.Email, req.Subject, req.Message,
	).Scan(&c.ID, &c.Name, &c.Email, &c.Subject, &c.Message, &c.Read, &c.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save contact submission")
		return
	}

	h.notifyContact(c)

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "signal received",
		"id":      c.ID,
	})
}

// ListContacts returns all contact submissions (admin only).
func (h *Handler) ListContacts(w http.ResponseWriter, r *http.Request) {
	page, perPage, offset := pagination(r)

	var total int64
	if err := h.DB.QueryRow(r.Context(), `SELECT COUNT(*) FROM contacts`).Scan(&total); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to count contacts")
		return
	}

	rows, err := h.DB.Query(r.Context(),
		`SELECT id, name, email, subject, message, read, created_at
		 FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2`, perPage, offset,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to query contacts")
		return
	}
	defer rows.Close()

	var contacts []models.Contact
	for rows.Next() {
		var c models.Contact
		if err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Subject, &c.Message, &c.Read, &c.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan contact")
			return
		}
		contacts = append(contacts, c)
	}

	if contacts == nil {
		contacts = []models.Contact{}
	}

	writeJSON(w, http.StatusOK, models.PaginatedResponse[models.Contact]{
		Data:       contacts,
		Total:      total,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages(total, perPage),
	})
}

// MarkContactRead toggles the read state of a contact (admin only).
func (h *Handler) MarkContactRead(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var c models.Contact
	err := h.DB.QueryRow(r.Context(),
		`UPDATE contacts SET read = NOT read WHERE id = $1
		 RETURNING id, name, email, subject, message, read, created_at`, id,
	).Scan(&c.ID, &c.Name, &c.Email, &c.Subject, &c.Message, &c.Read, &c.CreatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, "contact not found")
		return
	}

	writeJSON(w, http.StatusOK, c)
}

// DeleteContact deletes a contact submission (admin only).
func (h *Handler) DeleteContact(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	tag, err := h.DB.Exec(r.Context(), `DELETE FROM contacts WHERE id = $1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "contact not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// notifyContact emails a saved submission to the studio inbox. The message
// is already stored, so a delivery failure is logged and never returned.
func (h *Handler) notifyContact(c models.Contact) {
	if h.Mail == nil {
		return
	}
	subject := "Website message"
	if c.Subject != nil && *c.Subject != "" {
		subject = *c.Subject
	}
	email := brevo.Email{
		Sender:  h.MailCfg.From,
		To:      []brevo.Address{h.MailCfg.ContactTo},
		ReplyTo: &brevo.Address{Name: c.Name, Email: c.Email},
		Subject: "[subcult.tv] " + subject,
		TextContent: fmt.Sprintf(
			"From: %s <%s>\nReceived: %s\n\n%s\n\nReply to this email to answer %s directly.",
			c.Name, c.Email, c.CreatedAt.UTC().Format(time.RFC1123), c.Message, c.Name,
		),
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()
		if err := h.Mail.SendEmail(ctx, email); err != nil {
			slog.Error("contact notification failed", "contact_id", c.ID, "error", err)
		}
	}()
}
