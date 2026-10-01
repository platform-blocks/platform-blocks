import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { MenuItemButton } from '../MenuItemButton';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('MenuItemButton (react-native-web DOM)', () => {
  it('is a button by default, named by its title', () => {
    const onPress = jest.fn();
    render(<MenuItemButton title="Rename" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('takes the role and state a menu / listbox gives it', () => {
    render(<MenuItemButton title="Archive" role="menuitem" disabled />);
    const item = screen.getByRole('menuitem', { name: 'Archive' });
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps an accent wash on hover', () => {
    render(<MenuItemButton title="Delete" hoverColor="error" />);
    const item = screen.getByRole('button', { name: 'Delete' });
    expect(item.style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    fireEvent.mouseEnter(item);
    expect(item.style.backgroundColor).toMatch(/^rgba\(/);
    expect(item.style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});
