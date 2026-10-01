/**
 * Page metadata for every public route. SEOHead applies it in the browser,
 * and scripts/prerender-meta.ts writes it into static HTML at build time so
 * link previews and crawlers that don't run JavaScript see the right page.
 */
import { getShowcaseProducts, type ShowcaseProduct } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';

export const SITE_URL = 'https://subcult.tv';
export const SITE_NAME = 'SUBCULT';
export const DEFAULT_IMAGE = '/og-image.png';
const DEFAULT_IMAGE_ALT = 'SUBCULT: Tools for the culture we build together.';

const SOCIAL_PROFILES = [
  'https://bsky.app/profile/subcult.tv',
  'https://x.com/subcult_tv',
  'https://www.patreon.com/subcult',
  'https://git.subcult.tv/subculture-collective',
];

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>[];
}

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: 'Subculture Collective',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/subcult-logo.png`,
  email: 'info@subcult.tv',
  sameAs: SOCIAL_PROFILES,
};

// Search snippets show about 155 characters; these replace longer summaries.
const META_DESCRIPTIONS: Record<string, string> = {
  patchwork:
    'Ask neighbors for help, offer what you can, and find local resources without sharing exact addresses. A pre-alpha mutual aid prototype on AT Protocol.',
  undertow:
    'Layer Milkdrop visuals, spectrum, artwork, lyrics, and particles, then export landscape, portrait, and square MP4s in your browser.',
};

// schema.org applicationCategory for each product.
const APPLICATION_CATEGORY: Record<string, string> = {
  clpr: 'MultimediaApplication',
  patchwork: 'SocialNetworkingApplication',
  hasanara: 'ReferenceApplication',
  'transcript-create': 'ReferenceApplication',
  'subcult-os': 'BusinessApplication',
  undertow: 'MultimediaApplication',
};

function fullTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

const STATIC_PAGES: PageMeta[] = [
  {
    path: '/',
    title: 'SUBCULT | Open-source tools for independent culture',
    description:
      'Open-source software for clips, archives, mutual aid, live events, and music video: CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
    jsonLd: [
      ORGANIZATION,
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { '@id': ORGANIZATION['@id'] },
      },
    ],
  },
  {
    path: '/products',
    title: fullTitle('Products'),
    description:
      'Six open-source products from SUBCULT for Twitch clips, mutual aid, searchable archives, live events, and music video.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
  },
  {
    path: '/about',
    title: fullTitle('Studio'),
    description:
      'SUBCULT is the independent studio behind CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
    jsonLd: [ORGANIZATION],
  },
  {
    path: '/contact',
    title: fullTitle('Contact'),
    description: 'Contact SUBCULT about collaborations, product questions, or bug reports.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
  },
  {
    path: '/support',
    title: fullTitle('Support independent open-source work'),
    description:
      "Fund SUBCULT's hosting, maintenance, documentation, and research. Patreon support keeps the resulting work public.",
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
  },
  {
    path: '/newsletter/confirmed',
    title: fullTitle('Subscription confirmed'),
    description: 'Your SUBCULT product updates subscription is confirmed.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
    noIndex: true,
  },
];

export const NOT_FOUND_META: PageMeta = {
  path: '/404',
  title: fullTitle('Page not found'),
  description: 'There is no page at this address.',
  image: DEFAULT_IMAGE,
  imageAlt: DEFAULT_IMAGE_ALT,
  noIndex: true,
};

/** Social preview image for a product, captured from its landing page. */
export function productImage(slug: string) {
  return `/og/${slug}.jpg`;
}

function productMeta({ project, headline, summary }: ShowcaseProduct): PageMeta {
  const path = getProductPath(project.slug);
  const description = META_DESCRIPTIONS[project.slug] ?? summary;
  const image = productImage(project.slug);
  return {
    path,
    title: fullTitle(`${project.name}: ${headline.replace(/\.$/, '')}`),
    description,
    image,
    imageAlt: `${project.name}: ${headline}`,
    jsonLd: [
      {
        '@type': 'SoftwareApplication',
        name: project.name,
        description,
        url: project.url ?? `${SITE_URL}${path}`,
        mainEntityOfPage: `${SITE_URL}${path}`,
        image: `${SITE_URL}${image}`,
        applicationCategory: APPLICATION_CATEGORY[project.slug],
        operatingSystem: 'Web',
        publisher: { '@id': ORGANIZATION['@id'] },
      },
      ORGANIZATION,
    ],
  };
}

/** Metadata for every route that gets its own static HTML at build time. */
export function getAllPageMeta(): PageMeta[] {
  return [...STATIC_PAGES, ...getShowcaseProducts().map(productMeta)];
}

export function getPageMeta(path: string): PageMeta | undefined {
  return getAllPageMeta().find((meta) => meta.path === path);
}

export function absoluteUrl(pathOrUrl: string) {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

/** JSON-LD document for a page, or null when it has none. */
export function jsonLdDocument(meta: PageMeta): string | null {
  if (!meta.jsonLd?.length) return null;
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonLd }).replace(
    /</g,
    '\\u003c',
  );
}

export type MetaTag = { attr: 'name' | 'property'; key: string; content: string };

/** Every meta tag for a page, in one list shared by runtime and build. */
export function metaTags(meta: PageMeta): MetaTag[] {
  const url = absoluteUrl(meta.path);
  const image = absoluteUrl(meta.image);
  const imageType = meta.image.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  return [
    { attr: 'name', key: 'description', content: meta.description },
    { attr: 'name', key: 'robots', content: meta.noIndex ? 'noindex, nofollow' : 'index, follow' },
    { attr: 'property', key: 'og:type', content: 'website' },
    { attr: 'property', key: 'og:site_name', content: SITE_NAME },
    { attr: 'property', key: 'og:locale', content: 'en_US' },
    { attr: 'property', key: 'og:title', content: meta.title },
    { attr: 'property', key: 'og:description', content: meta.description },
    { attr: 'property', key: 'og:url', content: url },
    { attr: 'property', key: 'og:image', content: image },
    { attr: 'property', key: 'og:image:type', content: imageType },
    { attr: 'property', key: 'og:image:width', content: '1200' },
    { attr: 'property', key: 'og:image:height', content: '630' },
    { attr: 'property', key: 'og:image:alt', content: meta.imageAlt },
    { attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { attr: 'name', key: 'twitter:site', content: '@subcult_tv' },
    { attr: 'name', key: 'twitter:title', content: meta.title },
    { attr: 'name', key: 'twitter:description', content: meta.description },
    { attr: 'name', key: 'twitter:image', content: image },
    { attr: 'name', key: 'twitter:image:alt', content: meta.imageAlt },
  ];
}
