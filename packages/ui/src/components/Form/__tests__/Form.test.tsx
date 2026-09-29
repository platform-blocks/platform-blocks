import React from 'react';
import { AccessibilityInfo, TextInput } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { validationRules } from '../../Input/validation';
import { FormField as LayoutFormField } from '../../FormLayout';
import { Form } from '..';
import { FormField } from '../FormField';

describe('Form (native)', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('binds Form.Input to its Form.Field name and submits the values', async () => {
    const onSubmit = jest.fn();
    render(
      <Form initialValues={{ name: '' }} onSubmit={onSubmit}>
        <Form.Field name="name">
          <Form.Label>Name</Form.Label>
          <Form.Input placeholder="Ada" />
        </Form.Field>
        <Form.Submit>Save</Form.Submit>
      </Form>
    );

    fireEvent.changeText(screen.UNSAFE_getByType(TextInput), 'Ada');
    await act(async () => {
      fireEvent.press(screen.getByText('Save'));
    });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' });
  });

  it('applies Form.Field validation rules on submit and shows the error', async () => {
    const onSubmit = jest.fn();
    render(
      <Form onSubmit={onSubmit}>
        <Form.Field name="email" validation={[validationRules.required('Email is required')]}>
          <Form.Input label="Email" />
        </Form.Field>
        <Form.Submit>Send</Form.Submit>
      </Form>
    );

    await act(async () => {
      fireEvent.press(screen.getByText('Send'));
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('only applies validateWhen rules while the condition holds', async () => {
    const onSubmit = jest.fn();
    render(
      <Form initialValues={{ contact: 'none' }} onSubmit={onSubmit}>
        <Form.Field
          name="phone"
          validation={[validationRules.required('Phone is required')]}
          validateWhen={{ field: 'contact', condition: (value) => value === 'phone' }}
        >
          <Form.Input label="Phone" />
        </Form.Field>
        <Form.Submit>Send</Form.Submit>
      </Form>
    );
    await act(async () => {
      fireEvent.press(screen.getByText('Send'));
    });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('hides and disables fields from dependsOn', () => {
    render(
      <Form initialValues={{ plan: 'free', seats: '' }}>
        <Form.Field name="seats" dependsOn={[{ field: 'plan', condition: (plan) => plan === 'team', action: 'show' }]}>
          <Form.Input label="Seats" />
        </Form.Field>
      </Form>
    );
    expect(screen.queryByText('Seats')).toBeNull();
  });

  it('colors Form.Label and Form.Error from the theme', () => {
    render(
      <Form>
        <Form.Field name="x">
          <Form.Label required>Label</Form.Label>
          <Form.Error error="Broken" />
        </Form.Field>
      </Form>
    );
    const error = screen.getByText('Broken');
    expect(JSON.stringify(error.props.style)).not.toContain('#e53e3e');
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('is one FormField implementation for forms and layouts', () => {
    expect(LayoutFormField).toBe(FormField);
    expect(Form.Field).toBe(FormField);
  });

  it('rejects unknown Form.Input props at compile time', () => {
    // @ts-expect-error -- `nmae` is not a prop of Form.Input
    const element = <Form.Input nmae="typo" />;
    // @ts-expect-error -- neither is `totallyBogus`
    const other = <Form.Submit totallyBogus>Go</Form.Submit>;
    expect(element).toBeTruthy();
    expect(other).toBeTruthy();
  });
});
