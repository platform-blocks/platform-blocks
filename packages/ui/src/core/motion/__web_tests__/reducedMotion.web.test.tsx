import React from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';

import { useReducedMotion } from '../useReducedMotion';

type ChangeListener = (event: { matches: boolean }) => void;

// The store resolves the media query lazily (on first read) and caches it, so
// this stand-in only has to be installed before the first render.
const listeners = new Set<ChangeListener>();
let matches = true;
const originalMatchMedia = window.matchMedia;

beforeAll(() => {
  window.matchMedia = jest.fn((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: ChangeListener) => listeners.add(cb),
    removeEventListener: (_: string, cb: ChangeListener) => listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

describe('useReducedMotion (web)', () => {
  it('reads prefers-reduced-motion synchronously and follows changes', () => {
    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    expect(listeners.size).toBe(1);

    act(() => {
      matches = false;
      listeners.forEach((cb) => cb({ matches: false }));
    });
    expect(result.current).toBe(false);

    unmount();
    // The listener that was added is the one removed (the old provider leaked it).
    expect(listeners.size).toBe(0);
  });

  it('renders false on the server regardless of the client preference', () => {
    matches = true;
    const Probe = () => <span>{String(useReducedMotion())}</span>;
    expect(renderToString(<Probe />)).toContain('false');
  });
});
