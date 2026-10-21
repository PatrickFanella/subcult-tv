import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PostEditor from '@/pages/admin/PostEditor';
import PublicationReview from '@/pages/admin/PublicationReview';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import {
  getDashboardStats,
  getPostingDashboard,
  getPublications,
  getReviewDrafts,
  getSocialDelivery,
  getBufferDelivery,
  getBufferHistory,
  savePublication,
  type PostingDraft,
  getDraftDecisions,
} from '@/lib/api';
import {
  draftPlatform,
  isExpired,
  stripReviewPrefix,
  xLength,
  publicationPreparationProblem,
} from '@/lib/review-queue';

it('uses actual publication run health rather than the age of its last draft', () => {
  const now = Date.now();
  const run = {
    mode: 'publications',
    status: 'no_user_facing_change',
    checked_at: new Date(now).toISOString(),
    observed_at: '',
    week: '',
    run_id: 'checked',
    draft_count: 0,
  };
  expect(publicationPreparationProblem(run, now)).toBeNull();
  expect(publicationPreparationProblem(undefined, now)).toBeNull();
  expect(publicationPreparationProblem({ ...run, status: 'failed' }, now)).toContain('failed');
  expect(
    publicationPreparationProblem(
      { ...run, checked_at: new Date(now - 48 * 3600000).toISOString() },
      now,
    ),
  ).toContain('No recent');
});

vi.mock('@/lib/api', () => ({
  getPostingDashboard: vi.fn(),
  getReviewDrafts: vi.fn(),
  getSocialDelivery: vi.fn(),
  getBufferDelivery: vi.fn(),
  getBufferHistory: vi.fn(),
  getPublications: vi.fn(),
  getDashboardStats: vi.fn(),
  saveReviewDraft: vi.fn(),
  getReviewDraftMedia: vi.fn(),
  savePublication: vi.fn(),
  approvePublication: vi.fn(),
  getDraftDecisions: vi.fn(),
}));

const future = () => new Date(Date.now() + 72 * 3600000).toISOString();
const draft = (over: Partial<PostingDraft>): PostingDraft => ({
  id: 'd',
  run_id: 'r',
  mode: 'changemaker',
  week: '',
  account: 'subcult',
  text: 'Text',
  due_at: future(),
  expires_at: future(),
  evidence: '',
  next_check: '',
  approval: 'unapproved',
  media: { mode: 'capture', asset_ids: [], alt_text: '', brief: '' },
  ...over,
});
const snapshot = (drafts: PostingDraft[]) => ({
  connected: true,
  generated_at: new Date().toISOString(),
  stale: false,
  publishing_enabled: false as const,
  timezone: 'America/Chicago',
  first_week: '',
  schedules: [],
  accounts: [],
  runs: [],
  checks: [],
  drafts,
});

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getBufferDelivery).mockResolvedValue({ configured: false, channels: [], receipts: [] });
  vi.mocked(getBufferHistory).mockResolvedValue({ configured: false, posts: [] });
  vi.mocked(getDraftDecisions).mockResolvedValue([]);
});

describe('review queue helpers', () => {
  it('derives the platform for older snapshots', () => {
    expect(draftPlatform({ mode: 'changemaker' })).toBe('instagram');
    expect(draftPlatform({ mode: 'plan' })).toBe('x');
    expect(draftPlatform({ mode: 'radar' })).toBe('x');
    expect(draftPlatform({ mode: 'radar', platform: 'bluesky' })).toBe('bluesky');
  });
  it('expires drafts at expires_at, or at the proposed time when absent', () => {
    const now = Date.parse('2026-10-05T12:00:00Z');
    expect(
      isExpired({ expires_at: '2026-10-05T11:00:00Z', due_at: '2026-10-09T00:00:00Z' }, now),
    ).toBe(true);
    expect(isExpired({ expires_at: '', due_at: '2026-10-04T00:00:00Z' }, now)).toBe(true);
    expect(isExpired({ expires_at: '', due_at: '2026-10-06T00:00:00Z' }, now)).toBe(false);
    expect(isExpired({ expires_at: '', due_at: '' }, now)).toBe(false);
  });
  it('strips the leftover reviewer note only at the start', () => {
    expect(stripReviewPrefix('Draft for human review.\n\nToday we shipped')).toBe(
      'Today we shipped',
    );
    expect(stripReviewPrefix('Keep Draft for human review. here')).toBe(
      'Keep Draft for human review. here',
    );
  });
  it('counts X links as 23 characters', () => {
    expect(xLength('hello')).toBe(5);
    expect(xLength('see https://example.com/a/very/long/path/indeed')).toBe(4 + 23);
  });
});

describe('platform boundaries', () => {
  it('refuses to open an X draft in the Instagram editor', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([draft({ id: 'x1', mode: 'plan' })]));
    vi.mocked(getReviewDrafts).mockResolvedValue([]);
    vi.mocked(getSocialDelivery).mockResolvedValue({
      accounts: [],
      posts: [],
      checked_at: '',
      approval_mode: 'manual',
      minimum_lead_hours: 24,
    });
    render(
      <MemoryRouter initialEntries={['/admin/posts/edit?draft=x1']}>
        <PostEditor />
      </MemoryRouter>,
    );
    await screen.findByText(/This draft is for X. Copy it into Buffer/);
    expect(screen.queryByLabelText('Instagram caption')).not.toBeInTheDocument();
  });
  it('never shows the reviewer note in website or Patreon editions', async () => {
    vi.mocked(getPublications).mockResolvedValue({
      drafts: [
        {
          id: 'daily-2026-10-05-website',
          platform: 'website',
          title: 'Daily log',
          body: 'Draft for human review.\n\nWe shipped the clip stack.',
          excerpt: '',
          due_at: future(),
          audience: '',
          version: 1,
          status: 'draft',
          provider_url: '',
          source: {},
        },
      ],
      patreon_connected: false,
      minimum_lead_hours: 24,
    });
    render(<PublicationReview platform="website" />, { wrapper: MemoryRouter });
    await screen.findByText('We shipped the clip stack.');
    expect(screen.queryByText(/Draft for human review/)).not.toBeInTheDocument();
  });
  it('edits a missed edition in place, moves its time forward and keeps edits when saving fails', async () => {
    const missed = new Date(Date.now() - 30 * 3600000).toISOString();
    vi.mocked(getPublications).mockResolvedValue({
      drafts: [
        {
          id: 'daily-2026-10-05-website',
          platform: 'website',
          title: 'Daily log',
          body: 'We shipped the clip stack.',
          excerpt: '',
          due_at: missed,
          audience: '',
          version: 1,
          status: 'draft',
          provider_url: '',
          source: {},
        },
      ],
      patreon_connected: false,
      minimum_lead_hours: 24,
    });
    vi.mocked(savePublication).mockRejectedValue(new Error('Draft changed'));
    render(<PublicationReview platform="website" />, { wrapper: MemoryRouter });
    expect(await screen.findByText('Missed its publish time')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const form = screen.getByRole('form', { name: 'Edit publication draft' });
    expect(form.closest('article')).toHaveClass('posting-review-card-editing');
    expect(screen.getByText(/is past or less than 24 hours away/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Post body'), { target: { value: 'Edited body' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText(/Not saved: Draft changed/)).toBeInTheDocument();
    expect(screen.getByLabelText('Post body')).toHaveValue('Edited body');
    const sent = vi.mocked(savePublication).mock.calls[0][0];
    expect(new Date(sent.due_at).valueOf()).toBeGreaterThan(Date.now() + 24 * 3600000);
  });
  it('counts prepared, unexpired drafts per platform on the dashboard', async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      total_projects: 0,
      total_posts: 0,
      total_contacts: 0,
      unread_contacts: 0,
      total_subscribers: 0,
    });
    vi.mocked(getPublications).mockResolvedValue({
      drafts: [],
      patreon_connected: false,
      minimum_lead_hours: 24,
    });
    vi.mocked(getReviewDrafts).mockResolvedValue([
      {
        draft_id: 'ig-sent',
        version: 2,
        account_id: 'a',
        caption: '',
        due_at: future(),
        has_media: true,
        status: 'scheduled',
        post_id: 'p',
        updated_at: '',
      },
    ]);
    vi.mocked(getPostingDashboard).mockResolvedValue(
      snapshot([
        draft({ id: 'ig1' }),
        draft({ id: 'ig2' }),
        draft({ id: 'ig-sent' }),
        draft({ id: 'ig-old', expires_at: '2020-01-01T00:00:00Z' }),
        draft({ id: 'x1', mode: 'plan', expires_at: '' }),
        draft({ id: 'x-scheduled', mode: 'plan' }),
        draft({ id: 'x-submitting', mode: 'plan' }),
        draft({ id: 'x-uncertain', mode: 'plan' }),
        draft({ id: 'x-old', mode: 'plan', expires_at: '', due_at: '2020-01-01T00:00:00Z' }),
      ]),
    );
    vi.mocked(getBufferDelivery).mockResolvedValue({
      configured: true,
      channels: [],
      receipts: (['scheduled', 'submitting', 'uncertain'] as const).map((status) => ({
        draft_id: `x-${status}`,
        status,
        version: 1,
        channel_id: 'channel',
        caption: 'Approved text',
        due_at: future(),
        post_id: '',
      })),
    });
    render(<AdminDashboard />, { wrapper: MemoryRouter });
    const instagram = await screen.findByText('Instagram drafts to review');
    expect(instagram.previousElementSibling).toHaveTextContent('2');
    expect(screen.getByText('X drafts to review').previousElementSibling).toHaveTextContent('1');
  });
  it('does not claim an X review count when scheduling receipts cannot be read', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([draft({ mode: 'plan' })]));
    vi.mocked(getReviewDrafts).mockResolvedValue([]);
    vi.mocked(getBufferDelivery).mockRejectedValue(new Error('Scheduling receipts unavailable'));
    render(<AdminDashboard />, { wrapper: MemoryRouter });
    expect(await screen.findByRole('alert')).toHaveTextContent('Scheduling receipts unavailable');
    expect(screen.getByText('X drafts to review').previousElementSibling).toHaveTextContent('—');
  });
});
