CREATE TABLE IF NOT EXISTS publication_review (
 id TEXT PRIMARY KEY,
 platform TEXT NOT NULL CHECK(platform IN ('website','patreon')),
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 excerpt TEXT NOT NULL DEFAULT '',
 due_at TIMESTAMPTZ NOT NULL,
 audience TEXT NOT NULL DEFAULT '',
 version INTEGER NOT NULL DEFAULT 1,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','submitting','scheduled','uncertain','published')),
 post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
 source JSONB NOT NULL,
 approved_by TEXT NOT NULL DEFAULT '',
 approved_at TIMESTAMPTZ,
 provider_id TEXT NOT NULL DEFAULT '',
 provider_url TEXT NOT NULL DEFAULT '',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS publication_review_due ON publication_review(platform,status,due_at);
