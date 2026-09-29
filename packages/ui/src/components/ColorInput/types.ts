import type { ViewStyle, StyleProp } from 'react-native';

import type { PlacementType } from '../../core/utils/positioning-enhanced';
import type { FieldBaseProps, TextFieldBaseProps } from '../_internal/Field/fieldProps';

export interface ColorInputProps
  extends FieldBaseProps<ViewStyle>,
    Pick<
      TextFieldBaseProps,
      'placeholder' | 'placeholderTextColor' | 'clearable' | 'clearButtonLabel' | 'onClear' | 'startSection' | 'endSection'
    > {
  /** Current color value in hex format (e.g., "#ff0000") */
  value?: string;

  /** Default color value for uncontrolled usage */
  defaultValue?: string;

  /**
   * Called with the new color: a complete hex while typing, the normalized
   * `#RRGGBB` form on blur / submit / swatch selection, and `''` when cleared.
   */
  onChange?: (color: string) => void;

  /** Whether to show the color preview */
  showPreview?: boolean;

  /** Whether to show the hex input */
  showInput?: boolean;

  /** Predefined color swatches to show */
  swatches?: string[];

  /** Readable names for the swatches, keyed by color (e.g. `{ '#FF6B6B': 'Coral' }`). Defaults to the color string. */
  swatchLabels?: Record<string, string>;

  /** Whether to show the swatch dropdown (and its toggle button) */
  withSwatches?: boolean;

  // Positioning props - matching AutoComplete's positioning API
  /** Dropdown placement */
  placement?: PlacementType;

  /** Whether to flip placement when no space */
  flip?: boolean;

  /** Whether to shift position to stay in viewport */
  shift?: boolean;

  /** Minimum distance between the dropdown and the viewport edges, in pixels */
  boundary?: number;

  /** Offset from anchor element in pixels */
  offset?: number;

  /** Whether to automatically reposition on resize/scroll */
  autoReposition?: boolean;

  /** Fallback placements to try */
  fallbackPlacements?: PlacementType[];

  /** Whether dropdown should avoid the on-screen keyboard when visible */
  keyboardAvoidance?: boolean;

  /** Custom style for the preview */
  previewStyle?: StyleProp<ViewStyle>;

  /** Custom style for the input box (the bordered frame around preview, hex text and buttons) */
  inputStyle?: StyleProp<ViewStyle>;
}
