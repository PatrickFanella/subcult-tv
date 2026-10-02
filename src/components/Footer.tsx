import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getShowcaseProducts } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';

export default function Footer() {
  return (
    <footer className="border-t border-fog bg-soot" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr] gap-10">
          <div>
            <Link
              to="/"
              className="font-display text-2xl font-bold tracking-[0.2em] text-glow no-underline"
            >
              SUBCULT
            </Link>
            <p className="text-sm text-bone mt-4 mb-6">
              Open-source software for independent media, mutual aid, archives, and live events.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about">The studio</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/support">Support the products</Link>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/subcult.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bluesky ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-xs text-bone uppercase tracking-wider mb-4">Products</h2>
            <ul className="space-y-3 text-sm">
              {getShowcaseProducts().map(({ project }) => (
                <li key={project.slug}>
                  <Link to={getProductPath(project.slug)}>{project.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div id="newsletter" className="scroll-mt-24">
            <NewsletterSignup />
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-fog flex flex-col sm:flex-row justify-between gap-4 text-xs text-bone">
          <p>© {new Date().getFullYear()} Subculture Collective.</p>
          <Link to="/products">Explore all eight products →</Link>
        </div>
      </div>
    </footer>
  );
}
