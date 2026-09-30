import type React from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { ColorValue } from '../../core/theme/types';

/** Easing of the needle animation. Unknown strings fall back to `'ease-out'`. */
export type GaugeEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface GaugeRange {
  /** Starting value for the range */
  from: number;
  /** Ending value for the range */
  to: number;
  /** Color for this range */
  color: string;
  /**
   * Name of the band (`'Normal'`, `'Danger'`). While the value falls inside the
   * band, the name is appended to the gauge's spoken value text.
   */
  label?: string;
}

export interface GaugeTicks {
  /** Number of major ticks */
  major?: number;
  /** Number of minor ticks */
  minor?: number;
  /** Custom major tick positions */
  majorPositions?: number[];
  /** Custom minor tick positions */
  minorPositions?: number[];
  /** Major tick length */
  majorLength?: number;
  /** Minor tick length */
  minorLength?: number;
  /** Tick color */
  color?: string;
  /** Tick width (stroke thickness). Defaults to 2 for major ticks and 1 for minor ticks. */
  width?: number;
}

export interface GaugeLabels {
  /** Whether to show labels */
  show?: boolean;
  /** Custom label positions */
  positions?: number[];
  /** Label formatter function. Also formats the gauge's spoken value. */
  formatter?: (value: number) => string;
  /** Label color */
  color?: string;
  /** Label font size */
  fontSize?: number;
  /** Label offset from gauge edge */
  offset?: number;
}

export type GaugeNeedleShape = 'line' | 'arrow' | 'triangle';

export interface GaugeNeedle {
  /** Needle color. Defaults to the gauge `color`. */
  color?: string;
  /** Needle width/thickness */
  width?: number;
  /** Needle length (0-1, percentage of radius) */
  length?: number;
  /** Needle shape */
  shape?: GaugeNeedleShape;
  /** Whether to show center dot */
  showCenter?: boolean;
  /** Center dot color */
  centerColor?: string;
  /** Center dot size */
  centerSize?: number;
}

export interface GaugeProps extends BaseProps<ViewStyle> {
  /** Current value */
  value: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;

  /** Gauge size in px (non-numeric values fall back to 200). */
  size?: number | string;
  /** Track thickness */
  thickness?: number;

  /** Start angle in degrees (0° = top) */
  startAngle?: number;
  /** End angle in degrees */
  endAngle?: number;
  /** Rotation offset in degrees (rotates entire gauge) */
  rotationOffset?: number;

  /** Accent color of the needle and center dot: palette token, `'primary.6'`, or any CSS color. */
  color?: ColorValue | string;
  /** Track color. Defaults to the theme's `backgrounds.borderStrong`. */
  trackColor?: string;

  /** Color ranges */
  ranges?: GaugeRange[];

  /** Tick configuration */
  ticks?: GaugeTicks;

  /** Label configuration */
  labels?: GaugeLabels;

  /** Needle configuration */
  needle?: GaugeNeedle;

  /** Needle animation duration in ms. `0` (and reduced motion) moves the needle instantly. */
  animationDuration?: number;
  /** Needle animation easing. */
  animationEasing?: GaugeEasing | (string & {});

  /** Dims the gauge. */
  disabled?: boolean;

  /** Accessible name of the gauge. */
  'aria-label'?: string;

  /** Children for compound component pattern */
  children?: React.ReactNode;
}

// Compound component props
export interface GaugeTrackProps extends BaseProps<ViewStyle> {
  /** Track color. Defaults to the gauge's `backgroundColor`, else `backgrounds.borderStrong`. */
  color?: string;
  /** Track thickness */
  thickness?: number;
  /** Track opacity */
  opacity?: number;
}

export interface GaugeRangeProps extends BaseProps<ViewStyle> {
  /** Range start value */
  from: number;
  /** Range end value */
  to: number;
  /** Range color */
  color: string;
  /** Range thickness (inherits from parent if not specified) */
  thickness?: number;
}

export interface GaugeTicksProps extends BaseProps<ViewStyle> {
  /** Tick configuration */
  config?: GaugeTicks;
  /** Major tick count */
  major?: number;
  /** Minor tick count */
  minor?: number;
  /** Custom positions */
  positions?: number[];
  /** Tick length */
  length?: number;
  /** Tick color */
  color?: string;
  /** Tick width. Defaults to 2 for major ticks and 1 for minor ticks. */
  width?: number;
  /** Tick type */
  type?: 'major' | 'minor';
}

export interface GaugeLabelsProps extends BaseProps<ViewStyle> {
  /** Labels configuration */
  config?: GaugeLabels;
  /** Custom positions */
  positions?: number[];
  /** Label formatter */
  formatter?: (value: number) => string;
  /** Label color */
  color?: string;
  /** Font size in px. Defaults to the theme's `sm` font size. */
  fontSize?: number;
  /** Offset from edge */
  offset?: number;
  /** Style applied to every label text. */
  labelStyle?: TextStyle;
}

export interface GaugeNeedleProps extends BaseProps<ViewStyle> {
  /** Needle value (angle will be calculated) */
  value?: number;
  /** Direct angle override */
  angle?: number;
  /** Needle configuration */
  config?: GaugeNeedle;
  /** Needle color */
  color?: string;
  /** Needle width */
  width?: number;
  /** Needle length */
  length?: number;
  /** Needle shape */
  shape?: GaugeNeedleShape;
  /** Animation duration */
  animationDuration?: number;
}

export interface GaugeCenterProps extends BaseProps<ViewStyle> {
  /** Center dot color */
  color?: string;
  /** Center dot size */
  size?: number;
  /** Whether to show center */
  show?: boolean;
  /** Custom center content */
  children?: React.ReactNode;
}

// Context for passing gauge configuration to compound components
export interface GaugeContextValue {
  value: number;
  min: number;
  max: number;
  size: number;
  thickness: number;
  startAngle: number; // Rotation-adjusted
  endAngle: number;   // Rotation-adjusted
  rotationOffset: number;
  center: { x: number; y: number };
  radius: number;
  innerRadius: number;
  disabled: boolean;
  /** Needle animation duration (already 0 under reduced motion). */
  animationDuration: number;
  animationEasing: string;
  /** Resolved accent color (needle, center dot). */
  color: string;
  /** Track color from the gauge's `backgroundColor` prop, if any. */
  trackColor?: string;
}

export interface GaugeStyleProps {
  size: number;
  disabled: boolean;
  thickness: number;
}
