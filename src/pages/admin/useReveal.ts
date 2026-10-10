import { useEffect, useRef } from 'react';

/**
 * Scroll an element into view whenever `key` changes to a non-empty value,
 * so a result message or an opened editor is never left off-screen.
 */
export function useReveal<T extends HTMLElement>(
  key: unknown,
  block: ScrollLogicalPosition = 'nearest',
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!key || !ref.current) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    ref.current.scrollIntoView?.({ block, behavior: reduce ? 'auto' : 'smooth' });
  }, [key, block]);
  return ref;
}
