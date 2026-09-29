import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Button } from '../Button';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Button (react-native-web DOM)', () => {
  it('is a button named by its text, including nested text children', () => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress}>
        <Text>Save changes</Text>
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Save changes' });
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    // No stray state from the old implementation.
    expect(button.getAttribute('aria-selected')).toBeNull();
  });

  it('never falls back to a generic "Button" name', () => {
    render(<Button icon={<Text>*</Text>} tooltip="Open settings" />);
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Button' })).toBeNull();
  });

  it('exposes disabled and busy states', () => {
    render(
      <>
        <Button title="Disabled" disabled />
        <Button title="Saving" loading loadingTitle="Saving" />
      </>
    );
    expect(screen.getByRole('button', { name: 'Disabled' }).getAttribute('aria-disabled')).toBe('true');
    const busy = screen.getByRole('button', { name: 'Saving' });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    expect(busy.getAttribute('aria-disabled')).toBe('true');
  });

  it('forwards consumer role / aria props so it can act as a tab', () => {
    render(<Button title="Overview" role="tab" aria-selected />);
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');
  });

  it('renders startSection / endSection (and the deprecated aliases)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <Button title="Next" endSection={<Text testID="end">→</Text>} />
        <Button title="Back" startIcon={<Text testID="legacy">←</Text>} />
      </>
    );
    expect(screen.getByTestId('end')).toBeTruthy();
    expect(screen.getByTestId('legacy')).toBeTruthy();
    warn.mockRestore();
  });
});
