import type { ReactNode } from 'react';
import type { BaseChartProps, ChartAxis, ChartGrid } from '../../types/base';

export interface RidgeSeriesStats {
  mean?: number;
  median?: number;
  p90?: number;
}

export interface RidgeTooltipContext {
  value: number;
  /** Normalized (0-1) density height */
  density: number;
  /** Estimated probability mass for this sample */
  probability: number;
  /** Raw probability density function value */
  pdf: number;
  index: number;
  seriesIndex: number;
  series: {
    id?: string | number;
    name?: string;
    color?: string;
    unit?: string;
    stats?: RidgeSeriesStats | null;
  };
}

export interface RidgeStatsMarkersConfig {
  /** Master enable toggle; defaults to false unless show flags set */
  enabled?: boolean;
  /** Show mean marker (defaults to true when enabled) */
  showMean?: boolean;
  /** Show median marker (defaults to true when enabled) */
  showMedian?: boolean;
  /** Show p90 marker (defaults to false) */
  showP90?: boolean;
  /** Marker line height in px (auto if omitted) */
  markerHeight?: number;
  /** Marker stroke width (defaults to 2) */
  strokeWidth?: number;
  /** Custom colors per statistic */
  colors?: Partial<Record<'mean' | 'median' | 'p90', string>>;
  /** Render value labels near markers */
  showLabels?: boolean;
  /** Offset for labels above marker tip (defaults to 6) */
  labelOffset?: number;
  /** Optional formatter for marker label */
  labelFormatter?: (params: { stat: 'mean' | 'median' | 'p90'; value: number; formattedValue: string; series: DensitySeries }) => string;
}

export interface DensitySeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Source values used to compute the density */
  values: number[];
  /** Base color applied to the density curve */
  color?: string;
  /** Whether the series is visible */
  visible?: boolean;
  /** Opacity applied to the filled area */
  fillOpacity?: number;
  /** Stroke color for the ridge outline */
  strokeColor?: string;
  /** Stroke width for the ridge outline */
  strokeWidth?: number;
  /** Unit label appended to tooltip values */
  unit?: string;
  /** Custom formatter for value labels */
  valueFormatter?: (value: number) => string;
  /** Custom tooltip content for each value */
  tooltipFormatter?: (context: RidgeTooltipContext) => ReactNode;
}

export interface RidgeChartProps extends BaseChartProps {
  /** Density series rendered in the ridge chart */
  series: DensitySeries[];
  /** Density sample resolution */
  samples?: number;
  /** Kernel bandwidth override */
  bandwidth?: number;
  /** Fractional padding between ridge bands (0 - 0.8) */
  bandPadding?: number;
  /** Amplitude scaling applied to each ridge (0.1 - 1) */
  amplitudeScale?: number;
  /** X-axis configuration */
  xAxis?: ChartAxis;
  /** Y-axis configuration */
  yAxis?: ChartAxis;
  /** Grid line configuration */
  grid?: ChartGrid;
  /** Optional statistic marker configuration */
  statsMarkers?: RidgeStatsMarkersConfig;
}
