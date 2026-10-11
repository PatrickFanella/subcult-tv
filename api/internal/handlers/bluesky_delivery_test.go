package handlers

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
)

func blueskyTestProvider(t *testing.T, calls *atomic.Int32, reject *atomic.Bool) *postybirb.Client {
	t.Helper()
	options := []any{}
	files := []any{}
	kind, id, alt, due := "", "", "", ""
	scheduled := false
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == "GET" && r.URL.Path == "/account":
			w.Write([]byte(`[{"id":"bsky-subcult","name":"@subcult.tv","website":"bluesky","state":{"status":"loggedIn","isLoggedIn":true}},{"id":"ig-only","name":"Instagram","website":"instagram","state":{"status":"loggedIn","isLoggedIn":true}},{"id":"bsky-offline","name":"Offline","website":"bluesky","state":{"status":"loggedOut","isLoggedIn":false}},{"id":"not-allowed","name":"Other","website":"bluesky","state":{"status":"loggedIn","isLoggedIn":true}}]`))
		case r.Method == "POST" && r.URL.Path == "/submissions":
			n := calls.Add(1)
			id = fmt.Sprintf("bluesky-post-%d", n)
			options = []any{}
			files = []any{}
			scheduled = false
			if r.ParseMultipartForm(1<<20) != nil {
				t.Error("invalid multipart")
			}
			kind = r.FormValue("type")
			if f, _, err := r.FormFile("files"); err == nil {
				f.Close()
				files = append(files, map[string]any{"id": "image", "metadata": map[string]string{"altText": ""}})
			}
			if kind == "FILE" && len(files) != 1 || kind == "MESSAGE" && len(files) != 0 {
				t.Error("wrong draft type")
			}
			json.NewEncoder(w).Encode([]map[string]string{{"id": id}})
		case r.Method == "POST" && r.URL.Path == "/website-option":
			var body map[string]any
			json.NewDecoder(r.Body).Decode(&body)
			options = append(options, body)
		case r.Method == "PATCH" && r.URL.Path == "/file-submission/metadata/image":
			var body map[string]string
			json.NewDecoder(r.Body).Decode(&body)
			alt = body["altText"]
			files = []any{map[string]any{"id": "image", "metadata": map[string]string{"altText": alt}}}
		case r.Method == "GET" && strings.HasPrefix(r.URL.Path, "/website-option/validate/"):
			w.Write([]byte(`[{"account":{"id":"bsky-subcult"},"errors":[]}]`))
		case r.Method == "PATCH" && strings.HasPrefix(r.URL.Path, "/submissions/"):
			if reject.Load() {
				http.Error(w, "uncertain queue", 500)
				return
			}
			var body map[string]any
			json.NewDecoder(r.Body).Decode(&body)
			if body["isScheduled"] != true || body["scheduleType"] != "SINGLE" {
				t.Error("invalid schedule")
			}
			due = body["scheduledFor"].(string)
			scheduled = true
		case r.Method == "GET" && strings.HasPrefix(r.URL.Path, "/submissions/"):
			schedule := map[string]string{"scheduleType": "NONE"}
			if scheduled {
				schedule = map[string]string{"scheduleType": "SINGLE", "scheduledFor": due}
			}
			json.NewEncoder(w).Encode(map[string]any{"id": strings.TrimPrefix(r.URL.Path, "/submissions/"), "type": kind, "isScheduled": scheduled, "schedule": schedule, "files": files, "options": options, "posts": []any{}})
		default:
			t.Errorf("unexpected provider request, immediate posting forbidden: %s %s", r.Method, r.URL.Path)
			http.Error(w, "unexpected", 500)
		}
	}))
	t.Cleanup(server.Close)
	pin := sha256.Sum256(server.Certificate().Raw)
	return postybirb.New(server.URL, strings.Repeat("x", 32), "social", hex.EncodeToString(pin[:]))
}
func TestBlueskyApprovalIntegration(t *testing.T) {
	db := testDB(t)
	var calls atomic.Int32
	var reject atomic.Bool
	provider := blueskyTestProvider(t, &calls, &reject)
	root := t.TempDir()
	due := time.Now().Add(2 * time.Hour).UTC().Truncate(time.Second)
	drafts := []postingDraft{
		{ID: "bsky-test:0", Platform: "bluesky", Mode: "plan", Text: "Reviewed post", DueAt: due.Format(time.RFC3339)},
		{ID: "bsky-test:1", Platform: "bluesky", Mode: "radar", Text: "Expired post", ExpiresAt: time.Now().Add(-time.Hour).Format(time.RFC3339)},
		{ID: "bsky-test:2", Platform: "x", Mode: "plan", Text: "Wrong platform"},
		{ID: "bsky-test:3", Platform: "bluesky", Mode: "plan", Text: "With an image"},
		{ID: "bsky-test:4", Platform: "bluesky", Mode: "plan", Text: "Uncertain"},
		{ID: "bsky-test:5", Platform: "bluesky", Mode: "plan", Text: "Duplicate"},
	}
	data, _ := json.Marshal(postingDashboard{GeneratedAt: time.Now().UTC().Format(time.RFC3339), Drafts: drafts})
	os.WriteFile(filepath.Join(root, "posting.json"), data, 0600)
	h := &Handler{DB: db, StudioRoot: root, SocialPosting: provider, BlueskyAccounts: map[string]string{"subcult": "bsky-subcult", "patrick": "bsky-offline", "clpr": "ig-only"}}
	routes := chi.NewRouter()
	routes.Post("/{id}/approve", h.ApproveBlueskyDraft)
	t.Cleanup(func() {
		db.Exec(context.Background(), `DELETE FROM bluesky_schedules WHERE draft_id LIKE 'bsky-test:%'`)
	})
	send := func(id, caption, account, original, alt string, media []byte, approved bool) *httptest.ResponseRecorder {
		var body bytes.Buffer
		form := multipart.NewWriter(&body)
		for k, v := range map[string]string{"account_id": account, "caption": caption, "original_text": original, "due_at": due.Format(time.RFC3339), "alt_text": alt, "approved": fmt.Sprint(approved)} {
			form.WriteField(k, v)
		}
		if media != nil {
			f, _ := form.CreateFormFile("media", "image.jpg")
			f.Write(media)
		}
		form.Close()
		req := httptest.NewRequest("POST", "/"+id+"/approve", &body)
		req.Header.Set("Content-Type", form.FormDataContentType())
		req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, "admin"), middleware.UserIDKey, "owner"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w
	}
	check := func(w *httptest.ResponseRecorder, code int) {
		t.Helper()
		if w.Code != code {
			t.Fatalf("want %d got %d: %s", code, w.Code, w.Body.String())
		}
	}
	check(send("bsky-test:0", "Reviewed post", "bsky-subcult", "Reviewed post", "", nil, false), 400)
	check(send("bsky-test:1", "Expired post", "bsky-subcult", "Expired post", "", nil, true), 409)
	check(send("bsky-test:2", "Wrong platform", "bsky-subcult", "Wrong platform", "", nil, true), 409)
	check(send("bsky-test:0", "Reviewed post", "bsky-subcult", "Changed source", "", nil, true), 409)
	check(send("bsky-test:0", "Reviewed post", "not-allowed", "Reviewed post", "", nil, true), 400)
	check(send("bsky-test:0", "Reviewed post", "bsky-offline", "Reviewed post", "", nil, true), 409)
	check(send("bsky-test:0", "Reviewed post", "ig-only", "Reviewed post", "", nil, true), 409)
	check(send("bsky-test:0", strings.Repeat("x", 301), "bsky-subcult", "Reviewed post", "", nil, true), 400)
	if calls.Load() != 0 {
		t.Fatal("invalid approval reached provider")
	}
	check(send("bsky-test:0", "Reviewed post", "bsky-subcult", "Reviewed post", "", nil, true), 201)
	check(send("bsky-test:0", "Reviewed post", "bsky-subcult", "Reviewed post", "", nil, true), 200)
	check(send("bsky-test:5", "Reviewed post", "bsky-subcult", "Duplicate", "", nil, true), 409)
	check(send("bsky-test:0", "Changed copy", "bsky-subcult", "Reviewed post", "", nil, true), 409)
	if calls.Load() != 1 {
		t.Fatal("duplicate approval created another provider draft")
	}
	check(send("bsky-test:3", "With an image", "bsky-subcult", "With an image", "", testJPEG(100), true), 400)
	check(send("bsky-test:3", "With an image", "bsky-subcult", "With an image", "Image description", testJPEG(100), true), 201)
	var caption, alt string
	var size int
	db.QueryRow(context.Background(), `SELECT caption,alt_text,length(media) FROM bluesky_schedules WHERE draft_id='bsky-test:3'`).Scan(&caption, &alt, &size)
	if caption != "With an image" || alt != "Image description" || size == 0 {
		t.Fatal("image approval bytes missing")
	}
	reject.Store(true)
	check(send("bsky-test:4", "Uncertain", "bsky-subcult", "Uncertain", "", nil, true), 502)
	check(send("bsky-test:4", "Uncertain", "bsky-subcult", "Uncertain", "", nil, true), 409)
	if calls.Load() != 3 {
		t.Fatal("uncertain approval resubmitted")
	}
	var status, postID string
	db.QueryRow(context.Background(), `SELECT status,provider_post_id FROM bluesky_schedules WHERE draft_id='bsky-test:4'`).Scan(&status, &postID)
	if status != "uncertain" || postID == "" {
		t.Fatal("uncertain receipt lost provider identity")
	}
	req := httptest.NewRequest("GET", "/", nil)
	req = req.WithContext(context.WithValue(req.Context(), middleware.RoleKey, "admin"))
	w := httptest.NewRecorder()
	h.BlueskyDelivery(w, req)
	check(w, 200)
	var result struct {
		Accounts []postybirb.SocialAccount `json:"accounts"`
		Receipts []blueskyReceipt          `json:"receipts"`
	}
	json.Unmarshal(w.Body.Bytes(), &result)
	if len(result.Accounts) != 2 || len(result.Receipts) != 3 {
		t.Fatal("wrong delivery account scope", w.Body.String())
	}
}
