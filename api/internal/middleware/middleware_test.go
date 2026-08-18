package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// TestLimitBodyMiddleware tests the body size limit middleware.
func TestLimitBodyMiddleware(t *testing.T) {
	handler := LimitBody(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// GET request should pass through unchanged
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Errorf("GET request: expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

// TestRateLimitMiddleware tests the HTTP middleware wrapper.
func TestRateLimitMiddleware(t *testing.T) {
	limiter := NewRateLimiter(2, time.Minute)
	handler := RateLimit(limiter)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// First 2 requests should pass
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = "192.168.1.100:12345"
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, req)
		if recorder.Code != http.StatusOK {
			t.Errorf("request %d: expected status %d, got %d", i+1, http.StatusOK, recorder.Code)
		}
	}

	// 3rd request should be rate limited
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "192.168.1.100:12345"
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusTooManyRequests {
		t.Errorf("expected status %d, got %d", http.StatusTooManyRequests, recorder.Code)
	}
	// Check Retry-After header
	if recorder.Header().Get("Retry-After") != "60" {
		t.Error("expected Retry-After: 60 header")
	}
}

// TestRateLimiterBasic tests basic rate limiting functionality.
func TestRateLimiterBasic(t *testing.T) {
	limiter := NewRateLimiter(3, time.Minute)

	// First 3 requests should pass
	for i := 0; i < 3; i++ {
		if !limiter.Allow("192.168.1.1") {
			t.Errorf("request %d should be allowed", i+1)
		}
	}

	// 4th request should be blocked
	if limiter.Allow("192.168.1.1") {
		t.Error("4th request should be blocked")
	}

	// Different IP should be allowed
	if !limiter.Allow("192.168.1.2") {
		t.Error("different IP should be allowed")
	}
}

// TestRateLimiterWindowReset tests that the rate limit resets after the window.
func TestRateLimiterWindowReset(t *testing.T) {
	// Use a very short window for testing
	limiter := NewRateLimiter(2, 100*time.Millisecond)

	// Use up the limit
	limiter.Allow("10.0.0.1")
	limiter.Allow("10.0.0.1")

	// Should be blocked
	if limiter.Allow("10.0.0.1") {
		t.Error("should be blocked after limit")
	}

	// Wait for window to reset
	time.Sleep(150 * time.Millisecond)

	// Should be allowed again
	if !limiter.Allow("10.0.0.1") {
		t.Error("should be allowed after window reset")
	}
}

// TestSecurityHeaders tests that all security headers are set correctly.
func TestSecurityHeaders(t *testing.T) {
	handler := SecurityHeaders(nil)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, req)

	expectedHeaders := map[string]string{
		"X-Frame-Options":        "DENY",
		"X-Content-Type-Options": "nosniff",
		"X-XSS-Protection":       "1; mode=block",
		"Referrer-Policy":        "strict-origin-when-cross-origin",
	}
	for header, expected := range expectedHeaders {
		actual := recorder.Header().Get(header)
		if actual != expected {
			t.Errorf("expected %s: %s, got: %s", header, expected, actual)
		}
	}

	// CSP with no extra origins should still allow same-origin connect-src.
	csp := recorder.Header().Get("Content-Security-Policy")
	if csp != "default-src 'self'; connect-src 'self'; frame-ancestors 'none'" {
		t.Errorf("unexpected CSP: %s", csp)
	}

	// Extra origins should be appended to connect-src.
	handlerWithOrigins := SecurityHeaders([]string{"https://api.example.com", " https://umami.example.com "})(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}),
	)
	recorder = httptest.NewRecorder()
	handlerWithOrigins.ServeHTTP(recorder, req)
	csp = recorder.Header().Get("Content-Security-Policy")
	if csp != "default-src 'self'; connect-src 'self' https://api.example.com https://umami.example.com; frame-ancestors 'none'" {
		t.Errorf("unexpected CSP with origins: %s", csp)
	}
}