package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

func TestPublicationApprovalIntegration(t *testing.T) {
	connection := os.Getenv("TEST_SOCIAL_DATABASE_URL")
	if connection == "" {
		t.Skip("requires isolated TEST_SOCIAL_DATABASE_URL")
	}
	ctx := context.Background()
	db, err := database.Connect(ctx, connection)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err = database.Migrate(ctx, db); err != nil {
		t.Fatal(err)
	}
	key := strings.Repeat("k", 40)
	h := &Handler{DB: db, PostingPreparationKey: key}
	routes := chi.NewRouter()
	routes.Post("/import", h.IngestPublications)
	routes.Get("/posts", h.ListPosts)
	routes.Get("/posts/{slug}", h.GetPost)
	routes.Put("/edit/{id}", h.SavePublication)
	routes.Post("/approve/{id}", h.ApprovePublication)
	request := func(method, path string, input any, role, auth string) *httptest.ResponseRecorder {
		body, _ := json.Marshal(input)
		req := httptest.NewRequest(method, path, bytes.NewReader(body))
		req.Header.Set("Authorization", auth)
		req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, role), middleware.UserIDKey, "owner"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w
	}
	day := "2099-01-01"
	due := time.Now().Add(48 * time.Hour)
	drafts := []publication{}
	for _, platform := range []string{"website", "patreon"} {
		drafts = append(drafts, publication{ID: "daily-" + day + "-" + platform, Platform: platform, Title: "Verified title", Body: "Private draft text", Excerpt: "Draft excerpt", DueAt: due, Source: json.RawMessage(`{"private_source":"git.subcult.tv"}`)})
	}
	defer db.Exec(ctx, `DELETE FROM publication_review WHERE id LIKE 'daily-2099-01-01-%'`)
	defer db.Exec(ctx, `DELETE FROM posts WHERE slug='daily-2099-01-01'`)
	if w := request("POST", "/import", drafts, "", "wrong"); w.Code != 401 {
		t.Fatal(w.Code)
	}
	if w := request("POST", "/import", drafts, "", "Bearer "+key); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := request("POST", "/import", drafts, "", "Bearer "+key); w.Code != 200 || !strings.Contains(w.Body.String(), `"created":0`) {
		t.Fatal("retry overwrote draft", w.Body.String())
	}
	if w := request("GET", "/posts?all=true", nil, "", ""); w.Code != 200 || strings.Contains(w.Body.String(), "Private draft text") {
		t.Fatal("draft leaked", w.Body.String())
	}
	if w := request("GET", "/posts/daily-"+day, nil, "", ""); w.Code != 404 {
		t.Fatal("unpublished article leaked")
	}
	approval := map[string]any{"version": 1, "approved": true}
	if w := request("POST", "/approve/"+drafts[0].ID, approval, "reader", ""); w.Code != 403 {
		t.Fatal("non-admin approved")
	}
	if w := request("POST", "/approve/"+drafts[0].ID, map[string]any{"version": 1}, "admin", ""); w.Code != 400 {
		t.Fatal("implicit approval")
	}
	edit := drafts[0]
	edit.Version = 1
	edit.Title = "Edited exact version"
	if w := request("PUT", "/edit/"+edit.ID, edit, "admin", ""); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := request("POST", "/approve/"+edit.ID, approval, "admin", ""); w.Code != 409 {
		t.Fatal("stale version approved")
	}
	// An edition stored before preparation stripped the reviewer note must not publish it.
	stale := "Draft for human review.\n\nPrivate draft text"
	db.Exec(ctx, `UPDATE publication_review SET body=$2 WHERE id=$1`, edit.ID, stale)
	db.Exec(ctx, `UPDATE posts SET content=$2 WHERE slug=$1`, "daily-"+day, stale)
	approval["version"] = 2
	if w := request("POST", "/approve/"+edit.ID, approval, "admin", ""); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var storedBody, storedPost string
	db.QueryRow(ctx, `SELECT body FROM publication_review WHERE id=$1`, edit.ID).Scan(&storedBody)
	db.QueryRow(ctx, `SELECT content FROM posts WHERE slug=$1`, "daily-"+day).Scan(&storedPost)
	if storedBody != "Private draft text" || storedPost != "Private draft text" {
		t.Fatalf("reviewer note kept: %q %q", storedBody, storedPost)
	}
	if w := request("GET", "/posts/daily-"+day, nil, "", ""); w.Code != 404 {
		t.Fatal("published ahead of approved time")
	}
	if w := request("PUT", "/edit/"+edit.ID, edit, "admin", ""); w.Code != 409 {
		t.Fatal("queued post edited")
	}
	if w := request("POST", "/approve/"+drafts[1].ID, map[string]any{"version": 1, "approved": true}, "admin", ""); w.Code != 409 {
		t.Fatal("unconnected Patreon approved")
	}
	if _, err = db.Exec(ctx, `UPDATE publication_review SET due_at=NOW()-INTERVAL '1 minute' WHERE id=$1`, edit.ID); err != nil {
		t.Fatal(err)
	}
	if w := request("GET", "/posts/daily-"+day, nil, "", ""); w.Code != 200 || !strings.Contains(w.Body.String(), "Edited exact version") || strings.Contains(w.Body.String(), "private_source") {
		t.Fatal("approved article unavailable or private evidence leaked", w.Body.String())
	}
	// Older deployed databases retain a text date column. Both schemas must read
	// the same approved article without a destructive type migration.
	if _, err = db.Exec(ctx, `ALTER TABLE posts ALTER COLUMN date TYPE TEXT USING date::text`); err != nil {
		t.Fatal(err)
	}
	db.Reset() // Discard cached DATE result metadata after the isolated schema change.
	if w := request("GET", "/posts?all=true", nil, "", ""); w.Code != 200 || !strings.Contains(w.Body.String(), "Edited exact version") {
		t.Fatal("legacy text dates failed", w.Body.String())
	}

}
