import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { SizeValue } from '../../core/theme/types';
import type { TextProps } from '../Text';

/** Indicator control rendered inside the field when no custom control is supplied. */
export type ControlFieldVariant = 'checkbox' | 'radio' | 'switch';

/**
 * Props for `ControlField` — a label, description and control (Switch,
 * Checkbox or Radio) as one pressable row.
 *
 * `style`, `ref` and `testID` go to the pressable row (the control itself);
 * style props go to the outer wrapper that also holds the error message.
 */
export interface ControlFieldProps extends BaseProps {
  /** Controlled on/selected state. */
  checked?: boolean;
  /** Initial state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Called with the next state. */
  onChange?: (checked: boolean) => void;

  /** Disables the row. */
  disabled?: boolean;
  /** Marks the field required (asterisk on the label, announced). */
  required?: boolean;

  /** Which built-in control renders in the indicator slot. Default `'switch'`. */
  variant?: ControlFieldVariant;

  /** Primary label. */
  label?: React.ReactNode;
  /** Supporting text shown beneath the label. */
  description?: React.ReactNode;
  /**
   * Error shown below the row; marks the field invalid. `true` marks it invalid
   * without a message.
   */
  error?: React.ReactNode;

  /** Indicator color: a palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;
  /** Indicator + label size. Inherits from `ControlField.Group`. */
  size?: SizeValue;

  /** Which side the indicator sits on (logical: `right` = end). Default `'right'`. */
  indicatorPosition?: 'left' | 'right';

  /**
   * Custom control element used instead of the built-in `variant` indicator.
   * `checked` / `disabled` are injected automatically when not already set.
   */
  control?: React.ReactElement<{ checked?: boolean; disabled?: boolean }>;

  /** Props applied to the label `<Text>`. */
  labelProps?: Omit<TextProps, 'children'>;
  /** Props applied to the description `<Text>`. */
  descriptionProps?: Omit<TextProps, 'children'>;

  /**
   * Compound composition. When provided, children replace the built-in
   * label/description/indicator layout. Use `ControlField.Label`,
   * `ControlField.Description`, `ControlField.Indicator` and
   * `ControlField.Error`.
   */
  children?: React.ReactNode;

  /** Accessible name when there is no visible text label (overrides the label). */
  accessibilityLabel?: string;
  /** Extra native hint. */
  accessibilityHint?: string;
  /** Base id: the row gets it, the label/description/error get `${id}-label` etc. */
  id?: string;
}

/** Ids of the parts the row references (aria-labelledby / aria-describedby). */
export interface ControlFieldIds {
  control: string;
  label: string;
  description: string;
  error: string;
}

export type ControlFieldPart = 'label' | 'description' | 'error';

export interface ControlFieldContextValue {
  checked: boolean;
  /** Request a new state (ignored while disabled). */
  onChange: (checked: boolean) => void;
  disabled: boolean;
  invalid: boolean;
  required: boolean;
  size: SizeValue;
  color?: ThemeColor;
  variant: ControlFieldVariant;
  ids: ControlFieldIds;
  /** Compound parts report themselves so the row can reference them. */
  registerPart: (part: ControlFieldPart, present: boolean) => void;
}

export interface ControlFieldGroupContextValue {
  /** Default size applied to child fields that don't set their own. */
  size?: SizeValue;
}

export interface ControlFieldGroupProps extends BaseProps {
  /** ControlField rows. */
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

  /** Corner radius token or pixel value. Defaults to `lg`. */
  radius?: RadiusValue;

  /** Default size applied to every child field (and the row padding scale). */
  size?: SizeValue;

  /** Optional section title rendered above the surface. */
  title?: React.ReactNode;
  /** Override props for the title `<Text>`; the theme's `sectionLabel` text role by default. */
  titleProps?: Omit<TextProps, 'children'>;
  /** Optional footer/help text rendered below the surface. */
  footer?: React.ReactNode;
}

export interface ControlFieldLabelProps extends Omit<TextProps, 'children'> {
  children?: React.ReactNode;
}

export interface ControlFieldDescriptionProps extends Omit<TextProps, 'children'> {
  children?: React.ReactNode;
}

export interface ControlFieldIndicatorProps {
  /** Override the field's variant for this indicator. */
  variant?: ControlFieldVariant;
  /** Custom control element (checked/disabled injected from context). */
  children?: React.ReactElement<{ checked?: boolean; disabled?: boolean }>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface ControlFieldErrorProps extends Omit<TextProps, 'children'> {
  children?: React.ReactNode;
}
