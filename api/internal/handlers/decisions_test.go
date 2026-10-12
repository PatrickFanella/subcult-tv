package handlers

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"image"
	"image/jpeg"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

func TestDiffStatsAndImageChoice(t *testing.T) {
	stats := diffStats("We shipped the clip stack today", "We shipped the new clip stack")
	if stats["words_added"] != 1 || stats["words_removed"] != 1 || stats["changed"] != true || stats["final_chars"] != 29 {
		t.Fatalf("diff stats: %v", stats)
	}
	if same := diffStats("Same text ", "Same text"); same["changed"] != false {
		t.Fatal("whitespace counted as an edit")
	}
	prepared, candidate := []byte("prepared"), []byte("candidate")
	hash := func(b []byte) string { s := sha256.Sum256(b); return hex.EncodeToString(s[:]) }
	draft := postingDraft{Media: postingMedia{Image: &postingImage{SHA256: hash(prepared)}, Candidates: []postingImage{{SHA256: hash(candidate)}}}}
	for media, want := range map[string]string{"prepared": "prepared", "candidate": "candidate", "other": "uploaded", "": "none"} {
		if got := imageChoice(draft, []byte(media)); got != want {
			t.Fatalf("%q: %s", media, got)
		}
	}
	if cleaned := string(cleanChecklist([]checklistItem{{Item: " Check ", Checked: true}, {Item: ""}})); cleaned != `[{"item":"Check","checked":true}]` {
		t.Fatal(cleaned)
	}
}

func TestDecisionValidationNeedsNoDatabase(t *testing.T) {
	root := t.TempDir()
	writeSnapshot(t, root, []postingDraft{{ID: "plan:0", Mode: "plan", Text: "Post"}})
	h := &Handler{StudioRoot: root}
	routes := chi.NewRouter()
	routes.Post("/{id}/decision", h.RecordDraftDecision)
	routes.Get("/decisions", h.DraftDecisions)
	call := func(role, method, path, body string) int {
		req := httptest.NewRequest(method, path, strings.NewReader(body))
		req = req.WithContext(context.WithValue(req.Context(), middleware.RoleKey, role))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w.Code
	}
	for body, want := range map[string]int{
		`{"decision":"rejected"}`:                                      400,
		`{"decision":"rejected","reasons":["rude"]}`:                   400,
		`{"decision":"revision_requested"}`:                            400,
		`{"decision":"snoozed","snooze_until":"2020-01-01T00:00:00Z"}`: 400,
		`{"decision":"approved_as_is"}`:                                400,
		`{"decision":"rejected","reasons":["boring"]}`:                 503,
		`{"decision":"favorited"}`:                                     503,
	} {
		if got := call("admin", "POST", "/plan%3A0/decision", body); got != want {
			t.Fatalf("%s: %d", body, got)
		}
	}
	if got := call("admin", "POST", "/missing/decision", `{"decision":"rejected","note":"x"}`); got != 404 {
		t.Fatalf("unknown draft: %d", got)
	}
	if got := call("editor", "POST", "/plan%3A0/decision", `{"decision":"rejected","note":"x"}`); got != 403 {
		t.Fatalf("non-admin: %d", got)
	}
	if got := call("admin", "GET", "/decisions?since=yesterday", ""); got != 400 {
		t.Fatalf("bad since: %d", got)
	}
	if got := call("editor", "GET", "/decisions", ""); got != 403 {
		t.Fatalf("non-admin read: %d", got)
	}
	h.PostingPreparationKey = strings.Repeat("k", 32)
	routes.Get("/feedback", h.PreparationFeedback)
	for auth, want := range map[string]int{"": 401, "Bearer wrong": 401, "Bearer " + h.PostingPreparationKey: 503} {
		req := httptest.NewRequest("GET", "/feedback", nil)
		req.Header.Set("Authorization", auth)
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		if w.Code != want {
			t.Fatalf("feedback with %q: %d", auth, w.Code)
		}
	}
}

func TestDraftDecisionsIntegration(t *testing.T) {
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
	client := socialTestProvider(t, &submissions, nil, "decision-post")
	var preparedJPEG bytes.Buffer
	jpeg.Encode(&preparedJPEG, image.NewRGBA(image.Rect(0, 0, 400, 500)), nil)
	sum := sha256.Sum256(preparedJPEG.Bytes())
	root := t.TempDir()
	due := time.Now().Add(72 * time.Hour).UTC().Format(time.RFC3339)
	ig := postingDraft{ID: "decision-test-cm:0", Mode: "changemaker", Account: "patrick", Text: "Prepared caption", DueAt: due, ExpiresAt: due, Media: postingMedia{Image: &postingImage{SHA256: hex.EncodeToString(sum[:])}}}
	x := postingDraft{ID: "decision-test-plan:0", Mode: "plan", Account: "clpr", Text: "An X post", DueAt: due}
	writeSnapshot(t, root, []postingDraft{ig, x})
	h := &Handler{DB: db, StudioRoot: root, SocialPosting: client, SocialAccounts: []string{"patrick"}, PostingMediaBaseURL: "https://example.test", PostingPreparationKey: strings.Repeat("k", 32)}
	routes := chi.NewRouter()
	routes.Put("/{id}", h.SaveReviewDraft)
	routes.Post("/{id}/approve", h.ApproveReviewDraft)
	routes.Post("/{id}/decision", h.RecordDraftDecision)
	routes.Get("/decisions", h.DraftDecisions)
	routes.Get("/feedback", h.PreparationFeedback)
	defer db.Exec(ctx, `DELETE FROM draft_decisions WHERE draft_id LIKE 'decision-test-%'`)
	defer db.Exec(ctx, `DELETE FROM social_review_drafts WHERE draft_id LIKE 'decision-test-%'`)
	defer db.Exec(ctx, `DELETE FROM social_schedules WHERE provider_post_id='decision-post'`)
	call := func(method, path string, body *bytes.Buffer, contentType string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(method, path, body)
		req.Header.Set("Content-Type", contentType)
		req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, "admin"), middleware.UserIDKey, "owner"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w
	}
	start := time.Now().Add(-time.Second).UTC().Format(time.RFC3339)
	if w := call("POST", "/decision-test-plan%3A0/decision", bytes.NewBufferString(`{"decision":"rejected","reasons":["off_voice","duplicate"],"note":"Sounds like an ad"}`), "application/json"); w.Code != 201 {
		t.Fatal(w.Code, w.Body.String())
	}
	save := func(version int, caption string) *httptest.ResponseRecorder {
		var payload bytes.Buffer
		form := multipart.NewWriter(&payload)
		for k, v := range map[string]string{"version": strconv.Itoa(version), "caption": caption, "account_id": "patrick", "due_at": time.Now().Add(50 * time.Hour).Format(time.RFC3339)} {
			form.WriteField(k, v)
		}
		part, _ := form.CreateFormFile("media", "prepared.jpg")
		part.Write(preparedJPEG.Bytes())
		form.Close()
		return call("PUT", "/decision-test-cm%3A0", &payload, form.FormDataContentType())
	}
	if w := save(0, "First edit"); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := save(1, "Second edit of the caption"); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	var original, choice string
	db.QueryRow(ctx, `SELECT original_caption,image_choice FROM social_review_drafts WHERE draft_id='decision-test-cm:0'`).Scan(&original, &choice)
	if original != "Prepared caption" || choice != "prepared" {
		t.Fatalf("original %q choice %q", original, choice)
	}
	if w := call("POST", "/decision-test-cm%3A0/approve", bytes.NewBufferString(`{"approved":true,"version":2,"checklist":[{"item":"Check the mark","checked":true}]}`), "application/json"); w.Code != 201 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := call("POST", "/decision-test-cm%3A0/decision", bytes.NewBufferString(`{"decision":"snoozed","snooze_until":"`+time.Now().Add(time.Hour).Format(time.RFC3339)+`"}`), "application/json"); w.Code != 409 {
		t.Fatal("submitted draft snoozed", w.Code)
	}
	if w := call("POST", "/decision-test-cm%3A0/decision", bytes.NewBufferString(`{"decision":"favorited","note":"More like this"}`), "application/json"); w.Code != 201 {
		t.Fatal("submitted draft marked good", w.Code, w.Body.String())
	}
	if w := call("POST", "/decision-test-plan%3A0/decision", bytes.NewBufferString(`{"decision":"snoozed","snooze_until":"`+time.Now().Add(time.Hour).Format(time.RFC3339)+`"}`), "application/json"); w.Code != 201 {
		t.Fatal("snooze", w.Code, w.Body.String())
	}
	w := call("GET", "/decisions?since="+start, &bytes.Buffer{}, "")
	var decisions []draftDecision
	if w.Code != 200 || json.Unmarshal(w.Body.Bytes(), &decisions) != nil || len(decisions) != 4 {
		t.Fatal(w.Code, w.Body.String())
	}
	rejected, approved := decisions[0], decisions[1]
	if rejected.Decision != "rejected" || rejected.Platform != "x" || strings.Join(rejected.ReasonCodes, ",") != "off_voice,duplicate" || rejected.Note != "Sounds like an ad" {
		t.Fatalf("rejection: %+v", rejected)
	}
	if approved.Decision != "approved_edited" || approved.OriginalText != "Prepared caption" || approved.FinalText != "Second edit of the caption" || approved.ImageChoice != "prepared" || approved.FinalDueAt == nil || approved.OriginalDueAt == nil || approved.DecidedBy != "owner" {
		t.Fatalf("approval: %+v", approved)
	}
	if !strings.Contains(string(approved.Checklist), "Check the mark") || !strings.Contains(string(approved.DiffStats), `"words_added"`) {
		t.Fatalf("approval details: %s %s", approved.Checklist, approved.DiffStats)
	}
	if favorite := decisions[2]; favorite.Decision != "favorited" || favorite.Note != "More like this" || favorite.Platform != "instagram" {
		t.Fatalf("favorite: %+v", favorite)
	}
	req := httptest.NewRequest("GET", "/feedback?since="+start, nil)
	req.Header.Set("Authorization", "Bearer "+h.PostingPreparationKey)
	fw := httptest.NewRecorder()
	routes.ServeHTTP(fw, req)
	var feedback struct {
		Decisions []draftDecision  `json:"decisions"`
		Rerolls   []feedbackReroll `json:"rerolls"`
	}
	if fw.Code != 200 || json.Unmarshal(fw.Body.Bytes(), &feedback) != nil || len(feedback.Decisions) != 3 || feedback.Rerolls == nil {
		t.Fatal(fw.Code, fw.Body.String())
	}
	for _, d := range feedback.Decisions {
		if d.Decision == "snoozed" || d.DecidedBy != "" {
			t.Fatalf("feedback leaked a snooze or user: %+v", d)
		}
	}
}
