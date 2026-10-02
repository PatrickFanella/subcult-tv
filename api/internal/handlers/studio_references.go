package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type referenceAttachment struct {
	Name  string `json:"name"`
	Asset string `json:"asset"`
}
type studioReference struct {
	ID          string                `json:"id"`
	Name        string                `json:"name"`
	URL         string                `json:"url"`
	Collection  string                `json:"collection"`
	Summary     string                `json:"summary"`
	Guide       string                `json:"guide,omitempty"`
	Preview     string                `json:"preview"`
	Images      []string              `json:"images,omitempty"`
	Attachments []referenceAttachment `json:"attachments,omitempty"`
	Provenance  json.RawMessage       `json:"provenance,omitempty"`
	Tags        []string              `json:"tags"`
	UpdatedAt   string                `json:"updated_at,omitempty"`
}

var referenceID = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{0,100}$`)

// SyncStudioReferences imports a complete exported snapshot in one transaction.
// It upserts only: reimporting a partial downloader snapshot never deletes prior work.
func (h *Handler) SyncStudioReferences(ctx context.Context) (int, error) {
	root, err := os.OpenRoot(h.StudioRoot)
	if err != nil {
		return 0, err
	}
	defer root.Close()
	f, err := root.Open("references.json")
	if err != nil {
		return 0, err
	}
	defer f.Close()
	data, err := io.ReadAll(io.LimitReader(f, (128<<20)+1))
	if err != nil {
		return 0, err
	}
	if len(data) > 128<<20 {
		return 0, fmt.Errorf("reference export exceeds 128 MiB")
	}
	var bundle struct {
		Version int               `json:"version"`
		Entries []studioReference `json:"entries"`
	}
	if err := json.Unmarshal(data, &bundle); err != nil {
		return 0, err
	}
	if bundle.Version != 1 {
		return 0, fmt.Errorf("unsupported reference export version")
	}
	catalog, err := h.readStudioCatalog()
	if err != nil {
		return 0, err
	}
	seen := map[string]bool{}
	for _, entry := range bundle.Entries {
		if !referenceID.MatchString(entry.ID) || seen[entry.ID] || entry.Name == "" || entry.Guide == "" || entry.Collection == "" {
			return 0, fmt.Errorf("invalid reference entry %q", entry.ID)
		}
		seen[entry.ID] = true
		assets := append([]string{}, entry.Images...)
		if entry.Preview != "" {
			assets = append(assets, entry.Preview)
		}
		for _, attachment := range entry.Attachments {
			assets = append(assets, attachment.Asset)
		}
		for _, id := range assets {
			if file, ok := catalog.Files[id]; !ok || !studioID.MatchString(id) || file.SHA256 != id {
				return 0, fmt.Errorf("unknown reference asset in %s", entry.ID)
			}
		}
	}
	digestBytes := sha256.Sum256(data)
	digest := hex.EncodeToString(digestBytes[:])
	tx, err := h.DB.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)
	if _, err = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(73629401)`); err != nil {
		return 0, err
	}
	var exists bool
	if err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM studio_reference_imports WHERE digest=$1)`, digest).Scan(&exists); err != nil {
		return 0, err
	}
	if exists {
		return len(bundle.Entries), nil
	}
	for _, entry := range bundle.Entries {
		images, _ := json.Marshal(entry.Images)
		attachments, _ := json.Marshal(entry.Attachments)
		if len(entry.Provenance) == 0 {
			entry.Provenance = json.RawMessage(`{}`)
		}
		if _, err = tx.Exec(ctx, `INSERT INTO studio_references
            (id,name,source_url,collection,summary,guide,preview,images,attachments,provenance,search_text)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,source_url=EXCLUDED.source_url,
            collection=EXCLUDED.collection,summary=EXCLUDED.summary,guide=EXCLUDED.guide,
            preview=EXCLUDED.preview,images=EXCLUDED.images,attachments=EXCLUDED.attachments,
            provenance=EXCLUDED.provenance,search_text=EXCLUDED.search_text,
            updated_at=CASE WHEN studio_references.guide IS DISTINCT FROM EXCLUDED.guide
                OR studio_references.search_text IS DISTINCT FROM EXCLUDED.search_text
                OR studio_references.images IS DISTINCT FROM EXCLUDED.images
                THEN now() ELSE studio_references.updated_at END`,
			entry.ID, entry.Name, entry.URL, entry.Collection, entry.Summary, entry.Guide,
			entry.Preview, images, attachments, entry.Provenance, entry.Guide+" "+strings.Join(entry.Tags, " ")); err != nil {
			return 0, err
		}
		if _, err = tx.Exec(ctx, `DELETE FROM studio_reference_tag_links WHERE reference_id=$1`, entry.ID); err != nil {
			return 0, err
		}
		for _, tag := range entry.Tags {
			tag = strings.TrimSpace(tag)
			if tag == "" || len(tag) > 100 {
				return 0, fmt.Errorf("invalid tag for %s", entry.ID)
			}
			if _, err = tx.Exec(ctx, `WITH tag AS (
                INSERT INTO studio_reference_tags(name) VALUES($2)
                ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING id)
                INSERT INTO studio_reference_tag_links(reference_id,tag_id)
                SELECT $1,id FROM tag ON CONFLICT DO NOTHING`, entry.ID, tag); err != nil {
				return 0, err
			}
		}
	}
	if _, err = tx.Exec(ctx, `INSERT INTO studio_reference_imports(digest,entry_count) VALUES($1,$2)`, digest, len(bundle.Entries)); err != nil {
		return 0, err
	}
	return len(bundle.Entries), tx.Commit(ctx)
}

const referenceTagsSQL = `ARRAY(SELECT t.name FROM studio_reference_tags t
    JOIN studio_reference_tag_links l ON t.id=l.tag_id WHERE l.reference_id=r.id ORDER BY t.name)`

func (h *Handler) ListStudioReferences(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if h.DB == nil {
		writeError(w, 503, "Reference index is not connected")
		return
	}
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	tags := r.URL.Query()["tag"]
	collection := r.URL.Query().Get("collection")
	if len(q) > 200 || len(tags) > 20 || len(collection) > 100 {
		writeError(w, 400, "Search filters are too long")
		return
	}
	page, perPage, offset := pagination(r)
	if page > 100000 {
		writeError(w, 400, "Page is out of range")
		return
	}
	if perPage > 48 {
		perPage = 48
		offset = (page - 1) * perPage
	}
	// Text search covers the whole guide; the escaped substring branch supports partial names.
	pattern := "%" + strings.NewReplacer(`\`, `\\`, "%", `\%`, "_", `\_`).Replace(q) + "%"
	where := ` WHERE ($1='' OR r.search_vector @@ websearch_to_tsquery('simple',$1) OR r.name ILIKE $2)
        AND ($3='' OR r.collection=$3)
        AND NOT EXISTS(SELECT 1 FROM unnest($4::text[]) selected(name) WHERE NOT EXISTS(
            SELECT 1 FROM studio_reference_tag_links l JOIN studio_reference_tags t ON t.id=l.tag_id
            WHERE l.reference_id=r.id AND t.name=selected.name))`
	args := []any{q, pattern, collection, tags}
	var total int64
	if err := h.DB.QueryRow(r.Context(), `SELECT count(*) FROM studio_references r`+where, args...).Scan(&total); err != nil {
		writeError(w, 500, "Could not search references")
		return
	}
	order := "lower(r.name),r.id"
	switch r.URL.Query().Get("sort") {
	case "newest":
		order = "r.updated_at DESC,r.id"
	case "relevance", "":
		if q != "" {
			order = "ts_rank_cd(r.search_vector,websearch_to_tsquery('simple',$1)) DESC,lower(r.name),r.id"
		}
	case "name":
	default:
		writeError(w, 400, "Unknown sort order")
		return
	}
	args = append(args, perPage, offset)
	rows, err := h.DB.Query(r.Context(), `SELECT r.id,r.name,r.source_url,r.collection,r.summary,r.preview,`+referenceTagsSQL+
		` FROM studio_references r`+where+` ORDER BY `+order+` LIMIT $5 OFFSET $6`, args...)
	if err != nil {
		writeError(w, 500, "Could not search references")
		return
	}
	defer rows.Close()
	result := []studioReference{}
	for rows.Next() {
		var entry studioReference
		if err = rows.Scan(&entry.ID, &entry.Name, &entry.URL, &entry.Collection, &entry.Summary, &entry.Preview, &entry.Tags); err != nil {
			writeError(w, 500, "Could not read references")
			return
		}
		result = append(result, entry)
	}
	if rows.Err() != nil {
		writeError(w, 500, "Could not read references")
		return
	}
	writeJSON(w, 200, map[string]any{"items": result, "total": total, "page": page, "per_page": perPage, "total_pages": totalPages(total, perPage)})
}

func (h *Handler) StudioReferenceFacets(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if h.DB == nil {
		writeError(w, 503, "Reference index is not connected")
		return
	}
	type facet struct {
		Name  string `json:"name"`
		Count int    `json:"count"`
	}
	result := map[string][]facet{"tags": {}, "collections": {}}
	for key, query := range map[string]string{
		"tags":        `SELECT t.name,count(*) FROM studio_reference_tags t JOIN studio_reference_tag_links l ON t.id=l.tag_id GROUP BY t.name ORDER BY t.name`,
		"collections": `SELECT collection,count(*) FROM studio_references GROUP BY collection ORDER BY collection`,
	} {
		rows, err := h.DB.Query(r.Context(), query)
		if err != nil {
			writeError(w, 500, "Could not load filters")
			return
		}
		for rows.Next() {
			var f facet
			if err = rows.Scan(&f.Name, &f.Count); err != nil {
				rows.Close()
				writeError(w, 500, "Could not load filters")
				return
			}
			result[key] = append(result[key], f)
		}
		err = rows.Err()
		rows.Close()
		if err != nil {
			writeError(w, 500, "Could not load filters")
			return
		}
	}
	writeJSON(w, 200, result)
}

func (h *Handler) GetStudioReference(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	id := chi.URLParam(r, "id")
	if !referenceID.MatchString(id) {
		writeError(w, 404, "Reference not found")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Reference index is not connected")
		return
	}
	var entry studioReference
	err := h.DB.QueryRow(r.Context(), `SELECT r.id,r.name,r.source_url,r.collection,r.summary,r.guide,r.preview,r.images,r.attachments,r.provenance,`+
		referenceTagsSQL+`,to_char(r.updated_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') FROM studio_references r WHERE r.id=$1`, id).
		Scan(&entry.ID, &entry.Name, &entry.URL, &entry.Collection, &entry.Summary, &entry.Guide, &entry.Preview, &entry.Images, &entry.Attachments, &entry.Provenance, &entry.Tags, &entry.UpdatedAt)
	if err == pgx.ErrNoRows {
		writeError(w, 404, "Reference not found")
		return
	}
	if err != nil {
		writeError(w, 500, "Could not load reference")
		return
	}
	writeJSON(w, 200, entry)
}
