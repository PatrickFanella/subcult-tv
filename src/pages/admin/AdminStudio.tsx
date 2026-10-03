import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudioCatalog, type StudioCatalog } from '@/lib/api';
import { StudioAsset, AssetDownload } from '@/components/admin/StudioAsset';
import '@/styles/studio.css';

export default function AdminStudio() {
  const [catalog, setCatalog] = useState<StudioCatalog | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'brands' | 'media'>('brands');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('subcult');
  const [category, setCategory] = useState('logos');
  const [light, setLight] = useState(false);
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
    return () => {
      active = false;
    };
  }, [revision]);
  const refresh = () => {
    setError('');
    setCatalog(null);
    setRevision((value) => value + 1);
  };
  const brand = catalog?.brands.find((item) => item.slug === selected) ?? catalog?.brands[0];
  const assets =
    brand?.assets ??
    brand?.logos.map((id) => ({
      id,
      name: catalog?.files[id].name || 'Logo',
      category: 'logos',
    })) ??
    [];
  const visible = assets.filter(
    (item) =>
      (category === 'all' || item.category === category) &&
      item.name.toLowerCase().includes(query.toLowerCase()),
  );
  const media =
    catalog?.media.filter((item) =>
      `${item.title} ${item.products.join(' ')} ${item.kind}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ) ?? [];
  return (
    <section className="studio-page" aria-labelledby="studio-heading">
      <header className="production-heading">
        <div>
          <p className="studio-label">SUBCULT / PRODUCTION LIBRARY</p>
          <h1 id="studio-heading">Brand & asset library</h1>
          <p>Brand identities, exports and media for each product.</p>
        </div>
        <div className="studio-switch">
          <Link to="/admin/studio/references">Design references →</Link>
          <button onClick={refresh}>Refresh library</button>
        </div>
      </header>
      <div className="production-rail">
        <span>Assets by brand</span>
        <Link to="/admin/posts">Posting dashboard →</Link>
      </div>
      {error ? (
        <div className="production-notice" role="alert">
          <p>{error}</p>
          <button onClick={refresh}>Retry connection</button>
        </div>
      ) : !catalog ? (
        <p role="status">Loading library…</p>
      ) : (
        <>
          <div className="studio-switch" aria-label="Library sections">
            <button
              aria-pressed={tab === 'brands'}
              onClick={() => {
                setTab('brands');
                setQuery('');
              }}
            >
              Brands / {catalog.brands.length}
            </button>
            <button
              aria-pressed={tab === 'media'}
              onClick={() => {
                setTab('media');
                setQuery('');
              }}
            >
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
                    onClick={() => {
                      setSelected(item.slug);
                      setQuery('');
                    }}
                  >
                    {item.name}
                    <small>{item.direction}</small>
                  </button>
                ))}
              </nav>
              {brand && (
                <article className="studio-brand-detail">
                  <div className="studio-brand-title">
                    <div>
                      <p className="studio-label">SELECTED SYSTEM</p>
                      <h2>{brand.name}</h2>
                      <p>{brand.direction}</p>
                    </div>
                    <span className="production-badge">{assets.length} exports</span>
                  </div>
                  <details className="studio-overview">
                    <summary>View the complete brand board</summary>
                    <StudioAsset id={brand.preview} alt={`${brand.name} production pack preview`} />
                  </details>
                  <div className="studio-swatches">
                    {Object.entries(brand.tokens.colors)
                      .filter(
                        ([role]) =>
                          !['bg', 'fg', 'accent', 'secondary', 'safe_label'].includes(role),
                      )
                      .map(([role, color]) => (
                        <span key={role}>
                          <i style={{ background: color }} />
                          {role} / {color}
                        </span>
                      ))}
                  </div>
                  <p className="studio-note">
                    {Object.entries(brand.tokens.fonts)
                      .map(([role, font]) => `${role}: ${font}`)
                      .join(' · ')}
                  </p>
                  <details>
                    <summary>Brand guide and usage rules</summary>
                    <pre>{brand.guide}</pre>
                  </details>
                  <div className="studio-tools">
                    <label>
                      Asset category
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {['all', 'logos', 'social', 'video', 'artwork', 'fonts', 'tokens'].map(
                          (value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      Search assets
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Avatar, waveform, banner…"
                      />
                    </label>
                    <button aria-pressed={light} onClick={() => setLight(!light)}>
                      {light ? 'Light preview' : 'Dark preview'}
                    </button>
                  </div>
                  {visible.length === 0 ? (
                    <p>No assets match this category and search.</p>
                  ) : (
                    <div className="studio-asset-grid">
                      {visible.map((item) => (
                        <figure key={item.name}>
                          <div className={`studio-asset-stage ${light ? 'is-light' : ''}`}>
                            {/\.(svg|png|jpe?g|webp)$/i.test(item.name) ? (
                              <StudioAsset id={item.id} alt={`${brand.name}: ${item.name}`} />
                            ) : item.name.endsWith('.mp4') ? (
                              video === item.id ? (
                                <StudioAsset id={item.id} alt={item.name} video />
                              ) : (
                                <button onClick={() => setVideo(item.id)}>
                                  Load video preview
                                </button>
                              )
                            ) : (
                              <span className="studio-file-type">
                                {item.name.split('.').pop()?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <figcaption>
                            <strong>{item.name}</strong>
                            <AssetDownload id={item.id} name={item.name} />
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </article>
              )}
            </div>
          ) : (
            <>
              <label className="studio-search">
                Search media
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                            <StudioAsset id={item.asset} alt={item.alt_text || item.title} video />
                          ) : (
                            <button onClick={() => setVideo(item.id)}>Load video preview</button>
                          )
                        ) : (
                          <StudioAsset id={item.asset} alt={item.alt_text || item.title} />
                        )}
                      </div>
                      <h2>{item.title}</h2>
                      <p>
                        {item.products.join(' / ')} · {item.kind}
                      </p>
                      <p className="studio-label">
                        {item.status} / {item.rights}
                      </p>
                      <AssetDownload id={item.asset} name={catalog.files[item.asset].name} />
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
