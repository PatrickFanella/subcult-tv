package handlers

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
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
type postingImage struct {
	SHA256 string `json:"sha256"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Bytes  int    `json:"bytes"`
}
type postingMedia struct {
	Mode       string         `json:"mode"`
	AssetIDs   []string       `json:"asset_ids"`
	AltText    string         `json:"alt_text"`
	Brief      string         `json:"brief"`
	Kind       string         `json:"kind,omitempty"`
	Headline   string         `json:"headline,omitempty"`
	Image      *postingImage  `json:"image,omitempty"`
	Candidates []postingImage `json:"candidates,omitempty"`
}
type postingCraft struct {
	Angle        string         `json:"angle"`
	Reader       string         `json:"reader"`
	Reason       string         `json:"reason"`
	Pattern      string         `json:"pattern"`
	Predicted    string         `json:"predicted"`
	Scores       map[string]int `json:"scores"`
	Alternatives []string       `json:"alternatives"`
}
type postingDraft struct {
	ID         string        `json:"id"`
	RunID      string        `json:"run_id"`
	Mode       string        `json:"mode"`
	Platform   string        `json:"platform"`
	Week       string        `json:"week"`
	Account    string        `json:"account"`
	Text       string        `json:"text"`
	Replies    []string      `json:"replies,omitempty"`
	DueAt      string        `json:"due_at"`
	ExpiresAt  string        `json:"expires_at"`
	Evidence   string        `json:"evidence"`
	NextCheck  string        `json:"next_check"`
	Approval   string        `json:"approval"`
	Media      postingMedia  `json:"media"`
	Craft      *postingCraft `json:"craft,omitempty"`
	Checklist  []string      `json:"checklist,omitempty"`
	Sources    []string      `json:"sources,omitempty"`
	Supersedes string        `json:"supersedes,omitempty"`
}

// draftPlatform derives the platform for snapshots written before the field existed.
func draftPlatform(d postingDraft) string {
	switch d.Platform {
	case "instagram", "x", "bluesky":
		return d.Platform
	}
	if d.Mode == "changemaker" {
		return "instagram"
	}
	return "x"
}

// validImage keeps only references the private media route could serve.
func validImage(i postingImage) bool {
	return studioID.MatchString(i.SHA256) && i.Bytes >= 0 && i.Bytes <= 900<<10
}

// expired reports whether a draft can no longer be approved. Drafts without an
// explicit expiry expire once their proposed time has passed.
func (d postingDraft) expired(now time.Time) bool {
	value := d.ExpiresAt
	if value == "" {
		value = d.DueAt
	}
	if value == "" {
		return false
	}
	at, err := time.Parse(time.RFC3339, value)
	return err != nil || !at.After(now)
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
		d := &data.Drafts[i]
		d.Approval = "unapproved"
		d.Platform = draftPlatform(*d)
		if d.Media.Image != nil && !validImage(*d.Media.Image) {
			d.Media.Image = nil
		}
		candidates := d.Media.Candidates[:0]
		for _, c := range d.Media.Candidates {
			if validImage(c) {
				candidates = append(candidates, c)
			}
		}
		d.Media.Candidates = candidates
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

// PostingPreparedMedia serves one prepared review JPEG by SHA-256 to the owner.
// The path is derived from the hash alone, the hash must be referenced by a
// current Instagram draft, and the bytes must still match it. Never public.
func (h *Handler) PostingPreparedMedia(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	id := chi.URLParam(r, "sha256")
	if !studioID.MatchString(id) {
		http.NotFound(w, r)
		return
	}
	data, err := h.loadPosting()
	if err != nil {
		writeError(w, 503, err.Error())
		return
	}
	referenced := false
	now := time.Now()
	for _, d := range data.Drafts {
		if d.Platform != "instagram" || d.expired(now) {
			continue
		}
		if d.Media.Image != nil && d.Media.Image.SHA256 == id {
			referenced = true
		}
		for _, c := range d.Media.Candidates {
			if c.SHA256 == id {
				referenced = true
			}
		}
	}
	if !referenced {
		http.NotFound(w, r)
		return
	}
	root, err := os.OpenRoot(h.StudioRoot)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer root.Close()
	name := "posting-media/" + id + ".jpg"
	info, err := root.Lstat(name)
	if err != nil || !info.Mode().IsRegular() || info.Size() > 900<<10 {
		http.NotFound(w, r)
		return
	}
	file, err := root.Open(name)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()
	media, err := io.ReadAll(io.LimitReader(file, (900<<10)+1))
	sum := sha256.Sum256(media)
	if err != nil || len(media) > 900<<10 || hex.EncodeToString(sum[:]) != id || !bytes.HasPrefix(media, []byte{0xff, 0xd8, 0xff}) {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "image/jpeg")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	http.ServeContent(w, r, "prepared.jpg", time.Time{}, bytes.NewReader(media))
}
