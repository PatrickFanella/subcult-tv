package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

// scanPost scans a full post row into a models.Post.
func scanPost(s scanner) (models.Post, error) {
	var p models.Post
	var date time.Time
	err := s.Scan(
		&p.ID, &p.Slug, &p.Title, &p.Excerpt, &p.Content,
		&p.Tags, &p.Author, &p.Published, &date,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err == nil {
		p.Date = date.Format("2006-01-02")
	}
	return p, err
}

// Public queries expose approved website entries only at their scheduled time.
const visiblePost = `(published = true OR EXISTS(SELECT 1 FROM publication_review v WHERE v.post_id=posts.id AND v.platform='website' AND v.status='scheduled' AND v.due_at<=NOW()))`

func (h *Handler) ListPosts(w http.ResponseWriter, r *http.Request) { h.listPosts(w, r, true) }
func (h *Handler) ListAllPosts(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	w.Header().Set("Cache-Control", "private, no-store")
	h.listPosts(w, r, false)
}
func (h *Handler) listPosts(w http.ResponseWriter, r *http.Request, onlyPublished bool) {
	page, perPage, offset := pagination(r)

	var total int64
	countQuery := `SELECT COUNT(*) FROM posts`
	if onlyPublished {
		countQuery += ` WHERE ` + visiblePost
	}
	if r.URL.Query().Get("tag") == "development-log" {
		if strings.Contains(countQuery, " WHERE ") {
			countQuery += " AND "
		} else {
			countQuery += " WHERE "
		}
		countQuery += "'development-log'=ANY(tags)"
	}
	if err := h.DB.QueryRow(r.Context(), countQuery).Scan(&total); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to count posts")
		return
	}

	query := `SELECT id, slug, title, excerpt, content, tags, author, published, date,
	           created_at, updated_at FROM posts`
	args := []interface{}{}
	argN := 1

	if onlyPublished {
		query += ` WHERE ` + visiblePost
	}
	if r.URL.Query().Get("tag") == "development-log" {
		if strings.Contains(query, " WHERE ") {
			query += " AND "
		} else {
			query += " WHERE "
		}
		query += "'development-log'=ANY(tags)"
	}
	query += fmt.Sprintf(` ORDER BY date DESC LIMIT $%d OFFSET $%d`, argN, argN+1)
	args = append(args, perPage, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to query posts")
		return
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		p, err := scanPost(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan post")
			return
		}
		if onlyPublished {
			p.Published = true
		}
		posts = append(posts, p)
	}

	if posts == nil {
		posts = []models.Post{}
	}

	writeJSON(w, http.StatusOK, models.PaginatedResponse[models.Post]{
		Data:       posts,
		Total:      total,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages(total, perPage),
	})
}

// GetPost returns a single post by slug.
func (h *Handler) GetPost(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var p models.Post
	row := h.DB.QueryRow(r.Context(),
		`SELECT id, slug, title, excerpt, content, tags, author, published, date,
		 created_at, updated_at FROM posts WHERE slug = $1 AND `+visiblePost, slug,
	)
	p, err := scanPost(row)
	if err != nil {
		writeError(w, http.StatusNotFound, "post not found")
		return
	}

	p.Published = true
	writeJSON(w, http.StatusOK, p)
}

// CreatePost creates a new post (admin only).
func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	var req models.CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Slug == "" || req.Title == "" {
		writeError(w, http.StatusBadRequest, "slug and title are required")
		return
	}
	if req.Tags == nil {
		req.Tags = []string{}
	}

	var p models.Post
	row := h.DB.QueryRow(r.Context(),
		`INSERT INTO posts (slug, title, excerpt, content, tags, author, published, date)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		 RETURNING id, slug, title, excerpt, content, tags, author, published, date,
		  created_at, updated_at`,
		req.Slug, req.Title, req.Excerpt, req.Content, req.Tags,
		req.Author, req.Published, req.Date,
	)
	p, err := scanPost(row)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create post: "+err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, p)
}

// UpdatePost updates an existing post (admin only).
func (h *Handler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	id := chi.URLParam(r, "id")
	var managed bool
	if err := h.DB.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM publication_review WHERE post_id=$1)`, id).Scan(&managed); err != nil {
		writeError(w, 503, "Article could not be checked")
		return
	}
	if managed {
		writeError(w, 409, "Edit and approve this article from Development log")
		return
	}

	var req models.UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Tags == nil {
		req.Tags = []string{}
	}

	var p models.Post
	row := h.DB.QueryRow(r.Context(),
		`UPDATE posts SET
		  slug=$1, title=$2, excerpt=$3, content=$4, tags=$5,
		  author=$6, published=$7, date=$8, updated_at=NOW()
		 WHERE id=$9
		 RETURNING id, slug, title, excerpt, content, tags, author, published, date,
		  created_at, updated_at`,
		req.Slug, req.Title, req.Excerpt, req.Content, req.Tags,
		req.Author, req.Published, req.Date, id,
	)
	p, err := scanPost(row)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update post: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, p)
}

// DeletePost deletes a post (admin only).
func (h *Handler) DeletePost(w http.ResponseWriter, r *http.Request) {
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	id := chi.URLParam(r, "id")

	tag, err := h.DB.Exec(r.Context(), `DELETE FROM posts WHERE id = $1`, id)
	if err != nil || tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "post not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
