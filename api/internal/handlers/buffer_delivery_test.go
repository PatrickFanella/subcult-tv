package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/buffer"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

type fakeBuffer struct {
	posts []buffer.Post
	calls int
	fail  bool
}

func (p *fakeBuffer) Channels(context.Context) ([]buffer.Channel, error) {
	return []buffer.Channel{{ID: "channel", Name: "subcult_tv", Service: "twitter"}}, nil
}
func (p *fakeBuffer) Posts(context.Context, []string, time.Time) ([]buffer.Post, error) {
	return p.posts, nil
}
func (p *fakeBuffer) Post(_ context.Context, id string) (buffer.Post, error) {
	for _, v := range p.posts {
		if v.ID == id {
			return v, nil
		}
	}
	return buffer.Post{}, errors.New("missing")
}
func (p *fakeBuffer) Schedule(_ context.Context, channel, text string, due time.Time) (buffer.Post, error) {
	p.calls++
	post := buffer.Post{ID: "buffer-post", ChannelID: channel, Text: text, Due: due, Status: "scheduled", Actions: []string{"updatePostSchedule", "updatePost"}}
	p.posts = append(p.posts, post)
	if p.fail {
		return buffer.Post{}, errors.New("connection lost after accept")
	}
	return post, nil
}
func (p *fakeBuffer) Reschedule(_ context.Context, id, text string, due time.Time) (buffer.Post, error) {
	p.calls++
	for i := range p.posts {
		if p.posts[i].ID == id {
			p.posts[i].Text = text
			p.posts[i].Due = due
			return p.posts[i], nil
		}
	}
	return buffer.Post{}, errors.New("missing")
}

func TestBufferApprovalIntegration(t *testing.T) {
	db := testDB(t)
	provider := &fakeBuffer{}
	root := t.TempDir()
	due := time.Now().Add(2 * time.Hour).UTC().Truncate(time.Second)
	drafts := []postingDraft{
		{ID: "buffer-test:0", Mode: "plan", Platform: "x", Text: "Evergreen tweet", DueAt: time.Now().Add(-time.Hour).Format(time.RFC3339)},
		{ID: "buffer-test:1", Mode: "radar", Platform: "x", Text: "Expired news", DueAt: time.Now().Add(-time.Hour).Format(time.RFC3339)},
		{ID: "buffer-test:2", Mode: "plan", Platform: "x", Text: "Uncertain tweet", DueAt: due.Format(time.RFC3339)},
		{ID: "buffer-test:3", Mode: "plan", Platform: "x", Text: "Evergreen tweet", DueAt: due.Format(time.RFC3339)},
	}
	data, _ := json.Marshal(postingDashboard{GeneratedAt: time.Now().UTC().Format(time.RFC3339), Drafts: drafts})
	if err := os.WriteFile(filepath.Join(root, "posting.json"), data, 0600); err != nil {
		t.Fatal(err)
	}
	h := &Handler{DB: db, StudioRoot: root, BufferPosting: provider, BufferChannels: []string{"channel"}}
	routes := chi.NewRouter()
	routes.Post("/{id}/approve", h.ApproveBufferDraft)
	routes.Put("/{id}/schedule", h.EditBufferDraft)
	t.Cleanup(func() {
		db.Exec(context.Background(), `DELETE FROM buffer_schedules WHERE draft_id LIKE 'buffer-test:%'`)
	})
	send := func(method, id, text string, version int, approved bool) *httptest.ResponseRecorder {
		original := ""
		for _, d := range drafts {
			if d.ID == id {
				original = d.Text
			}
		}
		payload, _ := json.Marshal(map[string]any{"channel_id": "channel", "caption": text, "original_text": original, "due_at": due.Format(time.RFC3339), "approved": approved, "version": version})
		target := "/" + id + "/approve"
		if method == "PUT" {
			target = "/" + id + "/schedule"
		}
		r := httptest.NewRequest(method, target, bytes.NewReader(payload))
		r = r.WithContext(context.WithValue(context.WithValue(r.Context(), middleware.RoleKey, "admin"), middleware.UserIDKey, "owner"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, r)
		return w
	}
	check := func(w *httptest.ResponseRecorder, code int) {
		t.Helper()
		if w.Code != code {
			t.Fatalf("want %d got %d: %s", code, w.Code, w.Body.String())
		}
	}
	check(send("POST", "buffer-test:0", "Evergreen tweet", 0, false), 400)
	check(send("POST", "buffer-test:1", "Expired news", 0, true), 409)
	if provider.calls != 0 {
		t.Fatal("unapproved or expired draft reached Buffer")
	}
	check(send("POST", "buffer-test:0", "Evergreen tweet", 0, true), 201)
	check(send("POST", "buffer-test:0", "Evergreen tweet", 0, true), 200)
	check(send("POST", "buffer-test:3", "Evergreen tweet", 0, true), 409)
	if provider.calls != 1 {
		t.Fatal("duplicate submission", provider.calls)
	}
	check(send("PUT", "buffer-test:0", "Revised tweet", 4, true), 409)
	check(send("PUT", "buffer-test:0", "Revised tweet", 1, true), 201)
	var version int
	var text, status string
	if err := db.QueryRow(context.Background(), `SELECT version,caption,status FROM buffer_schedules WHERE draft_id='buffer-test:0'`).Scan(&version, &text, &status); err != nil {
		t.Fatal(err)
	}
	if version != 2 || text != "Revised tweet" || status != "scheduled" || len(provider.posts) != 1 {
		t.Fatal("edit did not preserve one scheduled post", version, text, status)
	}
	provider.fail = true
	check(send("POST", "buffer-test:2", "Uncertain tweet", 0, true), 502)
	check(send("POST", "buffer-test:2", "Uncertain tweet", 0, true), 409)
	if provider.calls != 3 {
		t.Fatal("uncertain submission retried", provider.calls)
	}
	if err := db.QueryRow(context.Background(), `SELECT status FROM buffer_schedules WHERE draft_id='buffer-test:2'`).Scan(&status); err != nil || status != "uncertain" {
		t.Fatal("uncertain receipt missing", status, err)
	}
}
