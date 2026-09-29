import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { TimePickerInput } from '../TimePickerInput';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);
beforeEach(() => __resetLayerStackForTests());

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

describe('TimePickerInput (react-native-web DOM)', () => {
  it('is a labelled text field with a clock button that opens the wheel dialog', async () => {
    render(<TimePickerInput label="Meeting time" required defaultValue={{ hours: 9, minutes: 30 }} />);
    const input = screen.getByRole('textbox', { name: 'Meeting time' }) as HTMLInputElement;
    expect(input.value).toBe('09:30');
    expect(input.getAttribute('aria-required')).toBe('true');

    const button = screen.getByRole('button', { name: 'Choose time' });
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    fireEvent.click(button);
    await flush();
    expect(button.getAttribute('aria-expanded')).toBe('true');

    const dialog = screen.getByRole('dialog', { name: 'Select time' });
    expect(within(dialog).getByRole('slider', { name: 'Hour' })).toBeTruthy();
    expect(within(dialog).getByRole('slider', { name: 'Minute' })).toBeTruthy();
  });

  it('is a button field when typing is off', () => {
    render(<TimePickerInput label="Start" allowInput={false} defaultValue={{ hours: 8, minutes: 0 }} />);
    const button = screen.getByRole('button', { name: 'Start' });
    expect(button.textContent).toContain('08:00');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
  });
});
