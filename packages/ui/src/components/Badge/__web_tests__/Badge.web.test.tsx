import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Badge } from '../Badge';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Badge (react-native-web DOM)', () => {
  it('renders its label with no interactive role by default', () => {
    render(<Badge testID="badge">New</Badge>);
    expect(screen.getByTestId('badge').textContent).toBe('New');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('the remove button is labelled "Remove <label>"', () => {
    const onRemove = jest.fn();
    render(<Badge onRemove={onRemove}>Beta</Badge>);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Beta' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('onPress makes it a button (disabled state exposed)', () => {
    render(
      <Badge onPress={() => {}} disabled>
        Filter
      </Badge>
    );
    expect(screen.getByRole('button', { name: 'Filter' }).getAttribute('aria-disabled')).toBe('true');
  });
});
