import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  approvePublication,
  getPublications,
  savePublication,
  type PublicationDraft,
  type Publications,
} from '@/lib/api';
import { stripReviewPrefix } from '@/lib/review-queue';
import PostingShell from './PostingShell';
import { useReveal } from './useReveal';

const DAY = 86400000;
/** Approval and saving need a publish time at least this far ahead. */
const MIN_LEAD = DAY;

function localDate(value: string) {
  const date = new Date(value);
  return new Date(date.valueOf() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/** The same time of day, moved forward whole days until it is far enough ahead to save. */
function nextValidTime(due: number, now: number) {
  let at = due;
  while (at < now + MIN_LEAD + 5 * 60000) at += DAY;
  return at;
}

function timeProblem(due: number, now: number) {
  if (Number.isNaN(due)) return 'Choose a publish time.';
  if (due < now + MIN_LEAD) return 'Choose a publish time at least 24 hours from now.';
  if (due > now + 90 * DAY) return 'Choose a publish time within 90 days.';
  return '';
}

function when(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
export default function PublicationReview({ platform }: { platform: 'website' | 'patreon' }) {
  const [data, setData] = useState<Publications | null>(null);
  const [editing, setEditing] = useState<PublicationDraft | null>(null);
  // The stored time, when opening the editor had to move a missed one forward.
  const [movedFrom, setMovedFrom] = useState('');
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    getPublications()
      .then((d) => {
        if (active) {
          // Older stored editions still begin with the reviewer note; never show or save it.
          setData({
            ...d,
            drafts: d.drafts.map((x) => ({ ...x, body: stripReviewPrefix(x.body) })),
          });
          setError('');
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  async function approve(draft: PublicationDraft) {
    setBusy(draft.id);
    setError('');
    try {
      const result = await approvePublication(draft.id, draft.version);
      setNotice(
        result.status === 'scheduled' && platform === 'website'
          ? 'Scheduled. The article will become public at its approved time.'
          : 'Approved and queued. Delivery is pending.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed');
    } finally {
      setBusy('');
      setRevision((v) => v + 1);
    }
  }
  const messageRef = useReveal<HTMLDivElement>(notice || error);
  const editorRef = useReveal<HTMLElement>(editing?.id, 'start');
  function startEditing(d: PublicationDraft) {
    const due = new Date(d.due_at).valueOf();
    const moved = due < Date.now() + MIN_LEAD;
    setMovedFrom(moved ? d.due_at : '');
    setEditing({
      ...d,
      due_at: moved ? new Date(nextValidTime(due, Date.now())).toISOString() : d.due_at,
    });
    setFormError('');
    setNotice('');
  }
  async function save() {
    if (!editing) return;
    const problem = timeProblem(new Date(editing.due_at).valueOf(), Date.now());
    if (problem) {
      setFormError(problem);
      return;
    }
    setBusy(editing.id);
    setFormError('');
    try {
      await savePublication(editing);
      setEditing(null);
      setNotice(`Saved “${editing.title}”. It is still unapproved; approve it when ready.`);
      setRevision((v) => v + 1);
    } catch (e) {
      // Keep the editor open with the unsaved text; say so next to the button.
      setFormError(
        `Not saved: ${e instanceof Error ? e.message : 'the server refused the change'}. Your edits are still here.`,
      );
    } finally {
      setBusy('');
    }
  }
  const drafts = (data?.drafts ?? [])
    .filter((d) => d.platform === platform)
    .sort((a, b) => b.id.localeCompare(a.id));
  const latestDate = /\d{4}-\d{2}-\d{2}/.exec(drafts[0]?.id ?? '')?.[0] ?? '';
  const latestAge = latestDate
    ? Math.floor((now - new Date(`${latestDate}T12:00:00`).valueOf()) / DAY)
    : null;
  return (
    <PostingShell title={platform === 'website' ? 'Development log' : 'Patreon posts'}>
      <p>
        {platform === 'website'
          ? 'Daily updates prepared from Changemaker. Approve each entry to publish it on the website.'
          : 'Patreon editions prepared from the same verified updates. Review the content, audience and publication time.'}
      </p>
      <p className="studio-note">
        Manual approval · At least 24 hours ahead ·{' '}
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </p>
      <button onClick={() => setRevision((v) => v + 1)}>Refresh drafts</button>
      {platform === 'website' && (
        <p>
          <a href="/development" target="_blank" rel="noreferrer">
            View public Development log ↗
          </a>
        </p>
      )}
      {platform === 'patreon' && data && !data.patreon_connected && (
        <div className="production-notice" role="status">
          <strong>Patreon connection needed</strong>
          <p>
            Draft preparation is available.{' '}
            {data.patreon_connection_reason ||
              'Connect Patreon and verify native scheduling before approving.'}
          </p>
        </div>
      )}
      <div ref={messageRef}>
        {error && <p role="alert">{error}</p>}
        {notice && (
          <p role="status" className="production-notice">
            {notice}
          </p>
        )}
      </div>
      {latestAge !== null && latestAge > 2 && (
        <p className="production-notice" role="alert">
          No new daily draft for {latestAge} days (latest: {latestDate}). The daily preparation job
          may be failing; check its log on Kvant (<code>changemaker-publications.service</code>).
        </p>
      )}
      <div className="posting-review-grid">
        {drafts.map((d) => {
          const due = new Date(d.due_at).valueOf();
          const ready =
            d.status === 'draft' &&
            due >= now + MIN_LEAD &&
            (platform === 'website' ||
              (data?.patreon_connected &&
                data.patreon_audiences?.some((a) => a.value === d.audience)));
          const missed = d.status === 'draft' && due <= now;
          const tooSoon = d.status === 'draft' && !missed && due < now + MIN_LEAD;
          if (editing?.id === d.id)
            return (
              <article
                key={d.id}
                ref={editorRef}
                className="posting-review-card posting-review-card-editing"
              >
                <div className="posting-editor-grid">
                  <form
                    className="social-composer"
                    aria-label="Edit publication draft"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void save();
                    }}
                  >
                    <label>
                      Title
                      <input
                        required
                        value={editing.title}
                        maxLength={300}
                        disabled={Boolean(busy)}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      />
                    </label>
                    <label>
                      Post body
                      <textarea
                        required
                        rows={15}
                        value={editing.body}
                        maxLength={50000}
                        disabled={Boolean(busy)}
                        onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                      />
                    </label>
                    <label>
                      Excerpt
                      <textarea
                        value={editing.excerpt}
                        maxLength={2000}
                        disabled={Boolean(busy)}
                        onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                      />
                    </label>
                    <label>
                      Publish time
                      <input
                        required
                        type="datetime-local"
                        value={localDate(editing.due_at)}
                        disabled={Boolean(busy)}
                        onChange={(e) => {
                          if (e.target.value)
                            setEditing({
                              ...editing,
                              due_at: new Date(e.target.value).toISOString(),
                            });
                        }}
                      />
                    </label>
                    {movedFrom && (
                      <p className="studio-note">
                        The prepared time ({when(movedFrom)}) is past or less than 24 hours away, so
                        this moved it to the same time on {when(editing.due_at)}. Change it if you
                        want.
                      </p>
                    )}
                    {platform === 'patreon' && (
                      <label>
                        Audience
                        <select
                          required
                          value={editing.audience}
                          disabled={Boolean(busy)}
                          onChange={(e) => setEditing({ ...editing, audience: e.target.value })}
                        >
                          <option value="">Choose an audience</option>
                          {data?.patreon_audiences?.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {formError && <p role="alert">{formError}</p>}
                    <div className="posting-card-buttons">
                      <button type="submit" disabled={Boolean(busy)}>
                        {busy === editing.id ? 'Saving…' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => {
                          setEditing(null);
                          setFormError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  <div className="publication-preview">
                    <p className="studio-label">Preview of unsaved edits</p>
                    <h2>{editing.title}</h2>
                    <Markdown remarkPlugins={[remarkGfm]}>{editing.body}</Markdown>
                  </div>
                </div>
              </article>
            );
          return (
            <article key={d.id} className="posting-review-card" data-missed={missed || undefined}>
              <div className="posting-draft-meta">
                <span className="production-badge">
                  {platform === 'website' ? 'Website' : 'Patreon'}
                </span>
                <span>
                  {missed
                    ? 'Missed its publish time'
                    : tooSoon
                      ? 'Too soon to approve'
                      : d.status === 'draft'
                        ? 'Needs approval'
                        : d.status}
                </span>
              </div>
              <div className="publication-preview">
                <h2>{d.title}</h2>
                <Markdown remarkPlugins={[remarkGfm]}>{d.body}</Markdown>
              </div>
              <p>Publish: {when(d.due_at)}</p>
              {platform === 'patreon' && (
                <p>
                  Audience:{' '}
                  {data?.patreon_audiences?.find((a) => a.value === d.audience)?.label ||
                    'Choose in Edit'}
                </p>
              )}
              <details>
                <summary>Source evidence</summary>
                <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {JSON.stringify(d.source, null, 2)}
                </pre>
              </details>
              {d.provider_url && (
                <p>
                  <a href={d.provider_url} target="_blank" rel="noreferrer">
                    {platform === 'patreon' ? 'View on Patreon' : 'View the published entry'} ↗
                  </a>
                </p>
              )}
              <div className="posting-card-buttons">
                <button
                  disabled={!ready || Boolean(busy) || Boolean(editing)}
                  onClick={() => void approve(d)}
                >
                  {busy === d.id ? 'Queuing…' : 'Approve & queue'}
                </button>
                {d.status === 'draft' && (
                  <button disabled={Boolean(busy)} onClick={() => startEditing(d)}>
                    Edit
                  </button>
                )}
              </div>
              {d.status === 'draft' && !ready && (
                <p className="studio-note">
                  {platform === 'patreon' && !data?.patreon_connected
                    ? 'Connect Patreon before approving.'
                    : missed || tooSoon
                      ? 'Open Edit to choose a new time at least 24 hours ahead, then save and approve.'
                      : 'Choose the audience in Edit.'}
                </p>
              )}
            </article>
          );
        })}
      </div>
      {data && !data.drafts.some((d) => d.platform === platform) && (
        <p>
          No daily drafts yet. The daily preparation job will add the next verified update here.
        </p>
      )}
    </PostingShell>
  );
}
