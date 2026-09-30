import type { ReactElement, ReactNode } from 'react';
import type { View } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import type { PlacementType } from '../../core/utils/positioning-enhanced';

/**
 * An option as written in `data`. `label` defaults to `value`; any extra
 * fields are kept on the option and reach `renderOption` and `onChange`.
 */
export interface ComboboxPopoverItem {
  /** Value reported by `onChange` / `onOptionSubmit`; unique across `data`. */
  value: string;
  /** Text shown in the dropdown and matched by the search. @default value */
  label?: string;
  /** Rendered but not selectable, and skipped by the arrow keys. */
  disabled?: boolean;
}

/** A labelled group of options in `data`; the heading itself is not selectable. */
export interface ComboboxPopoverGroup<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> {
  /** Group heading. */
  group: string;
  /** Options of the group: strings or option objects. */
  items: ReadonlyArray<string | TItem>;
}

/** The `data` prop: strings, option objects and groups, in any mix. */
export type ComboboxPopoverData<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> = ReadonlyArray<
  string | TItem | ComboboxPopoverGroup<TItem>
>;

/** A parsed option: the `data` entry with its `label` resolved. */
export type ComboboxPopoverOption<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> = TItem & {
  label: string;
};

/** A parsed group: its heading and parsed options. */
export interface ComboboxPopoverOptionGroup<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> {
  group: string;
  items: ComboboxPopoverOption<TItem>[];
}

/** One entry of parsed data — an option, or a group of options. */
export type ComboboxPopoverParsedItem<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> =
  | ComboboxPopoverOption<TItem>
  | ComboboxPopoverOptionGroup<TItem>;

/** What a `filter` function receives. */
export interface ComboboxPopoverFilterInput<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> {
  /** All parsed options and groups, in `data` order. */
  options: ComboboxPopoverParsedItem<TItem>[];
  /** The current search text (untrimmed). */
  search: string;
  /** The `limit` prop (`Infinity` when unset). The result is also capped to it afterwards. */
  limit: number;
}

/** Filters (and may sort) the options for the current search. */
export type ComboboxPopoverFilter<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> = (
  input: ComboboxPopoverFilterInput<TItem>
) => ComboboxPopoverParsedItem<TItem>[];

/** What `renderOption` receives. */
export interface ComboboxPopoverRenderOptionInput<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> {
  option: ComboboxPopoverOption<TItem>;
  /** Whether the option is selected. */
  checked: boolean;
}

/** Where the check mark of a selected option sits, relative to its label. */
export type ComboboxPopoverCheckIconPosition = 'start' | 'end';

interface ComboboxPopoverSharedProps<TItem extends ComboboxPopoverItem> extends BaseProps {
  /** Content holding exactly one `ComboboxPopover.Target`. */
  children: ReactNode;
  /** Options: strings, `{ value, label?, disabled? }` objects (extra fields allowed) or `{ group, items }` groups. */
  data: ComboboxPopoverData<TItem>;
  /** Adds a search input at the top of the dropdown that filters the options. */
  searchable?: boolean;
  /** Controlled search text. */
  searchValue?: string;
  /** Initial search text when uncontrolled. */
  defaultSearchValue?: string;
  /** Called with the new search text (typing, and `''` when the dropdown closes). */
  onSearchChange?: (search: string) => void;
  /** Placeholder and accessible name of the search input. @default 'Search…' */
  searchPlaceholder?: string;
  /**
   * Custom filter / sort, applied while `searchable`. Receives parsed options
   * and groups; the default keeps options whose label contains the search text
   * (case-insensitive).
   */
  filter?: ComboboxPopoverFilter<TItem>;
  /** Maximum number of options shown at once, applied while `searchable`. */
  limit?: number;
  /**
   * Shown when no option matches (or `data` is empty). Without it, a dropdown
   * with nothing to show doesn't open.
   */
  nothingFoundMessage?: ReactNode;
  /** Show a check mark on selected options. @default true */
  withCheckIcon?: boolean;
  /** Side of the label the check mark sits on. @default 'start' */
  checkIconPosition?: ComboboxPopoverCheckIconPosition;
  /** Reserve the check mark's slot on every option, so unchecked labels line up with checked ones. @default false */
  withAlignedLabels?: boolean;
  /** Replaces an option's content (the row stays an accessible, selectable option named by its label). */
  renderOption?: (input: ComboboxPopoverRenderOptionInput<TItem>) => ReactNode;
  /** Maximum height of the option list before it scrolls, px. @default 260 */
  maxDropdownHeight?: number;
  /** Highlight the first option when the dropdown opens, instead of the selected one. @default false */
  selectFirstOptionOnDropdownOpen?: boolean;
  /** Called with an option's value when it is chosen (press, Enter or Space), before `onChange`. */
  onOptionSubmit?: (value: string) => void;
  /** Controlled open state of the dropdown. */
  dropdownOpened?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultDropdownOpened?: boolean;
  /** Called when the dropdown asks to open (target press or key). */
  onDropdownOpen?: () => void;
  /** Called when the dropdown asks to close (selection, Escape, outside press, Tab). */
  onDropdownClose?: () => void;
  /** Placement relative to the target, written for LTR (mirrored in RTL). @default 'bottom-start' */
  position?: PlacementType;
  /** Gap between target and dropdown, px. @default 6 */
  offset?: number;
  /** Dropdown width: a number, or `'target'` — at least as wide as the target. @default 'target' */
  dropdownWidth?: number | 'target';
  /**
   * 'fixed' (web default): viewport-fixed; 'absolute'; 'portal' (native
   * default): rendered in an RN Modal at the app root. Phones use a sheet instead.
   */
  strategy?: 'absolute' | 'fixed' | 'portal';
  /** Size of the option rows and search input. @default 'sm' */
  size?: SizeValue;
  /** Disables the target; the dropdown never opens. @default false */
  disabled?: boolean;
  /** Accessible name of the option list (and of the phone sheet). Defaults to the target labelling it (web). */
  'aria-label'?: string;
}

/** Single selection: `value` is a string or `null`. */
export interface ComboboxPopoverSingleProps<TItem extends ComboboxPopoverItem = ComboboxPopoverItem>
  extends ComboboxPopoverSharedProps<TItem> {
  /** Allow several values. */
  multiple?: false;
  /** Controlled value. `null` = nothing selected. */
  value?: string | null;
  /** Initial value when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the new value and its option (`null, null` when deselected). */
  onChange?: (value: string | null, option: ComboboxPopoverOption<TItem> | null) => void;
  /** Pressing the selected option again clears the value. @default true */
  allowDeselect?: boolean;
}

/** Multiple selection: `value` is an array; the dropdown stays open while choosing. */
export interface ComboboxPopoverMultipleProps<TItem extends ComboboxPopoverItem = ComboboxPopoverItem>
  extends ComboboxPopoverSharedProps<TItem> {
  /** Allow several values. */
  multiple: true;
  /** Controlled values. */
  value?: string[];
  /** Initial values when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new values and their options, in selection order. */
  onChange?: (value: string[], options: ComboboxPopoverOption<TItem>[]) => void;
}

/** `multiple` switches the value type: `string | null`, or `string[]`. */
export type ComboboxPopoverProps<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> =
  | ComboboxPopoverSingleProps<TItem>
  | ComboboxPopoverMultipleProps<TItem>;

export interface ComboboxPopoverTargetProps {
  /**
   * One element that accepts a ref (a `Button`, `Pressable`, …). It becomes the
   * dropdown's anchor and receives `onPress`, `aria-haspopup="listbox"`,
   * `aria-expanded`, `aria-controls` and (web) the opening keys.
   */
  children: ReactElement;
}

export interface ComboboxPopoverFactoryPayload {
  props: ComboboxPopoverProps;
  ref: View;
}
