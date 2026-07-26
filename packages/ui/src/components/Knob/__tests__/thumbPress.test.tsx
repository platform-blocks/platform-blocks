/**
 * Knob - thumb press state
 *
 * The thumb grows while the knob is being scrubbed. The scale rides in the same transform
 * array as the position, so these read it off the rendered thumb rather than a style flag.
 */

import React from 'react';
import { act, render } from '@testing-library/react-native';

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

const pointAtAngle = (degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  const r = CENTER * 0.8;
  return { x: CENTER + Math.sin(radians) * r, y: CENTER - Math.cos(radians) * r };
};

/** The thumb is the only element carrying a scale in its transform. */
const thumbScale = (utils: ReturnType<typeof render>) => {
  const withTransform = utils.UNSAFE_getAllByType(require('react-native').View as any).filter((node: any) => {
    const style = node.props?.style;
    return Array.isArray(style) && style.some((entry: any) => Array.isArray(entry?.transform));
  });
  for (const node of withTransform) {
    for (const entry of node.props.style) {
      const scaleEntry = Array.isArray(entry?.transform)
        ? entry.transform.find((t: any) => typeof t?.scale === 'number')
        : undefined;
      if (scaleEntry) return scaleEntry.scale as number;
    }
  }
  return undefined;
};

const setup = (props: Record<string, unknown> = {}) => {
  const utils = render(
    <Knob testID="knob" size={SIZE} min={0} max={100} defaultValue={40} {...props} />,
  );
  const knob = utils.getByTestId('knob');
  knob.props.onLayout(layoutEvent);
  const start = pointAtAngle(90);
  return {
    utils,
    knob,
    // Wrapped so the press-state re-render is flushed before anything reads the tree.
    grant: () => act(() => {
      knob.props.onStartShouldSetResponder?.();
      knob.props.onResponderGrant(touch(start.x, start.y));
    }),
    release: () => act(() => {
      knob.props.onResponderRelease(touch(start.x, start.y));
    }),
  };
};

describe('Knob thumb press state', () => {
  it('rests at its normal size', () => {
    const { utils } = setup();

    expect(thumbScale(utils)).toBe(1);
  });

  it('grows while the knob is being scrubbed, and settles back on release', () => {
    const { utils, grant, release } = setup();

    grant();
    expect(thumbScale(utils)).toBe(1.25);

    release();
    expect(thumbScale(utils)).toBe(1);
  });

  it('takes the grown size from appearance.thumb.activeScale', () => {
    const { utils, grant } = setup({ appearance: { thumb: { activeScale: 2 } } });

    grant();

    expect(thumbScale(utils)).toBe(2);
  });

  it('can be turned off with activeScale 1', () => {
    const { utils, grant } = setup({ appearance: { thumb: { activeScale: 1 } } });

    grant();

    expect(thumbScale(utils)).toBe(1);
  });

  it('stays put on a knob that cannot be scrubbed', () => {
    const { utils, grant } = setup({ disabled: true });

    grant();

    expect(thumbScale(utils)).toBe(1);
  });

  it('still forwards the caller onScrubStart/onScrubEnd', () => {
    const onScrubStart = jest.fn();
    const onScrubEnd = jest.fn();
    const { grant, release } = setup({ onScrubStart, onScrubEnd });

    grant();
    expect(onScrubStart).toHaveBeenCalledTimes(1);

    release();
    expect(onScrubEnd).toHaveBeenCalledTimes(1);
  });

  it('keeps the press scale after the position transform, so the thumb grows in place', () => {
    const { utils, grant } = setup();
    grant();

    const node = utils.UNSAFE_getAllByType(require('react-native').View as any).find((n: any) => {
      const style = n.props?.style;
      return Array.isArray(style) && style.some((entry: any) =>
        Array.isArray(entry?.transform) && entry.transform.some((t: any) => typeof t?.scale === 'number'));
    });
    const transform = node!.props.style.find((entry: any) => Array.isArray(entry?.transform)).transform;

    expect(Object.keys(transform[0])[0]).toBe('translateX');
    expect(Object.keys(transform[1])[0]).toBe('translateY');
    expect(Object.keys(transform[2])[0]).toBe('scale');
  });
});
