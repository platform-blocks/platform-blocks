import type { BaseChartProps, ChartAxis, ChartGrid, ChartLegend } from '../../types/base';
import type { DensitySeries } from '../RidgeChart/types';

export type ViolinLayout = 'vertical' | 'horizontal';

export interface ViolinDensityPoint {
  x: number;
  y: number;
}

export interface ViolinDensitySeries extends DensitySeries {
  /** Pre-computed density points (skip internal KDE) */
  preparedDensity?: ViolinDensityPoint[];
  /** Override bandwidth for this series */
  bandwidth?: number;
  /** Adaptive bandwidth heuristic */
  adaptiveBandwidth?: 'scott' | 'silverman';
}

export interface ViolinSeriesStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  q1: number;
  q3: number;
  p10: number;
  p90: number;
}

export interface ViolinStatsMarkersConfig {
  /** Master enable toggle; inferred from child flags when omitted */
  enabled?: boolean;
  /** Render median marker */
  showMedian?: boolean;
  /** Render mean marker */
  showMean?: boolean;
  /** Render interquartile band (Q1-Q3) */
  showQuartiles?: boolean;
  /** Render whiskers spanning min/max */
  showWhiskers?: boolean;
  /** Relative width multiplier for markers (0-1, defaults to 0.85) */
  markerWidthRatio?: number;
  /** Stroke width applied to marker lines (defaults to 2) */
  strokeWidth?: number;
  /** Optional colors per statistic */
  colors?: Partial<Record<'median' | 'mean' | 'quartile' | 'whisker', string>>;
  /** Annotate markers with value labels */
  showLabels?: boolean;
  /** Additional offset in px for labels (defaults to 6) */
  labelOffset?: number;
  /** Custom formatter for marker labels */
  labelFormatter?: (params: {
    stat: 'median' | 'mean' | 'q1' | 'q3' | 'whisker-min' | 'whisker-max';
    value: number;
    series: ViolinDensitySeries;
    formattedValue: string;
  }) => string;
}

export interface ViolinValueBand {
  /** Identifier for the value band */
  id?: string;
  /** Human-readable label rendered inside the band */
  label?: string;
  /** Lower bound of the highlighted range */
  from: number;
  /** Upper bound of the highlighted range */
  to: number;
  /** Fill color applied to the band */
  color?: string;
  /** Override opacity for the band (0-1) */
  opacity?: number;
  /** Text color for the label */
  labelColor?: string;
  /** Label anchor position */
  labelPosition?: 'left' | 'right';
}

export interface ViolinSeriesInteractionEvent {
  series: ViolinDensitySeries;
  seriesIndex: number;
  stats: ViolinSeriesStats | null;
  density: ViolinDensityPoint[];
}

export interface ViolinChartProps extends BaseChartProps {
  /** Density series rendered within the violin chart */
  series: ViolinDensitySeries[];
  /** Density sample resolution */
  samples?: number;
  /** Kernel bandwidth override */
  bandwidth?: number;
  /** Relative width multiplier applied to each violin (0.2 - 1) */
  violinWidthRatio?: number;
  /** Layout orientation */
  layout?: ViolinLayout;
  /** Overlap factor between adjacent violins (0 - 0.95) */
  stackOverlap?: number;
  /** X-axis configuration */
  xAxis?: ChartAxis;
  /** Y-axis configuration */
  yAxis?: ChartAxis;
  /** Grid line configuration */
  grid?: ChartGrid;
  /** Statistic marker overlays for each violin */
  statsMarkers?: ViolinStatsMarkersConfig;
  /** Value range highlights rendered across the chart */
  valueBands?: ViolinValueBand[];
  /** Legend configuration */
  legend?: ChartLegend;
  /** Series focus callback */
  onSeriesFocus?: (event: ViolinSeriesInteractionEvent) => void;
  /** Series blur callback */
  onSeriesBlur?: (event: ViolinSeriesInteractionEvent) => void;
  /** Series press/tap callback */
  onSeriesPress?: (event: ViolinSeriesInteractionEvent) => void;
}
