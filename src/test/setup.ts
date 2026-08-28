import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia; EffectsContext + some components
// consult prefers-reduced-motion on mount.
window.matchMedia =
  window.matchMedia ||
  ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
