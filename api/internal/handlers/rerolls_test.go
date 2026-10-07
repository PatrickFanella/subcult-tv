package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

func TestRerollQueueIntegration(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	const instagram = "20261006T093000.000000Z-changemaker:0"
	const x = "20261006T093000.000000Z-radar:0"
	image := strings.Repeat("a", 64)
	root := t.TempDir()
	due := time.Now().Add(72 * time.Hour).Format(time.RFC3339)
	snapshot := postingDashboard{GeneratedAt: time.Now().UTC().Format(time.RFC3339), Drafts: []postingDraft{
		{ID: instagram, Mode: "changemaker", Text: "Prepared", DueAt: due, Media: postingMedia{Image: &postingImage{SHA256: image}}},
		{ID: x, Mode: "radar", Text: "Short", DueAt: due},
	}}
	data, _ := json.Marshal(snapshot)
	os.WriteFile(filepath.Join(root, "posting.json"), data, 0600)
	key := strings.Repeat("k", 40)
	h := &Handler{DB: db, StudioRoot: root, PostingPreparationKey: key}
	routes := chi.NewRouter()
	routes.Post("/review/{id}/reroll", h.RequestReroll)
	routes.Get("/rerolls", h.Rerolls)
	routes.Post("/prep/claim", h.ClaimRerolls)
	routes.Post("/prep/{id}", h.FinishReroll)
	t.Cleanup(func() { db.Exec(ctx, `DELETE FROM draft_rerolls WHERE draft_id IN ($1,$2)`, instagram, x) })
	admin := func(method, path, body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(method, path, bytes.NewBufferString(body))
		req = req.WithContext(context.WithValue(context.WithValue(req.Context(), middleware.RoleKey, "admin"), middleware.UserIDKey, "owner"))
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w
	}
	prep := func(path, body, bearer string) *httptest.ResponseRecorder {
		req := httptest.NewRequest("POST", path, bytes.NewBufferString(body))
		req.Header.Set("Authorization", "Bearer "+bearer)
		w := httptest.NewRecorder()
		routes.ServeHTTP(w, req)
		return w
	}
	path := "/review/" + strings.ReplaceAll(instagram, ":", "%3A") + "/reroll"
	if w := admin("POST", path, `{"mode":"everything"}`); w.Code != 400 {
		t.Fatal("unknown mode accepted", w.Code)
	}
	if w := admin("POST", path, `{"mode":"text","image_sha256":"`+strings.Repeat("b", 64)+`"}`); w.Code != 400 {
		t.Fatal("unknown image kept", w.Code)
	}
	if w := admin("POST", "/review/"+strings.ReplaceAll(x, ":", "%3A")+"/reroll", `{"mode":"text"}`); w.Code != 409 {
		t.Fatal("X draft re-rolled", w.Code)
	}
	if w := admin("POST", path, `{"mode":"image","caption":"  Keep this caption  ","note":"warmer"}`); w.Code != 201 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := admin("POST", path, `{"mode":"text"}`); w.Code != 409 {
		t.Fatal("second open re-roll accepted", w.Code)
	}
	if w := prep("/prep/claim", "", strings.Repeat("z", 40)); w.Code != 401 {
		t.Fatal("wrong key claimed", w.Code)
	}
	w := prep("/prep/claim", "", key)
	var claimed []draftReroll
	json.Unmarshal(w.Body.Bytes(), &claimed)
	if w.Code != 200 || len(claimed) != 1 || claimed[0].Caption != "Keep this caption" || claimed[0].Mode != "image" || claimed[0].Note != "warmer" || claimed[0].Status != "running" {
		t.Fatal("claim", w.Code, w.Body.String())
	}
	if w := prep("/prep/claim", "", key); w.Code != 200 || strings.TrimSpace(w.Body.String()) != "[]" {
		t.Fatal("running request claimed twice", w.Body.String())
	}
	done := `{"status":"done","result_draft_id":"20261006T094000.000000Z-changemaker:0"}`
	id := "/prep/" + jsonNumber(claimed[0].ID)
	if w := prep(id, done, key); w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	if w := prep(id, done, key); w.Code != 409 {
		t.Fatal("finished twice", w.Code)
	}
	w = admin("GET", "/rerolls", "")
	var listed []draftReroll
	json.Unmarshal(w.Body.Bytes(), &listed)
	found := false
	for _, r := range listed {
		found = found || (r.DraftID == instagram && r.Status == "done" && r.ResultDraftID != "" && r.FinishedAt != nil)
	}
	if !found {
		t.Fatal("finished re-roll not listed", w.Body.String())
	}
	// After it finishes, the draft can be re-rolled again.
	if w := admin("POST", path, `{"mode":"text","image_sha256":"`+image+`"}`); w.Code != 201 {
		t.Fatal(w.Code, w.Body.String())
	}
}

func jsonNumber(n int64) string {
	data, _ := json.Marshal(n)
	return string(data)
}
