package handlers

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/subculture-collective/subcult-tv/api/internal/brevo"
	"github.com/subculture-collective/subcult-tv/api/internal/models"
)

type fakeMailer struct {
	sent chan brevo.Email
}

func (f *fakeMailer) SendEmail(_ context.Context, e brevo.Email) error {
	f.sent <- e
	return nil
}
func (f *fakeMailer) NewsletterEnabled() bool                             { return true }
func (f *fakeMailer) RequestDoubleOptIn(context.Context, string) error    { return nil }
func (f *fakeMailer) RemoveFromNewsletter(context.Context, string) error  { return nil }
func (f *fakeMailer) NewsletterMembers(context.Context) ([]string, error) { return nil, nil }

func TestNormalizeEmail(t *testing.T) {
	cases := map[string]struct {
		want string
		ok   bool
	}{
		"  Ada@Example.COM ":    {"ada@example.com", true},
		"ada@example.com":       {"ada@example.com", true},
		"":                      {"", false},
		"not-an-email":          {"", false},
		"Ada <ada@example.com>": {"", false},
	}
	for in, tc := range cases {
		got, ok := normalizeEmail(in)
		if got != tc.want || ok != tc.ok {
			t.Errorf("normalizeEmail(%q) = %q, %v; want %q, %v", in, got, ok, tc.want, tc.ok)
		}
	}
}

func TestNotifyContactEmailsStudioWithReplyTo(t *testing.T) {
	mailer := &fakeMailer{sent: make(chan brevo.Email, 1)}
	h := &Handler{
		Mail: mailer,
		MailCfg: MailSettings{
			From:      brevo.Address{Name: "SUBCULT.TV", Email: "noreply@subcult.tv"},
			ContactTo: brevo.Address{Email: "info@subcult.tv"},
		},
	}
	subject := "Rekolekt question"
	h.notifyContact(models.Contact{
		Name:      "Ada Lovelace",
		Email:     "ada@example.com",
		Subject:   &subject,
		Message:   "Can we run our own archive?",
		CreatedAt: time.Date(2026, 10, 1, 4, 0, 0, 0, time.UTC),
	})

	select {
	case e := <-mailer.sent:
		if e.Sender.Email != "noreply@subcult.tv" || len(e.To) != 1 || e.To[0].Email != "info@subcult.tv" {
			t.Fatalf("unexpected addresses: %+v", e)
		}
		if e.ReplyTo == nil || e.ReplyTo.Email != "ada@example.com" {
			t.Fatalf("reply-to should be the sender, got %+v", e.ReplyTo)
		}
		if e.Subject != "[subcult.tv] Rekolekt question" {
			t.Fatalf("unexpected subject %q", e.Subject)
		}
		if !strings.Contains(e.TextContent, "Can we run our own archive?") {
			t.Fatalf("message body missing: %q", e.TextContent)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("notification was not sent")
	}
}

func TestNotifyContactWithoutMailerIsNoop(t *testing.T) {
	h := &Handler{}
	h.notifyContact(models.Contact{Name: "Ada", Email: "ada@example.com"})
}
