import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { NumberInput } from '../NumberInput';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('NumberInput (react-native-web DOM)', () => {
  it('is a labelled spinbutton exposing its range', () => {
    render(<NumberInput label="Quantity" defaultValue={3} min={0} max={10} />);
    const spin = screen.getByRole('spinbutton', { name: 'Quantity' });
    expect(spin.getAttribute('aria-valuenow')).toBe('3');
    expect(spin.getAttribute('aria-valuemin')).toBe('0');
    expect(spin.getAttribute('aria-valuemax')).toBe('10');
    expect(spin.getAttribute('aria-valuetext')).toBe('3');
  });

  it('steps with ArrowUp / ArrowDown (Shift multiplies)', () => {
    const onChange = jest.fn();
    render(<NumberInput label="Quantity" defaultValue={3} onChange={onChange} shiftMultiplier={5} />);
    const spin = screen.getByRole('spinbutton', { name: 'Quantity' });

    fireEvent.keyDown(spin, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(spin.getAttribute('aria-valuenow')).toBe('4');

    fireEvent.keyDown(spin, { key: 'ArrowDown', shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith(-1);
  });

  it('names its step buttons', () => {
    render(<NumberInput label="Quantity" defaultValue={1} withSideButtons />);
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeTruthy();
  });

  it('marks the spinbutton invalid and links its error', () => {
    render(<NumberInput id="qty" label="Quantity" error="Too many" />);
    const spin = screen.getByRole('spinbutton', { name: 'Quantity' });
    expect(spin.getAttribute('aria-invalid')).toBe('true');
    expect(spin.getAttribute('aria-describedby')).toBe('qty-error');
  });
});
