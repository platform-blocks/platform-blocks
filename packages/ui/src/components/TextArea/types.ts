import type { TextInputProps as RNTextInputProps } from 'react-native';
import type { SizeValue } from '../../core/theme/types';
import type { TextFieldBaseProps } from '../_internal/Field/fieldProps';
import type { ExtendedTextInputProps } from '../Input/types';

export interface TextAreaProps extends Omit<TextFieldBaseProps, 'onEnter' | 'debounceMs'> {
  /** Id of the TextInput; label/error ids derive from it. Generated when omitted. */
  id?: string;

  /** Number of visible text rows (default 3). */
  rows?: number;

  /** Minimum number of rows while `autoResize` is on. */
  minRows?: number;

  /** Maximum number of rows while `autoResize` is on (then it scrolls). */
  maxRows?: number;

  /** Grow and shrink with the content, between `minRows` and `maxRows`. */
  autoResize?: boolean;

  /** Character limit */
  maxLength?: number;

  /** Show a `count/maxLength` counter under the field (needs `maxLength`). */
  showCharCounter?: boolean;

  /** Fixed height of the text box in px (overrides `rows`). Sizes the box, not the root. */
  h?: number;

  /** Whether the user may resize the field (web only; CSS `resize`). Default `'none'`. */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';

  /** Additional TextInput props */
  textInputProps?: ExtendedTextInputProps;

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

  /** Passthrough to the TextInput. Prefer `readOnly`; `editable={false}` behaves the same. */
  editable?: boolean;

  /** Whether the text scrolls inside the field (defaults to `!autoResize`). */
  scrollEnabled?: boolean;
}

/** @deprecated Internal style inputs of the old TextArea style factory; kept for type compatibility. */
export interface TextAreaStyleProps {
  size: SizeValue;
  focused?: boolean;
  disabled?: boolean;
  error?: boolean;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  h?: number;
}
