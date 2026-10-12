import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  getDraftDecisions,
  getPostingDashboard,
  getRerolls,
  getReviewDrafts,
  getSocialDelivery,
  getBufferDelivery,
  getBlueskyDelivery,
  type BlueskyDelivery,
  type BufferDelivery,
  type DraftDecision,
  type DraftReroll,
  type PostingDashboard,
  type PostingDraft,
  type ReviewDraft,
  type SocialDelivery,
} from '@/lib/api';
import {
  draftPlatform,
  firstLine,
  hiddenReason,
  favoritedDrafts,
  latestDecisions,
  isExpired,
  laneLabel,
  platformLabel,
  relativeTime,
  rerollLabel,
} from '@/lib/review-queue';
import PostingShell from './PostingShell';
import BlueskyPostReview from './BlueskyPostReview';
import XPostReview from './XPostReview';
import InstagramReview from './InstagramReview';
import DecisionControls from './DecisionControls';
import RerollControls from './RerollControls';
import ReviewRow from './ReviewRow';
import { useReveal } from './useReveal';
import '@/styles/review-queue.css';

type Tab = 'instagram' | 'x' | 'bluesky';

export default function AdminPosts() {
  const [data, setData] = useState<PostingDashboard | null>(null);
  const [bufferDelivery, setBufferDelivery] = useState<BufferDelivery | null>(null);
  const [bufferError, setBufferError] = useState('');
  const [blueskyDelivery, setBlueskyDelivery] = useState<BlueskyDelivery | null>(null);
  const [blueskyError, setBlueskyError] = useState('');
  const [saved, setSaved] = useState<ReviewDraft[]>([]);
  const [delivery, setDelivery] = useState<SocialDelivery | null>(null);
  const [decisions, setDecisions] = useState<DraftDecision[]>([]);
  const [rerolls, setRerolls] = useState<DraftReroll[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [error, setError] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [accountRevision, setAccountRevision] = useState(0);
  const [checkingAccounts, setCheckingAccounts] = useState(false);
  const [revision, setRevision] = useState(0);
  const [account, setAccount] = useState('all');
  const [lane, setLane] = useState('all');
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab: Tab = requested === 'x' || requested === 'bluesky' ? requested : 'instagram';
  const setTab = (next: Tab) =>
    setParams(next === 'instagram' ? {} : { tab: next }, { replace: true });
  // Older links opened a queued post here; queued posts now live on the delivery page.
  const requestedPost = params.get('post') || '';
  const [query, setQuery] = useState('');
  const [includeExpired, setIncludeExpired] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState<string>('');
  const seen = useRef(new Map<number, string>());
  const noticeRef = useReveal<HTMLDivElement>(notice);
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
    // Decisions are feedback; the queue still works if they are unavailable.
    getDraftDecisions(new Date(Date.now() - 60 * 86400000).toISOString())
      .then((value) => {
        if (active) setDecisions(value);
      })
      .catch(() => {
        if (active) setDecisions([]);
      });
    getRerolls()
      .then((value) => {
        if (!active) return;
        setRerolls(value);
        // Report re-rolls that finished since the last poll; open a finished
        // replacement if its original is the open draft.
        for (const r of value) {
          const before = seen.current.get(r.id);
          seen.current.set(r.id, r.status);
          if (!before || before === r.status) continue;
          if (r.status === 'done') {
            setOpen((current) => (current === r.draft_id ? r.result_draft_id : current));
            setNotice(`The re-rolled ${rerollLabel(r.mode)} is ready for review.`);
          } else if (r.status === 'failed') {
            setNotice(`The ${rerollLabel(r.mode)} re-roll failed: ${r.error}`);
          }
        }
      })
      .catch(() => {
        if (active) setRerolls([]);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  useEffect(() => {
    let active = true;
    let pending = false;
    async function refreshAccounts() {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      setCheckingAccounts(true);
      try {
        const value = await getSocialDelivery();
        if (active) {
          setDelivery(value);
          setDeliveryError('');
        }
      } catch (e) {
        if (active) {
          setDelivery(null);
          setDeliveryError(e instanceof Error ? e.message : 'Instagram accounts are unavailable.');
        }
      } finally {
        pending = false;
        if (active) setCheckingAccounts(false);
      }
    }
    void refreshAccounts();
    const refresh = () => void refreshAccounts();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = setInterval(refresh, 60000);
    return () => {
      active = false;
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      clearInterval(timer);
    };
  }, [revision, accountRevision]);
  // Re-rolls run on Kvant; poll while any is open so the replacement appears.
  const rerolling = rerolls.some((r) => r.status === 'pending' || r.status === 'running');
  useEffect(() => {
    if (!rerolling) return;
    const timer = setInterval(() => setRevision((v) => v + 1), 20000);
    return () => clearInterval(timer);
  }, [rerolling]);
  const latestReroll = (id: string) => rerolls.find((r) => r.draft_id === id);
  const rerolledFrom = (id: string) => rerolls.find((r) => r.result_draft_id === id);
  const current = open;
  const toggle = (id: string) => setOpen(current === id ? '' : id);
  useEffect(() => {
    if (tab !== 'x') return;
    let active = true;
    getBufferDelivery()
      .then((result) => {
        if (active) {
          setBufferDelivery(result);
          setBufferError('');
        }
      })
      .catch((error) => {
        if (active) {
          setBufferDelivery(null);
          setBufferError(error.message);
        }
      });
    return () => {
      active = false;
    };
  }, [tab, revision]);
  useEffect(() => {
    let active = true;
    getBlueskyDelivery()
      .then((value) => {
        if (active) {
          setBlueskyDelivery(value);
          setBlueskyError('');
        }
      })
      .catch((e) => {
        if (active) {
          setBlueskyDelivery(null);
          setBlueskyError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, [revision, accountRevision]);
  const blueskyFor = (id: string) => blueskyDelivery?.receipts.find((r) => r.draft_id === id);
  const expired = (d: { expires_at: string; due_at: string }) => isExpired(d, now);
  const bufferFor = (id: string) => bufferDelivery?.receipts.find((r) => r.draft_id === id);
  const editFor = (id: string) => saved.find((s) => s.draft_id === id);
  const submitted = (id: string) => {
    const edit = editFor(id);
    return Boolean((edit && edit.status !== 'draft') || bufferFor(id) || blueskyFor(id));
  };
  const latest = latestDecisions(decisions);
  const favorites = favoritedDrafts(decisions);
  const superseded = new Set(
    (data?.drafts || []).map((d) => d.supersedes).filter((id): id is string => Boolean(id)),
  );
  // A queued post stays editable even if a later draft claims to replace it.
  const hidden = (d: PostingDraft) =>
    submitted(d.id) ? '' : hiddenReason(d, latest, superseded, now);
  const all = (data?.drafts || []).filter((d) => showHidden || !hidden(d));
  const hiddenCount = (data?.drafts || []).filter(
    (d) => draftPlatform(d) === tab && hidden(d) && !expired(d),
  ).length;
  const counts: Record<Tab, number> = { instagram: 0, x: 0, bluesky: 0 };
  for (const d of data?.drafts || [])
    if (!expired(d) && !submitted(d.id) && !hidden(d)) counts[draftPlatform(d)] += 1;
  const tabs: Tab[] = ['instagram', 'x', 'bluesky'];
  const dueOf = (d: PostingDraft) =>
    new Date(
      blueskyFor(d.id)?.due_at || bufferFor(d.id)?.due_at || editFor(d.id)?.due_at || d.due_at,
    ).valueOf();
  const drafts = all
    .filter(
      (d) =>
        draftPlatform(d) === tab &&
        // Approved posts move to Scheduled & delivered, where they stay editable.
        !submitted(d.id) &&
        (includeExpired || !expired(d)) &&
        (account === 'all' || d.account === account) &&
        (tab === 'instagram' || lane === 'all' || d.mode === lane) &&
        `${editFor(d.id)?.caption || d.text} ${d.next_check}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => dueOf(a) - dueOf(b));
  const approvedCount = (data?.drafts || []).filter(
    (d) => draftPlatform(d) === tab && submitted(d.id),
  ).length;
  const tabAccounts = [
    ...new Set(all.filter((d) => draftPlatform(d) === tab).map((d) => d.account)),
  ];
  const cadence = (name: string) => data?.accounts.find((a) => a.account === name)?.times ?? [];
  const recorded = (message: string, keepOpen = false) => {
    setNotice(message);
    if (!keepOpen) setOpen('');
    setRevision((v) => v + 1);
  };
  const hiddenLabel: Record<string, string> = {
    rejected: 'Rejected',
    revision_requested: 'Revision requested',
    snoozed: 'Snoozed',
    superseded: 'Replaced',
  };
  function instagramState(d: PostingDraft) {
    const edit = editFor(d.id);
    const reroll = latestReroll(d.id);
    if (hidden(d)) return hiddenLabel[hidden(d)];
    if (reroll && (reroll.status === 'pending' || reroll.status === 'running'))
      return 'Re-rolling…';
    if (expired(d)) return 'Expired';
    if (d.media.image) return 'Image ready';
    return edit?.has_media ? 'Upload saved' : 'Needs image';
  }
  return (
    <PostingShell
      title="Review posts"
      description="Drafts are prepared in advance. Approve each post for any future time. Nothing posts without you."
      action={
        <>
          {tab === 'instagram' && (
            <button
              type="button"
              className="admin-button"
              onClick={() => setAccountRevision((v) => v + 1)}
              disabled={checkingAccounts || Boolean(busy)}
            >
              {checkingAccounts ? 'Checking Instagram accounts…' : 'Refresh Instagram accounts'}
            </button>
          )}
          <button
            type="button"
            className="admin-button"
            onClick={() => setRevision((v) => v + 1)}
            disabled={Boolean(busy)}
          >
            Refresh drafts
          </button>
        </>
      }
    >
      {requestedPost && (
        <Navigate to={`/admin/posts/delivery?post=${encodeURIComponent(requestedPost)}`} replace />
      )}
      {error && (
        <div role="alert" className="admin-alert admin-alert-error">
          <p>{error}</p>
          <button type="button" className="admin-button" onClick={() => setRevision((v) => v + 1)}>
            Retry connection
          </button>
        </div>
      )}
      {deliveryError && tab === 'instagram' && (
        <p role="alert" className="admin-alert admin-alert-warning">
          {deliveryError}
        </p>
      )}
      <div ref={noticeRef}>
        {notice && (
          <p role="status" className="admin-alert admin-alert-notice">
            {notice}
          </p>
        )}
      </div>
      {data && (
        <>
          {data.stale && (
            <p role="alert" className="admin-alert admin-alert-warning">
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
                {t === 'instagram' ? 'Instagram' : t === 'x' ? 'X' : platformLabel(t)}{' '}
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
                    state={
                      hidden(d)
                        ? hiddenLabel[hidden(d)]
                        : expired(d)
                          ? 'Missed proposed time'
                          : 'Needs approval'
                    }
                    expanded={current === d.id}
                    onToggle={() => toggle(d.id)}
                  >
                    {tab === 'x' ? (
                      <XPostReview
                        key={`${d.id}:${bufferFor(d.id)?.version ?? 0}:${bufferDelivery?.configured ?? false}`}
                        draft={d}
                        delivery={bufferDelivery}
                        receipt={bufferFor(d.id)}
                        now={now}
                        onSaved={() => setRevision((v) => v + 1)}
                      >
                        {!hidden(d) && (
                          <DecisionControls
                            draftId={d.id}
                            label={`${d.account} X post: ${firstLine(d.text, 48)}`}
                            busy={busy}
                            setBusy={setBusy}
                            favorited={favorites.has(d.id)}
                            goodOnly={Boolean(bufferFor(d.id))}
                            onRecorded={recorded}
                          />
                        )}
                      </XPostReview>
                    ) : (
                      <BlueskyPostReview
                        key={`${d.id}:${blueskyDelivery?.checked_at ?? ''}`}
                        draft={d}
                        delivery={blueskyDelivery}
                        now={now}
                        onSaved={() =>
                          recorded('Scheduled in PostyBirb. Bluesky delivery is pending.')
                        }
                      >
                        {!hidden(d) && (
                          <DecisionControls
                            draftId={d.id}
                            label={`${d.account} ${platformLabel(tab)} post: ${firstLine(d.text, 48)}`}
                            busy={busy}
                            setBusy={setBusy}
                            favorited={favorites.has(d.id)}
                            onRecorded={recorded}
                          />
                        )}
                      </BlueskyPostReview>
                    )}
                  </ReviewRow>
                );
              return (
                <ReviewRow
                  key={d.id}
                  draft={d}
                  edit={edit}
                  meta={`${d.account} · Instagram${rerolledFrom(d.id) ? ` · new ${rerollLabel(rerolledFrom(d.id)!.mode)}` : ''}`}
                  when={when}
                  state={instagramState(d)}
                  expanded={current === d.id}
                  onToggle={() => toggle(d.id)}
                >
                  {hidden(d) ? (
                    <p className="studio-note">
                      {hiddenLabel[hidden(d)]}
                      {latest.get(d.id)?.note ? `: ${latest.get(d.id)?.note}` : '.'}
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
                      decisions={(checklist, label) => (
                        <DecisionControls
                          draftId={d.id}
                          label={label}
                          busy={busy}
                          setBusy={setBusy}
                          checklist={checklist}
                          favorited={favorites.has(d.id)}
                          onRecorded={recorded}
                        />
                      )}
                      onSaved={(message) => {
                        setNotice(message);
                        setRevision((v) => v + 1);
                      }}
                      rerolling={['pending', 'running'].includes(latestReroll(d.id)?.status ?? '')}
                      reroll={(keep) => (
                        <RerollControls
                          draftId={d.id}
                          caption={keep.caption}
                          imageSha256={keep.imageSha256}
                          keepsUpload={keep.keepsUpload}
                          active={latestReroll(d.id)}
                          busy={busy}
                          setBusy={setBusy}
                          now={now}
                          onRequested={(r) => {
                            setRerolls((current) => [r, ...current]);
                            setNotice(
                              `Re-rolling the ${rerollLabel(r.mode)}. This draft stays here until the new version arrives.`,
                            );
                          }}
                        />
                      )}
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
          {!drafts.length && (
            <div className="admin-empty">
              No {platformLabel(tab)} drafts waiting for review.
              {approvedCount === 0 && !hiddenCount
                ? ' The preparation jobs add new drafts on their schedule; see Automation.'
                : ''}
            </div>
          )}
          {approvedCount > 0 && (
            <p className="studio-note">
              {approvedCount} approved {platformLabel(tab)}{' '}
              {approvedCount === 1 ? 'post is' : 'posts are'} on{' '}
              <Link to="/admin/posts/delivery">Scheduled &amp; delivered →</Link> where you can
              still edit or reschedule {approvedCount === 1 ? 'it' : 'them'}.
            </p>
          )}
          {(hiddenCount > 0 || showHidden) && (
            <label className="studio-note">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
              />{' '}
              Show {hiddenCount} rejected, snoozed or replaced{' '}
              {hiddenCount === 1 ? 'draft' : 'drafts'}
            </label>
          )}
          {tab === 'x' && (
            <p className="studio-note">
              {bufferError ||
                (bufferDelivery?.configured
                  ? 'Review and approve X posts here to schedule them through Buffer.'
                  : 'Buffer scheduling needs its server connection. You can still copy a draft into Buffer.')}
            </p>
          )}
          {tab === 'bluesky' && (
            <p className="studio-note">
              {blueskyError ||
                (blueskyDelivery?.configured
                  ? 'Review and approve Bluesky posts here to schedule them through PostyBirb.'
                  : 'Bluesky scheduling needs its PostyBirb connection.')}{' '}
              <button
                type="button"
                className="admin-button admin-button-small"
                onClick={() => setAccountRevision((v) => v + 1)}
              >
                Refresh Bluesky accounts
              </button>
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
            {tab === 'bluesky' && (
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
