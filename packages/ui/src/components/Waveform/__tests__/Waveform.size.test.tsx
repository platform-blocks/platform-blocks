/**
 * Waveform — size token & variant tests.
 *
 * react-native-svg is stubbed to Views tagged with the SVG element name, so the
 * geometry props (width/height/rx/strokeWidth/stopColor) can be asserted from
 * the rendered tree.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

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
    Rect: stub('Rect'),
    G: stub('G'),
    Text: stub('SvgText'),
    Defs: stub('Defs'),
    LinearGradient: stub('LinearGradient'),
    Stop: stub('Stop'),
  };
});

import { Waveform } from '../Waveform';

const PEAKS = [0.1, 0.6, 0.3, 0.9, 0.4, 0.2, 0.75, 0.5, 0.35, 0.65];

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

const draw = (element: React.ReactElement) => {
  const utils = render(element);
  const svg = utils.getByTestId('Svg');
  const bars = utils.queryAllByTestId('Rect');
  const paths = utils.queryAllByTestId('Path');
  const stops = utils.queryAllByTestId('Stop');
  return { utils, svg, bars, paths, stops };
};

describe('Waveform - size tokens', () => {
  it('defaults to the md metrics when size is omitted', () => {
    const { svg, bars } = draw(<Waveform peaks={PEAKS} />);
    expect(svg.props.height).toBe(60);
    expect(bars[0].props.width).toBe(2);
  });

  it('matches the md token when size is omitted', () => {
    const omitted = draw(<Waveform peaks={PEAKS} />);
    const explicit = draw(<Waveform peaks={PEAKS} size="md" />);
    expect(omitted.svg.props.height).toBe(explicit.svg.props.height);
    expect(omitted.bars[0].props.width).toBe(explicit.bars[0].props.width);
  });

  it.each(SIZES)('renders the %s size token', (size) => {
    const { svg, bars } = draw(<Waveform peaks={PEAKS} size={size} />);
    expect(typeof svg.props.height).toBe('number');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('scales height and bar width monotonically across tokens', () => {
    const heights: number[] = [];
    const widths: number[] = [];

    SIZES.forEach((size) => {
      const { svg, bars } = draw(<Waveform peaks={PEAKS} size={size} />);
      heights.push(svg.props.height);
      widths.push(bars[0].props.width);
    });

    heights.forEach((value, index) => {
      if (index > 0) expect(value).toBeGreaterThan(heights[index - 1]);
    });
    widths.forEach((value, index) => {
      if (index > 0) expect(value).toBeGreaterThanOrEqual(widths[index - 1]);
    });
    expect(widths[widths.length - 1]).toBeGreaterThan(widths[0]);
  });

  it('scales the line variant stroke width', () => {
    const thin = draw(<Waveform peaks={PEAKS} size="xs" variant="line" />);
    const thick = draw(<Waveform peaks={PEAKS} size="3xl" variant="line" />);
    expect(thick.paths[0].props.strokeWidth).toBeGreaterThan(thin.paths[0].props.strokeWidth);
  });

  it('treats a numeric size as the waveform height', () => {
    const { svg, bars } = draw(<Waveform peaks={PEAKS} size={120} />);
    expect(svg.props.height).toBe(120);
    expect(bars[0].props.width).toBe(4);
  });

  it('lets explicit props override the token they derive from', () => {
    const { svg, bars } = draw(<Waveform peaks={PEAKS} size="3xl" h={40} barWidth={1} />);
    expect(svg.props.height).toBe(40);
    expect(bars[0].props.width).toBe(1);
  });
});

describe('Waveform - variants', () => {
  it('rounds bar corners for the rounded variant only', () => {
    const square = draw(<Waveform peaks={PEAKS} variant="bars" />);
    const rounded = draw(<Waveform peaks={PEAKS} variant="rounded" />);

    expect(square.bars[0].props.rx).toBe(0);
    expect(rounded.bars[0].props.rx).toBeGreaterThan(0);
  });

  it('draws a path for the line variant instead of bars', () => {
    const { bars, paths } = draw(<Waveform peaks={PEAKS} variant="line" />);
    expect(paths.length).toBeGreaterThan(0);
    expect(typeof paths[0].props.d).toBe('string');
    expect(bars.length).toBe(0);
  });

  it('derives gradient stops from color when gradientColors is omitted', () => {
    const { stops, bars } = draw(<Waveform peaks={PEAKS} variant="gradient" color="primary" />);

    expect(stops.length).toBe(2);
    stops.forEach((stop) => expect(stop.props.stopColor).toMatch(/^(#|rgb)/));
    expect(stops[0].props.stopColor).not.toBe(stops[1].props.stopColor);
    expect(bars.length).toBeGreaterThan(0);
  });

  it('uses explicit gradientColors when provided', () => {
    const { stops } = draw(
      <Waveform
        peaks={PEAKS}
        variant="gradient"
        gradientColors={['#ff0000', '#00ff00', '#0000ff']}
      />
    );

    expect(stops.map((stop) => stop.props.stopColor)).toEqual(['#ff0000', '#00ff00', '#0000ff']);
  });
});
