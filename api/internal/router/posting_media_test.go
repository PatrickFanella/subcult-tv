package router

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
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

func TestPreparedPostingMediaIsPrivateAndHashBound(t *testing.T) {
	root := t.TempDir()
	os.Mkdir(filepath.Join(root, "posting-media"), 0700)
	store := func(data []byte) string {
		sum := sha256.Sum256(data)
		id := hex.EncodeToString(sum[:])
		os.WriteFile(filepath.Join(root, "posting-media", id+".jpg"), data, 0600)
		return id
	}
	good := store(append([]byte{0xff, 0xd8, 0xff}, bytes.Repeat([]byte("a"), 100)...))
	candidate := store(append([]byte{0xff, 0xd8, 0xff}, bytes.Repeat([]byte("b"), 100)...))
	unreferenced := store(append([]byte{0xff, 0xd8, 0xff}, bytes.Repeat([]byte("c"), 100)...))
	xImage := store(append([]byte{0xff, 0xd8, 0xff}, bytes.Repeat([]byte("d"), 100)...))
	expiredImage := store(append([]byte{0xff, 0xd8, 0xff}, bytes.Repeat([]byte("e"), 100)...))
	tampered := store(append([]byte{0xff, 0xd8, 0xff}, bytes.Repeat([]byte("f"), 100)...))
	os.WriteFile(filepath.Join(root, "posting-media", tampered+".jpg"), []byte("changed"), 0600)
	outside := filepath.Join(t.TempDir(), "outside.jpg")
	linked := strings.Repeat("9", 64)
	os.WriteFile(outside, []byte("private"), 0600)
	os.Symlink(outside, filepath.Join(root, "posting-media", linked+".jpg"))
	future := time.Now().Add(72 * time.Hour).Format(time.RFC3339)
	ref := func(id string) map[string]any { return map[string]any{"sha256": id, "bytes": 103} }
	snapshot := map[string]any{"version": 1, "generated_at": time.Now().UTC().Format(time.RFC3339), "drafts": []any{
		map[string]any{"id": "cm:0", "mode": "changemaker", "expires_at": future, "media": map[string]any{"image": ref(good), "candidates": []any{ref(candidate), ref(tampered), ref(linked)}}},
		map[string]any{"id": "plan:0", "mode": "plan", "due_at": future, "media": map[string]any{"image": ref(xImage)}},
		map[string]any{"id": "cm:1", "mode": "changemaker", "expires_at": "2020-01-01T00:00:00Z", "media": map[string]any{"image": ref(expiredImage)}},
	}}
	data, _ := json.Marshal(snapshot)
	os.WriteFile(filepath.Join(root, "posting.json"), data, 0600)

	cfg := &config.Config{JWTSecret: "posting-media-secret"}
	r := New(cfg, &handlers.Handler{StudioRoot: root})
	sign := func(role string) string {
		token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": "owner", "role": role, "exp": time.Now().Add(time.Hour).Unix()}).SignedString([]byte(cfg.JWTSecret))
		return token
	}
	get := func(id, token string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/studio/posting-media/"+id, nil)
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w
	}
	admin := sign("admin")
	if w := get(good, ""); w.Code != 401 {
		t.Fatalf("anonymous: %d", w.Code)
	}
	if w := get(good, sign("editor")); w.Code != 403 {
		t.Fatalf("non-admin: %d", w.Code)
	}
	for _, id := range []string{good, candidate} {
		w := get(id, admin)
		if w.Code != 200 || w.Header().Get("Content-Type") != "image/jpeg" || w.Header().Get("Cache-Control") != "private, no-store" || w.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Fatalf("referenced image %s: %d %v", id, w.Code, w.Header())
		}
	}
	for name, id := range map[string]string{"unreferenced": unreferenced, "x draft": xImage, "expired": expiredImage, "tampered": tampered, "symlink": linked, "uppercase": strings.ToUpper(good), "traversal": "..%2F..%2Fposting.json", "short": good[:63]} {
		if w := get(id, admin); w.Code != 404 {
			t.Fatalf("%s served: %d", name, w.Code)
		}
	}
}
