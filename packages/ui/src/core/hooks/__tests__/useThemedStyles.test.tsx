import React from 'react';
import { renderHook } from '@testing-library/react-native';

import { PlatformBlocksThemeProvider } from '../../theme/ThemeProvider';
import { DEFAULT_THEME } from '../../theme/defaultTheme';
import type { PlatformBlocksTheme } from '../../theme/types';
import { createThemedStyles, useThemedStyles } from '../useThemedStyles';

describe('useThemedStyles', () => {
  it('builds once per theme + deps', () => {
    // A plain style table: what's under test is the memoization.
    const factory = jest.fn((theme: PlatformBlocksTheme) => ({ root: { color: theme.text.primary } }));
    const { result, rerender } = renderHook(({ gap }: { gap: number }) => useThemedStyles((t) => factory(t), [gap]), {
      initialProps: { gap: 4 },
    });
    const first = result.current;
    rerender({ gap: 4 });
    expect(result.current).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);
    rerender({ gap: 8 });
    expect(result.current).not.toBe(first);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('rebuilds when the theme changes', () => {
    const factory = jest.fn((theme: PlatformBlocksTheme) => ({ color: theme.text.primary }));
    let theme: PlatformBlocksTheme = DEFAULT_THEME;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlatformBlocksThemeProvider theme={theme}>{children}</PlatformBlocksThemeProvider>
    );
    const { result, rerender } = renderHook(() => useThemedStyles(factory), { wrapper });
    expect(result.current.color).toBe(DEFAULT_THEME.text.primary);
    theme = { ...DEFAULT_THEME, text: { ...DEFAULT_THEME.text, primary: '#123456' } };
    rerender({});
    expect(result.current.color).toBe('#123456');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe('createThemedStyles', () => {
  it('caches per theme and per full argument list', () => {
    const factory = jest.fn((theme: PlatformBlocksTheme, size: string, variant?: string) => ({ size, variant, color: theme.text.primary }));
    const getStyles = createThemedStyles(factory);

    const a = getStyles(DEFAULT_THEME, 'md', 'filled');
    expect(getStyles(DEFAULT_THEME, 'md', 'filled')).toBe(a);
    expect(factory).toHaveBeenCalledTimes(1);

    // Every argument is part of the key.
    expect(getStyles(DEFAULT_THEME, 'md', 'outline')).not.toBe(a);
    expect(getStyles(DEFAULT_THEME, 'lg', 'filled')).not.toBe(a);
    expect(getStyles(DEFAULT_THEME, 'md', undefined)).not.toBe(getStyles(DEFAULT_THEME, 'md', 'undefined'));

    // And so is the theme.
    const other = { ...DEFAULT_THEME };
    expect(getStyles(other, 'md', 'filled')).not.toBe(a);
    expect(getStyles(other, 'md', 'filled')).toBe(getStyles(other, 'md', 'filled'));
  });

  it('keeps numbers and numeric strings apart', () => {
    const getStyles = createThemedStyles((_theme: PlatformBlocksTheme, size: string | number) => ({ size }));
    expect(getStyles(DEFAULT_THEME, 1)).not.toBe(getStyles(DEFAULT_THEME, '1'));
  });
});
