import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../core/theme/PlatformBlocksProvider';
import { Button } from '../components/Button';

describe('Button (react-native-web DOM)', () => {
  it('runs as web', () => {
    expect(Platform.OS).toBe('web');
  });

  it('renders a DOM button with an accessible name that fires onPress on click', () => {
    const onPress = jest.fn();
    render(
      <PlatformBlocksProvider>
        <Button title="Save" onPress={onPress} />
      </PlatformBlocksProvider>
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeTruthy();

    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
