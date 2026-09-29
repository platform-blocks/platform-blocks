import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { BrandButton } from '../BrandButton';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('BrandButton (react-native-web DOM)', () => {
  it('is a button named by its title; the brand mark is decorative', () => {
    const onPress = jest.fn();
    render(<BrandButton brand="github" title="Continue with GitHub" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Continue with GitHub' });
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('the store badge is a button named by both lines', () => {
    render(<BrandButton brand="app-store" primaryText="Download on the" secondaryText="App Store" />);
    expect(screen.getByRole('button', { name: 'Download on the App Store' })).toBeTruthy();
  });

  it('supports token visibility props (jsdom viewport is wider than xs)', () => {
    render(<BrandButton brand="github" title="Hidden" hiddenFrom="xs" />);
    expect(screen.queryByRole('button', { name: 'Hidden' })).toBeNull();
  });
});
