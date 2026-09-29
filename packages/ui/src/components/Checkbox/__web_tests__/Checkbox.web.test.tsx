import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Checkbox } from '../Checkbox';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Checkbox (react-native-web DOM)', () => {
  it('exposes role, checked state and the label as its name', () => {
    render(<Checkbox id="terms" label="Accept terms" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(checkbox.getAttribute('aria-labelledby')).toBe('terms-label');

    fireEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('reports aria-checked="mixed" when indeterminate', () => {
    render(<Checkbox label="Select all" indeterminate />);
    expect(screen.getByRole('checkbox', { name: 'Select all' }).getAttribute('aria-checked')).toBe('mixed');
  });

  it('toggles with the Space key', () => {
    const onChange = jest.fn();
    render(<Checkbox label="Newsletter" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('checkbox'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is one tab stop: the label toggles the same control without being focusable', () => {
    const onChange = jest.fn();
    const { container } = render(<Checkbox label="Remember me" onChange={onChange} />);

    fireEvent.click(screen.getByText('Remember me'));
    expect(onChange).toHaveBeenCalledWith(true);

    const tabStops = container.querySelectorAll('[tabindex="0"]');
    expect(tabStops).toHaveLength(1);
    expect(tabStops[0].getAttribute('role')).toBe('checkbox');
  });

  it('links the error and marks the control invalid', () => {
    render(<Checkbox id="agree" label="Agree" helperText="Needed to continue" error="You must agree" required />);

    const checkbox = screen.getByRole('checkbox', { name: 'Agree' });
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
    expect(checkbox.getAttribute('aria-required')).toBe('true');
    expect(checkbox.getAttribute('aria-describedby')).toBe('agree-error');

    const alert = screen.getByRole('alert');
    expect(alert.id).toBe('agree-error');
    expect(alert.textContent).toBe('You must agree');
  });

  it('describes the control with its helper text', () => {
    render(<Checkbox id="promo" label="Promotions" description="Monthly" helperText="Unsubscribe any time" />);
    expect(screen.getByRole('checkbox').getAttribute('aria-describedby')).toBe('promo-description promo-helper');
  });

  it('is disabled for assistive technology and pointer alike', () => {
    const onChange = jest.fn();
    render(<Checkbox label="Off" disabled onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByText('Off'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
