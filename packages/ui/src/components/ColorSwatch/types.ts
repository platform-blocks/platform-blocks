import type { ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';
import type { WebKeyboardEvent } from '../../core/platform/webProps';

/**
 * Role of an interactive swatch:
 * - `'button'` (default) — a standalone button; `selected` is exposed as a
 *   toggle (`aria-pressed`) when it is passed;
 * - `'radio'` — one choice in a `radiogroup` (`aria-checked`);
 * - `'option'` — one option in a `listbox` (`aria-selected`).
 */
export type ColorSwatchRole = 'button' | 'radio' | 'option';

export interface ColorSwatchProps extends BaseProps<ViewStyle> {
  /** The color value to display (hex, rgb, hsl, etc.) */
  color: string;
  /** Size of the swatch in pixels */
  size?: number;
  /** Whether the swatch is selected/active */
  selected?: boolean;
  /** Whether the swatch is disabled (not pressable, `aria-disabled`) */
  disabled?: boolean;
  /** Callback when swatch is pressed. Makes the swatch interactive. */
  onPress?: () => void;
  /** Show a border around the swatch */
  showBorder?: boolean;
  /** Custom border color (defaults to theme color) */
  borderColor?: string;
  /** Border width in pixels */
  borderWidth?: number;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Show a checkmark when selected */
  showCheckmark?: boolean;
  /** Custom checkmark color (defaults to a readable color on `color`) */
  checkmarkColor?: string;
  /**
   * Accessible name. Interactive swatches default to `Color <color>`; a
   * non-interactive swatch is only exposed (as an image) when this is set.
   */
  accessibilityLabel?: string;
  /** Extra native accessibility hint. */
  accessibilityHint?: string;
  /** Role of an interactive swatch (see {@link ColorSwatchRole}). @default 'button' */
  role?: ColorSwatchRole;
  /** Focus handler of an interactive swatch. */
  onFocus?: () => void;
  /** Blur handler of an interactive swatch. */
  onBlur?: () => void;
  /** Web only: key handler of an interactive swatch (roving focus in swatch groups). */
  onKeyDown?: (event: WebKeyboardEvent) => void;
  /** Web only: tab order of an interactive swatch (`-1` keeps it out of the Tab sequence). */
  tabIndex?: 0 | -1;
}
