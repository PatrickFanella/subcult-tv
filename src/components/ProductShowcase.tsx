import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { getProductAction, type ShowcaseProduct } from '@/lib/showcase';
import { getCuratedProjectBySlug } from '@/lib/project-catalog';
import ProductVisual from '@/components/ProductVisual';
import { getProductPath } from '@/lib/product-paths';

export default function ProductShowcase({ products }: { products: ShowcaseProduct[] }) {
  return (
    <div className="product-showcase">
      {products.map((product, index) => {
        const { project } = product;
        const relationship = product.relationships?.[0];
        const related = getCuratedProjectBySlug(relationship?.slug);
        const action = getProductAction(product, `Explore ${project.name}`);
        return (
          <article
            id={project.slug}
            key={project.slug}
            className="showcase-product"
            style={{ '--product-accent': project.coverColor } as CSSProperties}
            aria-labelledby={`${project.slug}-heading`}
          >
            <div className="showcase-product-copy">
              <p className="showcase-eyebrow">
                <span className="product-number">{String(index + 1).padStart(2, '0')}</span>{' '}
                {product.category}
              </p>
              <h3 id={`${project.slug}-heading`} className="product-name">
                {project.name}
              </h3>
              <p className="product-headline">{product.headline}</p>
              <p className="text-bone leading-relaxed mb-6">{product.summary}</p>
              <ul className="product-highlights">
                {product.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="product-actions">
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product-primary-link"
                >
                  {action.label} ↗
                </a>
                <Link
                  to={getProductPath(project.slug)}
                  className="showcase-text-link"
                  aria-label={`About ${project.name}`}
                >
                  About the product →
                </Link>
              </div>
              {related && (
                <p className="product-related">
                  {relationship?.label}:
                  <Link to={getProductPath(related.slug)}>{related.name} →</Link>
                </p>
              )}
            </div>
            <div className="showcase-product-visual">
              <ProductVisual product={product} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
