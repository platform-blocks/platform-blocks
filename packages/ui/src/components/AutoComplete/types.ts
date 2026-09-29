import type React from 'react';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import type { FieldHandle } from '../../core/types/base';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import type { TextFieldBaseProps } from '../_internal/Field/fieldProps';
import type { ChipProps } from '../Chip/types';
import type { TextProps } from '../Text';

export interface AutoCompleteOption {
  label: string;
  value: string;
  group?: string;
  disabled?: boolean;
  /** Additional data for the option (free-form; read it back in `renderItem` / `onSelect`). */
  data?: unknown;
}

/** Imperative handle: focus / blur the text input, clear the query (and selection). */
export type AutoCompleteHandle = FieldHandle;

/** Native TextInput props AutoComplete forwards to its input. */
type ForwardedTextInputProps = Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'autoFocus'
  | 'returnKeyType'
  | 'blurOnSubmit'
  | 'selectTextOnFocus'
  | 'textContentType'
  | 'textAlign'
  | 'spellCheck'
  | 'inputMode'
  | 'enterKeyHint'
  | 'selectionColor'
  | 'showSoftInputOnFocus'
  | 'editable'
  | 'caretHidden'
>;

export interface AutoCompleteProps extends Omit<TextFieldBaseProps, 'debounceMs'>, ForwardedTextInputProps {
  /**
   * Test identifier, forwarded to the underlying text input (the field's
   * focusable element); the root gets `${testID}-root`.
   */
  testID?: string;

  /** Data source for suggestions */
  data?: AutoCompleteOption[];

  /** Async data fetcher */
  onSearch?: (query: string) => Promise<AutoCompleteOption[]>;

  /** Minimum characters to trigger search */
  minSearchLength?: number;

  /** Debounce delay for `onSearch`, in ms (local `data` filters immediately). */
  searchDelay?: number;

  /** Custom item renderer (the row stays an accessible option). */
  renderItem?: (
    item: AutoCompleteOption,
    index: number,
    options: {
      query: string;
      onSelect: (item: AutoCompleteOption) => void;
      isHighlighted?: boolean;
      isSelected?: boolean;
    }
  ) => React.ReactNode;

  /** Selection handler */
  onSelect?: (item: AutoCompleteOption) => void;

  /**
   * Custom renderer for the selected option shown inside the single-select
   * input. When provided and an option is selected, the returned node is
   * overlaid on the text field while it is not focused (focusing the field
   * reveals the editable text so the query can be changed). Ignored in
   * multiSelect mode — use `renderSelectedValue` for chips there.
   */
  renderValue?: (
    item: AutoCompleteOption,
    context: {
      focused: boolean;
      clear: () => void;
    }
  ) => React.ReactNode;

  /** @deprecated Use `freeSolo`. */
  allowCustomValue?: boolean;

  /** Maximum number of suggestions to display (0 = no limit). */
  maxSuggestions?: number;

  /** Whether to show suggestions on focus (default: true) */
  showSuggestionsOnFocus?: boolean;

  /** Custom empty state component */
  renderEmptyState?: () => React.ReactNode;

  /** Custom loading state component */
  renderLoadingState?: () => React.ReactNode;

  /** Filter function for local data */
  filter?: (item: AutoCompleteOption, query: string) => boolean;

  /** Whether to highlight matching text */
  highlightMatches?: boolean;

  /**
   * Text color for the matched substring when `highlightMatches` is on.
   * Defaults to the theme's link (accent text) color.
   */
  highlightColor?: string;

  /**
   * Background color painted behind the matched substring
   * (default: transparent — the match is distinguished by color and weight).
   */
  highlightBackgroundColor?: string;

  /** Styles for the suggestions surface. */
  suggestionsStyle?: StyleProp<ViewStyle>;

  /** Styles for each suggestion row. */
  suggestionItemStyle?: StyleProp<ViewStyle>;

  /**
   * Override props for each group header `<Text>` (style, weight, size, color,
   * uppercase…). Headers use the theme's `sectionLabel` text role by default.
   */
  groupLabelProps?: Omit<TextProps, 'children'>;

  /** Enable multi-select mode */
  multiSelect?: boolean;

  /** Selected values for multi-select mode */
  selectedValues?: AutoCompleteOption[];

  /** Custom renderer for each selected value chip in multi-select mode */
  renderSelectedValue?: (
    item: AutoCompleteOption,
    index: number,
    context: {
      onRemove: () => void;
      disabled: boolean;
      isFocused: boolean;
      inputValue: string;
      source: 'input' | 'modal';
    }
  ) => React.ReactNode;

  /** Optional style override for the selected values container */
  selectedValuesContainerStyle?: StyleProp<ViewStyle>;

  /** Additional props applied to the default Chip renderer for selected values */
  selectedValueChipProps?: Partial<ChipProps>;

  /** Controls whether the input regains focus after selecting an option */
  refocusAfterSelect?: boolean;

  /** Whether to allow free-form input (Enter commits the typed text as an option) */
  freeSolo?: boolean;

  /**
   * Which field of the selected option is written into the input: its human-readable
   * `label`, or its `value`.
   * @default 'label'
   */
  displayProperty?: 'label' | 'value';

  /**
   * Present suggestions in a modal sheet (true) or an anchored dropdown
   * (false). Default: sheet on native and small screens, dropdown on desktop web.
   */
  useModal?: boolean;

  /**
   * @deprecated Anchored suggestions always render in the overlay layer now
   * (inline only when no OverlayProvider is mounted). `usePortal={true}`
   * still forces the anchored dropdown, like `useModal={false}`.
   */
  usePortal?: boolean;

  /** Additional TextInput props */
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

  /** Placement preference for the suggestions dropdown (default: 'bottom-start') */
  placement?: PlacementType;

  /** Placements to try when the preferred one doesn't fit. */
  fallbackPlacements?: PlacementType[];

  /** Gap between the field and the dropdown, px (default: 4) */
  offset?: number;

  /** Enable flipping to opposite side when dropdown would go off-screen (default: true) */
  flip?: boolean;

  /** Enable shifting within bounds when dropdown would go off-screen (default: false) */
  shift?: boolean;

  /** Distance from viewport edges in pixels (default: 12) */
  boundary?: number;

  /** Enable automatic repositioning on scroll/resize (default: true) */
  autoReposition?: boolean;
}
