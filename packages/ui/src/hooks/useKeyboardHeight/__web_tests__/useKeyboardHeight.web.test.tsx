import { act, renderHook } from '@testing-library/react';

import { useKeyboardHeight } from '../useKeyboardHeight';

/** A minimal VisualViewport: a height and scale plus `resize` listeners. */
function installVisualViewport(initial: { height: number; scale?: number }) {
  const listeners = new Set<() => void>();
  const viewport = {
    height: initial.height,
    scale: initial.scale ?? 1,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  return {
    viewport,
    listeners,
    resize(next: { height: number; scale?: number }) {
      viewport.height = next.height;
      viewport.scale = next.scale ?? viewport.scale;
      act(() => listeners.forEach((listener) => listener()));
    },
  };
}

describe('useKeyboardHeight (web)', () => {
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  });
  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
    delete (window as { visualViewport?: unknown }).visualViewport;
  });

  it('reports how much of the layout viewport the keyboard covers', () => {
    const vv = installVisualViewport({ height: 800 });
    const { result } = renderHook(() => useKeyboardHeight());
    expect(result.current).toBe(0);

    vv.resize({ height: 500 });
    expect(result.current).toBe(300);

    vv.resize({ height: 800 });
    expect(result.current).toBe(0);
  });

  it('reads a keyboard that is already open when it mounts', () => {
    installVisualViewport({ height: 480 });
    const { result } = renderHook(() => useKeyboardHeight());
    expect(result.current).toBe(320);
  });

  it('ignores pinch-zoom and scrollbar-sized differences', () => {
    const vv = installVisualViewport({ height: 800 });
    const { result } = renderHook(() => useKeyboardHeight());

    vv.resize({ height: 400, scale: 2 });
    expect(result.current).toBe(0);

    vv.resize({ height: 785, scale: 1 });
    expect(result.current).toBe(0);
  });

  it('detaches its listener when the last consumer unmounts', () => {
    const vv = installVisualViewport({ height: 800 });
    const { unmount } = renderHook(() => useKeyboardHeight());
    expect(vv.listeners.size).toBe(1);
    unmount();
    expect(vv.listeners.size).toBe(0);
  });

  it('returns 0 without a visual viewport', () => {
    const { result } = renderHook(() => useKeyboardHeight());
    expect(result.current).toBe(0);
  });
});
