import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Button } from '../../Button';
import { IconButton } from '../IconButton';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('IconButton (react-native-web DOM)', () => {
  it('is named by accessibilityLabel; the icon is hidden from assistive technology', () => {
    const onPress = jest.fn();
    render(<IconButton icon="heart" accessibilityLabel="Like" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Like' });
    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('falls back to the tooltip text as its name', () => {
    render(<IconButton icon="settings" tooltip="Settings" />);
    expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy();
  });

  it('warns in dev when it has no name at all', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<IconButton icon="trash" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    warn.mockRestore();
  });

  it('is exactly as tall as a Button of the same size, and square', () => {
    render(
      <>
        <IconButton icon="plus" accessibilityLabel="Add" size="lg" testID="icon" />
        <Button title="Add" size="lg" testID="text" />
      </>
    );
    const icon = screen.getByTestId('icon');
    const text = screen.getByTestId('text');
    expect(icon.style.height).toBe(text.style.height);
    expect(icon.style.width).toBe(icon.style.height);
  });

  it('forwards consumer aria props to the button', () => {
    render(<IconButton icon="menu" accessibilityLabel="Menu" aria-expanded={false} aria-haspopup="menu" />);
    const button = screen.getByRole('button', { name: 'Menu' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
  });
});
