import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminNotFound from '@/pages/admin/AdminNotFound';
import AdminPosts from '@/pages/admin/AdminPosts';
import AdminContacts from '@/pages/admin/AdminContacts';
import AdminBlogPosts from '@/pages/admin/AdminBlogPosts';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import PostingAutomation from '@/pages/admin/PostingAutomation';
import PostingDelivery from '@/pages/admin/PostingDelivery';
import { isEditableTarget } from '@/pages/admin/reviewListKeys';
import {
  approveReviewDraft,
  deleteContact,
  getBufferDelivery,
  getBufferHistory,
  getBlueskyDelivery,
  getDashboardStats,
  getDraftDecisions,
  getPostingDashboard,
  getPreparedMedia,
  getPublications,
  getRerolls,
  getReviewDraftMedia,
  getReviewDrafts,
  getSocialDelivery,
  getTweetRequests,
  listContacts,
  listPosts,
  recordDraftDecision,
  saveReviewDraft,
  toggleContactRead,
  type APIContact,
  type APIPost,
  type PostingDraft,
  type PostingJobStatus,
} from '@/lib/api';
import { jobStatusSummary, latestJobStatus, managedSlugs } from '@/lib/review-queue';

vi.mock('@/lib/api', () => ({
  getPostingDashboard: vi.fn(),
  getReviewDrafts: vi.fn(),
  getReviewDraftMedia: vi.fn(),
  approveReviewDraft: vi.fn(),
  saveReviewDraft: vi.fn(),
  getPreparedMedia: vi.fn(),
  getDraftDecisions: vi.fn(),
  recordDraftDecision: vi.fn(),
  getBlueskyDelivery: vi.fn(),
  approveBlueskyDraft: vi.fn(),
  getSocialDelivery: vi.fn(),
  getBufferDelivery: vi.fn(),
  getBufferHistory: vi.fn(),
  getRerolls: vi.fn(),
  getTweetRequests: vi.fn(),
  requestTweet: vi.fn(),
  requestReroll: vi.fn(),
  editScheduledDraft: vi.fn(),
  getPublications: vi.fn(),
  getDashboardStats: vi.fn(),
  listContacts: vi.fn(),
  toggleContactRead: vi.fn(),
  deleteContact: vi.fn(),
  listPosts: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

const HOUR = 3600000;
const sha = 'a'.repeat(64);
const future = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();
const draft = (over: Partial<PostingDraft> = {}): PostingDraft => ({
  id: 'cm:0',
  run_id: 'cm',
  mode: 'changemaker',
  platform: 'instagram',
  week: '',
  account: 'patrick',
  text: 'First draft about clip stacks.',
  due_at: future(48),
  expires_at: future(24 * 6),
  evidence: 'Changemaker run',
  next_check: 'Check the public site.',
  approval: 'unapproved',
  media: {
    mode: 'capture',
    asset_ids: [],
    alt_text: 'Alt',
    brief: 'Mark',
    image: { sha256: sha, width: 1080, height: 1350, bytes: 1000 },
  },
  ...over,
});
const second = draft({ id: 'cm:1', text: 'Second draft about Undertow.', due_at: future(72) });
const third = draft({ id: 'cm:2', text: 'Third draft about Kork.', due_at: future(96) });
const jobs: PostingJobStatus[] = [
  {
    job: 'changemaker-instagram',
    status: 'success',
    run_id: 'r1',
    started: new Date(Date.now() - 2 * HOUR - 300000).toISOString(),
    finished: new Date(Date.now() - 2 * HOUR).toISOString(),
    reason: '2 draft(s)',
  },
  {
    job: 'changemaker-publications',
    status: 'failed',
    run_id: '',
    started: new Date(Date.now() - 20 * HOUR).toISOString(),
    finished: new Date(Date.now() - 20 * HOUR).toISOString(),
    reason: 'ConnectionError',
  },
];
const snapshot = (drafts: PostingDraft[], job_status?: PostingJobStatus[]) => ({
  connected: true,
  generated_at: new Date().toISOString(),
  stale: false,
  publishing_enabled: false as const,
  timezone: 'America/Chicago',
  first_week: '',
  schedules: [],
  accounts: [{ account: 'patrick', times: ['09:11', '16:41'], weekly_cap: 14 }],
  runs: [],
  checks: [],
  drafts,
  ...(job_status ? { job_status } : {}),
});
const delivery = {
  accounts: [
    {
      id: 'pb-patrick',
      name: 'Patrick',
      profile: 'patrick__eff',
      identifier: 'instagram',
      disabled: false,
    },
  ],
  posts: [],
  checked_at: '',
  approval_mode: 'manual' as const,
  minimum_lead_hours: 0,
};
const stats = {
  total_projects: 0,
  total_posts: 0,
  total_contacts: 7,
  unread_contacts: 3,
  total_subscribers: 0,
};
const publications = { drafts: [], patreon_connected: false, minimum_lead_hours: 24 };
const contact = (id: string, read = false): APIContact => ({
  id,
  name: `Person ${id}`,
  email: `${id}@example.com`,
  message: 'Hello',
  read,
  created_at: '2026-10-01T12:00:00Z',
});
const post = (id: string, slug = `post-${id}`): APIPost => ({
  id,
  slug,
  title: `Article ${id}`,
  excerpt: '',
  content: '',
  tags: [],
  published: false,
  date: '2026-10-01',
  created_at: '',
  updated_at: '',
});
const page = <T,>(data: T[], current = 1, total_pages = 1) => ({
  data,
  total: data.length,
  page: current,
  per_page: 20,
  total_pages,
});

function renderQueue() {
  return render(
    <MemoryRouter>
      <AdminPosts />
    </MemoryRouter>,
  );
}
/** The row header button whose summary text matches, ignoring buttons inside the sheet. */
const header = (text: RegExp) => {
  const found = [...document.querySelectorAll<HTMLButtonElement>('.review-row-summary')].find((b) =>
    text.test(b.textContent ?? ''),
  );
  if (!found) throw new Error(`No row header matching ${text}`);
  return found;
};

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true),
  );
  URL.createObjectURL = vi.fn(() => 'blob:prepared');
  URL.revokeObjectURL = vi.fn();
  vi.mocked(getBlueskyDelivery).mockResolvedValue({
    configured: false,
    accounts: [],
    receipts: [],
    posts: [],
    checked_at: '',
  });
  vi.mocked(getBufferDelivery).mockResolvedValue({ configured: false, channels: [], receipts: [] });
  vi.mocked(getBufferHistory).mockResolvedValue({ configured: false, posts: [] });
  vi.mocked(getReviewDraftMedia).mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }));
  vi.mocked(getPreparedMedia).mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }));
  vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([draft(), second, third]));
  vi.mocked(getReviewDrafts).mockResolvedValue([]);
  vi.mocked(getDraftDecisions).mockResolvedValue([]);
  vi.mocked(getRerolls).mockResolvedValue([]);
  vi.mocked(getTweetRequests).mockResolvedValue([]);
  vi.mocked(getSocialDelivery).mockResolvedValue(delivery);
  vi.mocked(saveReviewDraft).mockResolvedValue({ version: 1 });
  vi.mocked(approveReviewDraft).mockResolvedValue({ status: 'scheduled', post_id: 'pb-post' });
  vi.mocked(getDashboardStats).mockResolvedValue(stats);
  vi.mocked(getPublications).mockResolvedValue(publications);
});

describe('admin 404', () => {
  it('renders inside the admin shell with a way back to the dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/posts/edit?draft=x']}>
        <Routes>
          <Route path="/admin">
            <Route index element={<p>dashboard</p>} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(document.title).toBe('Page not found · SUBCULT admin');
    expect(screen.getByText('/admin/posts/edit')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Back to the dashboard' })).toHaveAttribute(
      'href',
      '/admin',
    );
  });
});

describe('job health', () => {
  it('summarises the latest job and lists other failures', () => {
    const now = Date.now();
    expect(latestJobStatus(jobs)?.job).toBe('changemaker-instagram');
    const summary = jobStatusSummary(jobs, now);
    expect(summary).toMatch(/^Last daily Instagram draft run: succeeded 2 hours ago\./);
    expect(summary).toContain('Also failed: Website/Patreon preparation (ConnectionError).');
    expect(jobStatusSummary([], now)).toBe('');
    expect(jobStatusSummary(undefined, now)).toBe('');
  });

  it('lists each job with its Chicago finish time on the Automation page', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(
      snapshot([], [{ ...jobs[1], finished: '2026-11-02T09:25:30+00:00' }]),
    );
    render(
      <MemoryRouter>
        <PostingAutomation />
      </MemoryRouter>,
    );
    const table = await screen.findByRole('table', {
      name: 'Last outcome of each preparation job',
    });
    const row = within(table).getAllByRole('row')[1];
    expect(row).toHaveTextContent('Website/Patreon preparation');
    expect(row).toHaveTextContent('failed');
    expect(row).toHaveTextContent('Nov 2, 3:25 AM CST');
    expect(row).toHaveTextContent('ConnectionError');
  });

  it('keeps the old wording when the snapshot has no job health', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([]));
    render(
      <MemoryRouter>
        <PostingAutomation />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/This snapshot has no job health yet/)).toBeInTheDocument();
  });

  it('replaces the receipts line on the dashboard when job health is present', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([], jobs));
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );
    expect(
      await screen.findByText(/Last daily Instagram draft run: succeeded 2 hours ago/),
    ).toBeInTheDocument();
    expect(screen.queryByText('Preparation receipts are connected.')).not.toBeInTheDocument();
  });

  it('keeps the receipts wording on the dashboard without job health', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([]));
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Preparation receipts are connected.')).toBeInTheDocument();
  });
});

describe('review queue flow', () => {
  it('opens and focuses the next draft after a rejection', async () => {
    vi.mocked(recordDraftDecision).mockResolvedValue({ draft_id: 'cm:0', decision: 'rejected' });
    renderQueue();
    fireEvent.click(await screen.findByRole('button', { name: /First draft/, expanded: false }));
    fireEvent.click(screen.getByRole('button', { name: /^Reject patrick__eff post: First/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Boring' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm rejection' }));
    await screen.findByText(/Rejected\. The reason is saved/);
    expect(header(/First draft/)).toHaveAttribute('aria-expanded', 'false');
    const next = header(/Second draft/);
    expect(next).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(next).toHaveFocus());
    expect(approveReviewDraft).not.toHaveBeenCalled();
  });

  it('opens the next draft after a successful approval', async () => {
    renderQueue();
    fireEvent.click(await screen.findByRole('button', { name: /First draft/, expanded: false }));
    const list = screen.getByRole('group', { name: 'Before you approve' });
    for (const box of within(list).getAllByRole('checkbox')) fireEvent.click(box);
    const approve = screen.getByRole('button', {
      name: /^Approve & queue patrick__eff post: First/,
    });
    await waitFor(() => expect(approve).toBeEnabled());
    fireEvent.click(approve);
    await screen.findByText(/Scheduled in PostyBirb · pb-post/);
    expect(header(/Second draft/)).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(header(/Second draft/)).toHaveFocus());
  });

  it('collapses the last row without opening anything when nothing follows', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([draft()]));
    vi.mocked(recordDraftDecision).mockResolvedValue({ draft_id: 'cm:0', decision: 'snoozed' });
    renderQueue();
    fireEvent.click(await screen.findByRole('button', { name: /First draft/, expanded: false }));
    fireEvent.click(screen.getByRole('button', { name: /^Snooze patrick__eff/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Snooze' }));
    await screen.findByText('Snoozed for a day.');
    expect(screen.queryByRole('button', { expanded: true })).not.toBeInTheDocument();
  });

  it('moves between rows with j/k and the arrow keys, toggling with the header', async () => {
    renderQueue();
    const first = await screen.findByRole('button', { name: /First draft/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'j' });
    expect(header(/Second draft/)).toHaveFocus();
    fireEvent.keyDown(header(/Second draft/), { key: 'ArrowDown' });
    expect(header(/Third draft/)).toHaveFocus();
    fireEvent.keyDown(header(/Third draft/), { key: 'j' });
    expect(header(/Third draft/)).toHaveFocus();
    fireEvent.keyDown(header(/Third draft/), { key: 'k' });
    fireEvent.keyDown(header(/Second draft/), { key: 'ArrowUp' });
    expect(first).toHaveFocus();
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    // A ctrl-modified key is left to the browser.
    fireEvent.keyDown(first, { key: 'j', ctrlKey: true });
    expect(first).toHaveFocus();
  });

  it('ignores navigation keys typed into a field inside an open row', async () => {
    renderQueue();
    fireEvent.click(await screen.findByRole('button', { name: /First draft/, expanded: false }));
    const caption = screen.getByLabelText('Caption');
    caption.focus();
    fireEvent.keyDown(caption, { key: 'j' });
    expect(caption).toHaveFocus();
    expect(isEditableTarget(caption)).toBe(true);
    expect(isEditableTarget(header(/Second draft/))).toBe(false);
  });
});

describe('contact bulk actions', () => {
  it('selects the page, deletes in sequence after naming the count and reports the API totals', async () => {
    vi.mocked(listContacts).mockResolvedValue(page([contact('a', true), contact('b')]));
    vi.mocked(deleteContact).mockResolvedValue(undefined);
    render(<AdminContacts />);
    await screen.findByText('Person b');
    expect(screen.getByText(/^3 unread of 7 total/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark selected read' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Select all on this page'));
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));
    expect(confirm).toHaveBeenCalledWith('Delete 2 messages?');
    await screen.findByText('Deleted 2 messages.');
    expect(vi.mocked(deleteContact).mock.calls.map((c) => c[0])).toEqual(['a', 'b']);
    expect(listContacts).toHaveBeenCalledTimes(2);
  });

  it('marks only unread selections read and keeps failures selected', async () => {
    vi.mocked(listContacts).mockResolvedValue(
      page([contact('a', true), contact('b'), contact('c')]),
    );
    vi.mocked(toggleContactRead)
      .mockResolvedValueOnce(contact('b', true))
      .mockRejectedValueOnce(new Error('offline'));
    render(<AdminContacts />);
    await screen.findByText('Person c');
    fireEvent.click(screen.getByLabelText('Select all on this page'));
    fireEvent.click(screen.getByRole('button', { name: 'Mark selected read' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Marked read 1 of 2; 1 message could not be changed.',
    );
    expect(vi.mocked(toggleContactRead).mock.calls.map((c) => c[0])).toEqual(['b', 'c']);
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByLabelText('Select message from Person c')).toBeChecked();
  });

  it('does not delete when the confirmation is declined', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    );
    vi.mocked(listContacts).mockResolvedValue(page([contact('a')]));
    render(<AdminContacts />);
    fireEvent.click(await screen.findByLabelText('Select message from Person a'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));
    expect(deleteContact).not.toHaveBeenCalled();
  });
});

describe('publication-managed articles', () => {
  it('derives managed slugs from website editions only', () => {
    const slugs = managedSlugs([
      { id: 'daily-2026-10-05-website', platform: 'website' },
      { id: 'daily-2026-10-05-patreon', platform: 'patreon' },
    ]);
    expect([...slugs]).toEqual(['daily-2026-10-05']);
  });

  it('badges managed articles, disables their actions and links to the review page', async () => {
    vi.mocked(listPosts).mockResolvedValue(page([post('1', 'daily-2026-10-05'), post('2')]));
    vi.mocked(getPublications).mockResolvedValue({
      ...publications,
      drafts: [
        {
          id: 'daily-2026-10-05-website',
          platform: 'website',
          title: 'Daily log',
          body: '',
          excerpt: '',
          due_at: future(48),
          audience: '',
          version: 1,
          status: 'draft',
          provider_url: '',
          source: {},
        },
      ],
    });
    render(
      <MemoryRouter>
        <AdminBlogPosts />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Managed by the Development log review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Article 1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Article 1' })).toBeDisabled();
    expect(
      screen.getByRole('link', { name: 'Review Article 1 in the Development log' }),
    ).toHaveAttribute('href', '/admin/posts/articles');
    expect(screen.getByRole('button', { name: 'Edit Article 2' })).toBeEnabled();
  });
});

describe('delivery refresh', () => {
  it('forces a Buffer history read once per Refresh, not on later reloads', async () => {
    vi.mocked(getReviewDrafts).mockResolvedValue([
      {
        draft_id: 'cm:0',
        version: 2,
        account_id: 'pb-patrick',
        caption: 'Queued caption',
        due_at: future(72),
        has_media: true,
        status: 'scheduled',
        post_id: 'pb-post',
        updated_at: '',
      },
    ]);
    vi.mocked(recordDraftDecision).mockResolvedValue({ draft_id: 'cm:0', decision: 'favorited' });
    render(
      <MemoryRouter initialEntries={['/admin/posts/delivery']}>
        <PostingDelivery />
      </MemoryRouter>,
    );
    const row = await screen.findByRole('button', { name: /Queued caption/, expanded: false });
    expect(vi.mocked(getBufferHistory).mock.calls).toEqual([[false]]);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(getBufferHistory).toHaveBeenCalledTimes(2));
    expect(vi.mocked(getBufferHistory).mock.calls[1]).toEqual([true]);
    // A reload caused by an action in the page reads the cached history again.
    fireEvent.click(row);
    fireEvent.click(screen.getByRole('button', { name: /as good$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save as a good example' }));
    await waitFor(() => expect(getBufferHistory).toHaveBeenCalledTimes(3));
    expect(vi.mocked(getBufferHistory).mock.calls[2]).toEqual([false]);
  });
});
