import type React from 'react';
import type { ViewStyle, TextStyle, StyleProp } from 'react-native';
import type { BaseProps } from '../../core/types/base';

export interface RingColorStop {
  /** Threshold (0-100) that determines when the color becomes active */
  value: number;
  /** Stroke color applied once the threshold is reached */
  color: string;
}

export interface RingRenderContext {
  /** Clamped value within the provided min/max range */
  value: number;
  /** Normalized percentage (0-100) for the current value */
  percent: number;
  /** Minimum bound used for normalization */
  min: number;
  /** Maximum bound used for normalization */
  max: number;
}

export interface RingProps extends BaseProps<ViewStyle> {
  /** Current value represented by the ring */
  value: number;
  /** Lower bound for normalization. Defaults to 0. */
  min?: number;
  /** Upper bound for normalization. Defaults to 100. */
  max?: number;
  /** Diameter of the ring in pixels. Defaults to 100. */
  size?: number;
  /** Stroke thickness in pixels. Defaults to 12. */
  thickness?: number;
  /** Optional caption rendered beneath the ring */
  caption?: React.ReactNode;
  /** Main label rendered in the ring center */
  label?: React.ReactNode;
  /** Secondary label rendered below the main label */
  subLabel?: React.ReactNode;
  /** Displays the computed percentage when no label/subLabel is provided. Defaults to true. */
  showValue?: boolean;
  /** Formats the displayed value or percentage */
  valueFormatter?: (value: number, percent: number) => React.ReactNode;
  /** Track color behind the progress stroke. Defaults to the theme's `backgrounds.border`. */
  trackColor?: string;
  /** Progress stroke color or resolver */
  progressColor?: string | ((value: number, percent: number) => string);
  /** Optional color stops evaluated against the computed percent */
  colorStops?: RingColorStop[];
  /** Forces the ring into a neutral state, disabling the progress stroke */
  neutral?: boolean;
  /** Controls whether the progress stroke has rounded caps. Defaults to true. */
  roundedCaps?: boolean;
  /** Style applied to the ring wrapper */
  ringStyle?: StyleProp<ViewStyle>;
  /** Style applied to the center content container */
  contentStyle?: StyleProp<ViewStyle>;
  /** Style overrides for the main label */
  labelStyle?: StyleProp<TextStyle>;
  /** Style overrides for the secondary label */
  subLabelStyle?: StyleProp<TextStyle>;
  /** Style overrides for the caption */
  captionStyle?: StyleProp<TextStyle>;
  /** Color override for the main label */
  labelColor?: string;
  /** Color override for the secondary label */
  subLabelColor?: string;
  /** Color override for the caption */
  captionColor?: string;
  /** Custom center content. Receives value info when passed as a function */
  children?: React.ReactNode | ((context: RingRenderContext) => React.ReactNode);
  /**
   * Accessible name of the ring (a `progressbar`). Defaults to the text of
   * `caption`, else of `label`. The value is exposed as aria-value* on its own.
   */
  accessibilityLabel?: string;
}
