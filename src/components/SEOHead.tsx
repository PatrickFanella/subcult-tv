import { useEffect } from 'react';

const SITE_URL = 'https://subcult.tv';

interface SEOHeadProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Lightweight head manager — updates document title and meta tags.
 * No react-helmet needed for React 19.
 */
export default function SEOHead({
  title,
  description = 'Explore CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow. Open-source software for media, mutual aid, archives, and live events.',
  path = '/',
  image = '/og-image.png',
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle =
    title === 'Home' ? 'SUBCULT | Open-source tools for independent culture' : `${title} | SUBCULT`;
  const url = `${SITE_URL}${path}`;
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  useEffect(() => {
    document.title = fullTitle;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // OpenGraph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', absoluteImage);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:site_name', 'SUBCULT');
    setMeta('property', 'og:type', 'website');

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@subcult_tv');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', absoluteImage);
  }, [fullTitle, description, url, absoluteImage, noIndex]);

  return null;
}
