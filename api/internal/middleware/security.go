package middleware

import (
	"net/http"
	"strings"
)

// SecurityHeaders returns a middleware that adds essential security headers.
// connectOrigins lists specifically-allowed cross-origin hosts for connect-src
// (e.g. a separate API origin or a self-hosted Umami), so the CSP stays strict
// without breaking analytics or cross-origin API calls.
func SecurityHeaders(connectOrigins []string) func(http.Handler) http.Handler {
	connect := "connect-src 'self'"
	for _, o := range connectOrigins {
		if o = strings.TrimSpace(o); o != "" {
			connect += " " + o
		}
	}
	csp := "default-src 'self'; " + connect + "; frame-ancestors 'none'"

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Prevent clickjacking
			w.Header().Set("X-Frame-Options", "DENY")

			// Prevent MIME type sniffing
			w.Header().Set("X-Content-Type-Options", "nosniff")

			// XSS protection for older browsers
			w.Header().Set("X-XSS-Protection", "1; mode=block")

			// Referrer policy - don't leak URLs
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

			// Permissions policy - disable unnecessary features
			w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

			// Content Security Policy - strict by default, with an explicit
			// connect-src allow-list for API and analytics origins.
			w.Header().Set("Content-Security-Policy", csp)

			next.ServeHTTP(w, r)
		})
	}
}