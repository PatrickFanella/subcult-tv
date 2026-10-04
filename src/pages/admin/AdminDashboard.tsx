import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardStats,
  getPostingDashboard,
  getReviewDrafts,
  getPublications,
  type DashboardStats,
  type PostingDashboard,
  type ReviewDraft,
  type Publications,
} from '@/lib/api';
import { AdminHeader } from '@/components/admin/crud';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [posting, setPosting] = useState<PostingDashboard | null>(null);
  const [reviews, setReviews] = useState<ReviewDraft[] | null>(null);
  const [publications, setPublications] = useState<Publications | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [checked, setChecked] = useState('');
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getDashboardStats(),
      getPostingDashboard(),
      getReviewDrafts(),
      getPublications(),
    ]).then(([s, p, r, u]) => {
      if (!active) return;
      setStats(s.status === 'fulfilled' ? s.value : null);
      setPosting(p.status === 'fulfilled' ? p.value : null);
      setReviews(r.status === 'fulfilled' ? r.value : null);
      setPublications(u.status === 'fulfilled' ? u.value : null);
      const names = [
        'Content counts',
        'Preparation',
        'Instagram review',
        'Website and Patreon review',
      ];
      setErrors(
        [s, p, r, u].flatMap((result, index) =>
          result.status === 'rejected'
            ? [
                `${names[index]}: ${result.reason instanceof Error ? result.reason.message : 'Unavailable'}`,
              ]
            : [],
        ),
      );
      setChecked(new Date().toLocaleString());
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [revision]);
  const drafts = publications?.drafts.filter((d) => d.status === 'draft') ?? [];
  const uncertain = [...(reviews ?? []), ...(publications?.drafts ?? [])].filter((d) =>
    ['uncertain', 'submitting'].includes(d.status),
  );
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
              <strong>{reviews?.filter((d) => d.status === 'draft').length ?? '—'}</strong>
              <span>Instagram drafts to review</span>
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
          {uncertain.length > 0 && (
            <p className="production-notice">
              {uncertain.length} submissions need provider reconciliation.{' '}
              <Link to="/admin/posts/delivery">Check delivery records →</Link>
            </p>
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
                : `Patreon needs attention: ${publications.patreon_connection_reason || 'account connection is unavailable'}`
              : 'Patreon readiness is unavailable.'}
          </p>
          <Link to="/admin/posts/automation">Inspect schedules and receipts →</Link>
          {posting?.runs[0] && (
            <p className="studio-note">
              Latest recorded preparation: {posting.runs[0].mode} ·{' '}
              {posting.runs[0].status.replaceAll('_', ' ')} ·{' '}
              {new Date(posting.runs[0].checked_at || posting.runs[0].observed_at).toLocaleString()}
            </p>
          )}
          {posting?.checks.length ? (
            <ul>
              {posting.checks.slice(0, 5).map((c, i) => (
                <li key={i}>{c.text}</li>
              ))}
            </ul>
          ) : (
            posting && <p className="studio-note">No open checks in this preparation snapshot.</p>
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
