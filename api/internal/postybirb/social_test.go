package postybirb

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
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

func TestFailedInstagramRejectsUncertainOrDeliveredResults(t *testing.T) {
	for _, tc := range []struct {
		name, state, account, url string
		completed, scheduled      bool
		units, files              int
		accepted                  bool
	}{
		{"finished failure", "FAILED", "allowed", "", true, false, 1, 1, true},
		{"active failure", "FAILED", "allowed", "", false, false, 1, 1, false},
		{"still scheduled", "FAILED", "allowed", "", true, true, 1, 1, false},
		{"published", "SUCCEEDED", "allowed", "", true, false, 1, 1, false},
		{"posting", "PENDING", "allowed", "", true, false, 1, 1, false},
		{"cancelled", "CANCELLED", "allowed", "", true, false, 1, 1, false},
		{"wrong account", "FAILED", "other", "", true, false, 1, 1, false},
		{"delivery URL", "FAILED", "allowed", "https://instagram.com/p/published", true, false, 1, 1, false},
		{"multiple results", "FAILED", "allowed", "", true, false, 2, 1, false},
		{"missing results", "FAILED", "allowed", "", true, false, 0, 1, false},
		{"multiple images", "FAILED", "allowed", "", true, false, 1, 2, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Method != "GET" {
					t.Error("failure inspection mutated provider")
				}
				units := []any{}
				for i := 0; i < tc.units; i++ {
					units = append(units, map[string]any{"accountId": tc.account, "state": tc.state, "url": tc.url})
				}
				files := []any{}
				for i := 0; i < tc.files; i++ {
					files = append(files, map[string]string{"id": "image"})
				}
				json.NewEncoder(w).Encode(map[string]any{"id": "failed", "files": files, "isScheduled": tc.scheduled, "post": map[string]any{"completed": tc.completed, "unitsOfWork": units}})
			}))
			defer server.Close()
			pin := sha256.Sum256(server.Certificate().Raw)
			c := New(server.URL, strings.Repeat("x", 32), "instagram", hex.EncodeToString(pin[:]))
			if err := c.FailedInstagram(context.Background(), "failed", "allowed"); (err == nil) != tc.accepted {
				t.Fatal("unexpected recovery eligibility", err)
			}
		})
	}
}

func TestPostInstagramValidatesBeforeImmediateDispatch(t *testing.T) {
	for _, changed := range []bool{false, true} {
		t.Run(fmt.Sprint("changed=", changed), func(t *testing.T) {
			posts := 0
			server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				switch {
				case r.Method == "POST":
					posts++
					if r.URL.Path != "/posting" {
						t.Errorf("unexpected dispatch %s", r.URL.Path)
					}
					var body struct {
						SubmissionID string              `json:"submissionId"`
						Targets      map[string][]string `json:"targets"`
					}
					json.NewDecoder(r.Body).Decode(&body)
					if body.SubmissionID != "replacement" || len(body.Targets) != 1 || body.Targets["allowed"] == nil {
						t.Error("wrong immediate target", body)
					}
				case strings.HasPrefix(r.URL.Path, "/website-option/validate/"):
					w.Write([]byte(`[{"account":{"id":"allowed"},"errors":[]}]`))
				default:
					caption := "approved"
					if changed {
						caption = "changed"
					}
					json.NewEncoder(w).Encode(map[string]any{"id": "replacement", "files": []any{map[string]string{"id": "image"}}, "options": []any{map[string]any{"accountId": "allowed", "data": map[string]any{"description": map[string]any{"description": literalDocument(caption)}}}}})
				}
			}))
			defer server.Close()
			pin := sha256.Sum256(server.Certificate().Raw)
			c := New(server.URL, strings.Repeat("x", 32), "instagram", hex.EncodeToString(pin[:]))
			err := c.PostInstagram(context.Background(), "replacement", "allowed", "approved")
			if changed && (err == nil || posts != 0) {
				t.Fatal("changed draft dispatched", err, posts)
			}
			if !changed && (err != nil || posts != 1) {
				t.Fatal("approved draft not dispatched", err, posts)
			}
		})
	}
}
