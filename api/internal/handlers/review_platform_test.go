package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

func writeSnapshot(t *testing.T, root string, drafts []postingDraft) {
	t.Helper()
	data, _ := json.Marshal(postingDashboard{Version: 1, GeneratedAt: time.Now().UTC().Format(time.RFC3339), Drafts: drafts})
	if err := os.WriteFile(filepath.Join(root, "posting.json"), data, 0600); err != nil {
		t.Fatal(err)
	}
}

func TestPlatformIsDerivedAndInvalidImagesDropped(t *testing.T) {
	root := t.TempDir()
	good := strings.Repeat("a", 64)
	writeSnapshot(t, root, []postingDraft{
		{ID: "cm:0", Mode: "changemaker", Media: postingMedia{Image: &postingImage{SHA256: good, Bytes: 1000}, Candidates: []postingImage{{SHA256: "../etc"}, {SHA256: good, Bytes: 2 << 20}, {SHA256: good}}}},
		{ID: "plan:0", Mode: "plan", Account: "clpr"},
		{ID: "radar:0", Mode: "radar", Platform: "bluesky"},
		{ID: "bad:0", Mode: "changemaker", Media: postingMedia{Image: &postingImage{SHA256: "ABC"}}},
	})
	h := &Handler{StudioRoot: root}
	data, err := h.loadPosting()
	if err != nil {
		t.Fatal(err)
	}
	want := map[string]string{"cm:0": "instagram", "plan:0": "x", "radar:0": "bluesky", "bad:0": "instagram"}
	for _, d := range data.Drafts {
		if d.Platform != want[d.ID] {
			t.Fatalf("%s platform %q", d.ID, d.Platform)
		}
	}
	if data.Drafts[0].Media.Image == nil || len(data.Drafts[0].Media.Candidates) != 1 {
		t.Fatalf("valid image references changed: %+v", data.Drafts[0].Media)
	}
	if data.Drafts[3].Media.Image != nil {
		t.Fatal("invalid image reference exported")
	}
}

func TestInstagramEditorRejectsXDrafts(t *testing.T) {
	root := t.TempDir()
	writeSnapshot(t, root, []postingDraft{{ID: "plan:0", Mode: "plan", Account: "patrick", Text: "An X post", DueAt: time.Now().Add(72 * time.Hour).Format(time.RFC3339)}})
	h := &Handler{StudioRoot: root, SocialAccounts: []string{"patrick"}}
	routes := chi.NewRouter()
	routes.Put("/{id}", h.SaveReviewDraft)
	routes.Post("/{id}/approve", h.ApproveReviewDraft)
	var payload bytes.Buffer
	form := multipart.NewWriter(&payload)
	for k, v := range map[string]string{"version": "0", "caption": "Caption", "account_id": "patrick", "due_at": time.Now().Add(48 * time.Hour).Format(time.RFC3339)} {
		form.WriteField(k, v)
	}
	form.Close()
	for _, call := range []struct {
		method, path, contentType string
		body                      *bytes.Buffer
	}{
		{"PUT", "/plan%3A0", form.FormDataContentType(), &payload},
		{"POST", "/plan%3A0/approve", "application/json", bytes.NewBufferString(`{"approved":true,"version":1}`)},
	} {
		req := httptest.NewRequest(call.method, call.path, call.body)
		req.Header.Set("Content-Type", call.contentType)
		req = req.WithContext(context.WithValue(req.Context(), middleware.RoleKey, "admin"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		if w.Code != 409 || !strings.Contains(w.Body.String(), "Buffer") {
			t.Fatalf("%s %s: %d %s", call.method, call.path, w.Code, w.Body.String())
		}
	}
}

func TestExpiryFallsBackToProposedTime(t *testing.T) {
	now := time.Now()
	past, future := now.Add(-time.Hour).Format(time.RFC3339), now.Add(time.Hour).Format(time.RFC3339)
	cases := []struct {
		d    postingDraft
		want bool
	}{
		{postingDraft{ExpiresAt: past, DueAt: future}, true},
		{postingDraft{ExpiresAt: future, DueAt: past}, false},
		{postingDraft{DueAt: past}, true},
		{postingDraft{DueAt: future}, false},
		{postingDraft{}, false},
		{postingDraft{ExpiresAt: "not a time"}, true},
	}
	for i, c := range cases {
		if got := c.d.expired(now); got != c.want {
			t.Fatalf("case %d: %v", i, got)
		}
	}
}

func TestStripReviewPrefix(t *testing.T) {
	for in, want := range map[string]string{
		"Draft for human review.\n\nToday we shipped": "Today we shipped",
		"  \nDraft for human review. Body":            "Body",
		"Today we shipped":                            "Today we shipped",
		"We wrote a Draft for human review. note":     "We wrote a Draft for human review. note",
	} {
		if got := stripReviewPrefix(in); got != want {
			t.Fatalf("%q -> %q", in, got)
		}
	}
}
