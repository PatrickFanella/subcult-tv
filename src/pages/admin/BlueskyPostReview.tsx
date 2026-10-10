import { useEffect, useState, type ReactNode } from 'react';
import { approveBlueskyDraft, type BlueskyDelivery, type PostingDraft } from '@/lib/api';
import { leadProblem } from '@/lib/review-queue';
import TextPostCard from './TextPostCard';

function localTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? ''
    : new Date(date.valueOf() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export default function BlueskyPostReview({
  draft,
  delivery,
  now,
  onSaved,
  children,
}: {
  draft: PostingDraft;
  delivery: BlueskyDelivery | null;
  now: number;
  onSaved: () => void;
  children?: ReactNode;
}) {
  const accounts = delivery?.accounts ?? [];
  const [account, setAccount] = useState(
    () => accounts.find((a) => a.profile === draft.account)?.id ?? '',
  );
  const [caption, setCaption] = useState(draft.text);
  const [due, setDue] = useState(() => localTime(draft.due_at));
  const [media, setMedia] = useState<File | null>(null);
  const [alt, setAlt] = useState(draft.media.alt_text || '');
  const [preview, setPreview] = useState('');
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const target = accounts.find((a) => a.id === account);
  const expired = new Date(draft.expires_at || draft.due_at).valueOf() <= now;
  const receipt = delivery?.receipts.find((a) => a.draft_id === draft.id);
  const problem = receipt
    ? 'This draft already has a submission. Check Scheduled & delivered.'
    : !delivery?.configured
      ? 'Bluesky scheduling is not connected.'
      : draft.mode === 'radar' && expired
        ? 'This timely post expired. Regenerate it from current sources.'
        : !target
          ? 'Choose a Bluesky account.'
          : target.disabled
            ? 'Reconnect this Bluesky account in PostyBirb, then refresh.'
            : !caption.trim() || [...caption.trim()].length > 300
              ? 'Write a post up to 300 characters.'
              : media && (media.type !== 'image/jpeg' || media.size > 900 * 1024)
                ? 'Choose a JPEG under 900 KB.'
                : media && (!alt.trim() || [...alt.trim()].length > 2000)
                  ? 'Describe the image in alt text, up to 2000 characters.'
                  : leadProblem(new Date(due).valueOf(), now);
  const changed = () => setApproved(false);
  async function submit() {
    if (problem || !approved || busy || uncertain) return;
    setBusy(true);
    setError('');
    const form = new FormData();
    form.set('account_id', account);
    form.set('caption', caption);
    form.set('original_text', draft.text);
    form.set('due_at', new Date(due).toISOString());
    form.set('approved', 'true');
    if (media) {
      form.set('media', media);
      form.set('alt_text', alt);
    }
    try {
      await approveBlueskyDraft(draft.id, form);
      setApproved(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bluesky scheduling could not be confirmed');
      if (!(
        e instanceof Error &&
        'status' in e &&
        [400, 403, 404, 409, 503].includes(Number(e.status))
      ))
        setUncertain(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <TextPostCard
      draft={{ ...draft, text: caption, due_at: draft.due_at }}
      expired={expired}
      scheduling
    >
      <div className="review-sheet-controls">
        {expired && draft.mode !== 'radar' && (
          <p className="studio-note">
            The proposed time passed. Check the claims and choose a future time before approving.
          </p>
        )}
        <label>
          Bluesky account
          <select
            value={account}
            disabled={busy || uncertain}
            onChange={(e) => {
              setAccount(e.target.value);
              changed();
            }}
          >
            <option value="">Choose an account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} disabled={a.disabled}>
                {a.name}
                {a.disabled ? ' · Disconnected' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Post text
          <textarea
            rows={5}
            value={caption}
            disabled={busy || uncertain}
            onChange={(e) => {
              setCaption(e.target.value);
              changed();
            }}
          />
        </label>
        <label>
          Optional JPEG image
          <input
            type="file"
            accept="image/jpeg"
            disabled={busy || uncertain}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setMedia(file);
              setPreview(file ? URL.createObjectURL(file) : '');
              changed();
            }}
          />
        </label>
        <p className="studio-note">
          {media
            ? 'One JPEG under 900 KB, no larger than 4000 pixels on either side.'
            : 'This will be a text-only post. Upload an image here to attach it.'}
        </p>
        {preview && (
          <img
            src={preview}
            alt={alt || 'Selected Bluesky image'}
            style={{ maxWidth: '100%', maxHeight: '24rem', objectFit: 'contain' }}
          />
        )}
        {media && (
          <label>
            Image alt text
            <textarea
              rows={3}
              value={alt}
              disabled={busy || uncertain}
              onChange={(e) => {
                setAlt(e.target.value);
                changed();
              }}
            />
          </label>
        )}
        <label>
          Publish time
          <input
            type="datetime-local"
            value={due}
            disabled={busy || uncertain}
            onChange={(e) => {
              setDue(e.target.value);
              changed();
            }}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={approved}
            disabled={busy || uncertain}
            onChange={(e) => setApproved(e.target.checked)}
          />{' '}
          I approve this exact Bluesky text{media ? ', image and alt text' : ''}, account and
          publish time.
        </label>
        {problem && <p role="alert">{problem}</p>}
        {error && <p role="alert">{error}</p>}
        {uncertain && (
          <p role="alert">
            Check PostyBirb before retrying. This approval may already have reached it.
          </p>
        )}
        <button
          type="button"
          disabled={busy || uncertain || !approved || Boolean(problem)}
          onClick={() => void submit()}
        >
          {busy ? 'Scheduling…' : 'Approve & schedule in PostyBirb'}
        </button>
      </div>
      {children}
    </TextPostCard>
  );
}
