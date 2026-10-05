import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPosts from '@/pages/admin/AdminPosts';
import AdminStudio from '@/pages/admin/AdminStudio';
import {
  getPostingDashboard,
  getStudioCatalog,
  getStudioAsset,
  getSocialDelivery,
  getReviewDrafts,
  getReviewDraftMedia,
  approveReviewDraft,
} from '@/lib/api';
vi.mock('@/lib/api', () => ({
  getPostingDashboard: vi.fn(),
  getReviewDrafts: vi.fn(),
  getReviewDraftMedia: vi.fn(),
  approveReviewDraft: vi.fn(),
  getSocialDelivery: vi.fn().mockRejectedValue(new Error('PostyBirb delivery is not configured')),
  approveSocialSchedule: vi.fn(),
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
      mode: 'changemaker',
      week: '2026-W40',
      account: 'patrick',
      text: 'Patrick draft copy',
      due_at: new Date(Date.now() + 72 * 3600000).toISOString(),
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
  vi.mocked(getReviewDrafts).mockResolvedValue([]);
  vi.mocked(getSocialDelivery).mockRejectedValue(new Error('PostyBirb delivery is not configured'));
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
    expect(
      screen
        .getAllByRole('button', { name: /^Approve & queue/ })
        .every((b) => b.hasAttribute('disabled')),
    ).toBe(true);
    fireEvent.change(screen.getByLabelText('Account'), { target: { value: 'patrick' } });
    expect(screen.getByText('Capture the UI')).toBeInTheDocument();
    expect(screen.queryByLabelText('Caption')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /X \(post via Buffer\)/ }));
    expect(screen.queryByText('Patrick draft copy')).not.toBeInTheDocument();
    expect(screen.queryByText('Expired timely draft')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Include expired drafts'));
    expect(screen.getByText('Expired timely draft')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
  it('shows X drafts, including CLPR, read-only with a 280 meter and copy button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.mocked(getPostingDashboard).mockResolvedValue({
      ...data,
      drafts: [
        ...data.drafts,
        {
          ...data.drafts[1],
          id: 'clpr',
          mode: 'plan',
          account: 'clpr',
          text: 'Clip the moment. https://clpr.tv/a-very-long-link-that-counts-as-twenty-three',
          due_at: new Date(Date.now() + 72 * 3600000).toISOString(),
          expires_at: '',
        },
      ],
    });
    render(
      <MemoryRouter initialEntries={['/admin/posts?tab=x']}>
        <AdminPosts />
      </MemoryRouter>,
    );
    await screen.findByText(/Clip the moment/);
    expect(screen.queryByText('Patrick draft copy')).not.toBeInTheDocument();
    expect(screen.getByText('40 / 280')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Approve/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Copy X text for clpr/ }));
    await screen.findByText('Copied. Paste it into Buffer.');
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Clip the moment.'));
  });
  it('keeps Changemaker Instagram drafts in their own filter with private evidence', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue({
      ...data,
      drafts: [
        ...data.drafts,
        {
          ...data.drafts[0],
          id: 'changemaker',
          mode: 'changemaker',
          text: 'A product update for Instagram',
          account: 'subcult',
          evidence: 'Verified Changemaker source digest',
        },
      ],
    });
    render(
      <MemoryRouter>
        <AdminPosts />
      </MemoryRouter>,
    );
    await screen.findByText('A product update for Instagram');
    expect(screen.getByText('subcult / Changemaker · Instagram')).toBeInTheDocument();
    expect(screen.getByText('Verified Changemaker source digest')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Edit' })[1]).toHaveAttribute(
      'href',
      '/admin/posts/edit?draft=changemaker',
    );
  });
  it('approves the saved version only after the private image preview loads', async () => {
    const saved = {
      draft_id: 'one',
      version: 3,
      account_id: 'patrick',
      caption: 'Saved caption',
      due_at: new Date(Date.now() + 48 * 3600000).toISOString(),
      has_media: true,
      status: 'draft' as const,
      post_id: '',
      updated_at: '',
    };
    vi.mocked(getReviewDrafts).mockResolvedValue([saved]);
    vi.mocked(getReviewDraftMedia).mockResolvedValue(new Blob());
    vi.mocked(getSocialDelivery).mockResolvedValue({
      accounts: [
        {
          id: 'patrick',
          name: 'Patrick',
          profile: 'patrick',
          identifier: 'instagram-standalone',
          disabled: false,
        },
      ],
      posts: [],
      checked_at: '',
      approval_mode: 'manual',
      minimum_lead_hours: 24,
    });
    vi.mocked(approveReviewDraft).mockResolvedValue({ status: 'scheduled', post_id: 'post-one' });
    render(
      <MemoryRouter>
        <AdminPosts />
      </MemoryRouter>,
    );
    await screen.findByText('Saved caption');
    const button = screen.getByRole('button', { name: /^Approve & queue/ });
    expect(button).toBeDisabled();
    fireEvent.load(await screen.findByRole('img', { name: 'Selected image for this post' }));
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await screen.findByText(/Scheduled in PostyBirb/);
    expect(approveReviewDraft).toHaveBeenCalledWith('one', 3);
    expect(screen.queryByLabelText('Caption')).not.toBeInTheDocument();
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
            {
              id: 'logo',
              name: 'logos/mark.svg',
              category: 'logos',
              title: 'Brand mark',
              tags: ['SVG', 'Brand mark'],
            },
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
    expect(screen.getByText('Brand mark', { selector: 'strong' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }));
    expect(screen.getByText('1 asset')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search assets'), { target: { value: 'brand mark' } });
    expect(screen.getByText('logos/mark.svg')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search assets'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Asset category'), { target: { value: 'fonts' } });
    expect(screen.getByText('fonts/Oswald.ttf')).toBeInTheDocument();
    expect(screen.queryByText('logos/mark.svg')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download fonts/Oswald.ttf' })).toBeInTheDocument();
  });
});
