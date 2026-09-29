import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { ListGroup, ListGroupBody, ListGroupItem } from '../ListGroup';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('ListGroup (react-native-web DOM)', () => {
  it('exposes pressable items as buttons and separates items', () => {
    const onPress = jest.fn();
    render(
      <ListGroup>
        <ListGroupBody>
          <ListGroupItem onPress={onPress}>Wi-Fi</ListGroupItem>
          <ListGroupItem>Bluetooth</ListGroupItem>
          <ListGroupItem onPress={onPress} disabled>
            Airplane mode
          </ListGroupItem>
        </ListGroupBody>
      </ListGroup>
    );

    const button = screen.getByRole('button', { name: 'Wi-Fi' });
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);

    // A static row is not a button; a disabled one is announced as disabled.
    expect(screen.queryByRole('button', { name: 'Bluetooth' })).toBeNull();
    const disabled = screen.getByText('Airplane mode').closest('[aria-disabled]');
    expect(disabled?.getAttribute('aria-disabled')).toBe('true');

    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });
});
