import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  approveReviewDraft,
  getPostingDashboard,
  getReviewDrafts,
  getSocialDelivery,
  type PostingDashboard,
  type ReviewDraft,
  type SocialDelivery,
} from '@/lib/api';
import { draftPlatform, isExpired, platformLabel } from '@/lib/review-queue';
import PostingShell from './PostingShell';
import PostPreview from './PostPreview';
import TextPostCard from './TextPostCard';
import '@/styles/review-queue.css';

type Tab = 'instagram' | 'x' | 'bluesky';

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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set());
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
  const all = data?.drafts || [];
  const counts: Record<Tab, number> = { instagram: 0, x: 0, bluesky: 0 };
  for (const d of all) if (!expired(d)) counts[draftPlatform(d)] += 1;
  const tabs: Tab[] = ['instagram', 'x', ...(counts.bluesky ? (['bluesky'] as Tab[]) : [])];
  const drafts = all.filter(
    (d) =>
      draftPlatform(d) === tab &&
      (includeExpired || !expired(d)) &&
      (account === 'all' || d.account === account) &&
      (tab === 'instagram' || lane === 'all' || d.mode === lane) &&
      `${saved.find((s) => s.draft_id === d.id)?.caption || d.text} ${d.next_check}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const tabAccounts = [
    ...new Set(all.filter((d) => draftPlatform(d) === tab).map((d) => d.account)),
  ];
  async function approve(draft: ReviewDraft) {
    setBusy(draft.draft_id);
    setNotice('');
    try {
      const result = await approveReviewDraft(draft.draft_id, draft.version);
      setNotice(`Scheduled in PostyBirb · ${result.post_id}. Publication is pending.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Scheduling could not be confirmed');
    } finally {
      setBusy('');
      setRevision((v) => v + 1);
    }
  }
  return (
    <PostingShell title="Review posts">
      <div className="posting-review-intro">
        <p>
          Preview each post, then approve it for the queue. Every post needs your approval and at
          least 24 hours before publication.
        </p>
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
      {deliveryError && <p role="alert">{deliveryError}</p>}
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
                }}
              >
                {t === 'instagram' ? 'Instagram' : `${platformLabel(t)} (post via Buffer)`}{' '}
                <span className="posting-tab-count">{counts[t]}</span>
              </button>
            ))}
          </div>
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
          {tab !== 'instagram' && (
            <p className="studio-note">
              {platformLabel(tab)} drafts are read-only here. Copy the text into Buffer to schedule
              it; nothing on this page posts to {platformLabel(tab)}.
            </p>
          )}
          <div className="posting-review-grid">
            {drafts.map((d) => {
              if (tab !== 'instagram')
                return <TextPostCard key={d.id} draft={d} expired={expired(d)} />;
              const edit = saved.find((s) => s.draft_id === d.id);
              const target = delivery?.accounts.find((a) => a.id === edit?.account_id);
              const caption = edit?.caption || d.text;
              const submitted = edit && edit.status !== 'draft';
              const imageKey = `${d.id}:${edit?.version}`;
              const ready =
                loadedImages.has(imageKey) &&
                edit?.has_media &&
                target &&
                !target.disabled &&
                new Date(edit.due_at).valueOf() >= now + 86400000 &&
                !expired(d) &&
                !data.stale &&
                !submitted;
              return (
                <article key={d.id} className="posting-review-card">
                  <div className="posting-draft-meta">
                    <span className="production-badge">{d.account} / Changemaker · Instagram</span>
                    <span>{submitted ? edit.status : expired(d) ? 'Expired' : 'Unapproved'}</span>
                  </div>
                  <PostPreview
                    key={imageKey}
                    onMediaReady={(loaded) =>
                      setLoadedImages((current) => {
                        const next = new Set(current);
                        if (loaded) next.add(imageKey);
                        else next.delete(imageKey);
                        return next;
                      })
                    }
                    account={target?.profile || target?.name || d.account}
                    caption={caption}
                    draftID={d.id}
                    version={edit?.version}
                    hasMedia={edit?.has_media}
                  />
                  <div className="posting-review-details">
                    <p>
                      <strong>Publish:</strong>{' '}
                      {new Date(edit?.due_at || d.due_at).toLocaleString()} ·{' '}
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                    <details>
                      <summary>Evidence & media requirements</summary>
                      <p>{d.evidence}</p>
                      <p>{d.media.brief}</p>
                      <p>{d.next_check}</p>
                    </details>
                    {!submitted && (
                      <p className="studio-note">
                        {!edit?.has_media
                          ? 'Add an image in Edit before approving.'
                          : !ready
                            ? 'Check the account and choose a time at least 24 hours ahead.'
                            : 'Ready for your approval.'}
                      </p>
                    )}
                    {submitted && (
                      <p className="studio-note">
                        {edit.status === 'scheduled'
                          ? 'Queued in PostyBirb. See Scheduled & delivered.'
                          : 'Check PostyBirb to reconcile this submission before retrying.'}
                      </p>
                    )}
                    <div className="posting-card-buttons">
                      <button
                        disabled={!ready || Boolean(busy)}
                        onClick={() => edit && void approve(edit)}
                      >
                        {busy === d.id ? 'Queuing…' : 'Approve & queue'}
                      </button>
                      {!submitted && (
                        <Link
                          className="posting-edit-link"
                          to={`/admin/posts/edit?draft=${encodeURIComponent(d.id)}`}
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!drafts.length && <p>No drafts match these filters.</p>}
        </>
      )}
      {!data && !error && <p role="status">Loading review queue…</p>}
    </PostingShell>
  );
}
