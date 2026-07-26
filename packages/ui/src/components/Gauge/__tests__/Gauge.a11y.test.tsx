/**
 * Gauge - value reporting to assistive tech.
 *
 * The Gauge has no docs page to check by hand, so this is where its accessibility contract
 * is pinned: a value-bearing role, and the value published in the form each platform reads.
 */

import React from 'react';
import { Platform } from 'react-native';
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
    G: stub('G'),
    Text: stub('SvgText'),
    Defs: stub('Defs'),
    LinearGradient: stub('LinearGradient'),
    Stop: stub('Stop'),
  };
});

import { Gauge } from '../Gauge';

const originalOS = Platform.OS;
const setPlatform = (os: string) => {
  (Platform as unknown as { OS: string }).OS = os;
};
afterAll(() => setPlatform(originalOS));

const renderGauge = () =>
  render(<Gauge testID="gauge" value={42} min={0} max={200} />).getByTestId('gauge');

describe('Gauge accessibility', () => {
  it('carries a value-bearing role, without which the value has nowhere to land', () => {
    setPlatform('web');

    expect(renderGauge().props.accessibilityRole).toBe('progressbar');
  });

  it('publishes the value as aria-* on web, which is all react-native-web reads', () => {
    setPlatform('web');
    const gauge = renderGauge();

    expect(gauge.props['aria-valuemin']).toBe(0);
    expect(gauge.props['aria-valuemax']).toBe(200);
    expect(gauge.props['aria-valuenow']).toBe(42);
  });

  it('publishes it as the RN object on native', () => {
    setPlatform('ios');
    const gauge = renderGauge();

    expect(gauge.props.accessibilityValue).toEqual({ min: 0, max: 200, now: 42 });
    expect(gauge.props['aria-valuenow']).toBeUndefined();
  });
});
