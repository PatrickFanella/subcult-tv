import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider } from '@/context/AuthContext';
import { EffectsProvider } from '@/context/EffectsContext';
import NewsletterSignup from '@/components/NewsletterSignup';
import App from '@/App';
import { getShowcaseProducts, PRODUCT_GROUPS } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';
import { getPublicProjectSource } from '@/lib/project-utils';

// Deterministic localStorage for EffectsContext/AuthContext.
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('smoke: app shell', () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    });
  });

  it('renders the home hero', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { name: /Tools for the culture/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' }).textContent).toContain(
      'SUBCULT',
    );
  });

  it('showcases exactly the four leads, lists the selected projects, and connects HasanAra to Rekolekt', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const showcase = await screen.findByRole('region', { name: 'The products' });
    const products = within(showcase);
    expect(
      products.getAllByRole('article').map((article) => article.getAttribute('aria-labelledby')),
    ).toEqual(['undertow-heading', 'kork-heading', 'clpr-heading', 'hasanara-heading']);
    for (const name of ['Undertow', 'Kork', 'clpr', 'HasanAra']) {
      expect(products.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(products.queryByRole('heading', { name: 'Rekolekt' })).not.toBeInTheDocument();
    const index = within(screen.getByRole('region', { name: 'Everything we make' }));
    expect(index.getAllByRole('listitem')).toHaveLength(getShowcaseProducts().length);
    expect(index.queryByRole('link', { name: /Spool/ })).not.toBeInTheDocument();
    expect(index.getByRole('link', { name: /^Rekolekt/ })).toHaveAttribute(
      'href',
      '/products/rekolekt',
    );
    expect(products.getByRole('link', { name: 'Explore clpr ↗' })).toHaveAttribute(
      'href',
      'https://clpr.tv',
    );
    const hasanara = products.getByRole('article', { name: 'HasanAra' });
    const core = within(hasanara).getByRole('link', { name: 'Rekolekt →' });
    await user.click(core);
    expect(await screen.findByRole('heading', { name: 'Rekolekt', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View repository/ })).toHaveAttribute(
      'href',
      'https://git.subcult.tv/subculture-collective/rekolekt',
    );
  });

  it('opens Undertow from its showcase with the supplied repository destination', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(await screen.findByRole('link', { name: 'About Undertow' }));
    expect(await screen.findByRole('heading', { name: 'Undertow', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View repository/ })).toHaveAttribute(
      'href',
      'https://git.subcult.tv/subculture-collective/undertow',
    );
  });

  it('opens Prichal as a closed preview without a private repository link', async () => {
    const user = userEvent.setup();
    renderApp('/products');
    await user.click(await screen.findByRole('link', { name: /^Prichal/ }));
    expect(await screen.findByRole('heading', { name: 'Prichal', level: 1 })).toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: /See the preview/i })) {
      expect(link).toHaveAttribute('href', 'https://prichal.subcult.tv');
    }
    expect(screen.queryByRole('link', { name: /View repository/ })).not.toBeInTheDocument();
  });

  it('opens Kork from its showcase with its public service and no private repository link', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const showcase = within(await screen.findByRole('region', { name: 'The products' }));
    expect(showcase.getByRole('link', { name: 'Explore Kork ↗' })).toHaveAttribute(
      'href',
      'https://kork.subcult.tv',
    );
    await user.click(showcase.getByRole('link', { name: 'About Kork' }));
    expect(await screen.findByRole('heading', { name: 'Kork', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Kork ↗' })).toHaveAttribute(
      'href',
      'https://kork.subcult.tv',
    );
    expect(screen.queryByRole('link', { name: /View repository/ })).not.toBeInTheDocument();
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://subcult.tv/og/kork.jpg',
    );
  });

  it('redirects the old catalogue to every selected project in five groups', async () => {
    renderApp('/projects');
    await screen.findByRole('heading', { name: 'Products', level: 1 });
    const main = within(screen.getByRole('main'));
    for (const label of Object.values(PRODUCT_GROUPS)) {
      expect(main.getByRole('region', { name: label })).toBeInTheDocument();
    }
    for (const { project } of getShowcaseProducts()) {
      expect(main.getByText(project.name, { selector: 'strong' }).closest('a')).toHaveAttribute(
        'href',
        getProductPath(project.slug),
      );
    }
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://subcult.tv/products',
    );
  });

  it('opens a new product page with its brand mark, repository and metadata', async () => {
    renderApp('/products/metronome-tuner');
    expect(
      await screen.findByRole('heading', { name: 'Metronome + Tuner', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View repository/ })).toHaveAttribute(
      'href',
      'https://git.subcult.tv/PatrickFanella/obsidian-plugin-metronome-tuner',
    );
    expect(screen.getByRole('link', { name: 'Read the source ↗' })).toBeInTheDocument();
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://subcult.tv/og/obsidian-plugin-metronome-tuner.jpg',
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://subcult.tv/products/metronome-tuner',
    );
  });

  it('shows the brand hero for a product without a screenshot', async () => {
    renderApp('/products/overlaid');
    await screen.findByRole('heading', { name: 'Overlaid', level: 1 });
    expect(screen.getByRole('img', { name: /Overlaid brand mark/ })).toHaveAttribute(
      'src',
      '/brand/overlaid/hero.svg',
    );
  });

  it('renders a project detail page from the catalog', async () => {
    renderApp('/projects/clpr');
    expect(await screen.findByRole('heading', { name: 'clpr', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All products' })).toHaveAttribute('href', '/products');

    const visitProject = screen.getByRole('link', { name: /Visit the site/i });
    const viewRepository = screen.getByRole('link', { name: /View repository/ });
    expect(visitProject).toHaveAttribute('href', 'https://clpr.tv');
    expect(viewRepository).toHaveAttribute(
      'href',
      'https://git.subcult.tv/subculture-collective/clpr',
    );
    expect(
      Boolean(
        visitProject.compareDocumentPosition(viewRepository) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
  });

  it('renders 404 for unknown projects', async () => {
    renderApp('/projects/definitely-not-a-project');
    expect(await screen.findByRole('heading', { name: 'SIGNAL LOST' })).toBeInTheDocument();
  });

  it('offers the newsletter sign-up on its own page', async () => {
    renderApp('/newsletter');
    expect(await screen.findByRole('heading', { name: 'The newsletter' })).toBeInTheDocument();
    expect(screen.getAllByLabelText('Email address').length).toBeGreaterThan(0);
    expect(document.title).toBe('Newsletter | SUBCULT');
  });

  it('links contact data handling to a working privacy page', async () => {
    const user = userEvent.setup();
    renderApp('/contact');
    const notice = await screen.findByRole('link', { name: 'How we handle your message' });
    expect(notice).toHaveAttribute('href', '/privacy');
    await user.click(notice);
    expect(await screen.findByRole('heading', { name: 'Privacy', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact messages' })).toBeInTheDocument();
    expect(document.title).toBe('Privacy | SUBCULT');
  });

  it('keeps 404 pages out of search', async () => {
    renderApp('/projects/definitely-not-a-project');
    await screen.findByRole('heading', { name: 'SIGNAL LOST' });
    expect(document.title).toBe('Page not found | SUBCULT');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('sets product metadata and structured data on a landing page', async () => {
    renderApp('/products/hasanara');
    await screen.findByRole('heading', { name: 'HasanAra', level: 1 });
    expect(document.title).toBe('HasanAra: Search HasanAbi broadcast transcripts | SUBCULT');
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://subcult.tv/og/hasanara.jpg',
    );
    const ld = JSON.parse(document.querySelector('script#ld-json')!.textContent!);
    expect(ld['@graph'][0]).toMatchObject({ '@type': 'SoftwareApplication', name: 'HasanAra' });
  });

  it('sets the canonical link and title for the Tadooer landing page', async () => {
    renderApp('/products/tadooer');
    await screen.findByRole('heading', { name: 'Tadooer', level: 1 });
    expect(document.title).toBe('Tadooer: A private planner for one owner | SUBCULT');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://subcult.tv/products/tadooer',
    );
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://subcult.tv/og/tadooer.jpg',
    );
    const ld = JSON.parse(document.querySelector('script#ld-json')!.textContent!);
    expect(ld['@graph'][0]).toMatchObject({
      '@type': 'SoftwareApplication',
      name: 'Tadooer',
      url: 'https://subcult.tv/products/tadooer',
    });
  });

  it.each([
    ['clpr', 'clpr'],
    ['patchwork', 'Patchwork'],
    ['hasanara', 'HasanAra'],
    ['rekolekt', 'Rekolekt'],
    ['subcult-os', 'Subcult OS'],
    ['undertow', 'Undertow'],
    ['prichal', 'Prichal'],
    ['kork', 'Kork'],
    ['left-field', 'Left Field'],
    ['subsets', 'Subsets'],
    ['tadooer', 'Tadooer'],
    ['headcount', 'Headcount'],
  ])('renders the %s landing page with product details and working FAQs', async (slug, name) => {
    const user = userEvent.setup();
    renderApp(`/products/${slug}`);
    expect(await screen.findByRole('heading', { name, level: 1 })).toBeInTheDocument();
    expect(document.querySelector('#workflow-title')).toHaveTextContent(/\w/);
    expect(document.querySelectorAll('.landing-workflow li').length).toBeGreaterThanOrEqual(2);
    const product = getShowcaseProducts().find(
      (p) => getProductPath(p.project.slug) === `/products/${slug}`,
    )!;
    const source = getPublicProjectSource(product.project);
    if (source)
      expect(screen.getByRole('link', { name: /View repository/ })).toHaveAttribute('href', source);
    else expect(screen.queryByRole('link', { name: /View repository/ })).not.toBeInTheDocument();
    const question = document.querySelector('details summary')!;
    const details = question.closest('details')!;
    expect(details.open).toBe(false);
    await user.click(question);
    expect(details.open).toBe(true);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://subcult.tv/products/${slug}`,
    );
  });

  it('presents Left Field with a current research capture, public links, and research limits', async () => {
    renderApp('/products/left-field');
    await screen.findByRole('heading', { name: 'Left Field', level: 1 });
    expect(screen.getByRole('link', { name: 'Open Left Field ↗' })).toHaveAttribute(
      'href',
      'https://left-field.subcult.tv',
    );
    expect(screen.getByRole('link', { name: 'Talk to SUBCULT →' })).toHaveAttribute(
      'href',
      '/contact?product=left-field',
    );
    expect(screen.getByRole('img', { name: /Priority index with its model date/ })).toHaveAttribute(
      'src',
      '/screenshots/left-field-2026-11-05.webp',
    );
    // The tagline under the h1 is a paragraph, not a second heading level.
    expect(
      screen.getByText('A score here is a research note, not a forecast.'),
    ).not.toHaveAttribute('role');
    expect(screen.getByText('A score here is a research note, not a forecast.').tagName).toBe('P');
    expect(screen.getByRole('heading', { name: 'Where the field bends' })).toBeInTheDocument();
    expect(screen.getByText(/Every score is provisional and versioned/)).toBeInTheDocument();
    expect(document.querySelector('.product-landing')).toHaveAttribute(
      'data-product',
      'left-field',
    );
  });

  it('rejects unknown product pages', async () => {
    renderApp('/products/clustr');
    expect(await screen.findByRole('heading', { name: 'SIGNAL LOST' })).toBeInTheDocument();
  });

  it.each([
    '/projects/clustr',
    '/invest',
    '/metrics',
    '/deck',
    '/onepager',
    '/press',
    '/memo',
    '/links',
    '/zine',
    '/zine/boot-sequence',
  ])('removes the unrelated public route %s', async (route) => {
    renderApp(route);
    expect(await screen.findByRole('heading', { name: 'SIGNAL LOST' })).toBeInTheDocument();
  });

  it('keeps navigation concise and links each catalogue group in the footer', async () => {
    renderApp('/about');
    await screen.findByRole('heading', { name: 'Software for independent culture.' });
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    const footer = within(screen.getByRole('contentinfo'));
    expect(nav.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    for (const [group, name] of Object.entries(PRODUCT_GROUPS)) {
      expect(footer.getByRole('link', { name })).toHaveAttribute(
        'href',
        `/products#group-${group}`,
      );
    }
  });

  it('shows unnamed in-development teasers without links', async () => {
    renderApp('/');
    const teasers = within(await screen.findByRole('region', { name: 'In development' }));
    expect(teasers.queryByRole('heading', { name: 'Untitled game' })).not.toBeInTheDocument();
    expect(teasers.getByRole('heading', { name: 'Untitled audio show' })).toBeInTheDocument();
    expect(teasers.queryAllByRole('link')).toHaveLength(0);
  });

  it('starts with VHS effects off and toggles them from the navigation', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const nav = within(await screen.findByRole('navigation', { name: 'Main navigation' }));
    const toggle = nav.getByRole('button', { name: 'VHS effects' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(document.querySelector('.scanlines')).toBeNull();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveAttribute('data-effects', 'full');
    expect(document.querySelector('.scanlines.noise-overlay.vhs-tracking')).not.toBeNull();
    expect(store.get('subcult-effects')).toBe('full');
  });
});

describe('smoke: contact', () => {
  it('carries a product question into the contact form', async () => {
    renderApp('/contact?product=transcript-create');
    expect(await screen.findByLabelText('Subject')).toHaveValue('Rekolekt question');
  });

  it('submits the form via the API', async () => {
    const api = await import('@/lib/api');
    const submit = vi.fn().mockResolvedValue({ message: 'Message received.' });
    vi.spyOn(api, 'submitContact').mockImplementation(submit);

    const user = userEvent.setup();
    renderApp('/contact');

    await user.type(await screen.findByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Message'), 'A test transmission.');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText(/Message received/i)).toBeInTheDocument();
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ada Lovelace', email: 'ada@example.com' }),
    );
  });

  it('preserves the form and offers an email draft when the API fails', async () => {
    const api = await import('@/lib/api');
    vi.spyOn(api, 'submitContact').mockRejectedValue(new Error('Contact API unavailable'));

    const user = userEvent.setup();
    renderApp('/contact');

    const name = await screen.findByLabelText('Name');
    const email = screen.getByLabelText('Email');
    const subject = screen.getByLabelText('Subject');
    const message = screen.getByLabelText('Message');
    await user.type(name, 'Ada Lovelace');
    await user.type(email, 'ada@example.com');
    await user.type(subject, 'Project question');
    await user.type(message, 'Can we discuss clpr?');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not send your message/i);
    expect(name).toHaveValue('Ada Lovelace');
    expect(email).toHaveValue('ada@example.com');
    expect(subject).toHaveValue('Project question');
    expect(message).toHaveValue('Can we discuss clpr?');
    expect(screen.queryByText(/Message received/i)).not.toBeInTheDocument();

    const emailDraft = screen.getByRole('link', {
      name: 'Open your message as an email draft',
    });
    expect(emailDraft).toHaveAttribute(
      'href',
      `mailto:info@subcult.tv?subject=${encodeURIComponent(
        'Project question',
      )}&body=${encodeURIComponent(
        'From: Ada Lovelace (ada@example.com)\n\nCan we discuss clpr?',
      )}`,
    );
  });
});

describe('NewsletterSignup', () => {
  it('uses a distinct email input ID for each instance', () => {
    render(
      <div>
        <NewsletterSignup />
        <NewsletterSignup />
      </div>,
    );

    const emailInputs = screen.getAllByLabelText<HTMLInputElement>('Email address');
    expect(emailInputs).toHaveLength(2);
    expect(emailInputs[0].id).not.toBe('');
    expect(emailInputs[1].id).not.toBe('');
    expect(emailInputs[0].id).not.toBe(emailInputs[1].id);
    expect(emailInputs[0].labels).toHaveLength(1);
    expect(emailInputs[1].labels).toHaveLength(1);
    expect(emailInputs[0].labels?.[0].htmlFor).toBe(emailInputs[0].id);
    expect(emailInputs[1].labels?.[0].htmlFor).toBe(emailInputs[1].id);
    expect(emailInputs[0].labels?.[0]).not.toBe(emailInputs[1].labels?.[0]);
  });
});
