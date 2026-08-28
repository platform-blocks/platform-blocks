import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Rect as SvgRect, Stop, Text as SvgText } from 'react-native-svg';
import {
  HeatmapChartProps,
  HeatmapCell,
  HeatmapColorScaleConfig,
  HeatmapColorStop,
  HeatmapDataTablePayload,
  HeatmapValueFormatter,
  HeatmapLabelDisplayRule,
  ChartInteractionEvent,
} from '../../types';
import { ChartContainer, ChartTitle, estimateChartTextWidth, measureChartTitleBand } from '../../ChartBase';
import { useChartInteractionContext, usePointer } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { CellGridHitTester } from '../../core/hittest/grid';
import type { HitSeries, Mark } from '../../core/hittest/types';
import { getColorFromScheme, colorSchemes, clamp, formatNumber } from '../../utils';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { AnimatedHeatmapCell } from './AnimatedHeatmapCell';
import type { Scale } from '../../utils/scales';

function interpolateColor(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16); const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
}

function buildGradient(colors: string[], t: number) {
  if (colors.length === 0) return '#ccc';
  if (colors.length === 1) return colors[0];
  const seg = 1 / (colors.length - 1);
  const idx = Math.min(colors.length - 2, Math.floor(t / seg));
  const localT = (t - idx * seg) / seg;
  return interpolateColor(colors[idx], colors[idx + 1], localT);
}

type ProcessedHeatmapCell = HeatmapCell & {
  chartX: number;
  chartY: number;
  pixelX: number;
  pixelY: number;
  width: number;
  height: number;
  color: string;
  normalizedValue: number;
  displayValue?: string;
  showLabel: boolean;
  index: number;
  rowSum: number;
  columnSum: number;
  rowPercent: number;
  columnPercent: number;
  overallPercent: number;
  rowLabel?: string | number;
  columnLabel?: string | number;
};

type ValueFormatterLike = HeatmapChartProps['valueFormatter'];

interface FormatterOptions {
  decimals?: number;
  suffix?: string;
}

function buildPresetFormatter(
  preset: string,
  options: FormatterOptions | undefined
): HeatmapValueFormatter {
  return ({
    value,
    rowPercent,
    columnPercent,
    overallPercent,
  }) => {
    const decimals = options?.decimals ?? (preset.includes('percent') ? 1 : 2);
    const suffix = options?.suffix ?? '';
    switch (preset) {
      case 'percent':
        return `${formatNumber(value * 100, decimals)}%${suffix}`;
      case 'percent-of-row':
        return `${formatNumber(rowPercent * 100, decimals)}%${suffix}`;
      case 'percent-of-column':
        return `${formatNumber(columnPercent * 100, decimals)}%${suffix}`;
      case 'compact-percent':
        return `${formatNumber(overallPercent * 100, decimals)}%${suffix}`;
      case 'compact':
      default:
        return `${formatNumber(value, decimals)}${suffix}`;
    }
  };
}

function resolveValueFormatter(
  formatter: ValueFormatterLike,
  options: FormatterOptions | undefined
): HeatmapValueFormatter | undefined {
  if (!formatter) return undefined;
  if (typeof formatter === 'function') return formatter;
  if (typeof formatter === 'string') {
    return buildPresetFormatter(formatter, options);
  }
  if (typeof formatter === 'object' && formatter?.preset) {
    const { preset, decimals, suffix } = formatter;
    return buildPresetFormatter(preset, { decimals, suffix });
  }
  return undefined;
}

function deriveLegendStops(
  scale: HeatmapColorScaleConfig,
  fallbackColors: string[],
  min: number,
  max: number
): HeatmapColorStop[] {
  if (scale.stops && scale.stops.length) {
    return [...scale.stops].sort((a, b) => a.value - b.value);
  }
  if (fallbackColors.length <= 1) {
    return [
      { value: min, color: fallbackColors[0] ?? '#0EA5E9' },
      { value: max, color: fallbackColors[fallbackColors.length - 1] ?? '#1D4ED8' },
    ];
  }
  const span = fallbackColors.length - 1;
  return fallbackColors.map((color, index) => {
    const t = index / span;
    const value = min + (max - min) * t;
    return { value, color };
  });
}

// Phase 1 minimal Heatmap
export const HeatmapChart: React.FC<HeatmapChartProps> = (props) => {
  const {
    data,
    width = 420,
    height = 320,
    title,
    subtitle,
    colorScale,
    cellSize,
    gap = 2,
    style,
    xAxis,
    yAxis,
    grid,
    legend,
    gradientLegend,
    tooltip,
    multiTooltip = true,
    liveTooltip = false,
    enableCrosshair = true,
    showCellLabels,
    valueFormatter,
    cellCornerRadius = 2,
    hoverHighlight,
    maxAnimatedCells = 400,
    disableAnimation = false,
    onPress,
    onDataPointPress,
    ...rest
  } = props;

  const theme = useChartTheme();

  // Only the chart-level tooltip `formatter` and `show` flag are honored here.
  // All other tooltip styling (background, text color, padding, font) is owned
  // by the shared ChartActiveTooltip renderer and applied globally.
  const tooltipFormatter =
    tooltip && 'formatter' in tooltip ? tooltip.formatter : undefined;
  const tooltipShow = tooltip?.show;

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch {
    interaction = null;
  }
  const register = interaction?.register;

  // Normalize data and preserve matrix labels when provided
  const normalized = React.useMemo(() => {
    if (Array.isArray(data)) {
      return {
        cells: data,
        columnLabels: undefined as (string | number)[] | undefined,
        rowLabels: undefined as (string | number)[] | undefined,
      };
    }
    const { rows, cols, values } = data;
    const list: HeatmapCell[] = [];
    rows.forEach((row, rowIndex) => {
      cols.forEach((col, colIndex) => {
        const v = values[rowIndex]?.[colIndex];
        if (v == null) return;
        list.push({ x: colIndex, y: rowIndex, value: v, label: `${row}-${col}` });
      });
    });
    return {
      cells: list,
      columnLabels: cols,
      rowLabels: rows,
    };
  }, [data]);

  const cells = normalized.cells;
  const columnLabels = normalized.columnLabels;
  const rowLabels = normalized.rowLabels;

  const xMax = React.useMemo(() => {
    if (!cells.length) return -1;
    return Math.max(...cells.map((cell) => cell.x));
  }, [cells]);

  const yMax = React.useMemo(() => {
    if (!cells.length) return -1;
    return Math.max(...cells.map((cell) => cell.y));
  }, [cells]);

  const uniqueX = columnLabels?.length ?? (xMax >= 0 ? xMax + 1 : 0);
  const uniqueY = rowLabels?.length ?? (yMax >= 0 ? yMax + 1 : 0);

  const totals = React.useMemo(() => {
    const rowTotals = Array.from({ length: uniqueY }, () => 0);
    const columnTotals = Array.from({ length: uniqueX }, () => 0);
    let grandTotal = 0;
    cells.forEach((cell) => {
      rowTotals[cell.y] = (rowTotals[cell.y] ?? 0) + cell.value;
      columnTotals[cell.x] = (columnTotals[cell.x] ?? 0) + cell.value;
      grandTotal += cell.value;
    });
    const rowMax = rowTotals.reduce((acc, val) => Math.max(acc, val), 0);
    const columnMax = columnTotals.reduce((acc, val) => Math.max(acc, val), 0);
    return {
      rowTotals,
      columnTotals,
      grandTotal,
      rowMax,
      columnMax,
    };
  }, [cells, uniqueX, uniqueY]);

  const resolvedFormatter = React.useMemo(
    () => resolveValueFormatter(valueFormatter, undefined),
    [valueFormatter]
  );

  const scale: HeatmapColorScaleConfig = colorScale ?? {};
  const minVal = scale.min ?? (cells.length ? Math.min(...cells.map((c) => c.value)) : 0);
  const maxVal = scale.max ?? (cells.length ? Math.max(...cells.map((c) => c.value)) : 1);
  const colors = scale.stops?.length
    ? scale.stops.map((stop) => stop.color)
    : scale.colors || [
        getColorFromScheme(0, colorSchemes.default),
        getColorFromScheme(5, colorSchemes.default),
      ];

  const sortedStops = React.useMemo(() => {
    if (!scale.stops || !scale.stops.length) return null;
    return [...scale.stops].sort((a, b) => a.value - b.value);
  }, [scale.stops]);

  const nullFill = scale.nullColor ?? 'rgba(148, 163, 184, 0.2)';

  // --- Gradient (color-scale) legend --------------------------------------
  // A heatmap's natural legend is a min→max color-scale bar, not a categorical
  // list. It renders when `gradientLegend` is provided (and not show:false) or,
  // failing that, when a `legend` prop is provided (and not show:false).
  const gradientLegendEnabled =
    gradientLegend != null
      ? gradientLegend.show !== false
      : legend != null
        ? legend.show !== false
        : false;

  const legendBarThickness = gradientLegend?.height ?? 10;

  // SVG gradient ids are document-global: a shared id makes every heatmap on the
  // page paint the first chart's legend colors.
  const gradientInstanceIdRef = React.useRef<string>('');
  if (!gradientInstanceIdRef.current) {
    gradientInstanceIdRef.current = `heatmap-legend-gradient-${Math.random().toString(36).slice(2, 10)}`;
  }
  const gradientInstanceId = gradientInstanceIdRef.current;

  const legendStops = React.useMemo<HeatmapColorStop[]>(() => {
    if (!gradientLegendEnabled) return [];
    if (gradientLegend?.stops && gradientLegend.stops.length) {
      return [...gradientLegend.stops].sort((a, b) => a.value - b.value);
    }
    return deriveLegendStops(scale, colors, minVal, maxVal);
    // `scale`/`colors` are derived from `colorScale` each render; depend on the source.
  }, [gradientLegendEnabled, gradientLegend?.stops, colorScale, colors, minVal, maxVal]);

  const formatLegendValue = React.useCallback(
    (value: number, percent: number) => {
      if (gradientLegend?.formatter) return gradientLegend.formatter({ value, percent });
      const range = Math.abs(maxVal - minVal);
      const decimals = range > 0 && range < 10 ? 1 : 0;
      return formatNumber(value, decimals);
    },
    [gradientLegend, maxVal, minVal]
  );

  const normalizeValue = React.useCallback((value: number) => {
    if (!Number.isFinite(value)) return 0;
    if (maxVal === minVal) return 0.5;
    if (scale.type === 'log') {
      const safeMin = minVal <= 0 ? 1e-6 : minVal;
      const safeMax = Math.max(maxVal, safeMin * (1 + 1e-6));
      const clamped = Math.max(safeMin, Math.min(safeMax, value));
      const numerator = Math.log(clamped) - Math.log(safeMin);
      const denominator = Math.log(safeMax) - Math.log(safeMin);
      if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
        return 0;
      }
      return Math.min(1, Math.max(0, numerator / denominator));
    }
    const numerator = value - minVal;
    const denominator = maxVal - minVal;
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, numerator / denominator));
  }, [maxVal, minVal, scale.type]);

  const resolveColor = React.useCallback((value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) {
      return nullFill;
    }

    if (sortedStops && sortedStops.length) {
      if (scale.type === 'quantize') {
        for (let i = 0; i < sortedStops.length; i += 1) {
          if (value <= sortedStops[i].value) {
            return sortedStops[i].color;
          }
        }
        return sortedStops[sortedStops.length - 1].color;
      }

      let lower = sortedStops[0];
      let upper = sortedStops[sortedStops.length - 1];
      for (let i = 0; i < sortedStops.length; i += 1) {
        const stop = sortedStops[i];
        if (value === stop.value) {
          return stop.color;
        }
        if (value > stop.value) {
          lower = stop;
          continue;
        }
        upper = stop;
        break;
      }

      if (upper === lower || upper.value === lower.value) {
        return lower.color;
      }

      const ratio = (value - lower.value) / (upper.value - lower.value);
      return interpolateColor(lower.color, upper.color, Math.min(1, Math.max(0, ratio)));
    }

    if (scale.type === 'quantize' && colors.length > 0) {
      const binCount = colors.length;
      const norm = normalizeValue(value);
      const index = Math.min(binCount - 1, Math.floor(norm * binCount));
      return colors[index] ?? colors[colors.length - 1];
    }

    const norm = normalizeValue(value);
    return buildGradient(colors, norm);
  }, [colors, normalizeValue, nullFill, scale.type, sortedStops]);

  const formatXTick = React.useCallback((value: number) => {
    if (Number.isNaN(value)) return '';
    if (xAxis?.labelFormatter) return xAxis.labelFormatter(value);
    if (columnLabels && columnLabels[value] != null) return String(columnLabels[value]);
    return String(value);
  }, [columnLabels, xAxis]);

  const formatYTick = React.useCallback((value: number) => {
    if (Number.isNaN(value)) return '';
    if (yAxis?.labelFormatter) return yAxis.labelFormatter(value);
    if (rowLabels && rowLabels[value] != null) return String(rowLabels[value]);
    return String(value);
  }, [rowLabels, yAxis]);

  // --- Layout bands ---------------------------------------------------------
  // Every overlay the chart draws outside the plot (title, axis labels, axis
  // titles, legend) reserves its own band up front. Anything drawn from a band
  // that was not reserved lands on top of the cells.
  const showXAxis = xAxis?.show !== false;
  const showYAxis = yAxis?.show !== false;
  const yTickLabelFontSize = yAxis?.labelFontSize ?? 11;

  // Row labels are laid out in a fixed-width box, so the gutter has to be wide
  // enough for the longest one or every label wraps mid-word.
  const yTickLabelWidth = React.useMemo(() => {
    if (!showYAxis || yAxis?.showLabels === false || uniqueY === 0) return 0;
    const widest = Array.from({ length: uniqueY }, (_, index) =>
      estimateChartTextWidth(formatYTick(index), yTickLabelFontSize)
    ).reduce((max, value) => Math.max(max, value), 0);
    // The estimate runs on an average glyph advance; short labels beat it, and a
    // label wider than its box bleeds past the chart's left edge.
    return clamp(Math.ceil(widest * 1.18) + 8, 30, Math.max(30, width * 0.4));
  }, [formatYTick, showYAxis, uniqueY, width, yAxis?.showLabels, yTickLabelFontSize]);

  const Y_TICK_GAP = 8; // Axis tickSize + tickPadding
  const Y_TITLE_BAND = 22; // rotated axis title + its gap
  const X_TICK_BAND = 24; // tick mark + one line of tick label
  const X_TITLE_OFFSET = X_TICK_BAND + 2; // where the bottom axis title starts
  const LEGEND_GAP = 12; // between the axis band and the legend bar

  const xTitleBand = showXAxis && xAxis?.title ? (xAxis?.titleFontSize ?? 12) + 10 : 0;
  const xAxisBand = showXAxis ? X_TICK_BAND + xTitleBand : 0;
  const legendBand = gradientLegendEnabled ? LEGEND_GAP + legendBarThickness + 20 : 0;
  const titleBand = measureChartTitleBand(title, subtitle);

  const basePadding = React.useMemo(() => ({
    top: Math.max(16, titleBand),
    left: (showYAxis ? Y_TICK_GAP + yTickLabelWidth : 12) + (showYAxis && yAxis?.title ? Y_TITLE_BAND : 0),
    right: 20,
    bottom: xAxisBand + legendBand + 8,
  }), [legendBand, showYAxis, titleBand, xAxisBand, yAxis?.title, yTickLabelWidth]);

  const availablePlotWidth = Math.max(0, width - basePadding.left - basePadding.right);
  const availablePlotHeight = Math.max(0, height - basePadding.top - basePadding.bottom);

  const fallbackCellWidth = React.useMemo(() => {
    if (!uniqueX) return 0;
    return Math.max(4, (availablePlotWidth - gap * Math.max(uniqueX - 1, 0)) / Math.max(uniqueX, 1));
  }, [availablePlotWidth, gap, uniqueX]);

  const fallbackCellHeight = React.useMemo(() => {
    if (!uniqueY) return 0;
    return Math.max(4, (availablePlotHeight - gap * Math.max(uniqueY - 1, 0)) / Math.max(uniqueY, 1));
  }, [availablePlotHeight, gap, uniqueY]);

  const cellW = React.useMemo(() => {
    if (!uniqueX) return 0;
    return Math.max(1, cellSize?.width ?? fallbackCellWidth);
  }, [cellSize?.width, fallbackCellWidth, uniqueX]);

  const cellH = React.useMemo(() => {
    if (!uniqueY) return 0;
    return Math.max(1, cellSize?.height ?? fallbackCellHeight);
  }, [cellSize?.height, fallbackCellHeight, uniqueY]);

  const shouldShowCellLabel = React.useCallback(
    (cell: HeatmapCell, rowPercent: number, columnPercent: number, overallPercent: number) => {
      if (typeof showCellLabels === 'boolean') {
        return showCellLabels;
      }
      if (typeof showCellLabels === 'function') {
        return showCellLabels({ cell, width: cellW, height: cellH, rowPercent, columnPercent });
      }
      if (showCellLabels && typeof showCellLabels === 'object') {
        const rule = showCellLabels as HeatmapLabelDisplayRule;
        if (rule.minValue != null && cell.value < rule.minValue) return false;
        if (rule.minRowPercent != null && rowPercent < rule.minRowPercent) return false;
        if (rule.minColumnPercent != null && columnPercent < rule.minColumnPercent) return false;
        if (rule.minOverallPercent != null && overallPercent < rule.minOverallPercent) return false;
        return true;
      }
      return Math.min(cellW, cellH) >= 26;
    },
    [cellH, cellW, showCellLabels]
  );

  const plotWidth = React.useMemo(() => {
    if (!uniqueX) return 0;
    return Math.max(0, cellW * uniqueX + gap * Math.max(uniqueX - 1, 0));
  }, [cellW, gap, uniqueX]);

  const plotHeight = React.useMemo(() => {
    if (!uniqueY) return 0;
    return Math.max(0, cellH * uniqueY + gap * Math.max(uniqueY - 1, 0));
  }, [cellH, gap, uniqueY]);

  // An explicit `cellSize` can ask for more room than `width`/`height` allow.
  // Grow the box to fit rather than letting the axes and legend spill past it.
  const contentWidth = basePadding.left + plotWidth + basePadding.right;
  const contentHeight = basePadding.top + plotHeight + basePadding.bottom;
  const boxWidth = Math.max(width, contentWidth);
  const boxHeight = Math.max(height, contentHeight);

  // A fixed `cellSize` narrower than the box leaves slack on one side; split it so
  // the plot sits under the (centered) title instead of hugging the left edge.
  const padding = React.useMemo(() => ({
    ...basePadding,
    left: basePadding.left + Math.max(0, (boxWidth - contentWidth) / 2),
  }), [basePadding, boxWidth, contentWidth]);

  const hoverOverlay = React.useMemo(() => ({
    showRow: hoverHighlight?.showRow ?? true,
    showColumn: hoverHighlight?.showColumn ?? true,
    rowFill: hoverHighlight?.rowFill ?? 'rgba(59, 130, 246, 0.08)',
    columnFill: hoverHighlight?.columnFill ?? 'rgba(59, 130, 246, 0.12)',
    rowOpacity: hoverHighlight?.rowOpacity,
    columnOpacity: hoverHighlight?.columnOpacity,
  }), [hoverHighlight]);

  const axisScaleX = React.useMemo<Scale<number>>(() => {
    const domain: [number, number] = uniqueX > 0 ? [0, Math.max(uniqueX - 1, 0)] : [0, 1];
    const range: [number, number] = uniqueX > 0 ? [cellW / 2, Math.max(plotWidth - cellW / 2, cellW / 2)] : [0, 0];
    const scale = ((value: number) => {
      if (!uniqueX) return 0;
      const clamped = Math.max(domain[0], Math.min(domain[1], value));
      return (cellW + gap) * clamped + cellW / 2;
    }) as Scale<number>;
    scale.domain = () => [...domain];
    scale.range = () => [...range];
    scale.ticks = () => {
      if (xAxis?.ticks && xAxis.ticks.length) return xAxis.ticks;
      return Array.from({ length: uniqueX }, (_, index) => index);
    };
    scale.bandwidth = () => cellW;
    return scale;
  }, [cellW, gap, plotWidth, uniqueX, xAxis?.ticks]);

  const axisScaleY = React.useMemo<Scale<number>>(() => {
    const domain: [number, number] = uniqueY > 0 ? [0, Math.max(uniqueY - 1, 0)] : [0, 1];
    const range: [number, number] = uniqueY > 0 ? [cellH / 2, Math.max(plotHeight - cellH / 2, cellH / 2)] : [0, 0];
    const scale = ((value: number) => {
      if (!uniqueY) return 0;
      const clamped = Math.max(domain[0], Math.min(domain[1], value));
      return (cellH + gap) * clamped + cellH / 2;
    }) as Scale<number>;
    scale.domain = () => [...domain];
    scale.range = () => [...range];
    scale.ticks = () => {
      if (yAxis?.ticks && yAxis.ticks.length) return yAxis.ticks;
      return Array.from({ length: uniqueY }, (_, index) => index);
    };
    scale.bandwidth = () => cellH;
    return scale;
  }, [cellH, gap, plotHeight, uniqueY, yAxis?.ticks]);

  const axisXTicks = React.useMemo(() => (axisScaleX.ticks ? axisScaleX.ticks() : []), [axisScaleX]);
  const axisYTicks = React.useMemo(() => (axisScaleY.ticks ? axisScaleY.ticks() : []), [axisScaleY]);

  const normalizedXTicks = React.useMemo(() => {
    if (plotWidth <= 0) return [] as number[];
    return axisXTicks
      .map((tick) => {
        if (typeof tick !== 'number') return null;
        const px = axisScaleX(tick);
        if (!Number.isFinite(px)) return null;
        return px / plotWidth;
      })
      .filter((value): value is number => value != null && Number.isFinite(value));
  }, [axisXTicks, axisScaleX, plotWidth]);

  const normalizedYTicks = React.useMemo(() => {
    if (plotHeight <= 0) return [] as number[];
    return axisYTicks
      .map((tick) => {
        if (typeof tick !== 'number') return null;
        const py = axisScaleY(tick);
        if (!Number.isFinite(py)) return null;
        return py / plotHeight;
      })
      .filter((value): value is number => value != null && Number.isFinite(value));
  }, [axisYTicks, axisScaleY, plotHeight]);

  // Process cells for AnimatedHeatmapCell components
  const processedCells = React.useMemo<ProcessedHeatmapCell[]>(() => {
    if (!cells.length) return [];
    const { rowTotals, columnTotals, grandTotal } = totals;
    return cells.map((cell, index) => {
      const pixelX = cell.x * (cellW + gap);
      const pixelY = cell.y * (cellH + gap);
      const normalizedValue = normalizeValue(cell.value);
      const color = cell.color ?? resolveColor(cell.value);
      const rowSum = rowTotals[cell.y] ?? 0;
      const columnSum = columnTotals[cell.x] ?? 0;
      const rowPercent = rowSum !== 0 ? cell.value / rowSum : 0;
      const columnPercent = columnSum !== 0 ? cell.value / columnSum : 0;
      const overallPercent = grandTotal !== 0 ? cell.value / grandTotal : 0;
      const formattedValue = resolvedFormatter
        ? resolvedFormatter({
            value: cell.value,
            cell,
            min: minVal,
            max: maxVal,
            rowSum,
            columnSum,
            totalSum: grandTotal,
            rowPercent,
            columnPercent,
            overallPercent,
          })
        : cell.formattedValue;
      const displayValue = formattedValue ?? cell.formattedValue;

      return {
        ...cell,
        index,
        chartX: pixelX + cellW / 2,
        chartY: pixelY + cellH / 2,
        pixelX,
        pixelY,
        width: cellW,
        height: cellH,
        color,
        normalizedValue,
        displayValue,
        formattedValue,
        rowSum,
        columnSum,
        rowPercent,
        columnPercent,
        overallPercent,
        rowLabel: rowLabels?.[cell.y],
        columnLabel: columnLabels?.[cell.x],
        showLabel: shouldShowCellLabel(cell, rowPercent, columnPercent, overallPercent),
      };
    });
  }, [cells, cellW, cellH, gap, normalizeValue, resolveColor, totals, resolvedFormatter, minVal, maxVal, rowLabels, columnLabels, shouldShowCellLabel]);

  const totalCells = processedCells.length;
  const animationDisabled = disableAnimation || totalCells > maxAnimatedCells;

  // New interaction engine: every cell is a rect mark carrying its container-origin
  // rectangle + { row, col }. The cell tester resolves the hovered cell by rect
  // membership; the resolved target feeds the shared tooltip.
  const hitSeries: HitSeries[] = React.useMemo(() => {
    const marks: Mark[] = processedCells.map((cell) => {
      const rectX = cell.pixelX + padding.left;
      const rectY = cell.pixelY + padding.top;
      const raw = cell.formattedValue ?? cell.displayValue ?? cell.value;
      const baseFormatted = raw == null ? undefined : String(raw);
      // Chart-level tooltip.formatter wins over the derived cell text: a string
      // becomes formattedValue; a ReactNode becomes a customTooltip body.
      const tf = tooltipFormatter?.(cell);
      return {
        id: cell.index,
        pixel: { x: rectX + cell.width / 2, y: rectY + cell.height / 2 },
        value: cell.value,
        datum: cell,
        label: String(cell.label ?? `${cell.rowLabel ?? cell.y} · ${cell.columnLabel ?? cell.x}`),
        extent: {
          rect: { x: rectX, y: rectY, width: cell.width, height: cell.height },
          cell: { row: cell.y, col: cell.x },
        },
        formattedValue: typeof tf === 'string' ? tf : baseFormatted,
        ...(tf != null && typeof tf !== 'string' ? { customTooltip: tf } : {}),
      };
    });
    return [{ id: 'heatmap', name: title || 'Heatmap', color: theme.colors.accentPalette?.[0], visible: true, marks }];
  }, [processedCells, padding.left, padding.top, title, theme.colors.accentPalette, tooltipFormatter]);

  const tester = React.useMemo(() => new CellGridHitTester(hitSeries), [hitSeries]);

  React.useEffect(() => {
    if (!register) return;
    register('heatmap', { frame: { kind: 'cartesian' } as any, geometry: { kind: 'cell' }, series: hitSeries });
    return () => register('heatmap', null);
  }, [register, hitSeries]);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding,
    plotWidth,
    plotHeight,
    enabled: Boolean(interaction) && totalCells > 0,
    hover: true,
    press: Boolean(onDataPointPress || onPress),
    tester,
    onPress: (e, target) => {
      if (!target) return;
      const datum = target.datum as ProcessedHeatmapCell;
      const event: ChartInteractionEvent<HeatmapCell> = {
        nativeEvent: e.raw,
        chartX: plotWidth > 0 ? e.plotX / plotWidth : 0,
        chartY: plotHeight > 0 ? e.plotY / plotHeight : 0,
        dataX: target.dataX,
        dataY: target.dataY,
        dataPoint: datum,
        distance: target.distance,
      };
      onDataPointPress?.(datum, event);
      onPress?.(event);
    },
  });

  const pointer = usePointer();
  const hoverCell = React.useMemo(() => {
    if (!pointer || !pointer.inside) return null;
    const localX = pointer.x - padding.left;
    const localY = pointer.y - padding.top;
    if (localX < 0 || localY < 0 || localX > plotWidth || localY > plotHeight) return null;
    const col = Math.floor(localX / (cellW + gap));
    const row = Math.floor(localY / (cellH + gap));
    if (col < 0 || row < 0 || col >= uniqueX || row >= uniqueY) return null;
    return processedCells.find((c) => c.x === col && c.y === row) ?? null;
  }, [pointer, processedCells, cellW, cellH, gap, uniqueX, uniqueY, padding.left, padding.top, plotWidth, plotHeight]);

  const columnHighlight = React.useMemo(() => {
    if (!hoverCell) return null;
    const x = Math.max(0, hoverCell.pixelX - gap / 2);
    const expandedWidth = Math.max(hoverCell.width, hoverCell.width + gap);
    const width = Math.max(0, Math.min(plotWidth - x, expandedWidth));
    return {
      x,
      width: width || hoverCell.width,
    };
  }, [gap, hoverCell, plotWidth]);

  const rowHighlight = React.useMemo(() => {
    if (!hoverCell) return null;
    const y = Math.max(0, hoverCell.pixelY - gap / 2);
    const expandedHeight = Math.max(hoverCell.height, hoverCell.height + gap);
    const height = Math.max(0, Math.min(plotHeight - y, expandedHeight));
    return {
      y,
      height: height || hoverCell.height,
    };
  }, [gap, hoverCell, plotHeight]);

  const legendLayout = React.useMemo(() => {
    if (!gradientLegendEnabled || legendStops.length === 0) return null;
    const areaLeft = padding.left;
    const areaWidth = plotWidth > 0 ? plotWidth : Math.max(0, boxWidth - padding.left - padding.right);
    const barWidth = Math.max(0, Math.min(areaWidth, 240));
    const align = gradientLegend?.align ?? legend?.align ?? 'center';
    let x = areaLeft;
    if (align === 'center') x = areaLeft + (areaWidth - barWidth) / 2;
    else if (align === 'end') x = areaLeft + (areaWidth - barWidth);
    // Sits below the axis band, not at a fixed distance from the bottom edge:
    // the plot can be taller than `height` when `cellSize` is explicit.
    const barY = padding.top + plotHeight + xAxisBand + LEGEND_GAP;
    const minValue = legendStops[0].value;
    const maxValue = legendStops[legendStops.length - 1].value;
    const span = maxValue - minValue;
    const gradientStops = legendStops.map((stop) => ({
      offset: span === 0 ? 0 : clamp((stop.value - minValue) / span, 0, 1),
      color: stop.color,
    }));
    return {
      x,
      barY,
      barWidth,
      minValue,
      maxValue,
      gradId: gradientInstanceId,
      gradientStops,
      label: gradientLegend?.label,
    };
  }, [
    gradientInstanceId,
    gradientLegendEnabled,
    legendStops,
    padding.left,
    padding.right,
    padding.top,
    plotWidth,
    plotHeight,
    boxWidth,
    xAxisBand,
    gradientLegend?.align,
    gradientLegend?.label,
    legend?.align,
  ]);

  return (
    <ChartContainer
      {...rest}
      width={boxWidth}
      height={boxHeight}
      style={style}
      interactionConfig={{
        multiTooltip,
        // tooltip.show === false hides the shared tooltip (liveTooltip gates it).
        liveTooltip: tooltipShow === false ? false : liveTooltip,
        enableCrosshair,
      }}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}
      {grid && plotWidth > 0 && plotHeight > 0 && (
        <ChartGrid
          grid={grid}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          xTicks={normalizedXTicks}
          yTicks={normalizedYTicks}
          padding={padding}
          useSVG={true}
        />
      )}
      <Svg width={boxWidth} height={boxHeight} style={{ position: 'absolute' }}>
        <G x={padding.left} y={padding.top}>
          {hoverCell && hoverOverlay.showColumn && columnHighlight && (
            <SvgRect
              x={columnHighlight.x}
              y={0}
              width={columnHighlight.width}
              height={plotHeight}
              fill={hoverOverlay.columnFill}
              opacity={hoverOverlay.columnOpacity}
              pointerEvents="none"
            />
          )}
          {hoverCell && hoverOverlay.showRow && rowHighlight && (
            <SvgRect
              x={0}
              y={rowHighlight.y}
              width={plotWidth}
              height={rowHighlight.height}
              fill={hoverOverlay.rowFill}
              opacity={hoverOverlay.rowOpacity}
              pointerEvents="none"
            />
          )}
          {processedCells.map((cellData, index) => (
            <AnimatedHeatmapCell
              key={`${cellData.x}-${cellData.y}`}
              cell={cellData}
              isHovered={Boolean(hoverCell && hoverCell.x === cellData.x && hoverCell.y === cellData.y)}
              index={index}
              totalCells={processedCells.length}
              disabled={animationDisabled}
              cornerRadius={cellCornerRadius}
              showText={cellData.showLabel}
            />
          ))}
        </G>
      </Svg>
      {xAxis?.show !== false && plotWidth > 0 && (
        <Axis
          scale={axisScaleX}
          orientation="bottom"
          length={plotWidth}
          offset={{ x: padding.left, y: padding.top + plotHeight }}
          tickCount={axisXTicks.length}
          tickSize={xAxis?.tickLength ?? 4}
          tickPadding={4}
          tickFormat={(value) => formatXTick(typeof value === 'number' ? value : Number(value))}
          showLabels={xAxis?.showLabels !== false}
          showTicks={xAxis?.showTicks !== false}
          stroke={xAxis?.color || theme.colors.grid}
          strokeWidth={xAxis?.thickness ?? 1}
          label={xAxis?.title}
          labelOffset={X_TITLE_OFFSET}
          labelWidth={Math.max(100, Math.min(plotWidth, 260))}
          tickLabelColor={xAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={xAxis?.labelFontSize}
          labelColor={xAxis?.titleColor || theme.colors.textPrimary}
          labelFontSize={xAxis?.titleFontSize}
        />
      )}

      {yAxis?.show !== false && plotHeight > 0 && (
        <Axis
          scale={axisScaleY}
          orientation="left"
          length={plotHeight}
          offset={{ x: padding.left, y: padding.top }}
          tickCount={axisYTicks.length}
          tickSize={yAxis?.tickLength ?? 4}
          tickPadding={4}
          tickFormat={(value) => formatYTick(typeof value === 'number' ? value : Number(value))}
          showLabels={yAxis?.showLabels !== false}
          showTicks={yAxis?.showTicks !== false}
          stroke={yAxis?.color || theme.colors.grid}
          strokeWidth={yAxis?.thickness ?? 1}
          label={yAxis?.title}
          labelOffset={yAxis?.title ? (yAxis?.titleFontSize ?? 12) + 20 : 30}
          labelWidth={Math.max(100, Math.min(plotHeight, 260))}
          tickLabelColor={yAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={yTickLabelFontSize}
          tickLabelWidth={yTickLabelWidth}
          labelColor={yAxis?.titleColor || theme.colors.textPrimary}
          labelFontSize={yAxis?.titleFontSize}
          style={{ width: padding.left, height: plotHeight }}
        />
      )}

      {/* Gradient color-scale legend: min→max swatch bar with value labels. */}
      {legendLayout && (
        <Svg width={boxWidth} height={boxHeight} style={{ position: 'absolute' }} pointerEvents="none">
          <Defs>
            <LinearGradient id={legendLayout.gradId} x1="0" y1="0" x2="1" y2="0">
              {legendLayout.gradientStops.map((stop, index) => (
                <Stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity={1} />
              ))}
            </LinearGradient>
          </Defs>
          {legendLayout.label ? (
            <SvgText
              x={legendLayout.x}
              y={legendLayout.barY - 4}
              fontSize={11}
              fill={theme.colors.textSecondary}
              textAnchor="start"
              fontFamily="System"
            >
              {legendLayout.label}
            </SvgText>
          ) : null}
          <SvgRect
            x={legendLayout.x}
            y={legendLayout.barY}
            width={legendLayout.barWidth}
            height={legendBarThickness}
            rx={2}
            fill={`url(#${legendLayout.gradId})`}
          />
          <SvgText
            x={legendLayout.x}
            y={legendLayout.barY + legendBarThickness + 12}
            fontSize={10}
            fill={theme.colors.textSecondary}
            textAnchor="start"
            fontFamily="System"
          >
            {formatLegendValue(legendLayout.minValue, 0)}
          </SvgText>
          <SvgText
            x={legendLayout.x + legendLayout.barWidth / 2}
            y={legendLayout.barY + legendBarThickness + 12}
            fontSize={10}
            fill={theme.colors.textSecondary}
            textAnchor="middle"
            fontFamily="System"
          >
            {formatLegendValue((legendLayout.minValue + legendLayout.maxValue) / 2, 0.5)}
          </SvgText>
          <SvgText
            x={legendLayout.x + legendLayout.barWidth}
            y={legendLayout.barY + legendBarThickness + 12}
            fontSize={10}
            fill={theme.colors.textSecondary}
            textAnchor="end"
            fontFamily="System"
          >
            {formatLegendValue(legendLayout.maxValue, 1)}
          </SvgText>
        </Svg>
      )}

      {/* Gesture surface driven by useChartPointer + the cell hit-tester. Full-chart
          overlay so pointer coords are container-origin, matching the cell rects;
          feeds the pointer (for the row/column highlight) + the tooltip. */}
      {Boolean(interaction) && totalCells > 0 && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="heatmap-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width: boxWidth, height: boxHeight }}
          {...pointerHandlers}
        />
      )}
    </ChartContainer>
  );
};

HeatmapChart.displayName = 'HeatmapChart';

export default HeatmapChart;
