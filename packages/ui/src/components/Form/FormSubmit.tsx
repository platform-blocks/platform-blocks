import React from 'react';
import type { View } from 'react-native';
import { factory } from '../../core/factory/factory';
import { Button } from '../Button';
import { useOptionalFormContext } from './FormContext';
import type { FormSubmitProps } from './types';

/** Submits the enclosing `Form`; disabled while submitting, disabled or invalid, and shows loading while submitting. */
export const FormSubmit = factory<{ props: FormSubmitProps; ref: View }>(
  ({ children, disabled, loading, ...buttonProps }, ref) => {
    const formContext = useOptionalFormContext();

    const isDisabled =
      !!disabled || (!!formContext && (formContext.isSubmitting || formContext.disabled || !formContext.isValid));

    return (
      <Button
        ref={ref}
        {...buttonProps}
        loading={loading ?? formContext?.isSubmitting}
        disabled={isDisabled}
        onPress={() => {
          formContext?.submitForm();
        }}
      >
        {children}
      </Button>
    );
  },
  { displayName: 'FormSubmit' }
);
