import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getDraftDecisions,
  getPostingDashboard,
  getRerolls,
  getReviewDrafts,
  getSocialDelivery,
  getBufferDelivery,
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
  latestDecisions,
  isExpired,
  laneLabel,
  platformLabel,
  relativeTime,
  rerollLabel,
  slotLabel,
} from '@/lib/review-queue';
import PostingShell from './PostingShell';
import TextPostCard from './TextPostCard';
import XPostReview from './XPostReview';
import InstagramReview from './InstagramReview';
import DecisionControls from './DecisionControls';
import QueuedPostEditor from './QueuedPostEditor';
import RerollControls from './RerollControls';
import { usePreparedImage } from './usePreparedImage';
import { useSavedImage } from './useSavedImage';
import '@/styles/review-queue.css';

type Tab = 'instagram' | 'x' | 'bluesky';

function RowThumbnail({ draft, edit }: { draft: PostingDraft; edit?: ReviewDraft }) {
  const saved = useSavedImage(edit?.has_media ? edit.draft_id : undefined, edit?.version);
  const prepared = usePreparedImage(edit?.has_media ? undefined : draft.media.image?.sha256);
  const url = edit?.has_media ? saved.url : prepared.url;
  if (url) return <img className="review-row-thumb" src={url} alt="" />;
  return (
    <span className="review-row-thumb review-row-thumb-empty" aria-hidden="true">
      {draftPlatform(draft) === 'instagram' ? 'IG' : platformLabel(draftPlatform(draft))}
    </span>
  );
}

function ReviewRow({
  draft,
  edit,
  meta,
  when,
  state,
  expanded,
  onToggle,
  children,
}: {
  draft: PostingDraft;
  edit?: ReviewDraft;
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
        <RowThumbnail draft={draft} edit={edit} />
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
  const [bufferDelivery, setBufferDelivery] = useState<BufferDelivery | null>(null);
  const [bufferError, setBufferError] = useState('');
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
  // Links from the delivery history open the queued draft by its PostyBirb ID.
  const requestedPost = params.get('post') || '';
  const [query, setQuery] = useState('');
  const [includeExpired, setIncludeExpired] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState<string>('');
  const seen = useRef(new Map<number, string>());
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
  // A delivery-history link opens its draft until the owner toggles a row.
  const linked = requestedPost
    ? (saved.find((s) => s.post_id === requestedPost)?.draft_id ?? '')
    : '';
  const current = open || linked;
  const toggle = (id: string) => {
    setOpen(current === id ? '' : id);
    if (requestedPost) setParams(tab === 'instagram' ? {} : { tab }, { replace: true });
  };
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
  const expired = (d: { expires_at: string; due_at: string }) => isExpired(d, now);
  const bufferFor = (id: string) => bufferDelivery?.receipts.find((r) => r.draft_id === id);
  const editFor = (id: string) => saved.find((s) => s.draft_id === id);
  const submitted = (id: string) => {
    const edit = editFor(id);
    return Boolean((edit && edit.status !== 'draft') || bufferFor(id));
  };
  const latest = latestDecisions(decisions);
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
  const tabs: Tab[] = ['instagram', 'x', ...(counts.bluesky ? (['bluesky'] as Tab[]) : [])];
  const dueOf = (d: PostingDraft) =>
    new Date(bufferFor(d.id)?.due_at || editFor(d.id)?.due_at || d.due_at).valueOf();
  const drafts = all
    .filter(
      (d) =>
        draftPlatform(d) === tab &&
        (includeExpired || submitted(d.id) || !expired(d)) &&
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
  const recorded = (message: string) => {
    setNotice(message);
    setOpen('');
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
    if (edit && edit.status !== 'draft')
      return edit.status === 'scheduled' ? 'Approved · Scheduled' : 'Check PostyBirb';
    if (expired(d)) return 'Expired';
    if (d.media.image) return 'Image ready';
    return edit?.has_media ? 'Upload saved' : 'Needs image';
  }
  return (
    <PostingShell title="Review posts">
      <div className="posting-review-intro">
        <p>
          Drafts are prepared in advance. Approve each post for any future time. Nothing posts
          without you.
        </p>
        <button onClick={() => setRevision((v) => v + 1)} disabled={Boolean(busy)}>
          Refresh drafts
        </button>
        {tab === 'instagram' && (
          <button
            onClick={() => setAccountRevision((v) => v + 1)}
            disabled={checkingAccounts || Boolean(busy)}
          >
            {checkingAccounts ? 'Checking Instagram accounts…' : 'Refresh Instagram accounts'}
          </button>
        )}
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
                {t === 'instagram'
                  ? 'Instagram'
                  : t === 'x'
                    ? 'X'
                    : `${platformLabel(t)} (post via Buffer)`}{' '}
                <span className="posting-tab-count">{counts[t]}</span>
              </button>
            ))}
          </div>
          <ul className="review-list" aria-label={`${platformLabel(tab)} drafts`}>
            {drafts.map((d) => {
              const edit = editFor(d.id);
              const due = dueOf(d);
              const when = Number.isNaN(due)
                ? ''
                : edit?.status === 'scheduled' || bufferFor(d.id)?.status === 'scheduled'
                  ? slotLabel(due, now, data.timezone)
                  : relativeTime(due, now);
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
                        : bufferFor(d.id)
                          ? bufferFor(d.id)?.status === 'scheduled'
                            ? 'Approved · Scheduled'
                            : 'Check Buffer'
                          : expired(d)
                            ? 'Missed proposed time'
                            : tab === 'x'
                              ? 'Needs approval'
                              : 'Copy to Buffer'
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
                        {!hidden(d) && !bufferFor(d.id) && (
                          <DecisionControls
                            draftId={d.id}
                            label={`${d.account} X post: ${firstLine(d.text, 48)}`}
                            busy={busy}
                            setBusy={setBusy}
                            onRecorded={recorded}
                          />
                        )}
                      </XPostReview>
                    ) : (
                      <TextPostCard draft={d} expired={expired(d)}>
                        {!hidden(d) && (
                          <DecisionControls
                            draftId={d.id}
                            label={`${d.account} ${platformLabel(tab)} post: ${firstLine(d.text, 48)}`}
                            busy={busy}
                            setBusy={setBusy}
                            onRecorded={recorded}
                          />
                        )}
                      </TextPostCard>
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
                  ) : submitted(d.id) && edit?.status === 'scheduled' && edit.post_id ? (
                    <QueuedPostEditor
                      key={`${d.id}:${edit.version}`}
                      draftId={d.id}
                      account={d.account}
                      edit={edit}
                      delivery={delivery}
                      times={cadence(d.account)}
                      timeZone={data.timezone}
                      now={now}
                      busy={busy}
                      setBusy={setBusy}
                      onError={(message) => setNotice(message)}
                      onSaved={(message) => {
                        setNotice(message);
                        setRevision((v) => v + 1);
                      }}
                    />
                  ) : submitted(d.id) ? (
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
                      decisions={(checklist, label) => (
                        <DecisionControls
                          draftId={d.id}
                          label={label}
                          busy={busy}
                          setBusy={setBusy}
                          checklist={checklist}
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
          {!drafts.length && <p>No drafts match these filters.</p>}
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
            {tab === 'x' && (
              <p className="studio-note">
                {bufferError ||
                  (bufferDelivery?.configured
                    ? 'Review and approve X posts here to schedule them through Buffer.'
                    : 'Buffer scheduling needs its server connection. You can still copy a draft into Buffer.')}
              </p>
            )}
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
