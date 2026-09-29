import React, { useMemo } from 'react';
import { ComboChart } from '../ComboChart';
import type { ParetoChartProps, ParetoChartDatum } from './types';
import { getColorFromScheme } from '../../utils';
import { useChartTheme } from '../../theme/ChartThemeContext';

const PERCENT_AXIS_FORMATTER = (value: number) => `${value.toFixed(0)}%`;

const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) return '0%';
  const clamped = Math.max(0, Math.min(1, value));
  const precision = clamped >= 0.995 ? 0 : clamped >= 0.095 ? 1 : 2;
  return `${(clamped * 100).toFixed(precision)}%`;
};

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return String(value);
  return value.toLocaleString();
};

const sanitizeData = (data: ParetoChartDatum[]) => {
  return data
    .filter((item) => item && Number.isFinite(item.value))
    .map((item) => ({
      label: item.label,
      value: Math.max(0, Number(item.value) || 0),
      color: item.color,
    }));
};

export const ParetoChart: React.FC<ParetoChartProps> = (props) => {
  const {
    data,
    sortDirection = 'desc',
    valueSeriesLabel = 'Frequency',
    cumulativeSeriesLabel = 'Cumulative %',
    barColor,
    lineColor,
    categoryLabelFormatter,
    xAxis,
    yAxis,
    yAxisRight,
    legend,
    grid,
    enableCrosshair,
    multiTooltip,
    liveTooltip,
    w: width = 640,
    h: height = 360,
    title,
    subtitle,
    ...rest
  } = props;

  const theme = useChartTheme();

  const cleaned = useMemo(() => sanitizeData(data), [data]);

  const ordered = useMemo(() => {
    if (sortDirection === 'none') {
      return cleaned;
    }
    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...cleaned].sort((a, b) => direction * (a.value - b.value));
  }, [cleaned, sortDirection]);

  const categories = useMemo(() => ordered.map((item) => item.label), [ordered]);
  const indices = useMemo(() => ordered.map((_, index) => index + 1), [ordered]);

  const totalValue = useMemo(() => ordered.reduce((acc, item) => acc + Math.max(0, item.value), 0), [ordered]);
  const total = totalValue > 0 ? totalValue : 1;

  const palette = theme.colors.accentPalette;
  const baseBarColor = barColor ?? ordered[0]?.color ?? getColorFromScheme(0, palette);
  const baseLineColor = lineColor ?? getColorFromScheme(1, palette);

  const barColors = useMemo(() => {
    if (barColor) {
      return ordered.map(() => barColor);
    }
    return ordered.map((item, index) => item.color ?? palette[index % palette.length] ?? baseBarColor);
  }, [ordered, palette, barColor, baseBarColor]);

  const barSeries = useMemo(() => {
    return ordered.map((item, index) => {
      const value = item.value;
      const shareOfTotal = total > 0 ? value / total : 0;
      const color = barColors[index] ?? baseBarColor;
      return {
        x: indices[index],
        y: value,
        color,
        meta: {
          label: item.label,
          value,
          formattedValue: `${formatNumber(value)} · ${formatPercent(shareOfTotal)}`,
          shareOfTotal,
          formattedShareOfTotal: formatPercent(shareOfTotal),
          rank: index + 1,
          color,
          raw: item,
          customTooltip: `${formatNumber(value)} · ${formatPercent(shareOfTotal)} of total`,
          },
      };
    });
  }, [ordered, indices, total, barColors, baseBarColor]);

  const lineSeries = useMemo(() => {
    let running = 0;
    return ordered.map((item, index) => {
      running += Math.max(0, item.value);
      const percent = (running / total) * 100;
      return {
        x: indices[index],
        y: percent,
        meta: {
          label: cumulativeSeriesLabel,
          category: item.label,
          cumulativeValue: running,
          formattedCumulativeValue: formatNumber(running),
          value: percent / 100,
          formattedValue: formatPercent(percent / 100),
          rank: index + 1,
          color: baseLineColor,
          raw: item,
          customTooltip: `${formatPercent(percent / 100)} cumulative (${formatNumber(running)} of ${formatNumber(totalValue)})`,
          },
      };
    });
  }, [ordered, indices, total, totalValue, cumulativeSeriesLabel, baseLineColor]);

  const layers = useMemo(() => {
    return [
      {
        type: 'bar' as const,
        id: 'pareto-bar',
        name: valueSeriesLabel,
        data: barSeries.map((point) => ({
          x: point.x,
          y: point.y,
          color: point.color ?? baseBarColor,
          meta: point.meta,
        })),
        color: baseBarColor,
        opacity: 0.9,
      },
      {
        type: 'line' as const,
        id: 'pareto-line',
        name: cumulativeSeriesLabel,
        targetAxis: 'right' as const,
        data: lineSeries.map((point) => ({
          x: point.x,
          y: point.y,
          meta: point.meta,
        })),
        color: baseLineColor,
        thickness: 3,
        showPoints: true,
        pointSize: 6,
      },
    ];
  }, [barSeries, lineSeries, baseBarColor, baseLineColor, valueSeriesLabel, cumulativeSeriesLabel]);

  const defaultXAxis = useMemo(() => ({
    show: true,
    showTicks: true,
    showLabels: true,
    ticks: indices,
    labelFormatter: (value: number) => {
      const index = Math.round(value) - 1;
      const category = categories[index];
      if (category == null) return '';
      return categoryLabelFormatter ? categoryLabelFormatter(category, index) : category;
    },
  }), [indices, categories, categoryLabelFormatter]);

  const defaultYAxis = useMemo(() => ({
    show: true,
    showTicks: true,
    showLabels: true,
    title: valueSeriesLabel,
  }), [valueSeriesLabel]);

  const defaultYAxisRight = useMemo(() => ({
    show: true,
    showTicks: true,
    showLabels: true,
    title: cumulativeSeriesLabel,
    labelFormatter: PERCENT_AXIS_FORMATTER,
  }), [cumulativeSeriesLabel]);

  const resolvedXAxis = {
    ...defaultXAxis,
    ...(xAxis ?? {}),
    ticks: xAxis?.ticks ?? defaultXAxis.ticks,
    labelFormatter: xAxis?.labelFormatter ?? defaultXAxis.labelFormatter,
  };

  const resolvedYAxis = {
    ...defaultYAxis,
    ...(yAxis ?? {}),
    title: yAxis?.title ?? defaultYAxis.title,
  };

  const resolvedYAxisRight = {
    ...defaultYAxisRight,
    ...(yAxisRight ?? {}),
    title: yAxisRight?.title ?? defaultYAxisRight.title,
    labelFormatter: yAxisRight?.labelFormatter ?? defaultYAxisRight.labelFormatter,
  };

  const resolvedLegend = legend ?? { show: true, position: 'bottom', align: 'center' };

  return (
    <ComboChart
      {...rest}
      w={width}
      h={height}
      title={title}
      subtitle={subtitle}
      layers={layers}
      xAxis={resolvedXAxis}
      yAxis={resolvedYAxis}
      yAxisRight={resolvedYAxisRight}
      legend={resolvedLegend}
      grid={grid}
      enableCrosshair={enableCrosshair ?? true}
      multiTooltip={multiTooltip ?? true}
      liveTooltip={liveTooltip ?? false}
    />
  );
};

ParetoChart.displayName = 'ParetoChart';
