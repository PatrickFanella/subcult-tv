import { useState } from 'react';
import { recordDraftDecision, type ChecklistState } from '@/lib/api';

const REJECT_REASONS: { code: string; label: string }[] = [
  { code: 'off_voice', label: 'Off-voice' },
  { code: 'inaccurate', label: 'Inaccurate' },
  { code: 'boring', label: 'Boring' },
  { code: 'wrong_image', label: 'Wrong image' },
  { code: 'wrong_time', label: 'Wrong time' },
  { code: 'duplicate', label: 'Duplicate' },
  { code: 'other', label: 'Other' },
];

const SNOOZE_DAYS = [1, 3, 7];

type Mode = '' | 'reject' | 'revise' | 'snooze' | 'good';

/**
 * Reject, request a revision, snooze or mark a draft as particularly good. Each
 * choice is recorded as feedback for the drafting pipeline; none of them posts
 * or schedules anything. `goodOnly` shows just the mark, for submitted drafts.
 */
export default function DecisionControls({
  draftId,
  label,
  busy,
  setBusy,
  checklist = [],
  favorited = false,
  goodOnly = false,
  onRecorded,
}: {
  draftId: string;
  /** Short description used to make button names unique, e.g. "patrick post: We gave…". */
  label: string;
  busy: string;
  setBusy: (value: string) => void;
  checklist?: ChecklistState[];
  /** The owner has already marked this draft as good. */
  favorited?: boolean;
  goodOnly?: boolean;
  /** keepOpen is true when the draft stays in the queue after the decision. */
  onRecorded: (message: string, keepOpen?: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [days, setDays] = useState(1);
  const [error, setError] = useState('');
  const locked = Boolean(busy);

  async function submit() {
    setBusy(draftId);
    setError('');
    try {
      if (mode === 'reject') {
        await recordDraftDecision(draftId, { decision: 'rejected', reasons, note, checklist });
        onRecorded('Rejected. The reason is saved for the drafting pipeline.');
      } else if (mode === 'revise') {
        await recordDraftDecision(draftId, { decision: 'revision_requested', note, checklist });
        onRecorded('Revision requested. The draft is hidden until a new version arrives.');
      } else if (mode === 'snooze') {
        const until = new Date(Date.now() + days * 86400000).toISOString();
        await recordDraftDecision(draftId, { decision: 'snoozed', snooze_until: until, checklist });
        onRecorded(`Snoozed for ${days === 1 ? 'a day' : `${days} days`}.`);
      } else if (mode === 'good') {
        await recordDraftDecision(draftId, { decision: 'favorited', note, checklist });
        onRecorded('Marked as a good post. Prompt tuning will learn from it.', true);
      }
      setMode('');
      setReasons([]);
      setNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The decision could not be saved');
    } finally {
      setBusy('');
    }
  }

  const toggle = (next: Mode) => {
    setMode(mode === next ? '' : next);
    setError('');
  };
  const ready =
    mode === 'reject'
      ? reasons.length > 0 || note.trim() !== ''
      : mode === 'revise'
        ? note.trim() !== ''
        : mode === 'snooze' || mode === 'good';

  return (
    <div className="decision-controls">
      <div className="decision-buttons">
        <button
          type="button"
          className="decision-good"
          aria-expanded={mode === 'good'}
          aria-label={favorited ? `${label} is marked as good` : `Mark ${label} as good`}
          disabled={locked || favorited}
          onClick={() => toggle('good')}
        >
          {favorited ? 'Marked good' : 'Good post'}
        </button>
        {!goodOnly && (
          <>
            <button
              type="button"
              aria-expanded={mode === 'reject'}
              aria-label={`Reject ${label}`}
              disabled={locked}
              onClick={() => toggle('reject')}
            >
              Reject
            </button>
            <button
              type="button"
              aria-expanded={mode === 'revise'}
              aria-label={`Request revision of ${label}`}
              disabled={locked}
              onClick={() => toggle('revise')}
            >
              Request revision
            </button>
            <button
              type="button"
              aria-expanded={mode === 'snooze'}
              aria-label={`Snooze ${label}`}
              disabled={locked}
              onClick={() => toggle('snooze')}
            >
              Snooze
            </button>
          </>
        )}
      </div>
      {mode && (
        <form
          className="decision-form"
          aria-label={
            mode === 'reject'
              ? 'Reject draft'
              : mode === 'revise'
                ? 'Request revision'
                : mode === 'good'
                  ? 'Mark as good'
                  : 'Snooze'
          }
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) void submit();
          }}
        >
          {mode === 'reject' && (
            <div className="decision-chips" role="group" aria-label="Reasons">
              {REJECT_REASONS.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  aria-pressed={reasons.includes(r.code)}
                  disabled={locked}
                  onClick={() =>
                    setReasons((current) =>
                      current.includes(r.code)
                        ? current.filter((c) => c !== r.code)
                        : [...current, r.code],
                    )
                  }
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
          {mode !== 'snooze' && (
            <label>
              {mode === 'reject'
                ? 'Note (optional)'
                : mode === 'revise'
                  ? 'What should change?'
                  : 'What works? (optional)'}
              <textarea
                rows={3}
                maxLength={2000}
                value={note}
                disabled={locked}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          )}
          {mode === 'snooze' && (
            <label>
              Snooze for
              <select
                value={days}
                disabled={locked}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                {SNOOZE_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d === 1 ? '1 day' : `${d} days`}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" disabled={!ready || locked}>
            {mode === 'reject'
              ? 'Confirm rejection'
              : mode === 'revise'
                ? 'Send request'
                : mode === 'good'
                  ? 'Save as a good example'
                  : 'Snooze'}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
}
