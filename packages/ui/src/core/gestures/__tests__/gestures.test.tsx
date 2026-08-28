import React from 'react';
import { PanResponder, Platform, View } from 'react-native';
import { render, act } from '@testing-library/react-native';

import { getGestureSurfaceStyle, GESTURE_RESPONDER_LOCK } from '../gestureSurface';
import {
  acquirePageScrollLock,
  getPageScrollLockCount,
  releasePageScrollLock,
  resetPageScrollLock,
} from '../pageScrollLock';
import {
  acquireTextSelectionLock,
  getTextSelectionLockCount,
  releaseTextSelectionLock,
  resetTextSelectionLock,
} from '../textSelectionLock';
import { useDragGesture } from '../useDragGesture';

// Hand the config back as `panHandlers` so the tests can drive the exact
// callbacks the hook built, without going through PanResponder's own gesture
// bookkeeping (which needs a full touch history on every synthetic event).
let panResponderSpy: jest.SpyInstance | undefined;

const nativeOS = Platform.OS;
let documentListeners: Array<[string, any]> = [];

/**
 * The locks are deliberately no-ops off web, so the suite runs against a
 * minimal DOM stand-in — enough to observe the styles they set and the
 * non-passive `touchmove` listener that does the actual scroll blocking.
 */
const installWebEnvironment = () => {
  documentListeners = [];
  (Platform as any).OS = 'web';
  (globalThis as any).document = {
    body: { style: {} as Record<string, string> },
    documentElement: { style: {} as Record<string, string> },
    addEventListener: (type: string, listener: any, options?: any) => {
      documentListeners.push([type, options]);
    },
    removeEventListener: (type: string) => {
      documentListeners = documentListeners.filter(([registered]) => registered !== type);
    },
  };
  (globalThis as any).window = { scrollX: 0, scrollY: 0 };
};

const restoreNativeEnvironment = () => {
  (Platform as any).OS = nativeOS;
  delete (globalThis as any).document;
  delete (globalThis as any).window;
};

beforeAll(() => {
  panResponderSpy = jest
    .spyOn(PanResponder, 'create')
    .mockImplementation((config: any) => ({ panHandlers: config }));
});

afterAll(() => panResponderSpy?.mockRestore());

describe('getGestureSurfaceStyle', () => {
  afterEach(() => {
    (Platform as any).OS = nativeOS;
  });

  it('returns nothing on native so no dead web keys reach the RN style diff', () => {
    (Platform as any).OS = 'ios';
    expect(getGestureSurfaceStyle({ axis: 'both' })).toEqual({});
  });

  it('claims every direction for a two-axis control', () => {
    (Platform as any).OS = 'web';
    expect(getGestureSurfaceStyle({ axis: 'both' })).toMatchObject({ touchAction: 'none' });
  });

  it('leaves the perpendicular direction to the page for single-axis controls', () => {
    (Platform as any).OS = 'web';
    expect(getGestureSurfaceStyle({ axis: 'x' })).toMatchObject({ touchAction: 'pan-y' });
    expect(getGestureSurfaceStyle({ axis: 'y' })).toMatchObject({ touchAction: 'pan-x' });
  });

  it('behaves like ordinary content when the control is disabled', () => {
    (Platform as any).OS = 'web';
    const style = getGestureSurfaceStyle({ axis: 'both', enabled: false });
    expect(style.touchAction).toBeUndefined();
    expect((style as any).userSelect).toBeUndefined();
  });

  it('refuses to hand the gesture to a scroll container', () => {
    expect(GESTURE_RESPONDER_LOCK.onPanResponderTerminationRequest()).toBe(false);
    expect(GESTURE_RESPONDER_LOCK.onShouldBlockNativeResponder()).toBe(true);
  });
});

describe('page scroll lock', () => {
  beforeEach(installWebEnvironment);
  afterEach(() => {
    resetPageScrollLock();
    restoreNativeEnvironment();
  });

  it('blocks page scrolling with a cancellable touchmove listener', () => {
    acquirePageScrollLock();
    expect(documentListeners).toContainEqual(['touchmove', { passive: false }]);
    expect((document.body.style as any).overscrollBehavior).toBe('none');
    releasePageScrollLock();
    expect(documentListeners).toHaveLength(0);
  });

  it('ref-counts so overlapping drags release exactly once', () => {
    acquirePageScrollLock();
    acquirePageScrollLock();
    expect(getPageScrollLockCount()).toBe(2);
    releasePageScrollLock();
    expect(getPageScrollLockCount()).toBe(1);
    releasePageScrollLock();
    expect(getPageScrollLockCount()).toBe(0);
  });

  it('ignores a release that was never paired with an acquire', () => {
    releasePageScrollLock();
    expect(getPageScrollLockCount()).toBe(0);
  });
});

describe('text selection lock', () => {
  beforeEach(installWebEnvironment);
  afterEach(() => {
    resetTextSelectionLock();
    restoreNativeEnvironment();
  });

  it('ref-counts independently of the scroll lock', () => {
    acquireTextSelectionLock();
    acquireTextSelectionLock();
    releaseTextSelectionLock();
    expect(getTextSelectionLockCount()).toBe(1);
    resetTextSelectionLock();
    expect(getTextSelectionLockCount()).toBe(0);
  });
});

type Harness = {
  handlers: Record<string, any>;
  points: any[];
};

const renderHarness = (options: Parameters<typeof useDragGesture>[0] = {}) => {
  const harness: Harness = { handlers: {}, points: [] };

  const Probe = () => {
    const drag = useDragGesture({
      ...options,
      onStart: (point) => harness.points.push({ phase: 'start', ...point }),
      onMove: (point) => harness.points.push({ phase: 'move', ...point }),
      onEnd: (point) => harness.points.push({ phase: 'end', ...point }),
    });
    harness.handlers = drag.panHandlers as any;
    return <View ref={drag.ref} onLayout={drag.onLayout} {...drag.panHandlers} />;
  };

  const api = render(<Probe />);
  return { harness, api };
};

/** Grant lands on the surface, so `page − location` is the surface origin. */
const grantEvent = (pageX: number, pageY: number, locationX: number, locationY: number) => ({
  nativeEvent: { pageX, pageY, locationX, locationY },
});

const moveEvent = (pageX: number, pageY: number) => ({
  nativeEvent: { pageX, pageY, locationX: 0, locationY: 0 },
});

describe('useDragGesture', () => {
  beforeEach(installWebEnvironment);
  afterEach(() => {
    resetPageScrollLock();
    resetTextSelectionLock();
    restoreNativeEnvironment();
  });

  it('reports surface-relative coordinates derived from page position', () => {
    const { harness } = renderHarness();

    act(() => {
      // Surface origin is (100, 50); the press is 20px in and 10px down.
      harness.handlers.onPanResponderGrant(grantEvent(120, 60, 20, 10), {} as any);
    });

    expect(harness.points[0]).toMatchObject({ phase: 'start', x: 20, y: 10, dx: 0, dy: 0 });
  });

  it('keeps tracking after the pointer leaves the surface', () => {
    const { harness } = renderHarness();

    act(() => {
      harness.handlers.onPanResponderGrant(grantEvent(120, 60, 20, 10), {} as any);
    });
    act(() => {
      // Far above and to the right of the surface — the sample is still ours.
      harness.handlers.onPanResponderMove(moveEvent(400, -200), {} as any);
    });

    expect(harness.points[1]).toMatchObject({ phase: 'move', x: 300, y: -250, dx: 280, dy: -260 });
  });

  it('holds the page-scroll lock only for the duration of the gesture', () => {
    const { harness } = renderHarness();

    expect(getPageScrollLockCount()).toBe(0);
    act(() => {
      harness.handlers.onPanResponderGrant(grantEvent(0, 0, 0, 0), {} as any);
    });
    expect(getPageScrollLockCount()).toBe(1);
    act(() => {
      harness.handlers.onPanResponderRelease(moveEvent(10, 10), {} as any);
    });
    expect(getPageScrollLockCount()).toBe(0);
  });

  it('releases the lock when the gesture is terminated rather than released', () => {
    const { harness } = renderHarness();

    act(() => {
      harness.handlers.onPanResponderGrant(grantEvent(0, 0, 0, 0), {} as any);
    });
    act(() => {
      harness.handlers.onPanResponderTerminate({} as any, {} as any);
    });

    expect(getPageScrollLockCount()).toBe(0);
    expect(harness.points.some((point) => point.phase === 'end')).toBe(false);
  });

  it('does not claim the gesture while disabled', () => {
    const { harness } = renderHarness({ enabled: false });

    expect(harness.handlers.onStartShouldSetPanResponder()).toBe(false);
    act(() => {
      harness.handlers.onPanResponderGrant(grantEvent(0, 0, 0, 0), {} as any);
    });
    expect(harness.points).toHaveLength(0);
    expect(getPageScrollLockCount()).toBe(0);
  });

  it('waits for the activation distance when the gesture must not claim a tap', () => {
    const { harness } = renderHarness({ claimOnStart: false, activationDistance: 8, axis: 'x' });

    expect(harness.handlers.onStartShouldSetPanResponder()).toBe(false);
    expect(harness.handlers.onMoveShouldSetPanResponder({} as any, { dx: 4, dy: 0 } as any)).toBe(false);
    expect(harness.handlers.onMoveShouldSetPanResponder({} as any, { dx: 12, dy: 0 } as any)).toBe(true);
  });

  it('releases a held lock when the component unmounts mid-drag', () => {
    const { harness, api } = renderHarness();

    act(() => {
      harness.handlers.onPanResponderGrant(grantEvent(0, 0, 0, 0), {} as any);
    });
    expect(getPageScrollLockCount()).toBe(1);

    act(() => { api.unmount(); });
    expect(getPageScrollLockCount()).toBe(0);
  });
});
