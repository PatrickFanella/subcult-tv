import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/NewsletterSignup';

const FOOTER_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/zine', label: 'Field Notes' },
  { to: '/about', label: 'About' },
  { to: '/support', label: 'Support' },
  { to: '/contact', label: 'Contact' },
  { to: '/press', label: 'Press Kit' },
  { to: '/links', label: 'Links' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://bsky.app/profile/subcult.tv',
    label: 'Bluesky',
    external: true,
  },
  {
    href: 'https://git.subcult.tv/subculture-collective',
    label: 'Gitea',
    external: true,
  },
  { href: 'https://www.patreon.com/subcult', label: 'Patreon', external: true },
  { href: '/feed.xml', label: 'RSS Feed', external: false },
];

export default function Footer() {
  return (
    <footer className="border-t border-fog bg-soot" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter */}
        <div className="mb-8 pb-8 border-b border-fog">
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="font-display text-2xl font-bold tracking-[0.2em] text-glow hover:text-signal transition-colors duration-200 no-underline"
            >
              SUBCULT
            </Link>
            <p className="font-mono text-xs text-bone mt-3 leading-relaxed">
              Subculture Collective
              <br />
              Open-source tools and field notes
              <br />
              for independent culture.
            </p>
            <p className="font-mono text-xs text-fog mt-4">&gt; carrier_wave.persist()</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs text-bone uppercase tracking-wider mb-4">
              // Navigation
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="font-mono text-sm text-bone hover:text-signal transition-colors duration-200 no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h4 className="font-mono text-xs text-bone uppercase tracking-wider mb-4">
              // Connect
            </h4>
            <ul className="space-y-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    {...(link.external && {
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    })}
                    className="font-mono text-sm text-bone hover:text-signal transition-colors duration-200"
                  >
                    {link.label} {link.external && '↗'}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-fog">
              <p className="font-mono text-xs text-fog">
                &gt; No ad profiles. No brokered data.
                <br />
                &gt; Project documentation lives in the public catalog.
                <br />
                &gt; Repository links live in the catalog.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-fog flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-fog">
            © {new Date().getFullYear()} Subculture Collective. All signals reserved.
          </p>
          <p className="font-mono text-xs text-fog">EST. 2026 // BROADCASTING FROM THE STATIC</p>
        </div>
      </div>
    </footer>
  );
}
