import React from 'react';
import { Text as RNText } from 'react-native';
import { render } from '@testing-library/react-native';

import { Ring } from '../Ring';

const circleLog: Array<Record<string, any>> = [];

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Svg = ({ children, ...props }: any) => React.createElement(View, props, children);
  const Circle = ({ children, ...props }: any) => {
    circleLog.push(props);
    return React.createElement(View, null, children);
  };

  return {
    __esModule: true,
    default: Svg,
    Circle,
  };
});

const mockTheme = {
  colorScheme: 'light',
  colors: {
    primary: { 5: '#2563eb' },
    gray: { 4: '#cbd5f5', 5: '#94a3b8' },
  },
  text: {
    secondary: '#475569',
    muted: '#94a3b8',
  },
  backgrounds: {
    border: '#e2e8f0',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

describe('Ring - behavior', () => {
  beforeEach(() => {
    circleLog.length = 0;
  });

  it('clamps values within bounds and exposes them via accessibility props', () => {
    const { getByTestId } = render(
      <Ring value={150} min={0} max={120} size={120} thickness={20} testID="ring-root" />
    );

    expect(circleLog).toHaveLength(2);

    const [, progressCircle] = circleLog;
    const radius = (120 - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    expect(progressCircle.strokeDashoffset).toBeCloseTo(0, 5);
    expect(progressCircle.strokeDasharray).toBe(`${circumference} ${circumference}`);

    const { props } = getByTestId('ring-root');
    expect([props['aria-valuemin'], props['aria-valuemax'], props['aria-valuenow']]).toEqual([0, 120, 120]);
    expect(props.role).toBe('progressbar');
    expect(props['aria-valuetext']).toBe('100%');
    expect(props.accessibilityRole).toBeUndefined();
  });

  it('is named by its caption, not a generic fallback', () => {
    const { getByTestId, rerender } = render(<Ring value={40} caption="Storage" testID="named-ring" />);
    expect(getByTestId('named-ring').props['aria-label']).toBe('Storage');

    rerender(<Ring value={40} testID="named-ring" />);
    expect(getByTestId('named-ring').props['aria-label']).toBeUndefined();

    rerender(<Ring value={40} caption="Storage" accessibilityLabel="Disk usage" testID="named-ring" />);
    expect(getByTestId('named-ring').props['aria-label']).toBe('Disk usage');
  });

  it('derives the progress stroke color from color stops when provided', () => {
    render(
      <Ring
        value={60}
        min={0}
        max={100}
        colorStops={[
          { value: 0, color: '#22d3ee' },
          { value: 50, color: '#0ea5e9' },
          { value: 75, color: '#0284c7' },
        ]}
      />
    );

    expect(circleLog).toHaveLength(2);
    const [, progressCircle] = circleLog;
    expect(progressCircle.stroke).toBe('#0ea5e9');
  });

  it('prefers progressColor callback and respects rounded cap toggles', () => {
    render(
      <Ring
        value={25}
        min={0}
        max={50}
        progressColor={(_, percent) => (percent >= 50 ? '#22c55e' : '#ef4444')}
        roundedCaps={false}
      />
    );

    expect(circleLog).toHaveLength(2);
    const [, progressCircle] = circleLog;
    expect(progressCircle.stroke).toBe('#22c55e');
    expect(progressCircle.strokeLinecap).toBe('butt');
  });

  it('uses the neutral track color for progress when neutral is true', () => {
    render(
      <Ring
        value={40}
        neutral
        size={80}
        thickness={10}
        colorStops={[{ value: 0, color: '#000' }]}
      />
    );

    expect(circleLog).toHaveLength(2);
    const [trackCircle, progressCircle] = circleLog;
    // The track is the theme's border role (no scheme-specific literals).
    expect(trackCircle.stroke).toBe('#e2e8f0');
    expect(progressCircle.stroke).toBe(trackCircle.stroke);
  });

  it('renders custom children via render props with contextual data', () => {
    const renderCenter = jest.fn(({ percent }) => <RNText testID="center-value">{`${percent}%`}</RNText>);

    const { getByTestId } = render(
      <Ring value={30} min={0} max={60} showValue={false}>
        {renderCenter}
      </Ring>
    );

    expect(renderCenter).toHaveBeenCalledWith(
      expect.objectContaining({ value: 30, percent: 50, min: 0, max: 60 })
    );
    expect(getByTestId('center-value').props.children).toBe('50%');
  });
});
