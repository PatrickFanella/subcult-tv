import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useShowcaseProducts } from '@/lib/use-showcase-products';
import { getProductPath } from '@/lib/product-paths';
import { useEffects } from '@/context/useEffects';

const NAV_LINKS = [
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'Studio' },
  { to: '/support', label: 'Support' },
  { to: '/development', label: 'Development' },
  { to: '/contact', label: 'Contact' },
];

export default function Nav() {
  const products = useShowcaseProducts();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { vhs, toggleVhs } = useEffects();

  return (
    <nav
      className="sticky top-0 z-50 bg-void/95 backdrop-blur-sm border-b border-fog"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            aria-label="SUBCULT home"
            className="subcult-nav-brand font-display text-xl font-bold tracking-[0.2em] text-glow hover:text-signal transition-colors no-underline"
          >
            <img
              src="/brand/subcult/fisheye-circle.png?v=fisheye-20261003"
              className="subcult-nav-mark"
              alt=""
            />
            <span>SUBCULT</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-mono text-xs uppercase tracking-wider transition-colors no-underline ${
                    isActive ? 'text-signal' : 'text-bone hover:text-glow'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}

            {/* VHS effects toggle */}
            <button
              type="button"
              onClick={toggleVhs}
              className="font-mono text-xs px-2 py-1 border border-fog text-dust hover:text-flicker hover:border-flicker transition-colors duration-200 cursor-pointer"
              aria-pressed={vhs}
              aria-label="VHS effects"
              title={`VHS effects: ${vhs ? 'on' : 'off'}`}
            >
              {vhs ? 'VHS:ON' : 'VHS:OFF'}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden font-mono text-sm text-bone hover:text-signal p-2 cursor-pointer"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? '[CLOSE]' : '[MENU]'}
          </button>
        </div>
      </div>

      {pathname !== '/products' && (
        <div className="product-shortcuts" aria-label="Product shortcuts">
          {products.map(({ project }) => (
            <NavLink
              key={project.slug}
              to={getProductPath(project.slug)}
              onClick={() => setMobileOpen(false)}
            >
              {project.name}
            </NavLink>
          ))}
        </div>
      )}
      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-fog bg-soot">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block font-mono text-sm uppercase tracking-wider no-underline ${
                    isActive ? 'text-signal' : 'text-bone hover:text-glow'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-2 border-t border-fog">
              <button
                type="button"
                onClick={toggleVhs}
                className="font-mono text-xs px-2 py-1 border border-fog text-dust cursor-pointer"
                aria-pressed={vhs}
                aria-label="VHS effects"
              >
                {vhs ? 'VHS:ON' : 'VHS:OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
