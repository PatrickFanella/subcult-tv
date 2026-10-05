import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  approveReviewDraft,
  saveReviewDraft,
  type PostingDraft,
  type ChecklistState,
  type PreparedImage,
  type ReviewDraft,
  type SocialAccount,
  type SocialDelivery,
} from '@/lib/api';
import {
  cadenceSlots,
  checklistItems,
  defaultSlot,
  draftExpiry,
  firstLine,
  INSTAGRAM_FOLD,
  INSTAGRAM_LIMIT,
  leadProblem,
  matchAccount,
  relativeTime,
  scoreSummary,
  slotLabel,
} from '@/lib/review-queue';
import PostPreview from './PostPreview';
import { usePreparedImage } from './usePreparedImage';

type ImageChoice =
  | { kind: 'prepared' | 'candidate'; sha256: string }
  | { kind: 'uploaded'; file: File }
  | { kind: 'saved' }
  | { kind: 'none' };

export interface ApprovalResult {
  post_id: string;
}

function localInput(at: number) {
  if (Number.isNaN(at)) return '';
  const date = new Date(at);
  return new Date(at - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function Thumbnail({
  image,
  label,
  selected,
  onSelect,
}: {
  image: PreparedImage;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { url, error } = usePreparedImage(image.sha256);
  return (
    <button
      type="button"
      className="review-thumbnail"
      aria-pressed={selected}
      aria-label={label}
      onClick={onSelect}
      disabled={error}
    >
      {url ? <img src={url} alt="" /> : <span>{error ? 'Unavailable' : '…'}</span>}
    </button>
  );
}

/**
 * The review sheet for one Instagram draft: preview, reasons, checklist and
 * a single approval that saves the reviewed version and queues it.
 */
export default function InstagramReview({
  draft,
  edit,
  delivery,
  times,
  timeZone,
  stale,
  now,
  busy,
  setBusy,
  onApproved,
  onError,
  decisions,
}: {
  draft: PostingDraft;
  edit?: ReviewDraft;
  delivery: SocialDelivery | null;
  times: string[];
  timeZone: string;
  stale: boolean;
  now: number;
  busy: string;
  setBusy: (value: string) => void;
  onApproved: (result: ApprovalResult) => void;
  onError: (message: string) => void;
  /** Reject/revise/snooze controls, given the current checklist state. */
  decisions?: (checklist: ChecklistState[], label: string) => ReactNode;
}) {
  const locked = Boolean(busy);
  const accounts: SocialAccount[] = delivery?.accounts ?? [];
  const prepared = draft.media.image;
  const candidates = draft.media.candidates ?? [];
  const [caption, setCaption] = useState(edit?.caption || draft.text);
  const [accountChoice, setAccountChoice] = useState(edit?.account_id || '');
  const accountId = accountChoice || matchAccount(draft.account, accounts);
  const taken = useMemo(
    () =>
      (delivery?.posts ?? [])
        .filter((p) => p.integration.id === accountId)
        .map((p) => new Date(p.publishDate).valueOf()),
    [delivery, accountId],
  );
  const slots = useMemo(
    () => cadenceSlots(times, timeZone, now, taken),
    [times, timeZone, now, taken],
  );
  const savedDue = edit ? new Date(edit.due_at).valueOf() : NaN;
  const suggested = defaultSlot(slots, new Date(draft.due_at).valueOf());
  const [timeChoice, setTimeChoice] = useState<string>(() =>
    edit && !Number.isNaN(savedDue) ? 'custom' : '',
  );
  const [custom, setCustom] = useState(() => localInput(savedDue));
  const due =
    timeChoice === 'custom'
      ? new Date(custom).valueOf()
      : timeChoice
        ? Number(timeChoice)
        : (suggested?.at ?? NaN);
  const [choice, setChoice] = useState<ImageChoice>(() =>
    prepared
      ? { kind: 'prepared', sha256: prepared.sha256 }
      : edit?.has_media
        ? { kind: 'saved' }
        : { kind: 'none' },
  );
  const [upload, setUpload] = useState('');
  useEffect(
    () => () => {
      if (upload) URL.revokeObjectURL(upload);
    },
    [upload],
  );
  const selectedSha =
    choice.kind === 'prepared' || choice.kind === 'candidate' ? choice.sha256 : undefined;
  const selectedImage = usePreparedImage(selectedSha);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const items = checklistItems(draft);
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const target = accounts.find((a) => a.id === accountId);
  const length = [...caption].length;
  const expiry = draftExpiry(draft);
  const expiryAt = new Date(expiry).valueOf();
  const imageReady =
    (selectedSha && Boolean(selectedImage.blob)) ||
    choice.kind === 'uploaded' ||
    (choice.kind === 'saved' && savedLoaded);
  const problem = stale
    ? 'Refresh the preparation source before approving.'
    : expiry && expiryAt <= now
      ? 'This draft has expired.'
      : !delivery
        ? 'PostyBirb accounts are unavailable.'
        : !target || target.disabled
          ? 'Choose an Instagram account.'
          : !caption.trim() || length > INSTAGRAM_LIMIT
            ? 'Write a caption up to 2,200 characters.'
            : leadProblem(due, now) ||
              (!imageReady
                ? 'Choose an image.'
                : checked.some((c) => !c)
                  ? 'Tick every check before approving.'
                  : '');
  const accountLabel = target?.profile || target?.name || draft.account;
  const altText = draft.media.alt_text;
  const previewImage =
    choice.kind === 'uploaded' ? upload : selectedSha ? selectedImage.url : undefined;
  const score = scoreSummary(draft.craft?.scores);
  const checklistState = items.map((item, i) => ({ item, checked: Boolean(checked[i]) }));
  const label = `${accountLabel} post: ${firstLine(caption, 48)}`;

  async function approve() {
    setBusy(draft.id);
    onError('');
    try {
      const form = new FormData();
      form.set('version', String(edit?.version || 0));
      form.set('account_id', accountId);
      form.set('caption', caption);
      form.set('due_at', new Date(due).toISOString());
      if (choice.kind === 'uploaded') form.set('media', choice.file);
      else if (selectedSha && selectedImage.blob)
        form.set('media', new File([selectedImage.blob], 'prepared.jpg', { type: 'image/jpeg' }));
      // The same server validation applies to prepared images and uploads.
      const saved = await saveReviewDraft(draft.id, form);
      const result = await approveReviewDraft(draft.id, saved.version, checklistState);
      onApproved(result);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Scheduling could not be confirmed');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="review-sheet">
      <div className="review-sheet-preview">
        <PostPreview
          account={accountLabel}
          caption={caption}
          image={previewImage || undefined}
          draftID={choice.kind === 'saved' ? draft.id : undefined}
          version={edit?.version}
          hasMedia={choice.kind === 'saved' ? edit?.has_media : choice.kind !== 'none'}
          altText={altText}
          showFold
          onMediaReady={(ready) => {
            if (choice.kind === 'saved') setSavedLoaded(ready);
          }}
        />
        {(prepared || candidates.length > 0 || edit?.has_media) && (
          <div className="review-thumbnails" role="group" aria-label="Image choices">
            {prepared && (
              <Thumbnail
                image={prepared}
                label="Use the prepared image"
                selected={choice.kind === 'prepared'}
                onSelect={() => setChoice({ kind: 'prepared', sha256: prepared.sha256 })}
              />
            )}
            {candidates.map((c, i) => (
              <Thumbnail
                key={c.sha256}
                image={c}
                label={`Use alternative image ${i + 1}`}
                selected={selectedSha === c.sha256 && choice.kind === 'candidate'}
                onSelect={() => setChoice({ kind: 'candidate', sha256: c.sha256 })}
              />
            ))}
            {edit?.has_media && (
              <button
                type="button"
                className="review-thumbnail review-thumbnail-text"
                aria-pressed={choice.kind === 'saved'}
                onClick={() => setChoice({ kind: 'saved' })}
              >
                Saved upload
              </button>
            )}
          </div>
        )}
        {selectedImage.error && (
          <p role="alert">The prepared image is unavailable. Upload a JPEG instead.</p>
        )}
        <p className="studio-note">
          <strong>Alt text:</strong> {altText || 'None prepared. Instagram will use its own.'}
        </p>
        <label className="review-upload">
          Upload a different JPEG
          <input
            type="file"
            accept="image/jpeg"
            disabled={locked}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 900 * 1024 || file.type !== 'image/jpeg') {
                onError('Choose a JPEG under 900 KB.');
                return;
              }
              setUpload(URL.createObjectURL(file));
              setChoice({ kind: 'uploaded', file });
            }}
          />
        </label>
      </div>
      <div className="review-sheet-controls">
        {draft.craft?.angle && (
          <section aria-label="Why this post">
            <h3>Why this post</h3>
            <p>{draft.craft.angle}</p>
            {draft.craft.reader && <p className="studio-note">For: {draft.craft.reader}</p>}
          </section>
        )}
        {score && <p className="review-score">{score}</p>}
        {draft.sources?.length ? (
          <p className="studio-note">Sources: {draft.sources.join(' · ')}</p>
        ) : null}
        <label>
          Caption
          <textarea
            rows={7}
            maxLength={INSTAGRAM_LIMIT}
            value={caption}
            disabled={locked}
            onChange={(e) => setCaption(e.target.value)}
          />
        </label>
        <p className="review-counter" data-over={length > INSTAGRAM_LIMIT || undefined}>
          {length.toLocaleString()} / {INSTAGRAM_LIMIT.toLocaleString()} ·{' '}
          {length <= INSTAGRAM_FOLD
            ? `all of it shows in the feed (${INSTAGRAM_FOLD - length} left before the fold)`
            : `the feed shows the first ${INSTAGRAM_FOLD}, then “more”`}
        </p>
        {draft.craft?.alternatives?.length ? (
          <details>
            <summary>Other caption drafts ({draft.craft.alternatives.length})</summary>
            {draft.craft.alternatives.map((alt, i) => (
              <div key={i} className="review-alternative">
                <p>{alt}</p>
                <button type="button" disabled={locked} onClick={() => setCaption(alt)}>
                  Use caption {i + 1}
                </button>
              </div>
            ))}
          </details>
        ) : null}
        <label>
          Instagram account
          <select
            value={accountId}
            disabled={locked}
            onChange={(e) => setAccountChoice(e.target.value)}
          >
            <option value="">Choose an account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} disabled={a.disabled}>
                {a.profile || a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Publish time
          <select
            value={timeChoice === 'custom' ? 'custom' : String(Number.isNaN(due) ? '' : due)}
            disabled={locked}
            onChange={(e) => {
              setTimeChoice(e.target.value);
              if (e.target.value === 'custom' && !custom) setCustom(localInput(due));
            }}
          >
            {!slots.length && <option value="">No cadence slots available</option>}
            {slots.map((s) => (
              <option key={s.at} value={String(s.at)} disabled={s.taken}>
                {slotLabel(s.at, now, timeZone)}
                {s.taken ? ' · already scheduled' : ''}
              </option>
            ))}
            <option value="custom">Custom time…</option>
          </select>
        </label>
        {timeChoice === 'custom' && (
          <label>
            Custom publish time
            <input
              type="datetime-local"
              value={custom}
              disabled={locked}
              onChange={(e) => setCustom(e.target.value)}
            />
          </label>
        )}
        <p className="studio-note">
          {!Number.isNaN(due) && `Publishes ${relativeTime(due, now)} · `}
          Cadence times in {timeZone}
          {expiry && !Number.isNaN(expiryAt)
            ? ` · Draft ${expiryAt <= now ? 'expired' : 'expires'} ${slotLabel(expiryAt, now, timeZone)}`
            : ''}
        </p>
        {items.length > 0 && (
          <fieldset className="review-checklist">
            <legend>Before you approve</legend>
            {items.map((item, i) => (
              <label key={i}>
                <input
                  type="checkbox"
                  checked={checked[i] || false}
                  disabled={locked}
                  onChange={(e) =>
                    setChecked((current) => current.map((c, j) => (j === i ? e.target.checked : c)))
                  }
                />{' '}
                {item}
              </label>
            ))}
          </fieldset>
        )}
        <details>
          <summary>Evidence & image brief</summary>
          <p className="posting-evidence">{draft.evidence}</p>
          <p>{draft.media.brief}</p>
          {draft.next_check && <p>{draft.next_check}</p>}
        </details>
        {problem && <p className="studio-note">{problem}</p>}
        <div className="posting-card-buttons">
          <button
            type="button"
            className="review-approve"
            disabled={Boolean(problem) || locked}
            aria-label={`Approve & queue ${label}`}
            onClick={() => void approve()}
          >
            {busy === draft.id ? 'Queuing…' : 'Approve & queue'}
          </button>
        </div>
        {decisions?.(checklistState, label)}
      </div>
    </div>
  );
}
