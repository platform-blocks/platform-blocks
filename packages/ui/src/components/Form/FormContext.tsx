import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { validateValue } from '../Input/validation';
import type { ValidationRule } from '../Input/types';
import type {
  FormContextValue,
  FormFieldBinding,
  FormFieldValidation,
  FormValues,
  ValidationSchema,
} from './types';

const FormContext = createContext<FormContextValue | null>(null);
FormContext.displayName = 'FormContext';

export const useFormContext = (): FormContextValue => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
};

export const useOptionalFormContext = (): FormContextValue | null => {
  return useContext(FormContext);
};

/** What a `Form.Field` tells the `Form.Input` / `Form.Label` / `Form.Error` inside it. */
export interface FormFieldContextValue {
  name?: string;
  disabled: boolean;
  required: boolean;
  /** Id of the field's `Form.Label`, once one has mounted. */
  labelId?: string;
  /** Called by a `Form.Label` inside the field; returns the unregister function. */
  registerLabel: (id: string) => () => void;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);
FormFieldContext.displayName = 'FormFieldContext';

export const FormFieldContextProvider = FormFieldContext.Provider;

/** The enclosing `Form.Field`'s binding, or null. */
export const useFormFieldContext = (): FormFieldContextValue | null => useContext(FormFieldContext);

/** Id given to a field's `Form.Label` (web DOM id / native nativeID). */
export const formLabelId = (name: string) => `pb-form-${name.replace(/[^A-Za-z0-9_-]/g, '_')}-label`;

interface FormProviderProps {
  initialValues?: FormValues;
  validationSchema?: ValidationSchema;
  onSubmit?: (values: FormValues) => void | Promise<void>;
  validate?: (values: FormValues) => Record<string, string> | Promise<Record<string, string>>;
  disabled?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  children: React.ReactNode;
}

const EMPTY_VALUES: FormValues = {};
const EMPTY_SCHEMA: ValidationSchema = {};

export const FormProvider: React.FC<FormProviderProps> = ({
  initialValues = EMPTY_VALUES,
  validationSchema = EMPTY_SCHEMA,
  onSubmit,
  validate,
  disabled = false,
  validateOnChange = true,
  validateOnBlur = true,
  children,
}) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-level rules registered by Form.Field (read lazily, so they are always current).
  const fieldValidationRef = useRef(new Map<string, () => FormFieldValidation>());

  const registerFieldValidation = useCallback((name: string, validation: () => FormFieldValidation) => {
    fieldValidationRef.current.set(name, validation);
    return () => {
      if (fieldValidationRef.current.get(name) === validation) {
        fieldValidationRef.current.delete(name);
      }
    };
  }, []);

  const rulesFor = useCallback(
    (name: string, formValues: FormValues): ValidationRule[] => {
      const rules = [...(validationSchema[name] ?? [])];
      const field = fieldValidationRef.current.get(name)?.();
      if (field?.rules?.length) {
        const applies = !field.when || field.when.condition(formValues[field.when.field], formValues);
        if (applies) rules.push(...field.rules);
      }
      return rules;
    },
    [validationSchema]
  );

  const validateField = useCallback(
    async (name: string, value: unknown): Promise<string | null> => {
      const rules = rulesFor(name, values);
      if (rules.length === 0) return null;
      const fieldErrors = await validateValue(value, rules, values);
      return fieldErrors.length > 0 ? fieldErrors[0] : null;
    },
    [rulesFor, values]
  );

  const setFieldValue = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      if (validateOnChange) {
        validateField(name, value).then((error) => {
          setErrors((prev) => ({ ...prev, [name]: error || '' }));
        });
      }
    },
    [validateOnChange, validateField]
  );

  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [name]: error || '' }));
  }, []);

  const setFieldTouched = useCallback((name: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  const getFieldProps = useCallback(
    (name: string): FormFieldBinding => ({
      value: values[name] ?? '',
      onChangeText: (value: unknown) => setFieldValue(name, value),
      onBlur: () => {
        setFieldTouched(name, true);
        if (validateOnBlur) {
          validateField(name, values[name]).then((error) => setFieldError(name, error));
        }
      },
      error: touched[name] ? errors[name] || undefined : undefined,
      name,
    }),
    [values, errors, touched, setFieldValue, setFieldTouched, validateOnBlur, validateField, setFieldError]
  );

  const fieldNames = useCallback(
    () => Array.from(new Set([...Object.keys(validationSchema), ...fieldValidationRef.current.keys()])),
    [validationSchema]
  );

  const validateForm = useCallback(async (): Promise<Record<string, string>> => {
    const allErrors: Record<string, string> = {};

    if (validate) {
      Object.assign(allErrors, await validate(values));
    }

    for (const fieldName of fieldNames()) {
      const rules = rulesFor(fieldName, values);
      if (rules.length === 0) continue;
      const fieldErrors = await validateValue(values[fieldName], rules, values);
      if (fieldErrors.length > 0) {
        allErrors[fieldName] = fieldErrors[0];
      }
    }

    return allErrors;
  }, [values, validate, fieldNames, rulesFor]);

  const submitForm = useCallback(async () => {
    if (isSubmitting || disabled) return;

    setIsSubmitting(true);

    try {
      // Mark every validated field as touched so its error shows.
      const touchedFields: Record<string, boolean> = {};
      for (const name of fieldNames()) touchedFields[name] = true;
      setTouched(touchedFields);

      const formErrors = await validateForm();
      setErrors(formErrors);

      if (Object.keys(formErrors).length === 0) {
        await onSubmit?.(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, disabled, fieldNames, validateForm, onSubmit, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = useMemo(() => Object.values(errors).every((error) => !error), [errors]);

  const contextValue = useMemo<FormContextValue>(
    () => ({
      values,
      errors,
      touched,
      disabled,
      isSubmitting,
      isValid,
      validateField,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      getFieldProps,
      registerFieldValidation,
      submitForm,
      resetForm,
    }),
    [
      values,
      errors,
      touched,
      disabled,
      isSubmitting,
      isValid,
      validateField,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      getFieldProps,
      registerFieldValidation,
      submitForm,
      resetForm,
    ]
  );

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
};
