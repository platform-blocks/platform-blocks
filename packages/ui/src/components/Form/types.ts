import type React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { ButtonProps } from '../Button/types';
import type { InputProps, ValidationRule } from '../Input/types';

/**
 * A form's value bag, keyed by field name.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the bag holds whatever each field produces; `unknown` would force a cast in every onSubmit/validate handler
export type FormValues = Record<string, any>;

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

/** What `getFieldProps(name)` returns: spread onto a text field to bind it to the form. */
export interface FormFieldBinding {
  value: FormValues[string];
  onChangeText: (value: unknown) => void;
  onBlur: () => void;
  error?: string;
  name: string;
}

/** Rules a `Form.Field` adds for its field, optionally only while a condition holds. */
export interface FormFieldValidation {
  rules?: ValidationRule[];
  when?: FormFieldProps['validateWhen'];
}

export interface FormContextValue {
  /** Form values */
  values: FormValues;

  /** Form errors */
  errors: Record<string, string>;

  /** Touched fields */
  touched: Record<string, boolean>;

  /** Whether form is disabled */
  disabled: boolean;

  /** Whether form is submitting */
  isSubmitting: boolean;

  /** Whether form is valid */
  isValid: boolean;

  /** Validate a single field */
  validateField: (name: string, value: unknown) => Promise<string | null>;

  /** Set field value */
  setFieldValue: (name: string, value: unknown) => void;

  /** Set field error */
  setFieldError: (name: string, error: string | null) => void;

  /** Set field as touched */
  setFieldTouched: (name: string, touched: boolean) => void;

  /** Get field props for binding */
  getFieldProps: (name: string) => FormFieldBinding;

  /**
   * Registers field-level validation (used by `Form.Field`'s `validation` /
   * `validateWhen`); returns the unregister function.
   */
  registerFieldValidation: (name: string, validation: () => FormFieldValidation) => () => void;

  /** Submit form */
  submitForm: () => Promise<void>;

  /** Reset form */
  resetForm: () => void;
}

export interface FormProps extends BaseProps<ViewStyle> {
  /** Initial form values */
  initialValues?: FormValues;

  /** Form validation schema */
  validationSchema?: ValidationSchema;

  /** Submit handler */
  onSubmit?: (values: FormValues) => void | Promise<void>;

  /** Validation handler */
  validate?: (values: FormValues) => Record<string, string> | Promise<Record<string, string>>;

  /** Whether form is disabled */
  disabled?: boolean;

  /** Whether to validate on change */
  validateOnChange?: boolean;

  /** Whether to validate on blur */
  validateOnBlur?: boolean;

  /** Children components */
  children: React.ReactNode;
}

export interface FormFieldDependency {
  field: string;
  condition: (value: unknown, formValues: FormValues) => boolean;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

/**
 * One field of a form. Two roles, usable together:
 * - **binding** (`name` inside a `Form`): `Form.Input` / `Form.Label` /
 *   `Form.Error` inside it pick up the name, disabled and required state;
 *   `dependsOn` shows/hides/enables/requires it from other values;
 *   `validation` / `validateWhen` add field-level rules.
 * - **layout** (`label`, `description`, `error`, `helperText`): renders them
 *   around the children through the shared field frame, labelling a library
 *   input inside it that has no label of its own.
 */
export interface FormFieldProps extends BaseProps<ViewStyle> {
  /** Field name (binds the field to the enclosing `Form`). */
  name?: string;

  /** Field dependencies for conditional logic */
  dependsOn?: FormFieldDependency[];

  /** Only validate this field (its `validation` rules) while the condition holds. */
  validateWhen?: {
    field: string;
    condition: (value: unknown, formValues: FormValues) => boolean;
  };

  /** Validation rules for this field, added to the form's `validationSchema`. */
  validation?: ValidationRule[];

  /** Label rendered above (or beside) the field. */
  label?: React.ReactNode;

  /** Description rendered under the label. */
  description?: React.ReactNode;

  /** Error message. Defaults to the form's error for `name` once touched (when a label is shown). */
  error?: React.ReactNode;

  /** Helper text under the field when there is no error. */
  helperText?: React.ReactNode;

  /** Marks the field required. */
  required?: boolean;

  /**
   * Where the label goes. `'start'` / `'end'` put it beside the field (logical:
   * they follow the reading direction).
   */
  labelPosition?: 'top' | 'start' | 'end';

  /** Children components */
  children: React.ReactNode;
}

/** Props of `Form.Input`: an `Input` bound to the form field `name` (or the enclosing `Form.Field`'s). */
export type FormInputProps = InputProps;

export interface FormLabelProps {
  /** Name of the field this labels (defaults to the enclosing `Form.Field`'s). */
  htmlFor?: string;

  /** Whether field is required */
  required?: boolean;

  /** Label content */
  children: React.ReactNode;

  style?: StyleProp<TextStyle>;
  testID?: string;
}

export interface FormErrorProps {
  /** Field name to show error for */
  name?: string;

  /** Custom error message */
  error?: string;

  style?: StyleProp<TextStyle>;
  testID?: string;
}

export interface FormSubmitProps extends Omit<ButtonProps, 'onPress' | 'title' | 'children'> {
  /** Submit button content */
  children: React.ReactNode;
}
