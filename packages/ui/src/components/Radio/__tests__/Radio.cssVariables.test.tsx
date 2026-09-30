import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import type { PlocksTheme } from '../../../core/theme/types';
import { Radio, RadioGroup, getRadioPalette } from '../Radio';

/**
 * A theme after `withCssVariableColors` has run: `text` / `backgrounds` are
 * `var()` references, and the literals it rewrote live on `literalColors`.
 * Nothing in the control may reach for the reference to *measure* it — a
 * `var()` has no channels to interpolate or composite.
 */
const literalText = { ...DEFAULT_THEME.text };
const literalBackgrounds = { ...DEFAULT_THEME.backgrounds };
const asVar = <T extends Record<string, string | undefined>>(values: T, prefix: string): T =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value ? `var(--plocks-${prefix}-${key}, ${value})` : value])
  ) as T;

const mockCssVarTheme: PlocksTheme = {
  ...DEFAULT_THEME,
  text: asVar(literalText, 'text'),
  backgrounds: asVar(literalBackgrounds, 'bg'),
  literalColors: { text: literalText, backgrounds: literalBackgrounds },
};

jest.mock('../../../core/theme/ThemeProvider', () => {
  const actual = jest.requireActual('../../../core/theme/ThemeProvider');
  return {
    ...actual,
    useTheme: () => mockCssVarTheme,
  };
});

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('Radio under a CSS-variable theme', () => {
  it('takes every interpolated color from the literals, not the var() references', () => {
    for (const disabled of [false, true]) {
      const palette = getRadioPalette(mockCssVarTheme, { disabled, error: false, color: 'primary' });
      expect(palette.holeColor).toBe(literalBackgrounds.surface);
      for (const value of Object.values(palette)) expect(value).not.toMatch(/var\(/);
    }
  });

  it.each([false, true])('renders without interpolating a var() (checked: %s)', (checked) => {
    expect(() => render(<Radio value="a" checked={checked} label="Alpha" onChange={() => {}} />)).not.toThrow();
  });

  it('tints the selected card against the real surface instead of falling back to the flat accent', () => {
    const { getByTestId } = render(
      <RadioGroup options={options} value="a" variant="card" testID="cards" onChange={() => {}} />
    );

    const { backgroundColor } = StyleSheet.flatten(getByTestId('cards-option-0').props.style);

    // A composite of accent over surface — neither endpoint, and not a `var()`.
    expect(backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(backgroundColor).not.toBe(DEFAULT_THEME.colors.primary[6]);
    expect(backgroundColor).not.toBe(literalBackgrounds.surface);
  });
});
