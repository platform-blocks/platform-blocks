import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Path, G } from 'react-native-svg';
import { roundedBarPath } from '../../utils/barPath';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

import { HistogramChartProps, HistogramBin, HistogramBinSummary } from './types';
import { ChartContainer, ChartTitle, ChartLegend , withChartBandPadding } from '../../ChartBase';
import { resolveCartesianPadding, domainTickLabels } from '../../core/axisLayout';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { BandCategoryHitTester } from '../../core/hittest/band';
import type { HitSeries, Mark } from '../../core/hittest/types';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { Axis } from '../../core/Axis';
import { ChartGrid } from '../../core/ChartGrid';
import { linearScale, generateNiceTicks } from '../../utils/scales';
import type { Scale } from '../../utils/scales';
import { getColorFromScheme, colorSchemes } from '../../utils';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Gaussian kernel density estimation
function kernelDensityEstimator(values: number[], bandwidth: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (!n) return (x: number) => 0;
  
  const bw = bandwidth || (1.06 * std(sorted) * Math.pow(n, -1 / 5) || 1);
  
  return (x: number) => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const u = (x - sorted[i]) / bw;
      sum += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    }
    return sum / (n * bw);
  };
}

function std(arr: number[]) {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length);
}

// Custom hook for computing histogram bins
function useHistogramBins(
  data: number[], 
  binMethod: HistogramChartProps['binMethod'], 
  binsOverride?: number
): { bins: HistogramBin[]; min: number; max: number } {
  return useMemo(() => {
    const n = data.length;
    if (!n) return { bins: [], min: 0, max: 0 };
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    let k: number;
    if (binsOverride) {
      k = binsOverride;
    } else {
      switch (binMethod) {
        case 'sqrt':
          k = Math.ceil(Math.sqrt(n));
          break;
        case 'fd': {
          // Freedman–Diaconis rule
          const sorted = [...data].sort((a, b) => a - b);
          const q1 = sorted[Math.floor(0.25 * (n - 1))];
          const q3 = sorted[Math.floor(0.75 * (n - 1))];
          const iqr = q3 - q1 || (max - min);
          const h = 2 * iqr * Math.pow(n, -1 / 3);
          k = h ? Math.ceil((max - min) / h) : Math.ceil(Math.sqrt(n));
          break;
        }
        case 'sturges':
        default:
          k = Math.ceil(Math.log2(n) + 1);
      }
    }
    
    k = Math.max(1, k);
    const width = (max - min) / k || 1;
    const bins: HistogramBin[] = Array.from({ length: k }, (_, i) => ({
      start: min + i * width,
      end: min + (i + 1) * width,
      count: 0,
      density: 0,
    }));
    
    data.forEach(v => {
      const idx = Math.min(k - 1, Math.floor((v - min) / width));
      bins[idx].count++;
    });
    
    // Calculate density
    const total = data.length;
    bins.forEach(bin => {
      bin.density = total > 0 ? (bin.count / total) / (bin.end - bin.start) : 0;
    });
    
    return { bins, min, max };
  }, [data, binMethod, binsOverride]);
}

// Animated bar component for histogram
const AnimatedHistogramBar: React.FC<{
  bin: HistogramBin;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  animationProgress: SharedValue<number>;
  fill: string;
  opacity: number;
  radius: number;
  disabled: boolean;
}> = React.memo(({ bin, index, x, y, width, height, animationProgress, fill, opacity, radius, disabled }) => {
  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value;
    const animatedHeight = Math.max(0, height * progress);
    const animatedY = y + (height - animatedHeight);

    // Histogram counts are non-negative — round the top, keep the baseline flat.
    return {
      d: roundedBarPath(x, animatedY, width, animatedHeight, radius, 1, 1, 0, 0),
    } as any;
  }, [x, y, width, height, radius]);

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill={fill}
      fillOpacity={opacity}
    />
  );
});

AnimatedHistogramBar.displayName = 'AnimatedHistogramBar';

// Animated density curve component  
const AnimatedDensityCurve: React.FC<{
  path: string;
  animationProgress: SharedValue<number>;
  stroke: string;
  strokeWidth: number;
  disabled: boolean;
}> = React.memo(({ path, animationProgress, stroke, strokeWidth, disabled }) => {
  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value;
    return {
      strokeDasharray: `${progress * 1000} 1000`,
    } as any;
  }, []);

  if (!path) return null;

  return (
    <AnimatedPath
      d={path}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      animatedProps={disabled ? undefined : animatedProps}
    />
  );
});

AnimatedDensityCurve.displayName = 'AnimatedDensityCurve';

export const HistogramChart: React.FC<HistogramChartProps> = (props) => {
  const {
    data,
    width = 400,
    height = 260,
    title,
    subtitle,
    bins: binsOverride,
    binMethod = 'sturges',
    showDensity = true,
    bandwidth,
    density = true,
    barColor,
    barOpacity = 0.8,
    densityColor = '#ef4444',
    densityThickness = 2,
    barRadius = 2,
    barGap = 0.08,
    valueFormatter,
    multiTooltip = true,
    liveTooltip = true,
    enableCrosshair = true,
    tooltip,
    disabled = false,
    animationDuration = 800,
    style,
    xAxis,
    yAxis,
    grid,
    legend,
    annotations,
    rangeHighlights,
    onBinFocus,
    onBinBlur,
    // Generic press/pan callbacks are excluded from `...rest` so they are not
    // spread onto ChartContainer; Histogram does not wire them.
    onPress,
    onDataPointPress,
    ...rest
  } = props;

  const theme = useChartTheme();
  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch {
    interaction = null;
  }

  const register = interaction?.register;

  // Use custom hook for bins computation
  const { bins, min, max } = useHistogramBins(data, binMethod, binsOverride);
  const sampleCount = data.length;
  const total = sampleCount || 1;
  const maxCount = Math.max(...bins.map((b: HistogramBin) => b.count), 1);

  // Layout constants — margins measured from the labels the axes will draw.
  const basePadding = useMemo(
    () => resolveCartesianPadding({
      yTickLabels: domainTickLabels([0, maxCount], (value) => (yAxis?.labelFormatter ? yAxis.labelFormatter(value) : `${Math.round(value)}`)),
      xTickLabels: domainTickLabels([min, max], (value) => (xAxis?.labelFormatter ? xAxis.labelFormatter(value) : `${value}`)),
      yTitle: yAxis?.title,
      xTitle: xAxis?.title,
      showYAxis: yAxis?.show !== false,
      showXAxis: xAxis?.show !== false,
      showYTickLabels: yAxis?.showLabels !== false,
      showXTickLabels: xAxis?.showLabels !== false,
      containerWidth: width,
      containerHeight: height,
    }),
    [maxCount, min, max, yAxis?.labelFormatter, xAxis?.labelFormatter, yAxis?.title, xAxis?.title,
     yAxis?.show, xAxis?.show, yAxis?.showLabels, xAxis?.showLabels, width, height]
  );
  // Grown so the plot clears the title and legend overlays. Mirrors the fixed pair of
  // entries the legend renders below.
  const legendLabels = useMemo(
    () => [
      { label: density ? 'Density' : 'Count' },
      ...(showDensity ? [{ label: 'KDE' }] : []),
    ],
    [density, showDensity]
  );
  const padding = useMemo(
    () =>
      withChartBandPadding(basePadding, {
        title,
        subtitle,
        legendItems: legend?.show ? legendLabels : undefined,
        legendPosition: legend?.position,
        legendFontSize: legend?.fontSize,
        containerWidth: width,
      }),
    [basePadding.left, title, subtitle, legend?.show, legend?.position, legend?.fontSize, legendLabels, width]
  );
  const plotWidth = Math.max(0, width - padding.left - padding.right);
  const plotHeight = Math.max(0, height - padding.top - padding.bottom);

  // Scales
  const xScale = useMemo(() => {
    return linearScale([min, max], [0, plotWidth]);
  }, [min, max, plotWidth]);

  const yScale = useMemo(() => {
    const maxY = density ? Math.max(...bins.map((b: HistogramBin) => b.density)) : maxCount;
    return linearScale([0, maxY], [plotHeight, 0]);
  }, [bins, maxCount, plotHeight, density]);

  // Axis scales
  const xAxisScale = useMemo<Scale<number>>(() => {
    const scale = ((value: number) => xScale(value)) as Scale<number>;
    scale.domain = () => [min, max];
    scale.range = () => [0, plotWidth];
    scale.ticks = () => {
      if (xAxis?.ticks && xAxis.ticks.length) {
        return xAxis.ticks;
      }
      return generateNiceTicks(min, max, 6);
    };
    return scale;
  }, [xScale, min, max, plotWidth, xAxis?.ticks]);

  const yAxisScale = useMemo<Scale<number>>(() => {
    const maxY = density ? Math.max(...bins.map((b: HistogramBin) => b.density)) : maxCount;
    const scale = ((value: number) => yScale(value)) as Scale<number>;
    scale.domain = () => [0, maxY];
    scale.range = () => [plotHeight, 0];
    scale.ticks = () => {
      if (yAxis?.ticks && yAxis.ticks.length) {
        return yAxis.ticks;
      }
      return generateNiceTicks(0, maxY, 5);
    };
    return scale;
  }, [yScale, bins, maxCount, plotHeight, density, yAxis?.ticks]);

  // Compute density curve using KDE
  const densityCurve = useMemo(() => {
    if (!showDensity || !data.length) return { samples: [], path: '' };

    const kde = kernelDensityEstimator(data, bandwidth || 0);
    const samples: { x: number; y: number }[] = [];
    const steps = 80;
    const span = max - min || 1;

    for (let i = 0; i <= steps; i++) {
      const x = min + span * (i / steps);
      const y = kde(x);
      samples.push({ x, y });
    }

    const path = samples
      .map((s, i) => `${i === 0 ? 'M' : 'L'} ${xScale(s.x)} ${yScale(s.y)}`)
      .join(' ');

    return { samples, path };
  }, [showDensity, data, bandwidth, min, max, xScale, yScale]);

  // Animation
  const animationProgress = useSharedValue(disabled ? 1 : 0);
  const dataSignature = useMemo(() => {
    return bins.map((b: HistogramBin) => `${b.start}-${b.end}-${b.count}`).join('|');
  }, [bins]);

  useEffect(() => {
    if (disabled) {
      animationProgress.value = 1;
      return;
    }
    animationProgress.value = 0;
    animationProgress.value = withTiming(1, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [animationProgress, animationDuration, dataSignature, disabled]);

  // Series registration with memoization and signature guard
  const totalDensityArea = useMemo(() => {
    if (!bins.length) return 0;
    return bins.reduce((acc, bin) => {
      const width = Math.max(0, bin.end - bin.start);
      return acc + bin.density * width;
    }, 0);
  }, [bins]);

  const binSummaries = useMemo<HistogramBinSummary[]>(() => {
    if (!bins.length) return [];
    let cumulativeCount = 0;
    let cumulativeDensity = 0;
    const densityNormalizer = totalDensityArea > 0 ? totalDensityArea : 1;
    return bins.map((bin, index) => {
      const width = Math.max(0, bin.end - bin.start);
      cumulativeCount += bin.count;
      cumulativeDensity += bin.density * width;
      return {
        ...bin,
        index,
        width,
        midpoint: bin.start + width / 2,
        cumulativeCount,
        cumulativeDensity,
        cumulativeDensityRatio: cumulativeDensity / densityNormalizer,
        percentile: cumulativeCount / total,
      };
    });
  }, [bins, total, totalDensityArea]);

  const [activeBinIndex, setActiveBinIndex] = useState<number | null>(null);
  const activeBinRef = useRef<number | null>(null);

  const focusBin = useCallback(
    (nextIndex: number | null) => {
      if (activeBinRef.current === nextIndex) return;
      const previousIndex = activeBinRef.current;
      activeBinRef.current = nextIndex;
      setActiveBinIndex(nextIndex);

      if (previousIndex != null && previousIndex !== nextIndex) {
        const previousSummary = binSummaries[previousIndex];
        if (previousSummary && onBinBlur) {
          onBinBlur(previousSummary);
        }
      }

      if (nextIndex != null) {
        const nextSummary = binSummaries[nextIndex];
        if (nextSummary && onBinFocus) {
          onBinFocus(nextSummary);
        }
      } else if (previousIndex != null) {
        onBinBlur?.(null);
      }
    },
    [binSummaries, onBinBlur, onBinFocus]
  );

  useEffect(() => {
    if (activeBinRef.current != null) {
      const currentIndex = activeBinRef.current;
      if (currentIndex == null || !binSummaries[currentIndex]) {
        activeBinRef.current = null;
        setActiveBinIndex(null);
        onBinBlur?.(null);
      }
    }
  }, [binSummaries, onBinBlur]);

  // New interaction engine: each bin is a band mark carrying its bar rectangle
  // (container-origin) so the tester resolves rect membership + nearest-category.
  // The mark id is the bin index (the band tester's category key).
  const histColor = barColor || getColorFromScheme(0, colorSchemes.default);
  const hitSeries: HitSeries[] = useMemo(() => {
    const marks: Mark[] = bins.map((bin: HistogramBin, i: number) => {
      const x0 = xScale(bin.start);
      const x1 = xScale(bin.end);
      const w = Math.max(1, x1 - x0);
      const gap = w * barGap;
      const effectiveW = w - gap;
      const value = density ? bin.density : bin.count;
      const y = yScale(value);
      const rectX = x0 + gap / 2 + padding.left;
      const rectY = y + padding.top;
      const height = Math.max(0, plotHeight - y);
      const summary = binSummaries[i];
      const rangeLabel = `${Number(bin.start).toFixed(2)} – ${Number(bin.end).toFixed(2)}`;
      const defaultFormatted = valueFormatter && summary
        ? valueFormatter(bin.count, summary)
        : `${rangeLabel} · ${density ? bin.density.toFixed(3) : bin.count}`;
      // Only the `formatter` + `show` fields of the `tooltip` prop are honored here;
      // tooltip styling is applied globally by the shared ChartActiveTooltip.
      const tf = tooltip?.formatter?.(summary ?? bin);
      return {
        id: i,
        pixel: { x: rectX + effectiveW / 2, y: rectY },
        value,
        datum: summary ?? bin,
        extent: { rect: { x: rectX, y: rectY, width: effectiveW, height } },
        formattedValue: typeof tf === 'string' ? tf : defaultFormatted,
        ...(tf != null && typeof tf !== 'string' ? { customTooltip: tf } : {}),
      };
    });
    return [{ id: 'hist-bins', name: 'Count', color: histColor, visible: true, marks }];
  }, [bins, binSummaries, xScale, yScale, padding.left, padding.top, plotHeight, barGap, density, valueFormatter, histColor, tooltip]);

  const tester = useMemo(() => new BandCategoryHitTester(hitSeries, { orientation: 'x' }), [hitSeries]);

  useEffect(() => {
    if (!register) return;
    register('histogram', { frame: { kind: 'cartesian' } as any, geometry: { kind: 'band', orientation: 'x' }, series: hitSeries });
    return () => register('histogram', null);
  }, [register, hitSeries]);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding,
    plotWidth,
    plotHeight,
    enabled: Boolean(interaction) && !disabled,
    hover: liveTooltip !== false,
    press: false,
    tester,
    // Keep the bar-highlight (activeBinIndex) in sync with the resolved target.
    onPointer: (_e, target) => focusBin(target ? Number(target.markId) : null),
    onLeave: () => focusBin(null),
  });

  // Grid ticks
  const normalizedXTicks = useMemo(() => {
    if (plotWidth <= 0) return [];
    const ticks = xAxis?.ticks && xAxis.ticks.length ? xAxis.ticks : xAxisScale.ticks!();
    return ticks.map(tick => {
      const px = xAxisScale(tick);
      return px / plotWidth;
    });
  }, [xAxis?.ticks, xAxisScale, plotWidth]);

  const normalizedYTicks = useMemo(() => {
    if (plotHeight <= 0) return [];
    const ticks = yAxis?.ticks && yAxis.ticks.length ? yAxis.ticks : yAxisScale.ticks!();
    return ticks.map(tick => {
      const py = yAxisScale(tick);
      return py / plotHeight;
    });
  }, [plotHeight, yAxis?.ticks, yAxisScale]);

  const barFill = barColor || theme.colors.accentPalette[0];
  const pointerActive = activeBinIndex != null;

  const rangeRects = useMemo(() => {
    if (!rangeHighlights || !rangeHighlights.length) return [] as Array<{
      key: string | number;
      x: number;
      width: number;
      color: string;
      opacity: number;
    }>;
    return rangeHighlights
      .map((highlight) => {
        if (highlight.start == null || highlight.end == null) return null;
        const start = Math.min(highlight.start, highlight.end);
        const end = Math.max(highlight.start, highlight.end);
        if (end <= min || start >= max) return null;
        const clampedStart = Math.max(start, min);
        const clampedEnd = Math.min(end, max);
        const x0 = xScale(clampedStart);
        const x1 = xScale(clampedEnd);
        return {
          key: highlight.id,
          x: x0,
          width: Math.max(0, x1 - x0),
          color: highlight.color || theme.colors.accentPalette[2] || '#38bdf8',
          opacity: highlight.opacity ?? 0.12,
        };
      })
      .filter((item): item is {
        key: string | number;
        x: number;
        width: number;
        color: string;
        opacity: number;
      } => !!item && item.width > 0);
  }, [rangeHighlights, xScale, min, max, theme.colors.accentPalette]);

  return (
    <ChartContainer
      {...rest}
      width={width}
      height={height}
      style={style}
      interactionConfig={{ multiTooltip, liveTooltip: tooltip?.show === false ? false : liveTooltip, enableCrosshair }}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

      {legend?.show && (
        <ChartLegend
          items={[
            { label: density ? 'Density' : 'Count', color: barFill, visible: true },
            ...(showDensity ? [{ label: 'KDE', color: densityColor, visible: true }] : []),
          ]}
          position={legend?.position}
          align={legend?.align}
        />
      )}

      {grid?.show !== false && (
        <ChartGrid
          grid={{
            show: true,
            color: grid?.color || theme.colors.grid,
            thickness: grid?.thickness ?? 1,
            style: grid?.style ?? 'solid',
            showMajor: grid?.showMajor ?? true,
            showMinor: grid?.showMinor ?? false,
            majorLines: grid?.majorLines,
            minorLines: grid?.minorLines,
          }}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          xTicks={normalizedXTicks}
          yTicks={normalizedYTicks}
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
          {/* Range highlights */}
          {rangeRects.map((rect) => (
            <Rect
              key={`range-${rect.key}`}
              x={rect.x}
              y={0}
              width={rect.width}
              height={plotHeight}
              fill={rect.color}
              opacity={rect.opacity}
            />
          ))}
          {/* Histogram bars */}
          {bins.map((bin: HistogramBin, i: number) => {
            const isActive = activeBinIndex === i;
            const x0 = xScale(bin.start);
            const x1 = xScale(bin.end);
            const w = Math.max(1, x1 - x0);
            const gap = w * barGap;
            const effectiveW = w - gap;
            const value = density ? bin.density : bin.count;
            const y = yScale(value);
            const h = plotHeight - y;

            return (
              <AnimatedHistogramBar
                key={`bar-${i}`}
                bin={bin}
                index={i}
                x={x0 + gap / 2}
                y={y}
                width={effectiveW}
                height={Math.max(0, h)}
                animationProgress={animationProgress}
                fill={barFill}
                opacity={pointerActive ? (isActive ? barOpacity : Math.max(0.25, barOpacity * 0.55)) : barOpacity}
                radius={barRadius}
                disabled={disabled}
              />
            );
          })}

          {/* Density curve */}
          {showDensity && (
            <AnimatedDensityCurve
              path={densityCurve.path}
              animationProgress={animationProgress}
              stroke={densityColor}
              strokeWidth={densityThickness}
              disabled={disabled}
            />
          )}
        </G>
      </Svg>

      {annotations?.map((annotation) => {
        if (!annotation) return null;
        if ((annotation.shape === 'vertical-line' || annotation.shape === 'range') && annotation.x == null && annotation.x1 == null) {
          // legacy guard: ignore vertical annotations without coordinates
        }
        const id = annotation.id ?? `annotation-${annotation.shape}`;

        if (annotation.shape === 'vertical-line' && annotation.x != null) {
          const pixelX = padding.left + xScale(Number(annotation.x));
          if (!Number.isFinite(pixelX) || pixelX < padding.left || pixelX > padding.left + plotWidth) return null;
          const lineWidth = annotation.lineWidth ?? 1;
          const color = annotation.color || theme.colors.accentPalette[4] || '#6366f1';
          const opacity = annotation.opacity ?? 0.75;
          const label = annotation.label;
          const labelColor = annotation.textColor || theme.colors.textPrimary;
          const fontSize = annotation.fontSize ?? 11;
          return (
            <React.Fragment key={String(id)}>
              <View
                style={{
                  position: 'absolute',
                  left: pixelX - lineWidth / 2,
                  top: padding.top,
                  width: lineWidth,
                  height: plotHeight,
                  backgroundColor: color,
                  opacity,
                }}
              />
              {label ? (
                <Text
                  style={{
                    position: 'absolute',
                    left: pixelX + 4,
                    top: Math.max(4, padding.top + 4),
                    color: labelColor,
                    fontSize,
                    fontWeight: '500',
                    backgroundColor: annotation.backgroundColor || theme.colors.background,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  {label}
                </Text>
              ) : null}
            </React.Fragment>
          );
        }

        if (annotation.shape === 'horizontal-line' && annotation.y != null) {
          const pixelY = padding.top + yScale(Number(annotation.y));
          if (!Number.isFinite(pixelY) || pixelY < padding.top || pixelY > padding.top + plotHeight) return null;
          const lineWidth = annotation.lineWidth ?? 1;
          const color = annotation.color || theme.colors.accentPalette[3] || '#0ea5e9';
          const opacity = annotation.opacity ?? 0.7;
          const label = annotation.label;
          const labelColor = annotation.textColor || theme.colors.textPrimary;
          const fontSize = annotation.fontSize ?? 11;
          return (
            <React.Fragment key={String(id)}>
              <View
                style={{
                  position: 'absolute',
                  left: padding.left,
                  top: pixelY - lineWidth / 2,
                  width: plotWidth,
                  height: lineWidth,
                  backgroundColor: color,
                  opacity,
                }}
              />
              {label ? (
                <Text
                  style={{
                    position: 'absolute',
                    left: padding.left + 8,
                    top: Math.max(padding.top, pixelY - 24),
                    color: labelColor,
                    fontSize,
                    fontWeight: '500',
                    backgroundColor: annotation.backgroundColor || theme.colors.background,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  {label}
                </Text>
              ) : null}
            </React.Fragment>
          );
        }

        if (annotation.shape === 'text' && annotation.x != null && annotation.y != null) {
          const pixelX = padding.left + xScale(Number(annotation.x));
          const pixelY = padding.top + yScale(Number(annotation.y));
          if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) return null;
          return (
            <Text
              key={String(id)}
              style={{
                position: 'absolute',
                left: pixelX,
                top: pixelY,
                color: annotation.textColor || theme.colors.textPrimary,
                fontSize: annotation.fontSize ?? 11,
                fontWeight: '500',
                backgroundColor: annotation.backgroundColor || theme.colors.background,
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
                transform: [{ translateX: -20 }, { translateY: -20 }],
              }}
            >
              {annotation.label ?? ''}
            </Text>
          );
        }

        return null;
      })}

      {/* X Axis */}
      <Axis
        scale={xAxisScale}
        orientation="bottom"
        length={plotWidth}
        offset={{ x: padding.left, y: padding.top + plotHeight }}
        tickCount={(xAxis?.ticks && xAxis.ticks.length) || xAxisScale.ticks!().length}
  tickSize={xAxis?.tickLength ?? 4}
        tickFormat={xAxis?.labelFormatter}
        showLabels={xAxis?.showLabels ?? true}
        showTicks={xAxis?.showTicks ?? true}
        showLine={xAxis?.show ?? true}
        stroke={xAxis?.color || theme.colors.grid}
        strokeWidth={xAxis?.thickness ?? 1}
        tickLabelColor={xAxis?.labelColor || theme.colors.textSecondary}
        tickLabelFontSize={xAxis?.labelFontSize ?? 11}
        label={xAxis?.title}
      />

      {/* Y Axis */}
      <Axis
        scale={yAxisScale}
        orientation="left"
        length={plotHeight}
        offset={{ x: padding.left, y: padding.top }}
        tickCount={(yAxis?.ticks && yAxis.ticks.length) || yAxisScale.ticks!().length}
  tickSize={yAxis?.tickLength ?? 4}
        tickFormat={yAxis?.labelFormatter}
        showLabels={yAxis?.showLabels ?? true}
        showTicks={yAxis?.showTicks ?? true}
        showLine={yAxis?.show ?? true}
        stroke={yAxis?.color || theme.colors.grid}
        strokeWidth={yAxis?.thickness ?? 1}
        tickLabelColor={yAxis?.labelColor || theme.colors.textSecondary}
        tickLabelFontSize={yAxis?.labelFontSize ?? 11}
        label={yAxis?.title}
      />

      {/* Unified cross-platform gesture surface (web PointerEvents | native
          Responder). Full-chart overlay so pointer coords are container-origin,
          matching the registered bar rects. */}
      {Boolean(interaction) && !disabled && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="histogram-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}
    </ChartContainer>
  );
};

HistogramChart.displayName = 'HistogramChart';
