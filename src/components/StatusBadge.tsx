import type { Project } from '@/types';
import { statusColors, statusLabels } from '@/lib/project-utils';

/**
 * A quiet status marker for products that are not simply live: incubating
 * (pre-alpha, in development, private preview) or archived. Active products
 * show nothing, so the badge reads as a caveat rather than decoration.
 */
export default function StatusBadge({
  status,
  className = '',
}: {
  status: Project['status'];
  className?: string;
}) {
  if (status === 'active') return null;
  return (
    <span
      className={`inline-block font-mono text-[0.7rem] uppercase tracking-[0.13em] ${statusColors[status]} ${className}`.trim()}
    >
      {statusLabels[status]}
    </span>
  );
}
