import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EffectsProvider } from '@/context/EffectsContext';
import Patreon from '@/pages/Patreon';
import { getPatreonCampaign } from '@/lib/api';

vi.mock('@/lib/api', () => ({ getPatreonCampaign: vi.fn() }));
beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
function renderPage() {
  render(
    <MemoryRouter>
      <EffectsProvider>
        <Patreon />
      </EffectsProvider>
    </MemoryRouter>,
  );
}
describe('Patreon membership source', () => {
  it('renders published provider names/prices and safe descriptions', async () => {
    vi.mocked(getPatreonCampaign).mockResolvedValue({
      campaign: { patron_count: 0, creation_name: 'Workshop', url: 'https://support.subcult.tv' },
      cached_at: null,
      tiers: [
        {
          title: 'Current membership',
          amount_cents: 1250,
          patron_count: 0,
          published: true,
          description:
            '<p>Notes &amp; previews</p><script>attack()</script><img src=x onerror=attack()>',
        },
        {
          title: 'Unpublished tier',
          amount_cents: 900,
          published: false,
          description: 'hidden',
          patron_count: 0,
        },
      ],
    });
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Current membership' })).toBeInTheDocument();
    expect(screen.getByText('$12.50 / month')).toBeInTheDocument();
    expect(screen.getByText('Notes & previews')).toBeInTheDocument();
    expect(screen.queryByText('Unpublished tier')).not.toBeInTheDocument();
    expect(screen.queryByText('attack()')).not.toBeInTheDocument();
    expect(document.querySelector('script, img[onerror]')).toBeNull();
    expect(screen.queryByText(/Reference tiers shown below/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Supporter' })).not.toBeInTheDocument();
  });
  it('lists large live tiers apart, at the live price', async () => {
    vi.mocked(getPatreonCampaign).mockResolvedValue({
      campaign: { patron_count: 0, creation_name: 'Workshop', url: 'https://support.subcult.tv' },
      cached_at: null,
      tiers: [
        { title: 'Backer', amount_cents: 1000, patron_count: 0, published: true, description: '' },
        { title: 'Rent', amount_cents: 142500, patron_count: 0, published: true, description: '' },
      ],
    });
    renderPage();
    const generous = (await screen.findByRole('heading', { name: 'Feeling unusually generous?' }))
      .parentElement!;
    expect(within(generous).getByRole('heading', { name: 'Rent' })).toBeInTheDocument();
    expect(within(generous).getByText('$1,425 / month')).toBeInTheDocument();
    expect(within(generous).queryByRole('heading', { name: 'Backer' })).not.toBeInTheDocument();
    expect(screen.queryByText('$1,500 / month')).not.toBeInTheDocument();
  });
  it('shows the reference tiers when the API is unavailable', async () => {
    vi.mocked(getPatreonCampaign).mockRejectedValue(new Error('offline'));
    renderPage();
    await waitFor(() => expect(getPatreonCampaign).toHaveBeenCalled());
    const reference = [
      ['Follow free', '$0'],
      ['Supporter', '$5 / month'],
      ['Backer', '$10 / month'],
      ['Patron', '$25 / month'],
      ['Groceries', '$400 / month'],
      ['Rent', '$1,500 / month'],
    ];
    for (const [name, price] of reference) {
      const tier = screen.getByRole('heading', { name }).closest('article')!;
      expect(within(tier).getByText(price)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('article').filter((el) => el.matches('.support-tier'))).toHaveLength(
      reference.length,
    );
    expect(screen.getByText('Feed the person making the things.')).toBeInTheDocument();
    expect(screen.getByText('Pay my rent. Literally.')).toBeInTheDocument();
    expect(screen.getByText(/Reference tiers shown below, not live data/)).toBeInTheDocument();
  });
  it('makes no schedule promise and names no price outside the tier list', async () => {
    vi.mocked(getPatreonCampaign).mockRejectedValue(new Error('offline'));
    renderPage();
    await waitFor(() => expect(getPatreonCampaign).toHaveBeenCalled());
    const page = document.querySelector('.support-page')!;
    expect(page.textContent).not.toMatch(/field note|a week|weekly|monthly ledger|early preview/i);
    const outsideTiers = page.cloneNode(true) as Element;
    outsideTiers.querySelectorAll('.support-tier').forEach((node) => node.remove());
    expect(outsideTiers.textContent).not.toMatch(/\$\d/);
    expect(page.textContent).toContain('Paying doesn’t unlock the software.');
  });
});
