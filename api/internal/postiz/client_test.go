package postiz

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestScheduleContractAndRejectedResponse(t *testing.T) {
	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		if r.Header.Get("Authorization") != "private-key" {
			t.Error("missing server credential")
		}
		var body map[string]any
		json.NewDecoder(r.Body).Decode(&body)
		if body["type"] != "schedule" {
			t.Error("must never publish immediately")
		}
		post := body["posts"].([]any)[0].(map[string]any)
		if post["settings"].(map[string]any)["post_type"] != "post" {
			t.Error("missing Instagram settings")
		}
		w.Write([]byte(`[{"postId":"post-one","integration":"account-one"}]`))
	}))
	defer server.Close()
	c := New(server.URL, "private-key")
	result, err := c.Schedule(context.Background(), Account{ID: "account-one", Identifier: "instagram-standalone"}, "caption", "media-one", "https://example.test/image", time.Now().Add(25*time.Hour))
	if err != nil || result[0].PostID != "post-one" || calls != 1 {
		t.Fatalf("schedule: %+v %v", result, err)
	}
	rejected := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { http.Error(w, "private token details", 401) }))
	defer rejected.Close()
	_, err = New(rejected.URL, "secret").Accounts(context.Background())
	if err == nil || strings.Contains(err.Error(), "token details") {
		t.Fatal("provider body leaked")
	}
}
func TestNoCredentialRedirect(t *testing.T) {
	called := false
	destination := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { called = true }))
	defer destination.Close()
	redirect := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { http.Redirect(w, r, destination.URL, 302) }))
	defer redirect.Close()
	_, err := New(redirect.URL, "secret").Accounts(context.Background())
	if err == nil || called {
		t.Fatal("followed credential redirect")
	}
}
