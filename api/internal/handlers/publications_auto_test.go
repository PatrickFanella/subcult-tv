package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestDevelopmentAutomaticPublication(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	key := strings.Repeat("a", 40)
	h := &Handler{DB: db, PostingPreparationKey: key}
	importDay := func(day string) {
		t.Helper()
		drafts := []publication{}
		for _, platform := range []string{"website", "patreon"} {
			drafts = append(drafts, publication{ID: "daily-" + day + "-" + platform, Platform: platform, Title: "Automatic update", Body: "Draft for human review.\n\nVerified work", DueAt: time.Now().Add(48 * time.Hour), Source: json.RawMessage(`{"private_source":"git.subcult.tv"}`)})
		}
		body, _ := json.Marshal(drafts)
		r := httptest.NewRequest("POST", "/import", bytes.NewReader(body))
		r.Header.Set("Authorization", "Bearer "+key)
		w := httptest.NewRecorder()
		h.IngestPublications(w, r)
		if w.Code != 200 {
			t.Fatal(w.Code, w.Body.String())
		}
	}
	for _, day := range []string{"2099-02-01", "2099-02-02"} {
		defer db.Exec(ctx, `DELETE FROM posts WHERE slug=$1`, "daily-"+day)
		defer db.Exec(ctx, `DELETE FROM publication_review WHERE id LIKE $1`, "daily-"+day+"-%")
	}
	importDay("2099-02-01")
	if count, err := h.PublishDevelopmentBacklog(ctx); err != nil || count != 0 {
		t.Fatal(count, err)
	}
	h.DevelopmentAutoPublish = true
	if count, err := h.PublishDevelopmentBacklog(ctx); err != nil || count != 1 {
		t.Fatal(count, err)
	}
	if count, err := h.PublishDevelopmentBacklog(ctx); err != nil || count != 0 {
		t.Fatal("backlog repeated", count, err)
	}
	importDay("2099-02-02")
	// A duplicate import must preserve the published edition, even if edited later.
	db.Exec(ctx, `UPDATE posts SET title='Owner edition' WHERE slug='daily-2099-02-02'`)
	importDay("2099-02-02")
	for _, day := range []string{"2099-02-01", "2099-02-02"} {
		var status, approved, body string
		var due time.Time
		err := db.QueryRow(ctx, `SELECT status,approved_by,body,due_at FROM publication_review WHERE id=$1`, "daily-"+day+"-website").Scan(&status, &approved, &body, &due)
		if err != nil || status != "scheduled" || approved != "automatic:development-updates" || body != "Verified work" || due.After(time.Now()) {
			t.Fatal(status, approved, body, due, err)
		}
		db.QueryRow(ctx, `SELECT status,approved_by FROM publication_review WHERE id=$1`, "daily-"+day+"-patreon").Scan(&status, &approved)
		if status != "draft" || approved != "" {
			t.Fatal("Patreon approved", status, approved)
		}
	}
	w := httptest.NewRecorder()
	h.ListPosts(w, httptest.NewRequest("GET", "/posts?tag=development-log", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), "Owner edition") || strings.Contains(w.Body.String(), "private_source") || strings.Contains(w.Body.String(), "Draft for human review") {
		t.Fatal(w.Code, w.Body.String())
	}
}
