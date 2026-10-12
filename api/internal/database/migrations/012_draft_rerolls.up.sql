-- Owner requests to regenerate one prepared draft. The website only queues
-- them; Kvant claims each with the preparation key, regenerates the caption,
-- the image or both, and syncs a replacement draft that supersedes the old one.
CREATE TABLE IF NOT EXISTS draft_rerolls (
    id BIGSERIAL PRIMARY KEY,
    draft_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('text', 'image', 'both')),
    note TEXT NOT NULL DEFAULT '',
    caption TEXT NOT NULL DEFAULT '',
    image_sha256 TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    error TEXT NOT NULL DEFAULT '',
    result_draft_id TEXT NOT NULL DEFAULT '',
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);
-- One open request per draft.
CREATE UNIQUE INDEX IF NOT EXISTS draft_rerolls_open ON draft_rerolls (draft_id) WHERE status IN ('pending', 'running');
CREATE INDEX IF NOT EXISTS draft_rerolls_requested_at ON draft_rerolls (requested_at);
