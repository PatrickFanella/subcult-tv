import { useEffect } from 'react';
import {
  absoluteUrl,
  getPageMeta,
  jsonLdDocument,
  metaTags,
  NOT_FOUND_META,
  type PageMeta,
} from '@/lib/seo';

interface SEOHeadProps {
  /** Route path; its title, description, and image come from src/lib/seo.ts. */
  path: string;
  /** Use the not-found metadata (noindex) instead of the route's. */
  notFound?: boolean;
}

/**
 * Applies a route's metadata to the document head on navigation. The same
 * tags are written into static HTML at build time (scripts/prerender-meta.ts).
 */
export default function SEOHead({ path, notFound = false }: SEOHeadProps) {
  const meta: PageMeta = (!notFound && getPageMeta(path)) || NOT_FOUND_META;

  useEffect(() => {
    document.title = meta.title;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (meta.noIndex) {
      canonical?.remove();
    } else {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = absoluteUrl(meta.path);
    }

    for (const { attr, key, content } of metaTags(meta)) {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    const ld = jsonLdDocument(meta);
    let script = document.querySelector<HTMLScriptElement>('script#ld-json');
    if (!ld) {
      script?.remove();
    } else {
      if (!script) {
        script = document.createElement('script');
        script.id = 'ld-json';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = ld;
    }
  }, [meta]);

  return null;
}
