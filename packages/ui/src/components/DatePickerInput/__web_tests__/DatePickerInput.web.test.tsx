import React from 'react';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { DatePickerInput } from '../DatePickerInput';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 320, bottom: 80, width: 300, height: 40, toJSON: () => ({}) } as DOMRect;
  };
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = originalRect;
});
beforeEach(() => __resetLayerStackForTests());

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
};

const calendarProps = { defaultDate: new Date(2026, 2, 1) };

describe('DatePickerInput (react-native-web DOM)', () => {
  it('is a button named by its label that pops up a dialog', () => {
    render(<DatePickerInput label="Start date" required defaultValue={new Date(2026, 2, 3)} />);
    const button = screen.getByRole('button', { name: 'Start date' });
    expect(button.textContent).toContain('March 3, 2026');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-required')).toBe('true');
  });

  it('opens a labelled dialog with a navigable calendar grid (modal sheet)', async () => {
    const onChange = jest.fn();
    render(<DatePickerInput label="Start date" calendarProps={calendarProps} onChange={onChange} />);
    const button = screen.getByRole('button', { name: 'Start date' });
    fireEvent.click(button);
    await flush();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    const dialog = screen.getByRole('dialog', { name: 'Select date' });
    const grid = within(dialog).getByRole('grid');
    // Day cells are separate, named elements — not collapsed into one.
    const day = within(grid).getByRole('gridcell', { name: 'Tuesday, March 10, 2026' });
    fireEvent.click(day);
    await flush();

    expect(onChange).toHaveBeenCalledTimes(1);
    // (The sheet's fade-out never finishes in jsdom, so check the trigger state.)
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent).toContain('March 10, 2026');
  });

  it('anchors a popover dialog on desktop with dropdownType="popover"', async () => {
    render(<DatePickerInput label="Due" dropdownType="popover" calendarProps={calendarProps} />);
    const button = screen.getByRole('button', { name: 'Due' });
    fireEvent.click(button);
    await flush();
    const dialog = screen.getByRole('dialog', { name: 'Select date' });
    expect(button.getAttribute('aria-controls')).toBe(dialog.id);
    fireEvent.keyDown(document.activeElement ?? dialog, { key: 'Escape' });
    await flush();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('links the error to the trigger and offers a labelled clear button beside it', () => {
    render(<DatePickerInput label="Start" error="Required" clearable defaultValue={new Date(2026, 2, 3)} />);
    const button = screen.getByRole('button', { name: 'Start' });
    expect(button.getAttribute('aria-invalid')).toBe('true');
    expect(button.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id);
    const clear = screen.getByRole('button', { name: 'Clear' });
    expect(button.contains(clear)).toBe(false);
  });
});
