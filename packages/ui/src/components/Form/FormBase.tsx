import React from 'react';
import { View } from 'react-native';
import { factory } from '../../core/factory/factory';
import { useStyleProps } from '../../core/utils/spacing';
import { FormProvider } from './FormContext';
import type { FormProps } from './types';

/** Form root: provides values, validation and submission to the fields inside it. */
export const FormBase = factory<{ props: FormProps; ref: View }>(
  (
    {
      initialValues,
      validationSchema,
      onSubmit,
      validate,
      disabled,
      validateOnChange,
      validateOnBlur,
      children,
      style,
      testID,
      ...spacing
    },
    ref
  ) => {
    const spacingStyles = useStyleProps(spacing);
    return (
      <FormProvider
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        validate={validate}
        disabled={disabled}
        validateOnChange={validateOnChange}
        validateOnBlur={validateOnBlur}
      >
        <View ref={ref} style={[spacingStyles, style]} testID={testID}>
          {children}
        </View>
      </FormProvider>
    );
  },
  { displayName: 'Form', memo: false }
);
