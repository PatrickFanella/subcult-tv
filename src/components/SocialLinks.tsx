import { Instagram } from 'lucide-react';

import { STUDIO_SOCIALS } from '@/lib/social-links';

function SocialIcon({ name }: { name: string }) {
  if (name === 'Instagram') return <Instagram size={20} aria-hidden="true" />;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {name === 'X' ? (
        <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-7.5L5.2 22H2l8.3-9.5L1 2h6.5l4.4 6.8L18.9 2Zm-1.1 18h1.7L6.5 4H4.7L17.8 20Z" />
      ) : (
        <path d="M5 3c2.8 2.1 5.8 6.3 7 8.6C13.2 9.3 16.2 5.1 19 3c2-1.5 5-2.6 5 1.1 0 .7-.4 5.7-.7 6.5-1 2.8-4.6 3.5-7.8 3 5.6.9 7 3.7 3.9 6.5-6 5.2-7-1.3-7.4-3-.4 1.7-1.4 8.2-7.4 3-3.1-2.8-1.7-5.6 3.9-6.5-3.2.5-6.8-.2-7.8-3C.4 9.8 0 4.8 0 4.1 0 .4 3 1.5 5 3Z" />
      )}
    </svg>
  );
}

export default function SocialLinks() {
  return (
    <nav className="footer-socials" aria-label="SUBCULT social profiles">
      {STUDIO_SOCIALS.map(({ name, url }) => (
        <a key={name} href={url} target="_blank" rel="noopener noreferrer">
          <SocialIcon name={name} />
          <span>{name}</span>
        </a>
      ))}
    </nav>
  );
}
