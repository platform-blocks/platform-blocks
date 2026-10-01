import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Button } from '../Button';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

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

  it('renders a tinted light button without a browser-default outline', () => {
    render(<Button title="Light action" variant="light" />);
    const button = screen.getByRole('button', { name: 'Light action' }) as HTMLButtonElement;

    expect(button.style.backgroundColor).toMatch(/^rgba\(/);
    expect(button.style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(button.style.borderTopWidth).toBe('1px');
  });

  it('keeps filled and subtle borders clear while outline has a colored stroke', () => {
    render(
      <>
        <Button title="Filled action" variant="filled" />
        <Button title="Subtle action" variant="subtle" />
        <Button title="Outline action" variant="outline" />
      </>
    );

    const filled = screen.getByRole('button', { name: 'Filled action' }) as HTMLButtonElement;
    const subtle = screen.getByRole('button', { name: 'Subtle action' }) as HTMLButtonElement;
    const outline = screen.getByRole('button', { name: 'Outline action' }) as HTMLButtonElement;
    expect(filled.style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(subtle.style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(subtle.style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(outline.style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(outline.style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');

    fireEvent.mouseEnter(subtle);
    expect(subtle.style.backgroundColor).toMatch(/^rgba\(/);
    expect(subtle.style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('renders startSection / endSection', () => {
    render(
      <>
        <Button title="Next" endSection={<Text testID="end">→</Text>} />
        <Button title="Back" startSection={<Text testID="start">←</Text>} />
      </>
    );
    expect(screen.getByTestId('end')).toBeTruthy();
    expect(screen.getByTestId('start')).toBeTruthy();
  });
});
