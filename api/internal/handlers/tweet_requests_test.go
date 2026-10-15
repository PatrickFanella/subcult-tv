package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

func TestTweetRequestsIntegration(t *testing.T) {
	db := projectTestDB(t)
	ctx := context.Background()
	root := t.TempDir()
	snapshot := postingDashboard{Connected: true, GeneratedAt: time.Now().UTC().Format(time.RFC3339)}
	snapshot.Accounts = append(snapshot.Accounts, struct {
		Account   string   `json:"account"`
		Times     []string `json:"times"`
		WeeklyCap int      `json:"weekly_cap"`
	}{Account: "clpr"})
	save := func() {
		t.Helper()
		data, _ := json.Marshal(snapshot)
		if err := os.WriteFile(filepath.Join(root, "posting.json"), data, 0600); err != nil {
			t.Fatal(err)
		}
	}
	save()
	h := &Handler{DB: db, StudioRoot: root, PostingPreparationKey: strings.Repeat("k", 40)}
	routes := chi.NewRouter()
	routes.Post("/requests", h.RequestTweet)
	routes.Get("/requests", h.TweetRequests)
	routes.Post("/claim", h.ClaimTweetRequests)
	routes.Post("/finish/{id}", h.FinishTweetRequest)
	send := func(method, path, body, role, key string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(method, path, strings.NewReader(body))
		r = r.WithContext(context.WithValue(context.WithValue(r.Context(), middleware.RoleKey, role), middleware.UserIDKey, "owner"))
		if key != "" {
			r.Header.Set("Authorization", "Bearer "+key)
		}
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, r)
		return w
	}
	for _, role := range []string{"", "viewer"} {
		if w := send("POST", "/requests", `{"account":"clpr"}`, role, ""); w.Code != 403 {
			t.Fatal("role bypass", w.Code)
		}
	}
	for _, body := range []string{`{"account":"unknown"}`, `{"account":"clpr","note":"` + strings.Repeat("x", 2001) + `"}`} {
		if w := send("POST", "/requests", body, "admin", ""); w.Code != 400 {
			t.Fatal(w.Code, w.Body.String())
		}
	}
	w := send("POST", "/requests", `{"account":"clpr","note":"Playlists"}`, "admin", "")
	var job tweetRequest
	if w.Code != 201 || json.Unmarshal(w.Body.Bytes(), &job) != nil || job.Status != "pending" || job.Account != "clpr" {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := send("POST", "/requests", `{"account":"clpr"}`, "admin", ""); w.Code != 409 {
		t.Fatal("duplicate accepted", w.Code)
	}
	if w := send("POST", "/claim", "", "", ""); w.Code != 401 {
		t.Fatal("unauthed claim", w.Code)
	}
	claim := func() tweetRequest {
		t.Helper()
		w := send("POST", "/claim", "", "", h.PostingPreparationKey)
		var jobs []tweetRequest
		if w.Code != 200 || json.Unmarshal(w.Body.Bytes(), &jobs) != nil || len(jobs) != 1 {
			t.Fatal(w.Code, w.Body.String())
		}
		return jobs[0]
	}
	first := claim()
	if first.Status != "running" || first.Attempts != 1 {
		t.Fatal(first)
	}
	if w := send("POST", "/claim", "", "", h.PostingPreparationKey); w.Code != 200 || strings.TrimSpace(w.Body.String()) != "[]" {
		t.Fatal("double claim", w.Body.String())
	}
	finish := func(attempt int, draft string) *httptest.ResponseRecorder {
		body, _ := json.Marshal(map[string]any{"status": "done", "attempts": attempt, "result_draft_id": draft})
		return send("POST", fmt.Sprintf("/finish/%d", job.ID), string(body), "", h.PostingPreparationKey)
	}
	id := fmt.Sprintf("20261015T100000.000000Z-ondemand-%d:0", job.ID)
	if w := finish(1, id); w.Code != 409 {
		t.Fatal("invisible result accepted", w.Code)
	}
	snapshot.Drafts = []postingDraft{{ID: id, Account: "patrick", Platform: "x", Text: "Draft", DueAt: time.Now().Add(48 * time.Hour).Format(time.RFC3339)}}
	save()
	if w := finish(1, id); w.Code != 409 {
		t.Fatal("wrong account accepted", w.Code)
	}
	if _, err := db.Exec(ctx, `UPDATE tweet_requests SET claimed_at=NOW()-INTERVAL '3 hours' WHERE id=$1`, job.ID); err != nil {
		t.Fatal(err)
	}
	second := claim()
	if second.Attempts != 2 {
		t.Fatal(second)
	}
	snapshot.Drafts[0].Account = "clpr"
	save()
	if w := finish(1, id); w.Code != 409 {
		t.Fatal("stale attempt accepted", w.Code)
	}
	if w := finish(2, id); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := finish(2, id); w.Code != 409 {
		t.Fatal("finished twice", w.Code)
	}
	w = send("GET", "/requests", "", "admin", "")
	var listed []tweetRequest
	if json.Unmarshal(w.Body.Bytes(), &listed) != nil || len(listed) != 1 || listed[0].ResultDraftID != id || listed[0].Status != "done" {
		t.Fatal(w.Body.String())
	}
	// A fresh request is allowed after completion; exhausted leases fail visibly.
	w = send("POST", "/requests", `{"account":"clpr"}`, "admin", "")
	if w.Code != 201 {
		t.Fatal(w.Code, w.Body.String())
	}
	if _, err := db.Exec(ctx, `UPDATE tweet_requests SET status='running',attempts=3,claimed_at=NOW()-INTERVAL '3 hours' WHERE status='pending'`); err != nil {
		t.Fatal(err)
	}
	w = send("POST", "/claim", "", "", h.PostingPreparationKey)
	if w.Code != 200 || strings.TrimSpace(w.Body.String()) != "[]" {
		t.Fatal(w.Body.String())
	}
	var failed int
	if err := db.QueryRow(ctx, `SELECT COUNT(*) FROM tweet_requests WHERE status='failed'`).Scan(&failed); err != nil || failed != 1 {
		t.Fatal("exhausted request did not fail", failed, err)
	}
}
