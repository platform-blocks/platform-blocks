import type { ReactNode } from 'react';
import type { BaseChartProps, ChartLegend, ChartTooltip } from '../../types/base';

// Radar Chart Types
export interface RadarAxisPoint {
  /** Axis key associated with the point */
  axis: string | number;
  /** Value plotted on the axis */
  value: number;
  /** Optional label displayed for the point */
  label?: string;
  /** Color override for the point */
  color?: string;
  /** Optional value override used for tooltip output */
  formattedValue?: string | number;
  /** Custom tooltip content for the point */
  tooltip?: ReactNode | ((point: RadarAxisPoint, context: { axisIndex: number; seriesIndex: number; series: RadarChartSeries }) => ReactNode);
  /** Additional metadata associated with the point */
  meta?: any;
}
export interface RadarChartSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Data points included in the series */
  data: RadarAxisPoint[];
  /** Base color applied to the series */
  color?: string;
  /** Whether the series is visible */
  visible?: boolean;
  /** Opacity applied to the filled area */
  opacity?: number;
  /** Show point markers at each axis */
  showPoints?: boolean;
  /** Size of the point markers */
  pointSize?: number;
  /** Additional metadata associated with the series */
  metadata?: any;
}
export interface RadarGridConfig {
  /** Number of concentric rings rendered */
  rings?: number;
  /** Shape used for the grid (circle or polygon) */
  shape?: 'circle' | 'polygon';
  /** Whether to render axis spokes */
  showAxes?: boolean;
  /** Placement of axis labels */
  axisLabelPlacement?: 'inside' | 'edge' | 'outside';
  /** Offset in pixels applied to axis labels */
  axisLabelOffset?: number;
  /** Custom formatter for axis labels */
  axisLabelFormatter?: (
    axis: string | number,
    context: { index: number; total: number; label?: string }
  ) => string;
  /** Optional labels for each ring */
  ringLabels?:
    | string[]
    | ((context: { index: number; ringCount: number; value: number; maxValue: number }) => string);
  /** Where to position ring labels relative to the ring */
  ringLabelPosition?: 'inside' | 'outside';
  /** Offset in pixels applied to ring labels */
  ringLabelOffset?: number;
}
export interface RadarChartProps extends BaseChartProps {
  /** Radar series to display */
  series: RadarChartSeries[];
  /** Maximum value displayed across axes */
  maxValue?: number;
  /** Grid styling configuration */
  radialGrid?: RadarGridConfig;
  /** Smooth the polygon edges; pass a number between 0 and 1 to control tension */
  smooth?: boolean | number;
  /** Fill the radar area */
  fill?: boolean;
  /** Enable radial crosshair highlights */
  enableCrosshair?: boolean;
  /** Enable multi-series tooltip aggregation */
  multiTooltip?: boolean;
  /** Follow pointer with tooltip */
  liveTooltip?: boolean;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<RadarAxisPoint>;
}
