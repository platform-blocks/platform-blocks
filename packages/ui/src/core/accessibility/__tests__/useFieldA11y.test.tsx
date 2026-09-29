import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { Text } from 'react-native';

import { getNodeText, sanitizeId } from '../useA11yId';
import { useFieldA11y, type UseFieldA11yOptions } from '../useFieldA11y';

const run = (options: UseFieldA11yOptions) => renderHook(() => useFieldA11y(options)).result.current;

describe('useFieldA11y (native)', () => {
  it('derives every part id from an explicit id', () => {
    const { ids, labelProps, descriptionProps, errorProps, helperProps, controlProps } = run({ id: 'email', label: 'Email' });
    expect(ids).toEqual({
      control: 'email',
      label: 'email-label',
      description: 'email-description',
      error: 'email-error',
      helper: 'email-helper',
    });
    expect(controlProps.id).toBe('email');
    expect(labelProps).toEqual({ id: 'email-label' });
    expect(descriptionProps).toEqual({ id: 'email-description' });
    expect(helperProps).toEqual({ id: 'email-helper' });
    expect(errorProps).toEqual({ id: 'email-error', role: 'alert', 'aria-live': 'polite' });
  });

  it('generates a stable, sanitized id when none is given', () => {
    const { result, rerender } = renderHook(() => useFieldA11y({ label: 'Name' }));
    const first = result.current.ids.control;
    expect(first).toMatch(/^pb-[A-Za-z0-9_-]+$/);
    rerender({});
    expect(result.current.ids.control).toBe(first);
  });

  it('composes the native label (with required) and hint (error, description, helper)', () => {
    const { controlProps } = run({
      label: <Text>Email</Text>,
      description: 'Work address',
      error: 'Invalid address',
      helperText: 'ignored while an error shows',
      required: true,
    });
    expect(controlProps['aria-label']).toBe('Email, required');
    expect(controlProps.accessibilityHint).toBe('Invalid address. Work address');
    // Web-only references stay off native.
    expect(controlProps['aria-labelledby']).toBeUndefined();
    expect(controlProps['aria-describedby']).toBeUndefined();
    expect(controlProps['aria-invalid']).toBeUndefined();
  });

  it('shows helper text only without an error', () => {
    const withHelper = run({ label: 'Name', helperText: 'Your full name' });
    expect(withHelper.showHelper).toBe(true);
    expect(withHelper.showError).toBe(false);
    expect(withHelper.invalid).toBe(false);
    expect(withHelper.controlProps.accessibilityHint).toBe('Your full name');

    const withError = run({ label: 'Name', helperText: 'Your full name', error: 'Required' });
    expect(withError.showHelper).toBe(false);
    expect(withError.showError).toBe(true);
    expect(withError.invalid).toBe(true);
  });

  it('treats error={true} as invalid without a message', () => {
    const result = run({ label: 'Name', error: true });
    expect(result.invalid).toBe(true);
    expect(result.showError).toBe(false);
  });

  it('prefers an explicit accessibilityLabel and appends an explicit hint', () => {
    const { controlProps } = run({ label: 'Email', accessibilityLabel: 'Work email', accessibilityHint: 'Double tap to edit', required: true });
    expect(controlProps['aria-label']).toBe('Work email');
    expect(controlProps.accessibilityHint).toBe('Double tap to edit');
  });

  it('marks disabled controls', () => {
    expect(run({ label: 'Email', disabled: true }).controlProps['aria-disabled']).toBe(true);
  });

  it('returns the same object across re-renders with the same inputs', () => {
    const { result, rerender } = renderHook(() => useFieldA11y({ id: 'x', label: 'Email', error: 'Bad' }));
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);
  });
});

describe('id helpers', () => {
  it('sanitizes React ids of every version', () => {
    expect(sanitizeId(':r0:')).toBe('pb-r0');
    expect(sanitizeId('«r1»')).toBe('pb-r1');
    expect(sanitizeId('_r_2_')).toBe('pb-_r_2_');
  });

  it('extracts text from nodes', () => {
    expect(getNodeText(<Text>Hello <Text>world</Text></Text>)).toBe('Hello world');
    expect(getNodeText(['a', 1, null, false])).toBe('a 1');
    expect(getNodeText(undefined)).toBe('');
  });
});
