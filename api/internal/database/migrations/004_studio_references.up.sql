CREATE TABLE studio_reference_imports (
    digest TEXT PRIMARY KEY,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    entry_count INTEGER NOT NULL
);

CREATE TABLE studio_references (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    collection TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    guide TEXT NOT NULL,
    preview TEXT NOT NULL DEFAULT '',
    images JSONB NOT NULL DEFAULT '[]',
    attachments JSONB NOT NULL DEFAULT '[]',
    provenance JSONB NOT NULL DEFAULT '{}',
    search_text TEXT NOT NULL,
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', name), 'A') ||
        setweight(to_tsvector('simple', summary), 'B') ||
        setweight(to_tsvector('simple', search_text), 'C')
    ) STORED,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX studio_references_search_idx ON studio_references USING GIN(search_vector);
CREATE INDEX studio_references_collection_idx ON studio_references(collection, name, id);
CREATE INDEX studio_references_updated_idx ON studio_references(updated_at DESC, id);

CREATE TABLE studio_reference_tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE studio_reference_tag_links (
    reference_id TEXT NOT NULL REFERENCES studio_references(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES studio_reference_tags(id) ON DELETE CASCADE,
    PRIMARY KEY(reference_id, tag_id)
);
CREATE INDEX studio_reference_tag_lookup_idx ON studio_reference_tag_links(tag_id, reference_id);
