import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EffectsProvider } from '@/context/EffectsContext';
import Nav from '@/components/Nav';
import NewsletterSignup from '@/components/NewsletterSignup';
import ProductIndex from '@/components/ProductIndex';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import DevelopmentLog from '@/pages/DevelopmentLog';
import ProductLanding from '@/pages/ProductLanding';
import { getShowcaseProducts } from '@/lib/showcase';
import type { APIPost } from '@/lib/api';

const api = vi.hoisted(() => ({
  listPosts: vi.fn(),
  getPost: vi.fn(),
  subscribe: vi.fn(),
  getPatreonCampaign: vi.fn(),
}));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, ...api };
});

const post = (n: number): APIPost => ({
  id: `p${n}`,
  slug: `update-${n}`,
  title: `Update ${n}`,
  excerpt: `What changed in update ${n}.`,
  content: '# Update',
  tags: ['development-log'],
  published: true,
  date: '2026-10-30T00:00:00Z',
  created_at: '2026-10-30T00:00:00Z',
  updated_at: '2026-10-30T00:00:00Z',
});

const products = getShowcaseProducts();
const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  });
  api.listPosts.mockReset();
  api.getPost.mockReset();
  api.subscribe.mockReset();
  api.getPatreonCampaign.mockReset();
  api.getPatreonCampaign.mockReturnValue(new Promise(() => {}));
});
afterEach(cleanup);

describe('navigation clarity', () => {
  it('keeps the main destinations without a second product shortcut row', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <EffectsProvider>
          <Nav />
        </EffectsProvider>
      </MemoryRouter>,
    );
    const main = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(main).getAllByRole('link', { name: 'About' })[0]).toHaveAttribute(
      'href',
      '/about',
    );
    expect(within(main).queryByRole('link', { name: 'Studio' })).not.toBeInTheDocument();
    expect(within(main).getByRole('link', { name: 'Products' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(main.querySelector('.product-shortcuts')).toBeNull();
  });
});

describe('home hero', () => {
  it('leads with the four selected projects before the complete catalogue', () => {
    render(
      <MemoryRouter>
        <EffectsProvider>
          <Home />
        </EffectsProvider>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Explore the projects ↓' });
    expect(link).toHaveAttribute('href', '#products');
    expect(link.className).toContain('support-primary');
    const catalog = screen.getByRole('region', { name: 'Everything we make' });
    const showcase = screen.getByRole('region', { name: 'The products' });
    expect(within(catalog).getAllByRole('listitem')).toHaveLength(products.length);
    expect(
      showcase.compareDocumentPosition(catalog) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe('directory access labels', () => {
  it('distinguishes public apps, self-hosted software and private previews', () => {
    render(
      <MemoryRouter>
        <ProductIndex products={products} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Public web app')).toBeInTheDocument();
    expect(screen.getByText('Self-hosted / single owner')).toBeInTheDocument();
    expect(screen.getByText('Private preview / no sign-up')).toBeInTheDocument();
    expect(screen.getByText('Unity prototype / no public build')).toBeInTheDocument();
  });
});

describe('product landing navigation', () => {
  it('offers the directory and identifies the current product without an overflowing list', () => {
    render(
      <MemoryRouter initialEntries={['/products/clpr']}>
        <EffectsProvider>
          <Routes>
            <Route path="/products/:slug" element={<ProductLanding />} />
          </Routes>
        </EffectsProvider>
      </MemoryRouter>,
    );
    const nav = screen.getByRole('navigation', { name: 'Product navigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(within(nav).getByRole('link', { name: 'All products' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('clpr');
  });
});

describe('development log pager', () => {
  it('pages through updates with the previous and next controls', async () => {
    api.listPosts.mockImplementation(({ page }: { page: number }) =>
      Promise.resolve({
        data: page === 1 ? [post(1), post(2)] : [post(3)],
        total: 3,
        page,
        per_page: 20,
        total_pages: 2,
      }),
    );
    render(
      <MemoryRouter initialEntries={['/development']}>
        <Routes>
          <Route path="/development" element={<DevelopmentLog />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Update 1' })).toBeInTheDocument();
    const pager = screen.getByRole('navigation', { name: 'Development log pages' });
    expect(pager).toHaveTextContent('Page 1 of 2');
    const previous = within(pager).getByRole('button', { name: '← Previous' });
    const next = within(pager).getByRole('button', { name: 'Next →' });
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    await userEvent.click(next);
    expect(await screen.findByRole('heading', { name: 'Update 3' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Update 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Development log pages' })).toHaveTextContent(
      'Page 2 of 2',
    );
    expect(screen.getByRole('button', { name: 'Next →' })).toBeDisabled();
    expect(api.listPosts).toHaveBeenLastCalledWith({
      page: 2,
      perPage: 20,
      tag: 'development-log',
    });
  });

  it('shows no pager for a single page', async () => {
    api.listPosts.mockResolvedValue({
      data: [post(1)],
      total: 1,
      page: 1,
      per_page: 20,
      total_pages: 1,
    });
    render(
      <MemoryRouter initialEntries={['/development']}>
        <Routes>
          <Route path="/development" element={<DevelopmentLog />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Update 1' })).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Development log pages' }),
    ).not.toBeInTheDocument();
  });
});

describe('404 page', () => {
  it('links to the home, products, development and contact pages', () => {
    render(
      <MemoryRouter initialEntries={['/nowhere']}>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: '← Back to the homepage' })).toHaveAttribute(
      'href',
      '/',
    );
    const useful = screen.getByRole('navigation', { name: 'Useful pages' });
    expect(within(useful).getByRole('link', { name: 'All products →' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(within(useful).getByRole('link', { name: 'Development log →' })).toHaveAttribute(
      'href',
      '/development',
    );
    expect(within(useful).getByRole('link', { name: 'Contact →' })).toHaveAttribute(
      'href',
      '/contact',
    );
  });
});

describe('newsletter form feedback', () => {
  it('disables the field while submitting, ignores a repeat submit and announces success', async () => {
    let resolve!: (value: { message: string }) => void;
    api.subscribe.mockReturnValue(
      new Promise<{ message: string }>((r) => {
        resolve = r;
      }),
    );
    render(<NewsletterSignup />);
    const input = screen.getByLabelText('Email address');
    await userEvent.type(input, 'reader@example.com');
    const form = input.closest('form')!;
    await userEvent.click(screen.getByRole('button', { name: 'SUBSCRIBE' }));
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: '...' })).toBeDisabled();
    form.requestSubmit();
    expect(api.subscribe).toHaveBeenCalledTimes(1);

    resolve({ message: 'Check your inbox.' });
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('REQUEST RECEIVED');
    expect(status).toHaveTextContent('Check your inbox.');
  });

  it('announces a failed sign-up as an alert and re-enables the field', async () => {
    api.subscribe.mockRejectedValue(new Error('Address rejected.'));
    render(<NewsletterSignup />);
    const input = screen.getByLabelText('Email address');
    await userEvent.type(input, 'reader@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'SUBSCRIBE' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Not subscribed. Address rejected.');
    expect(input).toBeEnabled();
    expect(input).toHaveValue('reader@example.com');
  });
});
