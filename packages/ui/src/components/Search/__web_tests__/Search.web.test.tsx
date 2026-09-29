import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Search } from '../Search';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Search (react-native-web DOM)', () => {
  it('is a named searchbox with a named clear button', () => {
    render(<Search defaultValue="shoes" />);
    const box = screen.getByRole('searchbox', { name: 'Search' }) as HTMLInputElement;
    expect(box.value).toBe('shoes');
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeTruthy();
  });

  it('renders a named button in buttonMode', () => {
    render(<Search buttonMode accessibilityLabel="Open search" onPress={() => {}} />);
    expect(screen.getByRole('button', { name: 'Open search' })).toBeTruthy();
  });
});
