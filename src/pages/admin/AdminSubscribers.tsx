import { useState, useEffect } from 'react';
import {
  listSubscribers,
  syncSubscribers,
  type APISubscriber,
  type PaginatedResponse,
} from '@/lib/api';
import {
  AdminCount,
  AdminError,
  AdminHeader,
  AdminNotice,
  AdminPagination,
} from '@/components/admin/crud';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<PaginatedResponse<APISubscriber> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [syncing, setSyncing] = useState(false);

  const load = (p: number) => {
    listSubscribers({ page: p, perPage: 30 })
      .then(setSubscribers)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  async function sync() {
    setSyncing(true);
    setError('');
    setNotice('');
    try {
      const result = await syncSubscribers();
      setNotice(
        result.confirmed
          ? `Marked ${result.confirmed} confirmed from Brevo (${result.brevo_members} on the Brevo list).`
          : `Already in step with Brevo (${result.brevo_members} on the Brevo list).`,
      );
      load(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Brevo sync failed');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <AdminHeader
        overline="Audience"
        title="Subscribers"
        description={
          <>
            Sign-ups confirm by clicking the email Brevo sends them. Brevo holds the confirmed list
            and this table copies it. Manage, export or remove contacts in{' '}
            <a href="https://app.brevo.com/contact/list-listing" target="_blank" rel="noreferrer">
              Brevo ↗
            </a>
            .
          </>
        }
        action={
          <>
            <button
              type="button"
              className="admin-button"
              disabled={syncing}
              onClick={() => void sync()}
            >
              {syncing ? 'Checking Brevo…' : 'Sync confirmations from Brevo'}
            </button>
          </>
        }
      />

      {subscribers && (
        <AdminCount>
          {subscribers.total} active {subscribers.total === 1 ? 'subscriber' : 'subscribers'}
          {(subscribers.total_pages || 1) > 1
            ? ` · page ${subscribers.page} of ${subscribers.total_pages}`
            : ''}
        </AdminCount>
      )}

      <AdminError error={error} />
      <AdminNotice>{notice}</AdminNotice>

      <div className="overflow-x-auto">
        <table className="admin-data-table stack-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Confirmed</th>
              <th>Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers?.data.map((s) => (
              <tr key={s.id}>
                <td className="font-mono break-all">{s.email}</td>
                <td data-label="Confirmed">
                  <span className={`admin-status ${s.confirmed ? 'is-live' : 'is-muted'}`}>
                    {s.confirmed ? 'Confirmed' : 'Awaiting email click'}
                  </span>
                </td>
                <td data-label="Subscribed">
                  {new Date(s.subscribed_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
            {subscribers?.data.length === 0 && (
              <tr>
                <td colSpan={3} className="admin-table-empty">
                  No subscribers yet. Confirmed newsletter sign-ups appear here after a sync.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={page}
        totalPages={Math.max(subscribers?.total_pages ?? 1, 1)}
        onChange={setPage}
      />
    </div>
  );
}
