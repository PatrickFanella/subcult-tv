import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUpRight, Grid2X2, List, Search, X } from 'lucide-react';
import {
  getStudioAsset,
  getStudioPreview,
  getStudioReference,
  getStudioReferenceFacets,
  getStudioReferences,
  type ReferenceFacets,
  type ReferenceResults,
  type StudioReference,
} from '@/lib/api';
import '@/styles/studio.css';
import '@/styles/references.css';

function ReferenceImage({ id, name }: { id: string; name: string }) {
  const target = useRef<HTMLSpanElement>(null);
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let objectURL = '';
    const load = () =>
      getStudioPreview(id)
        .then((blob) => {
          if (cancelled) return;
          objectURL = URL.createObjectURL(blob);
          setUrl(objectURL);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === 'undefined') {
      void load();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            void load();
          }
        },
        { rootMargin: '200px' },
      );
      if (target.current) observer.observe(target.current);
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [id]);
  return (
    <span ref={target} className="reference-image">
      {failed ? (
        <span className="reference-placeholder">Preview unavailable</span>
      ) : !url ? (
        <span className="reference-placeholder">Loading preview…</span>
      ) : (
        <img src={url} alt={`${name} reference screenshot`} loading="lazy" />
      )}
    </span>
  );
}

function ReferenceDetail({ id, close }: { id: string; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [entry, setEntry] = useState<StudioReference | null>(null);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    getStudioReference(id, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setEntry(value);
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    return () => controller.abort();
  }, [id, revision]);
  async function download(asset: string, name: string) {
    setDownloadError('');
    try {
      const blob = await getStudioAsset(asset);
      if (name.endsWith('.image')) {
        const extension =
          (
            {
              'image/png': 'png',
              'image/jpeg': 'jpg',
              'image/webp': 'webp',
              'image/avif': 'avif',
              'image/gif': 'gif',
            } as Record<string, string>
          )[blob.type] ?? 'jpg';
        name = name.replace(/\.image$/, `.${extension}`);
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError('Could not download this file. Try again.');
    }
  }
  return (
    <dialog
      ref={dialog}
      className="reference-dialog studio-page"
      aria-labelledby="reference-detail-title"
      onCancel={close}
    >
      <header className="reference-dialog-header">
        <div>
          <p className="studio-label">{entry?.collection ?? 'Design reference'}</p>
          <h2 id="reference-detail-title">{entry?.name ?? 'Loading reference…'}</h2>
        </div>
        <button autoFocus aria-label="Close reference" onClick={close}>
          <X size={20} />
        </button>
      </header>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button
            onClick={() => {
              setError('');
              setRevision((n) => n + 1);
            }}
          >
            Retry reference
          </button>
        </div>
      ) : !entry ? (
        <p role="status">Loading document…</p>
      ) : (
        <>
          <p className="reference-lede">{entry.summary}</p>
          <div className="reference-tags">
            {entry.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {/^https?:\/\//i.test(entry.url) && (
            <a className="reference-source" href={entry.url} target="_blank" rel="noreferrer">
              Open source <ArrowUpRight size={16} />
            </a>
          )}
          {!!entry.images?.length && (
            <details className="reference-screenshots" open>
              <summary>Screenshots / {entry.images.length}</summary>
              <div>
                {entry.images.map((asset) => (
                  <figure key={asset}>
                    <ReferenceImage id={asset} name={entry.name} />
                    <button
                      onClick={() => download(asset, `${entry.id}-${asset.slice(0, 8)}.image`)}
                    >
                      Download screenshot
                    </button>
                  </figure>
                ))}
              </div>
            </details>
          )}
          <details className="reference-evidence">
            <summary>Sources and evidence limits</summary>
            <dl>
              {Object.entries(entry.provenance ?? {})
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
            <p>
              Reference material and reconstructed recommendations. Source dates and evidence limits
              apply.
            </p>
          </details>
          <article className="reference-document" aria-label="Design document">
            <Markdown
              remarkPlugins={[remarkGfm]}
              skipHtml
              components={{
                a: ({ href, children }) =>
                  /^https?:\/\//i.test(href ?? '') ? (
                    <a href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  ) : (
                    <span>{children}</span>
                  ),
                img: ({ alt }) => <span>{alt}</span>,
              }}
            >
              {entry.guide ?? ''}
            </Markdown>
          </article>
          <details>
            <summary>Documents, tokens and measurements / {entry.attachments?.length ?? 0}</summary>
            <div className="reference-downloads">
              {entry.attachments?.map((file) => (
                <button
                  key={`${file.asset}-${file.name}`}
                  onClick={() => download(file.asset, file.name)}
                >
                  {file.name} ↓
                </button>
              ))}
            </div>
          </details>
          {downloadError && <p role="alert">{downloadError}</p>}
        </>
      )}
    </dialog>
  );
}

export default function AdminReferences() {
  const [params, setParams] = useSearchParams();
  const [results, setResults] = useState<ReferenceResults | null>(null);
  const [facets, setFacets] = useState<ReferenceFacets | null>(null);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const view = params.get('view') === 'list' ? 'list' : 'grid';
  const selectedTags = params.getAll('tag');
  const selected = params.get('reference');
  const searchQuery = params.get('q') ?? '';
  const collection = params.get('collection') ?? '';
  const sort = params.get('sort') ?? 'relevance';
  const page = params.get('page') ?? '1';
  const tagKey = JSON.stringify(selectedTags);
  function update(key: string, value: string, resetPage = true) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (resetPage) next.delete('page');
      return next;
    });
  }
  function toggleTag(tag: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      const tags = next.getAll('tag');
      next.delete('tag');
      next.delete('page');
      (tags.includes(tag) ? tags.filter((value) => value !== tag) : [...tags, tag]).forEach(
        (value) => next.append('tag', value),
      );
      return next;
    });
  }
  useEffect(() => {
    const controller = new AbortController();
    getStudioReferenceFacets(controller.signal)
      .then(setFacets)
      .catch(() => {
        if (!controller.signal.aborted) setFilterError(true);
      });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    const controller = new AbortController();
    const request = new URLSearchParams({ q: searchQuery, collection, sort, page, per_page: '24' });
    (JSON.parse(tagKey) as string[]).forEach((tag) => request.append('tag', tag));
    getStudioReferences(request, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) {
          setResults(value);
          setError('');
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [searchQuery, collection, sort, page, tagKey, revision]);
  function changeFilter(key: string, value: string) {
    if ((params.get(key) ?? '') === value) return;
    setLoading(true);
    update(key, value);
  }
  return (
    <section className="studio-page references-page" aria-labelledby="references-heading">
      <header className="studio-heading">
        <div>
          <Link className="reference-back" to="/admin/studio">
            ← Studio
          </Link>
          <p className="studio-label">SUBCULT / REFERENCE LIBRARY</p>
          <h1 id="references-heading">Design references</h1>
          <p>Visual systems and design studies, each with its sources.</p>
        </div>
        <div className="reference-view-switch" aria-label="Display view">
          <button
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            onClick={() => update('view', 'grid', false)}
          >
            <Grid2X2 size={18} />
            Grid
          </button>
          <button
            aria-pressed={view === 'list'}
            aria-label="List view"
            onClick={() => update('view', 'list', false)}
          >
            <List size={18} />
            List
          </button>
        </div>
      </header>
      <div className="reference-layout">
        <aside className="reference-filter-panel" aria-label="Reference filters">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              changeFilter('q', String(new FormData(event.currentTarget).get('q') ?? '').trim());
            }}
          >
            <label htmlFor="reference-search">Search the library</label>
            <div className="reference-search-box">
              <Search size={18} />
              <input
                id="reference-search"
                type="search"
                maxLength={200}
                placeholder="Name, font, color, layout…"
                name="q"
                key={searchQuery}
                defaultValue={searchQuery}
              />
            </div>
            <button type="submit">Search</button>
          </form>
          <label htmlFor="reference-collection">Collection</label>
          <select
            id="reference-collection"
            value={collection}
            onChange={(event) => changeFilter('collection', event.target.value)}
          >
            <option value="">All collections</option>
            {facets?.collections.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name} ({item.count})
              </option>
            ))}
          </select>
          <fieldset>
            <legend>
              Tags <small>Match all selected</small>
            </legend>
            {filterError ? (
              <p role="alert">Filters could not be loaded.</p>
            ) : !facets ? (
              <p>Loading tags…</p>
            ) : (
              <div className="reference-tag-options">
                {facets.tags.map((tag) => (
                  <label key={tag.name}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => {
                        setLoading(true);
                        toggleTag(tag.name);
                      }}
                    />
                    <span>{tag.name}</span>
                    <small>{tag.count}</small>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          {(searchQuery || collection || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setLoading(true);
                setParams(new URLSearchParams({ view }));
              }}
            >
              Clear filters
            </button>
          )}
        </aside>
        <div className="reference-results" aria-busy={loading}>
          <div className="reference-result-toolbar">
            <p role="status">{loading ? 'Searching…' : `${results?.total ?? 0} references`}</p>
            <label>
              Sort
              <select value={sort} onChange={(event) => changeFilter('sort', event.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="name">Name A–Z</option>
                <option value="newest">Recently updated</option>
              </select>
            </label>
          </div>
          {results && results.total_pages > 1 && !error && (
            <nav className="reference-pagination" aria-label="Reference pages">
              <button
                disabled={results.page <= 1 || loading}
                onClick={() => {
                  setLoading(true);
                  update('page', String(results.page - 1), false);
                }}
              >
                ← Previous
              </button>
              <label className="reference-page-picker">
                Page
                <select
                  aria-label="Page"
                  value={results.page}
                  disabled={loading}
                  onChange={(event) => {
                    setLoading(true);
                    update('page', event.target.value, false);
                  }}
                >
                  {Array.from({ length: results.total_pages }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
                of {results.total_pages} · 24 per page
              </label>
              <button
                disabled={results.page >= results.total_pages || loading}
                onClick={() => {
                  setLoading(true);
                  update('page', String(results.page + 1), false);
                }}
              >
                Next →
              </button>
            </nav>
          )}
          {!!selectedTags.length && (
            <div className="reference-active-tags">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setLoading(true);
                    toggleTag(tag);
                  }}
                >
                  {tag}
                  <X size={14} />
                </button>
              ))}
            </div>
          )}
          {error ? (
            <div role="alert" className="reference-empty">
              <h2>Library unavailable</h2>
              <p>{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError('');
                  setFilterError(false);
                  setRevision((n) => n + 1);
                }}
              >
                Retry library
              </button>
            </div>
          ) : results?.items.length === 0 ? (
            <div className="reference-empty">
              <h2>No references match</h2>
              <p>Try a broader search or remove a tag.</p>
            </div>
          ) : (
            <div className={`reference-cards reference-${view}`}>
              {results?.items.map((entry) => (
                <article key={entry.id}>
                  <button
                    className="reference-card-open"
                    aria-label={`Read ${entry.name}`}
                    onClick={() => update('reference', entry.id, false)}
                  >
                    <div className="reference-thumbnail">
                      {entry.preview ? (
                        <ReferenceImage key={entry.preview} id={entry.preview} name={entry.name} />
                      ) : (
                        <span className="reference-placeholder">
                          {entry.name}
                          <small>Document available · no screenshot</small>
                        </span>
                      )}
                    </div>
                    <div className="reference-card-copy">
                      <p className="studio-label">{entry.collection}</p>
                      <h2>
                        {entry.name}
                        <ArrowUpRight size={18} />
                      </h2>
                      <p className="reference-card-summary">{entry.summary}</p>
                      <div className="reference-tags">
                        {entry.tags.slice(0, 5).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                        {entry.tags.length > 5 && <span>+{entry.tags.length - 5}</span>}
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      {selected && (
        <ReferenceDetail
          key={selected}
          id={selected}
          close={() => update('reference', '', false)}
        />
      )}
    </section>
  );
}
