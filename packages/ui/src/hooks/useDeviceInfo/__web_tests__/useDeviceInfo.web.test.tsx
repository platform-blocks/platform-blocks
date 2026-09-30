import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, renderHook } from '@testing-library/react';

import { useDeviceInfo } from '../index';

type ChangeListener = (event: { matches: boolean }) => void;

// The reduced-motion store resolves its media query lazily and caches it, so
// this stand-in must be installed before the first render.
const matching = new Set<string>(['(prefers-reduced-motion: reduce)', '(pointer: fine)']);
const listeners = new Map<string, Set<ChangeListener>>();
const originalMatchMedia = window.matchMedia;

const emitChange = (query: string, matches: boolean) => {
  if (matches) matching.add(query);
  else matching.delete(query);
  listeners.get(query)?.forEach((cb) => cb({ matches }));
};

beforeAll(() => {
  window.matchMedia = jest.fn((query: string) => ({
    get matches() {
      return matching.has(query);
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: ChangeListener) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(cb);
    },
    removeEventListener: (_: string, cb: ChangeListener) => listeners.get(query)?.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

describe('useDeviceInfo (web)', () => {
  it('reports reduced motion from the shared core/motion store and follows changes', () => {
    const { result, unmount } = renderHook(() => useDeviceInfo());
    expect(result.current.appearance.reducedMotion).toBe(true);

    act(() => emitChange('(prefers-reduced-motion: reduce)', false));
    expect(result.current.appearance.reducedMotion).toBe(false);

    act(() => emitChange('(prefers-reduced-motion: reduce)', true));
    expect(result.current.appearance.reducedMotion).toBe(true);
    unmount();
  });

  it('reads live client values and keeps the object stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useDeviceInfo());
    const info = result.current;

    expect(info.meta.ready).toBe(true);
    expect(info.runtime.platform).toBe('browser');
    expect(info.platform.isWeb).toBe(true);
    expect(info.screen.width).toBe(window.innerWidth);
    expect(info.input.hasMouse).toBe(true);
    expect(info.input.pointerTypes).toContain('mouse');

    rerender();
    expect(result.current).toBe(info);
  });

  it('follows pointer media query changes', () => {
    const { result } = renderHook(() => useDeviceInfo());
    expect(result.current.input.hasMouse).toBe(true);

    act(() => emitChange('(pointer: fine)', false));
    expect(result.current.input.hasMouse).toBe(false);

    act(() => emitChange('(pointer: fine)', true));
    expect(result.current.input.hasMouse).toBe(true);
  });

  it('shares one media-query subscription between instances and removes it on unmount', () => {
    const query = '(prefers-contrast: more)';
    const first = renderHook(() => useDeviceInfo());
    const second = renderHook(() => useDeviceInfo());
    expect(listeners.get(query)?.size).toBe(1);

    act(() => emitChange(query, true));
    expect(first.result.current.appearance.contrast).toBe('more');
    expect(second.result.current.appearance.contrast).toBe('more');
    act(() => emitChange(query, false));

    first.unmount();
    second.unmount();
    expect(listeners.get(query)?.size ?? 0).toBe(0);
  });

  it('renders deterministic defaults on the server and hydrates without a mismatch', async () => {
    function Probe() {
      const info = useDeviceInfo();
      return (
        <span>
          {[
            info.meta.ready,
            info.appearance.reducedMotion,
            info.appearance.colorScheme,
            info.locale.full,
            info.screen.width,
            info.runtime.browserName ?? 'none',
            info.input.hasMouse,
          ].join('|')}
        </span>
      );
    }

    const html = renderToString(<Probe />);
    expect(html).toContain('false|false|no-preference|en-US|1200|none|false');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable = jest.fn();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Probe />, { onRecoverableError: recoverable });
    });

    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    // After hydration the live values replace the server defaults.
    expect(container.textContent).toMatch(/^true\|true\|/);
    expect(container.textContent).toContain(`|${window.innerWidth}|`);

    errors.mockRestore();
    act(() => root?.unmount());
    container.remove();
  });
});
