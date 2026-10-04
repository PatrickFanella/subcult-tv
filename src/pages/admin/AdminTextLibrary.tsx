import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudioCatalog, listPosts, type StudioDocument } from '@/lib/api';
import { AdminHeader } from '@/components/admin/crud';
import { AssetDownload } from '@/components/admin/StudioAsset';
import LibraryMarkdown from '@/components/admin/LibraryMarkdown';
import '@/styles/studio.css';

export default function AdminTextLibrary() {
  const [documents, setDocuments] = useState<StudioDocument[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('all');
  const [selected, setSelected] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  useEffect(() => {
    let active = true;
    Promise.allSettled([getStudioCatalog(), listPosts({ all: true, page, perPage: 100 })]).then(
      ([library, articles]) => {
        if (!active) return;
        const sources = library.status === 'fulfilled' ? (library.value.documents ?? []) : [];
        const stored: StudioDocument[] =
          articles.status === 'fulfilled'
            ? articles.value.data.map((p) => ({
                id: p.id,
                title: p.title,
                name: p.slug,
                section: 'Editable articles',
                tags: p.tags,
                body: p.content,
                asset: '',
                status: p.published ? 'published' : 'private draft',
              }))
            : [];
        setDocuments([...stored, ...sources]);
        setPages(articles.status === 'fulfilled' ? articles.value.total_pages : 1);
        setErrors(
          [library, articles].flatMap((result, index) =>
            result.status === 'rejected'
              ? [
                  `${index === 0 ? 'Source documents' : 'Article store'} could not load: ${result.reason instanceof Error ? result.reason.message : 'Unavailable'}`,
                ]
              : [],
          ),
        );
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [page]);
  const visible = documents.filter(
    (d) =>
      (section === 'all' || d.section === section) &&
      `${d.title} ${d.name} ${d.tags.join(' ')} ${d.body}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const key = (d: StudioDocument) => `${d.section}:${d.name}`;
  const document = visible.find((d) => key(d) === selected) ?? visible[0];
  return (
    <section className="studio-page">
      <AdminHeader
        overline="SUBCULT / WRITING & COPY"
        title="Text library"
        action={<Link to="/admin/posts/articles/manage">Add or edit an article →</Link>}
      />
      <p className="studio-note">
        Essays, development notes, brand voice and reusable copy. Source documents are read-only
        snapshots; the article store holds editable drafts. Publication is a separate choice.
      </p>
      <div className="studio-tools">
        <label>
          Search text
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, tag or a phrase in the document…"
          />
        </label>
        <label>
          Collection
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="all">All text</option>
            {['Editable articles', 'Articles', 'Studio'].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <Link to="/admin/studio">Brand & asset library →</Link>
      </div>
      {loading && <p role="status">Loading text…</p>}
      {errors.map((e) => (
        <p key={e} role="alert">
          {e}
        </p>
      ))}
      <p role="status">{visible.length} documents on this page</p>
      {!loading && !visible.length && (
        <p>No text matches this search. Try another phrase or collection.</p>
      )}
      {document && (
        <div className="text-library-layout">
          <nav aria-label="Documents">
            {visible.map((d) => (
              <button
                key={key(d)}
                aria-pressed={key(document) === key(d)}
                onClick={() => setSelected(key(d))}
              >
                <strong>{d.title}</strong>
                <small>
                  {d.section} · {d.status}
                </small>
              </button>
            ))}
          </nav>
          <article>
            <p className="studio-label">
              {document.section} / {document.status}
            </p>
            <h2>{document.title}</h2>
            <p className="studio-note">
              {document.name} · {document.tags.join(' · ')}
            </p>
            <LibraryMarkdown>{document.body}</LibraryMarkdown>
            {document.asset ? (
              <AssetDownload id={document.asset} name={document.name} />
            ) : (
              <Link to="/admin/posts/articles/manage">Manage editable articles →</Link>
            )}
          </article>
        </div>
      )}
      {pages > 1 && (
        <div className="studio-switch">
          <button
            disabled={page === 1}
            onClick={() => {
              setLoading(true);
              setPage((p) => p - 1);
            }}
          >
            Previous articles
          </button>
          <span>
            Article page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
          >
            Next articles
          </button>
        </div>
      )}
    </section>
  );
}
