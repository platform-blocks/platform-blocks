import type {
  BaseChartProps,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';

export interface RadialBarDatum {
  /** Unique identifier for the datum */
  id?: string | number;
  /** Numeric value represented by the arc */
  value: number;
  /** Optional per-datum maximum value */
  max?: number;
  /** Label displayed near the arc */
  label?: string;
  /** Color applied to the arc */
  color?: string;
  /** Track color rendered beneath the arc */
  trackColor?: string;
  /** Additional metadata associated with the datum */
  data?: any;
}

export interface RadialBarChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<RadialBarDatum> {
  /** Radial bar data to render */
  data: RadialBarDatum[];
  /** Radius of outer ring (auto if not provided) */
  radius?: number;
  /** Thickness of each arc */
  barThickness?: number;
  /** Gap (px) between concentric bars */
  gap?: number;
  /** Start angle in degrees (default -90 = top) */
  startAngle?: number;
  /** End angle in degrees (default 270 for full circle) */
  endAngle?: number;
  /** Show value labels at the tip of each arc */
  showValueLabels?: boolean;
  /** Format value for label */
  valueFormatter?: (value: number, datum: RadialBarDatum, index: number) => string;
  /** Primary text rendered in the empty center (e.g. an aggregate value) */
  centerLabel?: string;
  /** Secondary text rendered beneath the center label */
  centerSubLabel?: string;
  /** Enable aggregated tooltip across arcs */
  multiTooltip?: boolean;
  /** Keep tooltip following the pointer */
  liveTooltip?: boolean;
  /** Highlight the hovered ring (dim the others) on pointer interaction. Default false. */
  enableCrosshair?: boolean;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<RadialBarDatum>;
}