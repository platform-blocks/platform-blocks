import React from 'react';
import type { TextInput } from 'react-native';
import { useFormContext, useOptionalFormContext } from './FormContext';
import { Input } from '../Input';
import { FormInputProps } from './types';

// `FormInputProps` has an index signature, which makes React's `PropsWithoutRef`
// collapse every prop to `any`; state the public type explicitly instead.
const FormInputBase = ({ name, ...inputProps }: FormInputProps, ref: React.Ref<TextInput>) => {
  const formContext = useOptionalFormContext();
  
  if (!formContext || !name) {
    // Fallback to regular Input if not in form context or no name
    return <Input ref={ref} {...inputProps} />;
  }

  const fieldProps = formContext.getFieldProps(name);

  return (
    <Input
      ref={ref}
      {...inputProps}
      {...fieldProps}
    />
  );
};

export const FormInput = React.forwardRef(FormInputBase as any) as React.ForwardRefExoticComponent<
  FormInputProps & React.RefAttributes<TextInput>
>;

FormInput.displayName = 'FormInput';
