import React from 'react';
import type { Text as RNText } from 'react-native';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { resolveFontSize } from '../../core/theme/tokens';
import { Text } from '../Text';
import { useFormFieldContext, useOptionalFormContext } from './FormContext';
import type { FormErrorProps } from './types';

/** The error message of a form field (`error`, else the form's error for `name`), announced when it appears. */
export const FormError = factory<{ props: FormErrorProps; ref: RNText }>(
  ({ name: nameProp, error, style, testID }, ref) => {
    const formContext = useOptionalFormContext();
    const fieldContext = useFormFieldContext();
    const name = nameProp ?? fieldContext?.name;
    const styles = useThemedStyles(
      (theme) => ({
        error: { fontSize: resolveFontSize(theme, 'sm'), color: theme.colors.error[5], marginTop: 4 },
      }),
      []
    );

    const errorMessage = error || (formContext && name ? formContext.errors[name] : undefined);
    if (!errorMessage) {
      return null;
    }

    return (
      <Text ref={ref} style={[styles.error, style]} testID={testID} {...a11yProps({ role: 'alert', live: 'polite' })}>
        {errorMessage}
      </Text>
    );
  },
  { displayName: 'FormError' }
);
