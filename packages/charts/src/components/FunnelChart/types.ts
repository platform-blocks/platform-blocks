import type {
  BaseChartProps,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';

export interface FunnelStep {
  /** Step label displayed in the funnel */
  label: string;
  /** Absolute value for the step */
  value: number;
  /** Override color used for the step */
  color?: string;
  /** Additional metadata associated with the step */
  meta?: any;
  /** Optional override for where the label should render */
  labelPosition?: 'inside' | 'outside-left' | 'outside-right';
  /** Human readable label for the trend delta */
  trendLabel?: string;
  /** Numeric delta used to drive up/down styling */
  trendDelta?: number;
}

export interface FunnelValueFormatterContext {
  /** Step index */
  index: number;
  /** Step currently being rendered */
  step: FunnelStep;
  /** All steps in the funnel */
  steps: FunnelStep[];
  /** Previous step value if available */
  previousValue?: number;
  /** First step value for retention calculations */
  firstValue: number;
  /** Share of the first step still present (0-1) */
  conversion: number;
  /** Share lost vs. the previous step (0-1) */
  dropRate: number;
  /** Absolute drop amount vs. the previous step */
  dropValue: number;
}

export type FunnelValueFormatter = (
  value: number,
  index: number,
  context?: FunnelValueFormatterContext
) => string | string[];

export interface FunnelConversionLabelContext {
  /** Index of the downstream step */
  index: number;
  /** Source step feeding into the next stage */
  from: FunnelStep;
  /** Target step that consumes the conversion */
  to: FunnelStep;
  /** Conversion share relative to the funnel start (0-1) */
  cumulativeConversion: number;
  /** Conversion share relative to the immediate prior step (0-1) */
  stepConversion: number;
  /** Loss share between steps (0-1) */
  dropRate: number;
  /** Absolute values for context */
  fromValue: number;
  toValue: number;
  /** Optional goal value supplied via layout */
  goal?: number;
}

export type FunnelConversionLabelFormatter = (
  context: FunnelConversionLabelContext
) => string | string[];

export interface FunnelChartSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Ordered steps within the funnel */
  steps: FunnelStep[];
  /** Base color applied to the steps */
  color?: string;
  /** Whether the series is visible */
  visible?: boolean;
}

export interface FunnelConnectorConfig {
  /** Render connectors between stages */
  show?: boolean;
  /** Stroke color for the connecting lines */
  stroke?: string;
  /** Stroke width for connector lines */
  strokeWidth?: number;
  /** Optional radius for rounded connector corners */
  radius?: number;
  /** Format the label displayed around the connector */
  labelFormatter?: FunnelConversionLabelFormatter;
  /** Offset applied to the connector label */
  labelOffset?: number;
}

export interface FunnelLayoutConfig {
  /** Shape style used to render steps */
  shape?: 'trapezoid' | 'bar';
  /** Gap between consecutive steps */
  gap?: number;
  /** Minimum pixel height for each segment */
  minSegmentHeight?: number;
  /** Horizontal alignment of the funnel */
  align?: 'center' | 'left' | 'right';
  /** Show conversion percentage between steps */
  showConversion?: boolean;
  /** How to render multiple series */
  seriesMode?: 'single' | 'grouped' | 'stacked';
  /** Pixel breakpoint used to switch to left-aligned layout */
  responsiveBreakpoint?: number;
  /** Extra spacing between grouped segments */
  groupGap?: number;
  /** Optional maximum label width before truncation */
  labelMaxWidth?: number;
  /** Connector configuration */
  connectors?: FunnelConnectorConfig;
}

export interface FunnelAccessibilityTableOptions {
  /** Display the hidden accessible table representation */
  show?: boolean;
  /** Optional aria-label or summary text */
  summary?: string;
  /** Custom id for the hidden table element */
  id?: string;
}

export interface FunnelDataTableRow {
  /** Stage label */
  label: string;
  /** Value for the stage */
  value: number;
  /** Conversion rate vs. start (0-1) */
  cumulativeConversion: number;
  /** Conversion rate vs. prior step (0-1) */
  stepConversion: number;
  /** Drop rate vs. prior step (0-1) */
  dropRate: number;
  /** Drop value vs. prior step */
  dropValue: number;
  /** Optional trend delta */
  trendDelta?: number;
  /** Optional trend label */
  trendLabel?: string;
}

export interface FunnelDataTablePayload {
  /** Series identifier (for grouped funnels) */
  seriesId: string | number | undefined;
  /** Series display name */
  seriesName?: string;
  /** Flattened rows for consumers */
  rows: FunnelDataTableRow[];
}

export interface FunnelChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<FunnelStep> {
  /** Funnel data series to render */
  series: FunnelChartSeries | FunnelChartSeries[];
  /** Layout customization options */
  layout?: FunnelLayoutConfig;
  /** Formatter for step values */
  valueFormatter?: FunnelValueFormatter;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<FunnelStep>;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Enable crosshair indicator */
  enableCrosshair?: boolean;
  /** Enable aggregated tooltip for multiple series */
  multiTooltip?: boolean;
  /** Keep tooltip following the pointer */
  liveTooltip?: boolean;
  /** Render hidden accessibility table */
  accessibilityTable?: FunnelAccessibilityTableOptions;
  /** Callback invoked with data table payload */
  onDataTable?: (payloads: FunnelDataTablePayload[]) => void;
}