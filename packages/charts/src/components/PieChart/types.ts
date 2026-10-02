import type {
  BaseChartProps,
  ChartAnimation,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';
import type { ChartGradient, ChartGradientStop } from '../../core/ChartFill';

export type PieChartSliceGradientStop = ChartGradientStop;

/**
 * Slice gradient — the shared {@link ChartGradient}, spanning each slice's own box.
 * A linear gradient with no `angle`, `from` or `to` runs top-left → bottom-right.
 */
export type PieChartSliceGradient = Omit<ChartGradient, 'extent'>;

export interface PieChartSliceShadow {
  /** Shadow color */
  color?: string;
  /** Horizontal offset */
  dx?: number;
  /** Vertical offset */
  dy?: number;
  /** Blur radius */
  blur?: number;
  /** Shadow opacity */
  opacity?: number;
}

export interface PieChartSliceStyle {
  /** Stroke color override */
  strokeColor?: string;
  /** Stroke width override */
  strokeWidth?: number;
  /** Stroke opacity */
  strokeOpacity?: number;
  /** Fill opacity */
  fillOpacity?: number;
  /** Rounded corner radius in pixels (best with non-zero innerRadius) */
  cornerRadius?: number;
  /** Gradient fill configuration */
  gradient?: PieChartSliceGradient;
  /** Drop shadow configuration */
  shadow?: PieChartSliceShadow;
}

export interface PieChartLabelTextStyle {
  /** Label text color */
  color?: string;
  /** Label font size */
  fontSize?: number;
  /** Label font weight */
  fontWeight?: string;
  /** Label font family */
  fontFamily?: string;
  /** Line height applied between wrapped lines */
  lineHeight?: number;
}

export interface PieChartDataPoint {
  /** Unique identifier */
  id?: string | number;
  /** Value of the slice */
  value: number;
  /** Label for the slice */
  label: string;
  /** Color of the slice */
  color?: string;
  /** Custom data for interactions */
  data?: any;
  /** Style overrides for the slice */
  style?: PieChartSliceStyle;
}

export interface PieChartLayer {
  /** Optional identifier for the layer */
  id?: string;
  /** Data points rendered in this ring */
  data: PieChartDataPoint[];
  /** Inner radius for the layer */
  innerRadius: number;
  /** Outer radius for the layer */
  outerRadius: number;
  /** Optional start angle override */
  startAngle?: number;
  /** Optional end angle override */
  endAngle?: number;
  /** Optional pad angle override */
  padAngle?: number;
}

export interface PieChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<PieChartDataPoint> {
  /** Data points */
  data: PieChartDataPoint[];
  /** Inner radius (for donut chart) */
  innerRadius?: number;
  /** Outer radius */
  outerRadius?: number;
  /** Start angle in degrees */
  startAngle?: number;
  /** End angle in degrees */
  endAngle?: number;
  /** Padding between slices */
  padAngle?: number;
  /** Show labels */
  showLabels?: boolean;
  /** Keep outside labels visible below 400 px instead of showing details on selection. */
  showLabelsOnNarrow?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'outside' | 'center';
  /** Automatically choose label placement */
  labelStrategy?: 'auto' | 'inside' | 'outside' | 'center';
  /** Minimum slice angle (deg) to keep label inside when strategy is auto */
  labelAutoSwitchAngle?: number;
  /** Automatically wrap labels that exceed width */
  wrapLabels?: boolean;
  /** Maximum characters per label line when wrapping */
  labelMaxCharsPerLine?: number;
  /** Maximum number of lines when wrapping */
  labelMaxLines?: number;
  /** Render leader lines for outside labels */
  showLeaderLines?: boolean;
  /** Leader line stroke color */
  leaderLineColor?: string;
  /** Leader line stroke width */
  leaderLineWidth?: number;
  /** Style overrides applied to rendered labels */
  labelTextStyle?: PieChartLabelTextStyle;
  /** Label formatter */
  labelFormatter?: (dataPoint: PieChartDataPoint) => string;
  /** Show values */
  showValues?: boolean;
  /** Value formatter */
  valueFormatter?: (value: number, total: number) => string;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<PieChartDataPoint>;
  /** Animation configuration */
  animation?: ChartAnimation;
  /** Enable hover highlighting */
  highlightOnHover?: boolean;
  /** Callback when hover target changes */
  onSliceHover?: (slice: PieChartDataPoint | null) => void;
  /** Default style applied to slices */
  defaultSliceStyle?: PieChartSliceStyle;
  /** Additional rings rendered around the base series */
  layers?: PieChartLayer[];
  /** Allow toggling slice visibility from the legend */
  legendToggleEnabled?: boolean;
  /** Enable keyboard navigation between slices */
  keyboardNavigation?: boolean;
  /** Accessible label formatter */
  ariaLabelFormatter?: (slice: PieChartDataPoint, percentage: number) => string;
}
