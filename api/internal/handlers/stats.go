package handlers

import (
	"net/http"
	"time"
)

// PublicStats exposes count-only metrics for the transparency page.
// Deliberately free of any PII — only aggregate counts are returned.
type PublicStats struct {
	Projects    int64     `json:"projects"`
	Posts       int64     `json:"posts"`
	Subscribers int64     `json:"subscribers"`
	LastUpdated time.Time `json:"last_updated"`
}

// Stats returns count-based transparency metrics. Public, no auth.
func (h *Handler) Stats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var projects, posts, subscribers int64
	if err := h.DB.QueryRow(ctx, `SELECT count(*) FROM projects`).Scan(&projects); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load public stats")
		return
	}
	if err := h.DB.QueryRow(ctx, `SELECT count(*) FROM posts`).Scan(&posts); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load public stats")
		return
	}
	// Only confirmed, currently subscribed addresses are counted.
	if err := h.DB.QueryRow(ctx, `SELECT count(*) FROM subscribers WHERE confirmed = true AND unsubscribed_at IS NULL`).Scan(&subscribers); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load public stats")
		return
	}

	writeJSON(w, http.StatusOK, PublicStats{
		Projects:    projects,
		Posts:       posts,
		Subscribers: subscribers,
		LastUpdated: time.Now().UTC(),
	})
}
