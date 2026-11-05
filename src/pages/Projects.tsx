import SEOHead from '@/components/SEOHead';
import ProductIndex from '@/components/ProductIndex';
import Teasers from '@/components/Teasers';
import { useShowcaseProducts } from '@/lib/use-showcase-products';
import { groupProducts } from '@/lib/showcase';

export default function Projects() {
  const products = useShowcaseProducts();
  const groups = groupProducts(products);
  return (
    <>
      <SEOHead path="/products" />
      <div className="catalogue-directory max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <header className="mb-12 max-w-3xl">
          <p className="showcase-eyebrow">SUBCULT / INDEPENDENT SOFTWARE</p>
          <h1 className="mb-5">Products</h1>
          <p className="text-bone text-lg">
            Apps to open, archives to explore, software to run yourself and projects still in the
            workshop. Each entry says how you can use it and how finished it is.
          </p>
          <nav className="product-group-nav" aria-label="Product groups">
            {groups.map(({ group, label }) => (
              <a key={group} href={`#group-${group}`}>
                {label}
              </a>
            ))}
          </nav>
        </header>
        <ProductIndex products={products} headingLevel="h2" />
        <Teasers headingId="products-teasers" />
      </div>
    </>
  );
}
