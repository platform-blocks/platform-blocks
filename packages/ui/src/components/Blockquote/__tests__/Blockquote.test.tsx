import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Blockquote } from '../Blockquote';

describe('Blockquote', () => {
  it('keeps attribution with the quote and activates a pressable quote', () => {
    const onPress = jest.fn();
    render(<Blockquote author={{ name: 'Ada' }} onPress={onPress}>A useful quotation.</Blockquote>);
    expect(screen.getByText('A useful quotation.')).toBeTruthy();
    expect(screen.getByText('Ada')).toBeTruthy();
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
