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
