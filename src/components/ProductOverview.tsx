import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import ProductRelationships from '@/components/ProductRelationships';
import ProductVisual from '@/components/ProductVisual';
import { CURRENT_PRODUCT_VISUALS } from '@/lib/current-visuals';
import { getProductAction, type ShowcaseProduct } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';
import { getPublicProjectSource } from '@/lib/project-utils';

/** Text-led introductions for selected projects without an exported site visual. */
export default function ProductOverview({ product }: { product: ShowcaseProduct }) {
  const { project } = product;
  const action = getProductAction(product);
  const source = getPublicProjectSource(project);
  const contactHref = `/contact?product=${project.slug}`;
  return (
    <>
      <SEOHead path={getProductPath(project.slug)} />
      <div className="portfolio-overview max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <nav className="mb-10 text-sm text-bone" aria-label="Product navigation">
          <Link to="/products">All products</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{project.name}</span>
        </nav>
        <p className="showcase-eyebrow">{product.availability}</p>
        <h1 className="mb-6">{project.name}</h1>
        <p className="text-glow text-xl md:text-2xl mb-6">{product.headline}</p>
        <p className="text-bone text-lg leading-relaxed max-w-3xl mb-8">{product.summary}</p>
        <a className="portfolio-primary-action" href={action.href}>
          {action.label} →
        </a>
        {CURRENT_PRODUCT_VISUALS[project.slug] && (
          <figure className="mt-10">
            <ProductVisual product={product} priority />
            <figcaption className="mt-3 text-xs text-bone leading-relaxed">
              {CURRENT_PRODUCT_VISUALS[project.slug].caption}
              {' · '}
              <a
                className="underline underline-offset-4"
                href={CURRENT_PRODUCT_VISUALS[project.slug].src}
              >
                View full size ↗
              </a>
            </figcaption>
          </figure>
        )}
        <div className="mt-12 space-y-6">
          <ProductRelationships product={product} />
        </div>
        {action.href !== contactHref && (
          <div className="mt-10 pt-6 border-t border-fog flex flex-wrap gap-6 text-sm">
            {source && source !== action.href && <a href={source}>Read the source ↗</a>}
            <Link to={contactHref}>Ask SUBCULT about {project.name} →</Link>
          </div>
        )}
      </div>
    </>
  );
}
