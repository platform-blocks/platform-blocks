import React from 'react';
import type { Text as RNText } from 'react-native';
import { Text } from '../Text';
import { FormLabelProps } from './types';

export const FormLabel = React.forwardRef<RNText, FormLabelProps>(({ 
  htmlFor, 
  required, 
  children 
}, ref) => {
  return (
    <Text 
      ref={ref}
      style={{ 
        fontSize: 14, 
        fontWeight: '600', 
        marginBottom: 4 
      }}
    >
      {children}
      {required && (
        <Text style={{ color: '#e53e3e' }}>
          {' *'}
        </Text>
      )}
    </Text>
  );
});

FormLabel.displayName = 'FormLabel';
