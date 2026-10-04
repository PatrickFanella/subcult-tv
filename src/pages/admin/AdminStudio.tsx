import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudioCatalog, type StudioBrandAsset, type StudioCatalog } from '@/lib/api';
import { StudioAsset, AssetDownload } from '@/components/admin/StudioAsset';
import '@/styles/studio.css';

export default function AdminStudio() {
  const [catalog, setCatalog] = useState<StudioCatalog | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'brands' | 'media'>('brands');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('subcult');
  const [category, setCategory] = useState('logos');
  const [assetTags, setAssetTags] = useState<string[]>([]);
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
  const assets: StudioBrandAsset[] =
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
      `${item.title ?? ''} ${item.name} ${(item.tags ?? []).join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      assetTags.every((tag) => item.tags?.includes(tag)),
  );
  const media =
    catalog?.media.filter(
      (item) =>
        `${item.title} ${item.products.join(' ')} ${item.kind} ${(item.tags ?? []).join(' ')} ${item.alt_text}`
          .toLowerCase()
          .includes(query.toLowerCase()) && assetTags.every((tag) => item.tags?.includes(tag)),
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
                setAssetTags([]);
              }}
            >
              Brands / {catalog.brands.length}
            </button>
            <button
              aria-pressed={tab === 'media'}
              onClick={() => {
                setTab('media');
                setQuery('');
                setAssetTags([]);
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
                      setAssetTags([]);
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
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setAssetTags([]);
                        }}
                      >
                        {['all', 'logos', 'social', 'video', 'artwork', 'fonts', 'tokens'].map(
                          (value) => (
                            <option key={value} value={value}>
                              {
                                (
                                  {
                                    all: 'All assets',
                                    logos: 'Logos & identity',
                                    social: 'Social templates',
                                    video: 'Video graphics',
                                    artwork: 'Artwork',
                                    fonts: 'Fonts & licenses',
                                    tokens: 'Design tokens',
                                  } as Record<string, string>
                                )[value]
                              }
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
                  <p className="studio-note">
                    Tags describe source files. All selected tags must match.
                  </p>
                  <div className="studio-asset-tags" aria-label="Asset tag filters">
                    {[
                      ...new Set(
                        assets
                          .filter((item) => category === 'all' || item.category === category)
                          .flatMap((item) => item.tags ?? []),
                      ),
                    ]
                      .sort()
                      .map((tag) => (
                        <button
                          key={tag}
                          aria-pressed={assetTags.includes(tag)}
                          onClick={() =>
                            setAssetTags((current) =>
                              current.includes(tag)
                                ? current.filter((value) => value !== tag)
                                : [...current, tag],
                            )
                          }
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                  {assetTags.length > 0 && (
                    <button onClick={() => setAssetTags([])}>Clear asset tags</button>
                  )}
                  <p role="status">
                    {visible.length} {visible.length === 1 ? 'asset' : 'assets'}
                  </p>
                  {visible.length === 0 ? (
                    <p>No assets match this category and search.</p>
                  ) : (
                    <div className="studio-asset-grid">
                      {visible.map((item) => (
                        <figure key={item.name}>
                          <div className={`studio-asset-stage ${light ? 'is-light' : ''}`}>
                            {/\.(svg|png|jpe?g|webp)$/i.test(item.name) ? (
                              <StudioAsset
                                id={item.id}
                                alt={`${brand.name}: ${item.title ?? item.name}`}
                              />
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
                            <strong>{item.title ?? item.name}</strong>
                            {item.title && (
                              <small className="studio-asset-filename">{item.name}</small>
                            )}
                            <div className="studio-asset-tag-labels">
                              {item.tags?.map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </div>
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
              <p className="studio-note">
                Tags come from the media catalog. All selected tags must match.
              </p>
              <div className="studio-asset-tags" aria-label="Media tag filters">
                {[...new Set(catalog.media.flatMap((item) => item.tags ?? []))]
                  .sort()
                  .map((tag) => (
                    <button
                      key={tag}
                      aria-pressed={assetTags.includes(tag)}
                      onClick={() =>
                        setAssetTags((current) =>
                          current.includes(tag)
                            ? current.filter((value) => value !== tag)
                            : [...current, tag],
                        )
                      }
                    >
                      {tag}
                    </button>
                  ))}
              </div>
              {assetTags.length > 0 && (
                <button onClick={() => setAssetTags([])}>Clear asset tags</button>
              )}
              <p role="status">
                {media.length} media {media.length === 1 ? 'asset' : 'assets'}
              </p>
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
                      <div className="studio-asset-tag-labels">
                        {item.tags?.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
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
