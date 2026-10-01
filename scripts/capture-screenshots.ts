#!/usr/bin/env node

/**
 * Screenshot capture for the project catalog.
 *
 * Opens a project's live `url` at a 1440×900 viewport and writes
 * public/screenshots/<slug>-home-1440.webp, so catalog cards and detail
 * pages show the app in its own design system.
 *
 * Usage:
 *   npm run capture-screenshots                    # refresh existing captures
 *   npm run capture-screenshots -- clpr hasanara   # selected slugs only
 *
 * Without arguments, only projects whose catalog `screenshot` already
 * points at /screenshots/<slug>-home-1440.webp are refreshed. Pass a slug
 * to capture a project for the first time, then add its `screenshot`.
 *
 * Set PUPPETEER_EXECUTABLE_PATH to use a system Chrome/Chromium.
 * Review each image before committing: login walls, empty states and
 * error pages should not replace a good screenshot.
 */

import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CatalogEntry {
  slug: string;
  url?: string;
  screenshot?: string;
}

// Consent banners cover the bottom of the viewport; accept them so the
// capture shows the app. The headless profile is discarded afterwards.
const CONSENT_BUTTON = /^(accept all|accept|allow all|got it|i agree)$/i;

const OUTPUT_DIR = join(process.cwd(), 'public', 'screenshots');
const catalog = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'projects.json'), 'utf8'),
) as Record<string, CatalogEntry>;

const requested = process.argv.slice(2);
const targets = Object.values(catalog).filter((p) =>
  requested.length > 0
    ? requested.includes(p.slug)
    : p.screenshot === `/screenshots/${p.slug}-home-1440.webp`,
);

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });

  let failures = 0;
  for (const project of targets) {
    if (!project.url) {
      failures++;
      console.error(`✗ ${project.slug}: no url in catalog`);
      continue;
    }
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const target = new URL('/', project.url).toString();
    const file = join(OUTPUT_DIR, `${project.slug}-home-1440.webp`);
    try {
      const response = await page.goto(target, { waitUntil: 'networkidle2', timeout: 45_000 });
      if (!response || !response.ok()) throw new Error(`HTTP ${response?.status() ?? 'none'}`);
      await page.evaluate((pattern) => {
        const re = new RegExp(pattern, 'i');
        const button = [...document.querySelectorAll('button')].find((b) =>
          re.test(b.textContent?.trim() ?? ''),
        );
        button?.click();
      }, CONSENT_BUTTON.source);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await page.screenshot({ path: file as `${string}.webp`, type: 'webp', quality: 82 });
      console.log(`✓ ${project.slug} ← ${target}`);
    } catch (error) {
      failures++;
      console.error(`✗ ${project.slug} ← ${target}: ${(error as Error).message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  if (failures > 0) process.exitCode = 1;
}

main();
