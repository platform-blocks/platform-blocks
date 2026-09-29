import React, { createRef } from 'react';
import { AccessibilityInfo, StyleSheet, TextInput } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Field } from '../../_internal/Field/Field';
import { Input } from '../Input';
import { PasswordInput } from '../PasswordInput';
import { validationRules } from '../validation';

const getInput = () => screen.UNSAFE_getByType(TextInput);

describe('Input (native)', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('names the TextInput by its label and reports typing', () => {
    const onChangeText = jest.fn();
    render(<Input label="Email" required value="" onChangeText={onChangeText} />);

    const input = getInput();
    expect(input.props['aria-label']).toBe('Email, required');
    fireEvent.changeText(input, 'a@b.co');
    expect(onChangeText).toHaveBeenCalledWith('a@b.co');
  });

  it('is typeable uncontrolled, seeded from defaultValue', () => {
    render(<Input label="Name" defaultValue="Ada" />);
    expect(getInput().props.value).toBe('Ada');
    fireEvent.changeText(getInput(), 'Grace');
    expect(getInput().props.value).toBe('Grace');
  });

  it('does not move a controlled value on its own', () => {
    render(<Input label="Name" value="Ada" />);
    fireEvent.changeText(getInput(), 'Grace');
    expect(getInput().props.value).toBe('Ada');
  });

  it('forwards both ref and inputRef to the TextInput', () => {
    const ref = createRef<TextInput>();
    const inputRef = createRef<TextInput>();
    render(<Input label="Name" ref={ref} inputRef={inputRef} />);
    expect(ref.current).toBe(getInput().instance);
    expect(inputRef.current).toBe(ref.current);
  });

  it('shows the error as an alert and puts it in the native hint', () => {
    render(<Input id="email" label="Email" helperText="Work address" error="Email is required" />);
    const alert = screen.getByRole('alert');
    expect(alert.props.id).toBe('email-error');
    expect(screen.getByText('Email is required')).toBeTruthy();
    expect(screen.queryByText('Work address')).toBeNull();
    expect(getInput().props.accessibilityHint).toBe('Email is required');
  });

  it('maps readOnly and disabled to a non-editable TextInput', () => {
    const { rerender } = render(<Input label="Code" readOnly value="42" />);
    expect(getInput().props.editable).toBe(false);
    rerender(<Input label="Code" disabled value="42" />);
    expect(getInput().props.editable).toBe(false);
    rerender(<Input label="Code" value="42" />);
    expect(getInput().props.editable).toBe(true);
  });

  it('clears through a labelled clear button', () => {
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    render(<Input label="Search" defaultValue="shoes" clearable onChangeText={onChangeText} onClear={onClear} />);

    fireEvent.press(screen.getByLabelText('Clear'));
    expect(onChangeText).toHaveBeenLastCalledWith('');
    expect(onClear).toHaveBeenCalled();
    expect(getInput().props.value).toBe('');
    expect(screen.queryByLabelText('Clear')).toBeNull();
  });

  it('uses clearButtonLabel for the clear button', () => {
    render(<Input label="Search" defaultValue="x" clearable clearButtonLabel="Clear search" />);
    expect(screen.getByLabelText('Clear search')).toBeTruthy();
  });

  it('calls onFocus / onBlur and onEnter from the TextInput', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const onEnter = jest.fn();
    render(<Input label="Name" onFocus={onFocus} onBlur={onBlur} onEnter={onEnter} />);
    fireEvent(getInput(), 'focus');
    fireEvent(getInput(), 'submitEditing');
    fireEvent(getInput(), 'blur');
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('runs validation rules after the first blur', async () => {
    jest.useFakeTimers();
    try {
      render(<Input label="Email" defaultValue="" validation={[validationRules.required('Email is required')]} />);
      expect(screen.queryByText('Email is required')).toBeNull();

      fireEvent(getInput(), 'blur');
      await act(async () => {
        jest.runAllTimers();
      });
      expect(screen.getByText('Email is required')).toBeTruthy();

      fireEvent.changeText(getInput(), 'a@b.co');
      await act(async () => {
        jest.runAllTimers();
      });
      expect(screen.queryByText('Email is required')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('toggles password visibility with a labelled button', () => {
    render(<Input type="password" label="Password" defaultValue="secret" />);
    expect(getInput().props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByLabelText('Show password'));
    expect(getInput().props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Hide password')).toBeTruthy();
  });

  it('keeps a password endSection next to the toggle', () => {
    const { getByTestId } = render(
      <Input type="password" label="Password" endSection={<TextInput testID="extra" />} />
    );
    expect(getByTestId('extra')).toBeTruthy();
    expect(screen.getByLabelText('Show password')).toBeTruthy();
  });

  it('adopts an enclosing Field when it has no label of its own', () => {
    render(
      <Field id="outer" label="Outer label" required>
        <Input placeholder="inner" />
      </Field>
    );
    const input = getInput();
    expect(input.props.id).toBe('outer');
    expect(input.props['aria-label']).toBe('Outer label, required');
  });

  it('sizes the field root with the box props; an explicit `w` wins over `fullWidth`', () => {
    const tree = render(<Input label="Name" fullWidth w={240} maw={320} />).toJSON() as ReactTestRendererJSON;
    expect(StyleSheet.flatten(tree.props.style)).toMatchObject({ width: 240, maxWidth: 320, minWidth: 0 });
  });
});

describe('PasswordInput (native)', () => {
  it('is typeable uncontrolled and shows the strength meter', () => {
    render(<PasswordInput label="Password" showStrengthIndicator />);
    fireEvent.changeText(getInput(), 'Abcdef1!');
    expect(getInput().props.value).toBe('Abcdef1!');
    expect(screen.getByText(/Password strength/)).toBeTruthy();
  });

  it('toggles visibility, and hides the toggle on request', () => {
    const { rerender } = render(<PasswordInput label="Password" />);
    expect(getInput().props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByLabelText('Show password'));
    expect(getInput().props.secureTextEntry).toBe(false);

    rerender(<PasswordInput label="Password" showVisibilityToggle={false} />);
    expect(screen.queryByLabelText(/password/i, { exact: false })).toBeTruthy();
    expect(screen.queryByLabelText('Show password')).toBeNull();
    expect(screen.queryByLabelText('Hide password')).toBeNull();
  });
});
