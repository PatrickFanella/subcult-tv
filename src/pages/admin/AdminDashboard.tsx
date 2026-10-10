import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getBufferDelivery,
  getBufferHistory,
  getSocialDelivery,
  getDashboardStats,
  getDraftDecisions,
  getPostingDashboard,
  getReviewDrafts,
  getPublications,
  type BufferDelivery,
  type BufferHistory,
  type DashboardStats,
  type SocialDelivery,
  type DraftDecision,
  type PostingDashboard,
  type ReviewDraft,
  type Publications,
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/crud';
import {
  draftPlatform,
  hiddenReason,
  isExpired,
  laneName,
  latestDecisions,
  runStatusLabel,
} from '@/lib/review-queue';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [posting, setPosting] = useState<PostingDashboard | null>(null);
  const [reviews, setReviews] = useState<ReviewDraft[] | null>(null);
  const [decisions, setDecisions] = useState<DraftDecision[]>([]);
  const [publications, setPublications] = useState<Publications | null>(null);
  const [social, setSocial] = useState<SocialDelivery | null>(null);
  const [buffer, setBuffer] = useState<BufferDelivery | null>(null);
  const [bufferHistory, setBufferHistory] = useState<BufferHistory | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [checked, setChecked] = useState('');
  const [readAt, setReadAt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getDashboardStats(),
      getPostingDashboard(),
      getReviewDrafts(),
      getPublications(),
      getDraftDecisions(new Date(Date.now() - 60 * 86400000).toISOString()),
      getSocialDelivery(),
      getBufferDelivery(),
      getBufferHistory(),
    ]).then(([s, p, r, u, decided, ig, x, xh]) => {
      if (!active) return;
      setSocial(ig.status === 'fulfilled' ? ig.value : null);
      setBuffer(x.status === 'fulfilled' ? x.value : null);
      setBufferHistory(xh.status === 'fulfilled' ? xh.value : null);
      setDecisions(decided.status === 'fulfilled' ? decided.value : []);
      setStats(s.status === 'fulfilled' ? s.value : null);
      setPosting(p.status === 'fulfilled' ? p.value : null);
      setReviews(r.status === 'fulfilled' ? r.value : null);
      setPublications(u.status === 'fulfilled' ? u.value : null);
      const names = [
        'Content counts',
        'Preparation',
        'Instagram review',
        'Website and Patreon review',
        'PostyBirb delivery',
        'Buffer',
        'Buffer history',
      ];
      setErrors(
        [s, p, r, u, ig, x, xh].flatMap((result, index) =>
          result.status === 'rejected'
            ? [
                `${names[index]}: ${result.reason instanceof Error ? result.reason.message : 'Unavailable'}`,
              ]
            : [],
        ),
      );
      setChecked(new Date().toLocaleString());
      setReadAt(Date.now());
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [revision]);
  const drafts = publications?.drafts.filter((d) => d.status === 'draft') ?? [];
  // Count prepared drafts still awaiting a decision; a saved edit is not required.
  const now = readAt;
  const latest = latestDecisions(decisions);
  const superseded = new Set(
    (posting?.drafts ?? []).flatMap((d) => (d.supersedes ? [d.supersedes] : [])),
  );
  const current = (posting?.drafts ?? []).filter(
    (d) => !isExpired(d, now) && !hiddenReason(d, latest, superseded, now),
  );
  const submitted = new Set(
    (reviews ?? []).filter((r) => r.status !== 'draft').map((r) => r.draft_id),
  );
  const instagramWaiting = current.filter(
    (d) => draftPlatform(d) === 'instagram' && !submitted.has(d.id),
  ).length;
  const xWaiting = current.filter((d) => draftPlatform(d) === 'x').length;
  const uncertain = [
    ...(reviews ?? []),
    ...(publications?.drafts ?? []),
    ...(buffer?.receipts ?? []),
  ].filter((d) => ['uncertain', 'submitting'].includes(d.status));
  // Things that should have happened and did not.
  const missedArticles = drafts.filter((d) => new Date(d.due_at).valueOf() <= now);
  const failedInstagram = (social?.posts ?? []).filter(
    (p) =>
      p.state === 'ERROR' ||
      (p.state === 'QUEUE' && new Date(p.publishDate).valueOf() < now - 15 * 60000),
  );
  const failedX = (bufferHistory?.posts ?? []).filter(
    (p) =>
      p.status === 'error' ||
      (p.status === 'scheduled' && new Date(p.dueAt).valueOf() < now - 15 * 60000),
  );
  const newestDaily = /\d{4}-\d{2}-\d{2}/.exec(
    [...(publications?.drafts ?? [])].sort((a, b) => b.id.localeCompare(a.id))[0]?.id ?? '',
  )?.[0];
  const dailyAge = newestDaily
    ? Math.floor((now - new Date(`${newestDaily}T12:00:00`).valueOf()) / 86400000)
    : null;
  const problems = [
    failedX.length > 0 && {
      to: '/admin/posts/delivery',
      text: `${failedX.length} X ${failedX.length === 1 ? 'post' : 'posts'} failed or did not send on time`,
    },
    failedInstagram.length > 0 && {
      to: '/admin/posts/delivery',
      text: `${failedInstagram.length} Instagram ${failedInstagram.length === 1 ? 'post' : 'posts'} failed or did not publish on time`,
    },
    uncertain.length > 0 && {
      to: '/admin/posts/delivery',
      text: `${uncertain.length} ${uncertain.length === 1 ? 'approval was' : 'approvals were'} never confirmed by Buffer, PostyBirb or Patreon`,
    },
    missedArticles.length > 0 && {
      to: '/admin/posts/articles',
      text: `${missedArticles.length} website or Patreon ${missedArticles.length === 1 ? 'draft' : 'drafts'} passed the publish time without approval`,
    },
    dailyAge !== null &&
      dailyAge > 2 && {
        to: '/admin/posts/automation',
        text: `No new daily website/Patreon draft for ${dailyAge} days (latest ${newestDaily}); the daily preparation job may be failing`,
      },
  ].filter((p): p is { to: string; text: string } => Boolean(p));
  return (
    <section className="admin-dashboard">
      <AdminHeader
        overline="SUBCULT / WORKSHOP"
        title="Dashboard"
        action={
          <button
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setRevision((v) => v + 1);
            }}
          >
            Refresh dashboard
          </button>
        }
      />
      <p className="studio-note">
        Start with work waiting for you. Preparation, approval and delivery have their own records.
      </p>
      {loading && <p role="status">Loading the workshop…</p>}
      {errors.length > 0 && (
        <div className="production-notice" role="alert">
          <strong>Some records could not be loaded.</strong>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="dashboard-workbench">
        <section>
          <h2>Needs your attention</h2>
          <div className="dashboard-action-list">
            <Link to="/admin/posts">
              <strong>{posting ? instagramWaiting : '—'}</strong>
              <span>Instagram drafts to review</span>
            </Link>
            <Link to="/admin/posts?tab=x">
              <strong>{posting ? xWaiting : '—'}</strong>
              <span>X drafts to review</span>
            </Link>
            <Link to="/admin/posts/articles">
              <strong>
                {publications ? drafts.filter((d) => d.platform === 'website').length : '—'}
              </strong>
              <span>Website entries to review</span>
            </Link>
            <Link to="/admin/posts/patreon">
              <strong>
                {publications ? drafts.filter((d) => d.platform === 'patreon').length : '—'}
              </strong>
              <span>Patreon editions to review</span>
            </Link>
            <Link to="/admin/contacts">
              <strong>{stats?.unread_contacts ?? '—'}</strong>
              <span>Unread contact messages</span>
            </Link>
          </div>
          {problems.length > 0 && (
            <div className="production-notice" role="alert">
              <strong>Missed or failed</strong>
              <ul>
                {problems.map((p) => (
                  <li key={p.text}>
                    <Link to={p.to}>{p.text} →</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        <section>
          <h2>Preparation & account readiness</h2>
          <p>
            {posting
              ? !posting.connected
                ? 'Preparation receipts are not connected.'
                : posting.stale
                  ? 'Preparation receipts are stale.'
                  : 'Preparation receipts are connected.'
              : 'Preparation status is unavailable.'}
          </p>
          {posting?.connected && (
            <p className="studio-note">
              Snapshot: {new Date(posting.generated_at).toLocaleString()} · {posting.timezone}
            </p>
          )}
          <p>
            {publications
              ? publications.patreon_connected
                ? 'Patreon account connection is ready. Scheduling is checked during approval.'
                : `Patreon is not ready to schedule: ${publications.patreon_connection_reason || 'account connection is unavailable'}. Website posts are unaffected.`
              : 'Patreon readiness is unavailable.'}
          </p>
          <Link to="/admin/posts/automation">Inspect schedules and receipts →</Link>
          {posting?.runs[0] && (
            <p className="studio-note">
              Latest recorded preparation: {laneName(posting.runs[0].mode)} ·{' '}
              {runStatusLabel(posting.runs[0].status)} ·{' '}
              {new Date(posting.runs[0].checked_at || posting.runs[0].observed_at).toLocaleString()}
            </p>
          )}
          {posting && posting.checks.length > 0 && (
            <p className="studio-note">
              The drafting runs left {posting.checks.length} notes to verify before approving.{' '}
              <Link to="/admin/posts/automation#run-notes">Read them →</Link>
            </p>
          )}
        </section>
      </div>
      <section className="dashboard-inventory">
        <h2>Workshop inventory</h2>
        <div className="dashboard-action-list">
          <Link to="/admin/projects">
            <strong>{stats?.total_projects ?? '—'}</strong>
            <span>Projects</span>
          </Link>
          <Link to="/admin/posts/articles/manage">
            <strong>{stats?.total_posts ?? '—'}</strong>
            <span>Stored articles</span>
          </Link>
          <Link to="/admin/subscribers">
            <strong>{stats?.total_subscribers ?? '—'}</strong>
            <span>Subscribers</span>
          </Link>
          <Link to="/admin/studio">
            <strong>↗</strong>
            <span>Brand & asset library</span>
          </Link>
        </div>
      </section>
      {checked && <p className="studio-note">Last dashboard read: {checked}</p>}
    </section>
  );
}
