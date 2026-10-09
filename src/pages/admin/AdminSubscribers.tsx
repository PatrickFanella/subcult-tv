import { useState, useEffect } from 'react';
import {
  listSubscribers,
  syncSubscribers,
  type APISubscriber,
  type PaginatedResponse,
} from '@/lib/api';
import { AdminHeader, AdminError, AdminPagination } from '@/components/admin/crud';

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
        overline="NEWSLETTER"
        title="Subscribers"
        action={
          <button type="button" disabled={syncing} onClick={() => void sync()}>
            {syncing ? 'Checking Brevo…' : 'Sync confirmations from Brevo'}
          </button>
        }
      />

      <p className="studio-note mb-4">
        Sign-ups confirm by clicking the email Brevo sends them. Brevo holds the confirmed list;
        this table copies it. If someone confirmed but still shows NO here, sync from Brevo. Manage,
        export or remove contacts in{' '}
        <a href="https://app.brevo.com/contact/list-listing" target="_blank" rel="noreferrer">
          Brevo contacts ↗
        </a>
        .
      </p>

      {subscribers && (
        <p className="font-mono text-xs text-dust mb-4">
          {subscribers.total} active subscribers · page {subscribers.page}/
          {subscribers.total_pages || 1}
        </p>
      )}

      <AdminError error={error} />
      {notice && (
        <p role="status" className="production-notice mb-4">
          {notice}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fog text-left font-mono text-xs text-dust uppercase">
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Confirmed</th>
              <th className="py-3 px-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers?.data.map((s) => (
              <tr
                key={s.id}
                className="border-b border-fog/50 hover:bg-ash transition-colors duration-200"
              >
                <td className="py-3 px-3 font-mono text-sm text-chalk break-all">{s.email}</td>
                <td className="py-3 px-3">
                  <span
                    className={`font-mono text-xs ${s.confirmed ? 'text-static' : 'text-dust'}`}
                  >
                    {s.confirmed ? 'YES' : 'NO · awaiting email click'}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-xs text-bone">
                  {new Date(s.subscribed_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {subscribers?.data.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center font-mono text-sm text-bone">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination page={page} totalPages={subscribers?.total_pages ?? 1} onChange={setPage} />
    </div>
  );
}
