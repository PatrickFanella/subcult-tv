#!/usr/bin/env node

/**
 * Sitemap Generator for subcult.tv
 *
 * Generates public/sitemap.xml from static routes + the project catalog
 * + published zine posts. Run before build: npm run generate-sitemap
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getProductPath } from '../src/lib/product-paths.js';

// @content alias is not resolved under tsx, so read the catalog directly.
type CatalogProject = {
  slug: string;
  status: string;
  featured: boolean;
  lastUpdated?: string;
};
type CatalogEntries = Record<string, CatalogProject>;

function getProjects(): CatalogProject[] {
  const raw = readFileSync(join(process.cwd(), 'content', 'projects.json'), 'utf-8');
  const catalog = JSON.parse(raw) as CatalogEntries;
  return Object.values(catalog).sort((a, b) => (a.slug < b.slug ? -1 : 1));
}

// Site configuration
const SITE_URL = 'https://subcult.tv';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

// Static routes (SHELL-level pages, column order unchanged from public/sitemap.xml)
const STATIC_ROUTES: SitemapEntry[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/products', changefreq: 'weekly', priority: '0.9' },
  { loc: '/about', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.6' },
  { loc: '/support', changefreq: 'monthly', priority: '0.5' },
];

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates sitemap XML
 */
function generateSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastmod ? `\n    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : '';
      return `  <url>
    <loc>${SITE_URL}${e.loc}</loc>${lastmod}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Generating sitemap for subcult.tv...');

  const entries: SitemapEntry[] = [...STATIC_ROUTES];

  // Project detail pages (from the catalog — single source of truth)
  const projects = getProjects();
  for (const p of projects) {
    const lastmod = p.lastUpdated?.split('T')[0];
    entries.push({
      loc: getProductPath(p.slug),
      lastmod,
      changefreq: p.status === 'active' ? 'weekly' : 'monthly',
      priority: p.featured ? '0.8' : '0.6',
    });
  }

  // Ensure public directory exists
  const publicDir = join(process.cwd(), 'public');
  mkdirSync(publicDir, { recursive: true });

  const sitemapXml = generateSitemap(entries);

  // Write sitemap.xml to public directory (copied to dist during build)
  const sitemapPath = join(publicDir, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemapXml, 'utf-8');

  console.log(`✅ Sitemap generated: ${sitemapPath}`);
  console.log(`📊 ${entries.length} URLs included (${projects.length} projects, 0 posts)`);
}

// Run the script
main();
