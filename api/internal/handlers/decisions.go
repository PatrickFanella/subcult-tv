package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

// Reason codes the owner can attach to a rejection.
var decisionReasons = map[string]bool{
	"off_voice": true, "inaccurate": true, "boring": true, "wrong_image": true,
	"wrong_time": true, "duplicate": true, "other": true,
}

type checklistItem struct {
	Item    string `json:"item"`
	Checked bool   `json:"checked"`
}

type draftDecision struct {
	ID            int64           `json:"id"`
	DraftID       string          `json:"draft_id"`
	Platform      string          `json:"platform"`
	Account       string          `json:"account"`
	Decision      string          `json:"decision"`
	OriginalText  string          `json:"original_text"`
	FinalText     string          `json:"final_text"`
	DiffStats     json.RawMessage `json:"diff_stats"`
	ImageChoice   string          `json:"image_choice"`
	OriginalDueAt *time.Time      `json:"original_due_at"`
	FinalDueAt    *time.Time      `json:"final_due_at"`
	ReasonCodes   []string        `json:"reason_codes"`
	Note          string          `json:"note"`
	Checklist     json.RawMessage `json:"checklist"`
	SnoozeUntil   *time.Time      `json:"snooze_until"`
	DecidedBy     string          `json:"decided_by"`
	DecidedAt     time.Time       `json:"decided_at"`
}

// diffStats is a word-level summary of how much the owner changed a caption.
func diffStats(original, final string) map[string]any {
	count := func(text string) map[string]int {
		words := map[string]int{}
		for _, w := range strings.Fields(strings.ToLower(text)) {
			words[w]++
		}
		return words
	}
	before, after := count(original), count(final)
	added, removed := 0, 0
	for w, n := range after {
		if n > before[w] {
			added += n - before[w]
		}
	}
	for w, n := range before {
		if n > after[w] {
			removed += n - after[w]
		}
	}
	return map[string]any{
		"original_chars": utf8.RuneCountInString(original),
		"final_chars":    utf8.RuneCountInString(final),
		"words_added":    added,
		"words_removed":  removed,
		"changed":        strings.TrimSpace(original) != strings.TrimSpace(final),
	}
}

// imageChoice classifies saved media against the draft's prepared images.
func imageChoice(draft postingDraft, media []byte) string {
	if len(media) == 0 {
		return "none"
	}
	sum := sha256.Sum256(media)
	id := hex.EncodeToString(sum[:])
	if draft.Media.Image != nil && draft.Media.Image.SHA256 == id {
		return "prepared"
	}
	for _, c := range draft.Media.Candidates {
		if c.SHA256 == id {
			return "candidate"
		}
	}
	return "uploaded"
}

func cleanChecklist(items []checklistItem) []byte {
	if len(items) > 20 {
		items = items[:20]
	}
	clean := []checklistItem{}
	for _, item := range items {
		if text := strings.TrimSpace(item.Item); text != "" && len(text) <= 400 {
			clean = append(clean, checklistItem{Item: text, Checked: item.Checked})
		}
	}
	data, _ := json.Marshal(clean)
	return data
}

func parseDue(value string) *time.Time {
	at, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil
	}
	return &at
}

type decisionRecord struct {
	draft        postingDraft
	decision     string
	originalText string
	finalText    string
	imageChoice  string
	finalDue     *time.Time
	reasons      []string
	note         string
	checklist    []byte
	snoozeUntil  *time.Time
	user         string
}

func insertDecision(ctx context.Context, tx pgx.Tx, d decisionRecord) error {
	stats, _ := json.Marshal(diffStats(d.originalText, d.finalText))
	if d.reasons == nil {
		d.reasons = []string{}
	}
	if d.checklist == nil {
		d.checklist = []byte("[]")
	}
	_, err := tx.Exec(ctx, `INSERT INTO draft_decisions(draft_id,platform,account,decision,original_text,final_text,diff_stats,image_choice,original_due_at,final_due_at,reason_codes,note,checklist,snooze_until,decided_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
		d.draft.ID, draftPlatform(d.draft), d.draft.Account, d.decision, d.originalText, d.finalText, stats, d.imageChoice, parseDue(d.draft.DueAt), d.finalDue, d.reasons, d.note, d.checklist, d.snoozeUntil, d.user)
	return err
}

// RecordDraftDecision stores a rejection, revision request, snooze or a mark
// that the draft is particularly good. It never changes a provider schedule;
// submitted drafts are managed in PostyBirb, though they can still be marked good.
func (h *Handler) RecordDraftDecision(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	var input struct {
		Decision    string          `json:"decision"`
		Reasons     []string        `json:"reasons"`
		Note        string          `json:"note"`
		Checklist   []checklistItem `json:"checklist"`
		SnoozeUntil string          `json:"snooze_until"`
	}
	if json.NewDecoder(io.LimitReader(r.Body, 32<<10)).Decode(&input) != nil {
		writeError(w, 400, "Invalid decision")
		return
	}
	input.Note = strings.TrimSpace(input.Note)
	if utf8.RuneCountInString(input.Note) > 2000 || len(input.Reasons) > len(decisionReasons) {
		writeError(w, 400, "Keep the note under 2,000 characters")
		return
	}
	for _, reason := range input.Reasons {
		if !decisionReasons[reason] {
			writeError(w, 400, "Unknown rejection reason")
			return
		}
	}
	var snooze *time.Time
	switch input.Decision {
	case "rejected":
		if len(input.Reasons) == 0 && input.Note == "" {
			writeError(w, 400, "Choose a reason or add a note")
			return
		}
	case "revision_requested":
		if input.Note == "" {
			writeError(w, 400, "Describe the revision you want")
			return
		}
		input.Reasons = nil
	case "snoozed":
		snooze = parseDue(input.SnoozeUntil)
		if snooze == nil || !snooze.After(time.Now()) || snooze.After(time.Now().AddDate(0, 0, 30)) {
			writeError(w, 400, "Snooze for up to 30 days")
			return
		}
		input.Reasons = nil
	case "favorited":
		input.Reasons = nil
	default:
		writeError(w, 400, "Choose reject, request revision, snooze or mark as good")
		return
	}
	id, err := url.PathUnescape(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, 400, "Invalid draft ID")
		return
	}
	draft, err := h.preparedDraft(id)
	if err != nil {
		writeError(w, 404, "Prepared draft not found. Refresh the review queue")
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		writeError(w, 503, "Decision could not be recorded")
		return
	}
	defer tx.Rollback(r.Context())
	if _, err = tx.Exec(r.Context(), `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, id); err != nil {
		writeError(w, 503, "Decision could not be recorded")
		return
	}
	finalText, choice := draft.Text, "none"
	var finalDue *time.Time
	var savedDue time.Time
	var submitted bool
	err = tx.QueryRow(r.Context(), `SELECT d.caption,d.image_choice,d.due_at,EXISTS(SELECT 1 FROM social_schedules s WHERE s.request_id=d.request_id) FROM social_review_drafts d WHERE d.draft_id=$1`, id).Scan(&finalText, &choice, &savedDue, &submitted)
	if err == nil {
		finalDue = &savedDue
	} else if err != pgx.ErrNoRows {
		writeError(w, 503, "Decision could not be recorded")
		return
	}
	if submitted && input.Decision != "favorited" {
		writeError(w, 409, "This draft has already been submitted. Manage it in PostyBirb")
		return
	}
	user, _ := r.Context().Value(middleware.UserIDKey).(string)
	err = insertDecision(r.Context(), tx, decisionRecord{
		draft: draft, decision: input.Decision, originalText: draft.Text, finalText: finalText,
		imageChoice: choice, finalDue: finalDue, reasons: input.Reasons, note: input.Note,
		checklist: cleanChecklist(input.Checklist), snoozeUntil: snooze, user: user,
	})
	if err != nil || tx.Commit(r.Context()) != nil {
		writeError(w, 503, "Decision could not be recorded")
		return
	}
	writeJSON(w, 201, map[string]string{"draft_id": id, "decision": input.Decision})
}

// DraftDecisions returns review decisions since a time, for the review queue.
func (h *Handler) DraftDecisions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if r.Context().Value(middleware.RoleKey) != "admin" {
		writeError(w, 403, "Admin access required")
		return
	}
	since, ok := decisionsSince(w, r)
	if !ok {
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	result, err := h.queryDecisions(r.Context(), since, false)
	if err != nil {
		writeError(w, 503, "Review decisions are unavailable")
		return
	}
	writeJSON(w, 200, result)
}

type feedbackReroll struct {
	DraftID     string    `json:"draft_id"`
	Mode        string    `json:"mode"`
	Note        string    `json:"note"`
	RequestedAt time.Time `json:"requested_at"`
}

// PreparationFeedback lets the Kvant preparation key read the owner's review
// feedback (decisions other than snoozes, and re-roll notes) so drafting and
// prompt tuning can learn from it. It is read-only and returns no user IDs.
func (h *Handler) PreparationFeedback(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	if !secretAuthorized(r, h.PostingPreparationKey) {
		writeError(w, 401, "Preparation authentication required")
		return
	}
	since, ok := decisionsSince(w, r)
	if !ok {
		return
	}
	if h.DB == nil {
		writeError(w, 503, "Draft storage is unavailable")
		return
	}
	decisions, err := h.queryDecisions(r.Context(), since, true)
	if err != nil {
		writeError(w, 503, "Review feedback is unavailable")
		return
	}
	for i := range decisions {
		decisions[i].DecidedBy = ""
	}
	rows, err := h.DB.Query(r.Context(), `SELECT draft_id,mode,note,requested_at FROM draft_rerolls WHERE requested_at>$1 AND note<>'' ORDER BY requested_at,id LIMIT 500`, since)
	if err != nil {
		writeError(w, 503, "Review feedback is unavailable")
		return
	}
	defer rows.Close()
	rerolls := []feedbackReroll{}
	for rows.Next() {
		var f feedbackReroll
		if rows.Scan(&f.DraftID, &f.Mode, &f.Note, &f.RequestedAt) != nil {
			writeError(w, 503, "Review feedback is unavailable")
			return
		}
		rerolls = append(rerolls, f)
	}
	if rows.Err() != nil {
		writeError(w, 503, "Review feedback is unavailable")
		return
	}
	writeJSON(w, 200, map[string]any{"decisions": decisions, "rerolls": rerolls})
}

// decisionsSince reads the optional since parameter; the default is 30 days ago.
func decisionsSince(w http.ResponseWriter, r *http.Request) (time.Time, bool) {
	value := r.URL.Query().Get("since")
	if value == "" {
		return time.Now().AddDate(0, 0, -30), true
	}
	at, err := time.Parse(time.RFC3339, value)
	if err != nil {
		writeError(w, 400, "since must be an RFC 3339 time")
		return time.Time{}, false
	}
	return at, true
}

// queryDecisions returns up to 500 decisions after since, oldest first.
func (h *Handler) queryDecisions(ctx context.Context, since time.Time, skipSnoozes bool) ([]draftDecision, error) {
	rows, err := h.DB.Query(ctx, `SELECT id,draft_id,platform,account,decision,original_text,final_text,diff_stats,image_choice,original_due_at,final_due_at,reason_codes,note,checklist,snooze_until,decided_by,decided_at FROM draft_decisions WHERE decided_at>$1 AND NOT ($2 AND decision='snoozed') ORDER BY decided_at,id LIMIT 500`, since, skipSnoozes)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []draftDecision{}
	for rows.Next() {
		var d draftDecision
		if err := rows.Scan(&d.ID, &d.DraftID, &d.Platform, &d.Account, &d.Decision, &d.OriginalText, &d.FinalText, &d.DiffStats, &d.ImageChoice, &d.OriginalDueAt, &d.FinalDueAt, &d.ReasonCodes, &d.Note, &d.Checklist, &d.SnoozeUntil, &d.DecidedBy, &d.DecidedAt); err != nil {
			return nil, err
		}
		result = append(result, d)
	}
	return result, rows.Err()
}

// statusRecorder observes the delegated approval's status without buffering it.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	if s.status == 0 {
		s.status = code
	}
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(b []byte) (int, error) {
	if s.status == 0 {
		s.status = http.StatusOK
	}
	return s.ResponseWriter.Write(b)
}
