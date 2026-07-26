import type { LineChartProps, LineChartSeries } from '../LineChart/types';

export interface SeriesPoint {
  /** X-axis value */
  x: number;
  /** Y-axis value */
  y: number;
}

export interface StackedAreaSeries {
  /** Series name */
  name: string;
  /** Series color */
  color: string;
  /** Array of data points */
  data: SeriesPoint[];
  /** Optional visibility toggle */
  visible?: boolean;
}

/**
 * Props for {@link StackedAreaChart}. Extends {@link LineChartProps} (minus the
 * single-series `data`/`fill`/`smooth` fields it replaces) so it inherits the
 * axes, grid, legend, tooltip, crosshair, scale-type and interaction props, plus
 * the stacking-specific options below. This is the single source of truth — the
 * component consumes this exact interface.
 */
export interface StackedAreaChartProps
  extends Omit<LineChartProps, 'data' | 'fill' | 'smooth'> {
  /** Data series to stack */
  series: LineChartSeries[];
  /** Order layers are stacked in */
  stackOrder?: 'normal' | 'reverse';
  /** Smooth (curved) area tops */
  smooth?: boolean;
  /** Base opacity for the stacked layers */
  opacity?: number;
  /** Stack values as absolute totals or normalized to 100% */
  stackMode?: 'absolute' | 'percentage';
}

export type SimpleStackedAreaChartProps = StackedAreaChartProps;
