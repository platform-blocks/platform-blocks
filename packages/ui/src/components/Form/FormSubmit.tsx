import React from 'react';
import type { View } from 'react-native';
import { Button } from '../Button';
import { useFormContext, useOptionalFormContext } from './FormContext';
import { FormSubmitProps } from './types';

// See FormInput: the index signature on the props type defeats forwardRef's
// own inference, so the public type is declared rather than derived.
const FormSubmitBase = ({ 
  children, 
  disabled, 
  ...buttonProps 
}: FormSubmitProps, ref: React.Ref<View>) => {
  const formContext = useOptionalFormContext();
  
  const handlePress = () => {
    if (formContext) {
      formContext.submitForm();
    }
  };

  const isDisabled = disabled || 
    (formContext && (formContext.isSubmitting || formContext.disabled || !formContext.isValid)) ||
    false;

  return (
    <Button
      ref={ref}
      {...buttonProps}
      title={typeof children === 'string' ? children : 'Submit'}
      disabled={isDisabled}
      onPress={handlePress}
    />
  );
};

export const FormSubmit = React.forwardRef(FormSubmitBase as any) as React.ForwardRefExoticComponent<
  FormSubmitProps & React.RefAttributes<View>
>;

FormSubmit.displayName = 'FormSubmit';
