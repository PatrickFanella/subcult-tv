import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { waitFor } from '@testing-library/dom';
import { render as prerender } from '@/entry-prerender';
import AppRoot from '@/components/AppRoot';

// The browser must adopt the prerendered markup from scripts/prerender-meta.ts
// instead of replacing it, so the server tree (src/entry-prerender.tsx) and the
// client tree (src/components/AppRoot.tsx) have to render identical HTML,
// including the ids useId assigns.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  const pending = () => new Promise<never>(() => {});
  return {
    ...actual,
    getPublishedProjects: pending,
    listPosts: pending,
    getPost: pending,
    getPatreonCampaign: pending,
  };
});

const store = new Map<string, string>();
let root: Root | undefined;
let container: HTMLDivElement;
let errors: string[];

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  });
  errors = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
  });
  vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
  });
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  root = undefined;
  container.remove();
  vi.restoreAllMocks();
});

async function hydrate(path: string) {
  window.history.replaceState({}, '', path);
  // nginx serves the prerendered file for the slash-less path; a browser may
  // still arrive with a trailing slash, and the tree must hydrate either way.
  const html = prerender(path.length > 1 ? path.replace(/\/+$/, '') : path);
  container.innerHTML = html;
  await act(async () => {
    root = hydrateRoot(container, <AppRoot />, {
      onRecoverableError: (error) => errors.push(`hydration: ${String(error)}`),
    });
  });
  // Route chunks are lazy; wait until the page itself has hydrated.
  await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  return html;
}

describe('hydration of prerendered pages', () => {
  it.each([
    '/',
    '/products',
    '/products/clpr',
    '/products/prichal',
    '/about',
    '/contact',
    '/support',
    '/development',
    '/development/',
    '/products/clpr/',
    '/newsletter',
    '/404',
  ])('hydrates %s without a mismatch', async (path) => {
    const html = await hydrate(path);
    const mismatches = errors.filter((e) => /hydrat|did not match|server/i.test(e));
    expect(mismatches).toEqual([]);
    expect(html).toContain('<h1');
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('keeps the footer year and the 404 address off the static markup path', async () => {
    await hydrate('/404');
    expect(container.textContent).toContain('attempted route: /404');
    expect(errors.filter((e) => /hydrat|did not match/i.test(e))).toEqual([]);
  });

  it('applies a saved VHS setting only after hydration', async () => {
    store.set('subcult-effects', 'full');
    const html = await hydrate('/about');
    expect(html).not.toContain('scanlines');
    expect(container.querySelector('.scanlines')).not.toBeNull();
    expect(errors.filter((e) => /hydrat|did not match/i.test(e))).toEqual([]);
  });
});
