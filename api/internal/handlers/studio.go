package handlers

import (
	"encoding/json"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"time"

	"github.com/go-chi/chi/v5"
)

var studioID = regexp.MustCompile(`^[a-f0-9]{64}$`)

type studioFile struct {
	Path   string `json:"path"`
	SHA256 string `json:"sha256"`
	Name   string `json:"name"`
}
type studioCatalog struct {
	Version int                   `json:"version"`
	Brands  json.RawMessage       `json:"brands"`
	Media   json.RawMessage       `json:"media"`
	Files   map[string]studioFile `json:"files"`
}

func (h *Handler) readStudioCatalog() (*studioCatalog, error) {
	root, err := os.OpenRoot(h.StudioRoot)
	if err != nil {
		return nil, err
	}
	defer root.Close()
	f, err := root.Open("catalog.json")
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var catalog studioCatalog
	err = json.NewDecoder(io.LimitReader(f, 4<<20)).Decode(&catalog)
	return &catalog, err
}

func (h *Handler) StudioCatalog(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	catalog, err := h.readStudioCatalog()
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "Studio library is not connected")
		return
	}
	writeJSON(w, http.StatusOK, catalog)
}

func (h *Handler) StudioAsset(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	id := chi.URLParam(r, "id")
	if !studioID.MatchString(id) {
		writeError(w, 404, "Asset not found")
		return
	}
	catalog, err := h.readStudioCatalog()
	if err != nil {
		writeError(w, 503, "Studio library is not connected")
		return
	}
	entry, ok := catalog.Files[id]
	ext := filepath.Ext(entry.Path)
	allowed := map[string]bool{".svg": true, ".png": true, ".jpg": true, ".jpeg": true, ".webp": true, ".mp4": true, ".ttf": true, ".woff2": true, ".txt": true, ".css": true, ".json": true}
	if !ok || !allowed[ext] || entry.Path != "assets/"+id+ext || entry.SHA256 != id {
		writeError(w, 404, "Asset not found")
		return
	}
	root, err := os.OpenRoot(h.StudioRoot)
	if err != nil {
		writeError(w, 503, "Studio library is not connected")
		return
	}
	defer root.Close()
	f, err := root.Open(entry.Path)
	if err != nil {
		writeError(w, 404, "Asset not found")
		return
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil || !info.Mode().IsRegular() {
		writeError(w, 404, "Asset not found")
		return
	}
	w.Header().Set("Content-Type", mime.TypeByExtension(ext))
	w.Header().Set("X-Content-Type-Options", "nosniff")
	if ext == ".ttf" || ext == ".woff2" || ext == ".txt" || ext == ".css" || ext == ".json" {
		w.Header().Set("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": entry.Name}))
	}
	w.Header().Set("Content-Security-Policy", "sandbox; default-src 'none'; style-src 'unsafe-inline'")
	http.ServeContent(w, r, entry.Name, info.ModTime(), f)
}

// Only summary fields cross the API boundary. Provider traces, errors and local paths stay private.
func (h *Handler) StudioJobs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	result := map[string]any{"connected": false, "publishing_enabled": false, "receipt": nil}
	root, err := os.OpenRoot(h.StudioStateRoot)
	if err != nil {
		writeJSON(w, 200, result)
		return
	}
	defer root.Close()
	f, err := root.Open("latest.json")
	if err != nil {
		writeJSON(w, 200, result)
		return
	}
	defer f.Close()
	var receipt struct {
		Status     string `json:"status"`
		Mode       string `json:"mode"`
		Week       string `json:"week"`
		RunID      string `json:"run_id"`
		DraftCount int    `json:"draft_count"`
		CheckedAt  string `json:"checked_at"`
	}
	if json.NewDecoder(io.LimitReader(f, 64<<10)).Decode(&receipt) != nil {
		writeJSON(w, 200, result)
		return
	}
	info, err := f.Stat()
	if err != nil {
		writeJSON(w, 200, result)
		return
	}
	result["connected"] = true
	result["receipt"] = receipt
	result["observed_at"] = info.ModTime().UTC().Format(time.RFC3339)
	result["stale"] = time.Since(info.ModTime()) > 24*time.Hour
	writeJSON(w, 200, result)
}
