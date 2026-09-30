import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { EmojiPicker } from '../EmojiPicker';

describe('EmojiPicker on native', () => {
  it('returns the chosen emoji and adds it to recent selections', () => {
    const onSelect = jest.fn();
    const onRecentChange = jest.fn();
    const view = render(
      <EmojiPicker
        testID="picker"
        emojis={[{ id: 'heart', emoji: '❤️', name: 'Heart', category: 'reactions' }]}
        onSelect={onSelect}
        onRecentChange={onRecentChange}
      />,
    );

    fireEvent.press(view.getByTestId('picker-emoji-heart'));

    expect(onSelect).toHaveBeenCalledWith({ id: 'heart', emoji: '❤️', name: 'Heart', category: 'reactions', skinTone: 0 });
    expect(onRecentChange).toHaveBeenCalledWith(['❤️']);
  });
});
