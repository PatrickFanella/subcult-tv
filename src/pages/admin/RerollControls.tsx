import { useState } from 'react';
import { requestReroll, type DraftReroll, type RerollMode } from '@/lib/api';
import { relativeTime, rerollLabel } from '@/lib/review-queue';

const MODES: { mode: RerollMode; label: string; hint: string }[] = [
  { mode: 'text', label: 'New caption', hint: 'Keeps the selected prepared image.' },
  { mode: 'image', label: 'New image', hint: 'Keeps the caption as it is in the editor.' },
  { mode: 'both', label: 'New caption and image', hint: 'Same story, fresh post.' },
];

/**
 * Ask Kvant to regenerate one Instagram draft around the same story. The
 * replacement arrives as a new draft and the current one is hidden; nothing
 * is approved or scheduled.
 */
export default function RerollControls({
  draftId,
  caption,
  imageSha256,
  keepsUpload,
  active,
  busy,
  setBusy,
  now,
  onRequested,
}: {
  draftId: string;
  /** The caption currently in the editor, kept by an image re-roll. */
  caption: string;
  /** The selected prepared image, kept by a caption re-roll. */
  imageSha256?: string;
  /** The owner selected an upload, which a caption re-roll cannot keep. */
  keepsUpload: boolean;
  /** The latest request for this draft, if any. */
  active?: DraftReroll;
  busy: string;
  setBusy: (value: string) => void;
  now: number;
  onRequested: (reroll: DraftReroll) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RerollMode>('text');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const locked = Boolean(busy);
  const running = active && (active.status === 'pending' || active.status === 'running');

  async function submit() {
    setBusy(draftId);
    setError('');
    try {
      const result = await requestReroll(draftId, {
        mode,
        note: note.trim(),
        caption: mode === 'image' ? caption : undefined,
        image_sha256: mode === 'text' ? imageSha256 : undefined,
      });
      setOpen(false);
      setNote('');
      onRequested(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The re-roll could not be queued');
    } finally {
      setBusy('');
    }
  }

  if (running)
    return (
      <p role="status" className="reroll-status">
        Regenerating the {rerollLabel(active.mode)} · requested{' '}
        {relativeTime(new Date(active.requested_at).valueOf(), now)}. The new version replaces this
        draft when it is ready, usually within a few minutes.
      </p>
    );

  return (
    <div className="reroll-controls">
      {active?.status === 'failed' && (
        <p role="alert">
          The last {rerollLabel(active.mode)} re-roll failed: {active.error}
        </p>
      )}
      <button
        type="button"
        aria-expanded={open}
        disabled={locked}
        onClick={() => {
          setOpen(!open);
          setError('');
        }}
      >
        Re-roll…
      </button>
      {open && (
        <form
          className="decision-form"
          aria-label="Re-roll this draft"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <fieldset className="reroll-modes">
            <legend>Keep the idea, regenerate</legend>
            {MODES.map((m) => (
              <label key={m.mode}>
                <input
                  type="radio"
                  name={`reroll-${draftId}`}
                  value={m.mode}
                  checked={mode === m.mode}
                  disabled={locked}
                  onChange={() => setMode(m.mode)}
                />{' '}
                <span>
                  {m.label}
                  <small>{m.hint}</small>
                </span>
              </label>
            ))}
          </fieldset>
          {mode === 'text' && keepsUpload && (
            <p className="studio-note">
              Your uploaded image stays here; the new caption is written against the prepared image.
              Select your upload again on the new draft.
            </p>
          )}
          <label>
            Direction (optional)
            <textarea
              rows={2}
              maxLength={2000}
              value={note}
              disabled={locked}
              placeholder="e.g. warmer opening, shorter, show the phone instead of a type card"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button type="submit" disabled={locked}>
            {busy === draftId ? 'Queuing…' : `Re-roll ${rerollLabel(mode)}`}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
}
