import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ToggleButton, ToggleGroup } from '../Toggle';

const mockPalette = {
  colors: {
    primary: ['#F0F5FF', '#D6E4FF', '#ADC6FF', '#85A5FF', '#597EF7', '#2F54EB', '#1D39C4', '#10239E'],
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'],
    success: ['#F0FFF4', '#C6F6D5', '#9AE6B4', '#68D391', '#48BB78', '#38A169', '#2F855A', '#276749'],
    warning: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309'],
  },
};

const getStyle = (node: any) => StyleSheet.flatten(node.props.style) || {};

jest.mock('../../../core/theme/ThemeProvider', () => {
  const actual = jest.requireActual('../../../core/theme/ThemeProvider');
  const { DEFAULT_THEME } = jest.requireActual('../../../core/theme/defaultTheme');
  let theme: unknown;
  return {
    ...actual,
    // Built lazily: this factory runs before the module-scope palette is initialized.
    useTheme: () => (theme ??= { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, ...mockPalette.colors } }),
  };
});

jest.mock('../../Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => React.createElement(Text, props, children),
  };
});

describe('Toggle - rendering', () => {
  it('applies selected fill and segmentation for grouped buttons', () => {
    const { getByTestId } = render(
      <ToggleGroup value="primary" color="success">
        <ToggleButton value="primary" testID="seg-primary">Primary</ToggleButton>
        <ToggleButton value="secondary" testID="seg-secondary">Secondary</ToggleButton>
      </ToggleGroup>
    );

    const selectedStyle = getStyle(getByTestId('seg-primary'));
    const unselectedStyle = getStyle(getByTestId('seg-secondary'));

    expect(selectedStyle.backgroundColor).toBe('#38A169');
    // Logical corners/borders, so the segmented group mirrors under RTL.
    expect(selectedStyle.borderTopStartRadius).toBeGreaterThan(0);
    expect(selectedStyle.borderTopEndRadius).toBe(0);
    expect(unselectedStyle.backgroundColor).toBe('transparent');
    expect(selectedStyle.borderEndWidth).toBe(0);
    expect(unselectedStyle.borderTopEndRadius).toBeGreaterThan(0);
  });

  it('uses ghost variant neutrals for selected buttons', () => {
    const { getByTestId } = render(
      <ToggleGroup value="ghost" variant="ghost">
        <ToggleButton value="ghost" testID="ghost-selected">Ghost</ToggleButton>
        <ToggleButton value="idle" testID="ghost-idle">Idle</ToggleButton>
      </ToggleGroup>
    );

    const selectedStyle = getStyle(getByTestId('ghost-selected'));
    const idleStyle = getStyle(getByTestId('ghost-idle'));

    expect(selectedStyle.backgroundColor).toBe('#DBEAFE'); // theme.backgrounds.selected
    expect(selectedStyle.borderWidth).toBe(0);
    expect(idleStyle.backgroundColor).toBe('transparent');
  });

  it('honors explicit color prop for grouped buttons', () => {
    const { getByTestId } = render(
      <ToggleGroup value="custom" color="#FF6600">
        <ToggleButton value="custom" testID="custom-selected">Custom</ToggleButton>
      </ToggleGroup>
    );

    const selectedStyle = getStyle(getByTestId('custom-selected'));
    expect(selectedStyle.backgroundColor).toBe('#FF6600');
    expect(selectedStyle.borderColor).toBe('#FF6600');
  });

  it('switches container layout when orientation=vertical', () => {
    const { getByTestId } = render(
      <ToggleGroup value="top" orientation="vertical" testID="vertical-group">
        <ToggleButton value="top" testID="vertical-top">Top</ToggleButton>
        <ToggleButton value="bottom" testID="vertical-bottom">Bottom</ToggleButton>
      </ToggleGroup>
    );

    expect(getStyle(getByTestId('vertical-group')).flexDirection).toBe('column');
    expect(getStyle(getByTestId('vertical-top')).borderBottomWidth).toBe(0);
  });

  it('fills a selected standalone toggle (its label is on a filled background)', () => {
    const { getByTestId } = render(
      <ToggleButton value="on" selected testID="standalone-on">
        On
      </ToggleButton>
    );
    expect(getStyle(getByTestId('standalone-on')).backgroundColor).toBe('#2F54EB');
  });

  it('applies control size tokens to standalone toggles', () => {
    const { getByTestId } = render(
      <ToggleButton
        value="large"
        selected
        size="lg"
        testID="size-lg"
      >
        Large
      </ToggleButton>
    );

    // getControlSize('lg'): the same height as a Button / Input of that size.
    const style = getStyle(getByTestId('size-lg'));
    expect(style.height).toBe(44);
    expect(style.paddingHorizontal).toBe(14);
    expect(style.borderRadius).toBe(10);
  });
});
