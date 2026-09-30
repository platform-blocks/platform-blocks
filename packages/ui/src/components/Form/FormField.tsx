import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import { factory } from '../../core/factory/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useStyleProps } from '../../core/utils/spacing';
import { Field } from '../_internal/Field/Field';
import { FormFieldContextProvider, useOptionalFormContext, type FormFieldContextValue } from './FormContext';
import type { FormFieldProps, FormFieldValidation } from './types';

const FULL_WIDTH: ViewStyle = { width: '100%' };

const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== '';

/**
 * One field of a form (`Form.Field`, also exported as `FormField` for form
 * layouts). With `name` inside a `Form` it binds the `Form.Input` /
 * `Form.Label` / `Form.Error` inside it; with `label` / `description` /
 * `error` / `helperText` it renders them around its children through the
 * shared field frame, so a library input inside without a label of its own is
 * named by this label.
 */
export const FormField = factory<{ props: FormFieldProps; ref: View }>(
  (
    {
      name,
      dependsOn,
      validateWhen,
      validation,
      label,
      description,
      error,
      helperText,
      required: requiredProp,
      labelPosition = 'top',
      children,
      style,
      testID,
      ...spacing
    },
    ref
  ) => {
    const form = useOptionalFormContext();
    const spacingStyles = useStyleProps(spacing);
    const styles = useThemedStyles(
      () => ({
        control: { flex: 1 },
      }),
      []
    );

    // Dependencies: show / hide / enable / disable / require from other values.
    const fieldState = useMemo(() => {
      let visible = true;
      let enabled = true;
      let required = false;
      if (form && dependsOn) {
        for (const dependency of dependsOn) {
          const conditionMet = dependency.condition(form.values[dependency.field], form.values);
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
      }
      return { visible, enabled, required };
    }, [dependsOn, form]);

    // Field-level validation, read lazily by the form so it always sees the latest props.
    const validationRef = useRef<FormFieldValidation>({ rules: validation, when: validateWhen });
    validationRef.current = { rules: validation, when: validateWhen };
    const registerFieldValidation = form?.registerFieldValidation;
    const hasFieldValidation = !!validation?.length;
    useEffect(() => {
      if (!registerFieldValidation || !name || !hasFieldValidation) return undefined;
      return registerFieldValidation(name, () => validationRef.current);
    }, [registerFieldValidation, name, hasFieldValidation]);

    const [labelId, setLabelId] = useState<string | undefined>(undefined);
    const registerLabel = useCallback((id: string) => {
      setLabelId(id);
      return () => setLabelId((current) => (current === id ? undefined : current));
    }, []);

    const disabled = !!form?.disabled || !fieldState.enabled;
    const required = requiredProp ?? fieldState.required;

    const fieldContext = useMemo<FormFieldContextValue>(
      () => ({ name, disabled, required, labelId, registerLabel }),
      [name, disabled, required, labelId, registerLabel]
    );

    if (!fieldState.visible) {
      return null;
    }

    // Full width unless `w` says otherwise.
    const rootStyle = [FULL_WIDTH, spacingStyles, style];
    const framed = hasContent(label) || hasContent(description) || hasContent(helperText) || hasContent(error);

    if (!framed) {
      return (
        <FormFieldContextProvider value={fieldContext}>
          <View ref={ref} style={rootStyle} testID={testID}>
            {children}
          </View>
        </FormFieldContextProvider>
      );
    }

    // With a label, the frame shows the form's error for this field (once touched).
    const formError = name && form?.touched[name] ? form.errors[name] || undefined : undefined;

    return (
      <FormFieldContextProvider value={fieldContext}>
        <View ref={ref} style={rootStyle} testID={testID}>
          <Field
            label={label}
            description={description}
            error={error ?? formError}
            helperText={helperText}
            required={required}
            disabled={disabled}
            labelPosition={labelPosition}
          >
            {labelPosition === 'top' ? children : <View style={styles.control}>{children}</View>}
          </Field>
        </View>
      </FormFieldContextProvider>
    );
  },
  { displayName: 'FormField' }
);
