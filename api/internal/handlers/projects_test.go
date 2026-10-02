package handlers

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

func TestProjectsPreserveMultipleTypes(t *testing.T) {
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("set TEST_DATABASE_URL to a disposable PostgreSQL database")
	}
	ctx := context.Background()
	admin, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	defer admin.Close()
	schema := "projects_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if _, err = admin.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
		t.Fatal(err)
	}
	defer func() { _, _ = admin.Exec(ctx, "DROP SCHEMA "+schema+" CASCADE") }()
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		t.Fatal(err)
	}
	cfg.ConnConfig.RuntimeParams["search_path"] = schema + ",public"
	db, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err = database.Migrate(ctx, db); err != nil {
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
		if err = json.Unmarshal(w.Body.Bytes(), &items); err != nil {
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
