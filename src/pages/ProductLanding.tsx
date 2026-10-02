import { Link, Navigate, useParams } from 'react-router-dom';
import ProductVisual from '@/components/ProductVisual';
import SEOHead from '@/components/SEOHead';
import { getShowcaseProducts } from '@/lib/showcase';
import { PRODUCT_LANDINGS } from '@/lib/product-landings';
import { getProductPath, PRODUCT_ROUTES } from '@/lib/product-paths';
import NotFound from '@/pages/NotFound';
import '@/styles/product-landings.css';
import '@/styles/product-fonts.css';

// Brand marks shown beside the product name; other products use the name alone.
const PRODUCT_MARKS: Record<string, string> = {
  'left-field': '/brand/left-field/mark.svg',
  'transcript-create': '/brand/rekolekt-mark.svg',
  kork: '/brand/kork-mark.svg',
};

export default function ProductLanding() {
  const { slug } = useParams<{ slug: string }>();
  const products = getShowcaseProducts();
  const product = products.find(({ project }) => PRODUCT_ROUTES[project.slug] === slug);
  if (slug === 'transcript-create') return <Navigate to="/products/rekolekt" replace />;
  if (!product) return <NotFound />;
  const { project } = product;
  const content = PRODUCT_LANDINGS[project.slug];
  const related = products.find(({ project: other }) => other.slug === product.relatedSlug);

  return (
    <div className="product-landing" data-product={project.slug}>
      <SEOHead path={getProductPath(project.slug)} />
      <div className="landing-container">
        <nav className="landing-product-nav" aria-label="Product navigation">
          <Link to="/products">All products</Link>
          <div>
            {products.map(({ project: other }) => (
              <Link
                key={other.slug}
                to={getProductPath(other.slug)}
                aria-current={other.slug === project.slug ? 'page' : undefined}
              >
                {other.name}
              </Link>
            ))}
          </div>
        </nav>
        <section className="landing-hero" aria-labelledby="product-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">{product.category}</p>
            <div className="landing-wordmark">
              {PRODUCT_MARKS[project.slug] && <img src={PRODUCT_MARKS[project.slug]} alt="" />}
              <h1 id="product-title">{project.name}</h1>
            </div>
            <h2 className="landing-headline">{product.headline}</h2>
            <p className="landing-summary">{product.summary}</p>
            <div className="landing-actions">
              <a
                className="landing-button"
                href={project.url || project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.url ? (product.liveLabel ?? `Open ${project.name}`) : 'Explore the code'} ↗
              </a>
              <a className="landing-secondary" href="#features">
                See what it does ↓
              </a>
            </div>
            <p className="landing-audience">{content.audience}</p>
          </div>
          <figure className="landing-visual">
            <ProductVisual product={product} priority />
            <figcaption>
              {project.screenshot
                ? `${project.name} interface`
                : `${project.name} / concept illustration`}
            </figcaption>
          </figure>
        </section>
        <section id="features" className="landing-section" aria-labelledby="features-title">
          <p className="landing-eyebrow">WHAT YOU CAN DO</p>
          <h2 id="features-title">{content.introduction}</h2>
          <div className="landing-features">
            {content.features.map((feature, index) => (
              <article key={feature.title}>
                <span className="landing-number">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-section landing-workflow" aria-labelledby="workflow-title">
          <div>
            <p className="landing-eyebrow">A PLACE TO START</p>
            <h2 id="workflow-title">How it works</h2>
          </div>
          <ol>
            {content.steps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
        {related && (
          <section className="landing-related" aria-labelledby="related-title">
            <div>
              <p className="landing-eyebrow">
                {project.slug === 'hasanara'
                  ? 'THE SOFTWARE UNDERNEATH'
                  : 'AN ARCHIVE BUILT WITH REKOLEKT'}
              </p>
              <h2 id="related-title">
                {project.slug === 'hasanara'
                  ? 'HasanAra, powered by Rekolekt.'
                  : 'See it in practice with HasanAra.'}
              </h2>
              <p>
                {project.slug === 'hasanara'
                  ? 'Rekolekt is the shared software for searchable recording archives. HasanAra is one archive built on it.'
                  : 'HasanAra runs Rekolekt on an archive of HasanAbi broadcasts, under its own name and design.'}
              </p>
            </div>
            <Link className="landing-button" to={getProductPath(related.project.slug)}>
              Explore {related.project.name} →
            </Link>
          </section>
        )}
        <section className="landing-section landing-faq" aria-labelledby="faq-title">
          <div>
            <p className="landing-eyebrow">A FEW DETAILS</p>
            <h2 id="faq-title">Common questions</h2>
          </div>
          <div>
            {content.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="landing-support" aria-labelledby="support-title">
          <div>
            <p className="landing-eyebrow">MADE IN THE OPEN</p>
            <h2 id="support-title">Follow how {project.name} gets made.</h2>
            <p>
              {project.name} is built by SUBCULT. Get the monthly newsletter, or follow the workshop
              on Patreon for field notes and early previews.
            </p>
          </div>
          <div className="landing-actions">
            <Link className="landing-button" to="/support">
              Support the work →
            </Link>
            <a className="landing-secondary" href="#newsletter">
              Get updates by email ↓
            </a>
          </div>
        </section>
        <section className="landing-closing" aria-labelledby="closing-title">
          <p className="landing-eyebrow">{project.name} / BY SUBCULT</p>
          <h2 id="closing-title">{content.closing}</h2>
          <div className="landing-actions">
            {project.url && (
              <a
                className="landing-button"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {product.liveLabel ?? 'Visit Project'} ↗
              </a>
            )}
            <a
              className={project.url ? 'landing-secondary' : 'landing-button'}
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Repository ↗
            </a>
            <Link className="landing-secondary" to={`/contact?product=${project.slug}`}>
              {project.url ? 'Talk to SUBCULT →' : 'Discuss using it →'}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
