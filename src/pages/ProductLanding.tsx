import { Link, Navigate, useParams } from 'react-router-dom';
import ProductVisual from '@/components/ProductVisual';
import SEOHead from '@/components/SEOHead';
import ProductOverview from '@/components/ProductOverview';
import ProductRelationships from '@/components/ProductRelationships';
import { getProductAction, getShowcaseProducts } from '@/lib/showcase';
import { getPublicProjectSource } from '@/lib/project-utils';
import { useShowcaseProducts } from '@/lib/use-showcase-products';
import { PRODUCT_LANDINGS } from '@/lib/product-landings';
import { BRAND_HEROES, SCREENSHOT_CAPTIONS } from '@/lib/product-visuals';
import { CURRENT_PRODUCT_VISUALS } from '@/lib/current-visuals';
import { PRODUCT_MARKS } from '@/lib/product-marks';
import { getProductPath, PRODUCT_ROUTES } from '@/lib/product-paths';
import NotFound from '@/pages/NotFound';
import { PRODUCT_SUPPORT } from '@/lib/product-support';
import '@/styles/product-landings.css';
import '@/styles/product-fonts.css';

export default function ProductLanding() {
  const { slug } = useParams<{ slug: string }>();
  const products = useShowcaseProducts();
  const product =
    products.find(({ project }) => PRODUCT_ROUTES[project.slug] === slug) ??
    getShowcaseProducts({ includeUnlisted: true }).find(
      ({ project }) => PRODUCT_ROUTES[project.slug] === slug,
    );
  if (slug === 'transcript-create') return <Navigate to="/products/rekolekt" replace />;
  if (!product) return <NotFound />;
  const { project } = product;
  const content = PRODUCT_LANDINGS[project.slug];
  if (!content) return <ProductOverview product={product} />;
  const action = getProductAction(product);
  const source = getPublicProjectSource(project);

  return (
    <div className="product-landing" data-product={project.slug}>
      <SEOHead path={getProductPath(project.slug)} />
      <div className="landing-container">
        <nav className="landing-product-nav" aria-label="Product navigation">
          <Link to="/products">All products</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.name}</span>
        </nav>
        <section className="landing-hero" aria-labelledby="product-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow landing-eyebrow-status">
              <span>{product.availability}</span>
            </p>
            <div className="landing-wordmark">
              {PRODUCT_MARKS[project.slug] && <img src={PRODUCT_MARKS[project.slug]} alt="" />}
              <h1 id="product-title">{project.name}</h1>
            </div>
            <p className="landing-headline">{product.headline}</p>
            <p className="landing-summary">{product.summary}</p>
            <div className="landing-actions">
              <a
                className="landing-button"
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {action.label} ↗
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
              {CURRENT_PRODUCT_VISUALS[project.slug]?.caption ??
                (project.screenshot
                  ? (SCREENSHOT_CAPTIONS[project.slug] ?? `${project.name} interface`)
                  : project.slug === 'subsets'
                    ? 'Actual Subsets TUI render / sample skill collection'
                    : BRAND_HEROES.has(project.slug)
                      ? `${project.name} / brand mark`
                      : `${project.name} / concept illustration`)}
              {CURRENT_PRODUCT_VISUALS[project.slug] && (
                <>
                  {' · '}
                  <a
                    className="underline underline-offset-4"
                    href={CURRENT_PRODUCT_VISUALS[project.slug].src}
                  >
                    View full size ↗
                  </a>
                </>
              )}
            </figcaption>
          </figure>
        </section>
        <section id="features" className="landing-section" aria-labelledby="features-title">
          <p className="landing-eyebrow">{content.featuresLabel ?? 'WHAT YOU CAN DO'}</p>
          <h2 id="features-title">{content.introduction}</h2>
          <div className="landing-features" data-count={content.features.length}>
            {content.features.map((feature) => (
              <article key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-section landing-workflow" aria-labelledby="workflow-title">
          <div>
            <p className="landing-eyebrow">{content.stepsLabel ?? 'A PLACE TO START'}</p>
            <h2 id="workflow-title">{content.stepsHeading ?? 'How it works'}</h2>
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
        <ProductRelationships product={product} />
        <section className="landing-section landing-faq" aria-labelledby="faq-title">
          <div>
            <p className="landing-eyebrow">{content.faqLabel ?? 'A FEW DETAILS'}</p>
            <h2 id="faq-title">{content.faqHeading ?? 'Common questions'}</h2>
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
            <p className="landing-eyebrow">BUILT BY SUBCULT</p>
            <h2 id="support-title">{project.name} is made by SUBCULT.</h2>
            <p>
              {PRODUCT_SUPPORT[project.slug] ?? 'Support SUBCULT, the studio behind this project.'}
            </p>
          </div>
          <div className="landing-actions">
            <Link className="landing-button" to="/support">
              See what support pays for →
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
                {product.liveLabel ?? 'Visit the site'} ↗
              </a>
            )}
            {source && (
              <a
                className={project.url ? 'landing-secondary' : 'landing-button'}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.startsWith('https://git.subcult.tv/')
                  ? 'View repository'
                  : 'Download source'}{' '}
                ↗
              </a>
            )}
            <Link className="landing-secondary" to={`/contact?product=${project.slug}`}>
              {project.url ? 'Talk to SUBCULT →' : 'Discuss using it →'}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
