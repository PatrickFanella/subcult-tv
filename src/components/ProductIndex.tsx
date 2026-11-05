import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { groupProducts, type ShowcaseProduct } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';
import { PRODUCT_MARKS } from '@/lib/product-marks';

/** Selected projects grouped by their task and how a visitor can use them. */
export default function ProductIndex({
  products,
  headingLevel: Heading = 'h3',
}: {
  products: ShowcaseProduct[];
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <div className="product-index">
      {groupProducts(products).map(({ group, label, products: members }) => (
        <section
          id={`group-${group}`}
          key={group}
          className="product-index-group scroll-mt-24"
          aria-labelledby={`index-${group}`}
        >
          <Heading id={`index-${group}`} className="product-index-label">
            {label}
          </Heading>
          <ul>
            {members.map(({ project, availability, relationships }) => (
              <li
                key={project.slug}
                style={{ '--product-accent': project.coverColor } as CSSProperties}
              >
                <Link to={getProductPath(project.slug)} className="product-index-item">
                  <span className="product-index-mark" aria-hidden="true">
                    {PRODUCT_MARKS[project.slug] ? (
                      <img src={PRODUCT_MARKS[project.slug]} alt="" loading="lazy" />
                    ) : (
                      <i />
                    )}
                  </span>
                  <span className="product-index-copy">
                    <span className="product-index-name">
                      <strong>{project.name}</strong>
                    </span>
                    <span className="product-index-category">{availability}</span>
                    <span className="product-index-line">{project.description}</span>
                    {relationships?.length === 1 && (
                      <span className="product-index-related">
                        {relationships
                          .map(
                            ({ slug, label }) =>
                              `${label}: ${products.find(({ project }) => project.slug === slug)?.project.name ?? slug}`,
                          )
                          .join(' · ')}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
