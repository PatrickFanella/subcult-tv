package handlers

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
)

type publication struct {
	ID          string          `json:"id"`
	Platform    string          `json:"platform"`
	Title       string          `json:"title"`
	Body        string          `json:"body"`
	Excerpt     string          `json:"excerpt"`
	DueAt       time.Time       `json:"due_at"`
	Audience    string          `json:"audience"`
	Version     int             `json:"version"`
	Status      string          `json:"status"`
	ProviderURL string          `json:"provider_url"`
	Source      json.RawMessage `json:"source"`
}

// reviewPrefix was written into early editions before preparation stripped it.
const reviewPrefix = "Draft for human review."

// stripReviewPrefix removes the leftover reviewer note so it can never publish.
func stripReviewPrefix(body string) string {
	trimmed := strings.TrimLeft(body, " \t\r\n")
	if !strings.HasPrefix(trimmed, reviewPrefix) {
		return body
	}
	return strings.TrimLeft(strings.TrimPrefix(trimmed, reviewPrefix), " \t\r\n")
}

var publicationID = regexp.MustCompile(`^daily-[0-9]{4}-[0-9]{2}-[0-9]{2}-(website|patreon)$`)

func secretAuthorized(r *http.Request, key string) bool {
	return len(key) >= 32 && subtle.ConstantTimeCompare([]byte(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")), []byte(key)) == 1
}

// PublishDevelopmentBacklog applies the owner-configured website policy to pending
// Development entries. Patreon and already approved entries are untouched.
func (h *Handler) PublishDevelopmentBacklog(ctx context.Context) (int64, error) {
	if !h.DevelopmentAutoPublish {
		return 0, nil
	}
	tx, err := h.DB.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)
	count, err := publishDevelopment(ctx, tx, "")
	if err != nil {
		return 0, err
	}
	return count, tx.Commit(ctx)
}

func publishDevelopment(ctx context.Context, tx pgx.Tx, id string) (int64, error) {
	rows, err := tx.Query(ctx, `SELECT v.id,v.post_id,v.body FROM publication_review v JOIN posts p ON p.id=v.post_id WHERE v.platform='website' AND v.status='draft' AND ($1='' OR v.id=$1) AND 'development-log'=ANY(p.tags) ORDER BY v.id FOR UPDATE OF v`, id)
	if err != nil {
		return 0, err
	}
	type entry struct{ id, postID, body string }
	entries := []entry{}
	for rows.Next() {
		var e entry
		if err = rows.Scan(&e.id, &e.postID, &e.body); err != nil {
			rows.Close()
			return 0, err
		}
		entries = append(entries, e)
	}
	rows.Close()
	if err = rows.Err(); err != nil {
		return 0, err
	}
	for _, e := range entries {
		body := stripReviewPrefix(e.body)
		if _, err = tx.Exec(ctx, `UPDATE posts SET content=$2,updated_at=NOW() WHERE id=$1`, e.postID, body); err != nil {
			return 0, err
		}
		if _, err = tx.Exec(ctx, `UPDATE publication_review SET body=$2,status='scheduled',due_at=NOW(),approved_by='automatic:development-updates',approved_at=NOW(),updated_at=NOW() WHERE id=$1`, e.id, body); err != nil {
			return 0, err
		}
	}
	return int64(len(entries)), nil
}

// IngestPublications imports drafts; website publication follows the server policy.
func (h *Handler) IngestPublications(w http.ResponseWriter, r *http.Request) {
	if !secretAuthorized(r, h.PostingPreparationKey) {
		writeError(w, 401, "Preparation authentication required")
		return
	}
	var drafts []publication
	if json.NewDecoder(io.LimitReader(r.Body, 150000)).Decode(&drafts) != nil || len(drafts) != 2 {
		writeError(w, 400, "Expected a website draft and a Patreon draft")
		return
	}
	platforms := map[string]bool{}
	for _, d := range drafts {
		if !publicationID.MatchString(d.ID) || !strings.HasSuffix(d.ID, "-"+d.Platform) || (d.Platform != "website" && d.Platform != "patreon") || platforms[d.Platform] || strings.TrimSpace(d.Title) == "" || len(d.Title) > 300 || strings.TrimSpace(d.Body) == "" || len(d.Body) > 50000 || len(d.Excerpt) > 2000 || !json.Valid(d.Source) || len(d.Source) > 30000 || d.DueAt.Before(time.Now().Add(24*time.Hour)) || d.DueAt.After(time.Now().AddDate(0, 0, 90)) {
			writeError(w, 400, "Invalid publication draft")
			return
		}
		platforms[d.Platform] = true
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Draft import is unavailable")
		return
	}
	defer tx.Rollback(r.Context())
	inserted := int64(0)
	for _, d := range drafts {
		d.Body = stripReviewPrefix(d.Body)
		tag, e := tx.Exec(r.Context(), `INSERT INTO publication_review(id,platform,title,body,excerpt,due_at,source) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING`, d.ID, d.Platform, d.Title, d.Body, d.Excerpt, d.DueAt, d.Source)
		if e != nil {
			writeError(w, 503, "Draft import failed")
			return
		}
		inserted += tag.RowsAffected()
		if d.Platform == "website" && tag.RowsAffected() == 1 {
			var postID string
			slug := strings.TrimSuffix(d.ID, "-website")
			e = tx.QueryRow(r.Context(), `INSERT INTO posts(slug,title,excerpt,content,tags,author,published,date) VALUES($1,$2,$3,$4,ARRAY['development-log'],'SUBCULT',false,$5) RETURNING id`, slug, d.Title, d.Excerpt, d.Body, strings.TrimPrefix(slug, "daily-")).Scan(&postID)
			if e != nil {
				writeError(w, 503, "Website draft import failed")
				return
			}
			if _, e = tx.Exec(r.Context(), `UPDATE publication_review SET post_id=$2 WHERE id=$1`, d.ID, postID); e != nil {
				writeError(w, 503, "Website draft import failed")
				return
			}
			if h.DevelopmentAutoPublish {
				if _, e = publishDevelopment(r.Context(), tx, d.ID); e != nil {
					writeError(w, 503, "Website publication failed")
					return
				}
			}
		}
	}
	if tx.Commit(r.Context()) != nil {
		writeError(w, 503, "Draft import failed")
		return
	}
	websiteApproval := "manual"
	if h.DevelopmentAutoPublish {
		websiteApproval = "automatic"
	}
	writeJSON(w, 200, map[string]any{"created": inserted, "website_approval_mode": websiteApproval, "patreon_approval_mode": "manual", "development_auto_publish": h.DevelopmentAutoPublish})
}

func (h *Handler) Publications(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	w.Header().Set("Cache-Control", "private, no-store")
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	// Receipt checks never start or retry a provider submission.
	if h.PatreonPosting != nil {
		checkCtx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
		defer cancel()
		pending, e := h.DB.Query(r.Context(), `SELECT id,provider_id FROM publication_review WHERE platform='patreon' AND status='submitting' AND provider_id<>'' LIMIT 3`)
		if e == nil {
			type receipt struct{ id, provider string }
			checks := []receipt{}
			for pending.Next() {
				var d receipt
				if pending.Scan(&d.id, &d.provider) == nil {
					checks = append(checks, d)
				}
			}
			pending.Close()
			for _, d := range checks {
				ok, link, e := h.PatreonPosting.Receipt(checkCtx, d.provider)
				if e == nil && ok {
					h.DB.Exec(r.Context(), `UPDATE publication_review SET status='scheduled',provider_url=$2,updated_at=NOW() WHERE id=$1 AND status='submitting'`, d.id, link)
				}
			}
		}
	}
	rows, err := h.DB.Query(r.Context(), `SELECT id,platform,title,body,excerpt,due_at,audience,version,status,provider_url,source FROM publication_review ORDER BY due_at DESC LIMIT 100`)
	if err != nil {
		writeError(w, 503, "Publication drafts are unavailable")
		return
	}
	defer rows.Close()
	result := []publication{}
	for rows.Next() {
		var d publication
		if rows.Scan(&d.ID, &d.Platform, &d.Title, &d.Body, &d.Excerpt, &d.DueAt, &d.Audience, &d.Version, &d.Status, &d.ProviderURL, &d.Source) != nil {
			writeError(w, 503, "Publication drafts are unavailable")
			return
		}
		d.Body = stripReviewPrefix(d.Body)
		if d.Platform == "website" && d.Status == "scheduled" && !d.DueAt.After(time.Now()) {
			d.Status = "published"
		}
		result = append(result, d)
	}
	if rows.Err() != nil {
		writeError(w, 503, "Publication drafts are unavailable")
		return
	}
	audiences, connectionError := h.PatreonPosting.Ready(r.Context(), false)
	reason := ""
	if connectionError != nil {
		reason = connectionError.Error()
	} else if !h.PatreonSchedulingVerified {
		reason = "Patreon native scheduling still needs verification"
	}
	writeJSON(w, 200, map[string]any{"drafts": result, "patreon_connected": connectionError == nil && h.PatreonSchedulingVerified, "patreon_audiences": audiences, "patreon_connection_reason": reason, "minimum_lead_hours": 24, "development_auto_publish": h.DevelopmentAutoPublish})
}

func (h *Handler) SavePublication(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	var d publication
	if json.NewDecoder(io.LimitReader(r.Body, 60000)).Decode(&d) != nil || d.Version < 1 || strings.TrimSpace(d.Title) == "" || len(d.Title) > 300 || strings.TrimSpace(d.Body) == "" || len(d.Body) > 50000 || len(d.Excerpt) > 2000 || d.DueAt.Before(time.Now().Add(24*time.Hour)) || d.DueAt.After(time.Now().AddDate(0, 0, 90)) {
		writeError(w, 400, "Review the title, body and time at least 24 hours ahead")
		return
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Draft could not be saved")
		return
	}
	defer tx.Rollback(r.Context())
	var postID *string
	err = tx.QueryRow(r.Context(), `UPDATE publication_review SET title=$2,body=$3,excerpt=$4,due_at=$5,audience=$6,version=version+1,updated_at=NOW() WHERE id=$1 AND version=$7 AND status='draft' RETURNING post_id`, chi.URLParam(r, "id"), d.Title, d.Body, d.Excerpt, d.DueAt, d.Audience, d.Version).Scan(&postID)
	if err != nil {
		writeError(w, 409, "Draft changed or is already queued. Refresh before editing")
		return
	}
	if postID != nil {
		if _, err = tx.Exec(r.Context(), `UPDATE posts SET title=$2,content=$3,excerpt=$4,updated_at=NOW() WHERE id=$1`, *postID, d.Title, d.Body, d.Excerpt); err != nil {
			writeError(w, 503, "Website draft could not be saved")
			return
		}
	}
	if tx.Commit(r.Context()) != nil {
		writeError(w, 503, "Draft could not be saved")
		return
	}
	writeJSON(w, 200, map[string]int{"version": d.Version + 1})
}

func (h *Handler) ApprovePublication(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin approval required")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	var input struct {
		Version  int  `json:"version"`
		Approved bool `json:"approved"`
	}
	if json.NewDecoder(io.LimitReader(r.Body, 4096)).Decode(&input) != nil || !input.Approved {
		writeError(w, 400, "Explicit approval required")
		return
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Approval could not be recorded")
		return
	}
	defer tx.Rollback(r.Context())
	var version int
	var platform, status, audience, title, body string
	var due time.Time
	var postID *string
	err = tx.QueryRow(r.Context(), `SELECT version,platform,status,audience,due_at,post_id,title,body FROM publication_review WHERE id=$1 FOR UPDATE`, chi.URLParam(r, "id")).Scan(&version, &platform, &status, &audience, &due, &postID, &title, &body)
	if err != nil || version != input.Version {
		writeError(w, 409, "Draft changed. Refresh before approving")
		return
	}
	if status == "uncertain" || status == "submitting" {
		writeError(w, 409, "Check the existing PostyBirb submission before retrying. This approval will not submit twice")
		return
	}
	if status != "draft" {
		writeJSON(w, 200, map[string]string{"status": status})
		return
	}
	if due.Before(time.Now().Add(24*time.Hour)) || due.After(time.Now().AddDate(0, 0, 90)) {
		writeError(w, 400, "Schedule between 24 hours and 90 days ahead")
		return
	}
	// A stale stored edition may still begin with the reviewer note.
	if cleaned := stripReviewPrefix(body); cleaned != body {
		body = cleaned
		if _, err = tx.Exec(r.Context(), `UPDATE publication_review SET body=$2 WHERE id=$1`, chi.URLParam(r, "id"), body); err != nil {
			writeError(w, 503, "Approval could not be recorded")
			return
		}
		if postID != nil {
			if _, err = tx.Exec(r.Context(), `UPDATE posts SET content=$2,updated_at=NOW() WHERE id=$1`, *postID, body); err != nil {
				writeError(w, 503, "Approval could not be recorded")
				return
			}
		}
	}
	var document map[string]any
	if platform == "patreon" {
		if !h.PatreonSchedulingVerified {
			writeError(w, 409, "Connect Patreon and verify native scheduling before approving")
			return
		}
		audiences, e := h.PatreonPosting.Ready(r.Context(), true)
		allowed := false
		for _, a := range audiences {
			if audience != "" && a.Value == audience {
				allowed = true
			}
		}
		if e != nil || !allowed {
			writeError(w, 409, "Verify the Patreon login and choose an available audience before approving")
			return
		}
		doc, e := postybirb.Document(body)
		if e != nil {
			writeError(w, 400, "Patreon supports paragraphs, headings, lists, quotes, emphasis and HTTPS links. Edit unsupported formatting before approving")
			return
		}
		document = doc
	}
	if platform == "website" && postID == nil {
		writeError(w, 409, "The website article is unavailable")
		return
	}
	status = "submitting"
	if platform == "website" {
		status = "scheduled"
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	if _, err = tx.Exec(r.Context(), `UPDATE publication_review SET status=$2,approved_by=$3,approved_at=NOW(),updated_at=NOW() WHERE id=$1`, chi.URLParam(r, "id"), status, user); err != nil || tx.Commit(r.Context()) != nil {
		writeError(w, 503, "Approval could not be recorded")
		return
	}
	if platform == "patreon" {
		// The durable submitting reservation precedes every external write. Any
		// interruption requires human reconciliation; approval cannot submit twice.
		id := chi.URLParam(r, "id")
		providerID, e := h.PatreonPosting.Create(r.Context(), title, document, due, audience)
		if providerID != "" {
			_, saveErr := h.DB.Exec(r.Context(), `UPDATE publication_review SET provider_id=$2,updated_at=NOW() WHERE id=$1`, id, providerID)
			if saveErr != nil {
				e = saveErr
			}
		}
		if e == nil {
			e = h.PatreonPosting.Start(r.Context(), providerID)
		}
		if e != nil {
			h.DB.Exec(r.Context(), `UPDATE publication_review SET status='uncertain',updated_at=NOW() WHERE id=$1`, id)
			writeError(w, 502, "Patreon scheduling could not be confirmed. Check PostyBirb before retrying; this approval will not submit twice")
			return
		}
	}
	writeJSON(w, 200, map[string]string{"status": status})
}
