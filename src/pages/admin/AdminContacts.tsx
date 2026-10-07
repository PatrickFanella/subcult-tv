import { useState, useEffect } from 'react';
import {
  listContacts,
  toggleContactRead,
  deleteContact,
  type APIContact,
  type PaginatedResponse,
} from '@/lib/api';
import { AdminHeader, AdminError, AdminPagination } from '@/components/admin/crud';

export default function AdminContacts() {
  const [contactsPage, setContactsPage] = useState<PaginatedResponse<APIContact> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = (p: number) => {
    listContacts({ page: p, perPage: 20 })
      .then(setContactsPage)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleToggleRead = async (id: string) => {
    try {
      await toggleContactRead(id);
      load(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The change was not saved.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteContact(id);
      load(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The change was not saved.');
    }
  };

  return (
    <div>
      <AdminHeader overline="CONTACT FORM" title="Contact messages" />

      {contactsPage && (
        <p className="font-mono text-xs text-dust mb-4">
          {contactsPage.total} total · page {contactsPage.page}/{contactsPage.total_pages}
        </p>
      )}

      <AdminError error={error} />

      <div className="space-y-3">
        {contactsPage?.data.map((c) => (
          <div
            key={c.id}
            className={`bg-soot border p-4 transition-colors ${
              c.read ? 'border-fog/50' : 'border-signal'
            }`}
          >
            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  {!c.read && <span className="w-2 h-2 rounded-full bg-signal shrink-0" />}
                  <span className="font-mono text-sm text-chalk font-medium">{c.name}</span>
                  <span className="font-mono text-xs text-dust break-all">{c.email}</span>
                </div>
                {c.subject && (
                  <div className="font-mono text-xs text-bone mb-2">RE: {c.subject}</div>
                )}
                <p className="text-sm text-chalk/80 whitespace-pre-wrap break-words leading-relaxed">
                  {c.message}
                </p>
                <div className="mt-2 font-mono text-xs text-dust">
                  {new Date(c.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => handleToggleRead(c.id)}
                  className="min-h-11 px-2 font-mono text-xs text-cyan hover:text-glow cursor-pointer sm:min-h-0"
                >
                  {c.read ? 'UNREAD' : 'READ'}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="min-h-11 px-2 font-mono text-xs text-signal hover:text-glow cursor-pointer sm:min-h-0"
                >
                  DEL
                </button>
              </div>
            </div>
          </div>
        ))}

        {contactsPage?.data.length === 0 && (
          <div className="py-12 text-center font-mono text-sm text-bone">No messages.</div>
        )}
      </div>

      <AdminPagination page={page} totalPages={contactsPage?.total_pages ?? 1} onChange={setPage} />
    </div>
  );
}
