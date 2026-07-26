import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Platform } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, G, Text as SvgText, Line } from 'react-native-svg';
import { roundedBarPath, barCornerMask } from '../../utils/barPath';

import { useChartTheme } from '../../theme/ChartThemeContext';
import { BarChartProps, BarChartDataPoint, BarChartSeries } from './types';
import { ChartInteractionEvent } from '../../types';
import { ChartContainer, ChartTitle, ChartLegend , withChartBandPadding } from '../../ChartBase';
import { Axis } from '../../core/Axis';
import { ChartGrid as Grid } from '../../core/ChartGrid';
import { linearScale } from '../../utils/scales';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { BandCategoryHitTester } from '../../core/hittest/band';
import type { HitSeries, Mark } from '../../core/hittest/types';
import { generateTicks, getColorFromScheme, colorSchemes, formatNumber } from '../../utils';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type ComputedBar = {
  globalIndex: number;
  datum: BarChartDataPoint;
  category: string;
  categoryIndex: number;
  seriesId: string;
  seriesIndex: number;
  seriesName?: string;
  value: number;
  originalValue: number;
  percentContribution?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  originX: number;
  originY: number;
  isPositive: boolean;
};

type NormalizedSeriesPoint = {
  datum: BarChartDataPoint;
  value: number;
  color: string;
  category: string;
  categoryIndex: number;
  isSynthetic: boolean;
};

type NormalizedSeriesData = {
  id: string;
  name: string;
  seriesIndex: number;
  baseColor?: string;
  points: NormalizedSeriesPoint[];
};

interface AnimatedBarRectProps {
  bar: ComputedBar;
  orientation: 'vertical' | 'horizontal';
  animationProgress: SharedValue<number>;
  targetScale: number;
  borderRadius: number;
  fill: string;
  opacity: number;
  stroke: string;
  strokeWidth: number;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  onPress?: (event: any) => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

const AnimatedBarRect: React.FC<AnimatedBarRectProps> = React.memo(
  ({
    bar,
    orientation,
    animationProgress,
    targetScale,
    borderRadius,
    fill,
    opacity,
    stroke,
    strokeWidth,
    onHoverIn,
    onHoverOut,
    onPress,
    onPressIn,
    onPressOut,
  }) => {
    const scale = useSharedValue<number>(targetScale);

    useEffect(() => {
      scale.value = withSpring(targetScale, { damping: 16, stiffness: 180 });
    }, [targetScale, scale]);

    // Only the data-end corners round; the baseline end stays square.
    const corners = useMemo(
      () => barCornerMask(orientation, bar.isPositive),
      [orientation, bar.isPositive],
    );

    const animatedProps = useAnimatedProps(() => {
      const progress = animationProgress.value;
      const scaleValue = scale.value;

      let x: number;
      let y: number;
      let w: number;
      let h: number;

      if (orientation === 'vertical') {
        h = Math.max(0, bar.height * progress * scaleValue);
        x = bar.x;
        y = bar.isPositive ? bar.originY - h : bar.originY;
        w = bar.width;
      } else {
        w = Math.max(0, bar.width * progress * scaleValue);
        x = bar.isPositive ? bar.originX : bar.originX - w;
        y = bar.y;
        h = bar.height;
      }

      return {
        d: roundedBarPath(x, y, w, h, borderRadius, corners.tl, corners.tr, corners.br, corners.bl),
      } as any;
    }, [bar, orientation, borderRadius, corners]);

    const isWeb = Platform.OS === 'web';

    const toNativePointerEvent = (event: any) => {
      const rect = event.currentTarget?.getBoundingClientRect?.();
      return {
        nativeEvent: {
          locationX: rect ? event.clientX - rect.left : 0,
          locationY: rect ? event.clientY - rect.top : 0,
          pageX: event.pageX ?? event.clientX,
          pageY: event.pageY ?? event.clientY,
        },
      };
    };

    return (
      <AnimatedPath
        animatedProps={animatedProps}
        fill={fill}
        opacity={opacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        // @ts-expect-error web-only events
        onMouseEnter={onHoverIn}
        onMouseLeave={onHoverOut}
        {...(isWeb
          ? {
              onPointerDown: (event: any) => {
                onPressIn?.();
                event.currentTarget?.setPointerCapture?.(event.pointerId);
              },
              onPointerUp: (event: any) => {
                event.currentTarget?.releasePointerCapture?.(event.pointerId);
                onPressOut?.();
                onPress?.(toNativePointerEvent(event));
              },
              onPointerLeave: () => {
                onPressOut?.();
              },
              onPointerCancel: () => {
                onPressOut?.();
              },
            }
          : {
              onPress,
              onPressIn,
              onPressOut,
            })}
      />
    );
  }
);

AnimatedBarRect.displayName = 'AnimatedBarRect';

export const BarChart: React.FC<BarChartProps> = React.memo((props) => {

  const {
    data,
    series,
    width = 400,
    height = 300,
    barColor,
    barSpacing = 0.2,
    barBorderRadius = 4,
    orientation = 'vertical',
    layout,
    stackMode = 'normal',
    title,
    subtitle,
    xAxis,
    yAxis,
    grid,
    legend = { show: true, position: 'bottom', align: 'center' },
    legendToggleEnabled,
    tooltip,
    onPress,
    onDataPointPress,
    disabled = false,
    animationDuration = 800,
    animation,
    style,
    valueFormatter,
    valueLabel,
    thresholds,
    colorScale,
    ...rest
  } = props;

  const theme = useChartTheme();

  const showValueLabels = valueLabel ? valueLabel.show !== false : false;
  const valueLabelFormatter = valueLabel?.formatter
    ? valueLabel.formatter
    : ((value: number, datum: BarChartDataPoint, index: number) =>
        valueFormatter ? valueFormatter(value, datum, index) : formatNumber(value));
  const valueLabelColor = valueLabel?.color || theme.colors.textPrimary;
  const valueLabelFontSize = valueLabel?.fontSize ?? 12;
  const valueLabelFontWeightRaw = valueLabel?.fontWeight ?? '600';
  const valueLabelFontWeight = typeof valueLabelFontWeightRaw === 'number' ? String(valueLabelFontWeightRaw) : valueLabelFontWeightRaw;
  const valueLabelOffset = valueLabel?.offset ?? 8;
  const valueLabelPosition = valueLabel?.position ?? 'outside';
  const valueLabelInside = valueLabelPosition === 'inside';

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch { /* noop */ }

  const register = interaction?.register;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  const animationProgress = useSharedValue(0);

  const resolvedSeries = useMemo<BarChartSeries[]>(() => {
    if (series && series.length > 0) {
      return series;
    }
    return [
      {
        id: 'series-default',
        name: title || 'Series',
        color: barColor,
        data,
      },
    ];
  }, [series, data, title, barColor]);

  const seriesCount = resolvedSeries.length;

  const resolvedLayout = useMemo<'single' | 'grouped' | 'stacked'>(() => {
    if (layout) {
      if ((layout === 'grouped' || layout === 'stacked') && seriesCount <= 1) {
        return 'single';
      }
      return layout;
    }
    return seriesCount > 1 ? 'grouped' : 'single';
  }, [layout, seriesCount]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    const addCategory = (category: string) => {
      if (!seen.has(category)) {
        seen.add(category);
        ordered.push(category);
      }
    };
    resolvedSeries.forEach((seriesItem) => {
      seriesItem.data.forEach((datum) => {
        addCategory(datum.category);
      });
    });
    return ordered;
  }, [resolvedSeries]);

  const resolvePointColor = useCallback(
    (datum: BarChartDataPoint, seriesItem: BarChartSeries, seriesIndex: number, categoryIndex: number) => {
      if (datum.color) return datum.color;
      if (seriesItem.color) return seriesItem.color;
      if (colorScale) {
        const resolved = colorScale({ datum, series: seriesItem, seriesIndex, categoryIndex });
        if (resolved) return resolved;
      }
      if (barColor && seriesCount === 1) return barColor;
      const palette = theme.colors.accentPalette ?? colorSchemes.default;
      return getColorFromScheme(seriesIndex, palette);
    },
    [colorScale, barColor, seriesCount, theme.colors.accentPalette]
  );

  const normalizedSeries = useMemo<NormalizedSeriesData[]>(() => {
    return resolvedSeries.map((seriesItem, seriesIndex) => {
      const pointByCategory = new Map<string, BarChartDataPoint>();
      seriesItem.data.forEach((datum) => {
        pointByCategory.set(datum.category, datum);
      });

      const points = categories.map((category, categoryIndex) => {
        const datum = pointByCategory.get(category);
        if (datum) {
          return {
            datum,
            value: datum.value,
            color: resolvePointColor(datum, seriesItem, seriesIndex, categoryIndex),
            category,
            categoryIndex,
            isSynthetic: false,
          };
        }

        const synthetic: BarChartDataPoint = {
          id: `${seriesItem.id}-${category}`,
          category,
          value: 0,
        };
        return {
          datum: synthetic,
          value: 0,
          color: resolvePointColor(synthetic, seriesItem, seriesIndex, categoryIndex),
          category,
          categoryIndex,
          isSynthetic: true,
        };
      });

      return {
        id: seriesItem.id,
        name: seriesItem.name ?? seriesItem.id,
        seriesIndex,
        baseColor: seriesItem.color,
        points,
      };
    });
  }, [resolvedSeries, categories, resolvePointColor]);

  const autoLegend = !legend?.items || legend.items.length === 0;
  const allowLegendToggles = legendToggleEnabled ?? (autoLegend && normalizedSeries.length > 1);

  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setHiddenSeries((prev) => {
      const next = new Set<string>();
      normalizedSeries.forEach((seriesItem) => {
        if (prev.has(seriesItem.id)) {
          next.add(seriesItem.id);
        }
      });
      if (next.size === prev.size) {
        let unchanged = true;
        next.forEach((id) => {
          if (!prev.has(id)) {
            unchanged = false;
          }
        });
        if (unchanged) {
          return prev;
        }
      }
      return next;
    });
  }, [normalizedSeries]);

  const visibleSeries = useMemo(() => {
    const filtered = normalizedSeries.filter((seriesItem) => !hiddenSeries.has(seriesItem.id));
    if (filtered.length === 0) {
      return normalizedSeries;
    }
    return filtered;
  }, [normalizedSeries, hiddenSeries]);

  const displaySeries = useMemo(() => {
    if (resolvedLayout === 'single') {
      const primary = visibleSeries[0] ?? normalizedSeries[0];
      return primary ? [primary] : [];
    }
    return visibleSeries;
  }, [resolvedLayout, visibleSeries, normalizedSeries]);

  // Reserve extra room on the left for a rotated y-axis title so it clears the tick labels.
  const basePadding = { top: 40, right: 20, bottom: 60, left: yAxis?.title ? 104 : 80 };
  const legendLabels = useMemo(
    () => normalizedSeries.map((s, i) => ({ label: s.name || `Series ${i + 1}` })),
    [normalizedSeries]
  );
  const chartDimensions = useMemo(
    () => {
      // Grown so the plot clears the title and legend overlays.
      const adjustedPadding = withChartBandPadding(basePadding, {
        title,
        subtitle,
        legendItems: legend?.show ? legendLabels : undefined,
        legendPosition: legend?.position,
        legendFontSize: legend?.fontSize,
        containerWidth: width,
      });
      return {
        padding: adjustedPadding,
        plotWidth: width - adjustedPadding.left - adjustedPadding.right,
        plotHeight: height - adjustedPadding.top - adjustedPadding.bottom,
      };
    },
    [width, height, title, subtitle, legend?.show, legend?.position, legend?.fontSize, legendLabels, yAxis?.title]
  );

  const { padding, plotWidth, plotHeight } = chartDimensions;

  const usePercentageStack = resolvedLayout === 'stacked' && stackMode === '100%';

  const metrics = useMemo(() => {
    if (!categories.length || !displaySeries.length) {
      return {
        minValue: 0,
        maxValue: 1,
        positiveTotals: [] as number[],
        negativeTotals: [] as number[],
        stackTotals: [] as number[],
      };
    }

    if (resolvedLayout === 'stacked') {
      const positiveTotals = categories.map(() => 0);
      const negativeTotals = categories.map(() => 0);
      const stackTotals = categories.map(() => 0);
      displaySeries.forEach((seriesItem) => {
        seriesItem.points.forEach((point, categoryIndex) => {
          const value = point.value;
          if (value >= 0) {
            positiveTotals[categoryIndex] += value;
          } else {
            negativeTotals[categoryIndex] += value;
          }
          stackTotals[categoryIndex] += Math.abs(value);
        });
      });
      if (usePercentageStack) {
        return {
          minValue: 0,
          maxValue: 1,
          positiveTotals,
          negativeTotals,
          stackTotals,
        };
      }
      const maxPositive = Math.max(0, ...positiveTotals);
      const minNegative = Math.min(0, ...negativeTotals);
      return {
        minValue: Math.min(0, minNegative),
        maxValue: Math.max(0, maxPositive),
        positiveTotals,
        negativeTotals,
        stackTotals,
      };
    }

    const values = displaySeries.flatMap((seriesItem) => seriesItem.points.map((point) => point.value));
    const maxValue = values.length ? Math.max(...values, 0) : 0;
    const minValue = values.length ? Math.min(...values, 0) : 0;
    return {
      minValue,
      maxValue,
      positiveTotals: [] as number[],
      negativeTotals: [] as number[],
      stackTotals: [] as number[],
    };
  }, [categories.length, displaySeries, resolvedLayout, usePercentageStack]);

  const valueTicks = useMemo(() => generateTicks(metrics.minValue, metrics.maxValue, 5), [metrics.minValue, metrics.maxValue]);

  const valueScaleY = useMemo(() => linearScale([metrics.minValue, metrics.maxValue], [plotHeight, 0]), [metrics.minValue, metrics.maxValue, plotHeight]);
  const valueScaleX = useMemo(() => linearScale([metrics.minValue, metrics.maxValue], [0, plotWidth]), [metrics.minValue, metrics.maxValue, plotWidth]);

  const categoryScaleX = useMemo(() => {
    const count = Math.max(categories.length, 1);
    if (plotWidth <= 0) return linearScale([0, 1], [0, 0]);
    const band = plotWidth / count;
    const start = count > 1 ? band / 2 : plotWidth / 2;
    const end = count > 1 ? plotWidth - band / 2 : start;
    return linearScale([0, Math.max(count - 1, 1)], [start, end]);
  }, [categories.length, plotWidth]);

  const categoryScaleY = useMemo(() => {
    const count = Math.max(categories.length, 1);
    if (plotHeight <= 0) return linearScale([0, 1], [0, 0]);
    const band = plotHeight / count;
    const start = count > 1 ? band / 2 : plotHeight / 2;
    const end = count > 1 ? plotHeight - band / 2 : start;
    return linearScale([0, Math.max(count - 1, 1)], [start, end]);
  }, [categories.length, plotHeight]);

  const thresholdsConfig = useMemo(() => {
    return (thresholds ?? []).map((threshold, index) => ({
      key: `threshold-${index}`,
      value: threshold.value,
      label: threshold.label,
      color: threshold.color || '#9CA3AF',
      width: threshold.width ?? 1,
      style: threshold.style ?? 'dashed',
      labelOffset: threshold.labelOffset ?? 8,
      position: threshold.position ?? 'front',
    }));
  }, [thresholds]);

  const bars = useMemo(() => {
    if (!categories.length || !displaySeries.length || plotWidth <= 0 || plotHeight <= 0) {
      return [] as ComputedBar[];
    }

    const bandCount = Math.max(categories.length, 1);
    const bandSize = orientation === 'vertical'
      ? (plotWidth > 0 ? plotWidth / bandCount : 0)
      : (plotHeight > 0 ? plotHeight / bandCount : 0);
    const groupWidth = bandSize * (1 - barSpacing);
    const groupOffset = (bandSize - groupWidth) / 2;

    const positiveOffsets = resolvedLayout === 'stacked' ? categories.map(() => 0) : [];
    const negativeOffsets = resolvedLayout === 'stacked' ? categories.map(() => 0) : [];
    const percentTotals = metrics.stackTotals;

    const computed: ComputedBar[] = [];
    let globalIndex = 0;

    displaySeries.forEach((seriesItem, seriesPosition) => {
      categories.forEach((category, categoryIndex) => {
        const point = seriesItem.points[categoryIndex];
        if (!point) return;

        const originalValue = point.value;
        const percentContribution =
          usePercentageStack && percentTotals[categoryIndex]
            ? originalValue / (percentTotals[categoryIndex] || 1)
            : usePercentageStack
            ? 0
            : undefined;
        const displayedValue = usePercentageStack ? percentContribution ?? 0 : originalValue;
        const isPositive = displayedValue >= 0;

        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;
        let originX = 0;
        let originY = 0;

        if (orientation === 'vertical') {
          if (resolvedLayout === 'stacked') {
            const offsets = isPositive ? positiveOffsets : negativeOffsets;
            const startValue = offsets[categoryIndex];
            const endValue = startValue + displayedValue;
            offsets[categoryIndex] = endValue;

            const startY = valueScaleY(startValue);
            const endY = valueScaleY(endValue);
            y = Math.min(startY, endY);
            height = Math.abs(endY - startY);
            x = categoryIndex * bandSize + groupOffset;
            width = groupWidth;
          } else {
            const perBarWidth = resolvedLayout === 'grouped' ? groupWidth / displaySeries.length : groupWidth;
            const zeroY = valueScaleY(0);
            const valueY = valueScaleY(displayedValue);
            x = categoryIndex * bandSize + groupOffset + (resolvedLayout === 'grouped' ? seriesPosition * perBarWidth : 0);
            y = Math.min(valueY, zeroY);
            height = Math.abs(zeroY - valueY);
            width = perBarWidth;
          }
          originY = isPositive ? y + height : y;
          originX = x + width / 2;
        } else {
          if (resolvedLayout === 'stacked') {
            const offsets = isPositive ? positiveOffsets : negativeOffsets;
            const startValue = offsets[categoryIndex];
            const endValue = startValue + displayedValue;
            offsets[categoryIndex] = endValue;

            const startX = valueScaleX(startValue);
            const endX = valueScaleX(endValue);
            x = Math.min(startX, endX);
            width = Math.abs(endX - startX);
            y = categoryIndex * bandSize + groupOffset;
            height = groupWidth;
          } else {
            const perBarHeight = resolvedLayout === 'grouped' ? groupWidth / displaySeries.length : groupWidth;
            const zeroX = valueScaleX(0);
            const valueX = valueScaleX(displayedValue);
            x = Math.min(valueX, zeroX);
            width = Math.abs(zeroX - valueX);
            y = categoryIndex * bandSize + groupOffset + (resolvedLayout === 'grouped' ? seriesPosition * perBarHeight : 0);
            height = perBarHeight;
          }
          originX = isPositive ? x : x + width;
          originY = y + height / 2;
        }

        computed.push({
          globalIndex,
          datum: point.datum,
          category,
          categoryIndex,
          seriesId: seriesItem.id,
          seriesIndex: seriesItem.seriesIndex,
          seriesName: seriesItem.name,
          value: displayedValue,
          originalValue,
          percentContribution: usePercentageStack ? percentContribution : undefined,
          x,
          y,
          width,
          height,
          color: point.color,
          originX,
          originY,
          isPositive,
        });
        globalIndex += 1;
      });
    });

    return computed;
  }, [categories, displaySeries, resolvedLayout, orientation, barSpacing, plotWidth, plotHeight, valueScaleY, valueScaleX, metrics.stackTotals, usePercentageStack]);

  const [barScaleTargets, setBarScaleTargets] = useState<number[]>([]);

  useEffect(() => {
    setBarScaleTargets((prev) => {
      if (prev.length === bars.length) return prev;
      const next = new Array(bars.length).fill(1);
      for (let i = 0; i < Math.min(prev.length, next.length); i += 1) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [bars.length]);

  const updateScale = useCallback((index: number, scale: number) => {
    setBarScaleTargets((prev) => {
      if (prev[index] === scale) return prev;
      const next = [...prev];
      next[index] = scale;
      return next;
    });
  }, []);

  const dataSignature = useMemo(
    () =>
      resolvedSeries
        .map(
          (seriesItem) =>
            `${seriesItem.id}:${seriesItem.data
              .map((d) => `${d.id ?? d.category}:${d.value}`)
              .join(',')}`
        )
        .join('|'),
    [resolvedSeries]
  );

  const startAnimation = useCallback(() => {
    if (disabled) {
      animationProgress.value = 1;
      return;
    }
    animationProgress.value = 0;
    animationProgress.value = withTiming(1, {
      duration: animation?.duration ?? animationDuration ?? 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [disabled, animation?.duration, animationDuration, animationProgress]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation, dataSignature]);


  const gridXTicks = useMemo(() => {
    if (!grid?.show) return [] as number[];
    if (orientation === 'vertical') return [] as number[];
    return valueTicks.map((tick) => (plotWidth > 0 ? valueScaleX(tick) / plotWidth : 0));
  }, [grid?.show, orientation, valueTicks, valueScaleX, plotWidth]);

  const gridYTicks = useMemo(() => {
    if (!grid?.show) return [] as number[];
    if (orientation === 'vertical') {
      return valueTicks.map((tick) => (plotHeight > 0 ? valueScaleY(tick) / plotHeight : 0));
    }
    if (plotHeight <= 0 || !categories.length) return [] as number[];
    const band = plotHeight / Math.max(categories.length, 1);
    return categories.map((_, index) => ((index + 0.5) * band) / plotHeight);
  }, [grid?.show, orientation, valueTicks, valueScaleY, plotHeight, categories.length]);

  const handlePress = useCallback(
    (bar: ComputedBar, event: any) => {
      if (disabled) return;
      const centerX = bar.x + bar.width / 2;
      const centerY = bar.y + bar.height / 2;
      const interactionEvent: ChartInteractionEvent<BarChartDataPoint> = {
        nativeEvent: event?.nativeEvent ?? event,
        chartX: centerX,
        chartY: centerY,
        dataPoint: bar.datum,
        dataX: bar.categoryIndex,
        dataY: bar.originalValue,
      };
      onDataPointPress?.(bar.datum, interactionEvent);
      onPress?.(interactionEvent);
    },
    [disabled, onDataPointPress, onPress]
  );

  // Bar-highlight (scale + hoveredIndex) driven from the hit-test engine's onPointer.
  const hoveredRef = React.useRef<number | null>(null);
  const setHovered = useCallback((idx: number | null) => {
    if (hoveredRef.current === idx) return;
    if (hoveredRef.current != null) updateScale(hoveredRef.current, 1);
    if (idx != null) updateScale(idx, 1.05);
    hoveredRef.current = idx;
    setHoveredIndex(idx);
  }, [updateScale]);

  // New interaction engine: each bar is a band mark with its container-origin rect +
  // category-index key. One hit-series per data series → rect membership resolves the
  // hovered bar; slice() returns every series' bar at the category. Band axis is x for
  // vertical bars, y for horizontal.
  const hitSeries: HitSeries[] = useMemo(() => {
    const bySeries = new Map<string, { name?: string; color?: string; marks: Mark[] }>();
    bars.forEach((bar) => {
      const key = String(bar.seriesId);
      let entry = bySeries.get(key);
      if (!entry) { entry = { name: bar.seriesName, color: bar.color, marks: [] }; bySeries.set(key, entry); }
      const rectX = bar.x + padding.left;
      const rectY = bar.y + padding.top;
      // Only tooltip.formatter and tooltip.show are honored here; per-chart tooltip
      // styling (backgroundColor/textColor/fontSize/…) is not, because the tooltip is
      // rendered by the shared/global ChartActiveTooltip. When the formatter returns a
      // string it becomes formattedValue; a ReactNode becomes customTooltip. Falls back
      // to valueFormatter / formatNumber.
      const tf = tooltip?.formatter?.(bar.datum);
      entry.marks.push({
        id: bar.globalIndex,
        pixel: { x: rectX + bar.width / 2, y: rectY + bar.height / 2 },
        value: bar.originalValue,
        datum: bar,
        label: bar.seriesName ?? String(bar.datum.category),
        color: bar.color,
        extent: { rect: { x: rectX, y: rectY, width: bar.width, height: bar.height }, cell: { row: 0, col: bar.categoryIndex } },
        formattedValue: typeof tf === 'string'
          ? tf
          : (valueFormatter ? String(valueFormatter(bar.originalValue, bar.datum, bar.globalIndex)) : formatNumber(bar.originalValue)),
        ...(tf != null && typeof tf !== 'string' ? { customTooltip: tf } : {}),
      });
    });
    return Array.from(bySeries.entries()).map(([id, e]) => ({ id, name: e.name, color: e.color || '', visible: true, marks: e.marks }));
  }, [bars, padding.left, padding.top, valueFormatter, tooltip]);

  const tester = useMemo(
    () => new BandCategoryHitTester(hitSeries, { orientation: orientation === 'vertical' ? 'x' : 'y' }),
    [hitSeries, orientation]
  );

  useEffect(() => {
    if (!register) return;
    register('bar', { frame: { kind: 'cartesian' } as any, geometry: { kind: 'band', orientation: orientation === 'vertical' ? 'x' : 'y' }, series: hitSeries });
    return () => register('bar', null);
  }, [register, hitSeries, orientation]);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding,
    plotWidth,
    plotHeight,
    enabled: Boolean(interaction) && !disabled,
    hover: true,
    press: true,
    tester,
    onPointer: (_e, target) => setHovered(target ? (target.datum as ComputedBar).globalIndex : null),
    onLeave: () => setHovered(null),
    onPress: (e, target) => { if (target) handlePress(target.datum as ComputedBar, (e.raw as any)?.nativeEvent ?? e.raw); },
  });

  useEffect(() => {
    if (hoveredRef.current == null) return;
    if (!bars.some((bar) => bar.globalIndex === hoveredRef.current)) setHovered(null);
  }, [bars, setHovered]);

  const thresholdsBack = useMemo(() => thresholdsConfig.filter((threshold) => threshold.position === 'back'), [thresholdsConfig]);
  const thresholdsFront = useMemo(() => thresholdsConfig.filter((threshold) => threshold.position === 'front'), [thresholdsConfig]);

  const renderThresholds = useCallback(
    (collection: typeof thresholdsConfig) =>
      collection.map((threshold) => {
        if (orientation === 'vertical') {
          const y = valueScaleY(threshold.value);
          if (!Number.isFinite(y)) return null;
          return (
            <React.Fragment key={threshold.key}>
              <Line
                x1={0}
                x2={plotWidth}
                y1={y}
                y2={y}
                stroke={threshold.color}
                strokeWidth={threshold.width}
                strokeDasharray={threshold.style === 'dashed' ? '4 4' : undefined}
              />
              {threshold.label && (
                <SvgText
                  x={plotWidth - 4}
                  y={y - threshold.labelOffset}
                  fill={threshold.color}
                  fontSize={11}
                  textAnchor="end"
                >
                  {threshold.label}
                </SvgText>
              )}
            </React.Fragment>
          );
        }
        const x = valueScaleX(threshold.value);
        if (!Number.isFinite(x)) return null;
        return (
          <React.Fragment key={threshold.key}>
            <Line
              x1={x}
              x2={x}
              y1={0}
              y2={plotHeight}
              stroke={threshold.color}
              strokeWidth={threshold.width}
              strokeDasharray={threshold.style === 'dashed' ? '4 4' : undefined}
            />
            {threshold.label && (
              <SvgText
                x={x + threshold.labelOffset}
                y={12}
                fill={threshold.color}
                fontSize={11}
              >
                {threshold.label}
              </SvgText>
            )}
          </React.Fragment>
        );
      }),
    [orientation, plotWidth, plotHeight, valueScaleX, valueScaleY]
  );

  const legendItems = useMemo(() => {
    if (!legend?.show) return [] as Array<{ label: string; color: string; visible?: boolean }>;
    if (legend.items && legend.items.length > 0) {
      return legend.items.map((item) => ({
        label: item.label,
        color: item.color,
        visible: item.visible !== false,
      }));
    }
    return normalizedSeries.map((seriesItem) => {
      const sample = seriesItem.points.find((point) => !point.isSynthetic);
      const palette = theme.colors.accentPalette ?? colorSchemes.default;
      return {
        label: resolvedSeries[seriesItem.seriesIndex]?.name ?? seriesItem.name,
        color:
          sample?.color ||
          resolvedSeries[seriesItem.seriesIndex]?.color ||
          barColor ||
          getColorFromScheme(seriesItem.seriesIndex, palette),
        visible: !hiddenSeries.has(seriesItem.id),
      };
    });
  }, [legend, normalizedSeries, hiddenSeries, resolvedSeries, theme.colors.accentPalette, barColor]);

  const handleLegendPress = useCallback(
    (_item: any, index: number, nativeEvent?: any) => {
      if (!allowLegendToggles || !autoLegend) return;
      const targetSeries = normalizedSeries[index];
      if (!targetSeries) return;

      setHiddenSeries((prev) => {
        const currentlyVisible = normalizedSeries.filter((seriesItem) => !prev.has(seriesItem.id));
        if (nativeEvent?.shiftKey) {
          if (currentlyVisible.length === 1 && currentlyVisible[0].id === targetSeries.id) {
            return new Set();
          }
          const next = new Set<string>();
          normalizedSeries.forEach((seriesItem) => {
            if (seriesItem.id !== targetSeries.id) next.add(seriesItem.id);
          });
          return next;
        }
        const next = new Set(prev);
        if (next.has(targetSeries.id)) {
          next.delete(targetSeries.id);
        } else {
          next.add(targetSeries.id);
          if (next.size === normalizedSeries.length) {
            return new Set();
          }
        }
        return next;
      });
    },
    [allowLegendToggles, autoLegend, normalizedSeries]
  );

  const valueAxisTickSize = yAxis?.tickLength ?? 4;
  const categoryAxisTickSize = xAxis?.tickLength ?? 4;
  const axisTickPadding = 4;

  return (
    <ChartContainer
      width={width}
      height={height}
      padding={padding}
      disabled={disabled}
      animationDuration={animationDuration}
      style={style}
      interactionConfig={{ multiTooltip: true, enableCrosshair: true, liveTooltip: tooltip?.show === false ? false : true }}
      {...rest}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

      {grid && (
        <Grid
          grid={{ show: true, ...grid, color: grid.color || theme.colors.grid }}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          padding={padding}
          xTicks={gridXTicks}
          yTicks={gridYTicks}
        />
      )}

      {orientation === 'vertical' ? (
        <>
          {yAxis?.show !== false && (
            <Axis
              scale={valueScaleY}
              orientation="left"
              length={plotHeight}
              offset={{
                x: padding.left - valueAxisTickSize - axisTickPadding - 6,
                y: padding.top,
              }}
              tickCount={valueTicks.length}
              tickSize={valueAxisTickSize}
              tickPadding={axisTickPadding}
              tickFormat={(val) =>
                yAxis?.labelFormatter ? yAxis.labelFormatter(Number(val)) : formatNumber(Number(val))
              }
              showLabels={yAxis?.showLabels !== false}
              showTicks={yAxis?.showTicks !== false}
              stroke={yAxis?.color || theme.colors.grid}
              strokeWidth={yAxis?.thickness ?? 1}
              label={yAxis?.title}
              labelOffset={yAxis?.title ? (yAxis?.titleFontSize ?? 12) + 20 : 30}
              tickLabelColor={yAxis?.labelColor}
              tickLabelFontSize={yAxis?.labelFontSize}
              labelColor={yAxis?.titleColor}
              labelFontSize={yAxis?.titleFontSize}
              style={{ width: padding.left, height: plotHeight }}
            />
          )}

          {xAxis?.show !== false && (
            <Axis
              scale={categoryScaleX}
              orientation="bottom"
              length={plotWidth}
              offset={{ x: padding.left, y: padding.top + plotHeight }}
              tickCount={categories.length}
              tickSize={categoryAxisTickSize}
              tickPadding={axisTickPadding}
              tickFormat={(val) => {
                const index = Math.round(Number(val));
                return categories[index] ?? '';
              }}
              showLabels={xAxis?.showLabels !== false}
              showTicks={xAxis?.showTicks !== false}
              stroke={xAxis?.color || theme.colors.grid}
              strokeWidth={xAxis?.thickness ?? 1}
              label={xAxis?.title}
              labelOffset={xAxis?.title ? (xAxis?.titleFontSize ?? 12) + 20 : 40}
              tickLabelColor={xAxis?.labelColor}
              tickLabelFontSize={xAxis?.labelFontSize}
              labelColor={xAxis?.titleColor}
              labelFontSize={xAxis?.titleFontSize}
            />
          )}
        </>
      ) : (
        <>
          {yAxis?.show !== false && (
            <Axis
              scale={categoryScaleY}
              orientation="left"
              length={plotHeight}
              offset={{
                x: padding.left - categoryAxisTickSize - axisTickPadding - 6,
                y: padding.top,
              }}
              tickCount={categories.length}
              tickSize={categoryAxisTickSize}
              tickPadding={axisTickPadding}
              tickFormat={(val) => {
                const index = Math.round(Number(val));
                return categories[index] ?? '';
              }}
              showLabels={yAxis?.showLabels !== false}
              showTicks={yAxis?.showTicks !== false}
              stroke={yAxis?.color || theme.colors.grid}
              strokeWidth={yAxis?.thickness ?? 1}
              label={yAxis?.title}
              labelOffset={yAxis?.title ? (yAxis?.titleFontSize ?? 12) + 20 : 30}
              tickLabelColor={yAxis?.labelColor}
              tickLabelFontSize={yAxis?.labelFontSize}
              labelColor={yAxis?.titleColor}
              labelFontSize={yAxis?.titleFontSize}
              style={{ width: padding.left, height: plotHeight }}
            />
          )}

          {xAxis?.show !== false && (
            <Axis
              scale={valueScaleX}
              orientation="bottom"
              length={plotWidth}
              offset={{ x: padding.left, y: padding.top + plotHeight }}
              tickCount={valueTicks.length}
              tickSize={valueAxisTickSize}
              tickPadding={axisTickPadding}
              tickFormat={(val) =>
                xAxis?.labelFormatter ? xAxis.labelFormatter(Number(val)) : formatNumber(Number(val))
              }
              showLabels={xAxis?.showLabels !== false}
              showTicks={xAxis?.showTicks !== false}
              stroke={xAxis?.color || theme.colors.grid}
              strokeWidth={xAxis?.thickness ?? 1}
              label={xAxis?.title}
              labelOffset={xAxis?.title ? (xAxis?.titleFontSize ?? 12) + 20 : 40}
              tickLabelColor={xAxis?.labelColor}
              tickLabelFontSize={xAxis?.labelFontSize}
              labelColor={xAxis?.titleColor}
              labelFontSize={xAxis?.titleFontSize}
            />
          )}
        </>
      )}

      <Svg
        width={plotWidth}
        height={plotHeight}
        style={{ position: 'absolute', left: padding.left, top: padding.top }}
      >
        {thresholdsBack.length > 0 && renderThresholds(thresholdsBack)}
        <G>
          {bars.map((bar) => {
            const isHovered = hoveredIndex === bar.globalIndex;
            const isPressed = pressedIndex === bar.globalIndex;
            const stroke = isHovered ? theme.colors.accentPalette?.[0] || '#6366f1' : 'transparent';
            const opacity = isPressed ? 0.85 : isHovered ? 0.95 : 1;
            const targetScale = barScaleTargets[bar.globalIndex] ?? 1;

            return (
              <AnimatedBarRect
                key={`${bar.seriesId}-${bar.globalIndex}`}
                bar={bar}
                orientation={orientation}
                animationProgress={animationProgress}
                targetScale={targetScale}
                borderRadius={barBorderRadius}
                fill={bar.color}
                opacity={opacity}
                stroke={stroke}
                strokeWidth={isHovered ? 1.5 : 0}
              />
            );
          })}
        </G>

        {showValueLabels &&
          bars.map((bar) => {
            const labelText = valueLabelFormatter(bar.originalValue, bar.datum, bar.globalIndex);
            if (labelText == null || labelText === '') return null;

            const textKey = `${bar.seriesId}-${bar.datum.id ?? `${bar.category}-${bar.globalIndex}`}-label`;
            const isVertical = orientation === 'vertical';
            const useInside = valueLabelInside
              ? isVertical
                ? bar.height >= valueLabelFontSize * 1.6
                : bar.width >= valueLabelFontSize * 2.2
              : false;
            let x: number;
            let y: number;
            let textAnchor: 'start' | 'middle' | 'end';
            let alignmentBaseline: 'middle' | 'baseline' | 'hanging';

            if (isVertical) {
              x = bar.x + bar.width / 2;
              textAnchor = 'middle';
              if (useInside) {
                y = bar.y + bar.height / 2;
                alignmentBaseline = 'middle';
              } else {
                y = bar.y - valueLabelOffset;
                alignmentBaseline = 'baseline';
              }
            } else {
              y = bar.y + bar.height / 2;
              alignmentBaseline = 'middle';
              if (useInside) {
                x = bar.x + bar.width - valueLabelOffset;
                textAnchor = 'end';
              } else {
                x = bar.x + bar.width + valueLabelOffset;
                textAnchor = 'start';
              }
            }

            return (
              <SvgText
                key={textKey}
                x={x}
                y={y}
                fill={valueLabelColor}
                fontSize={valueLabelFontSize}
                fontWeight={valueLabelFontWeight}
                textAnchor={textAnchor}
                alignmentBaseline={alignmentBaseline}
                pointerEvents="none"
              >
                {labelText}
              </SvgText>
            );
          })}

        {thresholdsFront.length > 0 && renderThresholds(thresholdsFront)}
      </Svg>

      {/* Unified cross-platform gesture surface (web PointerEvents | native
          Responder), driven by useChartPointer + the band hit-tester. Full-chart
          overlay so pointer coords are container-origin, matching the bar rects. */}
      {Boolean(interaction) && !disabled && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="bar-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}

      {legend?.show && legendItems.length > 0 && (
        <ChartLegend
          items={legendItems}
          position={legend.position}
          align={legend.align}
          textColor={legend.textColor}
          fontSize={legend.fontSize}
          onItemPress={allowLegendToggles && autoLegend ? handleLegendPress : undefined}
        />
      )}
    </ChartContainer>
  );
});

BarChart.displayName = 'BarChart';

export default BarChart;
