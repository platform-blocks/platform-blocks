/**
 * MenuItemButton — press feedback per color.
 *
 * A neutral row must not flash the accent color while it is held down: menu and
 * dropdown options are `color="default"`, and an accent wash there reads as a
 * selection that never happened. Accent press feedback is opt-in via
 * `activeColor="primary"`.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { MenuItemButton } from '../MenuItemButton';

const PRIMARY = ['#e6f0ff', '#cce0ff', '#99c2ff', '#66a3ff', '#3385ff', '#0066ff', '#0052cc', '#003d99'];

jest.mock('../../../core/theme', () => ({
  useTheme: () => ({
    colorScheme: 'light',
    colors: {
      primary: PRIMARY,
      error: ['#fee', '#fcc', '#faa', '#f88', '#f66', '#f44', '#f22'],
      success: ['#e6f9f0', '#ccf3e1', '#99e7c3', '#66dca5', '#33d087', '#00c469', '#009853'],
      warning: ['#fff9e6', '#fff3cc', '#ffe699', '#ffd966', '#ffcc33', '#ffbf00', '#cc9900'],
    },
    text: { primary: '#111111', onPrimary: '#ffffff', disabled: '#999999' },
  }),
}));

const backgroundWhilePressed = (props: any = {}) => {
  const screen = render(
    <MenuItemButton testID="item" {...props}>
      Option
    </MenuItemButton>
  );
  const item = screen.getByTestId('item');
  fireEvent(item, 'pressIn');
  return StyleSheet.flatten(screen.getByTestId('item').props.style)?.backgroundColor;
};

describe('MenuItemButton press feedback', () => {
  it('tints a default-color row neutrally rather than with the accent color', () => {
    const background = backgroundWhilePressed({ color: 'default', activeColor: 'default' });

    expect(background).toBe('rgba(0, 0, 0, 0.08)');
    expect(PRIMARY).not.toContain(background);
  });

  it('still uses the accent color when the caller asks for a primary press', () => {
    const background = backgroundWhilePressed({ color: 'default', activeColor: 'primary' });

    expect(background).toBe(PRIMARY[1]);
  });

  it('keeps danger rows on the error palette', () => {
    const background = backgroundWhilePressed({ danger: true });

    expect(background).toBe('#fcc');
  });
});
