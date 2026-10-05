import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getPostingDashboard,
  getReviewDrafts,
  getSocialDelivery,
  type PostingDashboard,
  type PostingDraft,
  type ReviewDraft,
  type SocialDelivery,
} from '@/lib/api';
import {
  draftPlatform,
  firstLine,
  isExpired,
  laneLabel,
  platformLabel,
  relativeTime,
} from '@/lib/review-queue';
import PostingShell from './PostingShell';
import TextPostCard from './TextPostCard';
import InstagramReview from './InstagramReview';
import { usePreparedImage } from './usePreparedImage';
import '@/styles/review-queue.css';

type Tab = 'instagram' | 'x' | 'bluesky';

function RowThumbnail({ draft }: { draft: PostingDraft }) {
  const { url } = usePreparedImage(draft.media.image?.sha256);
  if (url) return <img className="review-row-thumb" src={url} alt="" />;
  return (
    <span className="review-row-thumb review-row-thumb-empty" aria-hidden="true">
      {draftPlatform(draft) === 'instagram' ? 'IG' : platformLabel(draftPlatform(draft))}
    </span>
  );
}

function ReviewRow({
  draft,
  meta,
  when,
  state,
  expanded,
  onToggle,
  children,
}: {
  draft: PostingDraft;
  meta: string;
  when: string;
  state: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const sheet = `review-sheet-${draft.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  return (
    <li className="review-row" data-expanded={expanded || undefined}>
      <button
        type="button"
        className="review-row-summary"
        aria-expanded={expanded}
        aria-controls={sheet}
        onClick={onToggle}
      >
        <RowThumbnail draft={draft} />
        <span className="review-row-main">
          <span className="review-row-meta">{meta}</span>
          <span className="review-row-text">{firstLine(draft.text)}</span>
        </span>
        <span className="review-row-side">
          <span>{when}</span>
          <span className="review-row-state">{state}</span>
        </span>
      </button>
      {expanded && (
        <div id={sheet} className="review-row-sheet">
          {children}
        </div>
      )}
    </li>
  );
}

export default function AdminPosts() {
  const [data, setData] = useState<PostingDashboard | null>(null);
  const [saved, setSaved] = useState<ReviewDraft[]>([]);
  const [delivery, setDelivery] = useState<SocialDelivery | null>(null);
  const [error, setError] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [revision, setRevision] = useState(0);
  const [account, setAccount] = useState('all');
  const [lane, setLane] = useState('all');
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab: Tab = requested === 'x' || requested === 'bluesky' ? requested : 'instagram';
  const setTab = (next: Tab) =>
    setParams(next === 'instagram' ? {} : { tab: next }, { replace: true });
  const [query, setQuery] = useState('');
  const [includeExpired, setIncludeExpired] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState<string>('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([getPostingDashboard(), getReviewDrafts()])
      .then(([snapshot, edits]) => {
        if (active) {
          setData(snapshot);
          setSaved(edits);
          setError('');
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setData(null);
        }
      });
    getSocialDelivery()
      .then((value) => {
        if (active) {
          setDelivery(value);
          setDeliveryError('');
        }
      })
      .catch((e) => {
        if (active) {
          setDelivery(null);
          setDeliveryError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const expired = (d: { expires_at: string; due_at: string }) => isExpired(d, now);
  const editFor = (id: string) => saved.find((s) => s.draft_id === id);
  const submitted = (id: string) => {
    const edit = editFor(id);
    return Boolean(edit && edit.status !== 'draft');
  };
  const all = data?.drafts || [];
  const counts: Record<Tab, number> = { instagram: 0, x: 0, bluesky: 0 };
  for (const d of all) if (!expired(d) && !submitted(d.id)) counts[draftPlatform(d)] += 1;
  const tabs: Tab[] = ['instagram', 'x', ...(counts.bluesky ? (['bluesky'] as Tab[]) : [])];
  const dueOf = (d: PostingDraft) => new Date(editFor(d.id)?.due_at || d.due_at).valueOf();
  const drafts = all
    .filter(
      (d) =>
        draftPlatform(d) === tab &&
        (includeExpired || !expired(d)) &&
        (account === 'all' || d.account === account) &&
        (tab === 'instagram' || lane === 'all' || d.mode === lane) &&
        `${editFor(d.id)?.caption || d.text} ${d.next_check}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => Number(submitted(a.id)) - Number(submitted(b.id)) || dueOf(a) - dueOf(b));
  const tabAccounts = [
    ...new Set(all.filter((d) => draftPlatform(d) === tab).map((d) => d.account)),
  ];
  const cadence = (name: string) => data?.accounts.find((a) => a.account === name)?.times ?? [];
  function instagramState(d: PostingDraft) {
    const edit = editFor(d.id);
    if (edit && edit.status !== 'draft')
      return edit.status === 'scheduled' ? 'Queued' : 'Check PostyBirb';
    if (expired(d)) return 'Expired';
    if (d.media.image) return 'Image ready';
    return edit?.has_media ? 'Upload saved' : 'Needs image';
  }
  return (
    <PostingShell title="Review posts">
      <div className="posting-review-intro">
        <p>Approve each post at least 24 hours before it publishes. Nothing posts without you.</p>
        <button onClick={() => setRevision((v) => v + 1)} disabled={Boolean(busy)}>
          Refresh drafts
        </button>
        <Link to="/admin/studio">Brand & asset library →</Link>
      </div>
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button onClick={() => setRevision((v) => v + 1)}>Retry connection</button>
        </div>
      )}
      {deliveryError && tab === 'instagram' && <p role="alert">{deliveryError}</p>}
      {notice && (
        <p role="status" className="production-notice">
          {notice}
        </p>
      )}
      {data && (
        <>
          {data.stale && (
            <p role="alert">
              The preparation snapshot is over 24 hours old. Refresh the source before approving.
            </p>
          )}
          <div className="posting-tabs" role="tablist" aria-label="Platform">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setAccount('all');
                  setLane('all');
                  setOpen('');
                }}
              >
                {t === 'instagram' ? 'Instagram' : `${platformLabel(t)} (post via Buffer)`}{' '}
                <span className="posting-tab-count">{counts[t]}</span>
              </button>
            ))}
          </div>
          <ul className="review-list" aria-label={`${platformLabel(tab)} drafts`}>
            {drafts.map((d) => {
              const edit = editFor(d.id);
              const due = dueOf(d);
              const when = Number.isNaN(due) ? '' : relativeTime(due, now);
              if (tab !== 'instagram')
                return (
                  <ReviewRow
                    key={d.id}
                    draft={d}
                    meta={`${d.account} · ${laneLabel(d.mode)}`}
                    when={when}
                    state={expired(d) ? 'Expired' : 'Copy to Buffer'}
                    expanded={open === d.id}
                    onToggle={() => setOpen(open === d.id ? '' : d.id)}
                  >
                    <TextPostCard draft={d} expired={expired(d)} />
                  </ReviewRow>
                );
              return (
                <ReviewRow
                  key={d.id}
                  draft={d}
                  meta={`${d.account} · Instagram`}
                  when={when}
                  state={instagramState(d)}
                  expanded={open === d.id}
                  onToggle={() => setOpen(open === d.id ? '' : d.id)}
                >
                  {submitted(d.id) ? (
                    <p className="studio-note">
                      {edit?.status === 'scheduled'
                        ? 'Queued in PostyBirb. See Scheduled & delivered.'
                        : 'Check PostyBirb to reconcile this submission before retrying.'}
                    </p>
                  ) : (
                    <InstagramReview
                      draft={d}
                      edit={edit}
                      delivery={delivery}
                      times={cadence(d.account)}
                      timeZone={data.timezone}
                      stale={data.stale}
                      now={now}
                      busy={busy}
                      setBusy={setBusy}
                      onError={(message) => setNotice(message)}
                      onApproved={(result) => {
                        setNotice(
                          `Scheduled in PostyBirb · ${result.post_id}. Publication is pending.`,
                        );
                        setOpen('');
                        setRevision((v) => v + 1);
                      }}
                    />
                  )}
                </ReviewRow>
              );
            })}
          </ul>
          {!drafts.length && <p>No drafts match these filters.</p>}
          {tab !== 'instagram' && (
            <p className="studio-note">
              {platformLabel(tab)} drafts are read-only here. Copy the text into Buffer to schedule
              it; nothing on this page posts to {platformLabel(tab)}.
            </p>
          )}
          <details className="posting-filters">
            <summary>Filter and search</summary>
            <label>
              Account
              <select value={account} onChange={(e) => setAccount(e.target.value)}>
                <option value="all">All accounts</option>
                {tabAccounts.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            {tab !== 'instagram' && (
              <label>
                Preparation lane
                <select value={lane} onChange={(e) => setLane(e.target.value)}>
                  <option value="all">All lanes</option>
                  <option value="plan">Weekly</option>
                  <option value="radar">Timely</option>
                </select>
              </label>
            )}
            <label>
              Search copy
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label className="studio-note">
              <input
                type="checkbox"
                checked={includeExpired}
                onChange={(e) => setIncludeExpired(e.target.checked)}
              />{' '}
              Include expired drafts
            </label>
          </details>
        </>
      )}
      {!data && !error && <p role="status">Loading review queue…</p>}
    </PostingShell>
  );
}
