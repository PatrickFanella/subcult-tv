import { useEffect, type ReactNode } from 'react';

/**
 * The shared page header for every admin page: an overline, the title, an
 * optional one-line description and the page's primary actions. It also sets
 * the browser tab title so history and tabs are distinguishable.
 */
export function AdminHeader({
  overline,
  title,
  titleId,
  description,
  action,
  nav,
}: {
  overline: string;
  title: string;
  /** An id for the heading, for `aria-labelledby` on the surrounding section. */
  titleId?: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Sub-navigation rendered under the header, for page groups. */
  nav?: ReactNode;
}) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · SUBCULT admin`;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return (
    <>
      <header className="production-heading">
        <div className="production-heading-copy">
          <p className="studio-label">{overline}</p>
          <h1 id={titleId}>{title}</h1>
          {description && <p className="production-heading-description">{description}</p>}
        </div>
        {action && <div className="production-heading-actions">{action}</div>}
      </header>
      {nav}
    </>
  );
}

export function AdminError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div role="alert" className="admin-alert admin-alert-error">
      {error}
    </div>
  );
}

/** A non-blocking confirmation or status line under the page header. */
export function AdminNotice({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="admin-alert admin-alert-notice">
      {children}
    </p>
  );
}

/** A quiet summary line such as "12 messages · page 1 of 3". */
export function AdminCount({ children }: { children: ReactNode }) {
  return <p className="admin-count">{children}</p>;
}

export function AdminPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label="Pages">
      <button
        type="button"
        className="admin-button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        ← Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="admin-button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </nav>
  );
}

/** A friendly empty state for a list or table. */
export function AdminEmpty({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}
