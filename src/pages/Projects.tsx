import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import ProductVisual from '@/components/ProductVisual';
import Teasers from '@/components/Teasers';
import { useShowcaseProducts } from '@/lib/use-showcase-products';
import { getProductPath } from '@/lib/product-paths';
import { groupProducts } from '@/lib/showcase';

export default function Projects() {
  const products = useShowcaseProducts();
  const groups = groupProducts(products);
  return (
    <>
      <SEOHead path="/products" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <header className="mb-12 max-w-3xl">
          <p className="showcase-eyebrow">SUBCULT / INDEPENDENT SOFTWARE</p>
          <h1 className="mb-5">Products</h1>
          <p className="text-bone text-lg">
            {products.length} products in three groups. Some are live, some are demos and some are
            still being built. Each one says which.
          </p>
          <nav className="product-group-nav" aria-label="Product groups">
            {groups.map(({ group, label, products: members }) => (
              <a key={group} href={`#${group}`}>
                {label} <span>{members.length}</span>
              </a>
            ))}
          </nav>
        </header>
        {groups.map(({ group, label, products: members }, groupIndex) => (
          <section
            key={group}
            id={group}
            className="product-group scroll-mt-20"
            aria-labelledby={`group-${group}`}
          >
            <div className="showcase-section-heading">
              <h2 id={`group-${group}`}>{label}</h2>
              <span className="font-mono text-xs text-bone">
                {String(members.length).padStart(2, '0')} PRODUCTS
              </span>
            </div>
            <div className="product-directory">
              {members.map((product, index) => (
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
                    <ProductVisual product={product} priority={groupIndex === 0 && index < 2} />
                  </Link>
                  <p className="showcase-eyebrow mt-6">{product.category}</p>
                  <h3 id={`directory-${product.project.slug}`} className="mb-3">
                    <Link to={getProductPath(product.project.slug)}>{product.project.name}</Link>
                  </h3>
                  {product.relatedSlug && (
                    <p className="text-bone mb-3">
                      {product.project.slug === 'hasanara' ? 'Built on ' : 'Powers '}
                      {products.find((p) => p.project.slug === product.relatedSlug)?.project.name}
                    </p>
                  )}
                  <p className="text-glow text-xl mb-3">{product.headline}</p>
                  <p className="text-bone mb-5">{product.summary}</p>
                  <Link to={getProductPath(product.project.slug)} className="showcase-text-link">
                    About {product.project.name} →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
        <Teasers headingId="products-teasers" />
      </div>
    </>
  );
}
