import type { ChartPadding } from '../ChartBase';
import { estimateChartTextWidth } from '../ChartBase';

/**
 * Defaults shared by the axis renderer and the padding math, so the space a
 * chart reserves and the space its labels actually take can't drift apart.
 */
export const AXIS_TICK_FONT_SIZE = 11;
export const AXIS_TITLE_FONT_SIZE = 12;
export const AXIS_TICK_SIZE = 4;
export const AXIS_TICK_PADDING = 4;
/** Gap between the tick labels and a rotated axis title. */
export const AXIS_TITLE_GAP = 8;
/** Breathing room between the outermost label and the edge of the chart. */
export const AXIS_EDGE_GUTTER = 4;

const lineHeight = (fontSize: number) => Math.round(fontSize * 1.3);

/** Widest of a set of labels, in px, by the same estimate the layout reserves for. */
export const measureWidestLabel = (labels: string[] | undefined, fontSize: number): number => {
  if (!labels || labels.length === 0) return 0;
  return labels.reduce((widest, label) => Math.max(widest, estimateChartTextWidth(String(label ?? ''), fontSize)), 0);
};

export interface CartesianPaddingInput {
  /** Labels rendered against the left axis, already formatted. */
  yTickLabels?: string[];
  /** Labels rendered under the bottom axis, already formatted. */
  xTickLabels?: string[];
  yTitle?: string;
  xTitle?: string;
  showYAxis?: boolean;
  showXAxis?: boolean;
  showYTickLabels?: boolean;
  showXTickLabels?: boolean;
  /** Total width the chart was given — the label budget is a fraction of it. */
  containerWidth: number;
  containerHeight: number;
  tickFontSize?: number;
  titleFontSize?: number;
  tickSize?: number;
  tickPadding?: number;
  /** Extra space above the plot for value labels drawn over the topmost mark. */
  topAllowance?: number;
  /** Extra space right of the plot, e.g. a second value axis. */
  rightAllowance?: number;
}

export interface CartesianPadding extends ChartPadding {
  /** Width the left tick-label box was sized to — hand this to the Axis. */
  yTickLabelWidth: number;
  /** Width of one bottom tick-label box. */
  xTickLabelWidth: number;
  /** Lines the bottom labels are allowed to wrap onto (1 or 2). */
  xTickLabelLines: number;
}

/**
 * Sizes a cartesian chart's margins from the labels that will actually be drawn.
 *
 * Every chart used to hard-code `{ left: 80, bottom: 60 }` — a third of the width
 * of a chart in a phone-sized column, and still not enough for a category like
 * "Customer Success", which wrapped mid-word inside a 44px box. Measuring the
 * labels instead gives short numeric axes their space back and long category
 * axes the room they need, with a ceiling so one outlier label can't collapse
 * the plot.
 */
export function resolveCartesianPadding(input: CartesianPaddingInput): CartesianPadding {
  const {
    yTickLabels,
    xTickLabels,
    yTitle,
    xTitle,
    showYAxis = true,
    showXAxis = true,
    showYTickLabels = true,
    showXTickLabels = true,
    containerWidth,
    containerHeight,
    tickFontSize = AXIS_TICK_FONT_SIZE,
    titleFontSize = AXIS_TITLE_FONT_SIZE,
    tickSize = AXIS_TICK_SIZE,
    tickPadding = AXIS_TICK_PADDING,
    topAllowance = 0,
    rightAllowance = 0,
  } = input;

  // A label column wider than this is worth truncating: past a third of the
  // chart the axis is no longer labelling a plot, it *is* the plot.
  const yLabelBudget = Math.max(28, Math.round(containerWidth * 0.33));
  const yTickWidth = showYAxis && showYTickLabels
    ? Math.min(Math.ceil(measureWidestLabel(yTickLabels, tickFontSize)), yLabelBudget)
    : 0;

  const yTitleBand = showYAxis && yTitle ? lineHeight(titleFontSize) + AXIS_TITLE_GAP : 0;
  const left = showYAxis
    ? AXIS_EDGE_GUTTER + yTitleBand + yTickWidth + tickPadding + tickSize
    : AXIS_EDGE_GUTTER;

  // Bottom labels wrap onto a second line only when one of them is wider than
  // the slot it gets; the alternative — a fixed two-line reserve — is what left
  // every numeric axis with 30px of empty space under it.
  const approxPlotWidth = Math.max(containerWidth - left - AXIS_EDGE_GUTTER - rightAllowance, 1);
  const slotCount = Math.max(xTickLabels?.length ?? 1, 1);
  const xTickLabelWidth = Math.max(Math.floor(approxPlotWidth / slotCount), 24);
  const widestX = measureWidestLabel(xTickLabels, tickFontSize);
  const xTickLabelLines = showXAxis && showXTickLabels && widestX > xTickLabelWidth ? 2 : 1;

  const xTickBand = showXAxis && showXTickLabels ? lineHeight(tickFontSize) * xTickLabelLines : 0;
  const xTitleBand = showXAxis && xTitle ? lineHeight(titleFontSize) + AXIS_TITLE_GAP : 0;
  const bottom = showXAxis
    ? tickSize + tickPadding + xTickBand + xTitleBand + AXIS_EDGE_GUTTER
    : AXIS_EDGE_GUTTER;

  // Half of the last label hangs past the final tick; without this it clips at
  // the right edge of the chart.
  const right = Math.max(AXIS_EDGE_GUTTER + rightAllowance, Math.round(Math.min(widestX, xTickLabelWidth) / 2));
  const top = Math.max(AXIS_EDGE_GUTTER, topAllowance);

  return {
    top,
    right,
    bottom: Math.min(bottom, Math.max(Math.round(containerHeight * 0.4), 24)),
    left: Math.min(left, Math.max(Math.round(containerWidth * 0.45), 28)),
    yTickLabelWidth: yTickWidth,
    xTickLabelWidth,
    xTickLabelLines,
  };
}

/**
 * Stand-in tick labels for a numeric domain, for charts that size their margins
 * before their ticks exist.
 *
 * Every tick falls inside the domain, and the widest label is nearly always an
 * endpoint (or the mid-point, where a formatter switches units), so measuring
 * those three reserves the right column without forcing a chart to compute its
 * scales twice.
 */
export function domainTickLabels(
  domain: [number, number] | undefined,
  format?: (value: number) => string,
): string[] {
  if (!domain || !Number.isFinite(domain[0]) || !Number.isFinite(domain[1])) return [];
  const [min, max] = domain;
  const render = format ?? ((value: number) => String(value));
  return [min, (min + max) / 2, max].map((value) => {
    try {
      return String(render(value));
    } catch {
      return String(value);
    }
  });
}
