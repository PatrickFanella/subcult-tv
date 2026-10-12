-- Approval receipts are claimed before Buffer receives a write. Unknown outcomes
-- stay uncertain and cannot be retried as fresh submissions.
CREATE TABLE buffer_schedules (
 draft_id TEXT PRIMARY KEY,
 version INTEGER NOT NULL DEFAULT 1,
 channel_id TEXT NOT NULL,
 caption TEXT NOT NULL,
 due_at TIMESTAMPTZ NOT NULL,
 payload_hash TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('submitting','scheduled','uncertain')),
 provider_post_id TEXT NOT NULL DEFAULT '',
 approved_by TEXT NOT NULL,
 approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
