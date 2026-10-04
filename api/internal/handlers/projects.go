package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

// scanner is implemented by both *pgx.Row and *pgx.Rows.
type scanner interface {
	Scan(dest ...interface{}) error
}

// scanProject scans a full project row into a models.Project.
func scanProject(s scanner) (models.Project, error) {
	var p models.Project
	err := s.Scan(
		&p.ID, &p.Slug, &p.Name, &p.Description, &p.LongDescription, &p.WhyItExists,
		&p.Type, &p.Status, &p.Stack, &p.Topics, &p.RepoURL, &p.Homepage,
		&p.CoverPattern, &p.CoverColor, &p.Featured, &p.SortOrder, &p.Stars, &p.LastUpdated,
		&p.CreatedAt, &p.UpdatedAt,
	)
	return p, err
}

// ListProjects returns the editable authenticated registry, sorted by sort_order and name.
func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {
	statusFilter := r.URL.Query().Get("status")
	typeFilter := r.URL.Query().Get("type")

	query := `SELECT id, slug, name, description, long_description, why_it_exists,
	           type, status, stack, topics, repo_url, homepage,
	           cover_pattern, cover_color, featured, sort_order, stars, last_updated,
	           created_at, updated_at
	          FROM projects WHERE 1=1`
	var args []interface{}
	argN := 1

	if statusFilter != "" {
		query += ` AND status = $` + strconv.Itoa(argN)
		args = append(args, statusFilter)
		argN++
	}
	if typeFilter != "" {
		query += ` AND $` + strconv.Itoa(argN) + ` = ANY(type)`
		args = append(args, typeFilter)
		argN++
	}
	_ = argN // suppress unused

	query += ` ORDER BY sort_order ASC, name ASC`

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to query projects")
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		p, err := scanProject(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan project")
			return
		}
		projects = append(projects, p)
	}

	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to read projects")
		return
	}
	if projects == nil {
		projects = []models.Project{}
	}
	writeJSON(w, http.StatusOK, projects)
}

// GetProject returns a single project by slug.
func (h *Handler) GetProject(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var p models.Project
	row := h.DB.QueryRow(r.Context(),
		`SELECT id, slug, name, description, long_description, why_it_exists,
		 type, status, stack, topics, repo_url, homepage,
		 cover_pattern, cover_color, featured, sort_order, stars, last_updated,
		 created_at, updated_at
		 FROM projects WHERE slug = $1`, slug,
	)
	p, err := scanProject(row)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}

	writeJSON(w, http.StatusOK, p)
}

// CreateProject creates a new project (admin only).
func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var req models.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Slug == "" || req.Name == "" {
		writeError(w, http.StatusBadRequest, "slug and name are required")
		return
	}
	if len(req.Type) == 0 {
		writeError(w, http.StatusBadRequest, "at least one project type is required")
		return
	}
	if req.Stack == nil {
		req.Stack = []string{}
	}
	if req.Topics == nil {
		req.Topics = []string{}
	}

	var p models.Project
	row := h.DB.QueryRow(r.Context(),
		`INSERT INTO projects (slug, name, description, long_description, why_it_exists,
		  type, status, stack, topics, repo_url, homepage,
		  cover_pattern, cover_color, featured, sort_order)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
		 RETURNING id, slug, name, description, long_description, why_it_exists,
		  type, status, stack, topics, repo_url, homepage,
		  cover_pattern, cover_color, featured, sort_order, stars, last_updated,
		  created_at, updated_at`,
		req.Slug, req.Name, req.Description, req.LongDescription, req.WhyItExists,
		req.Type, req.Status, req.Stack, req.Topics, req.RepoURL, req.Homepage,
		req.CoverPattern, req.CoverColor, req.Featured, req.SortOrder,
	)
	p, err := scanProject(row)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create project: "+err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, p)
}

// UpdateProject updates an existing project (admin only).
func (h *Handler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req models.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Type) == 0 {
		writeError(w, http.StatusBadRequest, "at least one project type is required")
		return
	}
	if req.Stack == nil {
		req.Stack = []string{}
	}
	if req.Topics == nil {
		req.Topics = []string{}
	}

	var p models.Project
	row := h.DB.QueryRow(r.Context(),
		`UPDATE projects SET
		  slug=$1, name=$2, description=$3, long_description=$4, why_it_exists=$5,
		  type=$6, status=$7, stack=$8, topics=$9, repo_url=$10, homepage=$11,
		  cover_pattern=$12, cover_color=$13, featured=$14, sort_order=$15, updated_at=NOW()
		 WHERE id=$16
		 RETURNING id, slug, name, description, long_description, why_it_exists,
		  type, status, stack, topics, repo_url, homepage,
		  cover_pattern, cover_color, featured, sort_order, stars, last_updated,
		  created_at, updated_at`,
		req.Slug, req.Name, req.Description, req.LongDescription, req.WhyItExists,
		req.Type, req.Status, req.Stack, req.Topics, req.RepoURL, req.Homepage,
		req.CoverPattern, req.CoverColor, req.Featured, req.SortOrder, id,
	)
	p, err := scanProject(row)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update project: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, p)
}

// DeleteProject deletes a project (admin only).
func (h *Handler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	tag, err := h.DB.Exec(r.Context(), `DELETE FROM projects WHERE id = $1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
