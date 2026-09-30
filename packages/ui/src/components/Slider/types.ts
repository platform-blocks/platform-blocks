import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { AdjustableProps } from '../../core/accessibility/useAdjustable';
import type { ThemeColor } from '../../core/theme/resolveColors';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';
import type { TextProps } from '../Text';

/**
 * Visual variant of the slider.
 * - `default` — standard track with subtle inactive surface and filled active range
 * - `filled` — thicker, fully opaque inactive track (iOS-style volume look)
 * - `outline` — transparent inactive track with a border; active range is colored fill
 * - `minimal` — hairline track and a smaller, flatter thumb for dense UIs/toolbars
 * - `segmented` — track is divided by ticks; active region fills whole segments
 * - `unstyled` — no track or thumb chrome; consumer styles via `trackStyle` / `thumbStyle`
 */
export type SliderVariant = 'default' | 'filled' | 'outline' | 'minimal' | 'segmented' | 'unstyled';

export interface SliderTick {
  /** Tick value. */
  value: number;
  /** Optional label under (or beside) the tick. */
  label?: string;
  /** Style override for this tick mark (wins over `tickStyle` / `activeTickStyle`). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Props shared by `Slider` and `RangeSlider`. Sliders render through the
 * shared `Field` frame: `label` / `description` above, `error` / `helperText`
 * below, all linked to the thumb(s).
 *
 * `style`, spacing and layout props apply to the root; `ref` and `testID` go to
 * the track (the drag surface), thumbs get `${testID}-thumb` (range:
 * `-thumb-min` / `-thumb-max`).
 */
export interface SliderBaseProps extends Omit<FieldBaseProps, 'variant' | 'keyboardFocusId' | 'radius'> {
  /** Minimum value. Default 0. */
  min?: number;
  /** Maximum value. Default 100. */
  max?: number;
  /** Step increment (arrow keys, snapping). Default 1. */
  step?: number;
  /** PageUp / PageDown distance. Default: a tenth of the range. */
  largeStep?: number;

  /** Slider orientation. Default `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Reverse the direction: the maximum sits at the start (left) of a
   * horizontal slider, or at the bottom of a vertical one.
   */
  inverted?: boolean;

  /** Inactive track color. */
  trackColor?: ThemeColor;
  /** Active track color. */
  activeTrackColor?: ThemeColor;
  /** Thumb color. */
  thumbColor?: ThemeColor;
  /** Track thickness (px). */
  trackSize?: number;
  /** Thumb diameter (px). */
  thumbSize?: number;
  /**
   * Color driving the active track, thumb, and active ticks: a palette token,
   * `'primary.6'` shade syntax, or any CSS color.
   */
  color?: ThemeColor;

  /** Visual variant of the slider track + thumb. Defaults to `'default'`. */
  variant?: SliderVariant;

  /** Additional styling for the inactive track. */
  trackStyle?: StyleProp<ViewStyle>;
  /** Additional styling for the active track. */
  activeTrackStyle?: StyleProp<ViewStyle>;
  /** Additional styling for the thumb(s). */
  thumbStyle?: StyleProp<ViewStyle>;

  /** Inactive tick color. */
  tickColor?: ThemeColor;
  /** Active tick color. */
  activeTickColor?: ThemeColor;
  /** Style applied to inactive tick marks (merged on top of color/size defaults). */
  tickStyle?: StyleProp<ViewStyle>;
  /** Style applied to active tick marks. */
  activeTickStyle?: StyleProp<ViewStyle>;
  /** Props applied to the `<Text>` rendered for each tick label (style, ff, weight, size, color). */
  tickLabelProps?: Omit<TextProps, 'children'>;

  /** Keep the value label visible even when not interacting. */
  valueLabelAlwaysOn?: boolean;
  /**
   * When the value label (the bubble over the thumb) shows: `hover` (default)
   * while hovered, dragged or keyboard-focused; `always`; or `never`.
   */
  tooltip?: 'always' | 'hover' | 'never';
  /** Where the value label sits relative to the thumb: 'top' / 'bottom' (horizontal), 'left' / 'right' (vertical). */
  valueLabelPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Pixel gap between the thumb and the value label (default: 6 for top/bottom, 16 for left/right). */
  valueLabelOffset?: number;
  /** Style applied to the value label wrapper (Card/View). */
  valueLabelStyle?: StyleProp<ViewStyle>;
  /** Props applied to the value label `<Text>` (style, fw, ff, size, c). */
  valueLabelProps?: Omit<TextProps, 'children'>;
  /** Wrap the value label in a `<Card>` (default true); false renders the bare `<Text>`. */
  valueLabelAsCard?: boolean;

  /** Label the two ends of the track with the min / max values. */
  showMarks?: boolean;
  /** Custom ticks/marks to display on the slider. */
  ticks?: SliderTick[];
  /** Show automatic tick marks at every `step`. */
  showTicks?: boolean;
  /** Restrict value changes (pointer and keyboard) to tick positions. */
  restrictToTicks?: boolean;

  /** Slider length when not `fullWidth` (width for horizontal, height for vertical). */
  containerSize?: number;
  /** Decimal places of the default value label. Default: inferred from `step`. */
  precision?: number;
  /** Stretch to fill the parent width (height when vertical). Default true. */
  fullWidth?: boolean;

  /** Base id: the field's label/description/error get `${id}-label` etc. */
  id?: string;
}

export interface SliderProps extends SliderBaseProps {
  /** Value (controlled). */
  value?: number;
  /** Initial value (uncontrolled). */
  defaultValue?: number;
  /** Called with every value change (each frame of a drag, each key press). */
  onChange?: (value: number) => void;
  /** Called once when an interaction settles: drag released, or after each key press. */
  onChangeEnd?: (value: number) => void;
  /** Value label formatter (also the spoken value text); `null` hides the label. */
  valueLabel?: ((value: number) => string) | null;
}

export interface RangeSliderProps extends SliderBaseProps {
  /** Range value `[start, end]` (controlled). */
  value?: [number, number];
  /** Initial range (uncontrolled). Default `[min, max]`. */
  defaultValue?: [number, number];
  /** Called with every change. */
  onChange?: (value: [number, number]) => void;
  /** Called once when an interaction settles: drag released, or after each key press. */
  onChangeEnd?: (value: [number, number]) => void;
  /** Value label formatter for each thumb (also the spoken value text); `null` hides the labels. */
  valueLabel?: ((value: number, index: number) => string) | null;
  /** Minimum distance kept between the thumbs. Default 0. */
  minRange?: number;
  /**
   * Let a thumb be dragged past the other (it becomes the other end of the
   * range). Default `!pushOnOverlap`.
   */
  allowCross?: boolean;
  /** Thumbs stop at each other instead of crossing (default true). `allowCross` wins when both are set. */
  pushOnOverlap?: boolean;
  /** Accessible names of the two thumbs. Default `['Minimum', 'Maximum']`. */
  rangeLabels?: [string, string];
}

/** Internal component props (SliderCore). */
export interface SliderTrackProps {
  disabled: boolean;
  theme: PlocksTheme;
  orientation: 'horizontal' | 'vertical';
  /** Length of the active segment (px). */
  activeLength?: number;
  /** Offset of the active segment from the container start (px). Default: half the thumb. */
  activeStart?: number;
  trackColor?: string;
  activeTrackColor?: string;
  trackStyle?: StyleProp<ViewStyle>;
  activeTrackStyle?: StyleProp<ViewStyle>;
  trackHeight: number;
  thumbSize: number;
  variant?: SliderVariant;
}

export interface SliderTicksProps {
  ticks: Array<SliderTick & { position: number; isActive: boolean }>;
  disabled: boolean;
  theme: PlocksTheme;
  orientation: 'horizontal' | 'vertical';
  keyPrefix?: string;
  trackHeight: number;
  thumbSize: number;
  activeTickColor?: string;
  tickColor?: string;
  tickStyle?: StyleProp<ViewStyle>;
  activeTickStyle?: StyleProp<ViewStyle>;
  tickLabelProps?: Omit<TextProps, 'children'>;
}

export interface SliderThumbProps {
  position: number;
  disabled: boolean;
  theme: PlocksTheme;
  orientation: 'horizontal' | 'vertical';
  isDragging: boolean;
  /** Draw over the sibling thumb (the one being dragged). */
  raised?: boolean;
  thumbColor?: string;
  thumbStyle?: StyleProp<ViewStyle>;
  thumbSize: number;
  variant?: SliderVariant;
  /** Adjustable props from `useAdjustable` plus the field wiring. */
  a11y?: AdjustableProps;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
}

export interface SliderValueLabelProps {
  value: string | number;
  position: number;
  orientation: 'horizontal' | 'vertical';
  isCard?: boolean;
  thumbSize: number;
  /** 'top' / 'bottom' for horizontal, 'left' / 'right' for vertical */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  containerStyle?: StyleProp<ViewStyle>;
  textProps?: Omit<TextProps, 'children'>;
}

export interface SliderStyleProps {
  error?: boolean;
  disabled?: boolean;
  focused?: boolean;
  size: SizeValue;
  orientation: 'horizontal' | 'vertical';
  containerSize: number;
  trackSize: number;
  thumbSize: number;
}
