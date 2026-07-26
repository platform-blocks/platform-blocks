/**
 * Knob - ring segments, in both of the roles `ring.segmentMode` selects.
 *
 * `'track'` paints the bands across the whole ring as a static backdrop; `'progress'` makes
 * them the fill, clipped at the current value. Assertions read the emitted SVG <Path>
 * strokes, so each band and the plain progress stroke are told apart by color.
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';

// The preset does not resolve react-native-svg to renderable components. Each primitive is
// stubbed as a tagged View so the paths stay queryable.
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
const PROGRESS_COLOR = '#0000ff';
const ZONES = [
  { value: 60, color: '#22c55e' },
  { value: 25, color: '#f59e0b' },
  { value: 15, color: '#ef4444' },
];

const renderKnob = (props: Record<string, unknown>) => {
  const utils = render(<Knob testID="knob" size={SIZE} min={0} max={100} {...props} />);
  // Paths are derived from measured layout, so nothing is drawn until the knob is laid out.
  act(() =>
    utils.getByTestId('knob').props.onLayout({
      nativeEvent: { layout: { width: SIZE, height: SIZE } },
    })
  );
  return utils;
};

/** Stroke colors of every emitted path, in draw order. */
const strokes = (utils: ReturnType<typeof render>) =>
  utils.queryAllByTestId('Path').map((path) => path.props.stroke);

describe("Knob ring segments - segmentMode 'track' (default)", () => {
  it('paints every band regardless of the current value', () => {
    const low = renderKnob({ value: 5, appearance: { ring: { segments: ZONES } } });

    expect(strokes(low)).toEqual(expect.arrayContaining(ZONES.map((zone) => zone.color)));
  });

  it('keeps the plain progress stroke on top of the bands', () => {
    const utils = renderKnob({
      value: 72,
      appearance: {
        ring: { segments: ZONES },
        progress: { mode: 'contiguous', color: PROGRESS_COLOR },
      },
    });

    const drawn = strokes(utils);
    expect(drawn).toContain(PROGRESS_COLOR);
    // The progress arc draws after the bands, so it is not hidden behind them.
    expect(drawn.indexOf(PROGRESS_COLOR)).toBeGreaterThan(drawn.indexOf(ZONES[2].color));
  });
});

describe("Knob ring segments - segmentMode 'progress'", () => {
  const progressAppearance = (extra: Record<string, unknown> = {}) => ({
    ring: { segments: ZONES, segmentMode: 'progress' as const },
    ...extra,
  });

  it('clips the bands at the current value', () => {
    // 72 of 100 covers the 60-unit green band and 12 units into the amber one; red is
    // entirely past the value and must not be drawn.
    const utils = renderKnob({ value: 72, appearance: progressAppearance() });

    const drawn = strokes(utils);
    expect(drawn).toContain(ZONES[0].color);
    expect(drawn).toContain(ZONES[1].color);
    expect(drawn).not.toContain(ZONES[2].color);
  });

  it('draws every band once the value reaches the top', () => {
    const utils = renderKnob({ value: 100, appearance: progressAppearance() });

    expect(strokes(utils)).toEqual(expect.arrayContaining(ZONES.map((zone) => zone.color)));
  });

  it('draws no bands at the bottom of the range', () => {
    const utils = renderKnob({ value: 0, appearance: progressAppearance() });

    const drawn = strokes(utils);
    ZONES.forEach((zone) => expect(drawn).not.toContain(zone.color));
  });

  it('suppresses the plain progress stroke, which the bands replace', () => {
    const utils = renderKnob({
      value: 72,
      appearance: progressAppearance({
        progress: { mode: 'contiguous', color: PROGRESS_COLOR },
      }),
    });

    expect(strokes(utils)).not.toContain(PROGRESS_COLOR);
  });

  it('leaves split progress alone, which renders its own two arcs', () => {
    const utils = renderKnob({
      value: 72,
      appearance: progressAppearance({
        progress: { mode: 'split', color: PROGRESS_COLOR },
        panning: { pivotValue: 50, positiveColor: PROGRESS_COLOR },
      }),
    });

    const drawn = strokes(utils);
    expect(drawn).toContain(PROGRESS_COLOR);
    // Falling back to track mode means the full set of bands is painted.
    expect(drawn).toEqual(expect.arrayContaining(ZONES.map((zone) => zone.color)));
  });
});
