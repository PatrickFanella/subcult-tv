package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
)

func TestBrevoWebhookRejectsUnauthorized(t *testing.T) {
	h := &Handler{BrevoWebhookSecret: strings.Repeat("s", 32), BrevoNewsletterListID: 2}
	for _, secret := range []string{"", "wrong"} {
		r := httptest.NewRequest("POST", "/", strings.NewReader(`{"event":"list_addition"}`))
		r.Header.Set("X-Brevo-Webhook-Secret", secret)
		w := httptest.NewRecorder()
		h.BrevoNewsletterWebhook(w, r)
		if w.Code != 401 {
			t.Fatalf("got %d", w.Code)
		}
	}
	h.BrevoWebhookSecret = ""
	w := httptest.NewRecorder()
	h.BrevoNewsletterWebhook(w, httptest.NewRequest("POST", "/", nil))
	if w.Code != 404 {
		t.Fatalf("disabled route got %d", w.Code)
	}
}

func TestBrevoWebhookConsentSequence(t *testing.T) {
	dbURL := os.Getenv("TEST_DATABASE_URL")
	if dbURL == "" {
		t.Skip("set TEST_DATABASE_URL to a disposable PostgreSQL database")
	}
	ctx := context.Background()
	admin, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		t.Fatal(err)
	}
	defer admin.Close()
	schema := "webhook_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if _, err = admin.Exec(ctx, "CREATE SCHEMA "+schema); err != nil {
		t.Fatal(err)
	}
	defer func() { _, _ = admin.Exec(ctx, "DROP SCHEMA "+schema+" CASCADE") }()
	cfg, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		t.Fatal(err)
	}
	cfg.ConnConfig.RuntimeParams["search_path"] = schema + ",public"
	db, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err = database.Migrate(ctx, db); err != nil {
		t.Fatal(err)
	}
	h := &Handler{DB: db, BrevoWebhookSecret: strings.Repeat("s", 32), BrevoNewsletterListID: 2}
	at := time.Now().Add(-time.Hour).Truncate(time.Second)
	email := "consent@example.invalid"
	_, err = db.Exec(ctx, `INSERT INTO subscribers(email,unsubscribe_token,subscribed_at) VALUES($1,'test-token',$2)`, email, at)
	if err != nil {
		t.Fatal(err)
	}
	send := func(event, email string, list int64, seconds int64) {
		t.Helper()
		body, _ := json.Marshal(newsletterEvent{Event: event, Email: email, ListIDs: []int64{list}, Timestamp: at.Unix() + seconds})
		r := httptest.NewRequest("POST", "/", strings.NewReader(string(body)))
		r.Header.Set("X-Brevo-Webhook-Secret", h.BrevoWebhookSecret)
		w := httptest.NewRecorder()
		h.BrevoNewsletterWebhook(w, r)
		if w.Code != 204 {
			t.Fatalf("%s got %d: %s", event, w.Code, w.Body.String())
		}
	}
	check := func(confirmed, unsubscribed bool) {
		t.Helper()
		var gotConfirmed, gotUnsubscribed bool
		err := db.QueryRow(ctx, `SELECT confirmed,unsubscribed_at IS NOT NULL FROM subscribers WHERE email=$1`, email).Scan(&gotConfirmed, &gotUnsubscribed)
		if err != nil {
			t.Fatal(err)
		}
		if gotConfirmed != confirmed || gotUnsubscribed != unsubscribed {
			t.Fatalf("confirmed=%v unsubscribed=%v", gotConfirmed, gotUnsubscribed)
		}
	}
	send("list_addition", email, 3, 10)
	check(false, false)
	send("list_addition", email, 2, -1)
	check(false, false)
	send("list_addition", " CONSENT@EXAMPLE.INVALID ", 2, 10)
	check(true, false)
	send("list_addition", email, 2, 10)
	check(true, false)
	send("unsubscribe", email, 2, 20)
	check(false, true)
	send("list_addition", email, 2, 15)
	check(false, true)
	send("list_addition", email, 2, 20)
	check(false, true)
	send("list_addition", email, 2, 30)
	check(true, false)
	send("unsubscribe", email, 2, 25)
	check(true, false)
	// A local unsubscribe must also survive older provider confirmation.
	_, err = db.Exec(ctx, `UPDATE subscribers SET confirmed=FALSE,unsubscribed_at=$2,provider_event_at=$2 WHERE email=$1`, email, at.Add(40*time.Second))
	if err != nil {
		t.Fatal(err)
	}
	send("list_addition", email, 2, 35)
	check(false, true)
	// Re-subscription requests fresh DOI; old confirmations cannot confirm it.
	h.Mail = &fakeMailer{}
	r := httptest.NewRequest("POST", "/", strings.NewReader(`{"email":"consent@example.invalid"}`))
	w := httptest.NewRecorder()
	h.Subscribe(w, r)
	if w.Code != 201 {
		t.Fatalf("resubscribe got %d", w.Code)
	}
	check(false, false)
	send("list_addition", email, 2, 50)
	check(false, false)
	send("list_addition", email, 2, time.Now().Unix()-at.Unix())
	check(true, false)
	send("list_addition", "unknown@example.invalid", 2, 50)
	var count int
	if err = db.QueryRow(ctx, "SELECT count(*) FROM subscribers").Scan(&count); err != nil || count != 1 {
		t.Fatal(fmt.Sprintf("count=%d error=%v", count, err))
	}
}
