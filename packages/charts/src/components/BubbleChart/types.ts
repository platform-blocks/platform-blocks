import type {
  BaseChartProps,
  ChartAxis,
  ChartGrid,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';
import type { ColorScaleConfig } from '../../utils/colorScale';

/**
 * Bubble color. A function maps the `dataKey.color` value (plus the record) to a
 * color. A shared scale config reads a numeric field: `by: 'color'` (the default
 * when `dataKey.color` is set), `'z'` (bubble size, the default otherwise), `'x'` or `'y'`.
 */
export type BubbleColorScale<T extends Record<string, any> = Record<string, any>> =
  | (ColorScaleConfig & { by?: 'color' | 'x' | 'y' | 'z' })
  | ((value: any, record: T, index: number) => string | undefined);

export interface BubbleChartDataKey<T extends Record<string, any> = Record<string, any>> {
  /** Field name for x axis values */
  x: keyof T;
  /** Field name for y axis values */
  y: keyof T;
  /** Optional field name for bubble size values */
  z?: keyof T;
  /** Optional field giving label for this node */
  label?: keyof T;
  /** Optional field with color override per bubble */
  color?: keyof T;
  /** Optional field supplying stable id */
  id?: keyof T;
}

export interface BubbleChartProps<T extends Record<string, any> = Record<string, any>>
  extends BaseChartProps,
    ChartInteractionCallbacks {
  /** Dataset to render */
  data: T[];
  /** Mapping between dataset keys and chart dimensions */
  dataKey: BubbleChartDataKey<T>;
  /** Bubble area range (min/max) used to derive radius. Defaults to [36, 576]. */
  range?: [number, number];
  /** Optional minimum bubble radius override (px). */
  minBubbleSize?: number;
  /** Optional maximum bubble radius override (px). */
  maxBubbleSize?: number;
  /** Base fill color when data does not provide one. */
  color?: string;
  /** Color bubbles by a field — a function, or a shared scale config over a numeric field. */
  colorScale?: BubbleColorScale<T>;
  /** Bubble fill opacity. Defaults to 0.85. */
  bubbleOpacity?: number;
  /** Bubble outline color. */
  bubbleStrokeColor?: string;
  /** Bubble outline width. Defaults to 1. */
  bubbleStrokeWidth?: number;
  /** Axis/grid text color override. */
  textColor?: string;
  /** Grid line color override. */
  gridColor?: string;
  /** Optional label shown inside the plot area. */
  label?: string;
  /** Custom formatter for bubble size values (tooltip + legend). */
  valueFormatter?: (value: number, record: T, index: number) => string;
  /** Disable tooltip interactions. Defaults to true (tooltip enabled). */
  withTooltip?: boolean;
  /** Advanced tooltip configuration */
  tooltip?: ChartTooltip<{
    record: T;
    value: number;
    label: string;
    rawX: any;
    rawY: any;
    index: number;
    color: string;
  }>;
  /** Supply custom grid configuration or disable grid entirely. */
  grid?: ChartGrid | boolean;
  /** Legend configuration. */
  legend?: ChartLegend;
  /** X axis configuration (ticks, formatting, labels). */
  xAxis?: ChartAxis;
  /** Y axis configuration (ticks, formatting, labels). */
  yAxis?: ChartAxis;
}

// Backward compatibility alias
export type SimpleBubbleChartProps<T extends Record<string, any> = Record<string, any>> = BubbleChartProps<T>;