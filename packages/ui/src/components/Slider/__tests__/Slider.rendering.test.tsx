import React from 'react';
import { render } from '@testing-library/react-native';
import { Slider, RangeSlider } from '../Slider';

const palette = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'];
const mockTheme = {
  colors: {
    primary: palette,
    gray: palette,
  },
  text: {
    primary: '#101010',
    secondary: '#505050',
  },
  semantic: {
    borderSubtle: '#e5e5e5',
  },
  backgrounds: {
    border: '#d0d0d0',
  },
  shadows: {
    // `xs` is Card's component default shadow — without it the value-label
    // Card renders shadowless and the snapshot stops covering the real path.
    xs: '0px 1px 2px rgba(0,0,0,0.1)',
    sm: '0px 1px 2px rgba(0,0,0,0.15)',
    md: '0px 2px 4px rgba(0,0,0,0.2)',
    lg: '0px 4px 10px rgba(0,0,0,0.25)',
    xl: '0px 8px 20px rgba(0,0,0,0.3)',
  },
};

jest.mock('../../../core/theme', () => ({
  useTheme: () => mockTheme,
}));

describe('Slider - rendering', () => {
  it('matches snapshot for a horizontal slider with ticks and value labels', () => {
    const tree = render(
      <Slider
        label="Playback speed"
        value={45}
        min={0}
        max={90}
        showTicks
        ticks={[0, 45, 90].map((value) => ({ value, label: `${value}%` }))}
        valueLabelAlwaysOn
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for a vertical range slider layout', () => {
    const tree = render(
      <RangeSlider
        label="Viewport"
        value={[20, 70]}
        min={0}
        max={100}
        orientation="vertical"
        valueLabelAlwaysOn
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for a compact slider with a custom formatter', () => {
    const tree = render(
      <Slider
        label="Gain"
        value={12}
        min={-20}
        max={20}
        size="sm"
        valueLabel={(val) => `${val} dB`}
        valueLabelAlwaysOn
        showTicks
        ticks={[-20, -10, 0, 10, 20].map((value) => ({ value }))}
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for a horizontal range slider with ticks', () => {
    const tree = render(
      <RangeSlider
        label="Selection"
        value={[10, 40]}
        min={0}
        max={60}
        showTicks
        ticks={[0, 20, 40, 60].map((value) => ({ value, label: `${value}` }))}
        valueLabelAlwaysOn
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('forwards valueLabelProps to the value-label Text', () => {
    const { StyleSheet } = require('react-native');
    const { getByText } = render(
      <Slider
        value={42}
        valueLabelAlwaysOn
        valueLabel={() => 'value-X'}
        valueLabelProps={{ weight: '700', style: { letterSpacing: 1.5 } }}
      />
    );
    const flat = StyleSheet.flatten((getByText('value-X') as any).props.style) || {};
    expect(flat).toMatchObject({ fontWeight: '700', letterSpacing: 1.5 });
  });

  it('forwards tickLabelProps to each tick label Text', () => {
    const { StyleSheet } = require('react-native');
    const { getByText } = render(
      <Slider
        value={50}
        min={0}
        max={100}
        ticks={[0, 50, 100].map((value) => ({ value, label: `tick-${value}` }))}
        showTicks
        tickLabelProps={{ weight: '600', style: { fontStyle: 'italic' } }}
      />
    );
    const flat = StyleSheet.flatten((getByText('tick-50') as any).props.style) || {};
    expect(flat).toMatchObject({ fontWeight: '600', fontStyle: 'italic' });
  });
});
