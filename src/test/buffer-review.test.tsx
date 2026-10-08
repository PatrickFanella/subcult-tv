import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import XPostReview from '@/pages/admin/XPostReview';
import {
  approveBufferDraft,
  editBufferDraft,
  type BufferDelivery,
  type PostingDraft,
} from '@/lib/api';

vi.mock('@/lib/api', () => ({ approveBufferDraft: vi.fn(), editBufferDraft: vi.fn() }));
const now = Date.now();
const future = new Date(now + 2 * 3600000).toISOString();
const draft = {
  id: 'plan:0',
  run_id: 'plan',
  mode: 'plan',
  platform: 'x',
  account: 'subcult',
  text: 'A reviewed tweet',
  due_at: future,
  expires_at: '',
  evidence: 'Verified source',
  next_check: '',
  approval: 'unapproved',
  sources: [],
  week: '',
  media: { mode: 'none', asset_ids: [], alt_text: '', brief: '' },
} as PostingDraft;
const delivery: BufferDelivery = {
  configured: true,
  channels: [
    {
      id: 'channel',
      name: 'subcult_tv',
      service: 'twitter',
      isDisconnected: false,
      isLocked: false,
      isQueuePaused: false,
    },
  ],
  receipts: [],
};
const receipt = {
  draft_id: draft.id,
  version: 2,
  channel_id: 'channel',
  caption: draft.text,
  due_at: future,
  status: 'scheduled' as const,
  post_id: 'post',
};
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe('Buffer approval', () => {
  it('requires approval and submits the exact account, text and same-day time', async () => {
    const saved = vi.fn();
    render(<XPostReview draft={draft} delivery={delivery} now={now} onSaved={saved} />);
    const submit = screen.getByRole('button', { name: 'Approve & schedule in Buffer' });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByLabelText('I approve this exact tweet, account and publish time.'));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(approveBufferDraft).toHaveBeenCalledWith(
      draft.id,
      expect.objectContaining({
        channel_id: 'channel',
        caption: draft.text,
        original_text: draft.text,
        approved: true,
      }),
    );
    const due = vi.mocked(approveBufferDraft).mock.calls[0][1].due_at;
    expect(new Date(due).valueOf()).toBeGreaterThan(now);
    expect(new Date(due).valueOf()).toBeLessThan(now + 24 * 3600000);
  });

  it('requires current sources for expired timely tweets', () => {
    render(
      <XPostReview
        draft={{ ...draft, mode: 'radar', due_at: new Date(now - 3600000).toISOString() }}
        delivery={delivery}
        now={now}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Regenerate it from current sources');
    expect(screen.getByRole('button', { name: /Approve & schedule/ })).toBeDisabled();
  });

  it('allows an evergreen missed draft after choosing a future time', () => {
    render(
      <XPostReview
        draft={{ ...draft, due_at: new Date(now - 3600000).toISOString() }}
        delivery={delivery}
        now={now}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByText(/The proposed time passed/)).toBeInTheDocument();
    const local = new Date(
      new Date(future).valueOf() - new Date(future).getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
    fireEvent.change(screen.getByLabelText('Publish time'), { target: { value: local } });
    fireEvent.click(screen.getByLabelText('I approve this exact tweet, account and publish time.'));
    expect(screen.getByRole('button', { name: /Approve & schedule/ })).toBeEnabled();
  });

  it('edits the existing receipt with its version', async () => {
    const saved = vi.fn();
    render(
      <XPostReview draft={draft} delivery={delivery} receipt={receipt} now={now} onSaved={saved} />,
    );
    fireEvent.change(screen.getByLabelText('Tweet text'), { target: { value: 'Revised tweet' } });
    fireEvent.click(screen.getByLabelText('I approve this exact tweet, account and publish time.'));
    fireEvent.click(screen.getByRole('button', { name: 'Save & reschedule' }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(editBufferDraft).toHaveBeenCalledWith(
      draft.id,
      expect.objectContaining({ version: 2, caption: 'Revised tweet' }),
    );
    expect(approveBufferDraft).not.toHaveBeenCalled();
  });

  it('blocks retries after an uncertain write', async () => {
    vi.mocked(approveBufferDraft).mockRejectedValue(
      new Error('Buffer scheduling could not be confirmed'),
    );
    render(<XPostReview draft={draft} delivery={delivery} now={now} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('I approve this exact tweet, account and publish time.'));
    fireEvent.click(screen.getByRole('button', { name: /Approve & schedule/ }));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: /Approve & schedule/ })).toBeDisabled();
    expect(approveBufferDraft).toHaveBeenCalledOnce();
  });
});
