import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { StickyNote } from '../StickyNote';

describe('StickyNote', () => {
  it('renders built-in note text and resolves paper colors', () => {
    render(
      <StickyNote testID="note" title="Remember" footer="Friday" color="pink" size={180}>
        Send the draft
      </StickyNote>,
    );

    expect(screen.getByText('Remember')).toBeTruthy();
    expect(screen.getByText('Send the draft')).toBeTruthy();
    expect(screen.getByText('Friday')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('note').props.style)).toMatchObject({
      backgroundColor: '#FFD5DE',
      width: 180,
      minHeight: 180,
    });
  });

  it('uses bg as the paper fill when provided', () => {
    render(<StickyNote testID="note" color="pink" bg="#234567">Custom</StickyNote>);
    expect(StyleSheet.flatten(screen.getByTestId('note').props.style).backgroundColor).toBe('#234567');
  });

  it('presses when enabled and blocks presses when disabled', () => {
    const onPress = jest.fn();
    const { rerender } = render(<StickyNote testID="note" onPress={onPress}>Open note</StickyNote>);
    fireEvent.press(screen.getByTestId('note'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toBeTruthy();

    rerender(<StickyNote testID="note" onPress={onPress} disabled>Open note</StickyNote>);
    fireEvent.press(screen.getByTestId('note'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
