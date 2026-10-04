-- Saved edits remain private until a separate, version-bound approval.
CREATE TABLE IF NOT EXISTS social_review_drafts (
    draft_id TEXT PRIMARY KEY,
    version INTEGER NOT NULL,
    request_id TEXT UNIQUE NOT NULL,
    account_id TEXT NOT NULL,
    caption TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    media BYTEA NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
