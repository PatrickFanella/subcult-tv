import { useEffect, useState } from 'react';
import {
  getStudioAsset,
  getStudioCatalog,
  getStudioJobs,
  type StudioCatalog,
  type StudioJobs,
} from '@/lib/api';
import '@/styles/studio.css';

function Asset({ id, alt, video = false }: { id: string; alt: string; video?: boolean }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let objectURL = '';
    getStudioAsset(id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectURL = URL.createObjectURL(blob);
        setUrl(objectURL);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => {
      controller.abort();
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [id]);
  if (error) return <p role="status">Preview unavailable.</p>;
  if (!url) return <p role="status">Loading preview…</p>;
  return video ? (
    <video src={url} controls preload="metadata" aria-label={alt} />
  ) : (
    <img src={url} alt={alt} />
  );
}

export default function AdminStudio() {
  const [catalog, setCatalog] = useState<StudioCatalog | null>(null);
  const [jobs, setJobs] = useState<StudioJobs | null>(null);
  const [error, setError] = useState('');
  const [jobError, setJobError] = useState(false);
  const [tab, setTab] = useState<'brands' | 'media'>('brands');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('subcult');
  const [video, setVideo] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    getStudioCatalog()
      .then((value) => {
        if (active) setCatalog(value);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    getStudioJobs()
      .then((value) => {
        if (active) setJobs(value);
      })
      .catch(() => {
        if (active) setJobError(true);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const refresh = () => {
    setError('');
    setJobError(false);
    setCatalog(null);
    setJobs(null);
    setRevision((value) => value + 1);
  };
  const brand = catalog?.brands.find((item) => item.slug === selected) ?? catalog?.brands[0];
  const media =
    catalog?.media.filter((item) =>
      `${item.title} ${item.products.join(' ')} ${item.kind}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ) ?? [];
  return (
    <section className="studio-page" aria-labelledby="studio-heading">
      <header className="studio-heading">
        <div>
          <p className="studio-label">SUBCULT / PRODUCTION LIBRARY</p>
          <h1 id="studio-heading">Studio</h1>
          <p>Brand masters, media and draft preparation records.</p>
        </div>
        <button onClick={refresh}>Refresh library</button>
      </header>
      <aside className="studio-status" aria-label="Draft preparation status">
        <strong>Draft preparation</strong>
        {jobError ? (
          <p role="alert">Job status could not be loaded. Refresh to retry.</p>
        ) : !jobs ? (
          <p>Loading job status…</p>
        ) : !jobs.connected ? (
          <p>No runner receipt connected.</p>
        ) : (
          <p>
            {jobs.receipt?.mode} / {jobs.receipt?.status} · {jobs.receipt?.draft_count} drafts ·{' '}
            {jobs.receipt?.week}
            <br />
            Last receipt: {jobs.observed_at} {jobs.stale ? '· older than 24 hours' : ''}
          </p>
        )}
        <p className="studio-note">
          Receipts describe past runs. Approval, scheduling, dispatch and delivery remain separate.
          Publishing controls are unavailable here.
        </p>
      </aside>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button onClick={refresh}>Retry connection</button>
        </div>
      ) : !catalog ? (
        <p role="status">Loading library…</p>
      ) : (
        <>
          <div className="studio-switch" aria-label="Library sections">
            <button aria-pressed={tab === 'brands'} onClick={() => setTab('brands')}>
              Brands / {catalog.brands.length}
            </button>
            <button aria-pressed={tab === 'media'} onClick={() => setTab('media')}>
              Media / {catalog.media.length}
            </button>
          </div>
          {tab === 'brands' ? (
            <div className="studio-brand-layout">
              <nav aria-label="Brands">
                {catalog.brands.map((item) => (
                  <button
                    key={item.slug}
                    aria-pressed={item.slug === brand?.slug}
                    onClick={() => setSelected(item.slug)}
                  >
                    {item.name}
                    <small>{item.direction}</small>
                  </button>
                ))}
              </nav>
              {brand && (
                <article>
                  <h2>{brand.name}</h2>
                  <p>{brand.direction}</p>
                  <Asset
                    key={brand.preview}
                    id={brand.preview}
                    alt={`${brand.name} production pack preview`}
                  />
                  <div className="studio-swatches">
                    {Object.entries(brand.tokens.colors).map(([role, color]) => (
                      <span key={role}>
                        <i style={{ background: color }} />
                        {role} / {color}
                      </span>
                    ))}
                  </div>
                  <details>
                    <summary>Brand guide and usage rules</summary>
                    <pre>{brand.guide}</pre>
                  </details>
                  <details>
                    <summary>Outlined logo exports / {brand.logos.length}</summary>
                    <div className="studio-logo-grid">
                      {brand.logos.map((id) => (
                        <figure key={id}>
                          <Asset id={id} alt={catalog.files[id].name} />
                          <figcaption>{catalog.files[id].name}</figcaption>
                        </figure>
                      ))}
                    </div>
                  </details>
                </article>
              )}
            </div>
          ) : (
            <>
              <label className="studio-search">
                Search media
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Title, product or format"
                  type="search"
                />
              </label>
              {media.length === 0 ? (
                <p>No media matches this search.</p>
              ) : (
                <div className="studio-media-grid">
                  {media.map((item) => (
                    <article key={item.id}>
                      <div className="studio-media-preview">
                        {catalog.files[item.asset].path.endsWith('.mp4') ? (
                          video === item.id ? (
                            <Asset id={item.asset} alt={item.alt_text || item.title} video />
                          ) : (
                            <button onClick={() => setVideo(item.id)}>Load video preview</button>
                          )
                        ) : (
                          <Asset id={item.asset} alt={item.alt_text} />
                        )}
                      </div>
                      <h2>{item.title}</h2>
                      <p>
                        {item.products.join(' / ')} · {item.kind}
                      </p>
                      <p className="studio-label">
                        {item.status} / {item.rights}
                      </p>
                      <details>
                        <summary>Source and description</summary>
                        <p>{item.source}</p>
                        <p>{item.alt_text}</p>
                        <code>{item.id}</code>
                      </details>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
