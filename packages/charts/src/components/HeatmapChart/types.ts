import type {
  BaseChartProps,
  ChartAxis,
  ChartGrid,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';

// Heatmap Types
export interface HeatmapCell {
  /** Column index or x-axis value for the cell */
  x: number;
  /** Row index or y-axis value for the cell */
  y: number;
  /** Numeric value represented by the cell */
  value: number;
  /** Optional label displayed for the cell */
  label?: string;
  /** Override color used for the cell */
  color?: string;
  /** Arbitrary metadata associated with the cell */
  data?: any;
  /** Pre-formatted value for display */
  formattedValue?: string;
}

export interface HeatmapMatrixInput {
  /** Row labels for the matrix input */
  rows: (string | number)[];
  /** Column labels for the matrix input */
  cols: (string | number)[];
  /** Matrix of values aligned with rows and columns */
  values: (number | null | undefined)[][];
}

export interface HeatmapCellSize {
  /** Width of each heatmap cell in pixels */
  width?: number;
  /** Height of each heatmap cell in pixels */
  height?: number;
}

export interface HeatmapColorScaleConfig {
  /** Strategy used to interpolate colors */
  type?: 'linear' | 'log' | 'quantize';
  /** Minimum value represented in the scale */
  min?: number;
  /** Maximum value represented in the scale */
  max?: number;
  /** Explicit color stops applied to the scale */
  stops?: HeatmapColorStop[];
  /** Gradient colors used when stops are not provided */
  colors?: string[];
  /** Color applied when the cell value is null */
  nullColor?: string;
}

export interface HeatmapHoverHighlightConfig {
  /** Highlight entire row when hovering */
  showRow?: boolean;
  /** Highlight entire column when hovering */
  showColumn?: boolean;
  /** Fill color for row highlight */
  rowFill?: string;
  /** Fill color for column highlight */
  columnFill?: string;
  /** Opacity for row highlight fill */
  rowOpacity?: number;
  /** Opacity for column highlight fill */
  columnOpacity?: number;
}

export type HeatmapValueFormatter = (input: {
  /** Raw numeric value */
  value: number;
  /** Cell source metadata */
  cell: HeatmapCell;
  /** Minimum value observed in dataset */
  min: number;
  /** Maximum value observed in dataset */
  max: number;
  /** Sum of all values in the same row */
  rowSum: number;
  /** Sum of all values in the same column */
  columnSum: number;
  /** Sum of all values across the dataset */
  totalSum: number;
  /** Share of row contributed by the cell (0-1) */
  rowPercent: number;
  /** Share of column contributed by the cell (0-1) */
  columnPercent: number;
  /** Share of entire dataset contributed by the cell (0-1) */
  overallPercent: number;
}) => string;

export type HeatmapCellVisibilityPredicate = (input: {
  /** Cell source metadata */
  cell: HeatmapCell;
  /** Rendered cell width */
  width: number;
  /** Rendered cell height */
  height: number;
  /** Share of row contributed by the cell (0-1) */
  rowPercent: number;
  /** Share of column contributed by the cell (0-1) */
  columnPercent: number;
}) => boolean;

export type HeatmapValueFormatPreset =
  | 'percent'
  | 'percent-of-row'
  | 'percent-of-column'
  | 'compact'
  | 'compact-percent';

export interface HeatmapLabelDisplayRule {
  /** Minimum absolute value required to show the label */
  minValue?: number;
  /** Minimum share of the row required to show the label (0-1) */
  minRowPercent?: number;
  /** Minimum share of the column required to show the label (0-1) */
  minColumnPercent?: number;
  /** Minimum share of the overall total required to show the label (0-1) */
  minOverallPercent?: number;
}

export interface HeatmapGradientLegendConfig {
  /** Display the gradient legend */
  show?: boolean;
  /** Explicit legend stops (defaults to color scale stops) */
  stops?: HeatmapColorStop[];
  /** Height of the gradient bar */
  height?: number;
  /** Alignment of the legend within the chart */
  align?: 'start' | 'center' | 'end';
  /** Optional formatter for hover value */
  formatter?: (input: { value: number; percent: number }) => string;
  /** Label rendered alongside the legend */
  label?: string;
}

export interface HeatmapAccessibilityTableOptions {
  /** Whether to render the hidden accessible table representation */
  show?: boolean;
  /** Optional aria-label or summary text */
  summary?: string;
  /** Custom id for the hidden table element */
  id?: string;
}

export interface HeatmapDataTablePayload {
  rows: (string | number)[];
  columns: (string | number)[];
  values: number[][];
  rowTotals: number[];
  columnTotals: number[];
  grandTotal: number;
}

export interface HeatmapColorStop {
  /** Data value represented by the stop */
  value: number;
  /** Color applied at the stop value */
  color: string;
}

export interface HeatmapTooltipOptions {
  /** Whether the tooltip should be displayed */
  show?: boolean;
  /** Whether to aggregate values when hovering multiple cells */
  aggregate?: boolean;
}
export interface HeatmapChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<HeatmapCell> {
  /** Heatmap data points or matrix-style input */
  data: HeatmapCell[] | HeatmapMatrixInput;
  /** Color scale configuration */
  colorScale?: HeatmapColorScaleConfig;
  /** Explicit cell size overrides */
  cellSize?: HeatmapCellSize;
  /** Gap between cells in pixels */
  gap?: number;
  /** X-axis configuration */
  xAxis?: ChartAxis;
  /** Y-axis configuration */
  yAxis?: ChartAxis;
  /** Grid line configuration */
  grid?: ChartGrid;
  /** Legend configuration (often used for color scales) */
  legend?: ChartLegend;
  /** Tooltip configuration or simplified toggle */
  tooltip?: ChartTooltip<HeatmapCell> | HeatmapTooltipOptions;
  /** Highlight row/column under the cursor */
  enableCrosshair?: boolean;
  /** Enable aggregated tooltip for multiple cells */
  multiTooltip?: boolean;
  /** Keep tooltip following the pointer */
  liveTooltip?: boolean;
  /** Additional annotations to display */
  annotations?: any[];
  /** Maximum number of cells to animate before switching to fast static rendering */
  maxAnimatedCells?: number;
  /** When true, force fast static rendering (no per-cell animation) */
  disableAnimation?: boolean;
  /** Control whether cell labels render */
  showCellLabels?: boolean | HeatmapCellVisibilityPredicate | HeatmapLabelDisplayRule;
  /** Custom formatter for cell labels and tooltip values */
  valueFormatter?: HeatmapValueFormatter | HeatmapValueFormatPreset | { preset: HeatmapValueFormatPreset; decimals?: number; suffix?: string };
  /** Corner radius applied to heatmap cells */
  cellCornerRadius?: number;
  /** Customize hover highlight overlays */
  hoverHighlight?: HeatmapHoverHighlightConfig;
  /** Enable and customize gradient legend display */
  gradientLegend?: HeatmapGradientLegendConfig;
  /** Render hidden accessible table representation */
  accessibilityTable?: HeatmapAccessibilityTableOptions;
  /** Callback invoked with flattened data table payload */
  onDataTable?: (payload: HeatmapDataTablePayload) => void;
}
