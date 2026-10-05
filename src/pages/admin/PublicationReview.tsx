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

function localDate(value: string) {
  const date = new Date(value);
  return new Date(date.valueOf() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export default function PublicationReview({ platform }: { platform: 'website' | 'patreon' }) {
  const [data, setData] = useState<Publications | null>(null);
  const [editing, setEditing] = useState<PublicationDraft | null>(null);
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
  async function save() {
    if (!editing) return;
    setBusy(editing.id);
    setError('');
    try {
      await savePublication(editing);
      setEditing(null);
      setNotice('Changes saved. This post remains unapproved.');
      setRevision((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saving failed');
    } finally {
      setBusy('');
    }
  }
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
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {editing && (
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
                    setEditing({ ...editing, due_at: new Date(e.target.value).toISOString() });
                }}
              />
            </label>
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
            <div className="posting-card-buttons">
              <button type="submit" disabled={Boolean(busy)}>
                Save changes
              </button>
              <button type="button" disabled={Boolean(busy)} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
          <div className="publication-preview">
            <h2>{editing.title}</h2>
            <Markdown remarkPlugins={[remarkGfm]}>{editing.body}</Markdown>
          </div>
        </div>
      )}
      <div className="posting-review-grid">
        {data?.drafts
          .filter((d) => d.platform === platform)
          .map((d) => {
            const ready =
              d.status === 'draft' &&
              new Date(d.due_at).valueOf() >= now + 86400000 &&
              (platform === 'website' ||
                (data.patreon_connected &&
                  data.patreon_audiences?.some((a) => a.value === d.audience)));
            return (
              <article key={d.id} className="posting-review-card">
                <div className="posting-draft-meta">
                  <span className="production-badge">
                    {platform === 'website' ? 'Website' : 'Patreon'}
                  </span>
                  <span>{d.status}</span>
                </div>
                <div className="publication-preview">
                  <h2>{d.title}</h2>
                  <Markdown remarkPlugins={[remarkGfm]}>{d.body}</Markdown>
                </div>
                <p>Publish: {new Date(d.due_at).toLocaleString()}</p>
                {platform === 'patreon' && (
                  <p>
                    Audience:{' '}
                    {data.patreon_audiences?.find((a) => a.value === d.audience)?.label ||
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
                      View Patreon receipt ↗
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
                    <button
                      disabled={Boolean(busy)}
                      onClick={() => {
                        setEditing({ ...d });
                        setNotice('');
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
                {d.status === 'draft' && !ready && (
                  <p className="studio-note">
                    {platform === 'patreon' && !data.patreon_connected
                      ? 'Connect Patreon before approving.'
                      : 'Choose the audience and a time at least 24 hours ahead in Edit.'}
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
