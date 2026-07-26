import type {
  BaseChartProps,
  ChartAnimation,
  ChartAxis,
  ChartGrid,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';

export interface BarChartDataPoint {
  /** Unique identifier */
  id?: string | number;
  /** Category/label */
  category: string;
  /** Value */
  value: number;
  /** Color override */
  color?: string;
  /** Custom data for interactions */
  data?: any;
}

export interface BarChartSeries {
  /** Unique identifier for the series */
  id: string;
  /** Display name for the legend */
  name?: string;
  /** Optional base color for all data points in the series */
  color?: string;
  /** Data points belonging to this series */
  data: BarChartDataPoint[];
}

export interface BarChartValueLabelConfig {
  /** Show value labels above or inside bars */
  show?: boolean;
  /** Custom formatter for the value label */
  formatter?: (value: number, datum: BarChartDataPoint, index: number) => string;
  /** Text color */
  color?: string;
  /** Font size */
  fontSize?: number;
  /** Font weight */
  fontWeight?: string | number;
  /** Offset in pixels from the anchor position */
  offset?: number;
  /** Label position relative to the bar */
  position?: 'inside' | 'outside';
}

export interface BarChartThreshold {
  /** Threshold value rendered as a reference line */
  value: number;
  /** Optional label displayed alongside the line */
  label?: string;
  /** Line color */
  color?: string;
  /** Line thickness */
  width?: number;
  /** Dash pattern */
  style?: 'solid' | 'dashed';
  /** Offset the label from the line (px) */
  labelOffset?: number;
  /** Render the line above or below bars */
  position?: 'front' | 'back';
}

export interface BarChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<BarChartDataPoint> {
  /** Data points */
  data: BarChartDataPoint[];
  /** Optional multi-series data */
  series?: BarChartSeries[];
  /** Bar color */
  barColor?: string;
  /** Bar spacing (0-1) */
  barSpacing?: number;
  /** Bar border radius */
  barBorderRadius?: number;
  /** Orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Layout strategy for multi-series data */
  layout?: 'single' | 'grouped' | 'stacked';
  /** Stacked layout mode */
  stackMode?: 'normal' | '100%';
  /** Optional value formatter for tooltip display */
  valueFormatter?: (value: number, datum: BarChartDataPoint, index: number) => string;
  /** X-axis configuration */
  xAxis?: ChartAxis;
  /** Y-axis configuration */
  yAxis?: ChartAxis;
  /** Grid configuration */
  grid?: ChartGrid;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Allow toggling series visibility from the legend */
  legendToggleEnabled?: boolean;
  /** Reference lines overlaid on the chart */
  thresholds?: BarChartThreshold[];
  /** Value label configuration */
  valueLabel?: BarChartValueLabelConfig;
  /** Custom color scale resolver */
  colorScale?: (context: {
    datum: BarChartDataPoint;
    series: BarChartSeries;
    seriesIndex: number;
    categoryIndex: number;
  }) => string | undefined;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<BarChartDataPoint>;
  /** Animation configuration */
  animation?: ChartAnimation;
  /** Shared multi-series tooltip */
  multiTooltip?: boolean;
  /** Crosshair enable */
  enableCrosshair?: boolean;
  /** Live pointer-follow tooltip */
  liveTooltip?: boolean;
}