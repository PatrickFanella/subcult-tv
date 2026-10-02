package handlers

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
)

func TestStudioReferenceIndexIntegration(t *testing.T) {
	url := os.Getenv("TEST_STUDIO_DATABASE_URL")
	if url == "" {
		t.Skip("requires an isolated TEST_STUDIO_DATABASE_URL")
	}
	ctx := context.Background()
	db, err := database.Connect(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err = database.Migrate(ctx, db); err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	catalog := []studioReference{
		{ID: "test-swiss", Name: "Swiss Alpha", URL: "https://example.invalid/a", Collection: "Test studies", Summary: "Quiet grid", Guide: "Helvetica typographic baseline", Tags: []string{"Swiss", "Minimalist"}, Images: []string{}, Attachments: []referenceAttachment{}},
		{ID: "test-retro", Name: "Retro Beta", URL: "https://example.invalid/b", Collection: "Test studies", Summary: "A bright reference", Guide: "Hand lettering", Tags: []string{"Retro"}, Images: []string{}, Attachments: []referenceAttachment{}},
	}
	writeBundle := func(entries []studioReference) {
		t.Helper()
		data, _ := json.Marshal(map[string]any{"version": 1, "entries": entries})
		if err = os.WriteFile(filepath.Join(root, "references.json"), data, 0600); err != nil {
			t.Fatal(err)
		}
	}
	os.WriteFile(filepath.Join(root, "catalog.json"), []byte(`{"version":1,"files":{}}`), 0600)
	h := &Handler{DB: db, StudioRoot: root}
	t.Cleanup(func() {
		db.Exec(ctx, `DELETE FROM studio_references WHERE id LIKE 'test-%'`)
		db.Exec(ctx, `DELETE FROM studio_reference_imports`)
	})
	writeBundle(catalog)
	for range 2 {
		if count, err := h.SyncStudioReferences(ctx); err != nil || count != 2 {
			t.Fatalf("sync: %d %v", count, err)
		}
	}
	var count int
	db.QueryRow(ctx, `SELECT count(*) FROM studio_reference_imports`).Scan(&count)
	if count != 1 {
		t.Fatalf("idempotent import recorded %d snapshots", count)
	}
	router := chi.NewRouter()
	router.Get("/", h.ListStudioReferences)
	router.Get("/facets", h.StudioReferenceFacets)
	router.Get("/{id}", h.GetStudioReference)
	request := func(path string) *httptest.ResponseRecorder {
		t.Helper()
		r := httptest.NewRecorder()
		router.ServeHTTP(r, httptest.NewRequest("GET", path, nil))
		return r
	}
	for _, path := range []string{"/?q=Helvetica", "/?q=Swis", "/?tag=Swiss&tag=Minimalist", "/?collection=Test+studies&per_page=1&page=2&sort=name"} {
		res := request(path)
		var value struct {
			Items []studioReference `json:"items"`
			Total int               `json:"total"`
		}
		if res.Code != 200 || json.Unmarshal(res.Body.Bytes(), &value) != nil || len(value.Items) != 1 {
			t.Fatalf("%s: %d %s", path, res.Code, res.Body.String())
		}
	}
	res := request("/?tag=Swiss&tag=Retro")
	var empty struct {
		Items []studioReference `json:"items"`
		Total int               `json:"total"`
	}
	json.Unmarshal(res.Body.Bytes(), &empty)
	if res.Code != 200 || empty.Total != 0 || len(empty.Items) != 0 {
		t.Fatalf("AND tag semantics: %s", res.Body.String())
	}
	if request("/?sort=invalid").Code != 400 {
		t.Fatal("invalid sort accepted")
	}
	if request("/?page=100001").Code != 400 {
		t.Fatal("unbounded page accepted")
	}
	if request("/missing").Code != 404 {
		t.Fatal("missing detail not 404")
	}
	res = request("/test-swiss")
	var detail studioReference
	if res.Code != 200 || json.Unmarshal(res.Body.Bytes(), &detail) != nil || detail.Guide != "Helvetica typographic baseline" {
		t.Fatalf("detail: %s", res.Body.String())
	}
	res = request("/facets")
	if res.Code != 200 {
		t.Fatalf("facets: %s", res.Body.String())
	}
	// A truncated later snapshot must preserve previously indexed entries.
	writeBundle(catalog[:1])
	if _, err = h.SyncStudioReferences(ctx); err != nil {
		t.Fatal(err)
	}
	if request("/test-retro").Code != 200 {
		t.Fatal("partial snapshot removed previous entry")
	}
	// Validation fails before any writes when a duplicated ID is supplied.
	bad := append([]studioReference{}, catalog...)
	bad = append(bad, catalog[0])
	writeBundle(bad)
	if _, err = h.SyncStudioReferences(ctx); err == nil {
		t.Fatal("duplicate ID accepted")
	}
	if request("/test-retro").Code != 200 {
		t.Fatal("failed import corrupted existing entries")
	}
}
