import type {
  BaseChartProps,
  ChartAnimation,
  ChartAnnotation,
  ChartAxis,
  ChartGrid,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';

// Candlestick / OHLC data
export interface CandlestickDataPoint {
  /** Unique identifier for the data point */
  id?: string | number;
  /** X coordinate for the candle (typically time) */
  x: number | Date;
  /** Opening price for the period */
  open: number;
  /** Highest price reached within the period */
  high: number;
  /** Lowest price reached within the period */
  low: number;
  /** Closing price for the period */
  close: number;
  /** Optional traded volume for the period */
  volume?: number;
  /** Arbitrary metadata associated with the data point */
  data?: any;
}

export interface CandlestickSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Candlestick data points to plot */
  data: CandlestickDataPoint[];
  /** Fill/stroke color used for bullish candles */
  colorBull?: string;
  /** Fill/stroke color used for bearish candles */
  colorBear?: string;
  /** Wick color applied to the candle */
  wickColor?: string;
  /** Whether the series is visible */
  visible?: boolean;
}

export interface CandlestickChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<CandlestickDataPoint> {
  /** One or more candlestick series to render */
  series: CandlestickSeries[];
  /** Periods for moving average overlay lines (e.g. [20,50]) */
  movingAveragePeriods?: number[];
  /** Colors for moving average overlays (falls back to series palette) */
  movingAverageColors?: string[];
  /** Show moving average overlays (defaults true if periods provided) */
  showMovingAverages?: boolean;
  /** Show volume bars underneath (reserved) */
  showVolume?: boolean;
  /** Relative height ratio for volume sub-chart (0-0.5) */
  volumeHeightRatio?: number;
  /** Configuration for the horizontal axis */
  xAxis?: ChartAxis;
  /** Configuration for the vertical axis */
  yAxis?: ChartAxis;
  /** Background grid configuration */
  grid?: ChartGrid;
  /** Legend display options */
  legend?: ChartLegend;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<CandlestickDataPoint>;
  /** Animation configuration */
  animation?: ChartAnimation;
  /** Enable crosshair indicator */
  enableCrosshair?: boolean;
  /** Enable shared tooltip for multiple series */
  multiTooltip?: boolean;
  /** Follow pointer live with tooltip */
  liveTooltip?: boolean;
  /** Allow interactive pan and zoom */
  enablePanZoom?: boolean;
  /** Which axes support zooming */
  zoomMode?: 'x' | 'y' | 'both';
  /** Minimum zoom factor relative to original domain */
  minZoom?: number;
  /** Enable wheel-based zooming (web only) */
  enableWheelZoom?: boolean;
  /** Step factor applied to wheel zoom operations */
  wheelZoomStep?: number;
  /** Invert wheel zoom direction */
  invertWheelZoom?: boolean;
  /** Reset zoom on double-tap or double-click */
  resetOnDoubleTap?: boolean;
  /** Clamp panning to the initial data domain */
  clampToInitialDomain?: boolean;
  /** Invert pinch zoom direction */
  invertPinchZoom?: boolean;
  /** Scale type used for the x axis */
  xScaleType?: 'linear' | 'log' | 'time';
  /** Scale type used for the y axis */
  yScaleType?: 'linear' | 'log' | 'time';
  /** Additional annotations to render on the chart */
  annotations?: ChartAnnotation[];
}