package handlers

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"net/http"
	"slices"
	"time"
)

type newsletterEvent struct {
	Event          string  `json:"event"`
	Email          string  `json:"email"`
	ListIDs        []int64 `json:"list_id"`
	Timestamp      int64   `json:"ts"`
	EventTimestamp int64   `json:"ts_event"`
}

// BrevoNewsletterWebhook accepts only authenticated events for our DOI list.
// Provider payloads and email addresses are never logged or retained as receipts.
func (h *Handler) BrevoNewsletterWebhook(w http.ResponseWriter, r *http.Request) {
	if len(h.BrevoWebhookSecret) < 32 || h.BrevoNewsletterListID <= 0 {
		writeError(w, 404, "not found")
		return
	}
	expected := sha256.Sum256([]byte(h.BrevoWebhookSecret))
	supplied := sha256.Sum256([]byte(r.Header.Get("X-Brevo-Webhook-Secret")))
	if subtle.ConstantTimeCompare(expected[:], supplied[:]) != 1 {
		writeError(w, 401, "unauthorized")
		return
	}
	var event newsletterEvent
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	if json.NewDecoder(r.Body).Decode(&event) != nil {
		writeError(w, 400, "invalid event")
		return
	}
	if !slices.Contains(event.ListIDs, h.BrevoNewsletterListID) {
		w.WriteHeader(204)
		return
	}
	confirm := event.Event == "list_addition"
	unsubscribe := event.Event == "unsubscribe"
	if !confirm && !unsubscribe {
		w.WriteHeader(204)
		return
	}
	email, ok := normalizeEmail(event.Email)
	timestamp := event.EventTimestamp
	if timestamp == 0 {
		timestamp = event.Timestamp
	}
	at := time.Unix(timestamp, 0).UTC()
	if !ok || timestamp <= 0 || at.After(time.Now().Add(5*time.Minute)) {
		writeError(w, 400, "invalid event")
		return
	}
	var err error
	if confirm {
		_, err = h.DB.Exec(r.Context(), `UPDATE subscribers SET confirmed=TRUE, unsubscribed_at=NULL, provider_event_at=$2
   WHERE email=$1 AND $2>=date_trunc('second',subscribed_at)
   AND (provider_event_at IS NULL OR provider_event_at<$2 OR (provider_event_at=$2 AND confirmed))
   AND (unsubscribed_at IS NULL OR $2>date_trunc('second',unsubscribed_at))`, email, at)
	} else {
		_, err = h.DB.Exec(r.Context(), `UPDATE subscribers SET confirmed=FALSE, unsubscribed_at=GREATEST(COALESCE(unsubscribed_at,$2),$2), provider_event_at=$2
   WHERE email=$1 AND $2>=date_trunc('second',subscribed_at)
   AND (provider_event_at IS NULL OR provider_event_at<=$2)`, email, at)
	}
	if err != nil {
		writeError(w, 503, "could not apply event")
		return
	}
	w.WriteHeader(204)
}
