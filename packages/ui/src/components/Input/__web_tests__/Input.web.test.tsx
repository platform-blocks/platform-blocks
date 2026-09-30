import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { FormField } from '../../Form/FormField';
import { Input } from '../Input';
import { PasswordInput } from '../PasswordInput';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Input (react-native-web DOM)', () => {
  it('associates the label and describes the input by its helper text', () => {
    render(<Input id="email" label="Email" required helperText="Work address" placeholder="you@example.com" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.id).toBe('email');
    expect(input.getAttribute('aria-labelledby')).toBe('email-label');
    expect(input.getAttribute('aria-describedby')).toBe('email-helper');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(document.getElementById('email-helper')?.textContent).toBe('Work address');
    // UniversalCSS drops the raw outline for library inputs; the frame draws the ring.
    expect(input.getAttribute('data-plocks-input')).toBe('true');
  });

  it('marks the input invalid and announces the error it is described by', () => {
    render(<Input id="email" label="Email" error="Enter a valid email" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('email-error');

    const alert = screen.getByRole('alert');
    expect(alert.id).toBe('email-error');
    expect(alert.getAttribute('aria-live')).toBe('polite');
    expect(alert.textContent).toBe('Enter a valid email');
  });

  it('prefers an explicit accessibilityLabel over the label', () => {
    render(<Input label="Email" accessibilityLabel="Work email" />);
    expect(screen.getByRole('textbox', { name: 'Work email' })).toBeTruthy();
  });

  it('marks a read-only input readonly', () => {
    render(<Input label="Code" readOnly value="42" />);
    const input = screen.getByRole('textbox', { name: 'Code' }) as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-readonly')).toBe('true');
  });

  it('exposes a named clear button that empties the field', () => {
    render(<Input label="Query" defaultValue="shoes" clearable />);
    const input = screen.getByRole('textbox', { name: 'Query' }) as HTMLInputElement;
    expect(input.value).toBe('shoes');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input.value).toBe('');
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  it('draws the focus ring while focused', () => {
    const { container } = render(<Input label="Name" />);
    const countViews = () => container.querySelectorAll('div').length;
    const before = countViews();
    fireEvent.focus(screen.getByRole('textbox', { name: 'Name' }));
    expect(countViews()).toBe(before + 1);
    fireEvent.blur(screen.getByRole('textbox', { name: 'Name' }));
    expect(countViews()).toBe(before);
  });

  it('is named by an enclosing FormField label', () => {
    render(
      <FormField label="Company" description="Legal name">
        <Input placeholder="Acme Inc." />
      </FormField>
    );
    const input = screen.getByRole('textbox', { name: 'Company' });
    expect(input.getAttribute('aria-describedby')).toMatch(/-description$/);
  });

  it('PasswordInput has a named show/hide toggle', () => {
    render(<PasswordInput label="Password" defaultValue="secret" />);
    const toggle = screen.getByRole('button', { name: 'Show password' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });
});
