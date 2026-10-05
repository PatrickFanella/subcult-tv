-- Review feedback for the drafting pipeline. Rows are appended, never edited;
-- Kvant pulls them through the admin API. Nothing here is public.
CREATE TABLE IF NOT EXISTS draft_decisions (
    id BIGSERIAL PRIMARY KEY,
    draft_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'x', 'bluesky')),
    account TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('approved_as_is', 'approved_edited', 'rejected', 'revision_requested', 'snoozed')),
    original_text TEXT NOT NULL,
    final_text TEXT NOT NULL,
    diff_stats JSONB NOT NULL DEFAULT '{}',
    image_choice TEXT NOT NULL DEFAULT 'none' CHECK (image_choice IN ('prepared', 'candidate', 'uploaded', 'none')),
    original_due_at TIMESTAMPTZ,
    final_due_at TIMESTAMPTZ,
    reason_codes TEXT[] NOT NULL DEFAULT '{}',
    note TEXT NOT NULL DEFAULT '',
    checklist JSONB NOT NULL DEFAULT '[]',
    snooze_until TIMESTAMPTZ,
    decided_by TEXT NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS draft_decisions_decided_at ON draft_decisions (decided_at);
CREATE INDEX IF NOT EXISTS draft_decisions_draft ON draft_decisions (draft_id, decided_at DESC);

-- Keep the prepared caption from the first save so edits can be measured.
ALTER TABLE social_review_drafts ADD COLUMN IF NOT EXISTS original_caption TEXT NOT NULL DEFAULT '';
ALTER TABLE social_review_drafts ADD COLUMN IF NOT EXISTS image_choice TEXT NOT NULL DEFAULT 'none';
