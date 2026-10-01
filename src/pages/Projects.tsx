import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import ProductVisual from '@/components/ProductVisual';
import { getShowcaseProducts } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';

export default function Projects() {
  return (
    <>
      <SEOHead
        title="Products"
        description="Six products for independent media, mutual aid, archives, live events, and music. Explore the software built by SUBCULT."
        path="/products"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <header className="mb-12 max-w-3xl">
          <p className="showcase-eyebrow">SUBCULT / INDEPENDENT SOFTWARE</p>
          <h1 className="mb-5">Find your tool.</h1>
          <p className="text-bone text-lg">
            From a clip worth keeping to a night worth putting on. Six products, each built around a
            different part of independent culture.
          </p>
        </header>
        <div className="product-directory">
          {getShowcaseProducts().map((product, index) => (
            <article
              key={product.project.slug}
              aria-labelledby={`directory-${product.project.slug}`}
              style={{ '--product-accent': product.project.coverColor } as CSSProperties}
            >
              <Link
                to={getProductPath(product.project.slug)}
                className="product-directory-visual"
                aria-label={`Explore ${product.project.name}`}
              >
                <ProductVisual product={product} priority={index < 2} />
              </Link>
              <p className="showcase-eyebrow mt-6">{product.category}</p>
              <h2 id={`directory-${product.project.slug}`} className="mb-3">
                <Link to={getProductPath(product.project.slug)}>{product.project.name}</Link>
              </h2>
              <p className="text-glow text-xl mb-3">{product.headline}</p>
              <p className="text-bone mb-5">{product.summary}</p>
              <Link to={getProductPath(product.project.slug)} className="showcase-text-link">
                About {product.project.name} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
