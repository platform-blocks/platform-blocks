import type { TextInputProps } from 'react-native';

import type { FieldBaseProps } from '../_internal/Field/fieldProps';

/**
 * Props for `PinInput`: one cell per character, rendered through the shared
 * `Field` frame (label / description above, error / helper text below). The
 * cells are a labelled `role="group"`; each is named "<label>, digit n of N".
 * `ref` is a `FieldHandle` (`focus()` → the first empty cell, `blur()`, `clear()`).
 */
export interface PinInputProps extends FieldBaseProps {
  /** Number of cells. Default 4. */
  length?: number;

  /** PIN value (controlled). */
  value?: string;
  /** Initial value (uncontrolled). */
  defaultValue?: string;
  /** Called with the whole PIN on every change. */
  onChange?: (pin: string) => void;
  /**
   * Called once when the PIN becomes complete (all cells filled) — not again on
   * re-renders; again only after it was incomplete in between or a digit changed.
   */
  onComplete?: (pin: string) => void;

  /** Mask the characters. */
  mask?: boolean;
  /** Character shown for a masked cell. Default `'•'`. */
  maskChar?: string;
  /** Move focus to the next cell as each character is typed. Default true. */
  manageFocus?: boolean;
  /**
   * Sequential entry (focusing a later cell jumps back to the first empty one)
   * is always enforced by default. With `enforceOrderInitialOnly`, it only
   * applies until the PIN has been complete once; after that any cell can be
   * edited directly.
   */
  enforceOrderInitialOnly?: boolean;

  /** Accepted characters. Default `'numeric'`. */
  type?: 'alphanumeric' | 'numeric';
  /** Placeholder shown in each empty cell. */
  placeholder?: string;
  /** Allow pasting a whole code into a cell. Default true. */
  allowPaste?: boolean;
  /** Offer SMS one-time-code autofill. */
  oneTimeCode?: boolean;
  /** Gap between cells (px). Default 8. */
  spacing?: number;
  /** @deprecated Use `radius`. */
  borderRadius?: number;

  /** Extra TextInput props for every cell. */
  textInputProps?: Omit<
    TextInputProps,
    'value' | 'defaultValue' | 'onChangeText' | 'onFocus' | 'onBlur' | 'style' | 'testID' | 'placeholder' | 'editable'
  >;

  // --- Native TextInput passthrough props ---

  /** Text auto-capitalization behavior. */
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Whether to enable auto-correct. */
  autoCorrect?: boolean;
  /** Focus the first cell on mount. */
  autoFocus?: boolean;
  /** Select a cell's text on focus. Default true. */
  selectTextOnFocus?: boolean;
  /** iOS text content type for autofill. */
  textContentType?: TextInputProps['textContentType'];
  /** Text alignment inside each cell. Default centered. */
  textAlign?: TextInputProps['textAlign'];
  /** Whether spell check is enabled. */
  spellCheck?: boolean;
  /** Color of the selection handles and highlight. */
  selectionColor?: string;
  /** Show the soft keyboard on focus. */
  showSoftInputOnFocus?: boolean;

  /** Base id: the cell group gets it, the label/description/error get `${id}-label` etc. */
  id?: string;
}

export interface PinInputStyleProps {
  error?: boolean;
  disabled?: boolean;
  focused?: boolean;
  size: string;
  length: number;
}
