import React, { createRef } from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import type { TextInput } from 'react-native';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { PhoneInput } from '../PhoneInput';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('PhoneInput (react-native-web DOM)', () => {
  it('is named by its visible label and formats as you type', () => {
    render(<PhoneInput label="Mobile" country="US" />);
    const input = screen.getByRole('textbox', { name: 'Mobile' }) as HTMLInputElement;
    expect(input.getAttribute('inputmode')).toBe('tel');
    fireEvent.change(input, { target: { value: '5551234567' } });
    expect(input.value).toBe('(555) 123-4567');
  });

  it('falls back to a descriptive name without a label', () => {
    render(<PhoneInput country="GB" />);
    expect(screen.getByRole('textbox', { name: 'Phone number, United Kingdom, country code +44' })).toBeTruthy();
  });

  it('links its error and forwards the ref to the input element', () => {
    const ref = createRef<TextInput>();
    render(<PhoneInput id="phone" ref={ref} label="Mobile" error="Enter a full number" />);
    const input = screen.getByRole('textbox', { name: 'Mobile' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('phone-error');
    expect(ref.current as unknown as HTMLElement).toBe(input);
  });

  it('names the country picker button', () => {
    render(<PhoneInput label="Mobile" country="US" selectableCountry />);
    const picker = screen.getByRole('button', { name: 'Country: United States. Change country' });
    expect(picker.getAttribute('aria-haspopup')).toBe('menu');
  });
});
