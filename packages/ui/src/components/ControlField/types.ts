import React from 'react';
import { SizeValue, ColorValue, SpacingProps } from '../../core/theme/types';
import type { TextProps } from '../Text';

export interface BaseComponentProps extends SpacingProps {
  /** Component test ID for testing */
  testID?: string;

  /** Additional style applied to the pressable row */
  style?: any;
}

/** Indicator control rendered inside the field when no custom control is supplied. */
export type ControlFieldVariant = 'checkbox' | 'radio' | 'switch';

export interface ControlFieldProps extends BaseComponentProps {
  /** Controlled selected state */
  isSelected?: boolean;
  /** Alias for `isSelected` to match other controls in the library */
  checked?: boolean;
  /** Initial selected state for uncontrolled usage */
  defaultSelected?: boolean;

  /** Change handler — fires with the next selected value */
  onSelectedChange?: (selected: boolean) => void;
  /** Alias for `onSelectedChange` to match other controls in the library */
  onChange?: (selected: boolean) => void;

  /** Whether the field is disabled */
  isDisabled?: boolean;
  /** Alias for `isDisabled` */
  disabled?: boolean;

  /** Whether the field is in an invalid state (defaults to true when `error` is set) */
  isInvalid?: boolean;

  /** Whether the field is required (renders an asterisk on the label) */
  isRequired?: boolean;
  /** Alias for `isRequired` */
  required?: boolean;

  /** Which built-in control renders in the indicator slot */
  variant?: ControlFieldVariant;

  /** Primary label text */
  label?: React.ReactNode;
  /** Helper text shown beneath the label */
  description?: React.ReactNode;
  /** Error message shown below the row when invalid */
  error?: string;

  /** Indicator color. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ColorValue;
  /** Indicator + label size */
  size?: SizeValue;

  /** Which side the indicator sits on. Defaults to `right`. */
  indicatorPosition?: 'left' | 'right';

  /**
   * Custom control element used instead of the built-in `variant` indicator.
   * `checked` / `disabled` are injected automatically when not already set.
   */
  control?: React.ReactElement;

  /** Override props applied to the label `<Text>` */
  labelProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the description `<Text>` */
  descriptionProps?: Omit<TextProps, 'children'>;

  /**
   * Compound composition. When provided, children replace the built-in
   * label/description/indicator layout. Use `ControlField.Label`,
   * `ControlField.Description`, `ControlField.Indicator` and
   * `ControlField.Error`.
   */
  children?: React.ReactNode;

  /** Accessibility label, used when there is no visible text label */
  accessibilityLabel?: string;
}

export interface ControlFieldContextValue {
  isSelected: boolean;
  onSelectedChange: (selected: boolean) => void;
  isDisabled: boolean;
  isInvalid: boolean;
  isRequired: boolean;
  size: SizeValue;
  color?: ColorValue;
  variant: ControlFieldVariant;
}

export interface ControlFieldGroupContextValue {
  /** Default size applied to child fields that don't set their own */
  size?: SizeValue;
}

export interface ControlFieldGroupProps extends SpacingProps {
  /** ControlField rows */
  children: React.ReactNode;

  /**
   * Surface treatment.
   * - `default` — filled surface, no border
   * - `bordered` — filled surface with a hairline border
   * - `flush` — no surface; just the dividers between rows
   */
  variant?: 'default' | 'bordered' | 'flush';

  /** Insert a divider between rows. Defaults to `true`. */
  dividers?: boolean;
  /** Inset the divider from the leading edge to align under the row content. */
  insetDividers?: boolean;

  /** Corner radius token or pixel value. Defaults to `md`. */
  radius?: 'sm' | 'md' | 'lg' | number;

  /** Default size applied to every child field (and the row padding scale). */
  size?: SizeValue;

  /** Optional section title rendered above the surface */
  title?: React.ReactNode;
  /** Optional footer/help text rendered below the surface */
  footer?: React.ReactNode;

  /** Style override applied to the surface container */
  style?: any;
  /** Component test ID */
  testID?: string;
}

export interface ControlFieldLabelProps extends Omit<TextProps, 'children'> {
  children?: React.ReactNode;
}

export interface ControlFieldDescriptionProps extends Omit<TextProps, 'children'> {
  children?: React.ReactNode;
}

export interface ControlFieldIndicatorProps {
  /** Override the field's variant for this indicator */
  variant?: ControlFieldVariant;
  /** Custom control element (checked/disabled injected from context) */
  children?: React.ReactElement;
  style?: any;
}

export interface ControlFieldErrorProps extends Omit<TextProps, 'children'> {
  children?: React.ReactNode;
}
