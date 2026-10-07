import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPosts from '@/pages/admin/AdminPosts';
import {
  approveReviewDraft,
  getPostingDashboard,
  getPreparedMedia,
  getReviewDraftMedia,
  getReviewDrafts,
  getSocialDelivery,
  saveReviewDraft,
  recordDraftDecision,
  type DraftDecision,
  type PostingDraft,
  getDraftDecisions,
  getRerolls,
  requestReroll,
  editScheduledDraft,
} from '@/lib/api';
import { cadenceSlots, checklistItems, matchAccount, scoreSummary } from '@/lib/review-queue';

vi.mock('@/lib/api', () => ({
  getPostingDashboard: vi.fn(),
  getReviewDrafts: vi.fn(),
  getReviewDraftMedia: vi.fn(),
  approveReviewDraft: vi.fn(),
  saveReviewDraft: vi.fn(),
  getPreparedMedia: vi.fn(),
  getDraftDecisions: vi.fn(),
  recordDraftDecision: vi.fn(),
  getSocialDelivery: vi.fn(),
  getRerolls: vi.fn(),
  requestReroll: vi.fn(),
  editScheduledDraft: vi.fn(),
}));

const HOUR = 3600000;
const sha = 'a'.repeat(64);
const alt = 'b'.repeat(64);
const future = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();
const draft = (over: Partial<PostingDraft> = {}): PostingDraft => ({
  id: 'cm:0',
  run_id: 'cm',
  mode: 'changemaker',
  platform: 'instagram',
  week: '',
  account: 'patrick',
  text: 'We gave clip stacks a mark you can spot from across the feed.',
  due_at: future(48),
  expires_at: future(24 * 6),
  evidence: 'Changemaker run; PR-1: Add the clip stack',
  next_check: 'Confirm the mark matches the merged design. Check the public site.',
  approval: 'unapproved',
  media: {
    mode: 'capture',
    asset_ids: [],
    alt_text: 'A purple clip-stack mark on black',
    brief: 'Mark on black',
    image: { sha256: sha, width: 1080, height: 1350, bytes: 1000 },
    candidates: [{ sha256: alt, width: 1080, height: 1350, bytes: 900 }],
  },
  craft: {
    angle: 'For streamers who clip their own highlights',
    reader: 'Streamers',
    reason: 'New mark',
    pattern: 'reveal',
    predicted: 'saves',
    scores: { hook: 5, voice: 4, ending: 3 },
    alternatives: ['A shorter caption'],
  },
  sources: ['Add the clip stack'],
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
  accounts: [
    { account: 'patrick', times: ['09:11', '16:41'], weekly_cap: 14 },
    { account: 'subcult', times: ['11:22'], weekly_cap: 7 },
  ],
  runs: [],
  checks: [],
  drafts,
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
    {
      id: 'pb-subcult',
      name: 'subcult.tv',
      profile: 'subcult.tv',
      identifier: 'instagram',
      disabled: false,
    },
  ],
  posts: [],
  checked_at: '',
  approval_mode: 'manual' as const,
  minimum_lead_hours: 24,
};

function renderQueue() {
  return render(
    <MemoryRouter>
      <AdminPosts />
    </MemoryRouter>,
  );
}
async function openFirst(text = /We gave clip stacks/) {
  const row = await screen.findByRole('button', { name: text, expanded: false });
  fireEvent.click(row);
}
function tickChecklist() {
  const list = screen.getByRole('group', { name: 'Before you approve' });
  for (const box of within(list).getAllByRole('checkbox')) fireEvent.click(box);
}

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  URL.createObjectURL = vi.fn(() => 'blob:prepared');
  URL.revokeObjectURL = vi.fn();
  vi.mocked(getPostingDashboard).mockResolvedValue(snapshot([draft()]));
  vi.mocked(getReviewDrafts).mockResolvedValue([]);
  vi.mocked(getDraftDecisions).mockResolvedValue([]);
  vi.mocked(getRerolls).mockResolvedValue([]);
  vi.mocked(getSocialDelivery).mockResolvedValue(delivery);
  vi.mocked(getPreparedMedia).mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }));
  vi.mocked(saveReviewDraft).mockResolvedValue({ version: 1 });
  vi.mocked(approveReviewDraft).mockResolvedValue({ status: 'scheduled', post_id: 'pb-post' });
});

describe('approve from the card', () => {
  it('approves with the prepared image, default account and a cadence slot', async () => {
    renderQueue();
    await openFirst();
    expect(screen.getByText('For streamers who clip their own highlights')).toBeInTheDocument();
    expect(
      screen.getByText(/Average 4\.0\/5 · strongest hook 5 · weakest ending 3/),
    ).toBeInTheDocument();
    expect(screen.getByText(/A purple clip-stack mark on black/)).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram account')).toHaveValue('pb-patrick');
    const time = screen.getByLabelText('Publish time') as HTMLSelectElement;
    expect(time.selectedOptions[0].textContent).toMatch(/(9:11|4:41) (AM|PM), in \d+ (hours|days)/);
    expect(screen.getByText(/Draft expires/)).toBeInTheDocument();
    const approve = screen.getByRole('button', {
      name: /^Approve & queue patrick__eff post: We gave/,
    });
    expect(approve).toBeDisabled();
    expect(await screen.findByText('Tick every check before approving.')).toBeInTheDocument();
    tickChecklist();
    expect(approve).toBeEnabled();
    fireEvent.click(approve);
    await screen.findByText(/Scheduled in PostyBirb · pb-post/);
    expect(getPreparedMedia).toHaveBeenCalledWith(sha);
    const form = vi.mocked(saveReviewDraft).mock.calls[0][1];
    expect(vi.mocked(saveReviewDraft).mock.calls[0][0]).toBe('cm:0');
    expect(form.get('account_id')).toBe('pb-patrick');
    expect(form.get('version')).toBe('0');
    expect(form.get('caption')).toBe(draft().text);
    expect((form.get('media') as File).type).toBe('image/jpeg');
    const due = new Date(String(form.get('due_at'))).valueOf();
    expect(due).toBeGreaterThanOrEqual(Date.now() + 24 * HOUR);
    expect(vi.mocked(approveReviewDraft).mock.calls[0]).toEqual([
      'cm:0',
      1,
      [
        { item: 'Confirm the mark matches the merged design.', checked: true },
        { item: 'Check the public site.', checked: true },
      ],
    ]);
  });

  it('checks the 24-hour rule in the browser and marks the feed fold', async () => {
    renderQueue();
    await openFirst();
    tickChecklist();
    fireEvent.change(screen.getByLabelText('Publish time'), { target: { value: 'custom' } });
    const soon = new Date(Date.now() + 3 * HOUR);
    soon.setMinutes(soon.getMinutes() - soon.getTimezoneOffset());
    fireEvent.change(screen.getByLabelText('Custom publish time'), {
      target: { value: soon.toISOString().slice(0, 16) },
    });
    expect(screen.getByText('Choose a time at least 24 hours from now.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Approve & queue/ })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'x'.repeat(130) } });
    expect(screen.getByText(/130 \/ 2,200 · the feed shows the first 125/)).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('feed fold');
  });

  it('swaps to an alternative image and still offers an upload fallback', async () => {
    renderQueue();
    await openFirst();
    fireEvent.click(await screen.findByRole('button', { name: 'Use alternative image 1' }));
    expect(screen.getByRole('button', { name: 'Use alternative image 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('Upload a different JPEG')).toBeInTheDocument();
    tickChecklist();
    const approve = screen.getByRole('button', { name: /^Approve & queue/ });
    await waitFor(() => expect(approve).toBeEnabled());
    fireEvent.click(approve);
    await screen.findByText(/Scheduled in PostyBirb/);
    expect(getPreparedMedia).toHaveBeenCalledWith(alt);
  });

  it('gives each approve button a unique accessible name', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(
      snapshot([
        draft(),
        draft({ id: 'cm:1', account: 'subcult', text: 'A second post about the site' }),
      ]),
    );
    renderQueue();
    await openFirst();
    const first = screen
      .getByRole('button', { name: /^Approve & queue/ })
      .getAttribute('aria-label');
    fireEvent.click(screen.getByRole('button', { name: /A second post/, expanded: false }));
    const second = screen
      .getByRole('button', { name: /^Approve & queue/ })
      .getAttribute('aria-label');
    expect(second).toMatch(/subcult\.tv post: A second post/);
    expect(first).not.toBe(second);
  });

  it('falls back to the saved upload when no prepared image exists', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(
      snapshot([draft({ media: { mode: 'capture', asset_ids: [], alt_text: '', brief: '' } })]),
    );
    vi.mocked(getReviewDrafts).mockResolvedValue([
      {
        draft_id: 'cm:0',
        version: 3,
        account_id: 'pb-patrick',
        caption: 'Saved caption',
        due_at: future(50),
        has_media: true,
        status: 'draft',
        post_id: '',
        updated_at: '',
      },
    ]);
    vi.mocked(getReviewDraftMedia).mockResolvedValue(new Blob());
    vi.mocked(saveReviewDraft).mockResolvedValue({ version: 4 });
    renderQueue();
    await openFirst();
    expect(screen.getByLabelText('Caption')).toHaveValue('Saved caption');
    tickChecklist();
    const approve = screen.getByRole('button', { name: /^Approve & queue/ });
    expect(approve).toBeDisabled();
    fireEvent.load(await screen.findByRole('img', { name: 'Selected image for this post' }));
    expect(approve).toBeEnabled();
    fireEvent.click(approve);
    await screen.findByText(/Scheduled in PostyBirb/);
    const form = vi.mocked(saveReviewDraft).mock.calls[0][1];
    expect(form.get('version')).toBe('3');
    expect(form.get('media')).toBeNull();
    expect(vi.mocked(approveReviewDraft).mock.calls[0].slice(0, 2)).toEqual(['cm:0', 4]);
  });

  it('blocks approval on a stale snapshot', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue({ ...snapshot([draft()]), stale: true });
    renderQueue();
    await openFirst();
    tickChecklist();
    expect(screen.getByRole('button', { name: /^Approve & queue/ })).toBeDisabled();
    expect(
      screen.getByText('Refresh the preparation source before approving.'),
    ).toBeInTheDocument();
  });

  it('keeps X drafts out of the Instagram tab and read-only in their own tab', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.mocked(getPostingDashboard).mockResolvedValue(
      snapshot([
        draft(),
        draft({
          id: 'plan:0',
          mode: 'plan',
          platform: undefined,
          account: 'clpr',
          text: 'Clip the moment. https://clpr.tv/a-very-long-link-that-counts-as-twenty-three',
          expires_at: '',
          due_at: future(72),
        }),
        draft({
          id: 'radar:0',
          mode: 'radar',
          platform: 'x',
          text: 'Old timely post',
          expires_at: '',
          due_at: future(-2),
        }),
      ]),
    );
    render(
      <MemoryRouter>
        <AdminPosts />
      </MemoryRouter>,
    );
    await screen.findByText(/We gave clip stacks/);
    expect(screen.queryByText(/Clip the moment/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /X \(post via Buffer\) 1/ }));
    fireEvent.click(
      await screen.findByRole('button', { name: /Clip the moment/, expanded: false }),
    );
    expect(screen.getByText('40 / 280')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Approve/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Old timely post')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Copy X text for clpr/ }));
    await screen.findByText('Copied. Paste it into Buffer.');
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Clip the moment.'));
    fireEvent.click(screen.getByLabelText('Include expired drafts'));
    expect(screen.getByText('Old timely post')).toBeInTheDocument();
  });
});

const decision = (over: Partial<DraftDecision>): DraftDecision => ({
  id: 1,
  draft_id: 'cm:0',
  platform: 'instagram',
  account: 'patrick',
  decision: 'rejected',
  original_text: '',
  final_text: '',
  diff_stats: {},
  image_choice: 'none',
  original_due_at: null,
  final_due_at: null,
  reason_codes: [],
  note: '',
  checklist: [],
  snooze_until: null,
  decided_by: 'owner',
  decided_at: new Date().toISOString(),
  ...over,
});

describe('reject, revise and snooze', () => {
  it('rejects with reason chips and a note, then refreshes the queue', async () => {
    vi.mocked(recordDraftDecision).mockResolvedValue({ draft_id: 'cm:0', decision: 'rejected' });
    renderQueue();
    await openFirst();
    fireEvent.click(screen.getByRole('button', { name: /^Reject patrick__eff post: We gave/ }));
    const confirm = screen.getByRole('button', { name: 'Confirm rejection' });
    expect(confirm).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Off-voice' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wrong image' }));
    fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'Too salesy' } });
    fireEvent.click(confirm);
    await screen.findByText(/Rejected. The reason is saved/);
    expect(recordDraftDecision).toHaveBeenCalledWith('cm:0', {
      decision: 'rejected',
      reasons: ['off_voice', 'wrong_image'],
      note: 'Too salesy',
      checklist: [
        { item: 'Confirm the mark matches the merged design.', checked: false },
        { item: 'Check the public site.', checked: false },
      ],
    });
    expect(getPostingDashboard).toHaveBeenCalledTimes(2);
    expect(approveReviewDraft).not.toHaveBeenCalled();
  });

  it('requires a note for a revision request and snoozes by days', async () => {
    vi.mocked(recordDraftDecision).mockResolvedValue({ draft_id: 'cm:0', decision: 'x' });
    renderQueue();
    await openFirst();
    fireEvent.click(screen.getByRole('button', { name: /^Request revision of patrick__eff/ }));
    const send = screen.getByRole('button', { name: 'Send request' });
    expect(send).toBeDisabled();
    fireEvent.change(screen.getByLabelText('What should change?'), {
      target: { value: 'Lead with the streamer, not the logo' },
    });
    fireEvent.click(send);
    await screen.findByText(/Revision requested/);
    expect(vi.mocked(recordDraftDecision).mock.calls[0][1]).toMatchObject({
      decision: 'revision_requested',
      note: 'Lead with the streamer, not the logo',
    });
    await openFirst();
    fireEvent.click(screen.getByRole('button', { name: /^Snooze patrick__eff/ }));
    fireEvent.change(screen.getByLabelText('Snooze for'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Snooze' }));
    await screen.findByText('Snoozed for 3 days.');
    const until = Date.parse(String(vi.mocked(recordDraftDecision).mock.calls[1][1].snooze_until));
    expect(until - Date.now()).toBeGreaterThan(70 * HOUR);
  });

  it('hides rejected, snoozed and superseded drafts until asked', async () => {
    vi.mocked(getPostingDashboard).mockResolvedValue(
      snapshot([
        draft(),
        draft({ id: 'cm:1', text: 'Snoozed post' }),
        draft({ id: 'cm:2', text: 'Old version' }),
        draft({ id: 'cm:3', text: 'New version', supersedes: 'cm:2' }),
        draft({ id: 'cm:4', text: 'Snooze over' }),
      ]),
    );
    vi.mocked(getDraftDecisions).mockResolvedValue([
      decision({ draft_id: 'cm:0', note: 'Off-brand' }),
      decision({ id: 2, draft_id: 'cm:1', decision: 'snoozed', snooze_until: future(24) }),
      decision({ id: 3, draft_id: 'cm:4', decision: 'snoozed', snooze_until: future(-1) }),
    ]);
    renderQueue();
    await screen.findByText('New version');
    expect(screen.getByText('Snooze over')).toBeInTheDocument();
    for (const text of [/We gave clip stacks/, 'Snoozed post', 'Old version'])
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Instagram 2/ })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Show 3 rejected, snoozed or replaced drafts/));
    expect(screen.getByText('Old version')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /We gave clip stacks/, expanded: false }));
    expect(screen.getByText('Rejected: Off-brand')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Approve & queue/ })).not.toBeInTheDocument();
  });
});

describe('save, re-roll and edit queued posts', () => {
  const queued = {
    draft_id: 'cm:0',
    version: 2,
    account_id: 'pb-patrick',
    caption: 'Queued caption',
    due_at: future(72),
    has_media: true,
    status: 'scheduled' as const,
    post_id: 'pb-post',
    updated_at: '',
  };

  it('saves an edit without approving it', async () => {
    renderQueue();
    await openFirst();
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'Edited caption' } });
    const save = screen.getByRole('button', { name: /^Save changes to patrick__eff post/ });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await screen.findByText('Saved. Nothing is queued until you approve it.');
    const form = vi.mocked(saveReviewDraft).mock.calls[0][1];
    expect(form.get('caption')).toBe('Edited caption');
    expect(approveReviewDraft).not.toHaveBeenCalled();
  });

  it('re-rolls the image while keeping the edited caption', async () => {
    vi.mocked(requestReroll).mockResolvedValue({
      id: 1,
      draft_id: 'cm:0',
      mode: 'image',
      note: 'show the phone',
      caption: 'Keep me',
      image_sha256: '',
      status: 'pending',
      error: '',
      result_draft_id: '',
      requested_at: new Date().toISOString(),
      finished_at: null,
    });
    renderQueue();
    await openFirst();
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'Keep me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Re-roll…' }));
    fireEvent.click(screen.getByLabelText(/New image/));
    fireEvent.change(screen.getByLabelText(/Direction/), { target: { value: 'show the phone' } });
    fireEvent.click(screen.getByRole('button', { name: 'Re-roll image' }));
    await screen.findByText(/Re-rolling the image/);
    expect(vi.mocked(requestReroll).mock.calls[0]).toEqual([
      'cm:0',
      { mode: 'image', note: 'show the phone', caption: 'Keep me', image_sha256: undefined },
    ]);
    expect(await screen.findByText(/Regenerating the image/)).toBeInTheDocument();
  });

  it('keeps the selected prepared image for a caption re-roll', async () => {
    vi.mocked(requestReroll).mockResolvedValue({
      id: 2,
      draft_id: 'cm:0',
      mode: 'text',
      note: '',
      caption: '',
      image_sha256: alt,
      status: 'pending',
      error: '',
      result_draft_id: '',
      requested_at: new Date().toISOString(),
      finished_at: null,
    });
    renderQueue();
    await openFirst();
    fireEvent.click(await screen.findByRole('button', { name: 'Use alternative image 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Re-roll…' }));
    fireEvent.click(screen.getByRole('button', { name: 'Re-roll caption' }));
    await screen.findByText(/Re-rolling the caption/);
    expect(vi.mocked(requestReroll).mock.calls[0][1]).toMatchObject({
      mode: 'text',
      image_sha256: alt,
    });
  });

  it('shows a running re-roll in the row and the sheet', async () => {
    vi.mocked(getRerolls).mockResolvedValue([
      {
        id: 3,
        draft_id: 'cm:0',
        mode: 'both',
        note: '',
        caption: '',
        image_sha256: '',
        status: 'running',
        error: '',
        result_draft_id: '',
        requested_at: new Date().toISOString(),
        finished_at: null,
      },
    ]);
    renderQueue();
    expect(await screen.findByText('Re-rolling…')).toBeInTheDocument();
    await openFirst();
    expect(screen.getByText(/Regenerating the caption and image/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Re-roll…' })).not.toBeInTheDocument();
  });

  it('reschedules a queued post without replacing it', async () => {
    vi.mocked(getReviewDrafts).mockResolvedValue([queued]);
    vi.mocked(getReviewDraftMedia).mockResolvedValue(new Blob());
    vi.mocked(editScheduledDraft).mockResolvedValue({
      status: 'scheduled',
      post_id: 'pb-post',
      version: 3,
      changed: true,
      replaced: false,
    });
    renderQueue();
    await openFirst(/We gave clip stacks/);
    expect(screen.getByLabelText('Caption')).toHaveValue('Queued caption');
    const save = screen.getByRole('button', { name: 'Reschedule' });
    expect(save).toBeDisabled();
    const time = screen.getByLabelText('Publish time') as HTMLSelectElement;
    const slot = [...time.options].find((o) => /^\d+$/.test(o.value) && !o.disabled)!;
    fireEvent.change(time, { target: { value: slot.value } });
    expect(save).toBeEnabled();
    fireEvent.click(save);
    await screen.findByText(/^Moved to /);
    const form = vi.mocked(editScheduledDraft).mock.calls[0][1];
    expect(vi.mocked(editScheduledDraft).mock.calls[0][0]).toBe('cm:0');
    expect(form.get('version')).toBe('2');
    expect(form.get('caption')).toBe('Queued caption');
    expect(new Date(String(form.get('due_at'))).valueOf()).toBe(Number(slot.value));
    expect(form.get('media')).toBeNull();
  });

  it('warns that a caption change replaces the queued post', async () => {
    vi.mocked(getReviewDrafts).mockResolvedValue([queued]);
    vi.mocked(getReviewDraftMedia).mockResolvedValue(new Blob());
    renderQueue();
    await openFirst();
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'New words' } });
    expect(screen.getByText(/withdraws the queued post from PostyBirb/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save & requeue' })).toBeEnabled();
  });

  it('opens a queued draft from a delivery-history link', async () => {
    vi.mocked(getReviewDrafts).mockResolvedValue([queued]);
    vi.mocked(getReviewDraftMedia).mockResolvedValue(new Blob());
    render(
      <MemoryRouter initialEntries={['/admin/posts?post=pb-post']}>
        <AdminPosts />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('button', { name: 'Reschedule' })).toBeInTheDocument();
  });
});

describe('review helpers', () => {
  it('offers cadence slots in the account time zone within the approval window', () => {
    const now = Date.parse('2026-10-05T12:00:00Z'); // 07:00 in Chicago
    const slots = cadenceSlots(['09:11'], 'America/Chicago', now);
    expect(new Date(slots[0].at).toISOString()).toBe('2026-10-06T14:11:00.000Z');
    expect(slots.every((s) => s.at >= now + 24 * HOUR)).toBe(true);
    // Across the November DST change the wall-clock time stays 09:11.
    const nov = cadenceSlots(['09:11'], 'America/Chicago', Date.parse('2026-10-31T12:00:00Z'));
    expect(nov.map((s) => new Date(s.at).toISOString())).toContain('2026-11-02T15:11:00.000Z');
    const taken = cadenceSlots(['09:11'], 'America/Chicago', now, [
      Date.parse('2026-10-06T14:00:00Z'),
    ]);
    expect(taken[0].taken).toBe(true);
  });
  it('matches the PostyBirb account by profile only when unambiguous', () => {
    expect(matchAccount('patrick', delivery.accounts)).toBe('pb-patrick');
    expect(matchAccount('subcult', delivery.accounts)).toBe('pb-subcult');
    expect(
      matchAccount('patrick', [...delivery.accounts, { ...delivery.accounts[0], id: 'pb-2' }]),
    ).toBe('');
  });
  it('splits next_check into checklist items when no checklist is prepared', () => {
    expect(
      checklistItems({ next_check: 'Verify the mark. Check the public site; confirm alt text' }),
    ).toEqual(['Verify the mark.', 'Check the public site', 'confirm alt text']);
    expect(checklistItems({ checklist: ['One'], next_check: 'Two. Three.' })).toEqual(['One']);
  });
  it('summarises scores readably', () => {
    expect(scoreSummary({ hook: 4, ending: 4 })).toBe('Average 4.0/5');
    expect(scoreSummary(undefined)).toBe('');
  });
});
