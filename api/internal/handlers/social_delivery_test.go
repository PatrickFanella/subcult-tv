package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"image"
	"image/jpeg"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"sync/atomic"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/postiz"
)

func TestSocialApprovalIntegration(t *testing.T) {
	url := os.Getenv("TEST_SOCIAL_DATABASE_URL")
	if url == "" {
		t.Skip("requires isolated TEST_SOCIAL_DATABASE_URL")
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
	var submissions atomic.Int32
	var reject atomic.Bool
	provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			w.Write([]byte(`[{"id":"patrick","name":"Patrick","identifier":"instagram-standalone"}]`))
			return
		}
		submissions.Add(1)
		if reject.Load() {
			http.Error(w, "unconfirmed provider failure", 500)
			return
		}
		w.Write([]byte(`[{"postId":"p-one","integration":"patrick"}]`))
	}))
	defer provider.Close()
	h := &Handler{DB: db, Postiz: postiz.New(provider.URL, "test-key"), PostizAccounts: []string{"patrick"}, PostingMediaBaseURL: "https://example.test"}
	t.Cleanup(func() { db.Exec(ctx, `DELETE FROM social_schedules WHERE request_id LIKE 'test-social-%'`) })
	request := func(id, account, role, caption string, due time.Time, approved bool) *httptest.ResponseRecorder {
		var payload bytes.Buffer
		form := multipart.NewWriter(&payload)
		values := map[string]string{"request_id": id, "account_id": account, "caption": caption, "due_at": due.Format(time.RFC3339), "approved": "false"}
		if approved {
			values["approved"] = "true"
		}
		for k, v := range values {
			form.WriteField(k, v)
		}
		part, _ := form.CreateFormFile("media", "image.jpg")
		jpeg.Encode(part, image.NewRGBA(image.Rect(0, 0, 400, 400)), nil)
		form.Close()
		req := httptest.NewRequest("POST", "/", &payload)
		req.Header.Set("Content-Type", form.FormDataContentType())
		req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, role), middleware.UserIDKey, "owner"))
		response := httptest.NewRecorder()
		h.ApproveSchedule(response, req)
		return response
	}
	due := time.Now().Add(25 * time.Hour)
	for _, test := range []struct {
		label, account, role string
		due                  time.Time
		approved             bool
		code                 int
	}{
		{"short-lead", "patrick", "admin", time.Now().Add(time.Hour), true, 400},
		{"unapproved", "patrick", "admin", due, false, 400},
		{"other-account", "clpr", "admin", due, true, 400},
		{"not-admin", "patrick", "reader", due, true, 403},
	} {
		r := request("test-social-"+test.label, test.account, test.role, "caption", test.due, test.approved)
		if r.Code != test.code {
			t.Fatalf("%s: %d %s", test.label, r.Code, r.Body.String())
		}
	}
	if submissions.Load() != 0 {
		t.Fatal("invalid approval reached provider")
	}
	if r := request("test-social-approved", "patrick", "admin", "caption", due, true); r.Code != 201 {
		t.Fatalf("approval: %d %s", r.Code, r.Body.String())
	}
	if r := request("test-social-approved", "patrick", "admin", "caption", due, true); r.Code != 200 {
		t.Fatalf("replay: %d %s", r.Code, r.Body.String())
	}
	if submissions.Load() != 1 {
		t.Fatal("duplicate delivery submission")
	}
	if r := request("test-social-approved", "patrick", "admin", "changed", due, true); r.Code != 409 {
		t.Fatal("changed payload reused approval")
	}
	var mediaID string
	db.QueryRow(ctx, `SELECT media_id FROM social_schedules WHERE request_id='test-social-approved'`).Scan(&mediaID)
	routes := chi.NewRouter()
	routes.Get("/{id}", h.PostingMedia)
	mediaResponse := httptest.NewRecorder()
	routes.ServeHTTP(mediaResponse, httptest.NewRequest("GET", "/"+mediaID, nil))
	if mediaResponse.Code != 200 || mediaResponse.Header().Get("Content-Type") != "image/jpeg" {
		t.Fatal("approved image unavailable to delivery")
	}
	reject.Store(true)
	if r := request("test-social-uncertain", "patrick", "admin", "caption", due, true); r.Code != 502 {
		t.Fatal("provider failure not surfaced")
	}
	if r := request("test-social-uncertain", "patrick", "admin", "caption", due, true); r.Code != 409 {
		t.Fatal("uncertain approval retried")
	}
	if submissions.Load() != 2 {
		t.Fatal("uncertain provider submission duplicated")
	}
	var row struct{ Status, ApprovedBy string }
	db.QueryRow(ctx, `SELECT status,approved_by FROM social_schedules WHERE request_id='test-social-approved'`).Scan(&row.Status, &row.ApprovedBy)
	if row.Status != "scheduled" || row.ApprovedBy != "owner" {
		b, _ := json.Marshal(row)
		t.Fatalf("missing approval evidence: %s", b)
	}
}
