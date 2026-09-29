import React from 'react';
import { act, renderHook } from '@testing-library/react-native';

import { AccessibilityInfo } from 'react-native';

import { ReducedMotionProvider } from '../ReducedMotionProvider';
import { useReducedMotion } from '../useReducedMotion';
import { useTransitionDuration } from '../useTransitionDuration';

type Listener = (value: boolean) => void;

/**
 * Points the (shared, module-level) store at a controllable AccessibilityInfo.
 * The store starts listening with its first subscriber and re-queries the OS
 * each time, so a fresh `load` per test is enough; testing-library unmounts
 * every hook after each test, which stops the previous listener.
 */
function load(initial: boolean) {
  let listener: Listener | null = null;
  const remove = jest.fn(() => {
    listener = null;
  });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockImplementation(() => Promise.resolve(initial));
  const addEventListener = jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation(((_event: string, cb: Listener) => {
      listener = cb;
      return { remove };
    }) as never);
  // The RN jest preset's AccessibilityInfo methods are already jest.fn()s, so
  // spyOn returns them as-is and their call history carries across tests.
  addEventListener.mockClear();
  return {
    useReducedMotion,
    ReducedMotionProvider,
    useTransitionDuration,
    emit: (value: boolean) => listener?.(value),
    remove,
    addEventListener,
  };
}

const flush = () => act(async () => {});

describe('reduced motion store (native)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads the OS setting and follows changes', async () => {
    const env = load(true);
    const { result } = renderHook(() => env.useReducedMotion());
    expect(result.current).toBe(false); // first test: before the async query resolves
    await flush();
    expect(result.current).toBe(true);
    act(() => env.emit(false));
    expect(result.current).toBe(false);
  });

  it('shares one native listener and removes it with the last subscriber', async () => {
    const env = load(false);
    const a = renderHook(() => env.useReducedMotion());
    const b = renderHook(() => env.useReducedMotion());
    await flush();
    expect(env.addEventListener).toHaveBeenCalledTimes(1);
    a.unmount();
    expect(env.remove).not.toHaveBeenCalled();
    b.unmount();
    expect(env.remove).toHaveBeenCalledTimes(1);
  });

  it('lets ReducedMotionProvider force the value, inherit, or reset to the system', async () => {
    const env = load(false);
    const { ReducedMotionProvider, useReducedMotion } = env;

    const forced = renderHook(() => useReducedMotion(), {
      wrapper: ({ children }: { children: React.ReactNode }) => <ReducedMotionProvider reducedMotion>{children}</ReducedMotionProvider>,
    });
    expect(forced.result.current).toBe(true);

    const inherited = renderHook(() => useReducedMotion(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ReducedMotionProvider reducedMotion>
          <ReducedMotionProvider>{children}</ReducedMotionProvider>
        </ReducedMotionProvider>
      ),
    });
    expect(inherited.result.current).toBe(true);

    const reset = renderHook(() => useReducedMotion(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ReducedMotionProvider reducedMotion>
          <ReducedMotionProvider reducedMotion="system">{children}</ReducedMotionProvider>
        </ReducedMotionProvider>
      ),
    });
    await flush();
    expect(reset.result.current).toBe(false);
  });

  it('does not subscribe to the OS while overridden', () => {
    const env = load(false);
    const { ReducedMotionProvider, useReducedMotion } = env;
    renderHook(() => useReducedMotion(), {
      wrapper: ({ children }: { children: React.ReactNode }) => <ReducedMotionProvider reducedMotion={false}>{children}</ReducedMotionProvider>,
    });
    expect(env.addEventListener).not.toHaveBeenCalled();
  });

  it('accepts the deprecated forcedValue prop', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const env = load(false);
    const { ReducedMotionProvider, useReducedMotion } = env;
    const { result } = renderHook(() => useReducedMotion(), {
      wrapper: ({ children }: { children: React.ReactNode }) => <ReducedMotionProvider forcedValue>{children}</ReducedMotionProvider>,
    });
    expect(result.current).toBe(true);
    warn.mockRestore();
  });

  it('useTransitionDuration reads the same source', async () => {
    const env = load(true);
    const { result } = renderHook(() => env.useTransitionDuration(undefined, 250));
    await flush();
    expect(result.current).toBe(0);
    act(() => env.emit(false));
    expect(result.current).toBe(250);
  });
});
