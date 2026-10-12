import { useState } from 'react';
import {
  approveBufferDraft,
  editBufferDraft,
  type PostingDraft,
  type BufferDelivery,
  type BufferReceipt,
} from '@/lib/api';
import { leadProblem, matchAccount, slotLabel, xLength } from '@/lib/review-queue';
import TextPostCard from './TextPostCard';

/** Buffer's plan allows one scheduled thread per X account; keep threads short. */
const MAX_REPLIES = 3;

function localTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? ''
    : new Date(date.valueOf() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export default function XPostReview({
  draft,
  delivery,
  receipt,
  now,
  onSaved,
  children,
}: {
  draft: PostingDraft;
  delivery: BufferDelivery | null;
  receipt?: BufferReceipt;
  now: number;
  onSaved: () => void;
  children?: React.ReactNode;
}) {
  const channels = delivery?.channels ?? [];
  const [caption, setCaption] = useState(receipt?.caption ?? draft.text);
  const [replies, setReplies] = useState<string[]>(() => receipt?.replies ?? draft.replies ?? []);
  const [channel, setChannel] = useState(
    () =>
      receipt?.channel_id ||
      matchAccount(
        draft.account,
        channels.map((c) => ({
          id: c.id,
          name: c.name,
          profile: '',
          disabled: c.isDisconnected || c.isLocked || c.isQueuePaused,
        })),
      ),
  );
  const [due, setDue] = useState(() => localTime(receipt?.due_at ?? draft.due_at));
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const target = channels.find((c) => c.id === channel);
  const expired = new Date(draft.expires_at || draft.due_at).valueOf() <= now;
  const problem = !delivery?.configured
    ? 'Buffer scheduling is not connected.'
    : receipt && receipt.status !== 'scheduled'
      ? 'Check Buffer to reconcile this submission before retrying.'
      : !receipt && expired && draft.mode === 'radar'
        ? 'This timely tweet expired. Regenerate it from current sources.'
        : !target
          ? 'Choose an X account.'
          : target.isDisconnected || target.isLocked || target.isQueuePaused
            ? 'This X channel is disconnected, locked or paused in Buffer.'
            : !caption.trim() || xLength(caption) > 280
              ? 'Write a tweet up to 280 characters.'
              : replies.some((reply) => !reply.trim() || xLength(reply) > 280)
                ? 'Each reply needs text, up to 280 characters. Remove empty replies.'
                : leadProblem(new Date(due).valueOf(), now);
  const changed =
    !receipt ||
    caption.trim() !== receipt.caption ||
    replies.map((reply) => reply.trim()).join('\n\u0000') !==
      (receipt.replies ?? []).join('\n\u0000') ||
    new Date(due).valueOf() !== new Date(receipt.due_at).valueOf();
  async function submit() {
    setBusy(true);
    setError('');
    const input = {
      channel_id: channel,
      caption,
      replies,
      due_at: new Date(due).toISOString(),
      approved: true,
    };
    try {
      if (receipt) await editBufferDraft(draft.id, { ...input, version: receipt.version });
      else await approveBufferDraft(draft.id, { ...input, original_text: draft.text });
      setApproved(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Buffer scheduling could not be confirmed');
      if (!(e instanceof Error && 'status' in e && [400, 403, 409, 503].includes(Number(e.status))))
        setUncertain(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <TextPostCard
      draft={{ ...draft, text: caption, replies, due_at: receipt?.due_at ?? draft.due_at }}
      expired={!receipt && expired}
      scheduling
      scheduled={receipt?.status === 'scheduled'}
    >
      <div className="review-sheet-controls">
        {receipt && (
          <p className="studio-note">
            {receipt.status === 'scheduled' ? 'Approved · Scheduled' : 'Check Buffer'} ·{' '}
            {slotLabel(new Date(receipt.due_at).valueOf(), now, 'America/Chicago')}
          </p>
        )}
        {!receipt && expired && draft.mode !== 'radar' && (
          <p className="studio-note">
            The proposed time passed. Check the claims and choose a future time before approving.
          </p>
        )}
        <label>
          X account
          <select
            value={channel}
            disabled={busy || Boolean(receipt)}
            onChange={(e) => {
              setChannel(e.target.value);
              setApproved(false);
            }}
          >
            <option value="">Choose an account</option>
            {channels.map((c) => (
              <option
                key={c.id}
                value={c.id}
                disabled={c.isDisconnected || c.isLocked || c.isQueuePaused}
              >
                {c.name}
                {c.isDisconnected
                  ? ' · Disconnected'
                  : c.isLocked
                    ? ' · Locked'
                    : c.isQueuePaused
                      ? ' · Paused'
                      : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tweet text
          <textarea
            value={caption}
            disabled={busy}
            rows={5}
            onChange={(e) => {
              setCaption(e.target.value);
              setApproved(false);
            }}
          />
        </label>
        <fieldset className="x-replies">
          <legend>Replies under this tweet</legend>
          <p className="studio-note">
            Posted as a thread right after the tweet. Buffer allows one scheduled thread per X
            account at a time.
          </p>
          {replies.map((reply, i) => (
            <div key={i} className="x-reply-field">
              <label>
                Reply {i + 1} · {xLength(reply)} / 280
                <textarea
                  value={reply}
                  disabled={busy}
                  rows={3}
                  onChange={(e) => {
                    setReplies(replies.map((r, j) => (j === i ? e.target.value : r)));
                    setApproved(false);
                  }}
                />
              </label>
              <button
                type="button"
                disabled={busy}
                aria-label={`Remove reply ${i + 1}`}
                onClick={() => {
                  setReplies(replies.filter((_, j) => j !== i));
                  setApproved(false);
                }}
              >
                Remove
              </button>
            </div>
          ))}
          {replies.length < MAX_REPLIES && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setReplies([...replies, '']);
                setApproved(false);
              }}
            >
              Add a reply
            </button>
          )}
        </fieldset>
        <label>
          Publish time
          <input
            type="datetime-local"
            value={due}
            disabled={busy}
            onChange={(e) => {
              setDue(e.target.value);
              setApproved(false);
            }}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={approved}
            disabled={busy}
            onChange={(e) => setApproved(e.target.checked)}
          />
          I approve this exact {replies.length ? 'thread' : 'tweet'}, account and publish time.
        </label>
        {problem && <p role="alert">{problem}</p>}
        {error && <p role="alert">{error}</p>}
        <button
          type="button"
          disabled={busy || uncertain || !approved || !changed || Boolean(problem)}
          onClick={() => void submit()}
        >
          {busy ? 'Scheduling…' : receipt ? 'Save & reschedule' : 'Approve & schedule in Buffer'}
        </button>
      </div>
      {children}
    </TextPostCard>
  );
}
