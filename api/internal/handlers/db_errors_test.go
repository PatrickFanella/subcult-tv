package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/subculture-collective/subcult-tv/api/internal/brevo"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

func withID(r *http.Request, id string) *http.Request {
	route := chi.NewRouteContext()
	route.URLParams.Add("id", id)
	return r.WithContext(context.WithValue(r.Context(), chi.RouteCtxKey, route))
}

func errorMessage(t *testing.T, rec *httptest.ResponseRecorder) string {
	t.Helper()
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("non-JSON body: %s", rec.Body.String())
	}
	msg, _ := body["error"].(string)
	return msg
}

// TestAdminWritesDoNotLeakDriverErrors drives the real PostgreSQL error paths.
func TestAdminWritesDoNotLeakDriverErrors(t *testing.T) {
	db := projectTestDB(t)
	h := &Handler{DB: db}
	post := models.CreatePostRequest{Slug: "dup", Title: "Dup", Date: "2026-11-02"}
	rec := httptest.NewRecorder()
	h.CreatePost(rec, adminCtx(newJSONRequest(t, "POST", "/", post)))
	if rec.Code != 201 {
		t.Fatalf("first create: %d %s", rec.Code, rec.Body.String())
	}
	rec = httptest.NewRecorder()
	h.CreatePost(rec, adminCtx(newJSONRequest(t, "POST", "/", post)))
	if rec.Code != 409 || strings.Contains(errorMessage(t, rec), "duplicate key") {
		t.Fatalf("duplicate slug: %d %s", rec.Code, rec.Body.String())
	}
	// A malformed UUID in the path is a client error, not a 503/500.
	rec = httptest.NewRecorder()
	h.UpdatePost(rec, adminCtx(withID(newJSONRequest(t, "PUT", "/", post), "not-a-uuid")))
	if rec.Code != 400 || strings.Contains(errorMessage(t, rec), "uuid") {
		t.Fatalf("bad uuid: %d %s", rec.Code, rec.Body.String())
	}
	// A well-formed unknown ID is 404.
	rec = httptest.NewRecorder()
	h.UpdatePost(rec, adminCtx(withID(newJSONRequest(t, "PUT", "/", post), uuid.NewString())))
	if rec.Code != 404 {
		t.Fatalf("unknown post: %d %s", rec.Code, rec.Body.String())
	}

	project := models.CreateProjectRequest{Slug: "dup-project", Name: "Dup", Type: []string{"software"}, Status: "active", CoverPattern: "grid"}
	rec = httptest.NewRecorder()
	h.CreateProject(rec, newJSONRequest(t, "POST", "/", project))
	if rec.Code != 201 {
		t.Fatalf("first project: %d %s", rec.Code, rec.Body.String())
	}
	rec = httptest.NewRecorder()
	h.CreateProject(rec, newJSONRequest(t, "POST", "/", project))
	if rec.Code != 409 || strings.Contains(errorMessage(t, rec), "duplicate key") {
		t.Fatalf("duplicate project: %d %s", rec.Code, rec.Body.String())
	}
	rec = httptest.NewRecorder()
	h.UpdateProject(rec, withID(newJSONRequest(t, "PUT", "/", project), uuid.NewString()))
	if rec.Code != 404 {
		t.Fatalf("unknown project: %d %s", rec.Code, rec.Body.String())
	}
	rec = httptest.NewRecorder()
	h.UpdateProject(rec, withID(newJSONRequest(t, "PUT", "/", project), "zzz"))
	if rec.Code != 400 {
		t.Fatalf("bad project uuid: %d %s", rec.Code, rec.Body.String())
	}

	// Unpublishing a project that has no publication is 404, like DeleteProject.
	rec = httptest.NewRecorder()
	req := withID(httptest.NewRequest("DELETE", "/", nil), uuid.NewString())
	req = req.WithContext(context.WithValue(req.Context(), middleware.RoleKey, "admin"))
	h.UnpublishProject(rec, req)
	if rec.Code != 404 {
		t.Fatalf("unpublish missing: %d %s", rec.Code, rec.Body.String())
	}

	// Contact overflow is refused before the varchar limit can produce a 500.
	rec = httptest.NewRecorder()
	h.SubmitContact(rec, newJSONRequest(t, "POST", "/", models.CreateContactRequest{Name: strings.Repeat("n", 201), Email: "ada@example.com", Message: "hi"}))
	if rec.Code != 400 {
		t.Fatalf("contact overflow: %d %s", rec.Code, rec.Body.String())
	}
	rec = httptest.NewRecorder()
	h.SubmitContact(rec, newJSONRequest(t, "POST", "/", models.CreateContactRequest{Name: " Ada ", Email: "ada@example.com", Message: "Hello"}))
	if rec.Code != 201 {
		t.Fatalf("valid contact: %d %s", rec.Code, rec.Body.String())
	}

	// An unknown username is refused without a panic on the dummy compare.
	rec = httptest.NewRecorder()
	h.Login(rec, newJSONRequest(t, "POST", "/", models.LoginRequest{Username: "nobody", Password: "secret"}))
	if rec.Code != 401 {
		t.Fatalf("unknown user login: %d %s", rec.Code, rec.Body.String())
	}
}

type countingMailer struct {
	fakeMailer
	optIns atomic.Int32
}

func (c *countingMailer) RequestDoubleOptIn(context.Context, string) error {
	c.optIns.Add(1)
	return nil
}

// TestSubscribeDoesNotResendConfirmationToActiveSubscriber keeps the
// double opt-in flow for new, unconfirmed and unsubscribed rows only.
func TestSubscribeDoesNotResendConfirmationToActiveSubscriber(t *testing.T) {
	db := projectTestDB(t)
	mailer := &countingMailer{fakeMailer: fakeMailer{sent: make(chan brevo.Email, 1)}}
	h := &Handler{DB: db, Mail: mailer}
	subscribe := func() *httptest.ResponseRecorder {
		rec := httptest.NewRecorder()
		h.Subscribe(rec, newJSONRequest(t, "POST", "/", models.SubscribeRequest{Email: "Ada@Example.com"}))
		return rec
	}
	ctx := context.Background()
	// New address: confirmation requested, row unconfirmed.
	if rec := subscribe(); rec.Code != 201 {
		t.Fatalf("first subscribe: %d %s", rec.Code, rec.Body.String())
	}
	if mailer.optIns.Load() != 1 {
		t.Fatalf("expected 1 opt-in email, got %d", mailer.optIns.Load())
	}
	// Still unconfirmed: another confirmation is allowed.
	first := subscribe()
	if mailer.optIns.Load() != 2 {
		t.Fatalf("unconfirmed resend blocked: %d", mailer.optIns.Load())
	}
	// Confirmed and active: same reply, no new email.
	if _, err := db.Exec(ctx, `UPDATE subscribers SET confirmed=TRUE WHERE email='ada@example.com'`); err != nil {
		t.Fatal(err)
	}
	again := subscribe()
	if again.Code != 201 || again.Body.String() != first.Body.String() {
		t.Fatalf("confirmed reply differs: %d %s vs %s", again.Code, again.Body.String(), first.Body.String())
	}
	if mailer.optIns.Load() != 2 {
		t.Fatalf("confirmed subscriber was emailed again: %d", mailer.optIns.Load())
	}
	// Unsubscribed: opt-in resumes.
	if _, err := db.Exec(ctx, `UPDATE subscribers SET unsubscribed_at=NOW() WHERE email='ada@example.com'`); err != nil {
		t.Fatal(err)
	}
	subscribe()
	if mailer.optIns.Load() != 3 {
		t.Fatalf("unsubscribed address did not get a confirmation: %d", mailer.optIns.Load())
	}
	var active bool
	db.QueryRow(ctx, `SELECT unsubscribed_at IS NULL FROM subscribers WHERE email='ada@example.com'`).Scan(&active)
	if !active {
		t.Fatal("resubscribe did not reactivate the row")
	}
}
