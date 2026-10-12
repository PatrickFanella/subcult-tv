import { useState, useEffect } from 'react';
import {
  listContacts,
  toggleContactRead,
  deleteContact,
  type APIContact,
  type PaginatedResponse,
} from '@/lib/api';
import {
  AdminCount,
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminPagination,
} from '@/components/admin/crud';

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

  const totalPages = Math.max(contactsPage?.total_pages ?? 1, 1);
  const unread = contactsPage?.data.filter((c) => !c.read).length ?? 0;
  return (
    <div>
      <AdminHeader
        overline="Audience"
        title="Contact messages"
        description="Messages sent through the public contact form. Reply from your own mail client; this page only tracks what you have read."
      />

      {contactsPage && (
        <AdminCount>
          {contactsPage.total} {contactsPage.total === 1 ? 'message' : 'messages'}
          {unread > 0 ? ` · ${unread} unread on this page` : ''}
          {totalPages > 1 ? ` · page ${contactsPage.page} of ${totalPages}` : ''}
        </AdminCount>
      )}

      <AdminError error={error} />

      <div className="contact-list">
        {contactsPage?.data.map((c) => (
          <article key={c.id} className="contact-card" data-unread={!c.read || undefined}>
            <div className="contact-card-body">
              <div className="contact-card-head">
                {!c.read && <span className="contact-unread-dot" aria-label="Unread" />}
                <strong>{c.name}</strong>
                <a href={`mailto:${c.email}`} className="contact-email">
                  {c.email}
                </a>
                <time dateTime={c.created_at} className="contact-date">
                  {new Date(c.created_at).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              {c.subject && <div className="contact-subject">{c.subject}</div>}
              <p className="contact-message">{c.message}</p>
            </div>
            <div className="contact-card-actions">
              <button type="button" className="admin-button" onClick={() => handleToggleRead(c.id)}>
                {c.read ? 'Mark unread' : 'Mark read'}
              </button>
              <a
                className="admin-button"
                href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'your message')}`}
              >
                Reply
              </a>
              <button
                type="button"
                className="admin-button admin-button-danger"
                onClick={() => handleDelete(c.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}

        {contactsPage?.data.length === 0 && (
          <AdminEmpty>No messages yet. New contact-form submissions appear here.</AdminEmpty>
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
