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
  'https://www.instagram.com/subcult.tv/',
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
  legalName: 'Subculture-Collective',
  alternateName: ['subcult.tv', 'SUBCULT.TV'],
  url: SITE_URL,
  logo: `${SITE_URL}/brand/subcult/mark.png`,
  email: 'info@subcult.tv',
  sameAs: SOCIAL_PROFILES,
};

// Search snippets show about 155 characters, so every product gets a
// description written to that length instead of its longer showcase summary.
const META_DESCRIPTIONS: Record<string, string> = {
  subsets:
    'Subsets reads the agent skills on your computer, groups them for a task and previews the set before it applies. A local CLI and terminal interface by SUBCULT.',
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
  tadooer:
    'A private, self-hosted task and calendar planner for one owner. Tasks beside the calendar on one grid, one focus session at a time, your server, no sign-up.',
  'chatty-cat':
    'A self-hosted Twitch chat client that merges up to six channels into one scrollback and keeps your display settings. A rebuild of Chat Thing, in migration.',
  headcount:
    'Headcount scores Twitch top-200 streams for patterns that view-bots, follow-bots and chat-bots produce. A high score is a reason to look, not proof.',
  backline:
    'A Discord bot and dashboard for running a community: onboarding, moderation with a case history, private tickets and feeds. In a private pilot; not open yet.',
  arkhiv:
    'Browse print, audio and video collections, read documents and play recordings. Arkhiv keeps source context, file variants and delivery policies visible.',
  overlaid:
    'OBS overlays, Twitch events, a chat bot, scene controls and a health page for one person running a stream. Runs beside OBS on your machine. In development.',
  pirs: 'An experimental fork of the Bluesky personal data server with plugin hook points: a draft spec, a status endpoint and a smoke test. No plugin runs yet.',
  'tmux-popups':
    'A tmux popup toolkit: a Prefix+Enter quick menu and bindings generated from one TSV registry, with overrides, dependency checks and a doctor script. Bash only.',
  'omarchy-monitor-bar':
    'An Omarchy plugin that gives each monitor its own bar layout: Full, Minimal or Hidden, with a settings panel pinned to the stock bar files. Ten languages.',
  'omarchy-superproductivity':
    'An Omarchy plugin that shows the current Super Productivity task in the top bar with a countdown, Stop, Complete and Extend controls and a Today list.',
  'omarchy-plugin-spool':
    'Spool is an animated cassette companion for the Omarchy desktop. Drag it, make it wave, and watch it react to what your coding agent is doing.',
  'omarchy-plugin-shelfish':
    'Shelfish groups existing Omarchy bar widgets into named, collapsible shelves that open when a member’s status changes. Ten languages, no runtime dependencies.',
  'obsidian-plugin-metronome-tuner':
    'A metronome (30 to 300 BPM, tap tempo, seven clicks) and a chromatic tuner with adjustable A4 inside Obsidian. Microphone only after opt-in, analysed locally.',
  'super-productivity-mcp':
    'An MCP server, plugin bridge and quick-add launcher for Super Productivity, so an assistant can create tasks, add time and manage schedules where you keep them.',
};

// Titles allow about 60 characters. These stand in where "name: headline"
// would run long.
const TITLE_PHRASES: Record<string, string> = {
  subsets: 'Local agent skills, grouped for a task',
  clpr: 'Twitch clips by creator, topic and tag',
  patchwork: 'A neighborhood board for mutual aid',
  hasanara: 'Search HasanAbi broadcast transcripts',
  'transcript-create': 'Searchable recording archives',
  'subcult-os': 'Event run sheets and door check-in',
  undertow: 'Music visualizer and video editor',
  prichal: 'Your server. We keep it running',
  kork: 'Free link pages for creators',
  'left-field': 'Sourced election and seat research',
  tadooer: 'A private planner for one owner',
  'chatty-cat': 'Six Twitch channels, one scrollback',
  headcount: 'Bot signals for the Twitch top 200',
  backline: 'A Discord bot for running a community',
  arkhiv: 'Print, audio and video archives',
  overlaid: 'An operator desk for live streams',
  pirs: 'An experimental AT Protocol server',
  'tmux-popups': 'Popups for tmux from one table',
  'omarchy-monitor-bar': 'A bar for each monitor',
  'omarchy-superproductivity': 'In the top bar',
  'omarchy-plugin-spool': 'A cassette companion for Omarchy',
  'omarchy-plugin-shelfish': 'Collapsible Omarchy bar groups',
  'obsidian-plugin-metronome-tuner': 'Practice tools inside Obsidian',
  'super-productivity-mcp': 'MCP for Super Productivity',
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
  subsets: 'DeveloperApplication',
  tadooer: 'BusinessApplication',
  'chatty-cat': 'SocialNetworkingApplication',
  headcount: 'ReferenceApplication',
  backline: 'SocialNetworkingApplication',
  arkhiv: 'ReferenceApplication',
  overlaid: 'MultimediaApplication',
  pirs: 'SocialNetworkingApplication',
  'tmux-popups': 'DeveloperApplication',
  'omarchy-monitor-bar': 'DesktopEnhancementApplication',
  'omarchy-superproductivity': 'DesktopEnhancementApplication',
  'omarchy-plugin-spool': 'DesktopEnhancementApplication',
  'omarchy-plugin-shelfish': 'DesktopEnhancementApplication',
  'obsidian-plugin-metronome-tuner': 'MultimediaApplication',
  'super-productivity-mcp': 'DeveloperApplication',
};

// schema.org operatingSystem; products not listed run in a web browser.
const OPERATING_SYSTEM: Record<string, string> = {
  subsets: 'Linux, macOS (unverified)',
  'tmux-popups': 'Linux, macOS (tmux)',
  'omarchy-monitor-bar': 'Linux (Omarchy)',
  'omarchy-superproductivity': 'Linux (Omarchy)',
  'omarchy-plugin-spool': 'Linux (Omarchy)',
  'omarchy-plugin-shelfish': 'Linux (Omarchy)',
  'obsidian-plugin-metronome-tuner': 'Obsidian desktop and mobile',
  'super-productivity-mcp': 'Linux',
  pirs: 'Linux (Node.js)',
  overlaid: 'Linux, macOS, Windows (self-hosted, beside OBS)',
};

function fullTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

const STATIC_PAGES: PageMeta[] = [
  {
    path: '/',
    title: 'SUBCULT | Tools for independent culture',
    description:
      'Twenty-four tools from SUBCULT: clips, archives, chat, mutual aid, shows, streams, music video, link pages, a Discord bot, desktop plugins and agent tools.',
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
      'All twenty-four SUBCULT products: apps and services, desktop and editor plugins, and developer and agent tools. Each page says how finished it is.',
    image: DEFAULT_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT,
  },
  {
    path: '/about',
    title: fullTitle('Studio'),
    description:
      'SUBCULT is the independent studio behind clpr, Patchwork, HasanAra, Undertow, Kork, Arkhiv, Chatty Cat, Tadooer and sixteen more tools and plugins.',
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
    path: '/newsletter',
    title: fullTitle('Newsletter'),
    description:
      'One email a month from SUBCULT with releases and what we’re working on. Every email has an unsubscribe link.',
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
  const pageUrl = `${SITE_URL}${path}`;
  const applicationId = `${pageUrl}#application`;
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
        '@id': applicationId,
        name: project.name,
        description,
        url: project.url ?? `${SITE_URL}${path}`,
        mainEntityOfPage: `${SITE_URL}${path}`,
        image: `${SITE_URL}${image}`,
        applicationCategory: APPLICATION_CATEGORY[project.slug],
        operatingSystem: OPERATING_SYSTEM[project.slug] ?? 'Web',
        publisher: { '@id': ORGANIZATION['@id'] },
      },
      ORGANIZATION,
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: project.name,
        description,
        mainEntity: { '@id': applicationId },
        breadcrumb: { '@id': `${pageUrl}#breadcrumbs` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumbs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
          { '@type': 'ListItem', position: 3, name: project.name, item: pageUrl },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { '@id': ORGANIZATION['@id'] },
      },
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
