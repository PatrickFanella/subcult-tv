import { useState, type ReactNode } from 'react';
import type { PostingDraft } from '@/lib/api';
import { draftPlatform, laneLabel, X_LIMIT, xLength } from '@/lib/review-queue';

const BLUESKY_LIMIT = 300;

/** Text preview shared by X scheduling and manual Bluesky review. */
export default function TextPostCard({
  draft,
  expired,
  children,
  scheduling = false,
  scheduled = false,
}: {
  draft: PostingDraft;
  expired: boolean;
  children?: ReactNode;
  scheduling?: boolean;
  scheduled?: boolean;
}) {
  const platform = draftPlatform(draft);
  const limit = platform === 'bluesky' ? BLUESKY_LIMIT : X_LIMIT;
  const length = platform === 'bluesky' ? [...draft.text].length : xLength(draft.text);
  const over = length > limit;
  const [copied, setCopied] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(draft.text);
      setCopied('Copied. Paste it into Buffer.');
    } catch {
      setCopied('Copy failed. Select the text and copy it manually.');
    }
  }
  const service = platform === 'bluesky' ? 'Bluesky' : 'X';
  return (
    <article className="posting-review-card text-post-card" aria-label={`${service} draft`}>
      <div className="posting-draft-meta">
        <span className="production-badge">
          {draft.account} / {service} · {laneLabel(draft.mode)}
        </span>
        <span>{scheduled ? 'Approved · Scheduled' : expired ? 'Expired' : 'Post via Buffer'}</span>
      </div>
      <div className="x-preview" aria-label={`${service} preview for ${draft.account}`}>
        <div className="x-preview-header">
          <span className="x-avatar" aria-hidden="true">
            {draft.account.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{draft.account}</strong> <small>@{draft.account}</small>
          </span>
        </div>
        <p className="x-preview-text">{draft.text}</p>
        <div className="x-meter" data-over={over || undefined}>
          <meter min={0} max={limit} high={limit - 20} optimum={0} value={Math.min(length, limit)}>
            {length} of {limit}
          </meter>
          <span>
            {length} / {limit}
            {over ? ` · ${length - limit} over the ${service} limit` : ''}
          </span>
        </div>
      </div>
      <p className="studio-note">
        {scheduled ? 'Scheduled' : 'Proposed'}: {new Date(draft.due_at).toLocaleString()} ·{' '}
        {scheduled
          ? 'Edit the schedule below.'
          : scheduling
            ? 'Schedule below after approving.'
            : 'Copy into Buffer to schedule.'}
      </p>
      {draft.craft?.angle && (
        <p>
          <strong>Why this post:</strong> {draft.craft.angle}
        </p>
      )}
      {draft.next_check && (
        <p className="studio-note">
          <strong>Check first:</strong> {draft.next_check}
        </p>
      )}
      <details>
        <summary>Evidence & sources</summary>
        {draft.sources?.length ? (
          <ul>
            {draft.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : null}
        <p className="posting-evidence">{draft.evidence}</p>
      </details>
      <div className="posting-card-buttons">
        <button
          type="button"
          onClick={() => void copy()}
          aria-label={`Copy ${service} text for ${draft.account}: ${draft.text.slice(0, 40)}`}
        >
          Copy text
        </button>
        {children}
      </div>
      {copied && <p role="status">{copied}</p>}
    </article>
  );
}
