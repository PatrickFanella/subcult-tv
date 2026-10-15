import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import TweetGenerator from '@/pages/admin/TweetGenerator';
import { getTweetRequests, requestTweet, type TweetRequest } from '@/lib/api';

vi.mock('@/lib/api', () => ({ getTweetRequests: vi.fn(), requestTweet: vi.fn() }));
const job = (over: Partial<TweetRequest> = {}): TweetRequest => ({
  id: 1,
  account: 'clpr',
  note: 'Playlists',
  status: 'pending',
  attempts: 0,
  error: '',
  result_draft_id: '',
  requested_at: '2026-10-15T12:00:00Z',
  finished_at: null,
  ...over,
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getTweetRequests).mockResolvedValue([]);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('requests exactly one selected account and retains direction if the request fails', async () => {
  vi.mocked(requestTweet)
    .mockRejectedValueOnce(new Error('Connection lost'))
    .mockResolvedValueOnce(job());
  render(
    <TweetGenerator
      accounts={['patrick', 'clpr']}
      reviewableDrafts={[]}
      onReady={vi.fn()}
      onPrepared={vi.fn()}
    />,
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Generate tweet' })).toBeEnabled());
  fireEvent.change(screen.getByLabelText('Tweet account'), { target: { value: 'clpr' } });
  fireEvent.change(screen.getByLabelText('Topic or direction (optional)'), {
    target: { value: 'Playlists' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Generate tweet' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost');
  expect(screen.getByLabelText('Topic or direction (optional)')).toHaveValue('Playlists');
  fireEvent.click(screen.getByRole('button', { name: 'Generate tweet' }));
  expect(await screen.findByText(/Waiting to start/)).toBeInTheDocument();
  expect(requestTweet).toHaveBeenLastCalledWith('clpr', 'Playlists');
  expect(screen.getByRole('button', { name: 'Preparing a tweet…' })).toBeDisabled();
  expect(screen.getByLabelText('Topic or direction (optional)')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('Tweet account'), { target: { value: 'patrick' } });
  expect(screen.getByRole('button', { name: 'Generate tweet' })).toBeEnabled();
});

it('refreshes a completed draft without opening it until the owner chooses Review', async () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  vi.mocked(getTweetRequests)
    .mockResolvedValueOnce([job({ status: 'running' })])
    .mockResolvedValue([job({ status: 'done', result_draft_id: 'run-ondemand-1:0' })]);
  const onReady = vi.fn();
  const onPrepared = vi.fn();
  render(
    <TweetGenerator
      accounts={['clpr']}
      reviewableDrafts={['run-ondemand-1:0']}
      onReady={onReady}
      onPrepared={onPrepared}
    />,
  );
  await screen.findByText(/Writing your tweet/);
  await act(async () => {
    vi.advanceTimersByTime(10000);
  });
  await screen.findByText(/Ready for review/);
  expect(onPrepared).toHaveBeenCalledTimes(1);
  expect(onReady).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Generate tweet' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Review tweet' }));
  expect(onReady).toHaveBeenCalledExactlyOnceWith('run-ondemand-1:0');
});

it('shows preparation failures and allows a new request', async () => {
  vi.mocked(getTweetRequests).mockResolvedValue([
    job({ status: 'failed', error: 'Tweet preparation failed.' }),
  ]);
  render(
    <TweetGenerator
      accounts={['clpr']}
      reviewableDrafts={['run-ondemand-1:0']}
      onReady={vi.fn()}
      onPrepared={vi.fn()}
    />,
  );
  expect(await screen.findByText('Tweet preparation failed.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Generate tweet' })).toBeEnabled();
});

it('does not offer review links for drafts that already left the review queue', async () => {
  vi.mocked(getTweetRequests).mockResolvedValue([
    job({ status: 'done', result_draft_id: 'already-approved:0' }),
  ]);
  render(
    <TweetGenerator
      accounts={['clpr']}
      reviewableDrafts={[]}
      onReady={vi.fn()}
      onPrepared={vi.fn()}
    />,
  );
  expect(await screen.findByText(/Draft prepared/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Review tweet' })).not.toBeInTheDocument();
});
