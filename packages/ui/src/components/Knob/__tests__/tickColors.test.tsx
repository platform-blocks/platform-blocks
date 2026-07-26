/**
 * Knob - per-tick colors, and the knob accent that follows them.
 *
 * A marks-sourced tick layer paints each tick with that mark's own `accentColor`, and
 * either color slot also accepts a resolver for full per-tick control. With
 * `appearance.accentFromMarks`, the nearest mark's accent becomes the knob's accent, so
 * the thumb matches the tick the dial has landed on. Tick lines are emitted as SVG
 * <Line>s, so the colors are read off their strokes.
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { View } from 'react-native';

jest.mock('react-native-svg', () => {
  const ReactModule = require('react');
  const { View: RNView } = require('react-native');
  const stub = (name: string) => {
    const Component = (props: Record<string, unknown>) =>
      ReactModule.createElement(RNView, { ...props, testID: props.testID ?? name });
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
const GRAY = '#475569';
const MARKS = [
  { value: 0, accentColor: '#f87171' },
  { value: 25, accentColor: '#4ade80' },
  { value: 50, accentColor: '#38bdf8' },
  { value: 75, accentColor: '#c084fc' },
];
const ACCENTS = MARKS.map((mark) => mark.accentColor);

const lineLayer = (overrides: Record<string, unknown> = {}) => ({
  source: 'marks' as const,
  shape: 'line' as const,
  inactiveColor: GRAY,
  ...overrides,
});

const renderKnob = (props: Record<string, unknown>) => {
  const utils = render(
    <Knob testID="knob" size={SIZE} min={0} max={100} marks={MARKS} {...props} />
  );
  act(() =>
    utils.getByTestId('knob').props.onLayout({
      nativeEvent: { layout: { width: SIZE, height: SIZE } },
    })
  );
  return utils;
};

/** Tick stroke colors in tick order. */
const tickStrokes = (utils: ReturnType<typeof render>) =>
  utils.queryAllByTestId('Line').map((line) => line.props.stroke as string);

/** The thumb is the only view pulled back by half its own size to centre itself. */
const thumbColor = (utils: ReturnType<typeof render>) => {
  for (const node of utils.UNSAFE_getAllByType(View as any)) {
    const style = node.props?.style;
    if (!Array.isArray(style)) continue;
    const fill = style.find(
      (entry: any) => entry && typeof entry.marginLeft === 'number' && entry.marginLeft < 0
    );
    if (fill?.backgroundColor) return fill.backgroundColor as string;
  }
  return undefined;
};

describe('Knob per-tick colors', () => {
  it("paints each lit tick with its own mark's accent", () => {
    const utils = renderKnob({ value: 100, appearance: { ticks: [lineLayer()] } });

    expect(tickStrokes(utils)).toEqual(ACCENTS);
  });

  it("leaves unlit ticks on the layer's inactive color", () => {
    const utils = renderKnob({ value: 0, appearance: { ticks: [lineLayer()] } });

    expect(tickStrokes(utils)).toEqual([ACCENTS[0], GRAY, GRAY, GRAY]);
  });

  it('lets a resolver override individual ticks and fall through on the rest', () => {
    const utils = renderKnob({
      value: 100,
      appearance: {
        ticks: [lineLayer({ color: ({ index }: { index: number }) => (index === 0 ? '#111111' : undefined) })],
      },
    });

    expect(tickStrokes(utils)).toEqual(['#111111', ...ACCENTS.slice(1)]);
  });

  it('resolves unlit ticks per tick too', () => {
    const utils = renderKnob({
      value: 0,
      appearance: {
        ticks: [
          lineLayer({
            inactiveColor: ({ mark }: { mark?: { accentColor?: string } }) =>
              mark?.accentColor ? `${mark.accentColor}44` : undefined,
          }),
        ],
      },
    });

    expect(tickStrokes(utils)).toEqual([
      ACCENTS[0],
      `${ACCENTS[1]}44`,
      `${ACCENTS[2]}44`,
      `${ACCENTS[3]}44`,
    ]);
  });

  it('keeps a flat layer color when marks carry no accent of their own', () => {
    const utils = render(
      <Knob
        testID="knob"
        size={SIZE}
        min={0}
        max={100}
        value={100}
        marks={[{ value: 0 }, { value: 50 }]}
        appearance={{ ticks: [lineLayer({ color: '#0ea5e9' })] }}
      />
    );
    act(() =>
      utils.getByTestId('knob').props.onLayout({
        nativeEvent: { layout: { width: SIZE, height: SIZE } },
      })
    );

    expect(tickStrokes(utils)).toEqual(['#0ea5e9', '#0ea5e9']);
  });
});

describe('Knob accentFromMarks', () => {
  it("gives the thumb the nearest mark's accent", () => {
    const utils = renderKnob({
      value: 52,
      appearance: { accentFromMarks: true, ticks: [lineLayer()] },
    });

    expect(thumbColor(utils)).toBe(ACCENTS[2]);
  });

  it('follows the value onto the next mark', () => {
    const low = renderKnob({ value: 2, appearance: { accentFromMarks: true } });
    const high = renderKnob({ value: 74, appearance: { accentFromMarks: true } });

    expect(thumbColor(low)).toBe(ACCENTS[0]);
    expect(thumbColor(high)).toBe(ACCENTS[3]);
  });

  it('leaves the theme accent alone when not opted in', () => {
    const utils = renderKnob({ value: 52 });

    expect(ACCENTS).not.toContain(thumbColor(utils));
  });

  it('stays on the theme accent for marks with no accent of their own', () => {
    const optedIn = render(
      <Knob testID="knob" size={SIZE} min={0} max={100} value={52} marks={[{ value: 50 }]} appearance={{ accentFromMarks: true }} />
    );
    const plain = render(<Knob testID="plain" size={SIZE} min={0} max={100} value={52} />);

    expect(thumbColor(optedIn)).toBe(thumbColor(plain));
  });

  it('does not tint a disabled knob', () => {
    const utils = renderKnob({ value: 52, disabled: true, appearance: { accentFromMarks: true } });

    expect(ACCENTS).not.toContain(thumbColor(utils));
  });
});
