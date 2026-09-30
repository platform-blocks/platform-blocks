import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Badge } from '../Badge';

const styleOf = (node: { props: { [key: string]: unknown } }) =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) as Record<string, unknown>;

describe('Badge', () => {
  it('renders its label, 20px tall at md', () => {
    const { getByTestId, getByText } = render(<Badge testID="badge">New</Badge>);
    expect(getByText('New')).toBeTruthy();
    expect(styleOf(getByTestId('badge')).height).toBe(20);
  });

  it('scales height and label typography across size tokens', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
    const { getByTestId, getByText } = render(
      <>{sizes.map((size) => <Badge key={size} size={size} testID={`badge-${size}`}>{size}</Badge>)}</>
    );

    expect(sizes.map((size) => styleOf(getByTestId(`badge-${size}`)).height)).toEqual([14, 16, 20, 22, 24, 26, 28]);
    expect(sizes.map((size) => styleOf(getByText(size)).fontSize)).toEqual([8, 10, 12, 14, 16, 18, 22]);
    expect(sizes.map((size) => styleOf(getByText(size)).lineHeight)).toEqual([10, 12, 14, 17, 19, 22, 26]);
    expect(sizes.map((size) => styleOf(getByText(size)).letterSpacing)).toEqual([-0.16, -0.2, -0.24, -0.28, -0.32, -0.36, -0.44]);
  });

  it('uses a numeric size as height and scales its label', () => {
    const { getByTestId, getByText } = render(<Badge size={32} testID="numeric-badge">Numeric</Badge>);
    expect(styleOf(getByTestId('numeric-badge')).height).toBe(32);
    expect(styleOf(getByText('Numeric')).fontSize).toBe(19);
  });

  it('prefers the canonical variant/color over the v/c shorthands', () => {
    const { getByTestId } = render(
      <>
        <Badge testID="a" variant="filled" v="outline" color="error">
          A
        </Badge>
        <Badge testID="b" variant="filled" color="error">
          B
        </Badge>
      </>
    );
    expect(styleOf(getByTestId('a')).backgroundColor).toBe(styleOf(getByTestId('b')).backgroundColor);
  });

  it('labels the remove button "Remove <label>" (overridable)', () => {
    const onRemove = jest.fn();
    const { getByRole } = render(
      <>
        <Badge onRemove={onRemove}>Beta</Badge>
        <Badge onRemove={onRemove} removeButtonLabel="Dismiss tag">
          Gamma
        </Badge>
      </>
    );
    fireEvent.press(getByRole('button', { name: 'Remove Beta' }));
    expect(getByRole('button', { name: 'Dismiss tag' })).toBeTruthy();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('accepts a radius token and a shadow token', () => {
    const { getByTestId } = render(
      <Badge testID="badge" radius="full" shadow="md">
        Pill
      </Badge>
    );
    expect(styleOf(getByTestId('badge')).borderRadius).toBe(9999);
  });
});
