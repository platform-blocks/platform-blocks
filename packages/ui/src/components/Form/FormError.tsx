import React from 'react';
import type { Text as RNText } from 'react-native';
import { Text } from '../Text';
import { useFormContext, useOptionalFormContext } from './FormContext';
import { FormErrorProps } from './types';

export const FormError = React.forwardRef<RNText, FormErrorProps>(({ name, error }, ref) => {
  const formContext = useOptionalFormContext();
  
  let errorMessage = error;
  
  if (!errorMessage && formContext && name) {
    errorMessage = formContext.errors[name];
  }

  if (!errorMessage) {
    return null;
  }

  return (
    <Text 
      ref={ref}
      style={{ 
        fontSize: 12, 
        color: '#e53e3e', 
        marginTop: 4 
      }}
    >
      {errorMessage}
    </Text>
  );
});

FormError.displayName = 'FormError';
