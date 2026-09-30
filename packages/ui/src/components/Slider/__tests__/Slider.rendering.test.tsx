import React from 'react';
import { render } from '@testing-library/react-native';
import { Slider, RangeSlider } from '../Slider';

const palette = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'];
// The real default theme (labels render through <Text>, which reads the same
// mocked `useTheme`), with the palettes the slider paints with stubbed.
const mockDefaultTheme = jest.requireActual('../../../core/theme/defaultTheme').DEFAULT_THEME;
const mockTheme = {
  ...mockDefaultTheme,
  colors: { ...mockDefaultTheme.colors, primary: palette, gray: palette },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  ...jest.requireActual('../../../core/theme/ThemeProvider'),
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
        valueLabelProps={{ fw: '700', style: { letterSpacing: 1.5 } }}
      />
    );
    // The bubble is decorative (the thumb's aria-valuetext carries the value).
    const flat = StyleSheet.flatten((getByText('value-X', { includeHiddenElements: true }) as any).props.style) || {};
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
        tickLabelProps={{ fw: '600', style: { fontStyle: 'italic' } }}
      />
    );
    const flat = StyleSheet.flatten((getByText('tick-50') as any).props.style) || {};
    expect(flat).toMatchObject({ fontWeight: '600', fontStyle: 'italic' });
  });
});
