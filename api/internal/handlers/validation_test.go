package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

func adminCtx(r *http.Request) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), middleware.RoleKey, "admin"))
}

func TestValidateContact(t *testing.T) {
	long := func(n int) string { return strings.Repeat("x", n) }
	subject := func(s string) *string { return &s }
	cases := []struct {
		name string
		req  models.CreateContactRequest
		want string
	}{
		{"ok", models.CreateContactRequest{Name: " Ada ", Email: " ada@example.com ", Message: " hi "}, ""},
		{"missing", models.CreateContactRequest{Name: "Ada", Email: "", Message: "hi"}, "Name, email and message are required."},
		{"whitespace only", models.CreateContactRequest{Name: "  ", Email: "ada@example.com", Message: "hi"}, "Name, email and message are required."},
		{"bad email", models.CreateContactRequest{Name: "Ada", Email: "not-an-email", Message: "hi"}, "Enter a valid email address."},
		{"display name", models.CreateContactRequest{Name: "Ada", Email: "Ada <ada@example.com>", Message: "hi"}, "Enter a valid email address."},
		{"bracketed", models.CreateContactRequest{Name: "Ada", Email: "<ada@example.com>", Message: "hi"}, "Enter a valid email address."},
		{"email too long", models.CreateContactRequest{Name: "Ada", Email: long(250) + "@e.com", Message: "hi"}, "Enter a valid email address."},
		{"name too long", models.CreateContactRequest{Name: long(201), Email: "ada@example.com", Message: "hi"}, "Name must be 200 characters or fewer."},
		{"subject too long", models.CreateContactRequest{Name: "Ada", Email: "ada@example.com", Subject: subject(long(301)), Message: "hi"}, "Subject must be 300 characters or fewer."},
		{"message too long", models.CreateContactRequest{Name: "Ada", Email: "ada@example.com", Message: long(10001)}, "Message must be 10,000 characters or fewer."},
		{"limits inclusive", models.CreateContactRequest{Name: long(200), Email: "ada@example.com", Subject: subject(long(300)), Message: long(10000)}, ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := tc.req
			if got := validateContact(&req); got != tc.want {
				t.Fatalf("got %q want %q", got, tc.want)
			}
			if tc.want == "" && (req.Name != strings.TrimSpace(tc.req.Name) || req.Email != strings.TrimSpace(tc.req.Email)) {
				t.Fatal("fields were not trimmed")
			}
		})
	}
	// Blank subject becomes NULL rather than an empty string.
	req := models.CreateContactRequest{Name: "Ada", Email: "ada@example.com", Subject: subject("  "), Message: "hi"}
	if validateContact(&req) != "" || req.Subject != nil {
		t.Fatal("blank subject should be dropped")
	}
}

// TestSubmitContactRejectsInvalidInputBeforeDB: validation runs before any
// database access, so a nil DB proves the 400 path.
func TestSubmitContactRejectsInvalidInputBeforeDB(t *testing.T) {
	h := &Handler{}
	for _, body := range []models.CreateContactRequest{
		{Name: "Ada", Email: "nope", Message: "hi"},
		{Name: strings.Repeat("n", 201), Email: "ada@example.com", Message: "hi"},
		{Name: "Ada", Email: "ada@example.com", Message: strings.Repeat("m", 10001)},
	} {
		rec := httptest.NewRecorder()
		h.SubmitContact(rec, newJSONRequest(t, "POST", "/", body))
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("got %d: %s", rec.Code, rec.Body.String())
		}
	}
}

func TestValidPostDate(t *testing.T) {
	for value, want := range map[string]bool{"2026-11-02": true, "": false, "2026-13-01": false, "11/02/2026": false, "2026-11-02T00:00:00Z": false, "yesterday": false} {
		if got := validPostDate(value); got != want {
			t.Errorf("validPostDate(%q) = %v want %v", value, got, want)
		}
	}
}

func TestCreateAndUpdatePostRequireDate(t *testing.T) {
	h := &Handler{}
	for _, date := range []string{"", "not-a-date"} {
		rec := httptest.NewRecorder()
		h.CreatePost(rec, adminCtx(newJSONRequest(t, "POST", "/", models.CreatePostRequest{Slug: "s", Title: "T", Date: date})))
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("create date %q: got %d %s", date, rec.Code, rec.Body.String())
		}
	}
}

func TestValidateProjectRequest(t *testing.T) {
	base := models.CreateProjectRequest{Slug: "s", Name: "N", Type: []string{"software"}, Status: "active"}
	if msg := validateProjectRequest(base); msg != "" {
		t.Fatalf("valid request refused: %s", msg)
	}
	bad := base
	bad.Status = "live"
	if validateProjectRequest(bad) == "" {
		t.Fatal("unknown status accepted")
	}
	bad = base
	bad.Type = []string{"software", "hardware"}
	if validateProjectRequest(bad) == "" {
		t.Fatal("unknown type accepted")
	}
	bad = base
	bad.Type = nil
	if validateProjectRequest(bad) == "" {
		t.Fatal("empty type accepted")
	}
	for _, status := range []string{"active", "incubating", "archived"} {
		ok := base
		ok.Status = status
		if validateProjectRequest(ok) != "" {
			t.Fatalf("status %s refused", status)
		}
	}
}

func TestCreateProjectRejectsUnknownStatusAndType(t *testing.T) {
	h := &Handler{}
	for _, req := range []models.CreateProjectRequest{
		{Slug: "s", Name: "N", Type: []string{"software"}, Status: "beta"},
		{Slug: "s", Name: "N", Type: []string{"podcast"}, Status: "active"},
	} {
		rec := httptest.NewRecorder()
		h.CreateProject(rec, newJSONRequest(t, "POST", "/", req))
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("got %d %s", rec.Code, rec.Body.String())
		}
		rec = httptest.NewRecorder()
		h.UpdateProject(rec, newJSONRequest(t, "PUT", "/", req))
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("update got %d %s", rec.Code, rec.Body.String())
		}
	}
}
