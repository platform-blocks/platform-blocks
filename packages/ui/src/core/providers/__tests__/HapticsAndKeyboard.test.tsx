import React from 'react';
import { Keyboard, type KeyboardEvent } from 'react-native';
import { act, render, renderHook } from '@testing-library/react-native';

import { HapticsProvider, useHapticsSettings } from '../../haptics/HapticsProvider';
import {
  KeyboardManagerProvider,
  useKeyboardFocusOptional,
  useKeyboardManager,
  useKeyboardMetricsOptional,
} from '../KeyboardManagerProvider';

describe('HapticsProvider', () => {
  it('restores the previous setting and respects changes during a temporary disable', () => {
    jest.useFakeTimers();
    try {
      const wrapper = ({ children }: { children: React.ReactNode }) => <HapticsProvider defaultEnabled={false}>{children}</HapticsProvider>;
      const { result } = renderHook(() => useHapticsSettings(), { wrapper });
      act(() => result.current.temporarilyDisable(100));
      act(() => jest.advanceTimersByTime(100));
      expect(result.current.enabled).toBe(false);

      act(() => result.current.setEnabled(true));
      act(() => result.current.temporarilyDisable(100));
      expect(result.current.enabled).toBe(false);
      act(() => result.current.setEnabled(false));
      act(() => jest.advanceTimersByTime(100));
      expect(result.current.enabled).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('memoizes its value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <HapticsProvider>{children}</HapticsProvider>;
    const { result, rerender } = renderHook(() => useHapticsSettings(), { wrapper });
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);
    act(() => first.setEnabled(false));
    expect(result.current.enabled).toBe(false);
    expect(result.current.temporarilyDisable).toBe(first.temporarilyDisable);
  });
});

describe('HapticsProvider nesting', () => {
  it('shares the parent state when nested without defaultEnabled', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HapticsProvider defaultEnabled={false}>
        <HapticsProvider>{children}</HapticsProvider>
      </HapticsProvider>
    );
    const { result } = renderHook(() => useHapticsSettings(), { wrapper });
    expect(result.current.enabled).toBe(false);
  });
});

describe('KeyboardManagerProvider', () => {
  type Handler = (event?: KeyboardEvent) => void;
  let handlers: Record<string, Handler>;

  beforeEach(() => {
    handlers = {};
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((name: string, handler: Handler) => {
      handlers[name] = handler;
      return { remove: jest.fn() };
    }) as never);
  });
  afterEach(() => jest.restoreAllMocks());

  const showEvent = (height: number) => ({ endCoordinates: { height, width: 320, screenX: 0, screenY: 500 }, duration: 250 }) as unknown as KeyboardEvent;

  it('splits metrics from focus helpers so each consumer re-renders only for its slice', () => {
    const renders = { metrics: 0, focus: 0 };
    let focusApi: ReturnType<typeof useKeyboardFocusOptional> = null;

    const MetricsConsumer = React.memo(() => {
      renders.metrics += 1;
      useKeyboardMetricsOptional();
      return null;
    });
    const FocusConsumer = React.memo(() => {
      renders.focus += 1;
      focusApi = useKeyboardFocusOptional();
      return null;
    });

    render(
      <KeyboardManagerProvider>
        <MetricsConsumer />
        <FocusConsumer />
      </KeyboardManagerProvider>
    );
    expect(renders).toEqual({ metrics: 1, focus: 1 });

    act(() => handlers.keyboardWillShow(showEvent(300)));
    expect(renders).toEqual({ metrics: 2, focus: 1 });

    // did-show repeats the same frame: skipped.
    act(() => handlers.keyboardDidShow(showEvent(300)));
    expect(renders).toEqual({ metrics: 2, focus: 1 });

    act(() => focusApi?.setFocusTarget('field'));
    expect(renders).toEqual({ metrics: 2, focus: 2 });

    act(() => handlers.keyboardWillHide());
    act(() => handlers.keyboardDidHide());
    expect(renders).toEqual({ metrics: 3, focus: 2 });
  });

  it('keeps the combined hook working', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <KeyboardManagerProvider>{children}</KeyboardManagerProvider>;
    const { result } = renderHook(() => useKeyboardManager(), { wrapper });
    act(() => handlers.keyboardDidShow(showEvent(280)));
    expect(result.current.isKeyboardVisible).toBe(true);
    expect(result.current.keyboardHeight).toBe(280);
    act(() => result.current.refocus('a'));
    expect(result.current.pendingFocusTarget).toBe('a');
    let consumed = false;
    act(() => {
      consumed = result.current.consumeFocusTarget('a');
    });
    expect(consumed).toBe(true);
    expect(result.current.pendingFocusTarget).toBeNull();
  });
});
