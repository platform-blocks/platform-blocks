import React from 'react';
import { GestureResponderEvent } from 'react-native';

// Local lightweight spacing props (avoid importing from ui package)
export interface SpacingProps {
  /** Margin applied to all sides */
  m?: number;
  /** Margin applied to the top side */
  mt?: number;
  /** Margin applied to the right side */
  mr?: number;
  /** Margin applied to the bottom side */
  mb?: number;
  /** Margin applied to the left side */
  ml?: number;
  /** Horizontal margin applied to left and right sides */
  mx?: number;
  /** Vertical margin applied to top and bottom sides */
  my?: number;
  /** Padding applied to all sides */
  p?: number;
  /** Padding applied to the top side */
  pt?: number;
  /** Padding applied to the right side */
  pr?: number;
  /** Padding applied to the bottom side */
  pb?: number;
  /** Padding applied to the left side */
  pl?: number;
  /** Horizontal padding applied to left and right sides */
  px?: number;
  /** Vertical padding applied to top and bottom sides */
  py?: number;
}

// Base interfaces for all charts
export interface BaseChartProps extends SpacingProps {
  /** Chart width */
  width?: number;
  /** Chart height */
  height?: number;
  /** Chart test ID for testing */
  testID?: string;
  /** Additional styles */
  style?: any;
  /** Accessibility label surfaced to assistive tech */
  accessibilityLabel?: string;
  /** Accessibility hint describing chart interaction */
  accessibilityHint?: string;
  /** Accessibility role override */
  accessibilityRole?: string;
  /** Whether the chart container is accessible */
  accessible?: boolean;
  /** Platform specific accessibility importance */
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  /** Animation duration in ms */
  animationDuration?: number;
  /** Animation easing function */
  animationEasing?: string;
  /** Whether chart is disabled */
  disabled?: boolean;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** If false, chart expects a parent interaction provider (shared context). */
  useOwnInteractionProvider?: boolean;
  /** Force suppress or show internal popover (auto suppressed when useOwnInteractionProvider=false if undefined). */
  suppressPopover?: boolean;
}

// Data point interfaces
export interface ChartDataPoint {
  /** Unique identifier for the data point */
  id?: string | number;
  /** X-axis value */
  x: number;
  /** Y-axis value */
  y: number;
  /** Optional label */
  label?: string;
  /** Optional color override */
  color?: string;
  /** Optional size override */
  size?: number;
  /** Custom data for interactions */
  data?: any;
}

// Interaction event interfaces
export interface ChartInteractionEvent<TData = ChartDataPoint> {
  /** Original touch/mouse event */
  nativeEvent: GestureResponderEvent;
  /** Chart coordinates (0-1 normalized) */
  chartX: number;
  /** Chart coordinates (0-1 normalized) along the Y axis */
  chartY: number;
  /** Data coordinate along the X axis */
  dataX?: number;
  /** Data coordinate along the Y axis */
  dataY?: number;
  /** Closest data point (if any) */
  dataPoint?: TData;
  /** Distance to closest data point */
  distance?: number;
}

export interface ChartInteractionCallbacks<TData = ChartDataPoint> {
  /** Called when chart is tapped/clicked */
  onPress?: (event: ChartInteractionEvent<TData>) => void;
  /** Called when data point is selected */
  onDataPointPress?: (dataPoint: TData, event: ChartInteractionEvent<TData>) => void;
}

// Axis configuration
export interface ChartAxis {
  /** Show axis line */
  show?: boolean;
  /** Axis color */
  color?: string;
  /** Axis thickness */
  thickness?: number;
  /** Show tick marks */
  showTicks?: boolean;
  /** Tick positions (auto-calculated if not provided) */
  ticks?: number[];
  /** Tick color */
  tickColor?: string;
  /** Tick length */
  tickLength?: number;
  /** Show labels */
  showLabels?: boolean;
  /** Label formatter */
  labelFormatter?: (value: number) => string;
  /** Label color */
  labelColor?: string;
  /** Label font size */
  labelFontSize?: number;
  /** Axis title */
  title?: string;
  /** Title color */
  titleColor?: string;
  /** Title font size */
  titleFontSize?: number;
}

// Grid configuration
export interface ChartGrid {
  /** Show grid */
  show?: boolean;
  /** Grid color */
  color?: string;
  /** Grid line thickness */
  thickness?: number;
  /** Grid line style */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Show major grid lines */
  showMajor?: boolean;
  /** Show minor grid lines */
  showMinor?: boolean;
  /** Major grid positions */
  majorLines?: number[];
  /** Minor grid positions */
  minorLines?: number[];
}

// Legend configuration
export interface ChartLegendItem {
  /** Label displayed for the legend entry */
  label: string;
  /** Color associated with the legend entry */
  color: string;
  /** Whether the legend entry is currently visible */
  visible?: boolean;
  /** Additional metadata associated with the legend entry */
  [key: string]: any;
}

export interface ChartLegend {
  /** Show legend */
  show?: boolean;
  /** Legend position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Legend alignment */
  align?: 'start' | 'center' | 'end';
  /** Legend items (auto-generated if not provided) */
  items?: ChartLegendItem[];
  /** Legend item color */
  textColor?: string;
  /** Legend item font size */
  fontSize?: number;
}

// Tooltip configuration
export interface ChartTooltip<TData = ChartDataPoint> {
  /** Show tooltip on hover/press */
  show?: boolean;
  /** Tooltip formatter */
  formatter?: (dataPoint: TData) => string | React.ReactNode;
  /** Tooltip background color */
  backgroundColor?: string;
  /** Tooltip text color */
  textColor?: string;
  /** Tooltip font size */
  fontSize?: number;
  /** Tooltip border radius */
  borderRadius?: number;
  /** Tooltip padding */
  padding?: number;
}

// Animation configuration
export interface ChartAnimation {
  /** Animation duration */
  duration?: number;
  /** Animation delay */
  delay?: number;
  /** Animation easing */
  easing?: string;
  /** Animation type */
  type?: 'fade' | 'scale' | 'slide' | 'draw' | 'drawOn' | 'spiral' | 'bounce' | 'elastic' | 'wave';
  /** Stagger animation for multiple elements */
  stagger?: number;
}

// Generic annotation / marker system
export type ChartAnnotationShape = 'vertical-line' | 'horizontal-line' | 'point' | 'range' | 'text' | 'box';

export interface ChartAnnotation {
  /** Unique identifier for the annotation */
  id: string | number;
  /** Visual shape used to render the annotation */
  shape: ChartAnnotationShape;
  /** X coordinate for point or vertical-line annotations */
  x?: number;
  /** Y coordinate for point or horizontal-line annotations */
  y?: number;
  /** Starting x coordinate for range or box annotations */
  x1?: number;
  /** Ending x coordinate for range or box annotations */
  x2?: number;
  /** Starting y coordinate for range or box annotations */
  y1?: number;
  /** Ending y coordinate for range or box annotations */
  y2?: number;
  /** Label displayed near the annotation */
  label?: string;
  /** Stroke or outline color used for the annotation */
  color?: string;
  /** Fill color used for the annotation */
  backgroundColor?: string;
  /** Overall opacity of the annotation */
  opacity?: number;
  /** Stroke width for line-based annotations */
  lineWidth?: number;
  /** Dashed stroke pattern for the annotation */
  dashArray?: number[];
  /** Font size for any annotation text */
  fontSize?: number;
  /** Text color for the annotation label */
  textColor?: string;
  /** Arbitrary additional data associated with the annotation */
  data?: any;
}
