import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { validationRules } from '../../Input/validation';
import { Form } from '..';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Form (react-native-web DOM)', () => {
  it('Form.Label names the Form.Input of its field', () => {
    render(
      <Form>
        <Form.Field name="city">
          <Form.Label>City</Form.Label>
          <Form.Input placeholder="Paris" />
        </Form.Field>
      </Form>
    );
    expect(screen.getByRole('textbox', { name: 'City' })).toBeTruthy();
  });

  it('a labelled Form.Field frames its input and shows the field error once touched', async () => {
    render(
      <Form>
        <Form.Field name="email" label="Email" required validation={[validationRules.required('Email is required')]}>
          <Form.Input />
        </Form.Field>
        <Form.Submit>Send</Form.Submit>
      </Form>
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.getAttribute('aria-required')).toBe('true');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    });

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Email is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
    // The error is shown once, by the frame.
    expect(screen.getAllByText('Email is required')).toHaveLength(1);
  });
});
