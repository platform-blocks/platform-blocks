import React from 'react';
import { render } from '@testing-library/react-native';

import { Radio, RadioGroup } from '../Radio';
import { getRadioMetrics } from '../styles';

/**
 * A theme after `withCssVariableColors` has run: `text`/`backgrounds` are
 * `var()` references, and the literals it rewrote live on `literalColors`.
 * Nothing in the control may reach for the reference to *measure* it — a
 * `var()` has no channels to interpolate or composite.
 */
const cssVarTheme: any = {
  colorScheme: 'dark',
  colors: {
    primary: ['#EDF2FF', '#DBE4FF', '#BAC8FF', '#91A7FF', '#748FFC', '#5C7CFA', '#4C6EF5', '#3B5BDB'],
    secondary: ['#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#868E96', '#495057'],
    success: ['#EBF8EA', '#C6F6D5', '#9AE6B4', '#68D391', '#48BB78', '#38A169', '#2F855A', '#276749'],
    warning: ['#FFF9DB', '#FFF3BF', '#FFEC99', '#FFE066', '#FFD43B', '#FCC419', '#FAB005', '#F59F00'],
    error: ['#FFF5F5', '#FFE3E3', '#FFC9C9', '#FFA8A8', '#FF8787', '#FF6B6B', '#FA5252', '#F03E3E'],
    gray: ['#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#868E96', '#495057'],
  },
  text: {
    primary: 'var(--platform-blocks-text-primary, #F2F2F7)',
    secondary: 'var(--platform-blocks-text-secondary, #AEAEB2)',
    disabled: 'var(--platform-blocks-text-disabled, #6E6E73)',
    onPrimary: 'var(--platform-blocks-text-on-primary, #FFFFFF)',
  },
  backgrounds: {
    base: 'var(--platform-blocks-bg-base, #000000)',
    subtle: 'var(--platform-blocks-bg-subtle, #141416)',
    surface: 'var(--platform-blocks-bg-surface, #1C1C1F)',
    elevated: 'var(--platform-blocks-bg-elevated, #2C2C2E)',
    border: 'var(--platform-blocks-border-color, #38383A)',
  },
  literalColors: {
    text: {
      primary: '#F2F2F7',
      secondary: '#AEAEB2',
      disabled: '#6E6E73',
      onPrimary: '#FFFFFF',
    },
    backgrounds: {
      base: '#000000',
      subtle: '#141416',
      surface: '#1C1C1F',
      elevated: '#2C2C2E',
      border: '#38383A',
    },
  },
  spacing: { sm: '8', md: '12' },
};

/** Declared after the theme: `jest.mock` hoisting moves anything the theme reads above it. */
const surfaceHex = cssVarTheme.literalColors.backgrounds.surface;

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => cssVarTheme,
  };
});

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

// The label chrome is not what is under test, and it reads theme keys this slim
// theme deliberately omits.
jest.mock('../../Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ children, ...rest }: any) => React.createElement(Text, rest, children),
  };
});

jest.mock('../../_internal/FieldHeader', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    FieldHeader: ({ label }: any) =>
      (typeof label === 'string' ? React.createElement(Text, null, label) : label ?? null),
  };
});

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('Radio under a CSS-variable theme', () => {
  it('takes the hole color from the literals, not the var() reference', () => {
    const metrics = getRadioMetrics({
      checked: false,
      size: 'md',
      color: 'primary',
      theme: cssVarTheme,
    } as any);

    // `holeColor` is an endpoint of a color interpolation, so it has to be a
    // color the animation can parse.
    expect(metrics.holeColor).toBe(surfaceHex);
    expect(metrics.holeColor).not.toMatch(/var\(/);
    expect(metrics.dotColor).not.toMatch(/var\(/);
  });

  it.each([false, true])('renders without interpolating a var() (checked: %s)', (checked) => {
    expect(() =>
      render(<Radio value="a" checked={checked} label="Alpha" onChange={() => {}} />)
    ).not.toThrow();
  });

  it('tints the selected card against the real surface instead of falling back to the flat accent', () => {
    const { getByTestId } = render(
      <RadioGroup options={options} value="a" variant="card" testID="cards" onChange={() => {}} />
    );

    const selected = getByTestId('cards-option-0');
    const { backgroundColor } = selected.props.style;

    // A composite of accent over surface — neither endpoint, and not a `var()`.
    expect(backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(backgroundColor).not.toBe(cssVarTheme.colors.primary[6]);
    expect(backgroundColor).not.toBe(surfaceHex);
  });
});
