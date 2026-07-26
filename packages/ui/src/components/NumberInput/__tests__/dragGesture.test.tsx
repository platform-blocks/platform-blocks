/**
 * NumberInput - press-and-drag value adjustment
 *
 * The gesture is driven through the config handed to `PanResponder.create` rather than through
 * rendered touch events: the responder derives its gesture state from a touch history the test
 * renderer does not maintain, so the handlers are called with synthetic gesture states instead.
 *
 * That also makes the important regression observable — the responder must be created exactly
 * once. A PanResponder accumulates dx/dy inside the instance it was created with, so rebuilding
 * it while a drag is in flight (which a controlled `value` update used to do on every step)
 * throws away the travel measured since the drag began.
 */

import React, { useState } from 'react';
import { PanResponder } from 'react-native';
import type { PanResponderGestureState } from 'react-native';
import { render, act } from '@testing-library/react-native';

import { NumberInput } from '../NumberInput';

const gestureState = (dx: number, dy: number) => ({
  stateID: 1,
  moveX: 0,
  moveY: 0,
  x0: 0,
  y0: 0,
  dx,
  dy,
  vx: 0,
  vy: 0,
  numberActiveTouches: 1,
  _accountsForMovesUpTo: 0,
} as PanResponderGestureState);

const responderEvent = { nativeEvent: {} } as any;

const setup = (props: Record<string, unknown> = {}) => {
  const tracker = {
    value: 32 as number | undefined,
    dragEvents: [] as boolean[],
    renders: 0,
  };

  const Harness = () => {
    const [value, setValue] = useState<number | undefined>(32);
    tracker.value = value;
    tracker.renders += 1;

    return (
      <NumberInput
        label="Temperature"
        value={value}
        onChange={setValue}
        withDragGesture
        dragAxis="horizontal"
        dragStepDistance={14}
        dragStepMultiplier={2}
        step={1}
        allowDecimal={false}
        min={0}
        // Inline on purpose: a fresh callback identity on every render is the common case, and
        // it used to tear the drag down mid-gesture.
        onDragStateChange={(dragging) => tracker.dragEvents.push(dragging)}
        {...props}
      />
    );
  };

  const createSpy = jest.spyOn(PanResponder, 'create');
  const utils = render(<Harness />);
  const config = createSpy.mock.calls[0][0];

  return { tracker, createSpy, config, ...utils };
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('NumberInput drag gesture', () => {
  it('accumulates travel across value updates instead of snapping back to the start value', () => {
    const { tracker, config } = setup();

    act(() => {
      config.onPanResponderGrant?.(responderEvent, gestureState(0, 0));
    });

    act(() => {
      config.onPanResponderMove?.(responderEvent, gestureState(14, 0));
    });
    expect(tracker.value).toBe(34);

    act(() => {
      config.onPanResponderMove?.(responderEvent, gestureState(28, 0));
    });
    expect(tracker.value).toBe(36);

    act(() => {
      config.onPanResponderMove?.(responderEvent, gestureState(70, 0));
    });
    expect(tracker.value).toBe(42);

    // Dragging back to the origin returns to the value the gesture started from.
    act(() => {
      config.onPanResponderMove?.(responderEvent, gestureState(0, 0));
    });
    expect(tracker.value).toBe(32);
  });

  it('creates the pan responder once, no matter how many times the value changes', () => {
    const { config, createSpy, tracker } = setup();

    act(() => {
      config.onPanResponderGrant?.(responderEvent, gestureState(0, 0));
    });

    [14, 28, 42, 56].forEach((dx) => {
      act(() => {
        config.onPanResponderMove?.(responderEvent, gestureState(dx, 0));
      });
    });

    expect(tracker.value).toBe(40);
    expect(tracker.renders).toBeGreaterThan(1);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('reports the drag state once per gesture even while the parent re-renders', () => {
    const { config, tracker } = setup();

    act(() => {
      config.onPanResponderGrant?.(responderEvent, gestureState(0, 0));
    });

    [14, 28, 42].forEach((dx) => {
      act(() => {
        config.onPanResponderMove?.(responderEvent, gestureState(dx, 0));
      });
    });

    act(() => {
      config.onPanResponderRelease?.(responderEvent, gestureState(42, 0));
    });

    expect(tracker.dragEvents).toEqual([true, false]);
  });

  it('claims the gesture only past the activation distance and along the configured axis', () => {
    const { config } = setup();

    // Activation distance is max(4, dragStepDistance * 0.35) = 4.9 for a 14px step.
    expect(config.onMoveShouldSetPanResponder?.(responderEvent, gestureState(3, 0))).toBe(false);
    expect(config.onMoveShouldSetPanResponder?.(responderEvent, gestureState(8, 0))).toBe(true);
    // A mostly-vertical drag belongs to the scroll container, not to a horizontal scrubber.
    expect(config.onMoveShouldSetPanResponder?.(responderEvent, gestureState(8, 20))).toBe(false);
    // A press alone never scrubs — the field has to stay typeable.
    expect(config.onStartShouldSetPanResponder?.(responderEvent, gestureState(0, 0))).toBe(false);
  });

  it('respects min and max while dragging', () => {
    const { tracker, config } = setup({ max: 40, min: 30 });

    act(() => {
      config.onPanResponderGrant?.(responderEvent, gestureState(0, 0));
    });

    act(() => {
      config.onPanResponderMove?.(responderEvent, gestureState(1400, 0));
    });
    expect(tracker.value).toBe(40);

    act(() => {
      config.onPanResponderMove?.(responderEvent, gestureState(-1400, 0));
    });
    expect(tracker.value).toBe(30);
  });

  it('ignores the gesture when the drag prop is off', () => {
    const { config, tracker } = setup({ withDragGesture: false });

    expect(config.onMoveShouldSetPanResponder?.(responderEvent, gestureState(40, 0))).toBe(false);

    act(() => {
      config.onPanResponderMove?.(responderEvent, gestureState(40, 0));
    });

    expect(tracker.value).toBe(32);
    expect(tracker.dragEvents).toEqual([]);
  });
});
