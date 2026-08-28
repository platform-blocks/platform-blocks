import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { SpacingProps } from '../../core/utils';

/** Normalized position. `x` is right-positive, `y` is up-positive by default. */
export interface JoystickValue {
  x: number;
  y: number;
}

export type JoystickShape = 'circle' | 'square';

export type JoystickVariant = 'default' | 'filled' | 'outline' | 'minimal' | 'unstyled';

export interface JoystickProps extends SpacingProps {
  /** Controlled value. Both axes are normalized to −1…1. */
  value?: JoystickValue;
  /** Initial value while uncontrolled. Default `{ x: 0, y: 0 }`. */
  defaultValue?: JoystickValue;
  /** Fired for every position change, including each frame of a drag. */
  onChange?: (value: JoystickValue) => void;
  /** Fired once when the gesture ends, with the value it settled on. */
  onChangeEnd?: (value: JoystickValue) => void;
  /** Fired when a drag or keyboard interaction begins. */
  onChangeStart?: (value: JoystickValue) => void;

  /**
   * `circle` clamps the handle to a disc — a stick. `square` clamps each axis
   * on its own so the corners are reachable — an XY pad. Default `circle`.
   */
  shape?: JoystickShape;
  /**
   * Spring the handle back to the centre when released, the way a physical
   * stick does. Defaults to `true` for `circle` and `false` for `square`.
   */
  returnToCenter?: boolean;
  /** Restrict travel to a single axis. */
  lockAxis?: 'x' | 'y';
  /** Report `0` until the handle travels this far from centre (0–1). Default `0`. */
  deadZone?: number;
  /** Snap each axis to this increment. Default `0` (continuous). */
  step?: number;
  /** Increment applied by a single arrow key press. Defaults to `step` or `0.1`. */
  keyboardStep?: number;
  /** Report a positive `y` when the handle is pushed up. Default `true`. */
  invertY?: boolean;

  /** Outer size in px, or a size token. Default `'md'`. */
  size?: ComponentSizeValue;
  /** Handle diameter in px. Defaults to ~32% of `size`. */
  handleSize?: number;
  /** Visual preset. Default `'default'`. */
  variant?: JoystickVariant;
  /** Theme palette key (`'primary'`, `'grape'`, …) or any color string. */
  colorScheme?: string;
  /** Base surface color override. */
  baseColor?: string;
  /** Handle color override. */
  handleColor?: string;

  /** Draw the static centre guides. Default `true`. */
  showGuides?: boolean;
  /** Draw accent rules that track the handle on each axis — the XY-pad readout. Default `false`. */
  showCrosshair?: boolean;
  /** Render the current value under the pad. Pass a function to format it. */
  valueLabel?: boolean | ((value: JoystickValue) => string);

  /** Field label rendered above the pad. */
  label?: React.ReactNode;
  /** Ignore all input and dim the control. */
  disabled?: boolean;
  /** Ignore all input while keeping full contrast. */
  readOnly?: boolean;

  /** Spring-back / keyboard transition duration in ms. Default `220`. */
  transitionDuration?: number;

  /** Root style. */
  style?: StyleProp<ViewStyle>;
  /** Style for the pad surface. */
  baseStyle?: StyleProp<ViewStyle>;
  /** Style for the handle. */
  handleStyle?: StyleProp<ViewStyle>;
  /** Style for the value label text. */
  valueLabelStyle?: StyleProp<TextStyle>;

  accessibilityLabel?: string;
  testID?: string;
}
