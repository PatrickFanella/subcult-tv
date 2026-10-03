import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import ProductShowcase from '@/components/ProductShowcase';
import Teasers from '@/components/Teasers';
import { getShowcaseProducts } from '@/lib/showcase';

export default function Home() {
  const products = getShowcaseProducts();
  return (
    <>
      <SEOHead path="/" />
      <section className="showcase-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <img src="/brand/subcult/master.svg?v=logo-bcd-20261003" alt="" className="subcult-hero-mark" />
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-20 items-end">
            <div>
              <p className="showcase-eyebrow">SUBCULTURE COLLECTIVE / INDEPENDENT SOFTWARE</p>
              <h1 className="showcase-title">
                Tools for the culture
                <br />
                <span>we build together.</span>
              </h1>
            </div>
            <div>
              <p className="text-bone text-lg leading-relaxed mb-6">
                Save Twitch clips. Search a broadcast archive. Coordinate mutual aid. Run the door
                at your next show. Research an election seat. SUBCULT builds software for each of
                these.
              </p>
              <Button as="a" href="#products" variant="secondary">
                Explore the products ↓
              </Button>
            </div>
          </div>
        </div>
        <div className="subcult-product-bar">
          <div
            className="showcase-index max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            aria-label="Featured products"
          >
            {products.map(({ project }, index) => (
              <a href={`#${project.slug}`} key={project.slug}>
                <span>{String(index + 1).padStart(2, '0')}</span> {project.name}
              </a>
            ))}
          </div>
        </div>
      </section>
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20"
        aria-labelledby="products-heading"
      >
        <div className="showcase-section-heading">
          <h2 id="products-heading">The products</h2>
          <span className="font-mono text-xs text-bone">MEDIA / COMMUNITY / LIVE CULTURE</span>
        </div>
        <ProductShowcase products={products} />
        <Teasers headingId="home-teasers" />
      </section>
      <section className="border-t border-fog bg-soot">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12">
          <div>
            <p className="showcase-eyebrow">BUILT BY SUBCULT</p>
            <h2 className="mb-5">Built in the open.</h2>
            <p className="text-bone max-w-lg mb-6">
              Every product links to its source code. Read it, follow the work, or talk to us about
              your own project.
            </p>
            <Link to="/about" className="showcase-text-link">
              Meet the studio →
            </Link>
          </div>
          <div className="space-y-6 md:border-l border-fog md:pl-12">
            <div>
              <Link to="/contact" className="showcase-text-link">
                Build something with us →
              </Link>
              <p className="text-sm text-bone mt-2">
                Have an archive, a community, or an event that needs software? Get in touch.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
