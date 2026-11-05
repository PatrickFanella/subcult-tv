import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { getFeaturedProducts, getProductAction, getShowcaseProducts } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';
import { getPublicProjectSource } from '@/lib/project-utils';
import ProductLanding from '@/pages/ProductLanding';
import { render as prerender } from '@/entry-prerender';
import { CURRENT_PRODUCT_VISUALS } from '@/lib/current-visuals';

afterEach(cleanup);

const selected = [
  'undertow',
  'kork',
  'clpr',
  'hasanara',
  'chatty-cat',
  'commons',
  'headcount',
  'left-field',
  'arkhiv',
  'dedhed',
  'lineage',
  'arkhiv-riot-grrrl',
  'bill-nye-tv',
  'democracy-now-tv',
  'transcript-create',
  'tadooer',
  'subsets',
  'patstack',
  'obsidian-plugin-metronome-tuner',
  'super-productivity-mcp',
  'ytclip',
  'twitchdl',
  'tmux-popups',
  'patchwork',
  'clustr-galaxy',
  'the-common-house',
  'backline',
  'prichal',
  'pirs',
  'subcult-os',
];

it('lists the owner selection and only the four agreed homepage leads', () => {
  expect(getShowcaseProducts().map(({ project }) => project.slug)).toEqual(selected);
  expect(getFeaturedProducts().map(({ project }) => project.slug)).toEqual([
    'undertow',
    'kork',
    'clpr',
    'hasanara',
  ]);
});

it('never turns an internal repository into a visitor source or primary action', () => {
  for (const product of getShowcaseProducts()) {
    if (product.project.sourceUrl !== null) continue;
    expect(getPublicProjectSource(product.project), product.project.slug).toBeNull();
    expect(getProductAction(product).href, product.project.slug).not.toBe(product.project.repoUrl);
    const html = prerender(getProductPath(product.project.slug));
    expect(html, product.project.slug).not.toContain(`href="${product.project.repoUrl}"`);
  }
});

it('renders the selected current visuals and their evidence-specific captions', () => {
  for (const [slug, visual] of Object.entries(CURRENT_PRODUCT_VISUALS)) {
    const page = new DOMParser().parseFromString(prerender(getProductPath(slug)), 'text/html');
    const image = page.querySelector(`img[src="${visual.src}"]`);
    expect(image?.getAttribute('alt'), slug).toBe(visual.alt);
    expect(page.querySelector('figure')?.textContent, slug).toContain(visual.caption);
    expect(page.querySelector('figcaption a')?.getAttribute('href'), slug).toBe(visual.src);
  }
});

it.each([
  ['hasanara', 'transcript-create', 'Rekolekt'],
  ['transcript-create', 'hasanara', 'HasanAra'],
  ['subsets', 'patstack', 'patstack'],
  ['patstack', 'subsets', 'Subsets'],
])('connects %s to its related %s page', async (from, to, name) => {
  render(
    <MemoryRouter initialEntries={[getProductPath(from)]}>
      <Routes>
        <Route path="/products/:slug" element={<ProductLanding />} />
      </Routes>
    </MemoryRouter>,
  );
  const link = screen.getByRole('link', { name: `${name} →` });
  expect(link).toHaveAttribute('href', getProductPath(to));
  await userEvent.click(link);
  expect(screen.getByRole('heading', { name, level: 1 })).toBeInTheDocument();
});

it.each(selected)('prerenders the selected %s introduction and access information', (slug) => {
  const product = getShowcaseProducts().find(({ project }) => project.slug === slug)!;
  const html = prerender(getProductPath(slug));
  const page = new DOMParser().parseFromString(html, 'text/html');
  expect(page.querySelector('h1')?.textContent).toBe(product.project.name);
  expect(page.body.textContent).toContain(product.availability);
});

it.each([
  'overlaid',
  'omarchy-monitor-bar',
  'omarchy-superproductivity',
  'omarchy-plugin-spool',
  'omarchy-plugin-shelfish',
])('retains the previously published %s page outside the selected listing', (slug) => {
  const html = prerender(getProductPath(slug));
  expect(html).toContain('<h1');
  expect(html).not.toContain('SIGNAL LOST');
  expect(getShowcaseProducts().some(({ project }) => project.slug === slug)).toBe(false);
});
