#!/usr/bin/env node

/**
 * Writes per-route metadata into static HTML.
 *
 * Link previews (Bluesky, Discord, Slack, X, iMessage) read the raw HTML and
 * don't run JavaScript, so each public route gets its own copy of the built
 * index.html with that route's title, description, canonical URL, social
 * image, and JSON-LD. nginx serves dist/<route>/index.html before falling
 * back to the SPA shell.
 *
 * Usage (needs tsconfig path aliases):
 *   tsx --tsconfig tsconfig.app.json scripts/prerender-meta.ts               # after vite build
 *   tsx --tsconfig tsconfig.app.json scripts/prerender-meta.ts --sync-index  # update index.html
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  absoluteUrl,
  getAllPageMeta,
  getPageMeta,
  jsonLdDocument,
  metaTags,
  type PageMeta,
} from '@/lib/seo';

const START = '<!-- seo:start -->';
const END = '<!-- seo:end -->';

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderBlock(meta: PageMeta): string {
  const lines = [`<title>${escapeAttr(meta.title)}</title>`];
  if (!meta.noIndex) lines.push(`<link rel="canonical" href="${absoluteUrl(meta.path)}" />`);
  for (const { attr, key, content } of metaTags(meta)) {
    lines.push(`<meta ${attr}="${key}" content="${escapeAttr(content)}" />`);
  }
  const ld = jsonLdDocument(meta);
  if (ld) lines.push(`<script id="ld-json" type="application/ld+json">${ld}</script>`);
  return [START, ...lines, END]
    .map((line) => `    ${line}`)
    .join('\n')
    .trimStart();
}

function withBlock(html: string, meta: PageMeta): string {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start === -1 || end === -1)
    throw new Error('index.html is missing the seo:start/seo:end markers');
  return html.slice(0, start) + renderBlock(meta) + html.slice(end + END.length);
}

const root = process.cwd();

if (process.argv.includes('--sync-index')) {
  const file = join(root, 'index.html');
  const home = getPageMeta('/');
  if (!home) throw new Error('missing metadata for /');
  writeFileSync(file, withBlock(readFileSync(file, 'utf8'), home));
  console.log('✓ index.html metadata synced with src/lib/seo.ts');
} else {
  const dist = join(root, 'dist');
  const shell = readFileSync(join(dist, 'index.html'), 'utf8');
  for (const meta of getAllPageMeta()) {
    const dir = meta.path === '/' ? dist : join(dist, meta.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), withBlock(shell, meta));
    console.log(`✓ ${meta.path}`);
  }
}
