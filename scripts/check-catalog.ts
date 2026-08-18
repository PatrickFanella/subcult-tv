import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import projectCatalog from '../content/projects.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'public', 'screenshots');

const PROJECT_TYPES = ['software', 'media', 'tools', 'social'];
const PROJECT_STATUSES = ['active', 'incubating', 'archived'];
const COVER_PATTERNS = ['circuit', 'grid', 'waves', 'dots', 'sigil'];
const ALLOWED_REPO_HOSTS = ['git.subcult.tv', 'github.com'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

interface CatalogEntry {
  slug: string;
  name: string;
  description: string;
  status: string;
  type: string[];
  stack: string[];
  topics: string[];
  url?: string;
  repoUrl?: string;
  lastUpdated: string;
  screenshot?: string;
  featured: boolean;
  order: number;
  coverColor: string;
  coverPattern: string;
}

const entries = Object.values(projectCatalog) as CatalogEntry[];
const errors: string[] = [];
const warnings: string[] = [];

function check(cond: boolean, msg: string) {
  if (!cond) errors.push(msg);
}

const seen = new Set<string>();
const seenOrders = new Set<number>();

for (const p of entries) {
  const tag = `[${p.slug}]`;

  check(p.name.length > 0, `${tag} name is empty`);
  check(p.description.length > 0, `${tag} description is empty`);
  check(p.type.length > 0, `${tag} type is empty`);
  for (const t of p.type) check(PROJECT_TYPES.includes(t), `${tag} type "${t}" not in ${PROJECT_TYPES.join('/')}`);
  check(PROJECT_STATUSES.includes(p.status), `${tag} status "${p.status}" not in ${PROJECT_STATUSES.join('/')}`);
  check(p.stack.length > 0, `${tag} stack is empty`);
  check(p.topics.length > 0, `${tag} topics is empty`);
  check(COVER_PATTERNS.includes(p.coverPattern), `${tag} coverPattern "${p.coverPattern}" not valid`);
  check(/^#[0-9a-f]{6}$/i.test(p.coverColor), `${tag} coverColor "${p.coverColor}" is not #rrggbb`);
  check(typeof p.featured === 'boolean', `${tag} featured is not boolean`);
  check(typeof p.order === 'number', `${tag} order is not a number`);
  check(!seen.has(p.slug), `${tag} duplicate slug`);
  seen.add(p.slug);
  check(!seenOrders.has(p.order), `${tag} duplicate order ${p.order}`);
  seenOrders.add(p.order);
  check(ISO_DATE.test(p.lastUpdated), `${tag} lastUpdated "${p.lastUpdated}" not ISO (use 2026-08-18T00:00:00Z)`);

  if (p.url) {
    check(/^https:\/\//.test(p.url), `${tag} url "${p.url}" must be https`);
  } else {
    warnings.push(`${tag} has no url`);
  }

  check(Boolean(p.repoUrl), `${tag} missing repoUrl`);
  if (p.repoUrl) {
    const host = new URL(p.repoUrl).host;
    check(ALLOWED_REPO_HOSTS.includes(host), `${tag} repoUrl host "${host}" not allowed (${ALLOWED_REPO_HOSTS.join('|')})`);
  }

  if (p.screenshot) {
    check(p.screenshot.startsWith('/screenshots/'), `${tag} screenshot must start with /screenshots/`);
    const safe = path.basename(p.screenshot);
    // Referenced file must exist in public/screenshots
    check(
      readdirSync(SCREENSHOT_DIR).includes(safe),
      `${tag} screenshot file public/screenshots/${safe} does not exist`,
    );
  }
}

// Orders must be a full sequential run 0..n-1
entries.sort((a, b) => a.order - b.order);
const expected = Array.from({ length: entries.length }, (_, i) => i);
expected.forEach((o, i) => {
  if (entries[i].order !== o) {
    errors.push(`order not sequential: expected ${o} at position ${i}, got ${entries[i].order} (${entries[i].slug})`);
  }
});

const counts = Object.values(projectCatalog).length;
const featured = entries.filter((p) => p.featured).length;
const withUrl = entries.filter((p) => p.url).length;
const withScreenshot = entries.filter((p) => p.screenshot).length;

console.log(`> catalog: ${counts} entries, ${featured} featured, ${withUrl} with url, ${withScreenshot} with screenshot`);

if (warnings.length) {
  console.log(`> ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}

if (errors.length) {
  console.error(`> ${errors.length} error(s):`);
  for (const e of errors) console.error(`  × ${e}`);
  process.exit(1);
}

console.log('> catalog check: PASS');