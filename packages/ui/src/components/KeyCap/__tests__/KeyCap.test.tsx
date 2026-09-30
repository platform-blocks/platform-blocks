import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { KeyCap } from '../KeyCap';

const styleOf = (node: { props: { [key: string]: unknown } }) =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) as Record<string, unknown>;

describe('KeyCap', () => {
  it('renders the key in the theme monospace font', () => {
    const { getByText } = render(<KeyCap>Esc</KeyCap>);
    expect(styleOf(getByText('Esc')).fontFamily).toBe(DEFAULT_THEME.fontFamilyMono);
  });

  it('derives its size from the control-size table (md = 28px)', () => {
    const { getByTestId } = render(<KeyCap testID="key">K</KeyCap>);
    expect(styleOf(getByTestId('key')).height).toBe(28);
  });

  it('takes a numeric size as the height', () => {
    const { getByTestId } = render(
      <KeyCap testID="key" size={36}>
        K
      </KeyCap>
    );
    expect(styleOf(getByTestId('key')).height).toBe(36);
  });

  it('accepts raw colors and palette tokens', () => {
    const { getByTestId } = render(
      <>
        <KeyCap testID="raw" variant="filled" color="#7C3AED">
          A
        </KeyCap>
        <KeyCap testID="token" variant="filled" color="error">
          B
        </KeyCap>
      </>
    );
    expect(styleOf(getByTestId('raw')).backgroundColor).toBe('#7C3AED');
    expect(styleOf(getByTestId('token')).backgroundColor).toBe(DEFAULT_THEME.colors.error[5]);
  });

  it('shows the pressed state when controlled', () => {
    const { getByTestId } = render(
      <KeyCap testID="key" pressed>
        K
      </KeyCap>
    );
    expect(styleOf(getByTestId('key')).borderBottomWidth).toBe(1);
  });

  it('sizes the cap with the box props; an explicit `w` wins over `fullWidth`', () => {
    const { getByTestId } = render(<KeyCap testID="key" fullWidth w={64}>K</KeyCap>);
    expect(styleOf(getByTestId('key')).width).toBe(64);
  });
});
