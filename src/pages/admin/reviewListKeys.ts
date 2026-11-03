import type { KeyboardEvent } from 'react';

/** Keys typed into a field belong to the field, never to list navigation. */
export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Move focus from one row header to the next or previous one in the same list.
 * `j`/`k` work from anywhere in a row that is not a field; the arrow keys only
 * when the header itself has focus, so sheets keep their native arrow behaviour.
 */
export function moveBetweenRows(event: KeyboardEvent<HTMLLIElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;
  const onHeader =
    event.target instanceof HTMLElement && event.target.classList.contains('review-row-summary');
  const forward = event.key === 'j' || (onHeader && event.key === 'ArrowDown');
  const backward = event.key === 'k' || (onHeader && event.key === 'ArrowUp');
  if (!forward && !backward) return;
  const row = event.currentTarget;
  const headers = [
    ...(row.parentElement?.querySelectorAll<HTMLButtonElement>(
      ':scope > .review-row > .review-row-summary',
    ) ?? []),
  ];
  const index = headers.findIndex((h) => h.closest('.review-row') === row);
  const next = headers[index + (forward ? 1 : -1)];
  event.preventDefault();
  if (!next) return;
  next.focus();
  next.scrollIntoView?.({ block: 'nearest' });
}
