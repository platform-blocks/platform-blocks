import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ColorSwatch } from '../ColorSwatch';

describe('ColorSwatch (react-native-web DOM)', () => {
  it('is a button named after its color', () => {
    const onPress = jest.fn();
    render(<ColorSwatch color="#FF6B6B" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Color #FF6B6B' });
    expect(button.getAttribute('aria-pressed')).toBeNull();
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes `selected` as aria-pressed on a toggle button', () => {
    render(<ColorSwatch color="#FF6B6B" selected onPress={() => {}} accessibilityLabel="Coral" />);
    expect(screen.getByRole('button', { name: 'Coral' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('is a checked radio that Space activates', () => {
    const onPress = jest.fn();
    render(<ColorSwatch color="#4ECDC4" role="radio" selected onPress={onPress} tabIndex={0} />);
    const radio = screen.getByRole('radio', { name: 'Color #4ECDC4' });
    expect(radio.getAttribute('aria-checked')).toBe('true');
    expect(radio.getAttribute('aria-pressed')).toBeNull();
    expect(radio.getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(radio, { key: ' ' });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks a disabled swatch aria-disabled and ignores presses', () => {
    const onPress = jest.fn();
    render(<ColorSwatch color="#96CEB4" disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Color #96CEB4' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is a named image only when a display chip is labelled', () => {
    const { rerender } = render(<ColorSwatch color="#FECA57" />);
    expect(screen.queryByRole('img')).toBeNull();
    rerender(<ColorSwatch color="#FECA57" accessibilityLabel="Sunflower" />);
    expect(screen.getByRole('img', { name: 'Sunflower' })).toBeTruthy();
  });
});
