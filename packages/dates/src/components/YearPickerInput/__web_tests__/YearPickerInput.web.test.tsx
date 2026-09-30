import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlocksProvider } from '@plocks/ui';
import { __resetLayerStackForTests } from '@plocks/ui/test-utils';
import { YearPickerInput } from '../YearPickerInput';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);
beforeEach(() => __resetLayerStackForTests());

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

describe('YearPickerInput (react-native-web DOM)', () => {
  it('opens a labelled dialog with named years and reports the choice', async () => {
    const onChange = jest.fn();
    render(<YearPickerInput label="Graduation year" defaultValue={new Date(2024, 0, 1)} onChange={onChange} />);
    const button = screen.getByRole('button', { name: 'Graduation year' });
    expect(button.textContent).toContain('2024');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(button);
    await flush();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const dialog = screen.getByRole('dialog', { name: 'Select year' });
    expect(within(dialog).getByRole('gridcell', { name: '2024' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2026' }));
    await flush();
    expect((onChange.mock.calls[0][0] as Date).getFullYear()).toBe(2026);
    // (The sheet's fade-out never finishes in jsdom, so check the trigger state.)
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent).toContain('2026');
  });
});
