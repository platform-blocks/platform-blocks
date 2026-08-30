import React from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import {
  ViolinChartProps,
  ViolinStatsMarkersConfig,
  ViolinDensitySeries,
  ViolinDensityPoint,
  ViolinSeriesInteractionEvent,
  ViolinSeriesStats,
} from './types';
import { ChartContainer, ChartTitle, ChartLegend , withChartBandPadding } from '../../ChartBase';
import { resolveCartesianPadding, domainTickLabels } from '../../core/axisLayout';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { kde, normalizeDensity } from '../../utils/density';
import { getColorFromScheme, colorSchemes, formatNumber } from '../../utils';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { BandCategoryHitTester } from '../../core/hittest/band';
import type { HitSeries, Mark, ActiveTarget } from '../../core/hittest/types';
import { AnimatedViolinShape } from './AnimatedViolinShape';
import { linearScale as createLinearScale } from '../../utils/scales';
import type { Scale } from '../../utils/scales';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toFixed = (value: number, precision = 2) => {
  if (!Number.isFinite(value)) return '0';
  return value.toFixed(precision);
};

const computeQuantile = (sorted: number[], q: number) => {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
};

const computeMean = (values: number[]) => {
  if (!values.length) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

const computeStdDev = (values: number[]) => {
  if (values.length <= 1) return 0;
  const mean = computeMean(values);
  const variance = values.reduce((acc, val) => {
    const diff = val - mean;
    return acc + diff * diff;
  }, 0) / (values.length - 1);
  return Math.sqrt(Math.max(variance, 0));
};

const computeAdaptiveBandwidthValue = (values: number[], method: 'scott' | 'silverman') => {
  if (values.length <= 1) return 0;
  const stdDev = computeStdDev(values);
  if (stdDev <= 0) return 0;
  const n = values.length;
  if (method === 'scott') {
    return stdDev * Math.pow(n, -1 / 5);
  }
  return 1.06 * stdDev * Math.pow(n, -1 / 5);
};

const resolveSeriesBandwidth = (
  series: ViolinDensitySeries,
  values: number[],
  fallback: number | undefined,
  min: number,
  max: number
) => {
  if (typeof series.bandwidth === 'number' && Number.isFinite(series.bandwidth) && series.bandwidth > 0) {
    return series.bandwidth;
  }
  if (series.adaptiveBandwidth && values.length > 1) {
    const adaptive = computeAdaptiveBandwidthValue(values, series.adaptiveBandwidth);
    if (adaptive > 0) return adaptive;
  }
  if (typeof fallback === 'number' && Number.isFinite(fallback) && fallback > 0) {
    return fallback;
  }
  const span = Math.max(1e-3, max - min);
  return span / 12;
};

const computeSeriesStats = (values: number[]): ViolinSeriesStats => {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: computeMean(values),
    median: computeQuantile(sorted, 0.5),
    q1: computeQuantile(sorted, 0.25),
    q3: computeQuantile(sorted, 0.75),
    p10: computeQuantile(sorted, 0.1),
    p90: computeQuantile(sorted, 0.9),
  };
};

const statsMarkersEnabled = (config?: ViolinStatsMarkersConfig) => {
  if (!config) return false;
  if (config.enabled) return true;
  return Boolean(config.showMedian || config.showQuartiles || config.showMean || config.showWhiskers);
};

// ViolinChart: mirrored density for each series (vertical violins side by side)
export const ViolinChart: React.FC<ViolinChartProps> = ({
  width = 400,
  height = 300,
  series,
  title,
  subtitle,
  style,
  samples = 64,
  bandwidth,
  violinWidthRatio,
  layout = 'vertical',
  stackOverlap = 0,
  xAxis,
  yAxis,
  grid,
  statsMarkers,
  valueBands,
  showLegend = false,
  legendPosition = 'bottom',
  legend,
  onSeriesFocus,
  onSeriesBlur,
  onSeriesPress,
}) => {
  const theme = useChartTheme();
  // Violins fill the top of the plot (unlike bars, which grow from the baseline), so the
  // title/subtitle need reserved headroom or they crowd/overlap the violin tops. Reserve
  // extra top space when a title/subtitle is present so the plot drops clear below them.
  const topReserve = subtitle ? 76 : title ? 56 : 40;
  const isHorizontal = layout === 'horizontal';
  const basePadding = React.useMemo(() => {
    const names = series.map((entry, index) => entry.name || `Series ${index + 1}`);
    let min = Infinity;
    let max = -Infinity;
    series.forEach((entry) => (entry.values ?? []).forEach((value: number) => {
      if (value < min) min = value;
      if (value > max) max = value;
    }));
    const values = Number.isFinite(min) && Number.isFinite(max)
      ? domainTickLabels([min, max], (value) => formatNumber(value))
      : [];
    const measured = resolveCartesianPadding({
      // Categories run along whichever axis the violins are not measured on.
      yTickLabels: isHorizontal ? names : values,
      xTickLabels: isHorizontal ? values : names,
      yTitle: yAxis?.title,
      xTitle: xAxis?.title,
      showYAxis: yAxis?.show !== false,
      showXAxis: xAxis?.show !== false,
      showYTickLabels: yAxis?.showLabels !== false,
      showXTickLabels: xAxis?.showLabels !== false,
      containerWidth: width,
      containerHeight: height,
    });
    // Violins fill the top of the plot (unlike bars, which grow from the
    // baseline), so the title/subtitle need reserved headroom of their own.
    return { ...measured, top: Math.max(measured.top, topReserve) };
  }, [series, isHorizontal, yAxis?.title, xAxis?.title, yAxis?.show, xAxis?.show,
      yAxis?.showLabels, xAxis?.showLabels, width, height, topReserve]);
  const resolvedLegend = React.useMemo(() => {
    if (legend) return legend;
    if (!showLegend) return undefined;
    return {
      show: true,
      position: legendPosition,
      align: 'center' as const,
    };
  }, [legend, showLegend, legendPosition]);

  // Grown so the plot clears the title and legend overlays.
  const legendLabels = React.useMemo(
    () => series.map((s, i) => ({ label: s.name || `Series ${i + 1}` })),
    [series]
  );
  const padding = React.useMemo(
    () =>
      withChartBandPadding(basePadding, {
        title,
        subtitle,
        legendItems: resolvedLegend?.show ? legendLabels : undefined,
        legendPosition: resolvedLegend?.position,
        legendFontSize: (resolvedLegend as { fontSize?: number } | undefined)?.fontSize,
        containerWidth: width,
      }),
    [basePadding.left, basePadding.top, title, subtitle, resolvedLegend?.show, resolvedLegend?.position, legendLabels, width]
  );
  const plotWidth = Math.max(0, width - padding.left - padding.right);
  const plotHeight = Math.max(0, height - padding.top - padding.bottom);
  const seriesCount = series.length;
  const safeSeriesCount = Math.max(seriesCount, 1);
  const defaultScheme = colorSchemes.default;
  const widthRatio = clamp(violinWidthRatio ?? 0.9, 0.2, 1);
  const showStatsMarkers = statsMarkersEnabled(statsMarkers);
  const overlap = clamp(stackOverlap ?? 0, 0, series.length > 1 ? 0.95 : 0);
  const categoryAxisLength = isHorizontal ? plotHeight : plotWidth;
  const valueAxisLength = isHorizontal ? plotWidth : plotHeight;
  
  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try { 
    interaction = useChartInteractionContext(); 
  } catch {
    console.warn('ViolinChart: useChartInteractionContext failed, ensure it is rendered inside a ChartInteractionProvider');
  }
  const register = interaction?.register;

  const allValues = React.useMemo(() => series.flatMap((s) => s.values), [series]);
  const { min: minValue, max: maxValue } = React.useMemo(() => {
    if (!allValues.length) {
      return { min: 0, max: 1 };
    }
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    if (min === max) {
      const delta = Math.max(1, Math.abs(min) * 0.1);
      return { min: min - delta, max: max + delta };
    }
    return { min, max };
  }, [allValues]);

  const min = minValue;
  const max = maxValue;

  const densData = React.useMemo(
    () =>
      series.map((s, i) => {
        const rawValues = Array.isArray(s.values) ? s.values : [];
        const values = rawValues.filter((value) => Number.isFinite(value)) as number[];
        const baseColor = s.color || getColorFromScheme(i, defaultScheme);
        const resolvedBandwidth = resolveSeriesBandwidth(s, values, bandwidth, min, max);
        const densityDomain: [number, number] = [min, max];
        const computedDensity = Array.isArray(s.preparedDensity) && s.preparedDensity.length
          ? s.preparedDensity
          : values.length
            ? normalizeDensity(
                kde(values, densityDomain, { bandwidth: resolvedBandwidth, samples })
              )
            : [];
        const visible = s.visible !== false && (values.length > 0 || computedDensity.length > 0);

        return {
          id: s.id ?? i,
          dens: computedDensity,
          color: baseColor,
          name: s.name || `Series ${i + 1}`,
          visible,
          fillOpacity: typeof s.fillOpacity === 'number' ? clamp(s.fillOpacity, 0, 1) : 0.35,
          strokeColor: s.strokeColor || baseColor,
          strokeWidth: typeof s.strokeWidth === 'number' ? s.strokeWidth : 1,
          stats: values.length ? computeSeriesStats(values) : null,
          source: s,
          values,
        };
      }),
    [bandwidth, defaultScheme, max, min, samples, series]
  );

  const categorySpacing = React.useMemo(() => {
    if (categoryAxisLength <= 0) return 0;
    if (seriesCount <= 1) {
      return categoryAxisLength;
    }
    const base = categoryAxisLength / safeSeriesCount;
    return Math.max(1, base * (1 - overlap));
  }, [categoryAxisLength, overlap, safeSeriesCount, seriesCount]);

  const categoryBandwidth = Math.max(1, categorySpacing * widthRatio);

  const categoryCenters = React.useMemo(() => {
    if (categoryAxisLength <= 0 || seriesCount === 0) return [];
    if (seriesCount === 1) {
      return [categoryAxisLength / 2];
    }
    const spacing = categorySpacing;
    const totalSpan = spacing * (seriesCount - 1);
    const start = (categoryAxisLength - totalSpan) / 2;
    return series.map((_, index) => start + spacing * index);
  }, [categoryAxisLength, categorySpacing, series, seriesCount]);

  const categoryDomain = React.useMemo(
    () => series.map((s, i) => s.name || `Series ${i + 1}`),
    [series]
  );

  const categoryScale = React.useMemo<Scale<string>>(() => {
    const domain = categoryDomain;
    const centers = categoryCenters;
    const axisLength = categoryAxisLength;
    const indexMap = new Map(domain.map((label, idx) => [label, idx] as const));
    const scale = ((value: string | number) => {
      if (typeof value === 'number') {
        return centers[value] ?? (centers[0] ?? 0);
      }
      const idx = indexMap.get(value);
      return idx != null ? centers[idx] ?? 0 : 0;
    }) as Scale<string>;
    scale.domain = () => domain.slice();
    scale.range = () => [0, axisLength];
    scale.ticks = () => domain.slice();
    scale.bandwidth = () => categoryBandwidth;
    return scale;
  }, [categoryBandwidth, categoryCenters, categoryDomain, categoryAxisLength]);

  const valueAxisConfig = isHorizontal ? xAxis : yAxis;

  const valueScale = React.useMemo(() => {
    const range: [number, number] = isHorizontal ? [0, valueAxisLength] : [valueAxisLength, 0];
    const scale = createLinearScale([min, max], range);
    if (valueAxisConfig?.ticks && valueAxisConfig.ticks.length) {
      const fixedTicks = valueAxisConfig.ticks.slice();
      scale.ticks = () => fixedTicks;
    }
    return scale;
  }, [isHorizontal, min, max, valueAxisConfig?.ticks, valueAxisLength]);

  const valueTicks = React.useMemo(() => {
    if (typeof valueScale.ticks === 'function') {
      const tickTarget = Math.min(6, Math.max(3, Math.floor(valueAxisLength / 60)));
      return valueScale.ticks(tickTarget);
    }
    return [];
  }, [valueAxisLength, valueScale]);

  const normalizedCategoryTicks = React.useMemo(() => {
    if (categoryAxisLength <= 0 || !categoryCenters.length) return [];
    const denominator = Math.max(1, categoryAxisLength);
    return categoryCenters
      .map((center) => {
        if (!Number.isFinite(center)) return null;
        const ratio = center / denominator;
        return isHorizontal ? clamp(1 - ratio, 0, 1) : clamp(ratio, 0, 1);
      })
      .filter((value): value is number => value != null && Number.isFinite(value));
  }, [categoryAxisLength, categoryCenters, isHorizontal]);

  const normalizedValueTicks = React.useMemo(() => {
    if (valueAxisLength <= 0) return [];
    const denominator = Math.max(1, valueAxisLength);
    return valueTicks
      .map((tick) => {
        const coord = valueScale(tick);
        if (!Number.isFinite(coord)) return null;
        const ratio = coord / denominator;
        return isHorizontal ? clamp(ratio, 0, 1) : clamp(1 - ratio, 0, 1);
      })
      .filter((value): value is number => value != null && Number.isFinite(value));
  }, [isHorizontal, valueAxisLength, valueScale, valueTicks]);

  const gridXTicks = isHorizontal ? normalizedValueTicks : normalizedCategoryTicks;
  const gridYTicks = isHorizontal ? normalizedCategoryTicks : normalizedValueTicks;

  const axisScaleX = React.useMemo<Scale<any>>(
    () => (isHorizontal ? (valueScale as Scale<any>) : (categoryScale as Scale<any>)),
    [categoryScale, isHorizontal, valueScale]
  );

  const axisScaleY = React.useMemo<Scale<any>>(
    () => (isHorizontal ? (categoryScale as Scale<any>) : (valueScale as Scale<any>)),
    [categoryScale, isHorizontal, valueScale]
  );

  const axisTickCountX = React.useMemo(() => {
    if (isHorizontal) {
      if (valueAxisConfig?.ticks && valueAxisConfig.ticks.length) {
        return valueAxisConfig.ticks.length;
      }
      return Math.max(3, Math.floor(Math.max(1, valueAxisLength) / 60));
    }
    return categoryDomain.length || safeSeriesCount;
  }, [categoryDomain, isHorizontal, safeSeriesCount, valueAxisConfig?.ticks, valueAxisLength]);

  const axisTickCountY = React.useMemo(() => {
    if (isHorizontal) {
      return categoryDomain.length || safeSeriesCount;
    }
    if (valueAxisConfig?.ticks && valueAxisConfig.ticks.length) {
      return valueAxisConfig.ticks.length;
    }
    return Math.max(3, Math.floor(Math.max(1, valueAxisLength) / 60));
  }, [categoryDomain, isHorizontal, safeSeriesCount, valueAxisConfig?.ticks, valueAxisLength]);

  const violinPath = React.useCallback(
    (density: { x: number; y: number }[], index: number) => {
      if (!density.length) return '';
      const center = categoryCenters[index] ?? 0;
      const halfThickness = Math.max(1, categoryBandwidth / 2);
      const commands: string[] = [];
      if (isHorizontal) {
        density.forEach((point, idx) => {
          const x = valueScale(point.x);
          const y = center - point.y * halfThickness;
          commands.push(`${idx === 0 ? 'M' : 'L'} ${x} ${y}`);
        });
        for (let i = density.length - 1; i >= 0; i -= 1) {
          const point = density[i];
          const x = valueScale(point.x);
          const y = center + point.y * halfThickness;
          commands.push(`L ${x} ${y}`);
        }
      } else {
        density.forEach((point, idx) => {
          const x = center + point.y * halfThickness;
          const y = valueScale(point.x);
          commands.push(`${idx === 0 ? 'M' : 'L'} ${x} ${y}`);
        });
        for (let i = density.length - 1; i >= 0; i -= 1) {
          const point = density[i];
          const x = center - point.y * halfThickness;
          const y = valueScale(point.x);
          commands.push(`L ${x} ${y}`);
        }
      }
      commands.push('Z');
      return commands.join(' ');
    },
    [categoryBandwidth, categoryCenters, isHorizontal, valueScale]
  );

  // Prepare registration data for series interaction
  const registrationData = React.useMemo(() => {
    return densData.map((v, i) => ({
      id: `violin-${v.id}`,
      name: v.name || `Series ${i + 1}`,
      color: v.color,
      visible: v.visible,
      densityData: v.dens.map((p, j) => ({
        x: p.x,
        y: p.y,
        categoryIndex: i,
        originalValue: p.x,
      })),
    }));
  }, [densData]);

  // New interaction engine (band-summary): each violin is one band mark spanning its
  // category slot. The band tester (orientation follows the category axis) resolves
  // which violin the pointer is over; the tooltip shows that distribution's summary.
  const hitSeries: HitSeries[] = React.useMemo(() => {
    const marks: Mark[] = [];
    densData.forEach((v, i) => {
      if (v.visible === false) return;
      const center = categoryCenters[i];
      if (center == null) return;
      const half = categoryBandwidth / 2;
      const median = v.stats?.median;
      const rect = isHorizontal
        ? { x: padding.left, y: center - half + padding.top, width: plotWidth, height: categoryBandwidth }
        : { x: center - half + padding.left, y: padding.top, width: categoryBandwidth, height: plotHeight };
      marks.push({
        id: i,
        pixel: isHorizontal
          ? { x: padding.left + plotWidth / 2, y: center + padding.top }
          : { x: center + padding.left, y: padding.top + plotHeight / 2 },
        value: median ?? 0,
        datum: v,
        label: String(v.name ?? `Violin ${i + 1}`),
        color: v.color,
        extent: { rect, cell: { row: 0, col: i } },
        formattedValue: median != null ? formatNumber(median) : undefined,
      });
    });
    return [{ id: 'violin', name: 'Violin', color: theme.colors.accentPalette?.[0], visible: true, marks }];
  }, [densData, categoryCenters, categoryBandwidth, isHorizontal, padding.left, padding.top, plotWidth, plotHeight, theme.colors.accentPalette]);

  const tester = React.useMemo(
    () => new BandCategoryHitTester(hitSeries, { orientation: isHorizontal ? 'y' : 'x' }),
    [hitSeries, isHorizontal]
  );

  React.useEffect(() => {
    if (!register) return;
    register('violin', { frame: { kind: 'cartesian' } as any, geometry: { kind: 'band', orientation: isHorizontal ? 'y' : 'x' }, series: hitSeries });
    return () => register('violin', null);
  }, [register, hitSeries, isHorizontal]);

  // Map a resolved pointer target back to the public series-interaction event.
  // The band tester resolves one mark per violin: mark.id is the series index and
  // mark.datum is the densData entry (carrying .source/.stats/.dens).
  const resolveSeriesEvent = React.useCallback(
    (target: ActiveTarget | null): ViolinSeriesInteractionEvent | null => {
      if (!target) return null;
      const v = target.datum as (typeof densData)[number] | undefined;
      if (!v || !v.source) return null;
      const seriesIndex = typeof target.markId === 'number' ? target.markId : densData.indexOf(v);
      return {
        series: v.source,
        seriesIndex,
        stats: v.stats,
        density: v.dens as ViolinDensityPoint[],
      };
    },
    [densData]
  );

  // Tracks the series the pointer last resolved to, so focus fires once per new
  // series and blur fires for the series we leave (on move-away or pointer leave).
  const lastFocusedRef = React.useRef<{ index: number; event: ViolinSeriesInteractionEvent } | null>(null);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding,
    plotWidth,
    plotHeight,
    enabled: Boolean(interaction),
    hover: true,
    press: Boolean(onSeriesPress),
    tester,
    onPointer: (_e, target) => {
      const event = resolveSeriesEvent(target);
      const nextIndex = event ? event.seriesIndex : null;
      const prev = lastFocusedRef.current;
      if (nextIndex === (prev?.index ?? null)) return;
      if (prev) onSeriesBlur?.(prev.event);
      lastFocusedRef.current = event ? { index: event.seriesIndex, event } : null;
      if (event) onSeriesFocus?.(event);
    },
    onLeave: () => {
      const prev = lastFocusedRef.current;
      if (!prev) return;
      lastFocusedRef.current = null;
      onSeriesBlur?.(prev.event);
    },
    onPress: (_e, target) => {
      const event = resolveSeriesEvent(target);
      if (event) onSeriesPress?.(event);
    },
  });

  return (
    <ChartContainer 
      width={width} 
      height={height} 
      style={style} 
      interactionConfig={{ multiTooltip: true, enableCrosshair: true }}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

      {resolvedLegend?.show && (
        <ChartLegend
          items={densData.map((v) => ({
            label: v.name,
            color: v.color,
            visible: v.visible,
          }))}
          position={resolvedLegend.position}
          align={resolvedLegend.align}
        />
      )}

      {grid && plotWidth > 0 && plotHeight > 0 && (
        <ChartGrid
          grid={grid}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          xTicks={gridXTicks}
          yTicks={gridYTicks}
          padding={padding}
          useSVG={true}
        />
      )}
      
      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute' }}
      >
        <G x={padding.left} y={padding.top}>
          {Array.isArray(valueBands) &&
            valueBands.map((band, bandIndex) => {
              if (typeof band?.from !== 'number' || typeof band?.to !== 'number') {
                return null;
              }
              const fromCoord = valueScale(Number(band.from));
              const toCoord = valueScale(Number(band.to));
              const bandColor = band.color || theme.colors.grid;
              const bandOpacity = clamp(band.opacity ?? 0.18, 0, 1);
              const label = band.label;
              const labelColor = band.labelColor || theme.colors.textSecondary;

              if (isHorizontal) {
                const xStart = Math.min(fromCoord, toCoord);
                const bandWidth = Math.max(1, Math.abs(toCoord - fromCoord));
                const labelX =
                  band.labelPosition === 'left'
                    ? xStart + 6
                    : xStart + bandWidth - 6;
                const textAnchor = band.labelPosition === 'left' ? 'start' : 'end';
                const labelY = plotHeight / 2 + theme.fontSize.xs / 2;

                return (
                  <React.Fragment key={band.id ?? `band-${bandIndex}`}>
                    <Rect
                      x={xStart}
                      y={0}
                      width={bandWidth}
                      height={plotHeight}
                      fill={bandColor}
                      opacity={bandOpacity}
                    />
                    {label && bandWidth > theme.fontSize.xs + 6 && (
                      <SvgText
                        x={labelX}
                        y={labelY}
                        fill={labelColor}
                        fontSize={theme.fontSize.xs}
                        fontFamily={theme.fontFamily}
                        textAnchor={textAnchor}
                      >
                        {label}
                      </SvgText>
                    )}
                  </React.Fragment>
                );
              }

              const yStart = Math.min(fromCoord, toCoord);
              const bandHeight = Math.max(1, Math.abs(toCoord - fromCoord));
              const labelX = band.labelPosition === 'left' ? 8 : plotWidth - 8;
              const textAnchor = band.labelPosition === 'left' ? 'start' : 'end';
              const labelY = yStart + bandHeight / 2 + theme.fontSize.xs / 2;

              return (
                <React.Fragment key={band.id ?? `band-${bandIndex}`}>
                  <Rect
                    x={0}
                    y={yStart}
                    width={plotWidth}
                    height={bandHeight}
                    fill={bandColor}
                    opacity={bandOpacity}
                  />
                  {label && bandHeight > theme.fontSize.xs + 4 && (
                    <SvgText
                      x={labelX}
                      y={labelY}
                      fill={labelColor}
                      fontSize={theme.fontSize.xs}
                      fontFamily={theme.fontFamily}
                      textAnchor={textAnchor}
                    >
                      {label}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}

          {densData.map((v, i) => (
            v.visible ? (
              <AnimatedViolinShape
                key={v.id}
                path={violinPath(v.dens, i)}
                fill={v.color}
                fillOpacity={v.fillOpacity}
                stroke={v.strokeColor}
                strokeWidth={v.strokeWidth}
                index={i}
                totalViolins={densData.length}
              />
            ) : null
          ))}

          {showStatsMarkers &&
            densData.map((v, i) => {
              if (!v.visible) return null;
              const stats = v.stats;
              if (!stats) return null;

              const markerWidthRatio = clamp(statsMarkers?.markerWidthRatio ?? 0.85, 0.2, 1);
              const strokeWidth = statsMarkers?.strokeWidth ?? 2;
              const colors = statsMarkers?.colors ?? {};
              const labelOffset = statsMarkers?.labelOffset ?? 6;
              const categoryCenter = categoryCenters[i] ?? 0;
              const halfThickness = Math.max(2, (categoryBandwidth * markerWidthRatio) / 2);

              const formatLabel = (
                stat: 'median' | 'mean' | 'q1' | 'q3' | 'whisker-min' | 'whisker-max',
                value: number
              ) => {
                const formatted = toFixed(value, 2);
                if (!statsMarkers?.labelFormatter) return formatted;
                return statsMarkers.labelFormatter({
                  stat,
                  value,
                  series: v.source,
                  formattedValue: formatted,
                });
              };

              const createVerticalLabel = (
                stat: 'median' | 'mean' | 'q1' | 'q3' | 'whisker-min' | 'whisker-max',
                value: number,
                anchor: 'start' | 'end',
                yPosition: number,
                color: string
              ) => {
                if (!statsMarkers?.showLabels) return null;
                const content = formatLabel(stat, value);
                const xPosition =
                  anchor === 'start'
                    ? categoryCenter - halfThickness - labelOffset
                    : categoryCenter + halfThickness + labelOffset;
                return (
                  <SvgText
                    key={`${v.id}-${stat}-label`}
                    x={xPosition}
                    y={yPosition + theme.fontSize.xs / 2}
                    fill={color}
                    fontSize={theme.fontSize.xs}
                    fontFamily={theme.fontFamily}
                    textAnchor={anchor === 'start' ? 'end' : 'start'}
                  >
                    {content}
                  </SvgText>
                );
              };

              const createHorizontalLabel = (
                stat: 'median' | 'mean' | 'q1' | 'q3' | 'whisker-min' | 'whisker-max',
                value: number,
                position: 'top' | 'bottom',
                xPosition: number,
                color: string
              ) => {
                if (!statsMarkers?.showLabels) return null;
                const content = formatLabel(stat, value);
                const yBase =
                  position === 'top'
                    ? categoryCenter - halfThickness - labelOffset
                    : categoryCenter + halfThickness + labelOffset + theme.fontSize.xs;
                const y = position === 'top' ? yBase - theme.fontSize.xs * 0.25 : yBase;
                return (
                  <SvgText
                    key={`${v.id}-${stat}-label`}
                    x={xPosition}
                    y={y}
                    fill={color}
                    fontSize={theme.fontSize.xs}
                    fontFamily={theme.fontFamily}
                    textAnchor="middle"
                  >
                    {content}
                  </SvgText>
                );
              };

              const elements: React.ReactNode[] = [];

              if (isHorizontal) {
                const centerY = categoryCenter;
                const markerHalfHeight = halfThickness;

                if (statsMarkers?.showQuartiles) {
                  const xQ1 = valueScale(stats.q1);
                  const xQ3 = valueScale(stats.q3);
                  const quartileColor = colors.quartile || v.color;
                  const rectX = Math.min(xQ1, xQ3);
                  const rectWidth = Math.max(1, Math.abs(xQ3 - xQ1));
                  const rectY = centerY - markerHalfHeight;
                  const rectHeight = markerHalfHeight * 2;
                  elements.push(
                    <Rect
                      key={`${v.id}-iqr`}
                      x={rectX}
                      y={rectY}
                      width={rectWidth}
                      height={rectHeight}
                      fill={quartileColor}
                      opacity={0.18}
                    />
                  );

                  elements.push(
                    <Line
                      key={`${v.id}-q1`}
                      x1={xQ1}
                      x2={xQ1}
                      y1={centerY - markerHalfHeight}
                      y2={centerY + markerHalfHeight}
                      stroke={quartileColor}
                      strokeWidth={strokeWidth}
                    />
                  );
                  elements.push(
                    <Line
                      key={`${v.id}-q3`}
                      x1={xQ3}
                      x2={xQ3}
                      y1={centerY - markerHalfHeight}
                      y2={centerY + markerHalfHeight}
                      stroke={quartileColor}
                      strokeWidth={strokeWidth}
                    />
                  );

                  const labelColor = colors.quartile || theme.colors.textSecondary;
                  const midX = (Math.min(xQ1, xQ3) + Math.max(xQ1, xQ3)) / 2;
                  const labelQ1 = createHorizontalLabel('q1', stats.q1, 'top', xQ1, labelColor);
                  if (labelQ1) elements.push(labelQ1);
                  const labelQ3 = createHorizontalLabel('q3', stats.q3, 'bottom', xQ3, labelColor);
                  if (labelQ3) elements.push(labelQ3);
                  if (statsMarkers.showLabels) {
                    elements.push(
                      <SvgText
                        key={`${v.id}-iqr-label`}
                        x={midX}
                        y={centerY + theme.fontSize.xs / 2}
                        fill={labelColor}
                        fontSize={theme.fontSize.xs}
                        fontFamily={theme.fontFamily}
                        textAnchor="middle"
                      >
                        IQR
                      </SvgText>
                    );
                  }
                }

                if (statsMarkers?.showMedian) {
                  const xMedian = valueScale(stats.median);
                  const medianColor = colors.median || theme.colors.textPrimary;
                  elements.push(
                    <Line
                      key={`${v.id}-median`}
                      x1={xMedian}
                      x2={xMedian}
                      y1={centerY - markerHalfHeight}
                      y2={centerY + markerHalfHeight}
                      stroke={medianColor}
                      strokeWidth={strokeWidth + 0.5}
                    />
                  );
                  const label = createHorizontalLabel('median', stats.median, 'bottom', xMedian, medianColor);
                  if (label) elements.push(label);
                }

                if (statsMarkers?.showMean) {
                  const xMean = valueScale(stats.mean);
                  const meanColor = colors.mean || theme.colors.textSecondary;
                  elements.push(
                    <Line
                      key={`${v.id}-mean`}
                      x1={xMean}
                      x2={xMean}
                      y1={centerY - markerHalfHeight}
                      y2={centerY + markerHalfHeight}
                      stroke={meanColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray="4 4"
                    />
                  );
                  const label = createHorizontalLabel('mean', stats.mean, 'top', xMean, meanColor);
                  if (label) elements.push(label);
                }

                if (statsMarkers?.showWhiskers) {
                  const whiskerColor = colors.whisker || theme.colors.grid;
                  const xMin = valueScale(stats.min);
                  const xMax = valueScale(stats.max);
                  const crossbarHeight = markerHalfHeight * 0.6;
                  const whiskerStroke = Math.max(0.7, strokeWidth - 0.5);

                  elements.push(
                    <Line
                      key={`${v.id}-whisker-line`}
                      x1={Math.min(xMin, xMax)}
                      x2={Math.max(xMin, xMax)}
                      y1={centerY}
                      y2={centerY}
                      stroke={whiskerColor}
                      strokeWidth={whiskerStroke}
                    />
                  );
                  elements.push(
                    <Line
                      key={`${v.id}-whisker-min`}
                      x1={xMin}
                      x2={xMin}
                      y1={centerY - crossbarHeight / 2}
                      y2={centerY + crossbarHeight / 2}
                      stroke={whiskerColor}
                      strokeWidth={whiskerStroke}
                    />
                  );
                  elements.push(
                    <Line
                      key={`${v.id}-whisker-max`}
                      x1={xMax}
                      x2={xMax}
                      y1={centerY - crossbarHeight / 2}
                      y2={centerY + crossbarHeight / 2}
                      stroke={whiskerColor}
                      strokeWidth={whiskerStroke}
                    />
                  );

                  const minLabel = createHorizontalLabel('whisker-min', stats.min, 'top', xMin, whiskerColor);
                  if (minLabel) elements.push(minLabel);
                  const maxLabel = createHorizontalLabel('whisker-max', stats.max, 'bottom', xMax, whiskerColor);
                  if (maxLabel) elements.push(maxLabel);
                }
              } else {
                const centerX = categoryCenter;
                const markerHalfWidth = halfThickness;

                if (statsMarkers?.showQuartiles) {
                  const yQ1 = valueScale(stats.q1);
                  const yQ3 = valueScale(stats.q3);
                  const quartileColor = colors.quartile || v.color;
                  elements.push(
                    <Rect
                      key={`${v.id}-iqr`}
                      x={centerX - markerHalfWidth}
                      y={Math.min(yQ1, yQ3)}
                      width={markerHalfWidth * 2}
                      height={Math.max(1, Math.abs(yQ3 - yQ1))}
                      fill={quartileColor}
                      opacity={0.18}
                    />
                  );

                  elements.push(
                    <Line
                      key={`${v.id}-q1`}
                      x1={centerX - markerHalfWidth}
                      x2={centerX + markerHalfWidth}
                      y1={yQ1}
                      y2={yQ1}
                      stroke={quartileColor}
                      strokeWidth={strokeWidth}
                    />
                  );
                  elements.push(
                    <Line
                      key={`${v.id}-q3`}
                      x1={centerX - markerHalfWidth}
                      x2={centerX + markerHalfWidth}
                      y1={yQ3}
                      y2={yQ3}
                      stroke={quartileColor}
                      strokeWidth={strokeWidth}
                    />
                  );

                  const labelColor = colors.quartile || theme.colors.textSecondary;
                  const middle = (Math.min(yQ1, yQ3) + Math.max(yQ1, yQ3)) / 2;
                  const labelQ1 = createVerticalLabel('q1', stats.q1, 'start', yQ1, labelColor);
                  if (labelQ1) elements.push(labelQ1);
                  const labelQ3 = createVerticalLabel('q3', stats.q3, 'end', yQ3, labelColor);
                  if (labelQ3) elements.push(labelQ3);
                  if (statsMarkers.showLabels) {
                    elements.push(
                      <SvgText
                        key={`${v.id}-iqr-label`}
                        x={centerX}
                        y={middle + theme.fontSize.xs / 2}
                        fill={labelColor}
                        fontSize={theme.fontSize.xs}
                        fontFamily={theme.fontFamily}
                        textAnchor="middle"
                      >
                        IQR
                      </SvgText>
                    );
                  }
                }

                if (statsMarkers?.showMedian) {
                  const yMedian = valueScale(stats.median);
                  const medianColor = colors.median || theme.colors.textPrimary;
                  elements.push(
                    <Line
                      key={`${v.id}-median`}
                      x1={centerX - markerHalfWidth}
                      x2={centerX + markerHalfWidth}
                      y1={yMedian}
                      y2={yMedian}
                      stroke={medianColor}
                      strokeWidth={strokeWidth + 0.5}
                    />
                  );
                  const label = createVerticalLabel('median', stats.median, 'end', yMedian, medianColor);
                  if (label) elements.push(label);
                }

                if (statsMarkers?.showMean) {
                  const yMean = valueScale(stats.mean);
                  const meanColor = colors.mean || theme.colors.textSecondary;
                  elements.push(
                    <Line
                      key={`${v.id}-mean`}
                      x1={centerX - markerHalfWidth}
                      x2={centerX + markerHalfWidth}
                      y1={yMean}
                      y2={yMean}
                      stroke={meanColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray="4 4"
                    />
                  );
                  const label = createVerticalLabel('mean', stats.mean, 'start', yMean, meanColor);
                  if (label) elements.push(label);
                }

                if (statsMarkers?.showWhiskers) {
                  const whiskerColor = colors.whisker || theme.colors.grid;
                  const yMin = valueScale(stats.min);
                  const yMax = valueScale(stats.max);
                  const crossbarWidth = markerHalfWidth * 0.6;
                  const whiskerStroke = Math.max(0.7, strokeWidth - 0.5);

                  elements.push(
                    <Line
                      key={`${v.id}-whisker-line`}
                      x1={centerX}
                      x2={centerX}
                      y1={yMin}
                      y2={yMax}
                      stroke={whiskerColor}
                      strokeWidth={whiskerStroke}
                    />
                  );
                  elements.push(
                    <Line
                      key={`${v.id}-whisker-min`}
                      x1={centerX - crossbarWidth / 2}
                      x2={centerX + crossbarWidth / 2}
                      y1={yMin}
                      y2={yMin}
                      stroke={whiskerColor}
                      strokeWidth={whiskerStroke}
                    />
                  );
                  elements.push(
                    <Line
                      key={`${v.id}-whisker-max`}
                      x1={centerX - crossbarWidth / 2}
                      x2={centerX + crossbarWidth / 2}
                      y1={yMax}
                      y2={yMax}
                      stroke={whiskerColor}
                      strokeWidth={whiskerStroke}
                    />
                  );

                  const minLabel = createVerticalLabel('whisker-min', stats.min, 'start', yMin, whiskerColor);
                  if (minLabel) elements.push(minLabel);
                  const maxLabel = createVerticalLabel('whisker-max', stats.max, 'end', yMax, whiskerColor);
                  if (maxLabel) elements.push(maxLabel);
                }
              }

              return elements;
            })}
        </G>
      </Svg>
      
      {xAxis?.show !== false && plotWidth > 0 && (
        <Axis
          scale={axisScaleX}
          orientation="bottom"
          length={plotWidth}
          offset={{ x: padding.left, y: padding.top + plotHeight }}
          tickCount={axisTickCountX}
          tickLabelWidth={basePadding.xTickLabelWidth}
          tickLabelLines={basePadding.xTickLabelLines}
          tickSize={xAxis?.tickLength ?? 4}
          tickPadding={4}
          tickFormat={(value) => {
            if (xAxis?.labelFormatter) return xAxis.labelFormatter(value);
            if (isHorizontal && typeof value === 'number') {
              return formatNumber(value);
            }
            return String(value);
          }}
          showLabels={xAxis?.showLabels !== false}
          showTicks={xAxis?.showTicks !== false}
          stroke={xAxis?.color || theme.colors.grid}
          strokeWidth={xAxis?.thickness ?? 1}
          label={xAxis?.title}
          tickLabelColor={xAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={xAxis?.labelFontSize}
          labelColor={xAxis?.titleColor || theme.colors.textPrimary}
          labelFontSize={xAxis?.titleFontSize}
          style={{ width: plotWidth, height: padding.bottom }}
        />
      )}
      
      {yAxis?.show !== false && plotHeight > 0 && (
        <Axis
          scale={axisScaleY}
          orientation="left"
          length={plotHeight}
          offset={{ x: padding.left, y: padding.top }}
          tickCount={axisTickCountY}
          tickLabelWidth={basePadding.yTickLabelWidth}
          tickSize={yAxis?.tickLength ?? 4}
          tickPadding={4}
          tickFormat={(value) => {
            if (yAxis?.labelFormatter) return yAxis.labelFormatter(value);
            if (!isHorizontal && typeof value === 'number') {
              return formatNumber(value);
            }
            return String(value);
          }}
          showLabels={yAxis?.showLabels !== false}
          showTicks={yAxis?.showTicks !== false}
          stroke={yAxis?.color || theme.colors.grid}
          strokeWidth={yAxis?.thickness ?? 1}
          label={yAxis?.title}
          tickLabelColor={yAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={yAxis?.labelFontSize}
          labelColor={yAxis?.titleColor || theme.colors.textPrimary}
          labelFontSize={yAxis?.titleFontSize}
          style={{ width: padding.left, height: plotHeight }}
        />
      )}

      {/* Gesture surface driven by useChartPointer + the band hit-tester (category
          axis). Full-chart overlay; resolves which violin the pointer is over. */}
      {Boolean(interaction) && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="violin-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}
    </ChartContainer>
  );
};
ViolinChart.displayName = 'ViolinChart';
