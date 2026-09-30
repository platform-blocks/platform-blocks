import React from 'react';
import type { TextInput } from 'react-native';
import { factory } from '../../core/factory/factory';
import { Input } from '../Input/Input';
import type { ExtendedTextInputProps } from '../Input/types';
import { useFieldContext } from '../_internal/Field/Field';
import { useFormFieldContext, useOptionalFormContext } from './FormContext';
import type { FormInputProps } from './types';

/**
 * An `Input` bound to a form field: value, change, blur (touch + validation)
 * and error come from the enclosing `Form` for `name` (or the enclosing
 * `Form.Field`'s name). Outside a form it is a plain `Input`.
 */
export const FormInput = factory<{ props: FormInputProps; ref: TextInput }>(
  ({ name: nameProp, disabled, required, textInputProps, ...inputProps }, ref) => {
    const formContext = useOptionalFormContext();
    const fieldContext = useFormFieldContext();
    // Inside a labelled Form.Field the frame shows the label and the error.
    const framed = useFieldContext() !== null;
    const name = nameProp ?? fieldContext?.name;

    const labelledBy =
      fieldContext?.labelId && !inputProps.label && !inputProps.accessibilityLabel ? fieldContext.labelId : undefined;
    const mergedTextInputProps: ExtendedTextInputProps | undefined = labelledBy
      ? { 'aria-labelledby': labelledBy, ...textInputProps }
      : textInputProps;

    const shared = {
      disabled: disabled ?? fieldContext?.disabled,
      required: required ?? fieldContext?.required,
      textInputProps: mergedTextInputProps,
    };

    if (!formContext || !name) {
      return <Input ref={ref} name={name} {...inputProps} {...shared} />;
    }

    const { error: fieldError, ...binding } = formContext.getFieldProps(name);

    return (
      <Input
        ref={ref}
        {...inputProps}
        {...shared}
        {...binding}
        error={inputProps.error ?? (framed ? undefined : fieldError)}
      />
    );
  },
  { displayName: 'FormInput' }
);
