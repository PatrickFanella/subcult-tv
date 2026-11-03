package router

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/config"
	"github.com/subculture-collective/subcult-tv/api/internal/handlers"
)

// TestAdminGroupRejectsNonAdminRole checks the router-level role gate: a valid
// token whose role is not admin never reaches an admin handler.
func TestAdminGroupRejectsNonAdminRole(t *testing.T) {
	cfg := &config.Config{JWTSecret: "local-test-secret"}
	router := New(cfg, &handlers.Handler{StudioRoot: t.TempDir()})
	sign := func(role string) string {
		token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": "user", "role": role, "exp": time.Now().Add(time.Hour).Unix()}).SignedString([]byte(cfg.JWTSecret))
		if err != nil {
			t.Fatal(err)
		}
		return token
	}
	for _, path := range []string{"/api/v1/admin/stats", "/api/v1/contacts", "/api/v1/admin/posts", "/api/v1/newsletter/subscribers"} {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("Authorization", "Bearer "+sign("viewer"))
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)
		if rec.Code != http.StatusForbidden {
			t.Fatalf("viewer %s: got %d want 403 (%s)", path, rec.Code, rec.Body.String())
		}
		if rec.Body.String() != `{"error":"Admin access required","code":403}` {
			t.Fatalf("viewer %s: unexpected body %s", path, rec.Body.String())
		}
	}
	// A missing role claim is also refused.
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/stats", nil)
	req.Header.Set("Authorization", "Bearer "+sign(""))
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("empty role: got %d", rec.Code)
	}
	// An admin token passes the gate and reaches the handler (the Studio
	// catalog needs no database).
	req = httptest.NewRequest(http.MethodGet, "/api/v1/admin/studio", nil)
	req.Header.Set("Authorization", "Bearer "+sign("admin"))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	if rec.Code == http.StatusForbidden {
		t.Fatalf("admin was refused: %d %s", rec.Code, rec.Body.String())
	}
}
