package handlers

import (
	"encoding/json"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// The Studio export records each preparation job's last outcome; the dashboard
// must pass it through unchanged and tolerate snapshots written without it.
func TestPostingDashboardPassesJobStatusThrough(t *testing.T) {
	root := t.TempDir()
	raw := map[string]any{
		"version":      1,
		"generated_at": time.Now().UTC().Format(time.RFC3339),
		"drafts":       []any{},
		"job_status": []map[string]any{
			{"job": "changemaker-instagram", "status": "success", "run_id": "r1", "started": "2026-11-02T09:20:00+00:00", "finished": "2026-11-02T09:24:00+00:00", "reason": "2 draft(s)"},
			{"job": "changemaker-publications", "status": "failed", "run_id": "", "started": "2026-11-02T09:25:00+00:00", "finished": "2026-11-02T09:25:30+00:00", "reason": "ConnectionError", "extra": "ignored"},
		},
	}
	data, _ := json.Marshal(raw)
	if err := os.WriteFile(filepath.Join(root, "posting.json"), data, 0600); err != nil {
		t.Fatal(err)
	}
	h := &Handler{StudioRoot: root}
	rec := httptest.NewRecorder()
	h.PostingDashboard(rec, httptest.NewRequest("GET", "/", nil))
	if rec.Code != 200 {
		t.Fatalf("status %d: %s", rec.Code, rec.Body.String())
	}
	var out struct {
		JobStatus []postingJobStatus `json:"job_status"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if len(out.JobStatus) != 2 {
		t.Fatalf("job_status entries %d: %s", len(out.JobStatus), rec.Body.String())
	}
	if out.JobStatus[0].Job != "changemaker-instagram" || out.JobStatus[0].Status != "success" || out.JobStatus[0].Reason != "2 draft(s)" {
		t.Fatalf("first entry changed: %+v", out.JobStatus[0])
	}
	if out.JobStatus[1].Status != "failed" || out.JobStatus[1].Finished != "2026-11-02T09:25:30+00:00" {
		t.Fatalf("second entry changed: %+v", out.JobStatus[1])
	}
}

func TestPostingDashboardOmitsJobStatusWhenAbsent(t *testing.T) {
	root := t.TempDir()
	writeSnapshot(t, root, nil)
	h := &Handler{StudioRoot: root}
	rec := httptest.NewRecorder()
	h.PostingDashboard(rec, httptest.NewRequest("GET", "/", nil))
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
	var out map[string]json.RawMessage
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if _, present := out["job_status"]; present {
		t.Fatal("job_status should be omitted for snapshots that never recorded it")
	}
}
