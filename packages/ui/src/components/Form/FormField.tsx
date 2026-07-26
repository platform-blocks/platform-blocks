import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useFormContext } from './FormContext';
import { FormFieldProps } from './types';
import { FormInput } from './FormInput';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';

export const FormField = React.forwardRef<View, FormFieldProps>(({
  name,
  dependsOn = [],
  validateWhen,
  validation,
  children
}, ref) => {
  const formContext = useFormContext();
  
  // Check if field should be visible/enabled based on dependencies
  const fieldState = useMemo(() => {
    let visible = true;
    let enabled = true;
    let required = false;

    for (const dependency of dependsOn) {
      const dependentValue = formContext.values[dependency.field];
      const conditionMet = dependency.condition(dependentValue, formContext.values);

      switch (dependency.action) {
        case 'show':
          visible = conditionMet;
          break;
        case 'hide':
          visible = !conditionMet;
          break;
        case 'enable':
          enabled = conditionMet;
          break;
        case 'disable':
          enabled = !conditionMet;
          break;
        case 'require':
          required = conditionMet;
          break;
      }
    }

    return { visible, enabled, required };
  }, [dependsOn, formContext.values]);

  // Don't render if not visible
  if (!fieldState.visible) {
    return null;
  }

  // Clone children to inject form props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // If it's a form input component, inject the field props
      if (child.type && typeof child.type === 'object' && 'displayName' in child.type) {
        const displayName = (child.type as any).displayName;
        if (displayName === 'FormInput' || displayName === 'FormError' || displayName === 'FormLabel') {
          return React.cloneElement(child, {
            name,
            disabled: formContext.disabled || !fieldState.enabled,
            required: fieldState.required,
            ...(child.props as any)
          });
        }
      }
      
      // Also check for direct component references
      if (child.type === FormInput || child.type === FormError || child.type === FormLabel) {
        return React.cloneElement(child, {
          name,
          disabled: formContext.disabled || !fieldState.enabled,
          required: fieldState.required,
          ...(child.props as any)
        });
      }
    }
    return child;
  });

  return (
    <View ref={ref}>
      {childrenWithProps}
    </View>
  );
});

FormField.displayName = 'FormField';
