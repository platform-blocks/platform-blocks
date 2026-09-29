import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Icon } from '../Icon';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Icon (react-native-web DOM)', () => {
  it('is decorative by default (hidden, testID still queryable)', () => {
    render(<Icon name="chevron-down" testID="chevron" />);
    const icon = screen.getByTestId('chevron');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('a labelled icon is an image with that name', () => {
    render(<Icon name="check" label="Done" />);
    expect(screen.getByRole('img', { name: 'Done' })).toBeTruthy();
  });
});
