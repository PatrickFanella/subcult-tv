import { useState, useEffect } from 'react';
import { listSubscribers, type APISubscriber, type PaginatedResponse } from '@/lib/api';
import { AdminHeader, AdminError, AdminPagination } from '@/components/admin/crud';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<PaginatedResponse<APISubscriber> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = (p: number) => {
    listSubscribers({ page: p, perPage: 30 })
      .then(setSubscribers)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  return (
    <div>
      <AdminHeader overline="NEWSLETTER" title="Subscribers" />

      {subscribers && (
        <p className="font-mono text-xs text-dust mb-4">
          {subscribers.total} active subscribers · page {subscribers.page}/
          {subscribers.total_pages || 1}
        </p>
      )}

      <AdminError error={error} />

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
                <td className="py-3 px-3 font-mono text-sm text-chalk">{s.email}</td>
                <td className="py-3 px-3">
                  <span
                    className={`font-mono text-xs ${s.confirmed ? 'text-static' : 'text-dust'}`}
                  >
                    {s.confirmed ? 'YES' : 'NO'}
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
