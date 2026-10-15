CREATE TABLE IF NOT EXISTS tweet_requests (
    id BIGSERIAL PRIMARY KEY,
    account TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    error TEXT NOT NULL DEFAULT '',
    result_draft_id TEXT NOT NULL DEFAULT '',
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS tweet_requests_open ON tweet_requests(account) WHERE status IN ('pending', 'running');
CREATE INDEX IF NOT EXISTS tweet_requests_requested ON tweet_requests(requested_at);
