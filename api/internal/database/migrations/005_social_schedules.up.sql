CREATE TABLE social_schedules (
    request_id TEXT PRIMARY KEY,
    payload_hash TEXT NOT NULL,
    account_id TEXT NOT NULL,
    caption TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    approved_by TEXT NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    media_id TEXT UNIQUE NOT NULL,
    media BYTEA NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('submitting', 'scheduled', 'uncertain')),
    provider_post_id TEXT NOT NULL DEFAULT ''
);
