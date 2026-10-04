import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useParams, useSearchParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUpRight, Grid2X2, List, Search, SlidersHorizontal, X } from 'lucide-react';
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

function ReferenceDetail({
  id,
  close,
  tagLabels,
}: {
  id: string;
  close: () => void;
  tagLabels: Map<string, string>;
}) {
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
              <span key={tag}>{tagLabels.get(tag) ?? tag}</span>
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

const referencePages = [
  {
    slug: '',
    label: 'All references',
    collection: '',
    description: 'Website studies, visual styles, interface references and web history.',
  },
  {
    slug: 'websites',
    label: 'Website studies',
    collection: 'Website studies',
    description: 'Study how individual websites organize content, typography and identity.',
  },
  {
    slug: 'styles',
    label: 'Style studies',
    collection: 'Style studies',
    description: 'Visual directions, with examples and notes on how to use them.',
  },
  {
    slug: 'interfaces',
    label: 'Interface archive',
    collection: 'Refero archive',
    description: 'Archived interface references and their interpreted design notes.',
  },
  {
    slug: 'history',
    label: 'Web history',
    collection: 'Web history',
    description: 'Five eras of web design, plus studies of Flash, Y2K and CSS layouts.',
  },
];

export default function AdminReferences() {
  const [params, setParams] = useSearchParams();
  const { section } = useParams();
  const referencePage =
    referencePages.find((item) => item.slug === (section ?? '')) ?? referencePages[0];
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
  const collection = referencePage.collection || (params.get('collection') ?? '');
  const sort = params.get('sort') ?? 'relevance';
  const page = params.get('page') ?? '1';
  const filterKey = JSON.stringify(
    [...params.entries()].filter(([key]) => key.startsWith('filter_')),
  );
  const tagKey = JSON.stringify(selectedTags);
  const [draftQuery, setDraftQuery] = useState(searchQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const filterPanel = useRef<HTMLElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  const filterSearch = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!filtersOpen) return;
    if (filterPanel.current) filterPanel.current.scrollTop = 0;
    filterSearch.current?.focus({ preventScroll: true });
    function dismiss(event: PointerEvent) {
      if (
        !filterPanel.current?.contains(event.target as Node) &&
        !filterButton.current?.contains(event.target as Node)
      )
        setFiltersOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setFiltersOpen(false);
        filterButton.current?.focus();
      }
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [filtersOpen]);
  const activeFilters = [...params.entries()].filter(
    ([key]) => key === 'tag' || key.startsWith('filter_'),
  );
  const [previousQuery, setPreviousQuery] = useState(searchQuery);
  if (previousQuery !== searchQuery) {
    setPreviousQuery(searchQuery);
    setDraftQuery(searchQuery);
  }
  useEffect(() => {
    if (draftQuery.trim() === searchQuery) return;
    const timer = setTimeout(() => {
      setLoading(true);
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (draftQuery.trim()) next.set('q', draftQuery.trim());
          else next.delete('q');
          next.delete('page');
          return next;
        },
        { replace: true },
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [draftQuery, searchQuery, setParams]);
  function update(key: string, value: string, resetPage = true) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (resetPage) next.delete('page');
      return next;
    });
  }
  function toggleTag(tag: string, key = 'tag') {
    setParams((current) => {
      const next = new URLSearchParams(current);
      const tags = next.getAll(key);
      next.delete(key);
      next.delete('page');
      (tags.includes(tag) ? tags.filter((value) => value !== tag) : [...tags, tag]).forEach(
        (value) => next.append(key, value),
      );
      return next;
    });
  }
  useEffect(() => {
    const controller = new AbortController();
    const request = new URLSearchParams({ q: searchQuery, collection });
    (JSON.parse(tagKey) as string[]).forEach((tag) => request.append('tag', tag));
    (JSON.parse(filterKey) as [string, string][]).forEach(([key, value]) =>
      request.append(key, value),
    );
    getStudioReferenceFacets(controller.signal, request)
      .then((value) => {
        if (!controller.signal.aborted) {
          setFacets(value);
          setFilterError(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFilterError(true);
      });
    return () => controller.abort();
  }, [revision, searchQuery, collection, tagKey, filterKey]);
  useEffect(() => {
    const controller = new AbortController();
    const request = new URLSearchParams({ q: searchQuery, collection, sort, page, per_page: '24' });
    (JSON.parse(tagKey) as string[]).forEach((tag) => request.append('tag', tag));
    (JSON.parse(filterKey) as [string, string][]).forEach(([key, value]) =>
      request.append(key, value),
    );
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
  }, [searchQuery, collection, sort, page, tagKey, filterKey, revision]);
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
          <h1 id="references-heading">
            {referencePage.slug ? referencePage.label : 'Design references'}
          </h1>
          <p>{referencePage.description}</p>
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
      <nav className="reference-collections" aria-label="Reference collections">
        {referencePages.map((item) => (
          <NavLink
            key={item.slug}
            end
            to={{
              pathname: `/admin/studio/references${item.slug ? `/${item.slug}` : ''}`,
              search: `?view=${view}`,
            }}
          >
            {item.label}
            <span>
              {item.collection
                ? (facets?.collections.find((value) => value.name === item.collection)?.count ??
                  '—')
                : (facets?.collections.reduce((sum, value) => sum + value.count, 0) ?? '—')}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="reference-search-toolbar">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            changeFilter('q', draftQuery.trim());
          }}
        >
          <label htmlFor="reference-search">Search the library</label>
          <div className="reference-search-box">
            <Search size={18} aria-hidden="true" />
            <input
              id="reference-search"
              type="search"
              maxLength={200}
              placeholder="Name, font, color, layout…"
              name="q"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
            />
          </div>
          <button type="submit">Search</button>
        </form>
        <button
          ref={filterButton}
          className="reference-filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="reference-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          Filters{activeFilters.length ? ` (${activeFilters.length})` : ''}
        </button>
      </div>
      <div className="reference-layout">
        <aside
          ref={filterPanel}
          id="reference-filters"
          role="dialog"
          hidden={!filtersOpen}
          className={`reference-filter-panel ${filtersOpen ? 'is-open' : ''}`}
          aria-label="Reference filters"
        >
          <div className="reference-filter-panel-tools">
            <div className="reference-filter-panel-header">
              <div>
                <strong>Filter references</strong>
                <p>Any choice within a group. Match every selected group.</p>
              </div>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => {
                  setFiltersOpen(false);
                  filterButton.current?.focus();
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {!referencePage.collection && (
              <label htmlFor="reference-collection">
                Collection
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
              </label>
            )}
            <label htmlFor="reference-tag-search">
              Find a filter
              <input
                ref={filterSearch}
                id="reference-tag-search"
                type="search"
                value={tagSearch}
                onChange={(event) => setTagSearch(event.target.value)}
                placeholder="Swiss, serif, motion…"
              />
            </label>
          </div>
          {filterError ? (
            <p role="alert">
              Filters could not be loaded.{' '}
              <button onClick={() => setRevision((n) => n + 1)}>Retry filters</button>
            </p>
          ) : !facets ? (
            <p>Loading filters…</p>
          ) : (
            (facets.groups ?? [{ id: 'legacy', label: 'Tags' }]).map((group) => {
              const key = group.id === 'legacy' ? 'tag' : `filter_${group.id}`;
              const options = facets.tags.filter(
                (tag) =>
                  (group.id === 'legacy' || tag.group === group.id) &&
                  `${tag.label ?? tag.name}`.toLowerCase().includes(tagSearch.toLowerCase()),
              );
              if (!options.length) return null;
              return (
                <fieldset key={group.id} className="reference-filter-group">
                  <legend>{group.label}</legend>
                  <div className="reference-tag-options">
                    {options.map((tag) => {
                      const checked = params.getAll(key).includes(tag.name);
                      return (
                        <label
                          key={tag.name}
                          className={`${checked ? 'is-selected' : ''} ${tag.count === 0 && !checked ? 'is-unavailable' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={tag.count === 0 && !checked}
                            onChange={() => {
                              setLoading(true);
                              toggleTag(tag.name, key);
                            }}
                          />
                          <span>{tag.label ?? tag.name}</span>
                          <small>{tag.count}</small>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })
          )}
          {facets &&
            !facets.tags.some((tag) =>
              (tag.label ?? tag.name).toLowerCase().includes(tagSearch.toLowerCase()),
            ) && <p>No filters match “{tagSearch}”.</p>}
          <div className="reference-filter-panel-footer">
            <span>{activeFilters.length} selected</span>
            <button
              type="button"
              onClick={() => {
                setFiltersOpen(false);
                filterButton.current?.focus();
              }}
            >
              Done
            </button>
          </div>
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
          {(searchQuery ||
            activeFilters.length > 0 ||
            (!referencePage.collection && collection)) && (
            <div className="reference-active-tags" aria-label="Applied filters">
              {searchQuery && (
                <button aria-label="Remove search" onClick={() => changeFilter('q', '')}>
                  Search: {searchQuery}
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {!referencePage.collection && collection && (
                <button
                  aria-label="Remove collection"
                  onClick={() => changeFilter('collection', '')}
                >
                  {collection}
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {activeFilters.map(([key, tag]) => {
                const group = facets?.groups?.find((group) => `filter_${group.id}` === key);
                const label = facets?.tags.find((item) => item.name === tag)?.label ?? tag;
                return (
                  <button
                    key={`${key}-${tag}`}
                    aria-label={`Remove ${label}`}
                    onClick={() => {
                      setLoading(true);
                      toggleTag(tag, key);
                    }}
                  >
                    {group ? `${group.label}: ` : ''}
                    {label}
                    <X size={14} aria-hidden="true" />
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setLoading(true);
                  setParams(new URLSearchParams({ view }));
                }}
              >
                Clear filters
              </button>
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
              <p>Try a broader search, or remove one of the filters above.</p>
            </div>
          ) : view === 'list' ? (
            <div
              className="reference-table-scroll"
              role="region"
              aria-label="Reference table"
              tabIndex={0}
            >
              <table className="reference-table reference-list">
                <caption className="sr-only">
                  {referencePage.label} — {results?.total ?? 0} results
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Reference</th>
                    <th scope="col">Collection</th>
                    <th scope="col">Design notes</th>
                    <th scope="col">Tags</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {results?.items.map((entry) => (
                    <tr key={entry.id}>
                      <th scope="row">
                        <button
                          className="reference-table-open"
                          aria-label={`Read ${entry.name}`}
                          onClick={() => update('reference', entry.id, false)}
                        >
                          {entry.name}
                          <ArrowUpRight size={14} />
                        </button>
                      </th>
                      <td>{entry.collection}</td>
                      <td className="reference-table-summary">{entry.summary}</td>
                      <td>
                        <div className="reference-tags">
                          {entry.tags.slice(0, 5).map((tag) => (
                            <span key={tag}>
                              {facets?.tags.find((item) => item.name === tag)?.label ?? tag}
                            </span>
                          ))}
                          {entry.tags.length > 5 && <span>+{entry.tags.length - 5}</span>}
                        </div>
                      </td>
                      <td>
                        {/^https?:\/\//i.test(entry.url) ? (
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open source for ${entry.name}`}
                          >
                            Source <ArrowUpRight size={14} />
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="reference-cards reference-grid">
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
                          <span key={tag}>
                            {facets?.tags.find((item) => item.name === tag)?.label ?? tag}
                          </span>
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
          tagLabels={new Map(facets?.tags.map((tag) => [tag.name, tag.label ?? tag.name]))}
          key={selected}
          id={selected}
          close={() => update('reference', '', false)}
        />
      )}
    </section>
  );
}
