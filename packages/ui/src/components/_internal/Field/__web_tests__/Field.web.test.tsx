import React from 'react';
import { TextInput } from 'react-native';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../../core/theme/PlocksProvider';
import { Field } from '../Field';

// The library Text (used for the label) needs the provider's i18n context.
const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Field (react-native-web DOM)', () => {
  it('names the control by its label (asterisk hidden) and describes it', () => {
    render(
      <Field id="email" label="Email" description="Work address" helperText="We never share it" required>
        {({ controlProps }) => <TextInput {...controlProps} />}
      </Field>
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.id).toBe('email');
    expect(input.getAttribute('aria-labelledby')).toBe('email-label');
    expect(input.getAttribute('aria-describedby')).toBe('email-description email-helper');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-invalid')).toBeNull();

    // The visual asterisk is hidden from assistive technology.
    const label = document.getElementById('email-label');
    expect(label?.textContent).toBe('Email *');
    expect(label?.querySelector('[aria-hidden="true"]')?.textContent).toBe(' *');
    expect(document.getElementById('email-description')?.textContent).toBe('Work address');
    expect(document.getElementById('email-helper')?.textContent).toBe('We never share it');
  });

  it('shows the error as a polite alert referenced by the control', () => {
    render(
      <Field id="name" label="Name" helperText="Full name" error="Name is required">
        {({ controlProps }) => <TextInput {...controlProps} />}
      </Field>
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('name-error');

    const alert = screen.getByRole('alert');
    expect(alert.id).toBe('name-error');
    expect(alert.getAttribute('aria-live')).toBe('polite');
    expect(alert.textContent).toBe('Name is required');
    expect(screen.queryByText('Full name')).toBeNull();
  });

  it('generates ids when none are given', () => {
    render(
      <Field label="City">
        {({ controlProps }) => <TextInput {...controlProps} />}
      </Field>
    );
    const input = screen.getByRole('textbox', { name: 'City' });
    expect(input.id).toMatch(/^plocks-/);
    expect(input.getAttribute('aria-labelledby')).toBe(`${input.id}-label`);
  });
});
