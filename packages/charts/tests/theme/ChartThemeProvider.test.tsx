import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { ChartThemeProvider, useChartTheme } from '../../src/theme/ChartThemeContext';

describe('ChartThemeProvider', () => {
  it('merges theme overrides with defaults', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ChartThemeProvider
        value={{
          colors: {
            textPrimary: '#222222',
            textSecondary: '#888888',
            background: '#ffffff',
            grid: '#dddddd',
            accentPalette: ['#2563eb', '#7c3aed'],
          },
          fontSize: { xs: 10, sm: 12, md: 18, lg: 22 },
        }}
      >
        {children}
      </ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    expect(result.current.colors.textPrimary).toBe('#222222');
    expect(result.current.fontSize.md).toBe(18);
    expect(result.current.colors.accentPalette.length).toBeGreaterThan(0);
  });

  it('derives values from host theme bridge and updates palette', () => {
    const hostTheme = {
      text: { primary: '#111111', secondary: '#666666' },
      backgrounds: { surface: '#0f172a' },
      colors: { primary: ['#2563eb', '#1d4ed8'] },
    };

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ChartThemeProvider hostThemeBridge={{
        textPrimary: hostTheme.text.primary,
        textSecondary: hostTheme.text.secondary,
        background: hostTheme.backgrounds.surface,
        accentPalette: [...hostTheme.colors.primary],
      }}>
        {children}
      </ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    expect(result.current.colors.textPrimary).toBe('#111111');
    expect(result.current.colors.background).toBe('#0f172a');
    expect(result.current.colors.accentPalette).toEqual(hostTheme.colors.primary);
  });
});
