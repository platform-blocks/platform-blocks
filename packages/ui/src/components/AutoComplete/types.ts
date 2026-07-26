import React from 'react';
import { TextInputProps, TextInputProps as RNTextInputProps, ViewProps, ViewStyle, StyleProp } from 'react-native';
import { SpacingProps, LayoutProps } from '../../core/utils';
import type { SizeValue } from '../../core/theme/types';
import type { RadiusValue } from '../../core/theme/radius';
import type { ChipProps } from '../Chip/types';
import type { TextProps } from '../Text';

export interface AutoCompleteOption {
  label: string;
  value: string;
  group?: string;
  disabled?: boolean;
  data?: any; // Additional data for the option
}

export interface AutoCompleteProps extends SpacingProps, LayoutProps {
  /** Input label */
  label?: string;
  
  /** Description text below the input */
  description?: string;

  /** Helper text displayed below the field when no error is present */
  helperText?: string;
  
  /** Whether the field is required */
  required?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Input value */
  value?: string;
  
  /** Change handler */
  onChangeText?: (text: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Whether the input is disabled */
  disabled?: boolean;

  /** Controls input size (affects padding and height) */
  size?: SizeValue;

  /** Controls border radius; accepts size tokens or numeric value */
  radius?: RadiusValue;

  /** Show built-in clear button when there is text */
  clearable?: boolean;

  /** Accessible label for the clear button */
  clearButtonLabel?: string;

  /** Callback when the clear button is pressed */
  onClear?: () => void;
  
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  
  /** Data source for suggestions */
  data?: AutoCompleteOption[];
  
  /** Async data fetcher */
  onSearch?: (query: string) => Promise<AutoCompleteOption[]>;
  
  /** Minimum characters to trigger search */
  minSearchLength?: number;
  
  /** Search debounce delay */
  searchDelay?: number;
  
  /** Custom item renderer */
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
  
  /** Whether to allow custom values */
  allowCustomValue?: boolean;
  
  /** Maximum number of suggestions to display */
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
   * Defaults to a primary-ramp shade chosen for the active color scheme.
   */
  highlightColor?: string;

  /**
   * Background color painted behind the matched substring
   * (default: transparent — the match is distinguished by color and weight).
   */
  highlightBackgroundColor?: string;

  /** Custom styles for suggestions container */
  suggestionsStyle?: any;
  
  /** Custom styles for suggestion items */
  suggestionItemStyle?: any;
  
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
  
  /** Whether to allow free-form input (can add custom values) */
  freeSolo?: boolean;
  
  /** What to display in input after selection - 'label' or 'value' */
  displayProperty?: 'label' | 'value';
  
  /** Whether to render suggestions in a modal for guaranteed top layering */
  useModal?: boolean;

  /** Whether to render suggestions in a portal for proper z-index handling (default: true) */
  usePortal?: boolean;

  /** Explicit width for the input container (overrides layout width) */
  inputWidth?: number | string;

  /** Minimum width (particularly helpful on Android where intrinsic shrink can occur) */
  minWidth?: number;
  
  /** Additional TextInput props */
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

  // --- Native TextInput passthrough props ---

  /** Text auto-capitalization behavior */
  autoCapitalize?: RNTextInputProps['autoCapitalize'];

  /** Whether to enable auto-correct */
  autoCorrect?: boolean;

  /** Whether to auto-focus on mount */
  autoFocus?: boolean;

  /** Return key type for soft keyboard */
  returnKeyType?: RNTextInputProps['returnKeyType'];

  /** Whether to blur on submit */
  blurOnSubmit?: boolean;

  /** Select all text on focus */
  selectTextOnFocus?: boolean;

  /** iOS text content type for autofill */
  textContentType?: RNTextInputProps['textContentType'];

  /** Text alignment */
  textAlign?: RNTextInputProps['textAlign'];

  /** Whether spell check is enabled */
  spellCheck?: boolean;

  /** Input mode (modern alternative to keyboardType) */
  inputMode?: RNTextInputProps['inputMode'];

  /** Enter key hint */
  enterKeyHint?: RNTextInputProps['enterKeyHint'];

  /** Color of the text selection handles and highlight */
  selectionColor?: string;

  /** Whether to show the soft keyboard on focus */
  showSoftInputOnFocus?: boolean;

  /** Whether the field is editable */
  editable?: boolean;

  /** Hide the blinking text caret (useful for select-like, non-editable fields) */
  caretHidden?: boolean;

  // Enhanced positioning options
  /** Placement preference for the suggestions dropdown (default: 'bottom-start') */
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  
  /** Enable flipping to opposite side when dropdown would go off-screen (default: true) */
  flip?: boolean;
  
  /** Enable shifting within bounds when dropdown would go off-screen (default: true) */
  shift?: boolean;
  
  /** Distance from viewport edges in pixels (default: 12) */
  boundary?: number;
  
  /** Enable automatic repositioning on scroll/resize (default: true) */
  autoReposition?: boolean;

  /** Override props applied to the field label `<Text>`. */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the field description `<Text>`. */
  descriptionProps?: Omit<TextProps, 'children'>;

  /** Color of the placeholder text (defaults to `theme.text.muted`). */
  placeholderTextColor?: string;

  /** View props applied to the wrapper around startSection (chip area, etc.). */
  startSectionProps?: Omit<ViewProps, 'children'>;

  /** View props applied to the wrapper around endSection (clear button area). */
  endSectionProps?: Omit<ViewProps, 'children'>;
}
