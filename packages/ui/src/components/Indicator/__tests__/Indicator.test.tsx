import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Indicator } from '../Indicator';
import type { IndicatorProps } from '../types';
import { COMPONENT_SIZES } from '../../../core/theme';

const mockTheme = {
  colors: {
    success: ['#E6F4EA', '#C1EAC5', '#A3D9A5', '#7BC47F', '#57AE5B', '#3F9142', '#2F8132', '#207227'],
    surface: ['#FFFFFF', '#F5F5F5'],
  },
  shadows: {
    xs: '0px 1px 2px rgba(16, 24, 40, 0.1)',
  },
};

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

describe('Indicator - behavior', () => {
  it('falls back to theme tokens for size, fill, and ring', () => {
    const { UNSAFE_getByType } = render(<Indicator />);

    const styles = StyleSheet.flatten(UNSAFE_getByType(View).props.style);
    expect(styles.width).toBe(COMPONENT_SIZES.badge.sm);
    expect(styles.height).toBe(COMPONENT_SIZES.badge.sm);
    expect(styles.backgroundColor).toBe(mockTheme.colors.success[5]);
    expect(styles.borderColor).toBe(mockTheme.colors.surface[0]);
    expect(styles.borderWidth).toBe(1);
    // Indicators render flat — the ring, not a drop shadow, separates them from
    // whatever they sit on.
    expect(styles.boxShadow).toBeUndefined();
  });

  it('supports numeric sizes, custom colors, and merges style overrides', () => {
    const { UNSAFE_getByType, getByText } = render(
      <Indicator
        size={20}
        color="#FF3366"
        borderColor="#101828"
        borderWidth={3}
        offset={6}
        placement="top-left"
        style={{ opacity: 0.4 }}
      >
        <Text>!</Text>
      </Indicator>
    );

    const styles = StyleSheet.flatten(UNSAFE_getByType(View).props.style);
    expect(styles.width).toBe(20);
    expect(styles.height).toBe(20);
    expect(styles.backgroundColor).toBe('#FF3366');
    expect(styles.borderColor).toBe('#101828');
    expect(styles.borderWidth).toBe(3);
    expect(styles.top).toBe(-6);
    expect(styles.left).toBe(-6);
    expect(styles.opacity).toBe(0.4);
    expect(getByText('!')).toBeTruthy();
  });

  const placementCases: Array<[
    NonNullable<IndicatorProps['placement']>,
    Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  ]> = [
    ['top-left', { top: -8, left: -8 }],
    ['top-right', { top: -8, right: -8 }],
    ['bottom-left', { bottom: -8, left: -8 }],
    ['bottom-right', { bottom: -8, right: -8 }],
  ];

  it.each(placementCases)('positions indicator at %s corner', (placement, expected) => {
    const { UNSAFE_getByType } = render(
      <Indicator placement={placement} offset={8} />
    );

    const styles = StyleSheet.flatten(UNSAFE_getByType(View).props.style);
    expect(styles.top).toBe(expected.top);
    expect(styles.right).toBe(expected.right);
    expect(styles.bottom).toBe(expected.bottom);
    expect(styles.left).toBe(expected.left);
  });

  it('renders nothing when invisible is true', () => {
    const { toJSON } = render(<Indicator invisible />);
    expect(toJSON()).toBeNull();
  });
});
