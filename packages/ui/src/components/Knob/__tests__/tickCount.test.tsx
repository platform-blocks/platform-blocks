/**
 * Knob - `source: 'count'` tick layers.
 *
 * A fixed-resolution collar: N evenly spaced ticks across the range, independent of `step`
 * and `marks`. Tick lines are emitted as SVG <Line>s, so they are counted by stroke.
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
import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';

const SIZE = 200;
const ACTIVE = '#38bdf8';
const INACTIVE = '#475569';

const countLayer = (count?: number) => ({
  source: 'count' as const,
  ...(count === undefined ? {} : { count }),
  shape: 'line' as const,
  color: ACTIVE,
  inactiveColor: INACTIVE,
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

const tickStrokes = (utils: ReturnType<typeof render>) =>
  utils
    .queryAllByTestId('Line')
    .map((line) => line.props.stroke)
    .filter((stroke) => stroke === ACTIVE || stroke === INACTIVE);

describe("Knob tick source 'count'", () => {
  it('lays exactly the requested number of ticks', () => {
    const utils = renderKnob({ value: 0, appearance: { ticks: [countLayer(128)] } });

    expect(tickStrokes(utils)).toHaveLength(128);
  });

  it('spaces them across the range regardless of step', () => {
    // `step` would give 100 ticks; the layer must ignore it and lay 16.
    const utils = renderKnob({ value: 50, step: 1, appearance: { ticks: [countLayer(16)] } });
    const strokes = tickStrokes(utils);

    expect(strokes).toHaveLength(16);
    // Evenly spaced endpoints-included, so half of them are at or under the midpoint.
    expect(strokes.filter((s) => s === ACTIVE)).toHaveLength(8);
  });

  it('reads the same on a range that is not 0-100', () => {
    const utils = renderKnob({ min: 0, max: 360, value: 90, appearance: { ticks: [countLayer(16)] } });

    expect(tickStrokes(utils)).toHaveLength(16);
    expect(tickStrokes(utils).filter((s) => s === ACTIVE)).toHaveLength(4);
  });

  it('lights more of the collar as the value climbs', () => {
    const low = renderKnob({ value: 10, appearance: { ticks: [countLayer(64)] } });
    const high = renderKnob({ value: 90, appearance: { ticks: [countLayer(64)] } });

    const lit = (u: ReturnType<typeof render>) => tickStrokes(u).filter((s) => s === ACTIVE).length;
    expect(lit(high)).toBeGreaterThan(lit(low));
  });

  it('caps the collar so a runaway count cannot lock the renderer up', () => {
    const utils = renderKnob({ value: 0, appearance: { ticks: [countLayer(5000)] } });

    expect(tickStrokes(utils)).toHaveLength(512);
  });

  it.each([[undefined], [0], [1]])('renders nothing for a count of %p', (count) => {
    const utils = renderKnob({ value: 50, appearance: { ticks: [countLayer(count as number)] } });

    expect(tickStrokes(utils)).toHaveLength(0);
  });
});

describe('Knob digital variant collar', () => {
  const lineColorCounts = (utils: ReturnType<typeof render>) =>
    utils
      .queryAllByTestId('Line')
      .map((line) => line.props.stroke)
      .reduce<Record<string, number>>((acc, stroke) => {
        acc[stroke] = (acc[stroke] ?? 0) + 1;
        return acc;
      }, {});

  it('wears a 128-segment collar plus its arm', () => {
    const counts = Object.values(lineColorCounts(renderKnob({ value: 25, variant: 'digital' })));

    // The arm is drawn as a <Line> too, and in the same accent as the lit segments.
    expect(counts.reduce((a, b) => a + b, 0)).toBe(129);
    expect(counts).toHaveLength(2);
  });

  it('lights more of the collar as the value climbs', () => {
    // Counted by the variant's unlit color rather than by group size: the accent is shared
    // with the arm, and past the halfway point the lit group is the larger of the two.
    const unlit = DEFAULT_THEME.colors.gray[2];
    const dimCount = (value: number) =>
      lineColorCounts(renderKnob({ value, variant: 'digital' }))[unlit] ?? 0;

    expect(dimCount(90)).toBeLessThan(dimCount(10));
    expect(dimCount(0)).toBeGreaterThan(dimCount(50));
  });
});
