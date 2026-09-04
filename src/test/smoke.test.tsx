import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider } from '@/context/AuthContext';
import { EffectsProvider } from '@/context/EffectsContext';
import NewsletterSignup from '@/components/NewsletterSignup';
import App from '@/App';
import type { APIPatreonData, PublicStats } from '@/lib/api';

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
    expect(await screen.findByRole('heading', { name: 'SUBCULT' })).toBeInTheDocument();
    expect(screen.getByRole('navigation').textContent).toContain('SUBCULT');
  });

  it('renders the projects grid and filters it', async () => {
    const user = userEvent.setup();
    renderApp('/projects');

    const heading = await screen.findByRole('heading', { name: 'Projects' });
    expect(heading).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Current Focus/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /More projects/i })).toBeInTheDocument();
    const ungroupedProject = screen.getByRole('heading', { name: 'clustr' });
    expect(ungroupedProject.closest('a')).toHaveAttribute('href', '/projects/clustr');

    const allTypes = screen.getByRole('button', { name: 'All project types' });
    const allStatuses = screen.getByRole('button', { name: 'All project statuses' });
    expect(allTypes).toHaveAttribute('aria-pressed', 'true');
    expect(allStatuses).toHaveAttribute('aria-pressed', 'true');

    // Apply TYPE: software + STATUS: active filters.
    const software = screen.getByRole('button', { name: 'Project type: software' });
    const active = screen.getByRole('button', { name: 'Project status: active' });
    await user.click(software);
    await user.click(active);

    expect(software).toHaveAttribute('aria-pressed', 'true');
    expect(active).toHaveAttribute('aria-pressed', 'true');
    expect(allTypes).toHaveAttribute('aria-pressed', 'false');
    expect(allStatuses).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'clpr' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'blacktower' })).not.toBeInTheDocument();

    const count = await screen.findByText(/(\d+) projects? found/);
    expect(count).toBeInTheDocument();
  });

  it('renders a project detail page from the catalog', async () => {
    renderApp('/projects/clpr');
    expect(await screen.findByRole('heading', { name: 'clpr', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'projects' })).toHaveAttribute('href', '/projects');

    const visitProject = screen.getByRole('link', { name: /Visit Project/i });
    const viewRepository = screen.getByRole('link', { name: /View Repository/i });
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
    expect(await screen.findByText(/ERROR 404: project not found/i)).toBeInTheDocument();
  });

  it('presents the conference demo and verified Bluesky profile on the links page', async () => {
    renderApp('/links');

    const main = within(screen.getByRole('main'));

    expect(await main.findByRole('link', { name: /Try Patchwork/i })).toHaveAttribute(
      'href',
      'https://patchwork.subcult.tv',
    );
    expect(main.getByRole('link', { name: 'Bluesky ↗' })).toHaveAttribute(
      'href',
      'https://bsky.app/profile/subcult.tv',
    );
  });
});

describe('smoke: contact', () => {
  it('submits the form via the API', async () => {
    const api = await import('@/lib/api');
    const submit = vi.fn().mockResolvedValue({ message: 'signal received' });
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

    expect(await screen.findByText(/could not send your message/i)).toBeInTheDocument();
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

describe('smoke: zine post', () => {
  it('navigates to and replaces the post with the next article', async () => {
    const user = userEvent.setup();
    renderApp('/zine/boot-sequence');
    const oldHeading = await screen.findByRole('heading', {
      name: "Boot sequence: why we're building Subculture Collective",
    });
    const nextPost = screen.getByRole('link', { name: 'Read next post: Against metrics' });
    expect(nextPost).toHaveAttribute('href', '/zine/against-metrics');

    await user.click(nextPost);

    expect(await screen.findByRole('heading', { name: 'Against metrics' })).toBeInTheDocument();
    expect(await screen.findByText('The metric becomes the narrative.')).toBeInTheDocument();
    expect(oldHeading).not.toBeInTheDocument();
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

describe('smoke: metrics', () => {
  function getMetricCard(label: string) {
    const card = screen.getByText(label).parentElement;
    if (!card) throw new Error(`Missing metric card for ${label}`);
    return card;
  }

  it('shows unavailable rather than zero when metric APIs fail', async () => {
    const api = await import('@/lib/api');
    vi.spyOn(api, 'getPatreonCampaign').mockRejectedValue(new Error('Patreon unavailable'));
    vi.spyOn(api, 'getPublicStats').mockRejectedValue(new Error('Public stats unavailable'));

    renderApp('/metrics');
    await screen.findByRole('heading', { name: 'Metrics Dashboard' });

    const newsletterCard = getMetricCard('Newsletter Subscribers');
    const patreonCard = getMetricCard('Patreon Supporters');
    expect(await within(newsletterCard).findByText('Unavailable')).toBeInTheDocument();
    expect(await within(patreonCard).findByText('Unavailable')).toBeInTheDocument();
    expect(within(newsletterCard).queryByText('0')).not.toBeInTheDocument();
    expect(within(patreonCard).queryByText('0')).not.toBeInTheDocument();
  });

  it('shows legitimate zero values returned by metric APIs', async () => {
    const api = await import('@/lib/api');
    const patreonResponse: APIPatreonData = {
      campaign: {
        patron_count: 0,
        creation_name: 'SUBCULT',
        url: 'https://www.patreon.com/subcult',
      },
      tiers: [],
      cached_at: '2026-08-28T00:00:00.000Z',
    };
    const publicStatsResponse: PublicStats = {
      projects: 0,
      posts: 0,
      subscribers: 0,
      last_updated: '2026-08-28T00:00:00.000Z',
    };
    vi.spyOn(api, 'getPatreonCampaign').mockResolvedValue(patreonResponse);
    vi.spyOn(api, 'getPublicStats').mockResolvedValue(publicStatsResponse);

    renderApp('/metrics');
    await screen.findByRole('heading', { name: 'Metrics Dashboard' });

    expect(
      await within(getMetricCard('Newsletter Subscribers')).findByText('0'),
    ).toBeInTheDocument();
    expect(await within(getMetricCard('Patreon Supporters')).findByText('0')).toBeInTheDocument();
  });
});
