import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { BrandIcon } from '../BrandIcon';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('BrandIcon (react-native-web DOM)', () => {
  it('is decorative unless labelled', () => {
    render(<BrandIcon brand="github" testID="logo" />);
    expect(screen.getByTestId('logo').getAttribute('aria-hidden')).toBe('true');
  });

  it('a labelled logo is an image', () => {
    render(<BrandIcon brand="github" label="GitHub" />);
    expect(screen.getByRole('img', { name: 'GitHub' })).toBeTruthy();
  });
});
