import { useState, useEffect, useId } from 'react';
import {
  listContacts,
  toggleContactRead,
  deleteContact,
  getDashboardStats,
  type APIContact,
  type DashboardStats,
  type PaginatedResponse,
} from '@/lib/api';
import {
  AdminCount,
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminNotice,
  AdminPagination,
} from '@/components/admin/crud';

/**
 * Run one request per selected message in sequence (there is no bulk endpoint)
 * and report which ones did not go through, so a partial result is visible.
 */
async function eachInSequence(ids: string[], action: (id: string) => Promise<unknown>) {
  const failed: string[] = [];
  for (const id of ids) {
    try {
      await action(id);
    } catch {
      failed.push(id);
    }
  }
  return failed;
}

export default function AdminContacts() {
  const [contactsPage, setContactsPage] = useState<PaginatedResponse<APIContact> | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [working, setWorking] = useState(false);
  const selectAllId = useId();

  const load = (p: number) => {
    listContacts({ page: p, perPage: 20 })
      .then((res) => {
        // Deleting the last item on the last page leaves this page empty; step back.
        if (p > 1 && res.total_pages < p) {
          setPage(Math.max(1, res.total_pages));
          return;
        }
        setContactsPage(res);
        // Drop selections that no longer exist on this page.
        setSelected((current) => {
          const ids = new Set(res.data.map((c) => c.id));
          return new Set([...current].filter((id) => ids.has(id)));
        });
      })
      .catch((err) => setError(err.message));
    // Unread and total counts come from the API, not from this page alone.
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null));
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

  const pageIds = contactsPage?.data.map((c) => c.id) ?? [];
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;
  const toggleOne = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(pageIds));

  const finishBulk = (verb: string, attempted: number, failed: string[]) => {
    const done = attempted - failed.length;
    if (failed.length) {
      setError(
        `${verb} ${done} of ${attempted}; ${failed.length} ${failed.length === 1 ? 'message' : 'messages'} could not be changed. Reload and try again.`,
      );
    } else {
      setError('');
      setNotice(`${verb} ${done} ${done === 1 ? 'message' : 'messages'}.`);
    }
    setSelected(new Set(failed));
    load(page);
  };

  const bulkMarkRead = async () => {
    // Only unread selections change; marking a read message again would unread it.
    const ids = (contactsPage?.data ?? [])
      .filter((c) => selected.has(c.id) && !c.read)
      .map((c) => c.id);
    if (!ids.length) {
      setNotice('Every selected message is already read.');
      return;
    }
    setWorking(true);
    setNotice('');
    const failed = await eachInSequence(ids, toggleContactRead);
    setWorking(false);
    finishBulk('Marked read', ids.length, failed);
  };

  const bulkDelete = async () => {
    const ids = pageIds.filter((id) => selected.has(id));
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} ${ids.length === 1 ? 'message' : 'messages'}?`)) return;
    setWorking(true);
    setNotice('');
    const failed = await eachInSequence(ids, deleteContact);
    setWorking(false);
    finishBulk('Deleted', ids.length, failed);
  };

  const totalPages = Math.max(contactsPage?.total_pages ?? 1, 1);
  const unreadOnPage = contactsPage?.data.filter((c) => !c.read).length ?? 0;
  const total = stats?.total_contacts ?? contactsPage?.total ?? 0;
  const unread = stats?.unread_contacts ?? unreadOnPage;
  return (
    <div>
      <AdminHeader
        overline="Audience"
        title="Contact messages"
        description="Messages sent through the public contact form. Reply from your own mail client; this page only tracks what you have read."
      />

      {contactsPage && (
        <AdminCount>
          {unread} unread of {total} total
          {!stats && unreadOnPage > 0 ? ' (counted on this page only)' : ''}
          {totalPages > 1 ? ` · page ${contactsPage.page} of ${totalPages}` : ''}
        </AdminCount>
      )}

      <AdminError error={error} />
      <AdminNotice>{notice}</AdminNotice>

      {pageIds.length > 0 && (
        <div className="admin-row-actions" role="group" aria-label="Selection">
          <label className="studio-note" htmlFor={selectAllId}>
            <input
              id={selectAllId}
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              disabled={working}
            />{' '}
            Select all on this page
          </label>
          <span className="admin-count">{selected.size} selected</span>
          <button
            type="button"
            className="admin-button admin-button-small"
            disabled={!someSelected || working}
            onClick={() => void bulkMarkRead()}
          >
            Mark selected read
          </button>
          <button
            type="button"
            className="admin-button admin-button-small admin-button-danger"
            disabled={!someSelected || working}
            onClick={() => void bulkDelete()}
          >
            {working ? 'Working…' : 'Delete selected'}
          </button>
        </div>
      )}

      <div className="contact-list">
        {contactsPage?.data.map((c) => (
          <article key={c.id} className="contact-card" data-unread={!c.read || undefined}>
            <div className="contact-card-body">
              <div className="contact-card-head">
                <input
                  type="checkbox"
                  aria-label={`Select message from ${c.name}`}
                  checked={selected.has(c.id)}
                  onChange={() => toggleOne(c.id)}
                  disabled={working}
                />
                {!c.read && (
                  <>
                    <span className="contact-unread-dot" aria-hidden="true" />
                    <span className="admin-status is-live">Unread</span>
                  </>
                )}
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
              <button
                type="button"
                className="admin-button"
                onClick={() => handleToggleRead(c.id)}
                disabled={working}
              >
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
                disabled={working}
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
