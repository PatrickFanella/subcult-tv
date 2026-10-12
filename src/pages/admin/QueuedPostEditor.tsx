import { useEffect, useMemo, useState } from 'react';
import { editScheduledDraft, type ReviewDraft, type SocialDelivery } from '@/lib/api';
import {
  cadenceSlots,
  INSTAGRAM_FOLD,
  INSTAGRAM_LIMIT,
  leadProblem,
  slotLabel,
} from '@/lib/review-queue';
import PostPreview from './PostPreview';

/** Value for a datetime-local input in the browser's zone. */
function localInput(at: number) {
  if (Number.isNaN(at)) return '';
  const date = new Date(at);
  return new Date(at - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/**
 * Edit or reschedule an Instagram post that is already queued in PostyBirb.
 * A new time moves the queued post; a new caption or image withdraws it and
 * queues a replacement. The server refuses once PostyBirb has started posting.
 */
export default function QueuedPostEditor({
  draftId,
  account,
  edit,
  delivery,
  times,
  timeZone,
  now,
  failed = false,
  busy,
  setBusy,
  onSaved,
  onError,
}: {
  draftId: string;
  /** The drafting account name, shown when PostyBirb's profile name is unavailable. */
  account: string;
  edit: ReviewDraft;
  delivery: SocialDelivery | null;
  times: string[];
  timeZone: string;
  now: number;
  failed?: boolean;
  busy: string;
  setBusy: (value: string) => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const locked = Boolean(busy);
  const savedDue = new Date(edit.due_at).valueOf();
  const [caption, setCaption] = useState(edit.caption);
  const [timeChoice, setTimeChoice] = useState(failed ? 'custom' : 'current');
  const [custom, setCustom] = useState(() => localInput(failed ? now + 60 * 60000 : savedDue));
  const [file, setFile] = useState<File | null>(null);
  const [upload, setUpload] = useState('');
  useEffect(
    () => () => {
      if (upload) URL.revokeObjectURL(upload);
    },
    [upload],
  );
  const taken = useMemo(
    () =>
      (delivery?.posts ?? [])
        .filter((p) => p.integration.id === edit.account_id && p.id !== edit.post_id)
        .map((p) => new Date(p.publishDate).valueOf()),
    [delivery, edit.account_id, edit.post_id],
  );
  const slots = useMemo(
    () => cadenceSlots(times, timeZone, now, taken),
    [times, timeZone, now, taken],
  );
  const due =
    timeChoice === 'current'
      ? savedDue
      : timeChoice === 'custom'
        ? new Date(custom).valueOf()
        : Number(timeChoice);
  const target = delivery?.accounts.find((a) => a.id === edit.account_id);
  const length = [...caption].length;
  const textChanged = caption.trim() !== edit.caption.trim();
  const timeChanged = Math.floor(due / 1000) !== Math.floor(savedDue / 1000);
  const changed = failed || textChanged || timeChanged || Boolean(file);
  const problem =
    !caption.trim() || length > INSTAGRAM_LIMIT
      ? 'Write a caption up to 2,200 characters.'
      : leadProblem(due, now);
  const replaces = textChanged || Boolean(file);

  async function save(retryNow = false) {
    setBusy(draftId);
    onError('');
    try {
      const form = new FormData();
      form.set('version', String(edit.version));
      if (failed) form.set('action', retryNow ? 'retry_now' : 'reschedule_failed');
      form.set('account_id', edit.account_id);
      form.set('caption', retryNow ? edit.caption : caption);
      form.set('due_at', new Date(retryNow ? Date.now() : due).toISOString());
      if (file && !retryNow) form.set('media', file);
      const result = await editScheduledDraft(draftId, form);
      onSaved(
        failed
          ? retryNow
            ? `Retry started in PostyBirb · ${result.post_id}. Delivery is pending.`
            : `Rescheduled for ${slotLabel(due, now, timeZone)}. The failed post stays in history.`
          : result.replaced
            ? `Replaced in PostyBirb · ${result.post_id}. The old queued post was withdrawn.`
            : `Moved to ${slotLabel(due, now, timeZone)}.`,
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : 'The change could not be saved');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="review-sheet">
      <div className="review-sheet-preview">
        <PostPreview
          account={target?.profile || target?.name || account}
          caption={caption}
          image={upload || undefined}
          draftID={upload ? undefined : draftId}
          version={edit.version}
          hasMedia={edit.has_media}
          showFold
        />
        <label className="review-upload">
          Replace the image (JPEG)
          <input
            type="file"
            accept="image/jpeg"
            disabled={locked}
            onChange={(e) => {
              const next = e.target.files?.[0];
              if (!next) return;
              if (next.size > 900 * 1024 || next.type !== 'image/jpeg') {
                onError('Choose a JPEG under 900 KB.');
                return;
              }
              setUpload(URL.createObjectURL(next));
              setFile(next);
            }}
          />
        </label>
        {file && (
          <button
            type="button"
            disabled={locked}
            onClick={() => {
              setFile(null);
              setUpload('');
            }}
          >
            Keep the approved image
          </button>
        )}
      </div>
      <div className="review-sheet-controls">
        <p className="studio-note">
          {failed
            ? `Failed in PostyBirb · originally due ${slotLabel(savedDue, now, timeZone)}.`
            : `Approved · Scheduled in PostyBirb · publishes ${slotLabel(savedDue, now, timeZone)}.`}
        </p>
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
            ? 'all of it shows in the feed'
            : `the feed shows the first ${INSTAGRAM_FOLD}, then “more”`}
        </p>
        <label>
          Publish time
          <select
            value={timeChoice}
            disabled={locked}
            onChange={(e) => {
              setTimeChoice(e.target.value);
              if (e.target.value === 'custom' && !custom) setCustom(localInput(savedDue));
            }}
          >
            {!failed && <option value="current">Keep {slotLabel(savedDue, now, timeZone)}</option>}
            {slots.map((s) => (
              <option key={s.at} value={String(s.at)} disabled={s.taken || s.at === savedDue}>
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
          {failed
            ? 'Retry now sends the approved caption and image immediately. Save & reschedule approves the edits shown here for the selected time.'
            : replaces
              ? 'Saving withdraws the queued post from PostyBirb and queues the edited version in its place.'
              : 'A new time moves the queued post; the caption and image stay as approved.'}{' '}
          Choose a future publish time within 90 days.
        </p>
        {changed && problem && <p className="studio-note">{problem}</p>}
        {failed && target?.disabled && (
          <p className="studio-note">
            Reconnect this Instagram account in PostyBirb before retrying.
          </p>
        )}
        <div className="posting-card-buttons">
          {failed && (
            <button
              type="button"
              disabled={locked || !target || target.disabled}
              onClick={() => void save(true)}
            >
              {busy === draftId ? 'Submitting…' : 'Retry now'}
            </button>
          )}
          <button
            type="button"
            className="review-approve"
            disabled={
              !changed || Boolean(problem) || locked || (failed && (!target || target.disabled))
            }
            onClick={() => void save()}
          >
            {busy === draftId
              ? 'Saving…'
              : failed
                ? 'Save & reschedule'
                : replaces
                  ? 'Save & requeue'
                  : 'Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
