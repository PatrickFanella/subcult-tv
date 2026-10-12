import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BlueskyPostReview from '@/pages/admin/BlueskyPostReview';
import { approveBlueskyDraft, type BlueskyDelivery, type PostingDraft } from '@/lib/api';
vi.mock('@/lib/api', () => ({ approveBlueskyDraft: vi.fn() }));
const now = Date.now();
const draft: PostingDraft = {
  id: 'plan:bsky:0',
  run_id: 'plan',
  mode: 'plan',
  platform: 'bluesky',
  account: 'subcult',
  text: 'Reviewed Bluesky copy',
  due_at: new Date(now + 2 * 3600000).toISOString(),
  expires_at: '',
  week: '',
  evidence: '',
  next_check: '',
  approval: 'unapproved',
  media: { mode: 'none', asset_ids: [], alt_text: '', brief: '' },
};
const delivery: BlueskyDelivery = {
  configured: true,
  checked_at: new Date(now).toISOString(),
  receipts: [],
  posts: [],
  accounts: [
    {
      id: 'bsky-account',
      name: '@subcult.tv',
      identifier: 'bluesky',
      profile: 'subcult',
      disabled: false,
    },
  ],
};
const approve = () => fireEvent.click(screen.getByLabelText(/I approve this exact Bluesky/));
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'URL',
    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() }),
  );
});
describe('Bluesky approval', () => {
  it('uses the mapped account and requires exact approval, reset by edits', async () => {
    const saved = vi.fn();
    render(<BlueskyPostReview draft={draft} delivery={delivery} now={now} onSaved={saved} />);
    const button = screen.getByRole('button', { name: 'Approve & schedule in PostyBirb' });
    expect(screen.getByLabelText('Bluesky account')).toHaveValue('bsky-account');
    expect(button).toBeDisabled();
    approve();
    expect(button).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Post text'), {
      target: { value: 'Edited Bluesky copy' },
    });
    expect(button).toBeDisabled();
    approve();
    fireEvent.click(button);
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    const [id, form] = vi.mocked(approveBlueskyDraft).mock.calls[0];
    expect(id).toBe(draft.id);
    expect(form.get('account_id')).toBe('bsky-account');
    expect(form.get('caption')).toBe('Edited Bluesky copy');
    expect(form.get('original_text')).toBe(draft.text);
    expect(form.get('media')).toBeNull();
  });
  it('blocks disconnected accounts and expired timely drafts', () => {
    const { rerender } = render(
      <BlueskyPostReview
        draft={draft}
        delivery={{ ...delivery, accounts: [{ ...delivery.accounts[0], disabled: true }] }}
        now={now}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Reconnect');
    rerender(
      <BlueskyPostReview
        draft={{ ...draft, mode: 'radar', expires_at: new Date(now - 1000).toISOString() }}
        delivery={delivery}
        now={now}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Regenerate');
  });
  it('requires image alt text and includes the reviewed bytes', async () => {
    const saved = vi.fn();
    render(<BlueskyPostReview draft={draft} delivery={delivery} now={now} onSaved={saved} />);
    const file = new File(['jpeg'], 'image.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Optional JPEG image'), { target: { files: [file] } });
    approve();
    expect(screen.getByRole('button', { name: /Approve & schedule/ })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Image alt text'), {
      target: { value: 'A reviewed image' },
    });
    approve();
    fireEvent.click(screen.getByRole('button', { name: /Approve & schedule/ }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    const form = vi.mocked(approveBlueskyDraft).mock.calls[0][1];
    expect(form.get('media')).toBe(file);
    expect(form.get('alt_text')).toBe('A reviewed image');
  });
  it('blocks a second submission after a provider timeout', async () => {
    vi.mocked(approveBlueskyDraft).mockRejectedValue(new Error('Connection lost'));
    render(<BlueskyPostReview draft={draft} delivery={delivery} now={now} onSaved={vi.fn()} />);
    approve();
    fireEvent.click(screen.getByRole('button', { name: /Approve & schedule/ }));
    await screen.findByText(/Check PostyBirb before retrying/);
    expect(screen.getByRole('button', { name: /Approve & schedule/ })).toBeDisabled();
  });
});
