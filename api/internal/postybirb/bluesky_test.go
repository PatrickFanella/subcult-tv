package postybirb

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestBlueskyRejectsChangedDraftBeforeScheduling(t *testing.T) {
	for _, tc := range []struct {
		name, target, caption, alt, kind string
		files                            int
		invalid                          bool
	}{
		{"wrong target", "other", "approved", "alt", "FILE", 1, false},
		{"changed text", "allowed", "changed", "alt", "FILE", 1, false},
		{"changed alt text", "allowed", "approved", "changed", "FILE", 1, false},
		{"missing image", "allowed", "approved", "alt", "FILE", 0, false},
		{"wrong kind", "allowed", "approved", "alt", "MESSAGE", 1, false},
		{"invalid native mention", "allowed", "approved", "alt", "FILE", 1, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			mutations := 0
			server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Method != "GET" {
					mutations++
					http.Error(w, "must not schedule", 500)
					return
				}
				if strings.HasPrefix(r.URL.Path, "/website-option/validate/") {
					errors := []string{}
					if tc.invalid {
						errors = append(errors, "invalid mention")
					}
					json.NewEncoder(w).Encode([]any{map[string]any{"account": map[string]string{"id": "allowed"}, "errors": errors}})
					return
				}
				files := []any{}
				for i := 0; i < tc.files; i++ {
					files = append(files, map[string]any{"id": "image", "metadata": map[string]string{"altText": tc.alt}})
				}
				json.NewEncoder(w).Encode(map[string]any{"id": "draft", "type": tc.kind, "files": files, "options": []any{map[string]any{"accountId": tc.target, "data": map[string]any{"description": map[string]any{"description": literalDocument(tc.caption)}}}}})
			}))
			defer server.Close()
			pin := sha256.Sum256(server.Certificate().Raw)
			c := New(server.URL, strings.Repeat("x", 32), "social", hex.EncodeToString(pin[:]))
			if c.QueueBluesky(context.Background(), "draft", "allowed", "approved", "alt", true, time.Now().Add(2*time.Hour)) == nil || mutations != 0 {
				t.Fatal("changed draft reached scheduler")
			}
		})
	}
}
func TestBlueskyDeliveryRequiresAccountSpecificPostURL(t *testing.T) {
	for _, tc := range []struct{ name, account, state, link, want string }{
		{"published", "allowed", "SUCCEEDED", "https://bsky.app/profile/did:plc:example/post/abc", "PUBLISHED"},
		{"profile only", "allowed", "SUCCEEDED", "https://bsky.app/profile/example", "ERROR"},
		{"wrong host", "allowed", "SUCCEEDED", "https://example.test/profile/example/post/abc", "ERROR"},
		{"wrong account", "other", "SUCCEEDED", "https://bsky.app/profile/example/post/abc", "REVIEW"},
		{"failed", "allowed", "FAILED", "", "ERROR"},
		{"pending", "allowed", "PENDING", "", "REVIEW"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Method != "GET" {
					t.Error("delivery check mutated provider")
				}
				json.NewEncoder(w).Encode(map[string]any{"id": "draft", "posts": []any{map[string]any{"completed": true, "unitsOfWork": []any{map[string]string{"accountId": tc.account, "state": tc.state, "url": tc.link}}}}})
			}))
			defer server.Close()
			pin := sha256.Sum256(server.Certificate().Raw)
			c := New(server.URL, strings.Repeat("x", 32), "social", hex.EncodeToString(pin[:]))
			state, link, err := c.BlueskyStatus(context.Background(), "draft", "allowed")
			if err != nil || state != tc.want || state != "PUBLISHED" && link != "" {
				t.Fatal("invalid delivery evidence", state, link, err)
			}
		})
	}
}
