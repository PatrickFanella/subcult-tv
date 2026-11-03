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
  it('labels the /about link About and keeps the directory link last in the shortcuts', () => {
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
    const shortcuts = main.querySelector('.product-shortcuts')!;
    const links = within(shortcuts as HTMLElement).getAllByRole('link');
    expect(links.at(-1)).toHaveTextContent(`All ${products.length} →`);
    expect(links.at(-1)).toHaveAttribute('href', '/products');
  });
});

describe('home hero', () => {
  it('offers the full directory as a primary link with the catalog count', () => {
    render(
      <MemoryRouter>
        <EffectsProvider>
          <Home />
        </EffectsProvider>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: `All ${products.length} products →` });
    expect(link).toHaveAttribute('href', '/products');
    expect(link.className).toContain('support-primary');
    expect(screen.getByRole('link', { name: 'See the products ↓' })).toHaveAttribute(
      'href',
      '#products',
    );
  });
});

describe('directory status badges', () => {
  it('marks non-active products and leaves active ones unlabelled', () => {
    render(
      <MemoryRouter>
        <ProductIndex products={products} />
      </MemoryRouter>,
    );
    const incubating = products.filter(({ project }) => project.status === 'incubating');
    const active = products.filter(({ project }) => project.status === 'active');
    expect(incubating.length).toBeGreaterThan(0);
    expect(screen.getAllByText('◐ INCUBATING')).toHaveLength(incubating.length);
    expect(screen.queryByText('● ACTIVE')).not.toBeInTheDocument();
    const activeItem = screen
      .getByText(active[0].project.name)
      .closest('.product-index-item') as HTMLElement;
    expect(within(activeItem).queryByText(/INCUBATING|ARCHIVED/)).not.toBeInTheDocument();
  });
});

describe('product landing product-nav', () => {
  it('marks the current product and scrolls it into view only when it is off screen', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const current = products.find(({ project }) => project.slug === 'clpr')!;
    // jsdom has no layout: fake an overflowing list whose current link sits past the right edge.
    const widths = vi
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.matches('.landing-product-nav > div') ? 2000 : 0;
      });
    const clientWidth = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.matches('.landing-product-nav > div') ? 320 : 0;
      });
    const rects = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      const offScreen = this.getAttribute('aria-current') === 'page';
      const left = offScreen ? 600 : 0;
      return {
        left,
        right: left + 100,
        top: 0,
        bottom: 0,
        width: 100,
        height: 0,
        x: left,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
    try {
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
      const marked = within(nav).getByRole('link', { name: current.project.name });
      expect(marked).toHaveAttribute('aria-current', 'page');
      expect(
        within(nav)
          .getAllByRole('link')
          .filter((a) => a.hasAttribute('aria-current')),
      ).toHaveLength(1);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.instances[0]).toBe(marked);
      expect(scrollIntoView).toHaveBeenCalledWith({ inline: 'nearest', block: 'nearest' });
    } finally {
      widths.mockRestore();
      clientWidth.mockRestore();
      rects.mockRestore();
    }
  });

  it('does not scroll when the list fits', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(
      <MemoryRouter initialEntries={['/products/clpr']}>
        <EffectsProvider>
          <Routes>
            <Route path="/products/:slug" element={<ProductLanding />} />
          </Routes>
        </EffectsProvider>
      </MemoryRouter>,
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
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
