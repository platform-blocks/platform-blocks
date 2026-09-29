import type React from 'react';

import type { FieldHandle } from '../../core/types/base';
import type { FieldBaseProps, TextFieldBaseProps } from '../_internal/Field/fieldProps';

/**
 * Represents a single option exposed by the Select component.
 */
// `any` default keeps untyped `SelectOption[]` usages compiling; typed usages
// (`SelectOption<string>`) and inference through `<Select options>` stay exact.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/** Imperative handle of a Select: focus / blur the trigger, clear the selection. */
export type SelectHandle = FieldHandle;

/**
 * Props accepted by the Select component. A form field: label, description,
 * error and helper text are linked to the trigger through the shared `Field`
 * frame.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SelectProps<T = any>
  extends FieldBaseProps,
    Pick<
      TextFieldBaseProps,
      'placeholderTextColor' | 'clearButtonLabel' | 'onClear' | 'startSection' | 'startSectionProps'
    > {
  /** Current value when the component is controlled. `null` = nothing selected. */
  value?: T | null;
  /** Initial value when the component manages its own state. */
  defaultValue?: T | null;
  /** Called with the new value and its option (`null, null` when cleared). */
  onChange?: (value: T | null, option: SelectOption<T> | null) => void;
  /** Collection of options available to choose from. */
  options: SelectOption<T>[];
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Adds a filter input at the top of the dropdown. */
  searchable?: boolean;
  /** Placeholder of the filter input. @default 'Search…' */
  searchPlaceholder?: string;
  /** Shown when the filter matches nothing. @default 'Nothing found' */
  nothingFoundMessage?: string;
  /** Custom renderer for an individual option row (the row stays an accessible option). */
  renderOption?: (opt: SelectOption<T>, active: boolean, selected: boolean) => React.ReactNode;
  /** Maximum height the dropdown may reach before it scrolls. @default 260 */
  maxDropdownHeight?: number;
  /** Whether the dropdown closes after a selection. @default true */
  closeOnSelect?: boolean;
  /** Allows the user to clear the current selection. */
  clearable?: boolean;
  /**
   * Whether the trigger keeps focus after a selection (web). `false` blurs it.
   * @default true
   */
  refocusAfterSelect?: boolean;
  /** Whether dropdown positioning should avoid the on-screen keyboard. @default true */
  keyboardAvoidance?: boolean;
  /** Called when the dropdown opens. */
  onDropdownOpen?: () => void;
  /** Called when the dropdown closes. */
  onDropdownClose?: () => void;
}
