import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EmojiPicker } from '../EmojiPicker';
import type { EmojiPickerItem } from '../types';

const emojis: EmojiPickerItem[] = [
  { id: 'wave', emoji: '👋', name: 'Waving hand', category: 'people', keywords: ['hello'], skins: ['👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'] },
  { id: 'party', emoji: '🎉', name: 'Party popper', category: 'activities', keywords: ['celebrate'] },
];

describe('EmojiPicker on web', () => {
  it('selects a named emoji and reports the chosen skin tone', () => {
    const onSelect = jest.fn();
    render(<EmojiPicker emojis={emojis} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Medium skin tone' }));
    fireEvent.click(screen.getByRole('button', { name: 'Waving hand' }));
    expect(onSelect).toHaveBeenCalledWith({ id: 'wave', emoji: '👋🏽', name: 'Waving hand', category: 'people', skinTone: 3 });
  });

  it('filters custom items by keyword', () => {
    render(<EmojiPicker emojis={emojis} onSelect={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search emoji' }), { target: { value: 'celebrate' } });
    expect(screen.getByRole('button', { name: 'Party popper' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Waving hand' })).toBeNull();
  });

  it('reports the default tone when an emoji has no skin variant', () => {
    const onSelect = jest.fn();
    render(<EmojiPicker emojis={emojis} skinTone={3} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Party popper' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ emoji: '🎉', skinTone: 0 }));
  });
});
