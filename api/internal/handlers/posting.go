package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type postingRun struct {
	Mode       string `json:"mode"`
	Status     string `json:"status"`
	Week       string `json:"week"`
	RunID      string `json:"run_id"`
	DraftCount int    `json:"draft_count"`
	CheckedAt  string `json:"checked_at"`
	ObservedAt string `json:"observed_at"`
}
type postingMedia struct {
	Mode     string   `json:"mode"`
	AssetIDs []string `json:"asset_ids"`
	AltText  string   `json:"alt_text"`
	Brief    string   `json:"brief"`
}
type postingDraft struct {
	ID        string       `json:"id"`
	RunID     string       `json:"run_id"`
	Mode      string       `json:"mode"`
	Week      string       `json:"week"`
	Account   string       `json:"account"`
	Text      string       `json:"text"`
	DueAt     string       `json:"due_at"`
	ExpiresAt string       `json:"expires_at"`
	Evidence  string       `json:"evidence"`
	NextCheck string       `json:"next_check"`
	Approval  string       `json:"approval"`
	Media     postingMedia `json:"media"`
}
type postingDashboard struct {
	Version           int    `json:"version"`
	Connected         bool   `json:"connected"`
	GeneratedAt       string `json:"generated_at"`
	Stale             bool   `json:"stale"`
	PublishingEnabled bool   `json:"publishing_enabled"`
	Timezone          string `json:"timezone"`
	FirstWeek         string `json:"first_week"`
	Schedules         []struct {
		Mode     string   `json:"mode"`
		Calendar []string `json:"calendar"`
	} `json:"schedules"`
	Accounts []struct {
		Account   string   `json:"account"`
		Times     []string `json:"times"`
		WeeklyCap int      `json:"weekly_cap"`
	} `json:"accounts"`
	Runs   []postingRun   `json:"runs"`
	Drafts []postingDraft `json:"drafts"`
	Checks []struct {
		RunID string `json:"run_id"`
		Text  string `json:"text"`
	} `json:"checks"`
}

// PostingDashboard serves the explicit private export, never raw runtime files.
func (h *Handler) loadPosting() (postingDashboard, error) {
	var data postingDashboard
	root, err := os.OpenRoot(h.StudioRoot)
	if err != nil {
		return data, fmt.Errorf("Posting dashboard is not connected")
	}
	defer root.Close()
	file, err := root.Open("posting.json")
	if err != nil {
		return data, fmt.Errorf("Posting dashboard snapshot is unavailable")
	}
	defer file.Close()
	if json.NewDecoder(io.LimitReader(file, 2<<20)).Decode(&data) != nil {
		return data, fmt.Errorf("Posting dashboard snapshot is invalid")
	}
	observed, err := time.Parse(time.RFC3339, data.GeneratedAt)
	if err != nil {
		return data, fmt.Errorf("Posting dashboard snapshot has no valid observation time")
	}
	data.Stale = time.Since(observed) > 24*time.Hour
	// Preparation sources contain no approval or delivery evidence.
	data.PublishingEnabled = false
	for i := range data.Drafts {
		data.Drafts[i].Approval = "unapproved"
	}
	return data, nil
}

func (h *Handler) PostingDashboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	data, err := h.loadPosting()
	if err != nil {
		writeError(w, 503, err.Error())
		return
	}
	writeJSON(w, 200, data)
}
