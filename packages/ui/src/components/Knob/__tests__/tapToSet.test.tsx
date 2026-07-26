/**
 * Knob - tap-to-set interaction
 *
 * Drives the PanResponder directly rather than via fireEvent, so a "tap" is a grant +
 * release with no intervening move, and a "drag" is a grant + a move past the lock
 * threshold. Coordinates are in the knob's own space: a 200px knob centred at (100, 100).
 *
 * A press that can set a value does so on the grant (mouse-down) and locks into spin, so the
 * knob scrubs from that moment on every platform. Release only resolves a value for knobs
 * that cannot spin at all. Both routes are covered below.
 */

import React from 'react';
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';

// react-native-svg does not resolve to renderable components under this jest preset, and
// none of the drawing matters here — only the pan handlers on the host view do.
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View, Svg: View, Circle: View, Line: View, Path: View };
});

import { Knob } from '../Knob';

const SIZE = 200;
const CENTER = SIZE / 2;

const layoutEvent = { nativeEvent: { layout: { width: SIZE, height: SIZE } } };

// PanResponder derives its gestureState from `touchHistory`, so a bare nativeEvent is not
// enough to drive it. The knob's own handlers only read nativeEvent, but the responder
// still computes a centroid on every callback and throws without this.
let clock = 0;
const touch = (x: number, y: number) => {
  clock += 16;
  return {
    nativeEvent: { pageX: x, pageY: y, locationX: x, locationY: y },
    touchHistory: {
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: clock,
      touchBank: [
        {
          touchActive: true,
          startPageX: x,
          startPageY: y,
          startTimeStamp: 0,
          currentPageX: x,
          currentPageY: y,
          currentTimeStamp: clock,
          previousPageX: x,
          previousPageY: y,
          previousTimeStamp: clock - 16,
        },
      ],
    },
  };
};

/**
 * Angles use the knob's convention: 0 at the top, increasing clockwise. Returns a point on
 * the circle at 80% of the radius — comfortably outside the centre dead radius.
 */
const pointAtAngle = (degrees: number, radiusRatio = 0.8) => {
  const radians = (degrees * Math.PI) / 180;
  const r = CENTER * radiusRatio;
  return { x: CENTER + Math.sin(radians) * r, y: CENTER - Math.cos(radians) * r };
};

const renderKnob = (props: Record<string, unknown> = {}) => {
  const onChange = jest.fn();
  const utils = render(
    <Knob testID="knob" size={SIZE} min={0} max={100} defaultValue={0} onChange={onChange} {...props} />,
  );
  const knob = utils.getByTestId('knob');
  knob.props.onLayout(layoutEvent);
  return { onChange, knob, unmount: utils.unmount };
};

const tapAt = (knob: any, x: number, y: number) => {
  knob.props.onStartShouldSetResponder?.();
  knob.props.onResponderGrant(touch(x, y));
  knob.props.onResponderRelease(touch(x, y));
};

const originalOS = Platform.OS;
// Each test renders its own knob, so switch platform before any of them mount.
const setPlatform = (os: string) => {
  (Platform as unknown as { OS: string }).OS = os;
};
afterAll(() => setPlatform(originalOS));

describe('Knob tap-to-set (web)', () => {
  beforeEach(() => setPlatform('web'));

  it('jumps to the tapped angle instead of only turning', () => {
    // Default arc is a full circle starting at the top, so 90deg clockwise is a quarter turn.
    const { onChange, knob } = renderKnob();
    const { x, y } = pointAtAngle(90);

    tapAt(knob, x, y);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeCloseTo(25, 0);
  });

  it.each([
    [0, 0],
    [90, 25],
    [180, 50],
    [270, 75],
  ])('maps a tap at %ideg to %i', (angle, expected) => {
    // Start away from every expected value — a tap that resolves to the current value is
    // a no-op and correctly emits nothing.
    const { onChange, knob } = renderKnob({ defaultValue: 99 });
    const { x, y } = pointAtAngle(angle);

    tapAt(knob, x, y);

    expect(onChange.mock.calls[0][0]).toBeCloseTo(expected, 0);
  });

  it('ignores taps near the centre, where the angle is mostly noise', () => {
    const { onChange, knob } = renderKnob();
    // 5% of the radius out — inside the default 0.15 dead radius.
    const { x, y } = pointAtAngle(90, 0.05);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores taps in the dead zone of a partial arc', () => {
    // 270deg arc from -135: ends at 225 (min) and 135 (max), dead zone across the bottom.
    const { onChange, knob } = renderKnob({
      appearance: { arc: { startAngle: -135, sweepAngle: 270 } },
    });
    const { x, y } = pointAtAngle(180);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('still sets values on the covered part of a partial arc', () => {
    const { onChange, knob } = renderKnob({
      appearance: { arc: { startAngle: -135, sweepAngle: 270 } },
    });
    // 0deg (straight up) is the midpoint of a 270deg arc starting at 225.
    const { x, y } = pointAtAngle(0);

    tapAt(knob, x, y);

    expect(onChange.mock.calls[0][0]).toBeCloseTo(50, 0);
  });

  it('does not fire on a drag, which already tracks the pointer', () => {
    const { onChange, knob } = renderKnob();
    const start = pointAtAngle(90);
    const end = pointAtAngle(180);

    knob.props.onStartShouldSetResponder?.();
    knob.props.onResponderGrant(touch(start.x, start.y));
    knob.props.onResponderMove(touch(end.x, end.y));
    onChange.mockClear();
    knob.props.onResponderRelease(touch(end.x, end.y));

    // The release must not add a second, tap-derived update on top of the drag.
    expect(onChange).not.toHaveBeenCalled();
  });

  it('can be turned off via appearance.interaction.tapToSet', () => {
    const { onChange, knob } = renderKnob({
      appearance: { interaction: { tapToSet: false } },
    });
    const { x, y } = pointAtAngle(90);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not tap-to-set in endless mode, which has no absolute angle mapping', () => {
    const { onChange, knob } = renderKnob({ mode: 'endless' });
    const { x, y } = pointAtAngle(90);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([['disabled'], ['readOnly']])('does not set a value when %s', (prop) => {
    const { onChange, knob } = renderKnob({ [prop]: true });
    const { x, y } = pointAtAngle(90);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('snaps the tapped value to marks when restrictToMarks is set', () => {
    const { onChange, knob } = renderKnob({
      marks: [{ value: 0 }, { value: 50 }, { value: 100 }],
      restrictToMarks: true,
    });
    // 160deg on a full-circle 0..100 arc is ~44, which snaps to the mark at 50.
    const { x, y } = pointAtAngle(160);

    tapAt(knob, x, y);

    expect(onChange.mock.calls[0][0]).toBe(50);
  });
});

describe('Knob press-to-scrub (web)', () => {
  // The press is the interaction: it lands a value on mouse-down and starts scrubbing,
  // rather than waiting for a release or for the pointer to clear the lock threshold.
  beforeEach(() => setPlatform('web'));

  const press = (knob: any, x: number, y: number) => {
    knob.props.onStartShouldSetResponder?.();
    knob.props.onResponderGrant(touch(x, y));
  };

  it('sets the value on mouse-down, before any release', () => {
    const { onChange, knob } = renderKnob();
    const { x, y } = pointAtAngle(90);

    press(knob, x, y);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeCloseTo(25, 0);
  });

  it('enters spin mode on mouse-down', () => {
    const onModeChange = jest.fn();
    const { knob } = renderKnob({ appearance: { interaction: { onModeChange } } });
    const { x, y } = pointAtAngle(90);

    press(knob, x, y);

    expect(onModeChange).toHaveBeenCalledWith('spin');
  });

  it('tracks the pointer immediately, with no lock threshold left to clear', () => {
    const { onChange, knob } = renderKnob();
    const start = pointAtAngle(90);
    press(knob, start.x, start.y);
    onChange.mockClear();

    // ~7px along the arc at this radius — far short of the 28px default lock threshold,
    // which previously had to be cleared before any drag moved the value.
    const nudge = pointAtAngle(95);
    knob.props.onResponderMove(touch(nudge.x, nudge.y));

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBeCloseTo(26, 0);
  });

  it('keeps the slide modes reachable from the centre, where a press cannot set a value', () => {
    const onModeChange = jest.fn();
    const { onChange, knob } = renderKnob({ appearance: { interaction: { onModeChange } } });

    press(knob, CENTER, CENTER);
    expect(onChange).not.toHaveBeenCalled();
    expect(onModeChange).not.toHaveBeenCalledWith('spin');

    // Straight down, past the lock threshold: still resolves to a slide, not a spin.
    knob.props.onResponderMove(touch(CENTER, CENTER + 40));
    expect(onModeChange).toHaveBeenCalledWith('vertical-slide');
  });

  it('does not scrub on press in endless mode, which has no absolute angle mapping', () => {
    const onModeChange = jest.fn();
    const { onChange, knob } = renderKnob({
      mode: 'endless',
      appearance: { interaction: { onModeChange } },
    });
    const { x, y } = pointAtAngle(90);

    press(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
    expect(onModeChange).not.toHaveBeenCalledWith('spin');
  });

  it('still waits for the release when the knob cannot spin', () => {
    const { onChange, knob } = renderKnob({
      appearance: { interaction: { modes: ['vertical-slide'] } },
    });
    const { x, y } = pointAtAngle(90);

    press(knob, x, y);
    expect(onChange).not.toHaveBeenCalled();

    knob.props.onResponderRelease(touch(x, y));
    expect(onChange.mock.calls[0][0]).toBeCloseTo(25, 0);
  });
});

describe('Knob tap-to-set (native: grant-driven)', () => {
  // Off web the knob is spin-only, so it locks on press and the value lands from the grant
  // rather than the release. The same guards must still apply on that route.
  beforeEach(() => setPlatform('ios'));

  it('jumps to the pressed angle', () => {
    const { onChange, knob } = renderKnob();
    const { x, y } = pointAtAngle(90);

    tapAt(knob, x, y);

    expect(onChange.mock.calls[0][0]).toBeCloseTo(25, 0);
  });

  it('does not fire twice for a single press-and-release', () => {
    const { onChange, knob } = renderKnob();
    const { x, y } = pointAtAngle(90);

    tapAt(knob, x, y);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('ignores a press near the centre', () => {
    const { onChange, knob } = renderKnob();
    const { x, y } = pointAtAngle(90, 0.05);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores a press in the dead zone of a partial arc', () => {
    const { onChange, knob } = renderKnob({
      appearance: { arc: { startAngle: -135, sweepAngle: 270 } },
    });
    const { x, y } = pointAtAngle(180);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('can be turned off via appearance.interaction.tapToSet', () => {
    const { onChange, knob } = renderKnob({
      appearance: { interaction: { tapToSet: false } },
    });
    const { x, y } = pointAtAngle(90);

    tapAt(knob, x, y);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('still tracks the pointer through the centre mid-drag', () => {
    // The guard is for presses only — an in-flight drag must not stall when it crosses
    // the centre or the dead zone.
    const { onChange, knob } = renderKnob();
    const start = pointAtAngle(90);
    const end = pointAtAngle(270);

    knob.props.onStartShouldSetResponder?.();
    knob.props.onResponderGrant(touch(start.x, start.y));
    onChange.mockClear();
    knob.props.onResponderMove(touch(CENTER, CENTER));
    knob.props.onResponderMove(touch(end.x, end.y));

    expect(onChange).toHaveBeenCalled();
  });
});
