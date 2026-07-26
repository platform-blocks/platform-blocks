/**
 * Knob - `behavior` prop (renamed from `variant`)
 *
 * `variant` now belongs to visual styling, so the control's *kind* moved to `behavior`.
 * These drive the pan responder directly, the same way the tap-to-set suite does, because
 * the behaviors are only observable through what a press resolves to.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View, Svg: View, Circle: View, Line: View, Path: View };
});

import { Knob } from '../Knob';

const SIZE = 200;
const CENTER = SIZE / 2;
const layoutEvent = { nativeEvent: { layout: { width: SIZE, height: SIZE } } };

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

/** 0 at the top, increasing clockwise, at 80% of the radius. */
const pointAtAngle = (degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  const r = CENTER * 0.8;
  return { x: CENTER + Math.sin(radians) * r, y: CENTER - Math.cos(radians) * r };
};

const MARKS = [{ value: 0 }, { value: 50 }, { value: 100 }];

const pressAt = (props: Record<string, unknown>, degrees: number) => {
  const onChange = jest.fn();
  const utils = render(
    <Knob testID="knob" size={SIZE} min={0} max={100} defaultValue={0} onChange={onChange} {...props} />,
  );
  const knob = utils.getByTestId('knob');
  knob.props.onLayout(layoutEvent);
  const { x, y } = pointAtAngle(degrees);
  knob.props.onStartShouldSetResponder?.();
  knob.props.onResponderGrant(touch(x, y));
  return onChange;
};

describe('Knob behavior prop', () => {
  // 160deg on a full-circle 0..100 dial is ~44 — only a `stepped` knob rounds that to a mark.
  it('snaps to marks under behavior="stepped"', () => {
    const onChange = pressAt({ behavior: 'stepped', marks: MARKS }, 160);

    expect(onChange.mock.calls[0][0]).toBe(50);
  });

  it('leaves the value unsnapped without it', () => {
    const onChange = pressAt({ marks: MARKS }, 160);

    expect(onChange.mock.calls[0][0]).toBeCloseTo(44, 0);
  });

  it('drives endless mode, which counts past max instead of clamping to it', () => {
    const valueNow = (props: Record<string, unknown>) => {
      const utils = render(<Knob testID="knob" size={SIZE} min={0} max={100} defaultValue={180} {...props} />);
      return utils.getByTestId('knob').props.accessibilityValue.now;
    };

    expect(valueNow({})).toBe(100);
    expect(valueNow({ behavior: 'endless' })).toBe(180);
  });
});

describe('Knob deprecated variant alias', () => {
  // `variant` now carries the visual presets; a behavior value arriving there is routed
  // to `behavior` instead, because the two value sets are disjoint.
  it('warns once that the prop moved', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });

    pressAt({ variant: 'stepped', marks: MARKS }, 160);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('is a behavior, not a visual style'));
    warn.mockRestore();
  });

  it('still resolves the behavior it used to', () => {
    const onChange = pressAt({ variant: 'stepped', marks: MARKS }, 160);

    expect(onChange.mock.calls[0][0]).toBe(50);
  });

  it('loses to behavior when both are passed', () => {
    // `stepped` would snap this to 50; `level` must leave it alone.
    const onChange = pressAt({ behavior: 'level', variant: 'stepped', marks: MARKS }, 160);

    expect(onChange.mock.calls[0][0]).toBeCloseTo(44, 0);
  });
});
