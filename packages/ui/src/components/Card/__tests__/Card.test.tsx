import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { Card } from '../Card';
import { DEFAULT_SPACING_SCALE } from '../../../core/theme/scales';

const mockTheme = {
  backgrounds: {
    surface: '#FFFFFF',
    border: '#E4E7EC',
    subtle: '#F8FAFC',
    elevated: '#F4F6FB',
  },
  colors: {
    primary: ['#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5', '#4338CA'],
  },
  primaryColor: '#6366F1',
  shadows: {
    xs: '0px 1px 2px rgba(16, 24, 40, 0.1)',
    sm: '0px 1px 3px rgba(16, 24, 40, 0.1)',
    md: '0px 4px 6px rgba(16, 24, 40, 0.1)',
    lg: '0px 10px 15px rgba(16, 24, 40, 0.05)',
    none: 'none',
  },
};

const mockGradientRender = jest.fn();

jest.mock('../../../core/theme/ThemeProvider', () => {
  const actual = jest.requireActual('../../../core/theme/ThemeProvider');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

jest.mock('../../../utils/optionalDependencies', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    resolveLinearGradient: () => ({
      LinearGradient: ({ children, ...rest }: any) => {
        mockGradientRender(rest);
        return React.createElement(View, { testID: 'card-gradient', ...rest }, children);
      },
      hasLinearGradient: true,
    }),
  };
});

/** How many entries of a (nested) style array set `key`. */
const timesSet = (style: unknown, key: string): number =>
  Array.isArray(style)
    ? style.reduce((n: number, entry) => n + timesSet(entry, key), 0)
    : style != null && typeof style === 'object' && (style as Record<string, unknown>)[key] !== undefined
      ? 1
      : 0;

describe('Card - behavior', () => {
  beforeEach(() => {
     mockGradientRender.mockClear();
  });

  it('applies filled variant defaults with theme tokens', () => {
    const { getByTestId } = render(
      <Card {...({ testID: 'basic-card' } as any)}>
        <Text>Body</Text>
      </Card>
    );

    const card = getByTestId('basic-card');
    const styles = StyleSheet.flatten(card.props.style);

    expect(styles.backgroundColor).toBe(mockTheme.backgrounds.surface);
    expect(styles.padding).toBe(DEFAULT_SPACING_SCALE.md);
    expect(styles.borderRadius).toBe(6);
    expect(styles.position).toBe('relative');
  });

  it('applies bg once, in place of the variant fill', () => {
    const { getByTestId } = render(<Card testID="bg-card" variant="subtle" bg="primary" />);
    const style = getByTestId('bg-card').props.style;
    expect(StyleSheet.flatten(style).backgroundColor).toBe(mockTheme.colors.primary[1]);
    expect(timesSet(style, 'backgroundColor')).toBe(1);
  });

  it('honors spacing/layout props and outline styling', () => {
    const { getByTestId } = render(
      <Card
        {...({ testID: 'outline-card' } as any)}
        variant="outline"
        p="lg"
        fullWidth
        shadow="lg"
      >
        <Text>Outline</Text>
      </Card>
    );

    const card = getByTestId('outline-card');
    const styles = StyleSheet.flatten(card.props.style);

    expect(styles.backgroundColor).toBe('transparent');
    expect(styles.borderWidth).toBe(1);
    expect(styles.borderColor).toBe(mockTheme.backgrounds.border);
    expect(styles.width).toBe('100%');
    expect(styles.paddingTop).toBe(DEFAULT_SPACING_SCALE.lg);
    expect(styles.paddingEnd).toBe(DEFAULT_SPACING_SCALE.lg);
  });

  it('wraps pressable interactions with pressed and disabled styles', () => {
    const handlePress = jest.fn();
    const { getByText, rerender } = render(
      <Card variant="ghost" onPress={handlePress}>
        <Text>Tap me</Text>
      </Card>
    );

    fireEvent.press(getByText('Tap me'));
    expect(handlePress).toHaveBeenCalledTimes(1);

    rerender(
      <Card variant="ghost" onPress={handlePress} disabled>
        <Text>Tap me</Text>
      </Card>
    );

    fireEvent.press(getByText('Tap me'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('renders gradient overlays using resolved palette tokens', () => {
    const { getByTestId } = render(
      <Card {...({ testID: 'gradient-card' } as any)} variant="gradient">
        <Text>Fancy</Text>
      </Card>
    );

    const card = getByTestId('gradient-card');
    const styles = StyleSheet.flatten(card.props.style);
    // Gradient stops come from the shared resolveGradientStops helper: base [5] → deep [7].
    expect(styles.backgroundColor).toBe(mockTheme.colors.primary[5]);

    const gradient = getByTestId('card-gradient');
    expect(gradient).toBeTruthy();
      expect(mockGradientRender).toHaveBeenCalledWith(
      expect.objectContaining({
        colors: [mockTheme.colors.primary[5], mockTheme.colors.primary[7]],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        pointerEvents: 'none',
      })
    );
  });
});
