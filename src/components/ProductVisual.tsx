import type { ShowcaseProduct } from '@/lib/showcase';

export default function ProductVisual({
  product,
  priority = false,
}: {
  product: ShowcaseProduct;
  priority?: boolean;
}) {
  const { project } = product;
  if (project.slug === 'left-field') {
    return (
      <img
        src="/brand/left-field/hero.svg"
        alt="Left Field: Read the field. Trace the evidence. LF mark on warm paper."
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="showcase-screenshot"
      />
    );
  }
  if (project.screenshot) {
    return (
      <img
        src={project.screenshot}
        alt={`${project.name} interface`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="showcase-screenshot"
      />
    );
  }

  // These editorial illustrations describe use cases, not product interfaces.
  return (
    <div className={`product-illustration illustration-${project.slug}`} aria-hidden="true">
      <span className="illustration-caption">{product.category}</span>
      {project.slug === 'hasanara' || project.slug === 'transcript-create' ? (
        <div className="archive-illustration">
          {project.slug === 'transcript-create' && (
            <div className="rekolekt-lockup">
              <img src="/brand/rekolekt-mark.svg" alt="" />
              <div>
                <strong>rekolekt</strong>
                <span>BY SUBCULT</span>
              </div>
            </div>
          )}
          <div className="archive-wave">
            {Array.from({ length: 32 }, (_, i) => (
              <i key={i} style={{ height: `${(16 + ((i * 13) % 48)) / 16}em` }} />
            ))}
          </div>
          <p className="archive-line">
            <span>00:12:08</span> A moment in the recording.
          </p>
          <p className="archive-line archive-highlight">
            <span>00:12:14</span> A passage worth keeping.
          </p>
          <p className="archive-line">
            <span>00:12:21</span> The source, still attached.
          </p>
          <div className="archive-foot">
            RECORDING → TRANSCRIPT → {project.slug === 'hasanara' ? 'PASSAGE' : 'ARCHIVE'}
          </div>
        </div>
      ) : project.slug === 'subcult-os' ? (
        <div className="event-illustration">
          <div className="event-ticket">
            <span>SUBCULT OS / ADMIT ONE</span>
            <strong>
              THE NIGHT
              <br />
              IS YOURS.
            </strong>
            <div className="ticket-bars" />
          </div>
          <div className="event-stages">
            <span>01 / PLAN</span>
            <span>02 / DOORS</span>
            <span>03 / SHOW</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
