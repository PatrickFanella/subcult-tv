import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { groupProducts, type ShowcaseProduct } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';
import { PRODUCT_MARKS } from '@/lib/product-marks';

/** Every product in three groups: name, mark, one line and a link to its page. */
export default function ProductIndex({ products }: { products: ShowcaseProduct[] }) {
  return (
    <div className="product-index">
      {groupProducts(products).map(({ group, label, products: members }) => (
        <section key={group} className="product-index-group" aria-labelledby={`index-${group}`}>
          <h3 id={`index-${group}`} className="product-index-label">
            {label}
          </h3>
          <ul>
            {members.map(({ project, category }) => (
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
                    <strong>{project.name}</strong>
                    <span className="product-index-category">{category}</span>
                    <span className="product-index-line">{project.description}</span>
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
