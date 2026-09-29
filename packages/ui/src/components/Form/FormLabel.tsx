import React, { useEffect } from 'react';
import type { Text as RNText } from 'react-native';
import { factory } from '../../core/factory/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { isWeb } from '../../core/platform';
import { resolveFontSize } from '../../core/theme/tokens';
import { Text } from '../Text';
import { formLabelId, useFormFieldContext } from './FormContext';
import type { FormLabelProps } from './types';

/**
 * A standalone label for a form field. Inside a `Form.Field` (or with
 * `htmlFor`) it gets an id the field's `Form.Input` references
 * (`aria-labelledby`), so it names the input.
 */
export const FormLabel = factory<{ props: FormLabelProps; ref: RNText }>(
  ({ htmlFor, required: requiredProp, children, style, testID }, ref) => {
    const fieldContext = useFormFieldContext();
    const target = htmlFor ?? fieldContext?.name;
    const id = target ? formLabelId(target) : undefined;
    const required = requiredProp ?? fieldContext?.required ?? false;
    const registerLabel = fieldContext?.registerLabel;

    useEffect(() => {
      if (!id || !registerLabel) return undefined;
      return registerLabel(id);
    }, [id, registerLabel]);

    const styles = useThemedStyles(
      (theme) => ({
        label: { fontSize: resolveFontSize(theme, 'md'), fontWeight: '600' as const, marginBottom: 4 },
        required: { color: theme.colors.error[5] },
      }),
      []
    );

    return (
      <Text ref={ref} id={id} style={[styles.label, style]} testID={testID}>
        {children}
        {required ? (
          isWeb ? (
            <span aria-hidden="true" style={styles.required}>
              {' *'}
            </span>
          ) : (
            <Text style={styles.required}>{' *'}</Text>
          )
        ) : null}
      </Text>
    );
  },
  { displayName: 'FormLabel' }
);
