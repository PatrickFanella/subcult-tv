import { Link } from 'react-router-dom';
import type { ShowcaseProduct } from '@/lib/showcase';
import { getCuratedProjectBySlug } from '@/lib/project-catalog';
import { getProductPath } from '@/lib/product-paths';

export default function ProductRelationships({ product }: { product: ShowcaseProduct }) {
  return product.relationships?.map((relationship) => {
    const related = getCuratedProjectBySlug(relationship.slug);
    if (!related) return null;
    const headingId = `relationship-${related.slug}`;
    return (
      <section key={related.slug} className="product-relationship" aria-labelledby={headingId}>
        <p className="product-relationship-label">{relationship.label}</p>
        <h2 id={headingId}>
          <Link to={getProductPath(related.slug)}>{related.name} →</Link>
        </h2>
        <p>{relationship.description}</p>
      </section>
    );
  });
}
