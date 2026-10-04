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

func TestPrivateAdapterAccountPinAndScheduling(t *testing.T) {
	calls := []string{}
	var options map[string]any
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("x-remote-password") != strings.Repeat("k", 40) {
			t.Error("missing remote auth")
		}
		calls = append(calls, r.Method+" "+r.URL.Path)
		switch r.URL.Path {
		case "/api/account/refresh/owner":
			w.Write([]byte(`{}`))
		case "/api/account/owner":
			json.NewEncoder(w).Encode(map[string]any{"id": "owner", "website": "patreon", "state": map[string]any{"status": "loggedIn", "isLoggedIn": true, "lastUpdated": time.Now()}, "data": map[string]any{"folders": []Audience{{"tier-1", "Paid members"}}}})
		case "/api/submissions":
			if r.ParseMultipartForm(100000) != nil || r.FormValue("type") != "MESSAGE" {
				t.Error("invalid message draft")
			}
			w.Write([]byte(`[{"id":"submission-one"}]`))
		case "/api/website-option":
			json.NewDecoder(r.Body).Decode(&options)
			w.Write([]byte(`{}`))
		case "/api/posting":
			w.Write([]byte(`{}`))
		case "/api/submissions/submission-one":
			w.Write([]byte(`{"post":{"unitsOfWork":[{"accountId":"other","state":"SUCCEEDED","url":"https://www.patreon.com/posts/wrong"},{"accountId":"owner","state":"SUCCEEDED","url":"https://www.patreon.com/posts/one"}]}}`))
		default:
			t.Error(r.URL.Path)
			http.NotFound(w, r)
		}
	}))
	defer server.Close()
	pin := sha256.Sum256(server.Certificate().Raw)
	client := New(server.URL+"/api", strings.Repeat("k", 40), "owner", hex.EncodeToString(pin[:]))
	audiences, err := client.Ready(context.Background(), true)
	if err != nil || len(audiences) != 1 {
		t.Fatal(audiences, err)
	}
	doc, err := Document("A **clear** update.\n\n- First\n- Second")
	if err != nil {
		t.Fatal(err)
	}
	due := time.Now().Add(48 * time.Hour).Truncate(time.Second)
	id, err := client.Create(context.Background(), "Title", doc, due, "tier-1")
	if err != nil || id != "submission-one" {
		t.Fatal(id, err)
	}
	data := options["data"].(map[string]any)
	if data["schedule"] != due.UTC().Format(time.RFC3339) || data["charge"] != false || data["tiers"].([]any)[0] != "tier-1" || options["accountId"] != "owner" {
		t.Fatal(options)
	}
	if len(calls) != 4 {
		t.Fatal("create must not start posting", calls)
	}
	if err = client.Start(context.Background(), id); err != nil {
		t.Fatal(err)
	}
	ok, link, err := client.Receipt(context.Background(), id)
	if err != nil || !ok || link != "https://www.patreon.com/posts/one" {
		t.Fatal(ok, link, err)
	}
	wrong := New(server.URL+"/api", strings.Repeat("k", 40), "owner", strings.Repeat("0", 64))
	if _, err = wrong.Ready(context.Background(), false); err == nil {
		t.Fatal("changed certificate accepted")
	}
}
func TestMarkdownPreviewFormat(t *testing.T) {
	doc, err := Document("## Heading\n\nA **bold** and *italic* [link](https://subcult.tv).\n\n1. First\n2. Second\n\n> Quote")
	if err != nil {
		t.Fatal(err)
	}
	data, _ := json.Marshal(doc)
	for _, expected := range []string{`"type":"heading"`, `"type":"bold"`, `"type":"italic"`, `"type":"link"`, `"type":"orderedList"`, `"type":"blockquote"`} {
		if !strings.Contains(string(data), expected) {
			t.Fatal(string(data))
		}
	}
	for _, body := range []string{"<script>unsafe</script>", "![image](https://subcult.tv/image.jpg)", "[link](javascript:alert)", "```go\ncode\n```"} {
		if _, err := Document(body); err == nil {
			t.Fatalf("unsupported body accepted %q", body)
		}
	}
}
