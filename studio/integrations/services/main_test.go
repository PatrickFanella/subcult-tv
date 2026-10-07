package main

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestProxyPreservesAPIAndAuthentication(t *testing.T) {
	origin := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer fixture" || r.Header.Get("X-Forwarded-For") != "192.0.2.5" || r.Header.Get("X-Forwarded-Proto") != "https" || r.Host != "sonarr.subcult.tv" {
			t.Error("identity headers changed")
		}
		b, _ := io.ReadAll(r.Body)
		if string(b) != `{"setting":true}` {
			t.Error("request body changed")
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Set-Cookie", "session=fixture; HttpOnly; Secure")
		w.Write([]byte(`{"ok":true}`))
	}))
	defer origin.Close()
	h, err := newHandler(map[string]route{"sonarr.subcult.tv": {origin.URL, "sonarr"}})
	if err != nil {
		t.Fatal(err)
	}
	r := httptest.NewRequest("POST", "http://sonarr.subcult.tv/api/config", strings.NewReader(`{"setting":true}`))
	r.Header.Set("Authorization", "Bearer fixture")
	r.Header.Set("X-Forwarded-For", "192.0.2.5")
	r.Header.Set("X-Forwarded-Proto", "https")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	if w.Body.String() != `{"ok":true}` || w.Header().Get("Set-Cookie") != "session=fixture; HttpOnly; Secure" {
		t.Fatal("API response changed")
	}
}

func TestBrandingGzipAndCSP(t *testing.T) {
	var compressed bytes.Buffer
	gz := gzip.NewWriter(&compressed)
	gz.Write([]byte("<html><head></head><body>hello</body></html>"))
	gz.Close()
	r := &http.Response{StatusCode: 200, Header: http.Header{"Content-Type": {"text/html"}, "Content-Encoding": {"gzip"}, "Content-Security-Policy": {"default-src 'self'"}, "Etag": {"original"}}, Body: io.NopCloser(bytes.NewReader(compressed.Bytes())), Request: &http.Request{Method: "GET"}}
	if err := brandResponse("navidrome", r); err != nil {
		t.Fatal(err)
	}
	b, _ := io.ReadAll(r.Body)
	if !strings.Contains(string(b), `href="/_subcult/navidrome.css`) || r.Header.Get("Content-Encoding") != "" || r.Header.Get("Etag") != "" || r.Header.Get("Content-Security-Policy") != "default-src 'self'" || int64(len(b)) != r.ContentLength {
		t.Fatal("invalid HTML transformation")
	}
}

func TestAssetsAndUnknownHost(t *testing.T) {
	h, err := newHandler(map[string]route{"music.subcult.tv": {"http://127.0.0.1:1", "navidrome"}})
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct {
		url    string
		status int
	}{{"http://music.subcult.tv/_subcult/mark-primary.svg", 200}, {"http://music.subcult.tv/_subcult/../routes.json", 404}, {"http://unknown.subcult.tv/", 404}} {
		w := httptest.NewRecorder()
		h.ServeHTTP(w, httptest.NewRequest("GET", tc.url, nil))
		if w.Code != tc.status {
			t.Fatalf("%s: %d", tc.url, w.Code)
		}
	}
}
