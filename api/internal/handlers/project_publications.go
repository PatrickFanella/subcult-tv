package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

func publicProjectURL(value *string) bool {
	if value == nil || *value == "" {
		return true
	}
	parsed, err := url.Parse(*value)
	return err == nil && parsed.Scheme == "https" && parsed.Hostname() != "" && parsed.User == nil
}

// PublishedProjects returns only explicitly reviewed, immutable project snapshots.
func (h *Handler) PublishedProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	rows, err := h.DB.Query(r.Context(), `SELECT snapshot FROM project_publications WHERE ($1='' OR snapshot->>'status'=$1) AND ($2='' OR (snapshot->'type') ? $2) ORDER BY slug`, r.URL.Query().Get("status"), r.URL.Query().Get("type"))
	if err != nil {
		writeError(w, 500, "could not load published projects")
		return
	}
	defer rows.Close()
	snapshots := []json.RawMessage{}
	for rows.Next() {
		var snapshot json.RawMessage
		if rows.Scan(&snapshot) != nil {
			writeError(w, 500, "could not read published projects")
			return
		}
		snapshots = append(snapshots, snapshot)
	}
	if rows.Err() != nil {
		writeError(w, 500, "could not read published projects")
		return
	}
	writeJSON(w, 200, snapshots)
}

// PublishedProject never reads the editable registry through a public route.
func (h *Handler) PublishedProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	var snapshot json.RawMessage
	if h.DB.QueryRow(r.Context(), `SELECT snapshot FROM project_publications WHERE slug=$1`, chi.URLParam(r, "slug")).Scan(&snapshot) != nil {
		writeError(w, 404, "published project not found")
		return
	}
	writeJSON(w, 200, snapshot)
}

// ApproveProject copies the exact saved version under a row lock. Subsequent edits remain drafts.
func (h *Handler) ApproveProject(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "admin approval required")
		return
	}
	var req struct {
		UpdatedAt time.Time `json:"updated_at"`
		Approved  bool      `json:"approved"`
	}
	if json.NewDecoder(r.Body).Decode(&req) != nil || !req.Approved || req.UpdatedAt.IsZero() {
		writeError(w, 400, "approve the reviewed saved version")
		return
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 500, "could not start approval")
		return
	}
	defer tx.Rollback(r.Context())
	row := tx.QueryRow(r.Context(), `SELECT id,slug,name,description,long_description,why_it_exists,type,status,stack,topics,repo_url,homepage,cover_pattern,cover_color,featured,sort_order,stars,last_updated,created_at,updated_at FROM projects WHERE id=$1 FOR UPDATE`, chi.URLParam(r, "id"))
	project, err := scanProject(row)
	if err != nil {
		writeError(w, 404, "project not found")
		return
	}
	if !project.UpdatedAt.Equal(req.UpdatedAt) {
		writeError(w, 409, "project changed; reload and review the saved version")
		return
	}
	if project.Status != "active" && project.Status != "incubating" && project.Status != "archived" {
		writeError(w, 400, "choose a supported project status before approval")
		return
	}
	if strings.TrimSpace(project.Name) == "" || !publicProjectURL(project.Homepage) || !publicProjectURL(project.RepoURL) {
		writeError(w, 400, "public project links must use HTTPS and a name is required")
		return
	}
	snapshot, err := json.Marshal(project)
	if err != nil {
		writeError(w, 500, "could not prepare snapshot")
		return
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	_, err = tx.Exec(r.Context(), `INSERT INTO project_publications(project_id,slug,snapshot,approved_by) VALUES($1,$2,$3,$4) ON CONFLICT(project_id) DO UPDATE SET slug=EXCLUDED.slug,snapshot=EXCLUDED.snapshot,approved_by=EXCLUDED.approved_by,approved_at=NOW()`, project.ID, project.Slug, snapshot, user)
	if err != nil || tx.Commit(r.Context()) != nil {
		writeError(w, 500, "could not publish project")
		return
	}
	writeJSON(w, 200, map[string]string{"status": "published"})
}

func (h *Handler) UnpublishProject(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "admin approval required")
		return
	}
	if _, err := h.DB.Exec(r.Context(), `DELETE FROM project_publications WHERE project_id=$1`, chi.URLParam(r, "id")); err != nil {
		writeError(w, 500, "could not remove published update")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
