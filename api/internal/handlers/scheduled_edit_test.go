package handlers

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
)

// fakeSubmission is one PostyBirb submission held by statefulProvider.
type fakeSubmission struct {
	caption   any
	account   string
	scheduled bool
	due       string
	posted    bool
}

// statefulProvider is a small PostyBirb stand-in that tracks several
// submissions, so edits can be checked against what would actually post.
type statefulProvider struct {
	mu      sync.Mutex
	next    int
	subs    map[string]*fakeSubmission
	deleted []string
	// invalid makes PostyBirb's validation report an error, as for a logged-out account.
	invalid bool
}

func (p *statefulProvider) live() []*fakeSubmission {
	p.mu.Lock()
	defer p.mu.Unlock()
	var out []*fakeSubmission
	for _, s := range p.subs {
		if s.scheduled && !s.posted {
			out = append(out, s)
		}
	}
	return out
}

func newStatefulProvider(t *testing.T) (*statefulProvider, *postybirb.Client) {
	t.Helper()
	p := &statefulProvider{subs: map[string]*fakeSubmission{}}
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p.mu.Lock()
		defer p.mu.Unlock()
		id := strings.TrimPrefix(r.URL.Path, "/submissions/")
		switch {
		case r.Method == "GET" && r.URL.Path == "/account":
			w.Write([]byte(`[{"id":"patrick","name":"Patrick","website":"instagram","state":{"status":"loggedIn","isLoggedIn":true}}]`))
		case r.Method == "GET" && strings.HasPrefix(r.URL.Path, "/website-option/validate/"):
			if p.invalid {
				w.Write([]byte(`[{"account":{"id":"patrick"},"errors":["logged out"]}]`))
				return
			}
			w.Write([]byte(`[{"account":{"id":"patrick"},"errors":[]}]`))
		case r.Method == "POST" && r.URL.Path == "/submissions":
			p.next++
			id := fmt.Sprintf("post-%d", p.next)
			p.subs[id] = &fakeSubmission{}
			json.NewEncoder(w).Encode([]map[string]string{{"id": id}})
		case r.Method == "POST" && r.URL.Path == "/website-option":
			var body struct {
				AccountID    string `json:"accountId"`
				SubmissionID string `json:"submissionId"`
				Data         struct {
					Description struct {
						Description any `json:"description"`
					} `json:"description"`
				} `json:"data"`
			}
			json.NewDecoder(r.Body).Decode(&body)
			if s := p.subs[body.SubmissionID]; s != nil && body.AccountID != "NULL_ACCOUNT" {
				s.account, s.caption = body.AccountID, body.Data.Description.Description
			}
		case r.Method == "PATCH" && p.subs[id] != nil:
			var body struct {
				Type string `json:"scheduleType"`
				Due  string `json:"scheduledFor"`
			}
			json.NewDecoder(r.Body).Decode(&body)
			s := p.subs[id]
			if s.posted {
				http.Error(w, "posting", 400)
				return
			}
			if body.Type == "NONE" {
				s.scheduled, s.due = false, ""
			} else {
				s.scheduled, s.due = true, body.Due
			}
		case r.Method == "DELETE" && r.URL.Path == "/submissions":
			for _, id := range r.URL.Query()["ids"] {
				delete(p.subs, id)
				p.deleted = append(p.deleted, id)
			}
		case r.Method == "GET" && p.subs[id] != nil:
			s := p.subs[id]
			schedule := map[string]string{"scheduleType": "NONE"}
			if s.scheduled {
				schedule = map[string]string{"scheduleType": "SINGLE", "scheduledFor": s.due}
			}
			var post any
			if s.posted {
				post = map[string]any{"unitsOfWork": []any{}}
			}
			json.NewEncoder(w).Encode(map[string]any{"id": id, "isScheduled": s.scheduled, "schedule": schedule, "post": post,
				"files":   []any{map[string]string{"id": "jpeg"}},
				"options": []any{map[string]any{"accountId": s.account, "isDefault": false, "data": map[string]any{"description": map[string]any{"description": s.caption}}}}})
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(server.Close)
	pin := sha256.Sum256(server.Certificate().Raw)
	return p, postybirb.New(server.URL, strings.Repeat("x", 32), "instagram", hex.EncodeToString(pin[:]))
}

func testDB(t *testing.T) *pgxpool.Pool {
	t.Helper()
	connection := os.Getenv("TEST_SOCIAL_DATABASE_URL")
	if connection == "" {
		t.Skip("requires isolated TEST_SOCIAL_DATABASE_URL")
	}
	ctx := context.Background()
	db, err := database.Connect(ctx, connection)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(db.Close)
	if err = database.Migrate(ctx, db); err != nil {
		t.Fatal(err)
	}
	return db
}

func testJPEG(width int) []byte {
	var out bytes.Buffer
	jpeg.Encode(&out, image.NewRGBA(image.Rect(0, 0, width, width)), nil)
	return out.Bytes()
}

func TestEditScheduledDraftIntegration(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	provider, client := newStatefulProvider(t)
	const draftID = "20261006T092000.000000Z-changemaker:0"
	const path = "/20261006T092000.000000Z-changemaker%3A0"
	root := t.TempDir()
	snapshot := postingDashboard{GeneratedAt: time.Now().UTC().Format(time.RFC3339), Drafts: []postingDraft{{ID: draftID, Mode: "changemaker", Text: "Prepared", DueAt: time.Now().Add(72 * time.Hour).Format(time.RFC3339)}}}
	data, _ := json.Marshal(snapshot)
	os.WriteFile(filepath.Join(root, "posting.json"), data, 0600)
	h := &Handler{DB: db, StudioRoot: root, SocialPosting: client, SocialAccounts: []string{"patrick"}}
	routes := chi.NewRouter()
	routes.Put("/{id}", h.SaveReviewDraft)
	routes.Post("/{id}/approve", h.ApproveReviewDraft)
	routes.Put("/{id}/schedule", h.EditScheduledDraft)
	t.Cleanup(func() {
		db.Exec(ctx, `DELETE FROM social_schedules WHERE request_id=(SELECT request_id FROM social_review_drafts WHERE draft_id=$1)`, draftID)
		db.Exec(ctx, `DELETE FROM social_review_drafts WHERE draft_id=$1`, draftID)
		db.Exec(ctx, `DELETE FROM draft_decisions WHERE draft_id=$1`, draftID)
	})
	send := func(method, target string, fields map[string]string, media []byte) *httptest.ResponseRecorder {
		var payload bytes.Buffer
		form := multipart.NewWriter(&payload)
		for k, v := range fields {
			form.WriteField(k, v)
		}
		if media != nil {
			part, _ := form.CreateFormFile("media", "image.jpg")
			part.Write(media)
		}
		form.Close()
		req := httptest.NewRequest(method, target, &payload)
		req.Header.Set("Content-Type", form.FormDataContentType())
		req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, "admin"), middleware.UserIDKey, "owner"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w
	}
	first := time.Now().Add(48 * time.Hour).UTC().Truncate(time.Second)
	if w := send("PUT", path, map[string]string{"version": "0", "caption": "Queued caption", "account_id": "patrick", "due_at": first.Format(time.RFC3339)}, testJPEG(400)); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	req := httptest.NewRequest("POST", path+"/approve", bytes.NewBufferString(`{"approved":true,"version":1}`))
	req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, "admin"), middleware.UserIDKey, "owner"))
	w := httptest.NewRecorder()
	routes.ServeHTTP(w, req)
	if w.Code != 201 {
		t.Fatal(w.Code, w.Body.String())
	}
	edit := func(version int, caption string, due time.Time, media []byte) *httptest.ResponseRecorder {
		return send("PUT", path+"/schedule", map[string]string{"version": strconv.Itoa(version), "caption": caption, "account_id": "patrick", "due_at": due.Format(time.RFC3339)}, media)
	}
	receipt := func() (status, id, caption string, due time.Time) {
		db.QueryRow(ctx, `SELECT s.status,s.provider_post_id,s.caption,s.due_at FROM social_schedules s JOIN social_review_drafts d USING(request_id) WHERE d.draft_id=$1`, draftID).Scan(&status, &id, &caption, &due)
		return
	}

	// A time-only change moves the same submission.
	moved := time.Now().Add(96 * time.Hour).UTC().Truncate(time.Second)
	if w := edit(5, "Queued caption", moved, nil); w.Code != 409 {
		t.Fatal("stale version edited", w.Code)
	}
	if w := edit(1, "Queued caption", moved, nil); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	status, id, _, due := receipt()
	if status != "scheduled" || id != "post-1" || !due.Equal(moved) {
		t.Fatal("reschedule not recorded", status, id, due)
	}
	if live := provider.live(); len(live) != 1 || live[0].due != moved.Format(time.RFC3339) {
		t.Fatal("provider not rescheduled")
	}

	// A caption change withdraws and replaces it: exactly one post stays queued.
	if w := edit(2, "Rewritten caption", moved, testJPEG(500)); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	status, id, caption, _ := receipt()
	if status != "scheduled" || id != "post-2" || caption != "Rewritten caption" {
		t.Fatal("replacement not recorded", status, id, caption)
	}
	live := provider.live()
	want, _ := json.Marshal(map[string]any{"type": "doc", "content": []any{map[string]any{"type": "paragraph", "content": []any{map[string]any{"type": "text", "text": "Rewritten caption"}}}}})
	got, _ := json.Marshal(live[0].caption)
	if len(live) != 1 || !bytes.Equal(got, want) || len(provider.deleted) != 1 || provider.deleted[0] != "post-1" {
		t.Fatal("old submission still queued or replacement caption wrong", len(live), string(got), provider.deleted)
	}
	var reviewCaption string
	var version int
	db.QueryRow(ctx, `SELECT caption,version FROM social_review_drafts WHERE draft_id=$1`, draftID).Scan(&reviewCaption, &version)
	if reviewCaption != "Rewritten caption" || version != 3 {
		t.Fatal("review draft not updated", reviewCaption, version)
	}

	// A replacement PostyBirb rejects is discarded and the queued post stays put.
	provider.mu.Lock()
	provider.invalid = true
	provider.mu.Unlock()
	if w := edit(3, "Rejected rewrite", moved, nil); w.Code != 502 {
		t.Fatal("invalid replacement accepted", w.Code, w.Body.String())
	}
	if status, id, caption, _ := receipt(); status != "scheduled" || id != "post-2" || caption != "Rewritten caption" {
		t.Fatal("receipt changed after rejected replacement", status, id, caption)
	}
	if live := provider.live(); len(live) != 1 || provider.subs["post-3"] != nil {
		t.Fatal("rejected replacement left behind or original withdrawn", len(live))
	}
	provider.mu.Lock()
	provider.invalid = false
	provider.mu.Unlock()

	// An edit from a tab that missed the last change is refused.
	if w := edit(2, "Older tab", moved, nil); w.Code != 409 {
		t.Fatal("stale tab edited", w.Code)
	}

	// Once PostyBirb starts posting, nothing is changed and the receipt stays scheduled.
	provider.mu.Lock()
	provider.subs["post-2"].posted = true
	provider.mu.Unlock()
	if w := edit(3, "Too late", moved, nil); w.Code != 409 {
		t.Fatal("posting submission edited", w.Code, w.Body.String())
	}
	if status, id, caption, _ := receipt(); status != "scheduled" || id != "post-2" || caption != "Rewritten caption" {
		t.Fatal("receipt changed after refused edit", status, id, caption)
	}
}
