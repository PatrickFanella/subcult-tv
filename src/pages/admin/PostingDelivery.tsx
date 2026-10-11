import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getBlueskyDelivery,
  type BlueskyDelivery,
  getBufferDelivery,
  getBufferHistory,
  getDraftDecisions,
  getPostingDashboard,
  getReviewDrafts,
  getSocialDelivery,
  type BufferDelivery,
  type BufferHistory,
  type DraftDecision,
  type PostingDashboard,
  type PostingDraft,
  type PostingPlatform,
  type ReviewDraft,
  type SocialDelivery as Delivery,
} from '@/lib/api';
import { favoritedDrafts, firstLine, metricSummary, slotLabel } from '@/lib/review-queue';
import PostingShell from './PostingShell';
import ReviewRow from './ReviewRow';
import QueuedPostEditor from './QueuedPostEditor';
import XPostReview from './XPostReview';
import DecisionControls from './DecisionControls';
import SocialDelivery from './SocialDelivery';
import { useReveal } from './useReveal';
import '@/styles/review-queue.css';

/** A stand-in when the preparation snapshot no longer carries the approved draft. */
function standIn(
  id: string,
  platform: PostingPlatform,
  account: string,
  text: string,
  due: string,
): PostingDraft {
  return {
    id,
    run_id: '',
    mode: platform === 'instagram' ? 'changemaker' : 'plan',
    platform,
    week: '',
    account,
    text,
    due_at: due,
    expires_at: '',
    evidence: '',
    next_check: '',
    approval: 'unapproved',
    media: { mode: '', asset_ids: [], alt_text: '', brief: '' },
  };
}

interface Item {
  key: string;
  draft: PostingDraft;
  edit?: ReviewDraft;
  due: number;
  meta: string;
  state: string;
  /** Missed, failed or unconfirmed: shown first, in red. */
  attention: boolean;
  postId: string;
  sheet: ReactNode;
}

export default function PostingDelivery() {
  const [posting, setPosting] = useState<PostingDashboard | null>(null);
  const [saved, setSaved] = useState<ReviewDraft[]>([]);
  const [buffer, setBuffer] = useState<BufferDelivery | null>(null);
  const [history, setHistory] = useState<BufferHistory | null>(null);
  const [bluesky, setBluesky] = useState<BlueskyDelivery | null>(null);
  const [social, setSocial] = useState<Delivery | null>(null);
  const [decisions, setDecisions] = useState<DraftDecision[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [refreshBuffer, setRefreshBuffer] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState('');
  const [params, setParams] = useSearchParams();
  const [now, setNow] = useState(() => Date.now());
  const noticeRef = useReveal<HTMLDivElement>(notice);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getPostingDashboard(),
      getReviewDrafts(),
      getBufferDelivery(),
      getBufferHistory(refreshBuffer),
      getSocialDelivery(),
      getBlueskyDelivery(),
      getDraftDecisions(new Date(Date.now() - 60 * 86400000).toISOString()),
    ]).then(([p, r, b, h, s, sky, d]) => {
      if (!active) return;
      setPosting(p.status === 'fulfilled' ? p.value : null);
      setSaved(r.status === 'fulfilled' ? r.value : []);
      setBuffer(b.status === 'fulfilled' ? b.value : null);
      setHistory(h.status === 'fulfilled' ? h.value : null);
      setSocial(s.status === 'fulfilled' ? s.value : null);
      setBluesky(sky.status === 'fulfilled' ? sky.value : null);
      setDecisions(d.status === 'fulfilled' ? d.value : []);
      const names = [
        'Preparation',
        'Instagram approvals',
        'Buffer',
        'Buffer history',
        'PostyBirb',
        'Bluesky',
      ];
      setErrors(
        [p, r, b, h, s, sky].flatMap((result, i) =>
          result.status === 'rejected'
            ? [
                `${names[i]}: ${result.reason instanceof Error ? result.reason.message : 'unavailable'}`,
              ]
            : [],
        ),
      );
      setNow(Date.now());
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [revision, refreshBuffer]);

  const timeZone = posting?.timezone || 'America/Chicago';
  const favorites = favoritedDrafts(decisions);
  const draftById = (id: string) => posting?.drafts.find((d) => d.id === id);
  const cadence = (name: string) => posting?.accounts.find((a) => a.account === name)?.times ?? [];
  const channelName = (id: string) => buffer?.channels.find((c) => c.id === id)?.name || 'X';
  const saveDone = (message: string) => {
    setNotice(message);
    setRevision((v) => v + 1);
  };
  const goodPost = (draft: PostingDraft, label: string) => (
    <DecisionControls
      draftId={draft.id}
      label={label}
      busy={busy}
      setBusy={setBusy}
      favorited={favorites.has(draft.id)}
      goodOnly
      onRecorded={(message) => saveDone(message)}
    />
  );

  const items: Item[] = [];
  for (const edit of saved.filter((s) => s.status !== 'draft')) {
    const account =
      social?.accounts.find((a) => a.id === edit.account_id)?.profile ||
      draftById(edit.draft_id)?.account ||
      'Instagram';
    const draft =
      draftById(edit.draft_id) ??
      standIn(edit.draft_id, 'instagram', account, edit.caption, edit.due_at);
    const due = new Date(edit.due_at).valueOf();
    const post = social?.posts.find((p) => p.id === edit.post_id);
    if (post?.state === 'PUBLISHED') continue;
    // Older than PostyBirb's 30-day history window: long since delivered.
    if (!post && social && due < now - 30 * 86400000) continue;
    const failed = post?.state === 'ERROR';
    const overdue = edit.status === 'scheduled' && due < now - 15 * 60000;
    const unconfirmed = edit.status !== 'scheduled';
    const attention = failed || overdue || unconfirmed;
    items.push({
      key: `ig:${edit.draft_id}`,
      draft: { ...draft, text: edit.caption },
      edit,
      due,
      meta: `${draft.account} · Instagram`,
      state: failed
        ? 'Failed in PostyBirb'
        : unconfirmed
          ? 'Check PostyBirb'
          : overdue
            ? 'Overdue: not published'
            : 'Scheduled',
      attention,
      postId: edit.post_id,
      sheet:
        edit.status === 'scheduled' && edit.post_id && (!attention || failed) ? (
          <>
            <QueuedPostEditor
              key={`${edit.draft_id}:${edit.version}`}
              draftId={edit.draft_id}
              account={draft.account}
              edit={edit}
              delivery={social}
              times={cadence(draft.account)}
              timeZone={timeZone}
              now={now}
              failed={failed}
              busy={busy}
              setBusy={setBusy}
              onError={setNotice}
              onSaved={saveDone}
            />
            {goodPost(draft, `${draft.account} Instagram post: ${firstLine(edit.caption, 48)}`)}
          </>
        ) : (
          <p className="studio-note">
            {failed
              ? 'PostyBirb reports this post failed. Open PostyBirb to see the reason and retry or cancel it there.'
              : unconfirmed
                ? 'The approval reached PostyBirb but was never confirmed. Check PostyBirb before approving it again, so it does not post twice.'
                : 'The publish time passed and PostyBirb has not reported it published. Check PostyBirb.'}{' '}
            <a href="https://postybirb.subcult.tv" target="_blank" rel="noreferrer">
              Open PostyBirb ↗
            </a>
          </p>
        ),
    });
  }
  for (const receipt of bluesky?.receipts ?? []) {
    const post = bluesky?.posts.find((p) => p.id === receipt.post_id);
    if (post?.state === 'PUBLISHED') continue;
    const due = new Date(receipt.due_at).valueOf();
    const account =
      bluesky?.accounts.find((a) => a.id === receipt.account_id)?.profile || 'Bluesky';
    const draft =
      draftById(receipt.draft_id) ??
      standIn(receipt.draft_id, 'bluesky', account, receipt.caption, receipt.due_at);
    const failed = post?.state === 'ERROR';
    const overdue = receipt.status === 'scheduled' && due < now - 15 * 60000;
    const unconfirmed = receipt.status !== 'scheduled';
    items.push({
      key: `bluesky:${receipt.draft_id}`,
      draft: { ...draft, text: receipt.caption },
      due,
      meta: `${account} · Bluesky`,
      state: failed
        ? 'Failed in PostyBirb'
        : unconfirmed
          ? 'Check PostyBirb'
          : overdue
            ? 'Overdue: not published'
            : 'Scheduled',
      attention: failed || overdue || unconfirmed,
      postId: receipt.post_id,
      sheet: (
        <>
          <p>{receipt.caption}</p>
          {receipt.has_media && <p className="studio-note">Image alt text: {receipt.alt_text}</p>}
          <p className="studio-note">
            {failed
              ? 'PostyBirb reports delivery failed.'
              : unconfirmed
                ? 'PostyBirb did not confirm this submission. Check it before retrying.'
                : 'Manage this Bluesky schedule in PostyBirb.'}{' '}
            <a href="https://postybirb.subcult.tv" target="_blank" rel="noreferrer">
              Open PostyBirb ↗
            </a>
          </p>
          {goodPost(draft, `${account} Bluesky post: ${firstLine(receipt.caption, 48)}`)}
        </>
      ),
    });
  }
  const historyById = new Map((history?.posts ?? []).map((p) => [p.id, p]));
  const receiptPosts = new Set<string>();
  for (const receipt of buffer?.receipts ?? []) {
    receiptPosts.add(receipt.post_id);
    const sent = historyById.get(receipt.post_id);
    if (sent?.status === 'sent') continue;
    const due = new Date(receipt.due_at).valueOf();
    // Older than Buffer's 30-day history window: long since delivered.
    if (!sent && history && due < now - 30 * 86400000) continue;
    const draft =
      draftById(receipt.draft_id) ??
      standIn(
        receipt.draft_id,
        'x',
        channelName(receipt.channel_id),
        receipt.caption,
        receipt.due_at,
      );
    const failed = sent?.status === 'error';
    const overdue = Boolean(history) && receipt.status === 'scheduled' && due < now - 15 * 60000;
    const unconfirmed = receipt.status !== 'scheduled';
    const attention = failed || overdue || unconfirmed;
    items.push({
      key: `x:${receipt.draft_id}`,
      draft: { ...draft, text: receipt.caption, replies: receipt.replies ?? [] },
      due,
      meta: `${channelName(receipt.channel_id)} · X${receipt.replies?.length ? ` · thread of ${receipt.replies.length + 1}` : ''}`,
      state: failed
        ? 'Failed in Buffer'
        : unconfirmed
          ? 'Check Buffer'
          : overdue
            ? 'Overdue: not sent'
            : 'Scheduled',
      attention,
      postId: receipt.post_id,
      sheet: attention ? (
        <p className="studio-note">
          {failed
            ? `Buffer could not send this post${sent?.error?.message ? `: ${sent.error.message}` : '.'}`
            : unconfirmed
              ? 'Buffer never confirmed this approval. Check Buffer before approving it again, so it does not post twice.'
              : 'The publish time passed and Buffer has not reported it sent.'}{' '}
          <a href="https://publish.buffer.com" target="_blank" rel="noreferrer">
            Open Buffer ↗
          </a>
        </p>
      ) : (
        <XPostReview
          key={`${receipt.draft_id}:${receipt.version}`}
          draft={{ ...draft, replies: receipt.replies ?? [] }}
          delivery={buffer}
          receipt={receipt}
          now={now}
          onSaved={() => saveDone('Saved. Buffer has the new text and time.')}
        >
          {goodPost(draft, `${draft.account} X post: ${firstLine(receipt.caption, 48)}`)}
        </XPostReview>
      ),
    });
  }
  // Buffer failures for posts scheduled outside this admin.
  const otherFailures = (history?.posts ?? []).filter(
    (p) => p.status === 'error' && !receiptPosts.has(p.id),
  );
  const attention = items.filter((i) => i.attention).sort((a, b) => a.due - b.due);
  const upcoming = items.filter((i) => !i.attention).sort((a, b) => a.due - b.due);
  const days = new Map<string, Item[]>();
  for (const item of upcoming) {
    const day = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date(item.due));
    days.set(day, [...(days.get(day) ?? []), item]);
  }
  const sentX = (history?.posts ?? [])
    .filter((p) => p.status === 'sent')
    .sort(
      (a, b) => new Date(b.sentAt || b.dueAt).valueOf() - new Date(a.sentAt || a.dueAt).valueOf(),
    );

  // A history link (?post=<provider id>) opens that row until another is toggled.
  const linked = items.find((i) => i.postId && i.postId === params.get('post'))?.key ?? '';
  const current = open || linked;
  const toggle = (key: string) => {
    setOpen(current === key ? '' : key);
    if (params.get('post')) setParams({}, { replace: true });
  };
  const row = (item: Item) => (
    <ReviewRow
      key={item.key}
      draft={item.draft}
      edit={item.edit}
      meta={item.meta}
      when={Number.isNaN(item.due) ? '' : slotLabel(item.due, now, timeZone)}
      state={item.state}
      attention={item.attention}
      expanded={current === item.key}
      onToggle={() => toggle(item.key)}
    >
      {item.sheet}
    </ReviewRow>
  );

  return (
    <PostingShell
      title="Scheduled & delivered"
      description="Approved posts live here until they go out. Open one to change its text, image or time."
      action={
        <button
          type="button"
          className="admin-button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setRefreshBuffer(true);
            setRevision((v) => v + 1);
          }}
        >
          {loading ? 'Checking Buffer and PostyBirb…' : 'Refresh'}
        </button>
      }
    >
      <div ref={noticeRef}>
        {notice && (
          <p role="status" className="admin-alert admin-alert-notice">
            {notice}
          </p>
        )}
      </div>
      {errors.length > 0 && (
        <div className="admin-alert admin-alert-warning" role="alert">
          <strong>Some sources could not be checked.</strong>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {(attention.length > 0 || otherFailures.length > 0) && (
        <section className="posting-section">
          <h2>Missed or failed ({attention.length + otherFailures.length})</h2>
          <ul className="review-list">{attention.map(row)}</ul>
          {otherFailures.length > 0 && (
            <ul className="posting-checks">
              {otherFailures.map((p) => (
                <li key={p.id}>
                  {channelName(p.channelId)} ·{' '}
                  {slotLabel(new Date(p.dueAt).valueOf(), now, timeZone)} · “{firstLine(p.text, 60)}
                  ” — {p.error?.message || 'Buffer could not send it.'}{' '}
                  <a href="https://publish.buffer.com" target="_blank" rel="noreferrer">
                    Open Buffer ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      <section className="posting-section">
        <h2>Coming up</h2>
        {!loading && upcoming.length === 0 && (
          <div className="admin-empty">Nothing scheduled. Approve posts on the Review page.</div>
        )}
        {[...days].map(([day, list]) => (
          <div key={day}>
            <h3 className="timeline-day">{day}</h3>
            <ul className="review-list">{list.map(row)}</ul>
          </div>
        ))}
      </section>
      <section className="posting-section">
        <h2>Sent on X</h2>
        {history?.checked_at && (
          <p className="studio-note">
            Buffer checked {new Date(history.checked_at).toLocaleString()}. Buffer refreshes post
            stats about once a day.
          </p>
        )}
        {sentX.length ? (
          <div className="posting-history">
            <table className="stack-table">
              <caption>X posts sent in the previous 30 days</caption>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Sent</th>
                  <th>Post</th>
                  <th>Stats</th>
                </tr>
              </thead>
              <tbody>
                {sentX.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Account">{channelName(p.channelId)}</td>
                    <td data-label="Sent">{new Date(p.sentAt || p.dueAt).toLocaleString()}</td>
                    <td data-label="Post" className="posting-history-text">
                      {p.externalLink ? (
                        <a href={p.externalLink} target="_blank" rel="noreferrer">
                          {firstLine(p.text, 70)} ↗
                        </a>
                      ) : (
                        firstLine(p.text, 70)
                      )}
                      {p.via === 'network' && <span className="studio-note"> · posted on X</span>}
                    </td>
                    <td data-label="Stats" className="posting-history-text">
                      {metricSummary(p).join(' · ') || 'No stats yet'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          history && <p className="studio-note">No X posts sent in the previous 30 days.</p>
        )}
      </section>
      <section className="posting-section">
        <h2>Sent on Bluesky</h2>
        {bluesky?.checked_at && (
          <p className="studio-note">
            PostyBirb checked {new Date(bluesky.checked_at).toLocaleString()}.
          </p>
        )}
        {bluesky?.posts.some((p) => p.state === 'PUBLISHED') ? (
          <ul className="posting-checks">
            {bluesky.posts
              .filter((p) => p.state === 'PUBLISHED')
              .map((p) => (
                <li key={p.id}>
                  {p.integration.name} ·{' '}
                  <a href={p.releaseURL} target="_blank" rel="noreferrer">
                    {firstLine(p.content, 70)} ↗
                  </a>
                </li>
              ))}
          </ul>
        ) : (
          bluesky && (
            <p className="studio-note">No confirmed Bluesky deliveries in the previous 30 days.</p>
          )
        )}
      </section>
      <SocialDelivery draft={null} revision={revision} historyOnly />
    </PostingShell>
  );
}
