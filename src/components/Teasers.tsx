import { TEASERS, type Teaser } from '@/lib/teasers';

function TeaserArt({ art }: { art: Teaser['art'] }) {
  if (art.kind === 'image') {
    return (
      <img src={art.src} alt={art.alt} loading="lazy" decoding="async" className="teaser-image" />
    );
  }

  // An empty room on a video call, still recording.
  return (
    <div className="teaser-audio" aria-hidden="true">
      <div className="teaser-call-tile">
        <span className="teaser-call-window" />
        <span className="teaser-call-chair" />
        <span className="teaser-call-rec">● REC 03:58:12</span>
        <span className="teaser-call-name">Guest</span>
      </div>
      <div className="teaser-audio-wave">
        {Array.from({ length: 48 }, (_, i) => (
          <i key={i} style={{ height: `${0.25 + ((i * 7) % 11) / 8}em` }} />
        ))}
      </div>
    </div>
  );
}

export default function Teasers({ headingId }: { headingId: string }) {
  return (
    <section className="teasers" aria-labelledby={headingId}>
      <div className="showcase-section-heading">
        <h2 id={headingId}>In development</h2>
        <span className="font-mono text-xs text-bone">NOT YET NAMED</span>
      </div>
      <div className="teaser-grid">
        {TEASERS.map((teaser) => (
          <article key={teaser.id} className="teaser" aria-labelledby={`${teaser.id}-label`}>
            <div className="teaser-art">
              <TeaserArt art={teaser.art} />
            </div>
            <p className="showcase-eyebrow mt-5">{teaser.medium}</p>
            <h3 id={`${teaser.id}-label`} className="teaser-label">
              {teaser.label}
            </h3>
            <p className="text-bone">{teaser.summary}</p>
            <p className="teaser-status">In development. No release date yet.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
