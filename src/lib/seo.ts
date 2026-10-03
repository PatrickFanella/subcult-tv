/**
 * Page metadata for every public route. SEOHead applies it in the browser,
 * and scripts/prerender-meta.ts writes it into static HTML at build time so
 * link previews and crawlers that don't run JavaScript see the right page.
 */
import { getShowcaseProducts, type ShowcaseProduct } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';
import { PATREON_URL } from '@/lib/links';

export const SITE_URL = 'https://subcult.tv';
export const SITE_NAME = 'SUBCULT';
export const DEFAULT_IMAGE = '/og-image.png';
const DEFAULT_IMAGE_ALT = 'SUBCULT: Tools for the culture we build together.';

const SOCIAL_PROFILES = [
  'https://bsky.app/profile/subcult.tv',
  'https://x.com/subcult_tv',
  PATREON_URL,
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
  logo: `${SITE_URL}/brand/subcult/mark.png`,
  email: 'info@subcult.tv',
  sameAs: SOCIAL_PROFILES,
};

// Search snippets show about 155 characters, so every product gets a
// description written to that length instead of its longer showcase summary.
const META_DESCRIPTIONS: Record<string, string> = {
  clpr: 'Twitch clips sorted by creator, topic and tag. Save the good ones to playlists and send them to whoever missed it live.',
  patchwork:
    'A neighborhood board for asking and offering help. Requests show an approximate area. Pre-alpha demonstration: please don’t arrange real help through it yet.',
  hasanara:
    'Search years of HasanAbi broadcasts by topic or exact phrase. Results open at the timestamp. Transcripts are automatic, so check the recording before quoting.',
  'transcript-create':
    'Rekolekt transcribes recordings with timestamps, indexes the text and links each passage to its source. Software you deploy, not a hosted upload service.',
  'subcult-os':
    'A run sheet for small shows: the plan, the crew, free ticket reservations, door check-in and an end-of-night report. Subcult OS is in development.',
  undertow:
    'Layer Milkdrop, spectrum, VU meters, artwork and timed lyrics. Lay out 16:9, 9:16 and 1:1, then export H.264 MP4 in your browser.',
  prichal:
    'Prichal runs your account’s own server on the open network Bluesky runs on, and we do the maintenance. Private preview, with no sign-up yet.',
  kork: 'A free link page with 92 services, ten themes, embeds, QR codes and anonymous analytics. Tips go to your own accounts, and Kork takes no cut.',
  'left-field':
    'Seat-level public records beside their sources and gaps. Scores are provisional, versioned research notes, not forecasts. In active development.',
};

// Titles allow about 60 characters. These stand in where "name: headline"
// would run long.
const TITLE_PHRASES: Record<string, string> = {
  clpr: 'Twitch clips by creator, topic and tag',
  patchwork: 'A neighborhood board for mutual aid',
  hasanara: 'Search what was said on stream',
  'transcript-create': 'Searchable recording archives',
  'subcult-os': 'A run sheet for small shows',
  undertow: 'Give the track something to look at',
  prichal: 'Your server. We keep it running',
  kork: 'A free page for every link',
  'left-field': 'Sourced seat research',
};

// schema.org applicationCategory for each product.
const APPLICATION_CATEGORY: Record<string, string> = {
  'left-field': 'ReferenceApplication',
  clpr: 'MultimediaApplication',
  patchwork: 'SocialNetworkingApplication',
  hasanara: 'ReferenceApplication',
  'transcript-create': 'ReferenceApplication',
  'subcult-os': 'BusinessApplication',
  undertow: 'MultimediaApplication',
  prichal: 'SocialNetworkingApplication',
  kork: 'SocialNetworkingApplication',
};

function fullTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

const STATIC_PAGES: PageMeta[] = [
  {
    path: '/',
    title: 'SUBCULT | Tools for independent culture',
    description:
      'Nine products from SUBCULT for people who run things: Twitch clips, archives, mutual aid, shows, music video, account hosting, link pages, seat research.',
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
      'clpr, Patchwork, HasanAra, Rekolekt, Subcult OS, Undertow, Prichal, Kork and Left Field. Each page says whether the product is live, a demo or in development.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
  },
  {
    path: '/about',
    title: fullTitle('Studio'),
    description:
      'Subculture Collective is the independent studio behind clpr, Patchwork, HasanAra, Rekolekt, Subcult OS, Undertow, Prichal, Kork and Left Field.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
    jsonLd: [ORGANIZATION],
  },
  {
    path: '/contact',
    title: fullTitle('Contact'),
    description:
      'Write to SUBCULT about a product, a bug or something you’re working on. Use the form or email info@subcult.tv.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
  },
  {
    path: '/support',
    title: fullTitle('Support the workshop'),
    description:
      'Paying doesn’t unlock the software; it stays public. Patreon members get private Discord channels and supporter posts, with no fixed posting schedule.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
  },
  {
    path: '/newsletter/confirmed',
    title: fullTitle('Subscription confirmed'),
    description: 'Your subscription to the monthly SUBCULT newsletter is confirmed.',
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
    title: fullTitle(
      `${project.name}: ${TITLE_PHRASES[project.slug] ?? headline.replace(/\.$/, '')}`,
    ),
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
