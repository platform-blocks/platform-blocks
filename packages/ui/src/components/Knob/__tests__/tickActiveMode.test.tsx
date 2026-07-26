/**
 * Knob - which ticks in a layer count as active.
 *
 * `'fill'` (the default) lights everything up to the value like a meter; `'nearest'` lights
 * only the tick the pointer is aimed at, like a selector. Tick lines are emitted as SVG
 * <Line>s, so the two are told apart by counting active-colored strokes.
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const stub = (name: string) => {
    const Component = (props: Record<string, unknown>) =>
      ReactModule.createElement(View, { ...props, testID: props.testID ?? name });
    Component.displayName = name;
    return Component;
  };
  return {
    __esModule: true,
    default: stub('Svg'),
    Svg: stub('Svg'),
    Circle: stub('Circle'),
    Line: stub('Line'),
    Path: stub('Path'),
  };
});

import { Knob } from '../Knob';

const SIZE = 200;
const ACTIVE = '#38bdf8';
const INACTIVE = '#475569';
// Quarter-turn steps on a full circle, so 100 lands back on the 0 tick.
const TICK_VALUES = [0, 25, 50, 75];

const tickLayer = (activeMode?: 'fill' | 'nearest') => ({
  source: 'values' as const,
  values: TICK_VALUES,
  shape: 'line' as const,
  color: ACTIVE,
  inactiveColor: INACTIVE,
  ...(activeMode ? { activeMode } : {}),
});

const renderKnob = (props: Record<string, unknown>) => {
  const utils = render(<Knob testID="knob" size={SIZE} min={0} max={100} {...props} />);
  act(() =>
    utils.getByTestId('knob').props.onLayout({
      nativeEvent: { layout: { width: SIZE, height: SIZE } },
    })
  );
  return utils;
};

/**
 * Stroke colors of the emitted tick lines, in tick order. Filtered to this layer's two
 * colors so the pointer arm — also a <Line>, in the theme accent — stays out of it.
 */
const tickStrokes = (utils: ReturnType<typeof render>) =>
  utils
    .queryAllByTestId('Line')
    .map((line) => line.props.stroke)
    .filter((stroke) => stroke === ACTIVE || stroke === INACTIVE);

const activeCount = (utils: ReturnType<typeof render>) =>
  tickStrokes(utils).filter((stroke) => stroke === ACTIVE).length;

describe("Knob tick activeMode - 'fill' (default)", () => {
  it('lights every tick up to the value', () => {
    const utils = renderKnob({ value: 50, appearance: { ticks: [tickLayer()] } });

    // 0, 25 and 50 are at or below the value; 75 is not.
    expect(tickStrokes(utils)).toEqual([ACTIVE, ACTIVE, ACTIVE, INACTIVE]);
  });

  it('lights more ticks as the value climbs', () => {
    const low = renderKnob({ value: 10, appearance: { ticks: [tickLayer('fill')] } });
    const high = renderKnob({ value: 80, appearance: { ticks: [tickLayer('fill')] } });

    expect(activeCount(low)).toBe(1);
    expect(activeCount(high)).toBe(4);
  });
});

describe("Knob tick activeMode - 'nearest'", () => {
  it('lights exactly one tick, whatever the value', () => {
    [0, 10, 40, 60, 99].forEach((value) => {
      const utils = renderKnob({ value, appearance: { ticks: [tickLayer('nearest')] } });
      expect(activeCount(utils)).toBe(1);
    });
  });

  it('lights the tick the pointer is aimed at, not everything below it', () => {
    // 60 is nearer to the 50 tick than to 75, so only 50 lights.
    const utils = renderKnob({ value: 60, appearance: { ticks: [tickLayer('nearest')] } });

    expect(tickStrokes(utils)).toEqual([INACTIVE, INACTIVE, ACTIVE, INACTIVE]);
  });

  it('moves the lit tick as the value crosses the midpoint between two ticks', () => {
    const below = renderKnob({ value: 36, appearance: { ticks: [tickLayer('nearest')] } });
    const above = renderKnob({ value: 39, appearance: { ticks: [tickLayer('nearest')] } });

    expect(tickStrokes(below)).toEqual([INACTIVE, ACTIVE, INACTIVE, INACTIVE]);
    expect(tickStrokes(above)).toEqual([INACTIVE, INACTIVE, ACTIVE, INACTIVE]);
  });

  it('wraps to the first tick near the top of a full circle, where 100 meets 0', () => {
    const utils = renderKnob({ value: 96, appearance: { ticks: [tickLayer('nearest')] } });

    expect(tickStrokes(utils)).toEqual([ACTIVE, INACTIVE, INACTIVE, INACTIVE]);
  });

  it('still lights a tick on an endless knob, where fill mode lights none', () => {
    const nearest = renderKnob({
      mode: 'endless',
      value: 260,
      appearance: { ticks: [tickLayer('nearest')] },
    });
    const fill = renderKnob({
      mode: 'endless',
      value: 260,
      appearance: { ticks: [tickLayer('fill')] },
    });

    expect(activeCount(nearest)).toBe(1);
    expect(activeCount(fill)).toBe(0);
  });

  it('applies per layer, leaving a sibling fill layer alone', () => {
    const utils = renderKnob({
      value: 60,
      appearance: {
        ticks: [tickLayer('nearest'), { ...tickLayer('fill'), radiusOffset: -10 }],
      },
    });

    // One lit in the nearest layer, three (0/25/50) in the fill layer.
    expect(activeCount(utils)).toBe(4);
  });
});
