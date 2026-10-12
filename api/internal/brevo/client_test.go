package brevo

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type captured struct {
	path   string
	apiKey string
	body   map[string]any
}

func testClient(t *testing.T, status int) (*Client, *captured) {
	t.Helper()
	got := &captured{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got.path = r.URL.Path
		got.apiKey = r.Header.Get("api-key")
		_ = json.NewDecoder(r.Body).Decode(&got.body)
		w.WriteHeader(status)
		_, _ = w.Write([]byte(`{"message":"rejected"}`))
	}))
	t.Cleanup(srv.Close)
	c := New("test-key", Newsletter{ListID: 7, TemplateID: 3, RedirectURL: "https://subcult.tv/newsletter/confirmed"})
	c.baseURL = srv.URL
	return c, got
}

func TestNewWithoutKeyIsDisabled(t *testing.T) {
	c := New("", Newsletter{ListID: 1, TemplateID: 1, RedirectURL: "https://example.test"})
	if c != nil {
		t.Fatal("expected nil client without an API key")
	}
	if c.NewsletterEnabled() {
		t.Fatal("nil client must report newsletter disabled")
	}
}

func TestNewsletterEnabledNeedsListTemplateAndRedirect(t *testing.T) {
	if New("k", Newsletter{ListID: 7}).NewsletterEnabled() {
		t.Fatal("newsletter should be disabled without a template and redirect")
	}
	if !New("k", Newsletter{ListID: 7, TemplateID: 3, RedirectURL: "https://x.test"}).NewsletterEnabled() {
		t.Fatal("newsletter should be enabled when fully configured")
	}
}

func TestSendEmail(t *testing.T) {
	c, got := testClient(t, http.StatusCreated)
	err := c.SendEmail(context.Background(), Email{
		Sender:      Address{Name: "SUBCULT.TV", Email: "noreply@subcult.tv"},
		To:          []Address{{Email: "info@subcult.tv"}},
		ReplyTo:     &Address{Name: "Ada", Email: "ada@example.com"},
		Subject:     "Hello",
		TextContent: "Body",
	})
	if err != nil {
		t.Fatalf("SendEmail: %v", err)
	}
	if got.path != "/smtp/email" || got.apiKey != "test-key" {
		t.Fatalf("unexpected request: path=%q key=%q", got.path, got.apiKey)
	}
	if got.body["subject"] != "Hello" || got.body["replyTo"].(map[string]any)["email"] != "ada@example.com" {
		t.Fatalf("unexpected payload: %v", got.body)
	}
}

func TestRequestDoubleOptIn(t *testing.T) {
	c, got := testClient(t, http.StatusCreated)
	if err := c.RequestDoubleOptIn(context.Background(), "ada@example.com"); err != nil {
		t.Fatalf("RequestDoubleOptIn: %v", err)
	}
	if got.path != "/contacts/doubleOptinConfirmation" {
		t.Fatalf("unexpected path %q", got.path)
	}
	lists := got.body["includeListIds"].([]any)
	if got.body["email"] != "ada@example.com" || len(lists) != 1 || lists[0] != float64(7) ||
		got.body["templateId"] != float64(3) || got.body["redirectionUrl"] != "https://subcult.tv/newsletter/confirmed" {
		t.Fatalf("unexpected payload: %v", got.body)
	}
}

func TestRemoveFromNewsletter(t *testing.T) {
	c, got := testClient(t, http.StatusCreated)
	if err := c.RemoveFromNewsletter(context.Background(), "ada@example.com"); err != nil {
		t.Fatalf("RemoveFromNewsletter: %v", err)
	}
	if got.path != "/contacts/lists/7/contacts/remove" {
		t.Fatalf("unexpected path %q", got.path)
	}
}

func TestErrorIncludesStatusAndDetail(t *testing.T) {
	c, _ := testClient(t, http.StatusBadRequest)
	err := c.SendEmail(context.Background(), Email{})
	if err == nil || !strings.Contains(err.Error(), "HTTP 400") || !strings.Contains(err.Error(), "rejected") {
		t.Fatalf("expected HTTP 400 error with detail, got %v", err)
	}
}

func TestNewsletterMembersSkipsListUnsubscribes(t *testing.T) {
	var path string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
		_, _ = w.Write([]byte(`{"count":2,"contacts":[{"email":"Ada@Example.com","listUnsubscribed":[]},{"email":"gone@example.com","listUnsubscribed":[7]}]}`))
	}))
	t.Cleanup(srv.Close)
	c := New("test-key", Newsletter{ListID: 7, TemplateID: 3, RedirectURL: "https://subcult.tv/x"})
	c.baseURL = srv.URL
	members, err := c.NewsletterMembers(context.Background())
	if err != nil {
		t.Fatalf("NewsletterMembers: %v", err)
	}
	if path != "/contacts/lists/7/contacts" || len(members) != 1 || members[0] != "ada@example.com" {
		t.Fatalf("path %q members %v", path, members)
	}
}
