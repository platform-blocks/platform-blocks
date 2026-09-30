/**
 * Gauge - value reporting to assistive tech (native).
 *
 * The Gauge has no docs page to check by hand, so this is where its accessibility contract
 * is pinned: a value-bearing role, and the value published as aria-value* (React Native maps
 * them to its accessibility value; react-native-web writes them to the DOM — see
 * __web_tests__/Gauge.web.test.tsx, where the role is `meter`).
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
    G: stub('G'),
    Text: stub('SvgText'),
    Defs: stub('Defs'),
    LinearGradient: stub('LinearGradient'),
    Stop: stub('Stop'),
  };
});

import { Gauge } from '../Gauge';

const renderGauge = (props: Partial<React.ComponentProps<typeof Gauge>> = {}) =>
  render(<Gauge testID="gauge" value={42} min={0} max={200} {...props} />).getByTestId('gauge');

describe('Gauge accessibility (native)', () => {
  it('carries a value-bearing role (native has no meter role, so progressbar)', () => {
    const gauge = renderGauge();
    expect(gauge.props.role).toBe('progressbar');
    expect(gauge.props.accessibilityRole).toBeUndefined();
  });

  it('publishes the value as aria-* (never the dropped accessibilityValue object)', () => {
    const gauge = renderGauge();

    expect(gauge.props['aria-valuemin']).toBe(0);
    expect(gauge.props['aria-valuemax']).toBe(200);
    expect(gauge.props['aria-valuenow']).toBe(42);
    expect(gauge.props['aria-valuetext']).toBe('42');
    expect(gauge.props.accessibilityValue).toBeUndefined();
  });

  it('speaks the formatted value and the band it falls in', () => {
    const gauge = renderGauge({
      labels: { formatter: (v: number) => `${v} rpm` },
      ranges: [
        { from: 0, to: 100, color: '#22c55e', label: 'Normal' },
        { from: 100, to: 200, color: '#ef4444', label: 'Redline' },
      ],
    });
    expect(gauge.props['aria-valuetext']).toBe('42 rpm, Normal');
  });

  it('uses aria-label as its name and never invents a generic one', () => {
    expect(renderGauge({ 'aria-label': 'Engine speed' }).props['aria-label']).toBe('Engine speed');
    expect(renderGauge().props['aria-label']).toBeUndefined();
  });

  it('exposes the compound parts as statics', () => {
    expect(typeof Gauge.Track).toBe('object');
    expect(Gauge.Needle.displayName).toBe('Gauge.Needle');
  });
});
