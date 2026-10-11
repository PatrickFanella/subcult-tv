CREATE TABLE bluesky_schedules (
    draft_id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    caption TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    media BYTEA NOT NULL DEFAULT ''::bytea,
    due_at TIMESTAMPTZ NOT NULL,
    payload_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('submitting', 'scheduled', 'uncertain')),
    provider_post_id TEXT NOT NULL DEFAULT '',
    approved_by TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
