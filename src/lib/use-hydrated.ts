import { useSyncExternalStore } from 'react';

const subscribeNoop = () => () => {};

/**
 * False during server rendering and the hydration render, true afterwards.
 * Use it for markup that must match the prerendered HTML on first paint and
 * only then show browser-only values (saved settings, the current address).
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
