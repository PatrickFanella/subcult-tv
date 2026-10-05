package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"

	"image"
	"image/jpeg"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func TestReviewDraftApprovalIntegration(t *testing.T) {
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
	var submissions atomic.Int32
	client := socialTestProvider(t, &submissions, nil, "review-post")
	root := t.TempDir()
	snapshot := postingDashboard{GeneratedAt: time.Now().UTC().Format(time.RFC3339), Drafts: []postingDraft{{ID: "20261004T052615.663030Z-changemaker:0", Text: "Prepared", DueAt: time.Now().Add(48 * time.Hour).Format(time.RFC3339)}}}
	data, _ := json.Marshal(snapshot)
	os.WriteFile(filepath.Join(root, "posting.json"), data, 0600)
	h := &Handler{DB: db, StudioRoot: root, SocialPosting: client, SocialAccounts: []string{"patrick"}, PostingMediaBaseURL: "https://example.test"}
	routes := chi.NewRouter()
	routes.Put("/{id}", h.SaveReviewDraft)
	routes.Get("/{id}/media", h.ReviewDraftMedia)
	routes.Post("/{id}/approve", h.ApproveReviewDraft)
	call := func(method, path string, payload *bytes.Buffer, contentType string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(method, path, payload)
		req.Header.Set("Content-Type", contentType)
		req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, "admin"), middleware.UserIDKey, "owner"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w
	}
	save := func(version int, media bool) *httptest.ResponseRecorder {
		var payload bytes.Buffer
		form := multipart.NewWriter(&payload)
		for k, v := range map[string]string{"version": strconv.Itoa(version), "caption": "Exact saved caption", "account_id": "patrick", "due_at": time.Now().Add(48 * time.Hour).Format(time.RFC3339)} {
			form.WriteField(k, v)
		}
		if media {
			part, _ := form.CreateFormFile("media", "image.jpg")
			jpeg.Encode(part, image.NewRGBA(image.Rect(0, 0, 400, 400)), nil)
		}
		form.Close()
		return call("PUT", "/20261004T052615.663030Z-changemaker%3A0", &payload, form.FormDataContentType())
	}
	approve := func(version int) *httptest.ResponseRecorder {
		return call("POST", "/20261004T052615.663030Z-changemaker%3A0/approve", bytes.NewBufferString(`{"approved":true,"version":`+strconv.Itoa(version)+`}`), "application/json")
	}
	defer db.Exec(ctx, `DELETE FROM social_review_drafts WHERE draft_id='20261004T052615.663030Z-changemaker:0'`)
	defer db.Exec(ctx, `DELETE FROM social_schedules WHERE provider_post_id='review-post'`)
	if w := save(0, false); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := approve(1); w.Code != 400 {
		t.Fatal("missing image approved", w.Body.String())
	}
	if w := save(0, true); w.Code != 409 {
		t.Fatal("stale edit saved")
	}
	if w := save(1, true); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if submissions.Load() != 0 {
		t.Fatal("editing sent a post")
	}
	if w := call("GET", "/20261004T052615.663030Z-changemaker%3A0/media?version=1", &bytes.Buffer{}, ""); w.Code != 404 {
		t.Fatal("old preview version received new media")
	}
	if w := call("GET", "/20261004T052615.663030Z-changemaker%3A0/media?version=2", &bytes.Buffer{}, ""); w.Code != 200 || w.Header().Get("Cache-Control") != "private, no-store" {
		t.Fatal("private preview unavailable")
	}
	var publicCount int
	db.QueryRow(ctx, `SELECT COUNT(*) FROM social_schedules WHERE provider_post_id='review-post'`).Scan(&publicCount)
	if publicCount != 0 {
		t.Fatal("saved image exposed before approval")
	}
	if w := approve(1); w.Code != 409 {
		t.Fatal("stale version approved")
	}
	if w := approve(2); w.Code != 201 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := approve(2); w.Code != 200 {
		t.Fatal("idempotent approval failed", w.Body.String())
	}
	if submissions.Load() != 1 {
		t.Fatal("duplicate provider submission")
	}
	if w := save(2, false); w.Code != 409 {
		t.Fatal("submitted draft changed")
	}
	var caption, user string
	db.QueryRow(ctx, `SELECT caption,approved_by FROM social_schedules WHERE provider_post_id='review-post'`).Scan(&caption, &user)
	if !strings.Contains(caption, "Exact saved caption") || user != "owner" {
		t.Fatal("approved different content", caption, user)
	}
}
