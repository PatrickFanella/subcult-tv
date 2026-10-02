import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPosts from '@/pages/admin/AdminPosts';
import AdminStudio from '@/pages/admin/AdminStudio';
import { getPostingDashboard, getStudioCatalog, getStudioAsset } from '@/lib/api';
vi.mock('@/lib/api', () => ({
  getPostingDashboard: vi.fn(),
  getStudioCatalog: vi.fn(),
  getStudioAsset: vi.fn(),
  listPosts: vi.fn().mockResolvedValue({ data: [] }),
}));
const data = {
  connected: true,
  generated_at: '2026-10-02T10:00:00Z',
  stale: false,
  publishing_enabled: false as const,
  timezone: 'America/Chicago',
  first_week: '2026-W41',
  schedules: [{ mode: 'plan', calendar: ['Mon 10:00 America/Chicago'] }],
  accounts: [
    { account: 'patrick', times: ['09:11'], weekly_cap: 14 },
    { account: 'subcult', times: ['11:22'], weekly_cap: 7 },
  ],
  runs: [],
  checks: [],
  drafts: [
    {
      id: 'one',
      run_id: 'run-one',
      mode: 'plan',
      week: '2026-W40',
      account: 'patrick',
      text: 'Patrick draft copy',
      due_at: '2026-10-02T14:00:00Z',
      expires_at: '',
      evidence: 'Source checked',
      next_check: 'Capture the UI',
      approval: 'unapproved' as const,
      media: { mode: 'capture', asset_ids: [], brief: 'Capture UI', alt_text: '' },
    },
    {
      id: 'two',
      run_id: 'run-two',
      mode: 'radar',
      week: '',
      account: 'subcult',
      text: 'Expired timely draft',
      due_at: '2020-01-01T12:00:00Z',
      expires_at: '2020-01-02T12:00:00Z',
      evidence: 'Source',
      next_check: 'Check relevance',
      approval: 'unapproved' as const,
      media: { mode: 'none', asset_ids: [], brief: '', alt_text: '' },
    },
  ],
};
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getPostingDashboard).mockResolvedValue(data);
  URL.createObjectURL = vi.fn(() => 'blob:test');
  URL.revokeObjectURL = vi.fn();
  vi.mocked(getStudioAsset).mockResolvedValue(new Blob());
});
describe('Production admin', () => {
  it('filters draft copy and keeps delivery separate from proposed times', async () => {
    render(
      <MemoryRouter>
        <AdminPosts />
      </MemoryRouter>,
    );
    await screen.findByText('Patrick draft copy');
    expect(screen.queryByText('Expired timely draft')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Include expired timely drafts'));
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Unverified')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Account'), { target: { value: 'patrick' } });
    expect(screen.queryByText('Expired timely draft')).not.toBeInTheDocument();
    expect(screen.getByText('Capture the UI')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /publish now|approve/i })).not.toBeInTheDocument();
  });
  it('shows an unavailable snapshot and recovers with retry', async () => {
    vi.mocked(getPostingDashboard).mockRejectedValueOnce(new Error('Snapshot unavailable'));
    render(
      <MemoryRouter>
        <AdminPosts />
      </MemoryRouter>,
    );
    await screen.findByText('Snapshot unavailable');
    fireEvent.click(screen.getByText('Retry connection'));
    await screen.findByText('Patrick draft copy');
  });
  it('browses brand files by category and offers authenticated downloads', async () => {
    vi.mocked(getStudioCatalog).mockResolvedValue({
      version: 1,
      brands: [
        {
          slug: 'subcult',
          name: 'SUBCULT',
          direction: 'Culture / poster press',
          guide: 'Usage rules',
          preview: 'preview',
          logos: ['logo'],
          tokens: { colors: { base: '#8b5cf6' }, fonts: { display: 'Oswald' } },
          assets: [
            { id: 'logo', name: 'logos/mark.svg', category: 'logos' },
            { id: 'font', name: 'fonts/Oswald.ttf', category: 'fonts' },
          ],
        },
      ],
      media: [],
      files: {
        logo: { name: 'mark.svg', path: 'assets/logo.svg', sha256: 'logo' },
        font: { name: 'Oswald.ttf', path: 'assets/font.ttf', sha256: 'font' },
      },
    });
    render(
      <MemoryRouter>
        <AdminStudio />
      </MemoryRouter>,
    );
    await screen.findByText('logos/mark.svg');
    fireEvent.change(screen.getByLabelText('Asset category'), { target: { value: 'fonts' } });
    expect(screen.getByText('fonts/Oswald.ttf')).toBeInTheDocument();
    expect(screen.queryByText('logos/mark.svg')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download fonts/Oswald.ttf' })).toBeInTheDocument();
  });
});
