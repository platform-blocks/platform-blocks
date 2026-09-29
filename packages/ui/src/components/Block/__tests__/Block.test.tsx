import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { Block } from '../Block';

/** How many entries of a (nested) style array set `key`. */
const timesSet = (style: unknown, key: string): number =>
  Array.isArray(style)
    ? style.reduce((n: number, entry) => n + timesSet(entry, key), 0)
    : style != null && typeof style === 'object' && (style as Record<string, unknown>)[key] !== undefined
      ? 1
      : 0;

describe('Block', () => {
  it('applies the box props to its root once', () => {
    render(
      <Block testID="block" w={120} mah="full" bg="surface" opacity={0.5}>
        <Text>inside</Text>
      </Block>
    );
    const style = screen.getByTestId('block').props.style;
    expect(StyleSheet.flatten(style)).toMatchObject({
      width: 120,
      maxHeight: '100%',
      backgroundColor: DEFAULT_THEME.backgrounds.surface,
      opacity: 0.5,
    });
    for (const key of ['width', 'maxHeight', 'backgroundColor', 'opacity']) {
      expect(timesSet(style, key)).toBe(1);
    }
  });

  it('lets an explicit w win over fullWidth', () => {
    render(<Block testID="block" fullWidth w={200} />);
    expect(StyleSheet.flatten(screen.getByTestId('block').props.style).width).toBe(200);
  });
});
