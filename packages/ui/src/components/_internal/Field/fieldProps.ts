import type React from 'react';
import type { ViewProps, ViewStyle } from 'react-native';

import type { BaseProps, RadiusValue } from '../../../core/types/base';
import type { SizeValue } from '../../../core/theme/types';
import type { LayoutProps } from '../../../core/utils/layout';
import type { DisclaimerSupport } from '../Disclaimer/disclaimerUtils';
import type { TextProps } from '../../Text/Text';

/** Visual variant shared by every form field frame. */
export type FieldVariant = 'default' | 'filled' | 'outline' | 'unstyled';

/**
 * Props every form field accepts, whatever its control: text inputs, selects,
 * pickers, sliders, file inputs, checkboxes. Rendered through the `Field`
 * frame, which links label, description, error and helper text to the control.
 */
export interface FieldBaseProps<S = ViewStyle> extends BaseProps<S>, LayoutProps, DisclaimerSupport {
  /** Label rendered above (or beside) the control. */
  label?: React.ReactNode;
  /** Short description rendered under the label. */
  description?: React.ReactNode;
  /** Error message. Marks the field invalid and is announced to assistive technology. */
  error?: React.ReactNode;
  /** Helper text rendered under the control when there is no error. */
  helperText?: React.ReactNode;
  /** Marks the field required (announced; shows an asterisk unless `withAsterisk` is false). */
  required?: boolean;
  /** Show the required asterisk. Defaults to `required`. */
  withAsterisk?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: SizeValue;
  radius?: RadiusValue;
  variant?: FieldVariant;
  /** Field name for form integration. */
  name?: string;
  /** Overrides the accessible name composed from `label`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Identifier used with KeyboardManagerProvider to request refocus. */
  keyboardFocusId?: string;
  /** Props applied to the label `<Text>`. */
  labelProps?: Omit<TextProps, 'children'>;
  /** Props applied to the description `<Text>`. */
  descriptionProps?: Omit<TextProps, 'children'>;
  onFocus?: () => void;
  onBlur?: () => void;
}

/** Props for fields where the user types text. */
export interface TextFieldBaseProps<S = ViewStyle> extends FieldBaseProps<S> {
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Falls back to `theme.text.muted`. */
  placeholderTextColor?: string;
  /** Show a clear button while the field has a value. */
  clearable?: boolean;
  clearButtonLabel?: string;
  onClear?: () => void;
  /** Debounce delay for validation, in milliseconds. */
  debounceMs?: number;
  /** Called when Enter is pressed. */
  onEnter?: () => void;
  startSection?: React.ReactNode;
  endSection?: React.ReactNode;
  startSectionProps?: Omit<ViewProps, 'children'>;
  endSectionProps?: Omit<ViewProps, 'children'>;
}
