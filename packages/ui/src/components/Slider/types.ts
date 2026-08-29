import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { BaseInputProps } from '../Input/types';
import { ColorValue, SizeValue, PlatformBlocksTheme } from '../../core/theme/types';
import type { TextProps } from '../Text';
import type { ThemeColor } from '../../core/theme/resolveColors';


/**
 * Visual variant of the slider.
 * - `default` — standard track with subtle inactive surface and filled active range
 * - `filled` — thicker, fully opaque inactive track (iOS-style volume look)
 * - `outline` — transparent inactive track with a border; active range is colored fill
 * - `minimal` — hairline track and a smaller, flatter thumb for dense UIs/toolbars
 * - `segmented` — track is divided by ticks; active region fills whole segments
 * - `unstyled` — no track or thumb chrome; consumer styles via `trackStyle` / `thumbStyle`
 */
export type SliderVariant =
  | 'default'
  | 'filled'
  | 'outline'
  | 'minimal'
  | 'segmented'
  | 'unstyled';

export interface SliderTick {
  /** Tick value */
  value: number;
  /** Optional label for the tick */
  label?: string;
  /** Optional style for the tick */
  style?: any;
}

export interface SliderProps extends Omit<BaseInputProps, 'value' | 'onChangeText' | 'label' | 'variant'> {
  /** Slider value */
  value?: number;
  /** Uncontrolled initial value */
  defaultValue?: number;

  /** Change handler */
  onChange?: (value: number) => void;

  /** Minimum value */
  min?: number;

  /** Maximum value */
  max?: number;

  /** Step increment */
  step?: number;

  /** Slider orientation */
  orientation?: 'horizontal' | 'vertical';

  /** Track color */
  trackColor?: ColorValue;

  /** Active track color */
  activeTrackColor?: ColorValue;

  /** Thumb color */
  thumbColor?: ColorValue;

  /** Track height/width */
  trackSize?: number;

  /** Thumb size */
  thumbSize?: number;

  /**
   * Color driving the active track, thumb, and active ticks. A palette token,
   * `'primary.6'` shade syntax, or any CSS color.
   */
  color?: ThemeColor;


  /** Visual variant of the slider track + thumb. Defaults to `'default'`. */
  variant?: SliderVariant;

  /** Additional styling for the inactive track */
  trackStyle?: StyleProp<ViewStyle>;

  /** Additional styling for the active track */
  activeTrackStyle?: StyleProp<ViewStyle>;

  /** Additional styling for the thumb */
  thumbStyle?: StyleProp<ViewStyle>;

  /** Override inactive tick color */
  tickColor?: ColorValue;

  /** Override active tick color */
  activeTickColor?: ColorValue;

  /** Style applied to inactive tick marks (merged on top of color/size defaults). */
  tickStyle?: StyleProp<ViewStyle>;

  /** Style applied to active tick marks. */
  activeTickStyle?: StyleProp<ViewStyle>;

  /** Props applied to the `<Text>` rendered for each tick label (style, ff, weight, size, color). */
  tickLabelProps?: Omit<TextProps, 'children'>;

  /** Input label (above the slider) */
  label?: React.ReactNode;

  /** Value label formatter function, set to null to disable value label */
  valueLabel?: ((value: number) => string) | null;

  /** If true, value label will always be displayed */
  valueLabelAlwaysOn?: boolean;

  /** Where the value label sits relative to the thumb. For horizontal sliders: 'top' (above) or 'bottom' (below). For vertical: 'left' or 'right'. Defaults to 'top' / 'left'. */
  valueLabelPosition?: 'top' | 'bottom' | 'left' | 'right';

  /** Pixel gap between the thumb and the value label (default: 6 for top/bottom, 16 for left/right). */
  valueLabelOffset?: number;

  /** Style applied to the value label wrapper (Card/View). */
  valueLabelStyle?: StyleProp<ViewStyle>;

  /** Props applied to the value label `<Text>` (style, weight, ff, size, color). */
  valueLabelProps?: Omit<TextProps, 'children'>;

  /** When true (default) the value label is wrapped in a `<Card>`. Set to false to render only the bare `<Text>` for a flat tooltip. */
  valueLabelAsCard?: boolean;

  /** Show min/max labels */
  showMarks?: boolean;

  /** Custom ticks/marks to display on the slider */
  ticks?: SliderTick[];

  /** Slider container size (width for horizontal, height for vertical) */
  containerSize?: number;

  /** Whether to show automatic tick marks based on step */
  showTicks?: boolean;

  /** Restrict value changes to only tick positions */
  restrictToTicks?: boolean;

  /** Inverted slider (right-to-left or top-to-bottom) */
  inverted?: boolean;

  /** Precision for value display */
  precision?: number;

  /** Tooltip visibility */
  tooltip?: 'always' | 'hover' | 'never';

  /** Make slider stretch to fill parent width/height */
  fullWidth?: boolean;
}

export interface RangeSliderProps extends Omit<SliderProps, 'value' | 'onChange' | 'valueLabel' | 'defaultValue'> {
  /** Range value [min, max] */
  value?: [number, number];
  /** Uncontrolled initial range value */
  defaultValue?: [number, number];

  /** Change handler */
  onChange?: (value: [number, number]) => void;

  /** Value label formatter function for range values */
  valueLabel?: ((value: number, index: number) => string) | null;

  /** Minimum distance between thumbs */
  minRange?: number;

  /** Allow thumbs to cross */
  allowCross?: boolean;

  /** Whether thumbs should push each other when they overlap (default: true) */
  pushOnOverlap?: boolean;

  /** Labels for range values */
  rangeLabels?: [string, string];
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


// Shared UI components with orientation support
export interface SliderTrackProps {
  disabled: boolean;
  theme: any;
  size: 'sm' | 'md' | 'lg';
  orientation: 'horizontal' | 'vertical';
  activeWidth?: number;
  activeLeft?: number;
  isRange?: boolean;
  trackColor?: ColorValue;
  activeTrackColor?: ColorValue;
  trackStyle?: StyleProp<ViewStyle>;
  activeTrackStyle?: StyleProp<ViewStyle>;
  trackHeight?: number;
  thumbSize?: number;
  variant?: SliderVariant;
}

export interface SliderTicksProps {
  ticks: Array<{ value: number; position: number; isActive: boolean; label?: string }>;
  disabled: boolean;
  theme: any;
  size: 'sm' | 'md' | 'lg';
  orientation: 'horizontal' | 'vertical';
  keyPrefix?: string;
  trackHeight?: number;
  thumbSize?: number;
  activeTickColor?: ColorValue;
  tickColor?: ColorValue;
  tickStyle?: StyleProp<ViewStyle>;
  activeTickStyle?: StyleProp<ViewStyle>;
  tickLabelProps?: Omit<TextProps, 'children'>;
}

export interface SliderThumbProps {
  position: number;
  disabled: boolean;
  theme: any;
  size: 'sm' | 'md' | 'lg';
  orientation: 'horizontal' | 'vertical';
  isDragging: boolean;
  zIndex?: number;
  panHandlers?: any;
  thumbColor?: ColorValue;
  thumbStyle?: StyleProp<ViewStyle>;
  thumbSize?: number;
  variant?: SliderVariant;
}

export interface SliderLabelProps {
  label: React.ReactNode;
}

export interface SliderValueLabelProps {
  value: string | number;
  position: number;
  size: 'sm' | 'md' | 'lg';
  orientation: 'horizontal' | 'vertical';
  isCard?: boolean;
  thumbSize?: number;
  /** 'top' / 'bottom' for horizontal, 'left' / 'right' for vertical */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  containerStyle?: StyleProp<ViewStyle>;
  textProps?: Omit<TextProps, 'children'>;
}
