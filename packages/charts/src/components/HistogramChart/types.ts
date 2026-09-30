import type {
  BaseChartProps,
  ChartAnnotation,
  ChartAxis,
  ChartGrid,
  ChartInteractionCallbacks,
  ChartLegend,
  ChartTooltip,
} from '../../types/base';
import type { ChartFill } from '../../core/ChartFill';
import type { ColorScaleConfig } from '../../utils/colorScale';

export interface HistogramBin {
  /** Inclusive lower bound of the bin */
  start: number;
  /** Exclusive upper bound of the bin */
  end: number;
  /** Number of samples that fell into the bin */
  count: number;
  /** Probability density represented by the bin */
  density: number;
}

export interface HistogramBinSummary extends HistogramBin {
  /** Zero-based index for the bin */
  index: number;
  /** Arithmetic midpoint between start and end */
  midpoint: number;
  /** Width of the bin interval */
  width: number;
  /** Running total count including this bin */
  cumulativeCount: number;
  /** Running density integral including this bin */
  cumulativeDensity: number;
  /** Cumulative density normalized to 0-1 */
  cumulativeDensityRatio: number;
  /** Percentile rank represented by the cumulative count */
  percentile: number;
}

/**
 * Per-bin coloring. A config maps a bin value through a shared color scale; a
 * function picks each bin's color itself (return undefined to fall back to
 * `barColor`).
 */
export type HistogramColorScale =
  | (ColorScaleConfig & {
      /**
       * What the scale reads from each bin:
       * - `'x'` (default): the bin's midpoint on the x axis — color by *where* values fall.
       * - `'count'`: the bin's sample count — color by *how many*.
       */
      by?: 'x' | 'count';
    })
  | ((bin: HistogramBinSummary) => string | undefined);

// Histogram (with optional density overlay)
export interface HistogramChartProps
  extends BaseChartProps,
    ChartInteractionCallbacks<HistogramBin> {
  /** Raw values used to build the histogram */
  data: number[];
  /** Explicit number of bins (overrides method) */
  bins?: number;
  /** Bin selection heuristic */
  binMethod?: 'sturges' | 'sqrt' | 'fd';
  /** Show density (KDE) overlay line */
  showDensity?: boolean;
  /** Gaussian kernel bandwidth (auto if not provided) */
  bandwidth?: number;
  /** Normalize histogram to probability density (area=1) */
  density?: boolean;
  /** Bar fill — a color or a gradient. Defaults to the theme's first palette slot. */
  barColor?: ChartFill;
  /** Color each bin by its position or count. Takes precedence over `barColor`. */
  colorScale?: HistogramColorScale;
  /** Opacity for bars (0-1) */
  barOpacity?: number;
  /** Bar outline color */
  barStroke?: string;
  /** Bar outline width in px (defaults to 1 when `barStroke` is set) */
  barStrokeWidth?: number;
  /** Density line color. Defaults to the theme's second palette slot. */
  densityColor?: string;
  /** Density line thickness */
  densityThickness?: number;
  /** Rounded bar corners */
  barRadius?: number;
  /** Gap ratio between bars (0-1) */
  barGap?: number;
  /** Enable multi-series tooltip aggregation */
  multiTooltip?: boolean;
  /** Keep tooltip following the pointer */
  liveTooltip?: boolean;
  /** Enable crosshair indicator */
  enableCrosshair?: boolean;
  /** Tooltip configuration */
  tooltip?: ChartTooltip<HistogramBin>;
  /** Custom value formatter for tooltips */
  valueFormatter?: (count: number, bin: HistogramBin) => string;
  /** Customise X axis presentation */
  xAxis?: ChartAxis;
  /** Customise Y axis presentation */
  yAxis?: ChartAxis;
  /** Grid line configuration */
  grid?: ChartGrid;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Render annotation markers (thresholds, targets) */
  annotations?: ChartAnnotation[];
  /** Highlight value ranges with background fills */
  rangeHighlights?: Array<{
    id: string | number;
    start: number;
    end: number;
    color?: string;
    opacity?: number;
  }>;
  /** Called whenever the active bin under the pointer changes */
  onBinFocus?: (bin: HistogramBinSummary) => void;
  /** Called when focus leaves the current bin */
  onBinBlur?: (bin: HistogramBinSummary | null) => void;
}
