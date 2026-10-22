package router

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/config"
	"github.com/subculture-collective/subcult-tv/api/internal/handlers"
)

func TestStudioAccessAndContainment(t *testing.T) {
	root := t.TempDir()
	id := strings.Repeat("a", 64)
	os.Mkdir(filepath.Join(root, "assets"), 0700)
	os.WriteFile(filepath.Join(root, "assets", id+".svg"), []byte(`<svg xmlns="http://www.w3.org/2000/svg"/>`), 0600)
	catalog := map[string]any{"version": 1, "brands": []any{}, "media": []any{}, "files": map[string]any{id: map[string]string{"path": "assets/" + id + ".svg", "sha256": id, "name": "mark.svg"}}}
	data, _ := json.Marshal(catalog)
	os.WriteFile(filepath.Join(root, "catalog.json"), data, 0600)
	h := &handlers.Handler{StudioRoot: root, StudioStateRoot: t.TempDir()}
	cfg := &config.Config{JWTSecret: "local-test-secret"}
	router := New(cfg, h)
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": "test", "role": "admin", "exp": time.Now().Add(time.Hour).Unix()}).SignedString([]byte(cfg.JWTSecret))
	request := func(path string, auth bool) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		if auth {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		response := httptest.NewRecorder()
		router.ServeHTTP(response, req)
		return response
	}
	for _, path := range []string{"/api/v1/admin/studio", "/api/v1/admin/studio/jobs", "/api/v1/admin/studio/assets/" + id} {
		if response := request(path, false); response.Code != 401 {
			t.Fatalf("anonymous %s: %d", path, response.Code)
		}
		if response := request(path, true); response.Code != 200 {
			t.Fatalf("authorized %s: %d %s", path, response.Code, response.Body.String())
		}
	}
	for _, path := range []string{"/api/v1/admin/studio/references", "/api/v1/admin/studio/references/facets", "/api/v1/admin/studio/references/test"} {
		if response := request(path, false); response.Code != 401 {
			t.Fatalf("anonymous references: %d", response.Code)
		}
		if response := request(path, true); response.Code != 503 {
			t.Fatalf("missing reference DB: %d", response.Code)
		}
	}
	if response := request("/api/v1/admin/studio/assets/"+strings.Repeat("b", 64), true); response.Code != 404 {
		t.Fatal("unknown asset exposed")
	}
	// An allowlisted-looking symlink still cannot escape the export root.
	outside := filepath.Join(t.TempDir(), "private.svg")
	os.WriteFile(outside, []byte("private bytes"), 0600)
	os.Remove(filepath.Join(root, "assets", id+".svg"))
	os.Symlink(outside, filepath.Join(root, "assets", id+".svg"))
	if response := request("/api/v1/admin/studio/assets/"+id, true); response.Code != 404 {
		t.Fatal("symlink escape exposed")
	}
	os.WriteFile(filepath.Join(root, "posting.json"), []byte(`{"version":1,"generated_at":"2020-01-01T00:00:00Z","connected":true,"publishing_enabled":true,"provider_evidence":{"secret":"hidden"},"drafts":[{"text":"Review copy","approval":"approved","token":"hidden","craft":{"campaign":{"project":"clpr","packet_revision":"observed-revision","documents":"hidden"}}}]}`), 0600)
	if response := request("/api/v1/admin/studio/posting", false); response.Code != 401 {
		t.Fatal("anonymous posting access")
	}
	posting := request("/api/v1/admin/studio/posting", true)
	if posting.Code != 200 || !strings.Contains(posting.Body.String(), `"stale":true`) || !strings.Contains(posting.Body.String(), `"approval":"unapproved"`) || !strings.Contains(posting.Body.String(), `"publishing_enabled":false`) {
		t.Fatalf("invalid posting boundary: %s", posting.Body.String())
	}
	if !strings.Contains(posting.Body.String(), `"packet_revision":"observed-revision"`) {
		t.Fatal("campaign provenance was lost")
	}
	if strings.Contains(posting.Body.String(), "hidden") {
		t.Fatal("posting snapshot leaked private fields")
	}
	os.WriteFile(filepath.Join(root, "posting.json"), []byte(`{"generated_at":"invalid"}`), 0600)
	if response := request("/api/v1/admin/studio/posting", true); response.Code != 503 {
		t.Fatal("invalid timestamp accepted")
	}

	// Receipt responses must omit provider traces, errors, and filesystem paths.
	os.WriteFile(filepath.Join(h.StudioStateRoot, "latest.json"), []byte(`{"status":"success","mode":"plan","draft_count":3,"error":"sensitive","note":"/private/path","provider_evidence":{"secret":"hidden"}}`), 0600)
	response := request("/api/v1/admin/studio/jobs", true)
	for _, forbidden := range []string{"sensitive", "/private/path", "hidden"} {
		if strings.Contains(response.Body.String(), forbidden) {
			t.Fatal("receipt leaked private field")
		}
	}
}

func TestStudioAssetBudgetIsSeparateAndStillProtected(t *testing.T) {
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "catalog.json"), []byte(`{"version":1,"brands":[],"media":[],"files":{}}`), 0600); err != nil {
		t.Fatal(err)
	}
	cfg := &config.Config{JWTSecret: "test-asset-budget"}
	r := New(cfg, &handlers.Handler{StudioRoot: root})
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": "test", "exp": time.Now().Add(time.Hour).Unix()}).SignedString([]byte(cfg.JWTSecret))
	request := func(method, path string, auth bool) int {
		req := httptest.NewRequest(method, path, nil)
		if auth {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w.Code
	}
	asset := "/api/v1/admin/studio/assets/" + strings.Repeat("a", 64)
	for i := 0; i < GeneralRateLimit+1; i++ {
		if code := request("GET", asset, true); code != 404 {
			t.Fatalf("asset %d: %d", i, code)
		}
	}
	if code := request("GET", "/api/v1/admin/studio", true); code != 200 {
		t.Fatalf("assets blocked catalog: %d", code)
	}
	if code := request("GET", asset, false); code != 401 {
		t.Fatalf("anonymous asset: %d", code)
	}
	for i := GeneralRateLimit + 2; i < StudioAssetRateLimit; i++ {
		request("GET", asset, true)
	}
	if code := request("GET", asset, true); code != 429 {
		t.Fatalf("asset budget unbounded: %d", code)
	}
	for i := 1; i < GeneralRateLimit; i++ {
		if code := request("GET", "/healthz", false); code != 200 {
			t.Fatalf("general request %d: %d", i, code)
		}
	}
	if code := request("GET", "/healthz", false); code != 429 {
		t.Fatalf("general budget changed: %d", code)
	}
	if code := request("POST", asset, true); code != 429 {
		t.Fatalf("write escaped general budget: %d", code)
	}
	if code := request("GET", "/api/v1/admin/studio/assets/invalid", true); code != 429 {
		t.Fatalf("invalid path escaped general budget: %d", code)
	}

	r = New(cfg, &handlers.Handler{StudioRoot: root})
	for i := 0; i < LoginRateLimit; i++ {
		if code := request("POST", "/api/v1/auth/login", false); code == 429 {
			t.Fatalf("login limited too soon: %d", i)
		}
	}
	if code := request("POST", "/api/v1/auth/login", false); code != 429 {
		t.Fatalf("login budget changed: %d", code)
	}
}

func TestEditableProjectRegistryRejectsAnonymousAccess(t *testing.T) {
	r := New(&config.Config{JWTSecret: "test"}, &handlers.Handler{})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest("GET", "/api/v1/admin/projects", nil))
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("anonymous registry read: %d", w.Code)
	}
}
