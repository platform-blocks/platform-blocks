import React from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { onColor } from '../../../core/theme/tokens';
import { Icon } from '../../Icon';
import { ColorSwatch } from '../ColorSwatch';

describe('ColorSwatch', () => {
  it('is a plain, unexposed chip without onPress', () => {
    render(<ColorSwatch color="#FF6B6B" testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip.props.role).toBeUndefined();
    expect(chip.props['aria-label']).toBeUndefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('exposes a non-interactive chip as a named image when labelled', () => {
    render(<ColorSwatch color="#FF6B6B" accessibilityLabel="Coral" />);
    expect(screen.getByRole('img', { name: 'Coral' })).toBeTruthy();
  });

  it('is a button named after its color that fires onPress', () => {
    const onPress = jest.fn();
    render(<ColorSwatch color="#4ECDC4" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Color #4ECDC4' });
    // A plain button: no toggle state unless `selected` is given.
    expect(button.props.accessibilityState?.checked).toBeUndefined();
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes `selected` as the pressed state of a toggle button', () => {
    const { rerender } = render(<ColorSwatch color="#4ECDC4" selected onPress={() => {}} accessibilityLabel="Teal" />);
    // Native has no pressed state: a11yProps maps aria-pressed to checked.
    expect(screen.getByRole('button', { name: 'Teal' }).props.accessibilityState).toMatchObject({ checked: true });
    rerender(<ColorSwatch color="#4ECDC4" selected={false} onPress={() => {}} accessibilityLabel="Teal" />);
    expect(screen.getByRole('button', { name: 'Teal' }).props.accessibilityState).toMatchObject({ checked: false });
  });

  it('is checked as a radio', () => {
    render(<ColorSwatch color="#45B7D1" role="radio" selected onPress={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Color #45B7D1', checked: true })).toBeTruthy();
  });

  it('uses aria-selected as an option', () => {
    render(<ColorSwatch color="#45B7D1" role="option" selected={false} onPress={() => {}} />);
    expect(screen.getByRole('option', { selected: false })).toBeTruthy();
    expect(screen.queryByRole('option', { selected: true })).toBeNull();
  });

  it('is not pressable when disabled, but still named and marked disabled', () => {
    const onPress = jest.fn();
    render(<ColorSwatch color="#96CEB4" disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Color #96CEB4', disabled: true });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards the ref to the root host element', () => {
    const ref = React.createRef<View>();
    render(<ColorSwatch ref={ref} color="#FECA57" onPress={() => {}} testID="swatch" />);
    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('swatch').props.role).toBe('button');
  });

  it('draws the checkmark in a readable color for the fill', () => {
    const { UNSAFE_getByType, rerender } = render(<ColorSwatch color="#FFFFFF" selected />);
    expect(UNSAFE_getByType(Icon).props.color).toBe(onColor(DEFAULT_THEME, '#FFFFFF'));
    rerender(<ColorSwatch color="#000000" selected />);
    expect(UNSAFE_getByType(Icon).props.color).toBe(onColor(DEFAULT_THEME, '#000000'));
    rerender(<ColorSwatch color="#000000" selected checkmarkColor="#FFD700" />);
    expect(UNSAFE_getByType(Icon).props.color).toBe('#FFD700');
  });

  it('applies spacing props and style to the root', () => {
    render(<ColorSwatch color="#FF9FF3" m="sm" style={{ opacity: 0.9 }} testID="chip" />);
    const flat = [screen.getByTestId('chip').props.style].flat(Infinity).reduce(
      (acc: Record<string, unknown>, s: Record<string, unknown> | null | false | undefined) => ({ ...acc, ...(s || {}) }),
      {}
    );
    expect(flat.marginStart).toBeGreaterThan(0);
    expect(flat.opacity).toBe(0.9);
  });
});
