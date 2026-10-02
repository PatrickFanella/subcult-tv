import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
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
    expect(
      screen.queryByText('Reference benefits shown below. Check Patreon for the current offer.'),
    ).not.toBeInTheDocument();
  });
  it('keeps the reviewed fallback when the API is unavailable', async () => {
    vi.mocked(getPatreonCampaign).mockRejectedValue(new Error('offline'));
    renderPage();
    await waitFor(() => expect(getPatreonCampaign).toHaveBeenCalled());
    expect(screen.getByRole('heading', { name: 'Backer' })).toBeInTheDocument();
    expect(screen.getByText('$10 / month')).toBeInTheDocument();
    expect(screen.getByText(/Reference benefits shown below/)).toBeInTheDocument();
  });
});
