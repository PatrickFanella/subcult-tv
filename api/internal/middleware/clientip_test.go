package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func trusted(t *testing.T) func(http.Handler) http.Handler {
	t.Helper()
	nets, err := ParseCIDRs(DefaultTrustedProxyCIDRs)
	if err != nil {
		t.Fatal(err)
	}
	return ClientIP(nets)
}

func resolve(t *testing.T, remote string, headers map[string]string) string {
	t.Helper()
	var got string
	handler := trusted(t)(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		got = ClientIPFrom(r)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = remote
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	handler.ServeHTTP(httptest.NewRecorder(), req)
	return got
}

func TestClientIPDerivation(t *testing.T) {
	cases := []struct {
		name    string
		remote  string
		headers map[string]string
		want    string
	}{
		{"direct host without port", "203.0.113.9:4455", nil, "203.0.113.9"},
		{"untrusted remote ignores XFF", "203.0.113.9:4455", map[string]string{"X-Forwarded-For": "198.51.100.7"}, "203.0.113.9"},
		{"untrusted remote ignores X-Real-IP", "203.0.113.9:4455", map[string]string{"X-Real-IP": "198.51.100.7", "True-Client-IP": "198.51.100.8"}, "203.0.113.9"},
		{"trusted proxy honors XFF", "172.18.0.2:38000", map[string]string{"X-Forwarded-For": "198.51.100.7"}, "198.51.100.7"},
		{"trusted proxy walks from the right past trusted hops", "172.18.0.2:38000", map[string]string{"X-Forwarded-For": "1.2.3.4, 198.51.100.7, 10.0.0.5"}, "198.51.100.7"},
		{"trusted proxy ignores X-Real-IP", "127.0.0.1:38000", map[string]string{"X-Real-IP": "198.51.100.7"}, "127.0.0.1"},
		{"trusted proxy with only trusted hops keeps proxy", "127.0.0.1:38000", map[string]string{"X-Forwarded-For": "10.1.1.1"}, "127.0.0.1"},
		{"malformed hop stops the walk", "127.0.0.1:38000", map[string]string{"X-Forwarded-For": "198.51.100.7, not-an-ip"}, "127.0.0.1"},
		{"ipv6 remote", "[2001:db8::1]:443", map[string]string{"X-Forwarded-For": "198.51.100.7"}, "2001:db8::1"},
		{"ipv6 trusted loopback honors XFF", "[::1]:443", map[string]string{"X-Forwarded-For": "2001:db8::9"}, "2001:db8::9"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := resolve(t, tc.remote, tc.headers); got != tc.want {
				t.Fatalf("got %q, want %q", got, tc.want)
			}
		})
	}
}

func TestParseCIDRs(t *testing.T) {
	nets, err := ParseCIDRs([]string{" 10.0.0.0/8, 192.168.1.1 ", "::1"})
	if err != nil || len(nets) != 3 {
		t.Fatalf("nets=%v err=%v", nets, err)
	}
	if _, err := ParseCIDRs([]string{"garbage"}); err == nil {
		t.Fatal("expected an error for an invalid entry")
	}
}

func TestClientIPFromWithoutMiddleware(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "203.0.113.9:4455"
	if got := ClientIPFrom(req); got != "203.0.113.9" {
		t.Fatalf("got %q", got)
	}
}

// TestRateLimitKeysOnDerivedClientIP ties the limiter to the ClientIP result:
// spoofed headers and new source ports cannot open fresh buckets.
func TestRateLimitKeysOnDerivedClientIP(t *testing.T) {
	limiter := NewRateLimiter(2, time.Minute)
	handler := trusted(t)(RateLimit(limiter)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})))
	send := func(remote string, headers map[string]string) int {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = remote
		for k, v := range headers {
			req.Header.Set(k, v)
		}
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		return rec.Code
	}

	// Direct client: different ports share one bucket.
	if send("203.0.113.9:1000", nil) != 200 || send("203.0.113.9:1001", nil) != 200 {
		t.Fatal("first two requests should pass")
	}
	if send("203.0.113.9:1002", nil) != 429 {
		t.Fatal("third request from a new port should share the bucket")
	}
	// Spoofed headers from the same untrusted client do not create a new bucket.
	for _, h := range []map[string]string{
		{"X-Forwarded-For": "198.51.100.1"},
		{"X-Real-IP": "198.51.100.2"},
		{"True-Client-IP": "198.51.100.3"},
	} {
		if send("203.0.113.9:1003", h) != 429 {
			t.Fatalf("spoofed header %v opened a new bucket", h)
		}
	}

	// Behind a trusted proxy, the forwarded client is the key.
	proxy := "172.18.0.2:5000"
	if send(proxy, map[string]string{"X-Forwarded-For": "198.51.100.50"}) != 200 || send(proxy, map[string]string{"X-Forwarded-For": "198.51.100.50"}) != 200 {
		t.Fatal("forwarded client should start fresh")
	}
	if send(proxy, map[string]string{"X-Forwarded-For": "198.51.100.50"}) != 429 {
		t.Fatal("forwarded client should be limited on its third request")
	}
	if send(proxy, map[string]string{"X-Forwarded-For": "198.51.100.51"}) != 200 {
		t.Fatal("a different forwarded client should have its own bucket")
	}
}

func TestRequireRole(t *testing.T) {
	handler := RequireRole("admin")(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	for role, want := range map[string]int{"admin": 200, "viewer": 403, "": 403} {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		if role != "" {
			req = req.WithContext(context.WithValue(req.Context(), RoleKey, role))
		}
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		if rec.Code != want {
			t.Fatalf("role %q: got %d want %d", role, rec.Code, want)
		}
		if want == 403 && rec.Body.String() != `{"error":"Admin access required","code":403}` {
			t.Fatalf("unexpected body %s", rec.Body.String())
		}
	}
}
