import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { act, render, renderHook } from '@testing-library/react-native';

import { AccessibilityProvider, useAccessibility, useOptionalAccessibility } from '../context';
import { useAnnouncer, useFocus, useReducedMotion, useScreenReader } from '../hooks';
import { resetWarnOnce } from '../../utils/logger';

describe('accessibility hooks without a provider', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    resetWarnOnce();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it('work and never warn', () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
    const { result } = renderHook(() => ({
      focus: useFocus('a'),
      announcer: useAnnouncer(),
      motion: useReducedMotion(),
      screenReader: useScreenReader(),
    }));
    expect(result.current.focus.isFocused).toBe(false);
    expect(result.current.motion.prefersReducedMotion).toBe(false);
    expect(result.current.motion.getDuration(200)).toBe(200);
    expect(result.current.screenReader.enabled).toBe(false);

    act(() => result.current.announcer.announce('Saved'));
    expect(announce).toHaveBeenCalledWith('Saved', { queue: true });
    expect(warn).not.toHaveBeenCalled();
    announce.mockRestore();
  });

  it('useOptionalAccessibility returns null and useAccessibility throws', () => {
    expect(renderHook(() => useOptionalAccessibility()).result.current).toBeNull();
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAccessibility())).toThrow(/AccessibilityProvider/);
    error.mockRestore();
  });
});

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('announcing does not re-render announcer / motion consumers', () => {
    const renders = { announcer: 0, motion: 0 };
    let announce: (message: string) => void = () => {};

    const AnnouncerConsumer = React.memo(() => {
      renders.announcer += 1;
      announce = useAnnouncer().announce;
      return null;
    });
    const MotionConsumer = React.memo(() => {
      renders.motion += 1;
      useReducedMotion();
      return null;
    });

    render(
      <AccessibilityProvider>
        <AnnouncerConsumer />
        <MotionConsumer />
      </AccessibilityProvider>
    );
    expect(renders).toEqual({ announcer: 1, motion: 1 });

    act(() => {
      announce('One');
      announce('Two');
    });
    expect(renders).toEqual({ announcer: 1, motion: 1 });
    expect(AccessibilityInfo.announceForAccessibilityWithOptions).toHaveBeenCalledTimes(2);
  });

  it('re-renders only the useFocus consumer whose focus changed', () => {
    const renders: Record<string, number> = { a: 0, b: 0 };
    const focusers: Record<string, () => void> = {};

    const Focusable = React.memo(({ id }: { id: string }) => {
      renders[id] += 1;
      const { ref, focus, isFocused } = useFocus(id);
      focusers[id] = focus;
      return <Text ref={ref}>{isFocused ? 'focused' : 'idle'}</Text>;
    });

    const { getAllByText } = render(
      <AccessibilityProvider>
        <Focusable id="a" />
        <Focusable id="b" />
      </AccessibilityProvider>
    );
    expect(renders).toEqual({ a: 1, b: 1 });

    act(() => focusers.a());
    expect(renders).toEqual({ a: 2, b: 1 });
    expect(getAllByText('focused')).toHaveLength(1);

    act(() => focusers.b());
    expect(renders).toEqual({ a: 3, b: 2 });
  });

  it('keeps the legacy full value, logging announcements and pruning them on a timer', () => {
    jest.useFakeTimers();
    try {
      const wrapper = ({ children }: { children: React.ReactNode }) => <AccessibilityProvider>{children}</AccessibilityProvider>;
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => result.current.announce('Hello'));
      expect(result.current.announcements).toEqual(['Hello']);
      act(() => result.current.setFocus('x'));
      expect(result.current.currentFocusId).toBe('x');
      act(() => result.current.setFocus('y'));
      expect(result.current.focusHistory).toEqual(['x']);
      act(() => result.current.restoreFocus());
      expect(result.current.currentFocusId).toBe('x');

      act(() => jest.advanceTimersByTime(3000));
      expect(result.current.announcements).toEqual([]);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('forces reduced motion for its subtree when asked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AccessibilityProvider reducedMotion>{children}</AccessibilityProvider>
    );
    const { result } = renderHook(() => useReducedMotion(), { wrapper });
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.getDuration(300)).toBe(0);
    expect(result.current.getScale(0.9)).toBe(1);
  });
});
