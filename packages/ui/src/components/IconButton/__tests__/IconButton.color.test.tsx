/**
 * IconButton color API tests — `color` is the one tint prop.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { IconButton } from '../IconButton';

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    impactPressIn: jest.fn(),
    impactPressOut: jest.fn(),
  }),
}));

/** Flattened style of the Pressable, which carries fill and border. */
const pressableStyle = (element: any) =>
  StyleSheet.flatten(
    typeof element.props.style === 'function'
      ? element.props.style({ pressed: false })
      : element.props.style
  );

describe('IconButton - color', () => {
  it('tints the filled variant via `color`', () => {
    const tinted = render(
      <IconButton icon="heart" variant="filled" color="error" testID="tinted" />
    );
    const plain = render(<IconButton icon="heart" variant="filled" testID="plain" />);

    expect(pressableStyle(tinted.getByTestId('tinted')).backgroundColor).not.toBe(
      pressableStyle(plain.getByTestId('plain')).backgroundColor
    );
  });

  it('accepts raw CSS colors and `palette.shade` tokens', () => {
    const raw = render(
      <IconButton icon="heart" variant="filled" color="#9333EA" testID="raw" />
    );
    const shade = render(
      <IconButton icon="heart" variant="filled" color="primary.7" testID="shade" />
    );
    const base = render(
      <IconButton icon="heart" variant="filled" color="primary" testID="base" />
    );

    expect(pressableStyle(raw.getByTestId('raw')).backgroundColor).toBe('#9333EA');
    expect(pressableStyle(shade.getByTestId('shade')).backgroundColor).not.toBe(
      pressableStyle(base.getByTestId('base')).backgroundColor
    );
  });

  it('keeps the neutral `default` variant neutral when a color is supplied', () => {
    const tinted = render(
      <IconButton icon="heart" color="error" testID="tinted" />
    );
    const plain = render(<IconButton icon="heart" testID="plain" />);

    expect(pressableStyle(tinted.getByTestId('tinted')).backgroundColor).toBe(
      pressableStyle(plain.getByTestId('plain')).backgroundColor
    );
  });

  it('does not leak `color` onto the underlying Pressable props', () => {
    const { getByTestId } = render(
      <IconButton icon="heart" variant="filled" color="error" testID="button" />
    );
    expect(getByTestId('button').props.color).toBeUndefined();
  });
});
