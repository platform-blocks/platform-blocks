import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { PinInput } from '../PinInput';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('PinInput (react-native-web DOM)', () => {
  it('is a labelled group of named cells', () => {
    render(<PinInput id="otp" label="Verification code" length={4} />);

    const group = screen.getByRole('group', { name: 'Verification code' });
    expect(group.id).toBe('otp');
    const cells = screen.getAllByRole('textbox');
    expect(cells.map((cell) => cell.getAttribute('aria-label'))).toEqual([
      'Verification code, digit 1 of 4',
      'Verification code, digit 2 of 4',
      'Verification code, digit 3 of 4',
      'Verification code, digit 4 of 4',
    ]);
    // The library ring replaces the raw browser outline.
    expect(cells[0].getAttribute('data-plocks-input')).toBe('true');
  });

  it('links the error to every cell and marks them invalid', () => {
    render(<PinInput id="pin" label="PIN" length={2} error="Wrong PIN" required />);
    for (const cell of screen.getAllByRole('textbox')) {
      expect(cell.getAttribute('aria-invalid')).toBe('true');
      expect(cell.getAttribute('aria-required')).toBe('true');
      expect(cell.getAttribute('aria-describedby')).toBe('pin-error');
    }
    expect(screen.getByRole('alert').textContent).toBe('Wrong PIN');
  });

  it('advances focus as digits are typed and completes once', () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    render(<PinInput label="Code" length={3} onComplete={onComplete} />);
    const cells = screen.getAllByRole('textbox');

    act(() => {
      cells[0].focus();
    });
    fireEvent.change(cells[0], { target: { value: '4' } });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(document.activeElement).toBe(cells[1]);

    fireEvent.change(cells[1], { target: { value: '2' } });
    fireEvent.change(cells[2], { target: { value: '7' } });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('427');
    jest.useRealTimers();
  });
});
