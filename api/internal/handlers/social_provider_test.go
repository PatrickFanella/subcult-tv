package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
)

// The fake uses the actual private TLS protocol and distinguishes creating a
// draft from enabling scheduling. Immediate posting is always a test failure.
func socialTestProvider(t *testing.T, submissions *atomic.Int32, reject *atomic.Bool, id string) *postybirb.Client {
	t.Helper()
	var option any
	var scheduled atomic.Bool
	var due string
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == "GET" && strings.HasPrefix(r.URL.Path, "/website-option/validate/"):
			w.Write([]byte(`[{"account":{"id":"patrick"},"errors":[]}]`))
		case r.Method == "GET" && r.URL.Path == "/account":
			w.Write([]byte(`[{"id":"patrick","name":"Patrick","website":"instagram","state":{"status":"loggedIn","isLoggedIn":true}}]`))
		case r.Method == "POST" && r.URL.Path == "/submissions":
			submissions.Add(1)
			scheduled.Store(false)
			if r.ParseMultipartForm(1<<20) != nil {
				t.Error("invalid multipart")
			}
			f, h, err := r.FormFile("files")
			if err != nil {
				t.Error("private JPEG missing")
			} else {
				f.Close()
				if h.Header.Get("Content-Type") != "image/jpeg" {
					t.Error("JPEG MIME missing")
				}
			}
			if r.FormValue("type") != "FILE" {
				t.Error("not a file draft")
			}
			json.NewEncoder(w).Encode([]map[string]string{{"id": id}})
		case r.Method == "POST" && r.URL.Path == "/website-option":
			var body map[string]any
			json.NewDecoder(r.Body).Decode(&body)
			option = body
		case r.Method == "PATCH" && strings.HasPrefix(r.URL.Path, "/submissions/"):
			if reject != nil && reject.Load() {
				http.Error(w, "uncertain queue", 500)
				return
			}
			var body struct {
				Scheduled bool   `json:"isScheduled"`
				Type      string `json:"scheduleType"`
				Due       string `json:"scheduledFor"`
			}
			json.NewDecoder(r.Body).Decode(&body)
			if !body.Scheduled || body.Type != "SINGLE" {
				t.Error("invalid schedule")
			}
			due = body.Due
			scheduled.Store(true)
		case r.Method == "GET" && strings.HasPrefix(r.URL.Path, "/submissions/"):
			options := []any{option}
			schedule := map[string]string{"scheduleType": "NONE"}
			if scheduled.Load() {
				schedule = map[string]string{"scheduleType": "SINGLE", "scheduledFor": due}
			}
			json.NewEncoder(w).Encode(map[string]any{"id": id, "isScheduled": scheduled.Load(), "schedule": schedule, "files": []any{map[string]string{"id": "jpeg"}}, "options": options, "validations": []any{}})
		default:
			t.Errorf("unexpected provider mutation: %s %s", r.Method, r.URL.Path)
			http.Error(w, "unexpected", 500)
		}
	}))
	t.Cleanup(server.Close)
	pin := sha256.Sum256(server.Certificate().Raw)
	return postybirb.New(server.URL, strings.Repeat("x", 32), "instagram", hex.EncodeToString(pin[:]))
}
