CREATE TABLE IF NOT EXISTS project_publications (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    snapshot JSONB NOT NULL,
    approved_by UUID NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
