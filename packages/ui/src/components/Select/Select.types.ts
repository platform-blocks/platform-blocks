import React from 'react';
import { SizeValue } from '../../core/theme/sizes';
import { LayoutProps, SpacingProps } from '../../core/utils';
import type { TextProps } from '../Text';
import type { InputVariant } from '../Input/types';

/**
 * Represents a single option exposed by the Select component.
 */
export interface SelectOption<T = any> {
  /** Human-readable text displayed for the option. */
  label: string;
  /** Value returned when the option is chosen. */
  value: T;
  /**
   * Secondary line rendered under the label inside the dropdown. The trigger
   * still shows the label alone, so this is for disambiguating options, not for
   * copy the user needs after choosing.
   */
  description?: string;
  /** When true, the option renders but cannot be selected. */
  disabled?: boolean;
}

/**
 * Props accepted by the Select component. Inherits spacing and layout helpers
 * for consistency with other inputs.
 */
export interface SelectProps<T = any> extends SpacingProps, LayoutProps {
  /** Current value when the component is controlled. */
  value?: T | null;
  /** Initial value when the component manages its own state. */
  defaultValue?: T | null;
  /** Callback fired whenever the selection changes. */
  onChange?: (value: T | null, option?: SelectOption<T> | null) => void;
  /** Collection of options available to choose from. */
  options: SelectOption<T>[];
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Size token controlling trigger height and typography. */
  size?: SizeValue;
  /** Corner radius token applied to the trigger and dropdown. */
  radius?: any;
  /** Disables the control when set to true. */
  disabled?: boolean;
  /** Optional label rendered above the trigger. */
  label?: string;
  /** Optional short descriptive text shown directly under the label (above the field). */
  description?: string;
  /** Helper copy displayed beneath the control. */
  helperText?: string;
  /** Error message shown beneath the control in error state. */
  error?: string;
  /** Enables client-side filtering of options. */
  searchable?: boolean;
  /** Custom renderer for an individual option row. */
  renderOption?: (opt: SelectOption<T>, active: boolean, selected: boolean) => React.ReactNode;
  /** Stretches the trigger to occupy the full width of its container. */
  fullWidth?: boolean;
  /** Maximum height the dropdown may reach before it scrolls. */
  maxH?: number;
  /** Whether the dropdown should close immediately after selection. */
  closeOnSelect?: boolean;
  /** Allows the user to clear the current selection. */
  clearable?: boolean;
  /** Accessible label announced for the clear button when present. */
  clearButtonLabel?: string;
  /** Handler invoked after the selection is cleared. */
  onClear?: () => void;
  /** Controls whether the trigger regains focus after selecting an option. */
  refocusAfterSelect?: boolean;
  /** Whether dropdown positioning should avoid the on-screen keyboard. */
  keyboardAvoidance?: boolean;
  /** Override props applied to the label `<Text>` */
  labelProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the description `<Text>` */
  descriptionProps?: Omit<TextProps, 'children'>;
  /** Visual variant of the trigger shell — `'default' | 'filled' | 'outline' | 'unstyled'`. Mirrors `<Input variant>`. */
  variant?: InputVariant;
}
