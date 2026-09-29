import type React from 'react';
import { useMemo } from 'react';

import { isWeb } from '../platform';
import { a11yProps, type A11yProps } from './a11yProps';
import { getNodeText, useA11yId } from './useA11yId';

export interface UseFieldA11yOptions {
  /** Base id. The control gets it verbatim; parts get `${id}-label` etc. Generated when omitted. */
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Error message. A truthy non-boolean error is rendered and implies `invalid`. */
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
  /** Defaults to `!!error`. */
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Explicit accessible name for the control; replaces the label reference. */
  accessibilityLabel?: string;
  /** Extra native hint appended after the composed description/error. */
  accessibilityHint?: string;
  /** Word appended to the native label for required fields. Default `'required'`. */
  requiredText?: string;
}

export interface FieldA11yIds {
  control: string;
  label: string;
  description: string;
  error: string;
  helper: string;
}

/** Props for a text element that other elements reference by id. */
export interface FieldPartProps {
  id: string;
}

export interface FieldErrorProps extends FieldPartProps {
  role: 'alert';
  'aria-live': 'polite';
}

export interface UseFieldA11yResult {
  ids: FieldA11yIds;
  /** Spread on the focusable control (TextInput, Pressable, ...). */
  controlProps: A11yProps;
  /** Spread on the label text. */
  labelProps: FieldPartProps;
  /** Spread on the description text. */
  descriptionProps: FieldPartProps;
  /** Spread on the error container: role="alert" + aria-live="polite". */
  errorProps: FieldErrorProps;
  /** Spread on the helper text. */
  helperProps: FieldPartProps;
  invalid: boolean;
  /** Whether the footer should render the error (vs. helper text). */
  showError: boolean;
  /** Whether the footer should render helper text. */
  showHelper: boolean;
}

const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true && node !== '';

/**
 * Wires a form field's label, description, error and helper text to its control.
 *
 * Web: the label/description/error/helper elements get ids and the control gets
 * `aria-labelledby` / `aria-describedby` / `aria-invalid` / `aria-required`.
 * Native (no id references on iOS): the control gets a composed
 * `aria-label` ("Email, required") and `accessibilityHint` (error, description,
 * helper text).
 *
 * The footer shows the error when there is one, otherwise the helper text; only
 * the rendered one is referenced.
 *
 * @example
 * const { controlProps, labelProps, errorProps, ids } = useFieldA11y({ label, error, required });
 * <Text {...labelProps}>{label}</Text>
 * <TextInput {...controlProps} />
 * {error ? <View {...errorProps}><Text>{error}</Text></View> : null}
 */
export function useFieldA11y(options: UseFieldA11yOptions): UseFieldA11yResult {
  const {
    id,
    label,
    description,
    error,
    helperText,
    required = false,
    disabled = false,
    readOnly = false,
    accessibilityLabel,
    accessibilityHint,
    requiredText = 'required',
  } = options;

  const baseId = useA11yId(id);
  const hasLabel = hasContent(label);
  const hasDescription = hasContent(description);
  const showError = hasContent(error);
  const showHelper = !showError && hasContent(helperText);
  const invalid = options.invalid ?? (showError || error === true);

  // Only the text of these nodes feeds the native label/hint; compute it once per change.
  const labelText = useMemo(() => (isWeb ? '' : getNodeText(label)), [label]);
  const hintText = useMemo(() => {
    if (isWeb) return '';
    const parts = [
      showError ? getNodeText(error) : '',
      hasDescription ? getNodeText(description) : '',
      showHelper ? getNodeText(helperText) : '',
      accessibilityHint ?? '',
    ];
    return parts.filter(Boolean).join('. ');
  }, [showError, error, hasDescription, description, showHelper, helperText, accessibilityHint]);

  return useMemo<UseFieldA11yResult>(() => {
    const ids: FieldA11yIds = {
      control: baseId,
      label: `${baseId}-label`,
      description: `${baseId}-description`,
      error: `${baseId}-error`,
      helper: `${baseId}-helper`,
    };

    let nativeLabel: string | undefined = accessibilityLabel;
    if (!isWeb && nativeLabel === undefined && labelText) {
      nativeLabel = required ? `${labelText}, ${requiredText}` : labelText;
    }

    const controlProps = a11yProps({
      id: ids.control,
      label: isWeb ? accessibilityLabel : nativeLabel,
      labelledBy: isWeb && !accessibilityLabel && hasLabel ? ids.label : undefined,
      describedBy: [
        hasDescription && ids.description,
        showError && ids.error,
        showHelper && ids.helper,
      ],
      hint: hintText || undefined,
      invalid,
      required,
      disabled,
      readOnly,
    });

    return {
      ids,
      controlProps,
      labelProps: { id: ids.label },
      descriptionProps: { id: ids.description },
      errorProps: { id: ids.error, role: 'alert', 'aria-live': 'polite' },
      helperProps: { id: ids.helper },
      invalid,
      showError,
      showHelper,
    };
  }, [
    baseId,
    accessibilityLabel,
    labelText,
    required,
    requiredText,
    hasLabel,
    hasDescription,
    showError,
    showHelper,
    hintText,
    invalid,
    disabled,
    readOnly,
  ]);
}
