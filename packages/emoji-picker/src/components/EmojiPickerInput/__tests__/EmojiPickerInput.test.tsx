import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmojiPickerInput } from '../EmojiPickerInput';

const pickerProps = {
  emojis: [{ id: 'heart', emoji: '❤️', name: 'Heart', category: 'reactions' }],
};

describe('EmojiPickerInput', () => {
  it('opens the picker, stores a selection, and clears it', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(
      <EmojiPickerInput
        testID="emoji-input"
        label="Reaction"
        pickerProps={pickerProps}
        onChange={onChange}
        onSelect={onSelect}
        clearable
      />
    );

    fireEvent.press(screen.getByTestId('emoji-input-trigger'));
    fireEvent.press(screen.getByTestId('emoji-input-picker-emoji-heart'));

    const selection = { id: 'heart', emoji: '❤️', name: 'Heart', category: 'reactions', skinTone: 0 };
    expect(onChange).toHaveBeenCalledWith('❤️', selection);
    expect(onSelect).toHaveBeenCalledWith(selection);
    expect(screen.getByTestId('emoji-input-trigger')).toHaveTextContent('❤️');
    expect(screen.queryByTestId('emoji-input-picker-emoji-heart')).toBeNull();

    fireEvent.press(screen.getByLabelText('Clear emoji'));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
    expect(screen.getByTestId('emoji-input-trigger')).toHaveTextContent('Select emoji');
  });

  it('keeps controlled values until the parent changes them', () => {
    const onChange = jest.fn();
    const view = render(
      <EmojiPickerInput testID="emoji-input" value="😀" onChange={onChange} pickerProps={pickerProps} />
    );

    fireEvent.press(screen.getByTestId('emoji-input-trigger'));
    fireEvent.press(screen.getByTestId('emoji-input-picker-emoji-heart'));
    expect(onChange).toHaveBeenCalledWith('❤️', expect.objectContaining({ id: 'heart' }));
    expect(screen.getByTestId('emoji-input-trigger')).toHaveTextContent('😀');

    view.rerender(<EmojiPickerInput testID="emoji-input" value="❤️" onChange={onChange} pickerProps={pickerProps} />);
    expect(screen.getByTestId('emoji-input-trigger')).toHaveTextContent('❤️');
  });

  it('does not open when disabled or read only', () => {
    const view = render(<EmojiPickerInput testID="emoji-input" disabled pickerProps={pickerProps} />);
    fireEvent.press(screen.getByTestId('emoji-input-trigger'));
    expect(screen.queryByTestId('emoji-input-picker-emoji-heart')).toBeNull();

    view.rerender(<EmojiPickerInput testID="emoji-input" readOnly pickerProps={pickerProps} />);
    fireEvent.press(screen.getByTestId('emoji-input-trigger'));
    expect(screen.queryByTestId('emoji-input-picker-emoji-heart')).toBeNull();
  });
});
