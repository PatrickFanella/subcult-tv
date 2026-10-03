import type { Post } from '@/types';

// ── Post Registry ───────────────────────────────────────────
// One entry per post. Order = series order (oldest first).
// To publish a new post: add its entry here with an `mdx` loader.
// Posts without `mdx` are listed in metadata but not yet navigable.

export const posts: Post[] = [
  {
    slug: 'boot-sequence',
    title: "Boot sequence: why we're building Subculture Collective",
    date: '2026-02-17',
    excerpt:
      'Subculture Collective is building searchable archives and collaboration tools that help communities preserve work when platforms change.',
    tags: ['foundations', 'mission', 'infrastructure'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/boot-sequence.mdx'),
    series: { name: 'Foundations', week: 1, total: 8 },
  },
  {
    slug: 'against-metrics',
    title: 'Against metrics',
    date: '2026-02-24',
    excerpt:
      'Teams should choose metrics for specific decisions and remove numbers that rank participants or confuse attention with cultural value.',
    tags: ['foundations', 'metrics', 'culture'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/against-metrics.mdx'),
    series: { name: 'Foundations', week: 2, total: 8 },
  },
  {
    slug: 'the-feed-without-the-feed',
    title: 'The feed without the feed: reclaiming discovery',
    date: '2026-03-03',
    excerpt:
      'clpr helps people discover, organize, collect, and share clips from a catalog without waiting for a feed to resurface them.',
    tags: ['foundations', 'discovery', 'clpr'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/the-feed-without-the-feed.mdx'),
    series: { name: 'Foundations', week: 3, total: 8 },
  },
  {
    slug: 'search-is-governance',
    title: 'Search is governance',
    date: '2026-03-10',
    excerpt:
      'Teams choose how exact matches, similarity, recency, and popularity rank search results, and communities should be able to inspect those choices.',
    tags: ['foundations', 'search', 'governance'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/search-is-governance.mdx'),
    series: { name: 'Foundations', week: 4, total: 8 },
  },
  {
    slug: 'moderation-is-infrastructure',
    title: 'Moderation is infrastructure',
    date: '2026-03-17',
    excerpt:
      'Communities should establish clear rules and accountable moderation procedures before conflict overwhelms volunteers.',
    tags: ['foundations', 'moderation', 'community'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/moderation-is-infrastructure.mdx'),
    series: { name: 'Foundations', week: 5, total: 8 },
  },
  {
    slug: 'digital-zines-as-resistance',
    title: 'Digital zines as resistance',
    date: '2026-03-24',
    excerpt:
      'A digital zine keeps related work in a maker-controlled archive, where readers can return to its original sequence and context.',
    tags: ['foundations', 'zines', 'publishing'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/digital-zines-as-resistance.mdx'),
    series: { name: 'Foundations', week: 6, total: 8 },
  },
  {
    slug: 'how-we-work-without-burning-out',
    title: 'How we work without burning out',
    date: '2026-03-31',
    excerpt:
      'Small, reversible changes and clear expectations let contributors step back without making a project depend on heroic workloads.',
    tags: ['foundations', 'process', 'sustainability'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/how-we-work-without-burning-out.mdx'),
    series: { name: 'Foundations', week: 7, total: 8 },
  },
  {
    slug: 'the-shape-of-a-community',
    title: 'The shape of a community',
    date: '2026-04-07',
    excerpt:
      'clustr visualizes connections between groups and can reveal fragile bridges or isolated members without treating reach as human worth.',
    tags: ['foundations', 'community', 'clustr'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/the-shape-of-a-community.mdx'),
    series: { name: 'Foundations', week: 8, total: 8 },
  },
  {
    slug: 'the-signal-tower',
    title: 'The signal tower: why every collective needs a place to broadcast from',
    date: '2026-06-04',
    excerpt:
      'A collective website gives projects and essays a stable address, with context and history that remain available after a social platform stops promoting them.',
    tags: ['field-systems', 'homepage', 'archives'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/the-signal-tower.mdx'),
    series: { name: 'Field Systems', week: 1, total: 8 },
  },
  {
    slug: 'maps-without-leaderboards',
    title: 'Maps without leaderboards: making communities legible without ranking them',
    date: '2026-06-11',
    excerpt:
      'Community maps can expose isolated groups and overloaded connectors, but consent and privacy must limit what data they collect and display.',
    tags: ['field-systems', 'community', 'mapping'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/maps-without-leaderboards.mdx'),
    series: { name: 'Field Systems', week: 2, total: 8 },
  },
  {
    slug: 'search-is-a-memory-machine',
    title:
      'Search is a memory machine: clips, transcripts, fingerprints, and the fight against amnesia',
    date: '2026-06-18',
    excerpt:
      'Search projects that pair transcripts with provenance need consent and retention limits designed in from the start.',
    tags: ['field-systems', 'search', 'memory'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/search-is-a-memory-machine.mdx'),
    series: { name: 'Field Systems', week: 3, total: 8 },
  },
  {
    slug: 'mutual-aid-has-a-backend',
    title: 'Mutual aid has a backend: trust, moderation, and the infrastructure beneath care',
    date: '2026-06-25',
    excerpt:
      'Mutual-aid coordination needs searchable request states and accountable moderation records.',
    tags: ['field-systems', 'mutual-aid', 'moderation'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/mutual-aid-has-a-backend.mdx'),
    series: { name: 'Field Systems', week: 4, total: 8 },
  },
  {
    slug: 'argument-machines',
    title: 'Argument machines: markets, courts, and the usefulness of structured disagreement',
    date: '2026-07-02',
    excerpt:
      'Autonomous systems should route high-stakes actions through a review procedure that can stop execution and preserve dissent.',
    tags: ['field-systems', 'governance', 'ai'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/argument-machines.mdx'),
    series: { name: 'Field Systems', week: 5, total: 8 },
  },
  {
    slug: 'tiny-worlds-for-real-life',
    title: 'Tiny worlds for real life: place, memory, and simulation as interfaces',
    date: '2026-07-09',
    excerpt:
      'Simulated worlds that reflect personal habits and community memories need retention controls designed in.',
    tags: ['field-systems', 'simulation', 'memory'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/tiny-worlds-for-real-life.mdx'),
    series: { name: 'Field Systems', week: 6, total: 8 },
  },
  {
    slug: 'media-without-a-studio',
    title: 'Media without a studio: small-crew production in the age of assembly lines',
    date: '2026-07-16',
    excerpt:
      'Cutroom and One Block Cinema explore production workflows that help small crews finish films while keeping authorship and editorial control.',
    tags: ['field-systems', 'media', 'production'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/media-without-a-studio.mdx'),
    series: { name: 'Field Systems', week: 7, total: 8 },
  },
  {
    slug: 'the-workshop-after-the-manifesto',
    title: 'The workshop after the manifesto: building a collective without becoming a platform',
    date: '2026-07-23',
    excerpt:
      'Portable formats and replaceable tools let a collective preserve its archive and continue working when a service changes or disappears.',
    tags: ['field-systems', 'operations', 'infrastructure'],
    author: 'SUBCULT',
    mdx: () => import('@content/posts/the-workshop-after-the-manifesto.mdx'),
    series: { name: 'Field Systems', week: 8, total: 8 },
  },
];

// ── Helpers ──────────────────────────────────────────────────

/** A post is published when it has an `mdx` loader and its date is today or earlier. */
export function isPublished(post: Post): boolean {
  if (!post.mdx) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(post.date + 'T00:00:00') <= today;
}

export function getPublishedPosts(): Post[] {
  return posts.filter(isPublished);
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug && isPublished(p));
}

export function getPostMDX(slug: string) {
  const post = posts.find((p) => p.slug === slug);
  return post?.mdx;
}

export function getLatestPosts(count: number = 3): Post[] {
  return getPublishedPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

/** Returns the next post in the same series (by week), or undefined. */
export function getNextInSeries(slug: string): Post | undefined {
  const current = posts.find((p) => p.slug === slug);
  if (!current?.series) return undefined;
  const idx = posts.indexOf(current);
  const next = posts[idx + 1];
  if (next?.series?.name === current.series.name && isPublished(next)) return next;
  return undefined;
}
