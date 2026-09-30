/**
 * MenuItemButton — press feedback per color.
 *
 * A neutral row must not flash the accent color while it is held down: menu and
 * dropdown options are `color="default"`, and an accent wash there reads as a
 * selection that never happened. Accent press feedback is opt-in via
 * `activeColor="primary"`.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { DARK_THEME } from '../../../core/theme/darkTheme';
import { contrastRatio } from '../../../core/theme/colorUtils';
import { resolveVariantRoles } from '../../../core/theme/variantRoles';
import { MenuItemButton } from '../MenuItemButton';

let mockTheme = DEFAULT_THEME;

jest.mock('../../../core/theme/ThemeProvider', () => ({
  ...jest.requireActual('../../../core/theme/ThemeProvider'),
  useTheme: () => mockTheme,
}));

/** The row's style in Pressable's pressed state (the style is a function of it). */
const styleWhilePressed = (props: any = {}) => {
  const screen = render(
    <MenuItemButton testID="item" {...props}>
      Option
    </MenuItemButton>
  );
  const [pressable] = screen.UNSAFE_root.findAll((node) => typeof node.props.style === 'function');
  return StyleSheet.flatten(pressable.props.style({ pressed: true, hovered: false }));
};

describe('MenuItemButton press feedback', () => {
  beforeEach(() => {
    mockTheme = DEFAULT_THEME;
  });

  it('tints a default-color row neutrally rather than with the accent color', () => {
    const background = styleWhilePressed({ color: 'default', activeColor: 'default' })?.backgroundColor;

    expect(background).toBe(DEFAULT_THEME.backgrounds.pressed);
    expect(DEFAULT_THEME.colors.primary).not.toContain(background);
  });

  it('still uses the accent color when the caller asks for a primary press', () => {
    const background = styleWhilePressed({ color: 'default', activeColor: 'primary' })?.backgroundColor;

    expect(background).toBe(resolveVariantRoles(DEFAULT_THEME, { variant: 'light', color: 'primary' }).fill);
  });

  it('keeps danger rows on the error palette', () => {
    const background = styleWhilePressed({ danger: true })?.backgroundColor;

    expect(background).toBe(resolveVariantRoles(DEFAULT_THEME, { variant: 'light', color: 'error' }).fill);
  });

  it('keeps success / warning labels readable on the dark surface', () => {
    mockTheme = DARK_THEME;
    for (const color of ['success', 'warning'] as const) {
      const { getByText, unmount } = render(<MenuItemButton color={color}>{color}</MenuItemButton>);
      const textColor = StyleSheet.flatten(getByText(color).props.style).color as string;
      expect(contrastRatio(textColor, DARK_THEME.backgrounds.surface)).toBeGreaterThanOrEqual(4.5);
      unmount();
    }
  });
});
