import React from 'react';
import { renderHook } from '@testing-library/react-native';

import { DEFAULT_THEME } from '../../theme/defaultTheme';
import { ThemeScope } from '../../theme/ThemeProvider';
import { mergeTheme } from '../../theme/utils';
import { extractStyleProps, resolveStyleProps, useStyleProps } from '../spacing';

describe('resolveStyleProps', () => {
  it('uses logical start/end properties for horizontal spacing', () => {
    expect(resolveStyleProps({ ml: 'sm', mr: 'md', pl: 'xs', pr: 'lg' })).toEqual({
      marginStart: 8,
      marginEnd: 12,
      paddingStart: 4,
      paddingEnd: 16,
    });
  });

  it('never emits physical left/right properties', () => {
    const style = resolveStyleProps({ m: 'md', mx: 'sm', p: 'lg', px: 'xs', ml: 1, pr: 2 }) as Record<string, unknown>;
    for (const key of Object.keys(style)) {
      expect(key).not.toMatch(/Left|Right|Horizontal/);
    }
  });

  it('expands shorthands and lets edge props win', () => {
    expect(resolveStyleProps({ m: 'md', mt: 'xs', mx: 'sm' })).toEqual({
      marginTop: 4,
      marginBottom: 12,
      marginStart: 8,
      marginEnd: 8,
    });
    expect(resolveStyleProps({ p: 4, py: 'sm', pb: 0 })).toEqual({
      paddingTop: 8,
      paddingBottom: 0,
      paddingStart: 4,
      paddingEnd: 4,
    });
  });

  it('resolves tokens through the given theme', () => {
    const theme = mergeTheme(DEFAULT_THEME, { spacing: { ...DEFAULT_THEME.spacing, md: '30px' } });
    expect(resolveStyleProps({ mt: 'md' }, theme)).toEqual({ marginTop: 30 });
    expect(resolveStyleProps({ mt: 'md' })).toEqual({ marginTop: 12 });
  });

  it('passes auto and zero through', () => {
    expect(resolveStyleProps({ mx: 'auto', mt: '0' })).toEqual({ marginStart: 'auto', marginEnd: 'auto', marginTop: 0 });
  });

  it('maps the box props to width / height and their bounds', () => {
    expect(resolveStyleProps({ w: 120, h: '50%', miw: 40, maw: 'full', mih: 10, mah: 300 })).toEqual({
      width: 120,
      height: '50%',
      minWidth: 40,
      maxWidth: '100%',
      minHeight: 10,
      maxHeight: 300,
    });
  });

  it('resolves bg through the theme and passes opacity through', () => {
    expect(resolveStyleProps({ bg: 'surface', opacity: 0.5 })).toEqual({
      backgroundColor: DEFAULT_THEME.backgrounds.surface,
      opacity: 0.5,
    });
    expect(resolveStyleProps({ bg: 'primary.5' })).toEqual({ backgroundColor: DEFAULT_THEME.colors.primary[5] });
    expect(resolveStyleProps({ bg: '#123456' })).toEqual({ backgroundColor: '#123456' });
  });

  it('returns a shared empty style when nothing is set', () => {
    expect(resolveStyleProps({})).toBe(resolveStyleProps({ m: undefined }));
  });
});

describe('extractStyleProps', () => {
  it('keeps its shape and leaves visibility props in otherProps', () => {
    const { styleProps, otherProps } = extractStyleProps({
      m: 'md',
      pt: 4,
      w: 'full',
      bg: 'surface',
      hiddenFrom: 'md',
      lightHidden: true,
      testID: 'x',
    } as Record<string, unknown>);
    expect(styleProps.m).toBe('md');
    expect(styleProps.pt).toBe(4);
    expect(styleProps.w).toBe('full');
    expect(styleProps.bg).toBe('surface');
    expect(styleProps).not.toHaveProperty('hiddenFrom');
    expect(otherProps).toEqual({ hiddenFrom: 'md', lightHidden: true, testID: 'x' });
  });
});

describe('useStyleProps', () => {
  it('resolves against the current theme and memoizes on values', () => {
    const theme = mergeTheme(DEFAULT_THEME, { spacing: { ...DEFAULT_THEME.spacing, lg: '40px' } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeScope theme={theme}>{children}</ThemeScope>
    );
    const { result, rerender } = renderHook(({ pl }: { pl: 'lg' | 'sm' }) => useStyleProps({ pl }), {
      wrapper,
      initialProps: { pl: 'lg' },
    });
    const first = result.current;
    expect(first).toEqual({ paddingStart: 40 });
    rerender({ pl: 'lg' });
    expect(result.current).toBe(first);
    rerender({ pl: 'sm' });
    expect(result.current).toEqual({ paddingStart: 8 });
  });
});
