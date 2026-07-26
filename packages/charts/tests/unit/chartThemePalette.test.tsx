import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  ChartThemeProvider,
  useChartTheme,
  DEFAULT_ACCENT_PALETTE_LIGHT,
  DEFAULT_ACCENT_PALETTE_DARK,
} from '../../src/theme/ChartThemeContext';

const Probe: React.FC<{ onRead: (p: string[]) => void }> = ({ onRead }) => {
  onRead(useChartTheme().colors.accentPalette ?? []);
  return <Text testID="probe" />;
};

const paletteFor = (props: React.ComponentProps<typeof ChartThemeProvider>) => {
  let seen: string[] = [];
  render(<ChartThemeProvider {...props}><Probe onRead={(p) => { seen = p; }} /></ChartThemeProvider>);
  return seen;
};

describe('default accent palette selection', () => {
  it('uses the light palette on a light surface', () => {
    expect(paletteFor({ children: null, hostThemeBridge: { background: '#ffffff' } }))
      .toEqual(DEFAULT_ACCENT_PALETTE_LIGHT);
  });

  it('switches to the dark palette on a dark surface', () => {
    // The light steps drop to ~2:1 contrast here, so reusing them would be unreadable.
    expect(paletteFor({ children: null, hostThemeBridge: { background: '#1a1a19' } }))
      .toEqual(DEFAULT_ACCENT_PALETTE_DARK);
  });

  it('lets an explicit host palette win over both defaults', () => {
    const custom = ['#111111', '#222222'];
    expect(paletteFor({ children: null, hostThemeBridge: { background: '#1a1a19', accentPalette: custom } }))
      .toEqual(custom);
  });

  it('lets an explicit theme value win over both defaults', () => {
    const custom = ['#333333', '#444444'];
    expect(paletteFor({ children: null, value: { colors: { background: '#1a1a19', accentPalette: custom } as any } }))
      .toEqual(custom);
  });

  it('defaults to light when no surface is given', () => {
    expect(paletteFor({ children: null })).toEqual(DEFAULT_ACCENT_PALETTE_LIGHT);
  });
});
