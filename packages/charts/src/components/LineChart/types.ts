import type {
  BaseChartProps,
  ChartAnimation,
  ChartAnnotation,
  ChartAxis,
  ChartDataPoint,
  ChartGrid,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';

export interface LineChartSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Series name */
  name?: string;
  /** Data points for this series */
  data: ChartDataPoint[];
  /** Line color for this series */
  color?: string;
  /** Line thickness for this series */
  thickness?: number;
  /** Optional alias for line thickness */
  lineThickness?: number;
  /** Line style for this series */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Optional alias for line style */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Show points for this series */
  showPoints?: boolean;
  /** Point size for this series */
  pointSize?: number;
  /** Point color for this series */
  pointColor?: string;
  /** Whether this series is visible */
  visible?: boolean;
  /** Custom metadata for interactions */
  metadata?: any;
  /** Override fill visibility for area charts */
  areaFill?: boolean;
  /** Optional fill color for the series area */
  fillColor?: string;
  /** Optional fill opacity for the series area */
  fillOpacity?: number;
  /** Override smooth setting per series */
  smooth?: boolean;
}

export interface LineChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<ChartDataPoint> {
  /** Data points (single series) or array of series (multiseries) */
  data?: ChartDataPoint[];
  /** Multiple data series */
  series?: LineChartSeries[];
  /** Line color (for single series) */
  lineColor?: string;
  /** Line thickness (for single series) */
  lineThickness?: number;
  /** Line style (for single series) */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Show data points (for single series) */
  showPoints?: boolean;
  /** Point size (for single series) */
  pointSize?: number;
  /** Point color (for single series) */
  pointColor?: string;
  /** Smooth curve */
  smooth?: boolean;
  /** Fill area under line */
  fill?: boolean;
  /** Fill color */
  fillColor?: string;
  /** Fill opacity */
  fillOpacity?: number;
  /** How to distribute fill across series when multiple are present */
  areaFillMode?: 'single' | 'series';
  /** X-axis configuration */
  xAxis?: ChartAxis;
  /** Y-axis configuration */
  yAxis?: ChartAxis;
  /** Grid configuration */
  grid?: ChartGrid;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<ChartDataPoint>;
  /** Animation configuration */
  animation?: ChartAnimation;
  /** Show a vertical crosshair that follows the nearest point */
  enableCrosshair?: boolean;
  /** Enable toggling series visibility from legend */
  enableSeriesToggle?: boolean;
  /** Update tooltip continuously while moving (not just on press) */
  liveTooltip?: boolean;
  /** Show multi-series aggregated tooltip aligned to crosshair */
  multiTooltip?: boolean;
  /** Enable pan and pinch zoom interactions */
  enablePanZoom?: boolean;
  /** Which axes can zoom */
  zoomMode?: 'x' | 'y' | 'both';
  /** Minimum zoom factor relative to original domain (e.g. 0.1 = 10%) */
  minZoom?: number;
  /** Callback when visible data domain changes */
  onDomainChange?: (xDomain: [number, number], yDomain: [number, number]) => void;
  /** Enable wheel zoom on web */
  enableWheelZoom?: boolean;
  /** Wheel zoom step factor (default 0.1) */
  wheelZoomStep?: number;
  /** Invert wheel zoom direction */
  invertWheelZoom?: boolean;
  /** Double-tap (or double-click on web) resets zoom */
  resetOnDoubleTap?: boolean;
  /** Clamp pan/zoom so domains never exceed original data bounds */
  clampToInitialDomain?: boolean;
  /** Invert pinch gesture direction (scale grows when fingers move closer) */
  invertPinchZoom?: boolean;
  /** Disable all Reanimated-driven animations (debug / perf fallback) */
  disableAnimations?: boolean;
  /** Apply LTOB data decimation above this point count */
  decimationThreshold?: number;
  /** X axis scale type */
  xScaleType?: 'linear' | 'log' | 'time';
  /** Y axis scale type */
  yScaleType?: 'linear' | 'log' | 'time';
  /** Enable shift+drag brush to zoom (web) */
  enableBrushZoom?: boolean;
  /** Optional chart annotations/markers */
  annotations?: ChartAnnotation[];
}
