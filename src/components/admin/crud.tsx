import type { ReactNode } from 'react';

export function AdminHeader({
  overline,
  title,
  action,
}: {
  overline: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={
        action
          ? 'flex items-center justify-between mb-6'
          : 'mb-6'
      }
    >
      <div>
        <p className="font-mono text-xs text-dust mb-1">&gt; {overline}</p>
        <h1 className="text-2xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function AdminError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div className="mb-4 p-3 bg-ash border border-signal font-mono text-xs text-signal">
      ERR: {error}
    </div>
  );
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
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-3 py-1 bg-ash border border-fog font-mono text-xs text-chalk
                   hover:border-signal transition-colors duration-200 cursor-pointer disabled:opacity-30"
      >
        ← PREV
      </button>
      <span className="px-3 py-1 font-mono text-xs text-dust">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-3 py-1 bg-ash border border-fog font-mono text-xs text-chalk
                   hover:border-signal transition-colors duration-200 cursor-pointer disabled:opacity-30"
      >
        NEXT →
      </button>
    </div>
  );
}