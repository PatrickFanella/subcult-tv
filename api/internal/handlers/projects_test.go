package handlers

import (
	"context"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

func projectTestDB(t *testing.T) *pgxpool.Pool {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("set TEST_DATABASE_URL to a disposable PostgreSQL database")
	}
	ctx := context.Background()
	admin, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(admin.Close)
	schema := "projects_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if _, err = admin.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _, _ = admin.Exec(ctx, "DROP SCHEMA "+schema+" CASCADE") })
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		t.Fatal(err)
	}
	cfg.ConnConfig.RuntimeParams["search_path"] = schema + ",public"
	db, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(db.Close)
	if err = database.Migrate(ctx, db); err != nil {
		t.Fatal(err)
	}
	return db
}

func TestProjectsPreserveMultipleTypes(t *testing.T) {
	db := projectTestDB(t)
	if _, err := db.Exec(context.Background(), `DELETE FROM projects`); err != nil {
		t.Fatal(err)
	}
	h := &Handler{DB: db}
	w := httptest.NewRecorder()
	h.CreateProject(w, newJSONRequest(t, "POST", "/", models.CreateProjectRequest{Slug: "mixed", Name: "Mixed", Type: []string{"software", "media"}, Status: "active", CoverPattern: "grid"}))
	if w.Code != 201 {
		t.Fatalf("create: %d %s", w.Code, w.Body.String())
	}
	for _, path := range []string{"/", "/?type=media", "/?type=tools"} {
		w = httptest.NewRecorder()
		h.ListProjects(w, httptest.NewRequest("GET", path, nil))
		if w.Code != 200 {
			t.Fatalf("list: %d %s", w.Code, w.Body.String())
		}
		var items []models.Project
		if err := json.Unmarshal(w.Body.Bytes(), &items); err != nil {
			t.Fatal(err)
		}
		if path == "/?type=tools" {
			if len(items) != 0 {
				t.Fatal("incorrect type filter")
			}
			continue
		}
		if len(items) != 1 || strings.Join(items[0].Type, ",") != "software,media" {
			t.Fatalf("lost categories: %+v", items)
		}
	}
}

func TestProjectPublicationRequiresExactReviewAndRemainsImmutable(t *testing.T) {
	db := projectTestDB(t)
	ctx := context.Background()
	h := &Handler{DB: db}
	w := httptest.NewRecorder()
	h.CreateProject(w, newJSONRequest(t, "POST", "/", models.CreateProjectRequest{Slug: "review", Name: "Reviewed", Type: []string{"software"}, Status: "active", CoverPattern: "grid"}))
	if w.Code != 201 {
		t.Fatal(w.Body.String())
	}
	var project models.Project
	json.Unmarshal(w.Body.Bytes(), &project)
	read := func() []models.Project {
		t.Helper()
		w := httptest.NewRecorder()
		h.PublishedProjects(w, httptest.NewRequest("GET", "/", nil))
		if w.Code != 200 {
			t.Fatal(w.Body.String())
		}
		var items []models.Project
		json.Unmarshal(w.Body.Bytes(), &items)
		return items
	}
	if len(read()) != 0 {
		t.Fatal("draft appeared publicly")
	}
	request := func(role string, at any) *http.Request {
		r := newJSONRequest(t, "POST", "/", map[string]any{"approved": true, "updated_at": at})
		route := chi.NewRouteContext()
		route.URLParams.Add("id", project.ID.String())
		c := context.WithValue(r.Context(), chi.RouteCtxKey, route)
		c = context.WithValue(c, middleware.RoleKey, role)
		c = context.WithValue(c, middleware.UserIDKey, uuid.NewString())
		return r.WithContext(c)
	}
	w = httptest.NewRecorder()
	h.ApproveProject(w, request("editor", project.UpdatedAt))
	if w.Code != 403 {
		t.Fatalf("role bypass: %d", w.Code)
	}
	_, err := db.Exec(ctx, `UPDATE projects SET name='Edited',updated_at=updated_at+interval '1 second' WHERE id=$1`, project.ID)
	if err != nil {
		t.Fatal(err)
	}
	w = httptest.NewRecorder()
	h.ApproveProject(w, request("admin", project.UpdatedAt))
	if w.Code != 409 {
		t.Fatalf("stale approval: %d %s", w.Code, w.Body.String())
	}
	if len(read()) != 0 {
		t.Fatal("stale approval published")
	}
	db.QueryRow(ctx, `SELECT updated_at FROM projects WHERE id=$1`, project.ID).Scan(&project.UpdatedAt)
	w = httptest.NewRecorder()
	h.ApproveProject(w, request("admin", project.UpdatedAt))
	if w.Code != 200 {
		t.Fatalf("approval: %d %s", w.Code, w.Body.String())
	}
	if items := read(); len(items) != 1 || items[0].Name != "Edited" {
		t.Fatalf("wrong snapshot: %+v", items)
	}
	db.Exec(ctx, `UPDATE projects SET name='Later draft' WHERE id=$1`, project.ID)
	if read()[0].Name != "Edited" {
		t.Fatal("draft changed approved snapshot")
	}
	w = httptest.NewRecorder()
	h.UnpublishProject(w, request("admin", project.UpdatedAt))
	if w.Code != 204 || len(read()) != 0 {
		t.Fatal("could not remove snapshot")
	}
	db.Exec(ctx, `UPDATE projects SET homepage='javascript:alert(1)' WHERE id=$1`, project.ID)
	w = httptest.NewRecorder()
	h.ApproveProject(w, request("admin", project.UpdatedAt))
	if w.Code != 400 {
		t.Fatal("unsafe link published")
	}
}
