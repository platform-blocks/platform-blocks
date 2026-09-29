import type { ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';

export interface ColorPickerProps extends BaseProps<ViewStyle> {
  /** Current color value in hex format (controlled) */
  value?: string;
  /** Initial color value for uncontrolled usage */
  defaultValue?: string;
  /** Callback fired when a swatch is selected */
  onChange?: (color: string) => void;
  /** Preset colors to choose from */
  swatches?: string[];
  /** Readable names for the swatches, keyed by color (e.g. `{ '#FF6B6B': 'Coral' }`). Defaults to the color string. */
  swatchLabels?: Record<string, string>;
  /** Size of the trigger + swatches in pixels */
  size?: number;
  /** Number of swatches per row in the popover */
  columns?: number;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Accessible name of the trigger. @default `Color <value>`, or 'Select a color' with no value */
  accessibilityLabel?: string;
}
