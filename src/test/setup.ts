import '@testing-library/jest-dom/vitest';

// jsdom não tem matchMedia. `window.__reduzir = true` simula "menos movimento".
declare global {
  interface Window {
    __reduzir?: boolean;
  }
}
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: Boolean(window.__reduzir) && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
