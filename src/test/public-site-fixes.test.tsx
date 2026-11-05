import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/context/AuthContext';
import { EffectsProvider } from '@/context/EffectsContext';
import App from '@/App';
import Layout from '@/components/Layout';
import NewsletterSignup from '@/components/NewsletterSignup';
import { applyApprovedSnapshot } from '@/lib/use-showcase-products';
import { developmentPostMeta, getPageMeta, metaTags } from '@/lib/seo';
import { getShowcaseProducts } from '@/lib/showcase';
import type { APIPost, APIProject } from '@/lib/api';

const api = vi.hoisted(() => ({
  listPosts: vi.fn(),
  getPost: vi.fn(),
}));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, listPosts: api.listPosts, getPost: api.getPost };
});

const store = new Map<string, string>();

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <EffectsProvider>
          <App />
        </EffectsProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const post: APIPost = {
  id: 'p1',
  slug: 'october-notes',
  title: 'October notes',
  excerpt: 'What changed in October.',
  content: '# October\n\nShipped things.',
  tags: ['development-log'],
  published: true,
  date: '2026-10-30T00:00:00Z',
  created_at: '2026-10-30T00:00:00Z',
  updated_at: '2026-10-30T00:00:00Z',
};

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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('/development metadata and states', () => {
  it('has its own static page metadata', () => {
    const meta = getPageMeta('/development')!;
    expect(meta.title).toBe('Development log | SUBCULT');
    expect(meta.noIndex).toBeFalsy();
    const pending = developmentPostMeta('october-notes');
    expect(pending.path).toBe('/development/october-notes');
    expect(metaTags(pending).find((tag) => tag.key === 'robots')?.content).toBe(
      'noindex, nofollow',
    );
    const loaded = developmentPostMeta('october-notes', post);
    expect(loaded.title).toBe('October notes | SUBCULT');
    expect(loaded.noIndex).toBeFalsy();
  });

  it('sets the development log title and shows an empty state', async () => {
    api.listPosts.mockResolvedValue({ data: [], total_pages: 1 });
    renderApp('/development');
    expect(await screen.findByText(/No updates have been published yet/)).toBeInTheDocument();
    expect(document.title).toBe('Development log | SUBCULT');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://subcult.tv/development',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a friendly error with retry instead of the raw message', async () => {
    const user = userEvent.setup();
    api.listPosts.mockRejectedValueOnce(new Error('ECONNREFUSED 10.0.0.50:8080'));
    api.listPosts.mockResolvedValueOnce({ data: [post], total_pages: 1 });
    renderApp('/development');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The updates could not be loaded right now.');
    expect(alert).not.toHaveTextContent('ECONNREFUSED');
    await user.click(within(alert).getByRole('button', { name: /Try again/ }));
    expect(await screen.findByRole('link', { name: 'October notes' })).toBeInTheDocument();
  });

  it('titles an entry from the loaded post and keeps it out of search while loading', async () => {
    let resolve!: (value: APIPost) => void;
    api.getPost.mockReturnValue(new Promise<APIPost>((r) => (resolve = r)));
    renderApp('/development/october-notes');
    await screen.findByRole('status');
    expect(document.title).toBe('Development log | SUBCULT');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    resolve(post);
    expect(
      await screen.findByRole('heading', { name: 'October notes', level: 1 }),
    ).toBeInTheDocument();
    expect(document.title).toBe('October notes | SUBCULT');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow',
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://subcult.tv/development/october-notes',
    );
  });

  it('explains a missing entry without exposing the error text', async () => {
    api.getPost.mockRejectedValue(new Error('Request failed: 404 Not Found'));
    renderApp('/development/gone');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('There is no update at this address.');
    expect(within(alert).getByRole('link', { name: /See all updates/ })).toHaveAttribute(
      'href',
      '/development',
    );
  });
});

describe('navigation', () => {
  it('names the home heading with a space across the line break', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { name: 'Tools for the culture we build together.' }),
    ).toBeInTheDocument();
  });

  it('names the support heading with a space across the line break', async () => {
    renderApp('/support');
    expect(
      await screen.findByRole('heading', { name: 'Support the workshop behind the products.' }),
    ).toBeInTheDocument();
  });

  it('renders the header mark with explicit dimensions', async () => {
    renderApp('/');
    const nav = await screen.findByRole('navigation', { name: 'Main navigation' });
    const mark = nav.querySelector('img.subcult-nav-mark')!;
    expect(mark.getAttribute('src')).toMatch(/^\/brand\/subcult\/fisheye-circle-132\.png/);
    expect(mark).toHaveAttribute('width', '44');
    expect(mark).toHaveAttribute('height', '44');
  });

  it('links the support page to the products page through the router', async () => {
    const user = userEvent.setup();
    renderApp('/support');
    await user.click(await screen.findByRole('link', { name: 'See the work first →' }));
    expect(await screen.findByRole('heading', { name: 'Products', level: 1 })).toBeInTheDocument();
  });

  it('wires the mobile menu toggle, Escape, focus and route change', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const toggle = await screen.findByRole('button', { name: 'Toggle navigation menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const menuId = toggle.getAttribute('aria-controls')!;
    expect(menuId).toBeTruthy();
    expect(document.getElementById(menuId)).toBeNull();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const menu = document.getElementById(menuId)!;
    expect(menu).toBeInTheDocument();
    const first = within(menu).getAllByRole('link')[0];
    expect(first).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(menuId)).toBeNull();
    expect(toggle).toHaveFocus();

    await user.click(toggle);
    await user.click(within(document.getElementById(menuId)!).getByRole('link', { name: 'About' }));
    expect(
      await screen.findByRole('heading', { name: /Software for independent culture/ }),
    ).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(menuId)).toBeNull();
  });
});

describe('scroll and focus on navigation', () => {
  function Page({ name }: { name: string }) {
    const navigate = useNavigate();
    return (
      <div>
        <h1>{name}</h1>
        <button type="button" onClick={() => navigate('/second')}>
          go second
        </button>
        <button type="button" onClick={() => navigate('/second#target')}>
          go target
        </button>
        <button type="button" onClick={() => navigate(-1)}>
          back
        </button>
        <p id="target">target</p>
      </div>
    );
  }

  function renderLayout() {
    return render(
      <MemoryRouter initialEntries={['/first']}>
        <AuthProvider>
          <EffectsProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="first" element={<Page name="First" />} />
                <Route path="second" element={<Page name="Second" />} />
              </Route>
            </Routes>
          </EffectsProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  it('scrolls to the top and focuses main on PUSH, leaves POP alone, honors hashes', async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderLayout();
    await screen.findByRole('heading', { name: 'First' });
    expect(scrollTo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'go second' }));
    await screen.findByRole('heading', { name: 'Second' });
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(screen.getByRole('main')).toHaveFocus();

    scrollTo.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'back' }));
    await screen.findByRole('heading', { name: 'First' });
    expect(scrollTo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'go target' }));
    await screen.findByRole('heading', { name: 'Second' });
    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('newsletter sign-up heading level', () => {
  it('defaults to h3 and accepts h2 for the standalone page', () => {
    const { unmount } = render(<NewsletterSignup />);
    expect(
      screen.getByRole('heading', { name: 'One email a month', level: 3 }),
    ).toBeInTheDocument();
    unmount();
    render(<NewsletterSignup headingLevel="h2" />);
    expect(
      screen.getByRole('heading', { name: 'One email a month', level: 2 }),
    ).toBeInTheDocument();
  });

  it('uses h2 on /newsletter so the outline goes h1 then h2', async () => {
    renderApp('/newsletter');
    await screen.findByRole('heading', { name: 'The newsletter', level: 1 });
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('heading', { name: 'One email a month', level: 2 })).toBeInTheDocument();
    expect(main.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    // The footer copy keeps its h3 under the footer's own h2.
    expect(
      within(screen.getByRole('contentinfo')).getByRole('heading', { level: 3 }),
    ).toHaveTextContent('One email a month');
  });
});

describe('product copy ownership', () => {
  const clpr = getShowcaseProducts().find((p) => p.project.slug === 'clpr')!;
  const snapshot: APIProject = {
    id: 'x',
    slug: 'clpr',
    name: 'Other name',
    description: 'Other summary',
    type: ['software'],
    status: 'archived',
    stack: [],
    topics: [],
    cover_pattern: 'grid',
    featured: false,
    sort_order: 99,
    stars: 0,
    created_at: '',
    updated_at: '',
  };

  it('keeps curated name, summary and featured flag', () => {
    const merged = applyApprovedSnapshot(clpr, snapshot);
    expect(merged.project.name).toBe(clpr.project.name);
    expect(merged.summary).toBe(clpr.summary);
    expect(merged.project.featured).toBe(clpr.project.featured);
    expect(merged.project.status).toBe('archived');
  });

  it('takes status and url only when the snapshot has a value', () => {
    const empty = applyApprovedSnapshot(clpr, { ...snapshot, status: '', homepage: '  ' });
    expect(empty.project.status).toBe(clpr.project.status);
    expect(empty.project.url).toBe(clpr.project.url);
    const withUrl = applyApprovedSnapshot(clpr, { ...snapshot, homepage: 'https://x.example' });
    expect(withUrl.project.url).toBe('https://x.example');
    expect(applyApprovedSnapshot(clpr, undefined)).toBe(clpr);
  });
});

describe('product availability', () => {
  it('distinguishes private previews from public apps in the directory', async () => {
    renderApp('/products');
    await screen.findByRole('heading', { name: 'Products', level: 1 });
    const prichal = screen.getByText('Prichal').closest('a')!;
    expect(within(prichal).getByText('Private preview / no sign-up')).toBeInTheDocument();
    const clpr = screen.getByText('clpr').closest('a')!;
    expect(within(clpr).queryByText(/INCUBATING|ARCHIVED|ACTIVE/)).not.toBeInTheDocument();
  });

  it('states private-preview access in the landing hero', async () => {
    renderApp('/products/prichal');
    await screen.findByRole('heading', { name: 'Prichal', level: 1 });
    const hero = screen.getByRole('region', { name: 'Prichal' });
    expect(within(hero).getByText('Private preview / no sign-up')).toBeInTheDocument();
  });

  it('shows no badge for a live product', async () => {
    renderApp('/products/clpr');
    await screen.findByRole('heading', { name: 'clpr', level: 1 });
    expect(screen.queryByText(/INCUBATING|ARCHIVED|ACTIVE/)).not.toBeInTheDocument();
  });

  it('renders the headline under the product name as a paragraph', async () => {
    renderApp('/products/clpr');
    await screen.findByRole('heading', { name: 'clpr', level: 1 });
    const headline = document.querySelector('.landing-headline')!;
    expect(headline.tagName).toBe('P');
    expect(screen.getAllByRole('heading', { level: 2 })[0]).not.toHaveClass('landing-headline');
  });
});
