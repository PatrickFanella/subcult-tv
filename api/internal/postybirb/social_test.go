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

func TestInstagramRejectsChangedDraftBeforeQueue(t *testing.T) {
	for _, tc := range []struct {
		name, target, caption string
		files                 int
		errors                []string
	}{
		{"wrong target", "other", "approved", 1, nil},
		{"changed caption", "allowed", "changed", 1, nil},
		{"missing image", "allowed", "approved", 0, nil},
		{"validation error", "allowed", "approved", 1, []string{"invalid"}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			mutations := 0
			server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Method != "GET" {
					mutations++
					http.Error(w, "must not queue", 500)
					return
				}
				if strings.HasPrefix(r.URL.Path, "/website-option/validate/") {
					json.NewEncoder(w).Encode([]any{map[string]any{"account": map[string]string{"id": "allowed"}, "errors": tc.errors}})
					return
				}
				files := []any{}
				for i := 0; i < tc.files; i++ {
					files = append(files, map[string]string{"id": "image"})
				}
				json.NewEncoder(w).Encode(map[string]any{"id": "draft", "files": files, "schedule": map[string]string{"scheduleType": "NONE"}, "validations": []any{map[string]any{"errors": tc.errors}}, "options": []any{map[string]any{"accountId": tc.target, "isDefault": false, "data": map[string]any{"description": map[string]any{"description": literalDocument(tc.caption)}}}}})
			}))
			defer server.Close()
			pin := sha256.Sum256(server.Certificate().Raw)
			c := New(server.URL, strings.Repeat("x", 32), "instagram", hex.EncodeToString(pin[:]))
			if c.QueueInstagram(context.Background(), "draft", "allowed", "approved", time.Now().Add(48*time.Hour)) == nil {
				t.Fatal("changed draft accepted")
			}
			if mutations != 0 {
				t.Fatal("rejected draft reached scheduler")
			}
		})
	}
}
func TestInstagramCaptionPreservesLiteralText(t *testing.T) {
	doc := literalDocument("**literal** #tag\n\nhttps://example.test/a_b")
	content := doc["content"].([]node)
	if len(content) != 3 || content[0]["content"].([]node)[0]["text"] != "**literal** #tag" || len(content[1]["content"].([]node)) != 0 || content[2]["content"].([]node)[0]["text"] != "https://example.test/a_b" {
		t.Fatal("caption changed")
	}
}
