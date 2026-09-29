import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { MonthPickerInput } from '../MonthPickerInput';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);
beforeEach(() => __resetLayerStackForTests());

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

describe('MonthPickerInput (react-native-web DOM)', () => {
  it('opens a labelled dialog with named months and reports the choice', async () => {
    const onChange = jest.fn();
    render(<MonthPickerInput label="Billing month" defaultValue={new Date(2026, 0, 1)} onChange={onChange} />);
    const button = screen.getByRole('button', { name: 'Billing month' });
    expect(button.textContent).toContain('January 2026');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');

    fireEvent.click(button);
    await flush();
    const dialog = screen.getByRole('dialog', { name: 'Select month' });
    const january = within(dialog).getByRole('gridcell', { name: 'January 2026' });
    expect(january.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(within(dialog).getByRole('gridcell', { name: 'April 2026' }));
    await flush();
    expect((onChange.mock.calls[0][0] as Date).getMonth()).toBe(3);
    expect(button.textContent).toContain('April 2026');
  });
});
