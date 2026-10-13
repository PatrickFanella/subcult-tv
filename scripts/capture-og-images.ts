#!/usr/bin/env node

/**
 * Social preview images (1200×630) captured from the built site.
 *
 * Writes public/og-image.png from the homepage hero and public/og/<slug>.jpg
 * from each product landing hero, in that product's own design. Rerun after
 * changing a landing page's hero, headline, or screenshot.
 *
 * public/og/left-field.jpg is not captured: it is a Studio export written by
 * `make studio-export-left-field` and its hash is recorded in
 * docs/left-field-brand-provenance.json. The products added on October 12,
 * 2026 use their pack's own social image, exported by
 * studio/scripts/export_site_brands.py into docs/site-brand-provenance.json.
 *
 * Usage:
 *   npm run build && npm run preview          # serves on :4173
 *   npm run capture-og-images                 # in another terminal
 *
 * Set BASE_URL to use another server and PUPPETEER_EXECUTABLE_PATH for a
 * system Chrome/Chromium.
 */

import puppeteer, { type Page } from 'puppeteer';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { PRODUCT_ROUTES } from '../src/lib/product-paths.js';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';
const PUBLIC_DIR = join(process.cwd(), 'public');

// Share images owned by a Studio export; capturing would break their provenance hash.
const STUDIO_EXPORTED = new Set([
  'left-field',
  // Exported from their Studio packs by studio/scripts/export_site_brands.py.
  'chatty-cat',
  'backline',
  'tadooer',
  'arkhiv',
  'overlaid',
  'pirs',
  'tmux-popups',
  'omarchy-monitor-bar',
  'omarchy-superproductivity',
  'omarchy-plugin-spool',
  'omarchy-plugin-shelfish',
  'obsidian-plugin-metronome-tuner',
  'super-productivity-mcp',
]);

// Hide site chrome and tighten the hero so it fills the 1200×630 frame.
const FRAME_CSS = `
  nav, header, .product-shortcuts, .landing-product-nav, .skip-link { display: none !important; }
  .landing-hero { padding: 48px 0 !important; min-height: 630px; box-sizing: border-box; }
  .landing-audience, .landing-actions { display: none !important; }
  .showcase-hero { padding: 0 !important; height: 630px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }
  .showcase-index { display: none !important; }
`;

async function capture(
  page: Page,
  path: string,
  selector: string,
  file: string,
  type: 'png' | 'jpeg',
) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: FRAME_CSS });
  await page.evaluate(() => document.fonts.ready);
  const top = await page.$eval(selector, (el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.screenshot({
    path: file as `${string}.png`,
    type,
    ...(type === 'jpeg' ? { quality: 85 } : {}),
  });
  console.log(`✓ ${path} → ${file.replace(process.cwd() + '/', '')}`);
}

async function main() {
  mkdirSync(join(PUBLIC_DIR, 'og'), { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  await capture(page, '/', '.showcase-hero', join(PUBLIC_DIR, 'og-image.png'), 'png');
  for (const [slug, route] of Object.entries(PRODUCT_ROUTES)) {
    if (STUDIO_EXPORTED.has(slug)) {
      console.log(`- /products/${route} skipped (Studio export)`);
      continue;
    }
    await capture(
      page,
      `/products/${route}`,
      '.landing-hero',
      join(PUBLIC_DIR, 'og', `${slug}.jpg`),
      'jpeg',
    );
  }
  await browser.close();
}

main();
