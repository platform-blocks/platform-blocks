import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import Svg, { Path, Text as SvgText, G, TSpan } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

import {
  FunnelChartProps,
  FunnelChartSeries,
  FunnelLayoutConfig,
  FunnelStep,
  FunnelValueFormatter,
  FunnelConnectorConfig,
  FunnelConversionLabelFormatter,
  FunnelDataTablePayload,
} from './types';
import { ChartInteractionEvent } from '../../types';
import { ChartContainer, ChartTitle, ChartLegend } from '../../ChartBase';
import { useChartInteractionContext, usePointer } from '../../interaction/ChartInteractionContext';
import type { ActiveTarget } from '../../core/hittest/types';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { getColorFromScheme, colorSchemes, formatNumber } from '../../utils';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const LABEL_LINE_GAP = 18;
const DEFAULT_LABEL_OFFSET = 12;

type ComputedSegment = {
  id: string;
  seriesIndex: number;
  seriesId?: string | number;
  seriesName?: string;
  stepIndex: number;
  step: FunnelStep;
  value: number;
  path: string;
  color: string;
  bounds: { x: number; y: number; width: number; height: number };
  labelX: number;
  labelAnchor: 'start' | 'middle' | 'end';
  labelPosition: 'inside' | 'outside-left' | 'outside-right';
  previousValue?: number;
  dropRate: number;
  dropValue: number;
  stepConversion: number;
  cumulativeConversion: number;
  center: { x: number; y: number };
  topCenter: { x: number; y: number };
  bottomCenter: { x: number; y: number };
  slotLeft: number;
  slotWidth: number;
  topWidth: number;
  bottomWidth: number;
  xTop: number;
  xBottom: number;
  height: number;
  trendLabel?: string;
  trendDelta?: number;
  firstValue: number;
};

type FunnelGeometry = {
  segments: ComputedSegment[];
  groups: {
    stepIndex: number;
    y: number;
    height: number;
    segments: ComputedSegment[];
  }[];
  gap: number;
};

function useFunnelGeometry(
  seriesList: FunnelChartSeries[],
  width: number,
  height: number,
  layout: FunnelLayoutConfig | undefined,
  padding: { top: number; bottom: number; left: number; right: number }
): FunnelGeometry {
  return useMemo(() => {
    if (!seriesList.length) {
      return { segments: [], groups: [], gap: layout?.gap ?? 8 };
    }

    const filteredSeries = seriesList
      .map((series) => ({
        ...series,
        steps: (series.steps ?? []).filter((step) => step.value != null),
      }))
      .filter((series) => series.steps.length);

    if (!filteredSeries.length) {
      return { segments: [], groups: [], gap: layout?.gap ?? 8 };
    }

    const plotWidth = Math.max(width - padding.left - padding.right, 0);
    const plotHeight = Math.max(height - padding.top - padding.bottom, 0);
    const shape = layout?.shape ?? 'trapezoid';
    const gap = layout?.gap ?? 8;
    const responsiveBreakpoint = layout?.responsiveBreakpoint;
    const align = responsiveBreakpoint && width < responsiveBreakpoint
      ? 'left'
      : layout?.align ?? 'center';
    const labelMaxWidth = layout?.labelMaxWidth ?? 0;
    const minSegmentHeight = layout?.minSegmentHeight ?? 0;
    const seriesMode = layout?.seriesMode ?? (filteredSeries.length > 1 ? 'grouped' : 'single');
    const groupGap = layout?.groupGap ?? 24;

    const stepCount = filteredSeries.reduce((acc, series) => Math.max(acc, series.steps.length), 0);
    if (!stepCount) {
      return { segments: [], groups: [], gap };
    }

    const availableHeight = plotHeight - gap * (stepCount - 1);
    let segmentHeight = stepCount ? availableHeight / stepCount : 0;
    if (minSegmentHeight > 0 && segmentHeight < minSegmentHeight) {
      segmentHeight = minSegmentHeight;
    }
    const usedHeight = segmentHeight * stepCount + gap * (stepCount - 1);
    const verticalOffset = padding.top + Math.max(0, (plotHeight - usedHeight) / 2);

    const seriesCount = filteredSeries.length;
    const slotGap = seriesMode === 'grouped' ? groupGap : 0;
    const effectivePlotWidth = seriesMode === 'grouped'
      ? plotWidth - Math.max(seriesCount - 1, 0) * slotGap
      : plotWidth;
    const slotWidth = seriesMode === 'grouped' && seriesCount > 0
      ? Math.max(effectivePlotWidth / seriesCount, 0)
      : plotWidth;

    const segments: ComputedSegment[] = [];
    const groups = Array.from({ length: stepCount }, (_, stepIndex) => ({
      stepIndex,
      y: verticalOffset + stepIndex * (segmentHeight + gap),
      height: segmentHeight,
      segments: [] as ComputedSegment[],
    }));

    filteredSeries.forEach((series, seriesIndex) => {
      const slotLeft = seriesMode === 'grouped'
        ? padding.left + seriesIndex * (slotWidth + slotGap)
        : padding.left;

      const steps = series.steps;
      if (!steps.length) return;

      const maxValue = Math.max(...steps.map((step) => step.value), 1);
      const firstValue = steps[0]?.value ?? 1;

      steps.forEach((step, stepIndex) => {
        const topValue = step.value;
        const bottomValue = steps[stepIndex + 1]?.value ?? topValue;
        const topWidth = maxValue > 0 ? (topValue / maxValue) * slotWidth : 0;
        const bottomWidth = shape === 'bar' ? topWidth : maxValue > 0 ? (bottomValue / maxValue) * slotWidth : 0;

        const previousValue = steps[stepIndex - 1]?.value;
        const dropValue = previousValue != null ? Math.max(previousValue - topValue, 0) : 0;
        const dropRate = previousValue && previousValue > 0 ? dropValue / previousValue : 0;
        const stepConversion = previousValue && previousValue > 0 ? topValue / previousValue : 1;
        const cumulativeConversion = firstValue > 0 ? topValue / firstValue : 1;

        const group = groups[stepIndex];
        const y = group.y;

        const computeX = (segmentWidth: number) => {
          if (align === 'left') {
            return slotLeft;
          }
          if (align === 'right') {
            return slotLeft + Math.max(0, slotWidth - segmentWidth);
          }
          return slotLeft + Math.max(0, (slotWidth - segmentWidth) / 2);
        };

        const xTop = computeX(topWidth);
        const xBottom = computeX(bottomWidth);

        const topCenter = { x: xTop + topWidth / 2, y };
        const bottomCenter = { x: xBottom + bottomWidth / 2, y: y + segmentHeight };

        const intrinsicLabelAnchor: 'start' | 'middle' | 'end' = align === 'left'
          ? 'start'
          : align === 'right'
            ? 'end'
            : 'middle';

        const requestedLabelPosition = step.labelPosition ?? 'inside';
        let resolvedLabelPosition = requestedLabelPosition;
        let labelAnchor: 'start' | 'middle' | 'end' = intrinsicLabelAnchor;
        let labelX = (topCenter.x + bottomCenter.x) / 2;

        if (resolvedLabelPosition === 'outside-left') {
          labelAnchor = 'end';
          labelX = Math.min(xTop, xBottom) - DEFAULT_LABEL_OFFSET;
        }
        if (resolvedLabelPosition === 'outside-right') {
          labelAnchor = 'start';
          labelX = Math.max(xTop + topWidth, xBottom + bottomWidth) + DEFAULT_LABEL_OFFSET;
        }

        if (resolvedLabelPosition === 'inside' && labelMaxWidth > 0) {
          const widestSection = Math.max(topWidth, bottomWidth);
          if (widestSection < labelMaxWidth) {
            resolvedLabelPosition = align === 'right' ? 'outside-left' : 'outside-right';
            if (resolvedLabelPosition === 'outside-left') {
              labelAnchor = 'end';
              labelX = Math.min(xTop, xBottom) - DEFAULT_LABEL_OFFSET;
            } else {
              labelAnchor = 'start';
              labelX = Math.max(xTop + topWidth, xBottom + bottomWidth) + DEFAULT_LABEL_OFFSET;
            }
          }
        }

        const color = step.color
          || series.color
          || getColorFromScheme(seriesIndex * steps.length + stepIndex, colorSchemes.default);

        const path = `M ${xTop} ${y} L ${xTop + topWidth} ${y} L ${xBottom + bottomWidth} ${y + segmentHeight} L ${xBottom} ${y + segmentHeight} Z`;

        const segment: ComputedSegment = {
          id: `${series.id ?? seriesIndex}-${step.label ?? stepIndex}`,
          seriesIndex,
          seriesId: series.id,
          seriesName: series.name,
          stepIndex,
          step,
          value: topValue,
          path,
          color,
          bounds: {
            x: Math.min(xTop, xBottom),
            y,
            width: Math.max(xTop + topWidth, xBottom + bottomWidth) - Math.min(xTop, xBottom),
            height: segmentHeight,
          },
          labelX,
          labelAnchor,
          labelPosition: resolvedLabelPosition,
          previousValue,
          dropRate,
          dropValue,
          stepConversion,
          cumulativeConversion,
          center: { x: (topCenter.x + bottomCenter.x) / 2, y: y + segmentHeight / 2 },
          topCenter,
          bottomCenter,
          slotLeft,
          slotWidth,
          topWidth,
          bottomWidth,
          xTop,
          xBottom,
          height: segmentHeight,
          trendLabel: step.trendLabel,
          trendDelta: step.trendDelta,
          firstValue,
        };

        segments.push(segment);
        group.segments.push(segment);
      });
    });

    return { segments, groups, gap };
  }, [seriesList, width, height, layout, padding]);
}

// Animated funnel segment component
const AnimatedFunnelSegment: React.FC<{
  segment: ComputedSegment;
  animationProgress: SharedValue<number>;
  showConversion: boolean;
  valueFormatter?: FunnelValueFormatter;
  steps: FunnelStep[];
  disabled: boolean;
  onHover?: (event?: any) => void;
  onHoverOut?: () => void;
  onPress?: (event?: any) => void;
  theme: ReturnType<typeof useChartTheme>;
}> = React.memo(({ segment, animationProgress, showConversion, valueFormatter, steps, disabled, onHover, onHoverOut, onPress, theme }) => {
  const scale = useSharedValue(disabled ? 1 : 0);

  useEffect(() => {
    if (disabled) {
      scale.value = 1;
      return;
    }
  const delay = segment.stepIndex * 200; // Stagger animation
    scale.value = withDelay(delay, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));
  }, [disabled, segment.stepIndex, scale]);

  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value * scale.value;
    
    // Scale the path from center
    if (progress === 0) {
      return { d: '', opacity: 0 } as any;
    }
    
    return {
      d: segment.path,
      opacity: progress,
    } as any;
  }, [segment.path]);

  const isWeb = Platform.OS === 'web';
  const midY = segment.center.y;

  const labelLines = useMemo(() => {
    const context = {
      index: segment.stepIndex,
      step: segment.step,
      steps,
      previousValue: segment.previousValue,
      firstValue: steps[0]?.value ?? segment.value,
      conversion: segment.cumulativeConversion,
      dropRate: segment.dropRate,
      dropValue: segment.dropValue,
    };

    const normalizeLines = (input: string | string[] | undefined) => {
      if (!input) return [] as string[];
      if (Array.isArray(input)) {
        return input
          .map(line => (line == null ? '' : `${line}`.trim()))
          .filter(line => line.length > 0);
      }
      return `${input}`
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    };

    const customLines = valueFormatter
      ? normalizeLines(valueFormatter(segment.value, segment.stepIndex, context))
      : [];

    if (customLines.length) {
      const [firstLine, ...rest] = customLines;
      return [
        `${segment.step.label}: ${firstLine}`,
        ...rest,
      ];
    }

    const baseLine = `${segment.step.label}: ${formatNumber(segment.value)}`;
    if (showConversion) {
      return [
        `${baseLine} (${(segment.cumulativeConversion * 100).toFixed(1)}%)`,
      ];
    }
    const lines = [baseLine];
    if (segment.stepConversion !== 1 || segment.stepIndex > 0) {
      lines.push(`Step retained ${(segment.stepConversion * 100).toFixed(1)}%`);
    }
    if (segment.trendLabel) {
      lines.push(segment.trendLabel);
    } else if (segment.trendDelta != null) {
      const arrow = segment.trendDelta > 0 ? '▲' : segment.trendDelta < 0 ? '▼' : '◆';
      const magnitude = Math.abs(segment.trendDelta * 100).toFixed(1);
      lines.push(`Trend ${arrow} ${magnitude}%`);
    }
    return lines;
  }, [segment, steps, valueFormatter, showConversion]);

  const totalLabelHeight = (labelLines.length - 1) * LABEL_LINE_GAP;
  const startY = midY - totalLabelHeight / 2;

  return (
    <G
      testID={`funnel-segment-${segment.id}`}
      {...((isWeb ? {
        onMouseEnter: onHover,
        onMouseMove: onHover,
        onMouseLeave: onHoverOut,
        onClick: onPress,
      } : {
        onPressIn: onHover,
        onPressOut: onHoverOut,
        onPress,
      }) as Record<string, any>)}
    >
      <AnimatedPath
        animatedProps={animatedProps}
        fill={segment.color}
        stroke={segment.color}
        strokeWidth={1}
      />
      
      {/* Label text */}
      <SvgText
        x={segment.labelX}
        y={startY}
        fontSize={theme.fontSize.sm}
        fill={theme.colors.textPrimary}
        fontFamily={theme.fontFamily}
        textAnchor={segment.labelAnchor as any}
      >
        {labelLines.map((line, idx) => (
          <TSpan
            key={`${segment.id}-${idx}-${line}`}
            x={segment.labelX}
            dy={idx === 0 ? 0 : LABEL_LINE_GAP}
            fontSize={idx === 0 ? theme.fontSize.sm : theme.fontSize.xs}
            fill={idx === 0 ? theme.colors.textPrimary : theme.colors.textSecondary}
            fontWeight={idx === 0 ? '600' : '400'}
          >
            {line}
          </TSpan>
        ))}
      </SvgText>
    </G>
  );
});

AnimatedFunnelSegment.displayName = 'AnimatedFunnelSegment';
export const FunnelChart: React.FC<FunnelChartProps> = (props) => {
  const {
    series,
    width = 360,
    height = 420,
    title,
    subtitle,
    layout,
    valueFormatter,
    legend,
    style,
    tooltip,
    multiTooltip = true,
    liveTooltip = false,
    enableCrosshair = true,
    disabled = false,
    animationDuration = 800,
    accessibilityTable,
    onDataTable,
    onPress,
    onDataPointPress,
    ...rest
  } = props;

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch {
    interaction = null;
  }
  // FunnelChart resolves the hovered segment from the live pointer — pointer subscription.
  const pointer = usePointer();

  const theme = useChartTheme();

  const updateSeriesVisibility = interaction?.updateSeriesVisibility;
  const setPointer = interaction?.setPointer;
  const setActiveTarget = interaction?.setActiveTarget;
  const setActiveSlice = interaction?.setActiveSlice;

  const seriesArr = useMemo(() => (Array.isArray(series) ? series : [series]), [series]);
  const padding = useMemo(() => ({ top: 50, bottom: 40, left: 40, right: 40 }), []);
  const showConversion = layout?.showConversion !== false;

  const geometry = useFunnelGeometry(seriesArr, width, height, layout, padding);
  const { segments, groups } = geometry;

  const seriesSteps = useMemo(() => {
    return seriesArr.map((entry) => (entry.steps ?? []).filter((step) => step.value != null));
  }, [seriesArr]);

  const stepsForLegend = seriesSteps[0] ?? [];

  const connectors = useMemo(() => {
    const config: FunnelConnectorConfig | undefined = layout?.connectors;
    const shouldShow = config?.show ?? true;
    if (!shouldShow || segments.length === 0) return [] as {
      id: string;
      path: string;
      labelLines: string[];
      position: { x: number; y: number };
      labelAnchor: 'start' | 'middle' | 'end';
      seriesIndex: number;
      fromId: string;
      toId: string;
    }[];

    const bySeries = new Map<number, ComputedSegment[]>();
    segments.forEach((segment) => {
      const collection = bySeries.get(segment.seriesIndex) ?? [];
      collection.push(segment);
      bySeries.set(segment.seriesIndex, collection);
    });
    const formatter: FunnelConversionLabelFormatter = config?.labelFormatter
      ?? ((context) => [
        `Retained ${(context.stepConversion * 100).toFixed(1)}%`,
        `Drop ${(context.dropRate * 100).toFixed(1)}%`,
      ]);

    const labelOffset = config?.labelOffset ?? 10;

    const connectorsList: {
      id: string;
      path: string;
      labelLines: string[];
      position: { x: number; y: number };
      labelAnchor: 'start' | 'middle' | 'end';
      seriesIndex: number;
      fromId: string;
      toId: string;
    }[] = [];

    bySeries.forEach((seriesSegments, seriesIndex) => {
      const ordered = [...seriesSegments].sort((a, b) => a.stepIndex - b.stepIndex);
      ordered.forEach((fromSegment, idx) => {
        const toSegment = ordered[idx + 1];
        if (!toSegment) return;

        const context = {
          index: toSegment.stepIndex,
          from: fromSegment.step,
          to: toSegment.step,
          cumulativeConversion: toSegment.cumulativeConversion,
          stepConversion: toSegment.stepConversion,
          dropRate: toSegment.dropRate,
          fromValue: fromSegment.value,
          toValue: toSegment.value,
          goal: undefined,
        };

        const labelLines = formatter(context);
        if (!labelLines || (Array.isArray(labelLines) && labelLines.length === 0)) return;

        const radius = config?.radius ?? 18;
        const start = fromSegment.bottomCenter;
        const end = toSegment.topCenter;
        const controlY1 = start.y + radius;
        const controlY2 = end.y - radius;
        const midPoint = {
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2,
        };

        const labelAnchor: 'start' | 'middle' | 'end' = 'middle';
        const position = {
          x: midPoint.x,
          y: midPoint.y - labelOffset,
        };

        const path = `M ${start.x} ${start.y} C ${start.x} ${controlY1} ${end.x} ${controlY2} ${end.x} ${end.y}`;

        connectorsList.push({
          id: `${fromSegment.id}->${toSegment.id}`,
          path,
          labelLines: Array.isArray(labelLines) ? labelLines : `${labelLines}`.split('\n'),
          position,
          labelAnchor,
          seriesIndex,
          fromId: fromSegment.id,
          toId: toSegment.id,
        });
      });
    });

    return connectorsList;
  }, [layout?.connectors, segments]);

  const animationProgress = useSharedValue(disabled ? 1 : 0);
  const dataSignature = useMemo(
    () => segments.map((segment) => `${segment.id}-${segment.value}-${segment.color}`).join('|'),
    [segments]
  );

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

  const visibleSegments = useMemo(() => {
    if (!interaction?.series) return segments;
    const overrides = new Map(interaction.series.map((entry) => [entry.id, entry.visible])) as Map<string | number, boolean | undefined>;
    return segments.filter((segment) => {
      const override = overrides.get(segment.id);
      return override !== false;
    });
  }, [segments, interaction?.series]);

  const findSegmentAtPoint = useCallback(
    (x: number, y: number) => {
      for (let i = 0; i < visibleSegments.length; i += 1) {
        const segment = visibleSegments[i];
        if (y < segment.bounds.y || y > segment.bounds.y + segment.height) continue;
        const relativeY = segment.height > 0 ? (y - segment.bounds.y) / segment.height : 0;
        const left = segment.xTop + (segment.xBottom - segment.xTop) * relativeY;
        const widthAtY = segment.topWidth + (segment.bottomWidth - segment.topWidth) * relativeY;
        if (x >= left && x <= left + widthAtY) {
          return segment;
        }
      }
      return null;
    },
    [visibleSegments]
  );

  const activeSegment = useMemo(() => {
    if (!pointer?.inside) return null;
    const { x, y } = pointer;
    return findSegmentAtPoint(x, y);
  }, [findSegmentAtPoint, pointer]);

  const handleSegmentHover = useCallback(
    (segment: ComputedSegment | null, event?: any) => {
      if (!segment) {
        if (pointer && setPointer) {
          setPointer({ ...pointer, inside: false });
        }
        setActiveTarget?.(null);
        setActiveSlice?.([]);
        return;
      }

      const midPoint = segment.center;
      // Feed the real page coordinates so the portal tooltip (position: fixed) anchors at
      // the cursor. `segment.center` is container-origin, so using it as page coords would
      // misplace the tooltip; only pass page coords when the event supplies real ones.
      const pageX = event?.pageX ?? event?.nativeEvent?.pageX;
      const pageY = event?.pageY ?? event?.nativeEvent?.pageY;
      setPointer?.({
        x: midPoint.x,
        y: midPoint.y,
        inside: true,
        pageX,
        pageY,
      });
      // Engine-swap: the hovered funnel segment is a single ActiveTarget (segment geometry).
      const name = seriesArr.length > 1
        ? `${segment.step.label} (${segment.seriesName ?? `Series ${segment.seriesIndex + 1}`})`
        : segment.step.label;
      // Only tooltip.formatter + tooltip.show are honored per-chart; styling props
      // (backgroundColor/textColor/etc.) are resolved globally by ChartActiveTooltip.
      const tf = tooltip?.formatter?.(segment.step);
      const defaultTooltip = `${name} · ${segment.value} · ${(segment.cumulativeConversion * 100).toFixed(1)}% of first step`;
      const target: ActiveTarget = {
        seriesId: segment.seriesId ?? segment.seriesIndex,
        markId: segment.id,
        kind: 'cell',
        datum: segment,
        pixel: { x: midPoint.x, y: midPoint.y },
        value: segment.value,
        distance: 0,
        label: name,
        color: segment.color,
        formattedValue: typeof tf === 'string' ? tf : `${segment.value}`,
        customTooltip: tf != null ? tf : defaultTooltip,
        categoryIndex: segment.stepIndex,
      };
      setActiveTarget?.(target);
      setActiveSlice?.([target]);
    },
    [pointer, setPointer, setActiveTarget, setActiveSlice, seriesArr.length, tooltip]
  );

  const handleSegmentHoverOut = useCallback(() => handleSegmentHover(null), [handleSegmentHover]);

  const handleSegmentPress = useCallback(
    (segment: ComputedSegment, nativeEvent?: any) => {
      if (!onPress && !onDataPointPress) return;
      // Normalized 0-1 center of the segment (container-origin geometry / chart size).
      const chartX = width > 0 ? segment.center.x / width : 0;
      const chartY = height > 0 ? segment.center.y / height : 0;
      const event: ChartInteractionEvent<FunnelStep> = {
        nativeEvent: (nativeEvent?.nativeEvent ?? nativeEvent) as any,
        chartX,
        chartY,
        dataX: segment.stepIndex,
        dataY: segment.value,
        dataPoint: segment.step,
        distance: 0,
      };
      onDataPointPress?.(segment.step, event);
      onPress?.(event);
    },
    [onPress, onDataPointPress, width, height]
  );

  const connectorVisibility = useMemo(() => {
    if (!interaction?.series) return new Set<string>();
    const hiddenIds = new Set<string>();
    interaction.series.forEach((entry) => {
      if (entry.visible === false) hiddenIds.add(`${entry.id}`);
    });
    return hiddenIds;
  }, [interaction?.series]);

  const dataTable = useMemo<FunnelDataTablePayload[]>(() => {
    const bySeries = new Map<number, FunnelDataTablePayload>();
    segments.forEach((segment) => {
      const existing = bySeries.get(segment.seriesIndex);
      const row = {
        label: segment.step.label,
        value: segment.value,
        cumulativeConversion: segment.cumulativeConversion,
        stepConversion: segment.stepConversion,
        dropRate: segment.dropRate,
        dropValue: segment.dropValue,
        trendDelta: segment.trendDelta,
        trendLabel: segment.trendLabel,
      };
      if (!existing) {
        bySeries.set(segment.seriesIndex, {
          seriesId: segment.seriesId,
          seriesName: segment.seriesName,
          rows: [row],
        });
      } else {
        existing.rows.push(row);
      }
    });
    return Array.from(bySeries.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, payload]) => ({
        ...payload,
        rows: payload.rows.sort((a, b) => {
          const stepA = segments.find((segment) => segment.step.label === a.label)?.stepIndex ?? 0;
          const stepB = segments.find((segment) => segment.step.label === b.label)?.stepIndex ?? 0;
          return stepA - stepB;
        }),
      }));
  }, [segments]);

  useEffect(() => {
    if (onDataTable) {
      onDataTable(dataTable);
    }
  }, [dataTable, onDataTable]);

  const visibleSegmentIds = useMemo(() => new Set(visibleSegments.map((segment) => segment.id)), [visibleSegments]);

  return (
    <ChartContainer
      {...rest}
      width={width}
      height={height}
      style={style}
      interactionConfig={{ multiTooltip, liveTooltip: tooltip?.show === false ? false : liveTooltip, enableCrosshair }}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute' }}
        // @ts-expect-error web events
        onMouseMove={(e) => {
          const rect = (e.currentTarget as any).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const segmentAtPoint = findSegmentAtPoint(x, y);
          if (segmentAtPoint) {
            handleSegmentHover(segmentAtPoint, e);
          } else if (pointer?.inside) {
            handleSegmentHover(null);
          }
        }}
        onMouseLeave={() => {
          handleSegmentHover(null);
        }}
      >
        <G>
          {/* Stage connectors */}
          {connectors.map((connector) => {
            if (
              connectorVisibility.has(connector.fromId) ||
              connectorVisibility.has(connector.toId) ||
              !visibleSegmentIds.has(connector.fromId) ||
              !visibleSegmentIds.has(connector.toId)
            ) {
              return null;
            }

            const stroke = layout?.connectors?.stroke ?? theme.colors.grid ?? '#CBD5F5';
            const strokeWidth = layout?.connectors?.strokeWidth ?? 2;

            return (
              <G key={connector.id} pointerEvents="none">
                <Path d={connector.path} stroke={stroke} strokeWidth={strokeWidth} fill="none" opacity={0.65} />
                {connector.labelLines.map((line, lineIndex) => (
                  <SvgText
                    key={`${connector.id}-label-${lineIndex}`}
                    x={connector.position.x}
                    y={connector.position.y + lineIndex * LABEL_LINE_GAP}
                    fontSize={lineIndex === 0 ? theme.fontSize.xs : theme.fontSize.xs - 1}
                    fill={theme.colors.textSecondary}
                    textAnchor={connector.labelAnchor}
                  >
                    {line}
                  </SvgText>
                ))}
              </G>
            );
          })}

          {/* Funnel segments */}
          {segments.map((segment) => {
            if (!visibleSegmentIds.has(segment.id)) return null;
            const seriesStepsForSegment = seriesSteps[segment.seriesIndex] ?? [];

            return (
              <AnimatedFunnelSegment
                key={segment.id}
                segment={segment}
                animationProgress={animationProgress}
                showConversion={showConversion}
                valueFormatter={valueFormatter}
                steps={seriesStepsForSegment}
                disabled={disabled}
                onHover={(e?: any) => handleSegmentHover(segment, e)}
                onHoverOut={handleSegmentHoverOut}
                onPress={(e?: any) => handleSegmentPress(segment, e)}
                theme={theme}
              />
            );
          })}

          {/* Highlight active segment */}
          {activeSegment && (
            <Path d={activeSegment.path} fill="none" stroke="#111827" strokeWidth={2} pointerEvents="none" />
          )}
        </G>
      </Svg>

      {legend?.show !== false && segments.length > 0 && (
        <ChartLegend
          items={(() => {
            if (seriesArr.length > 1) {
              return seriesArr.map((entry, index) => {
                const seriesSegments = segments.filter((segment) => segment.seriesIndex === index);
                const visible = seriesSegments.some((segment) => visibleSegmentIds.has(segment.id));
                return {
                  label: entry.name ?? `Series ${index + 1}`,
                  color:
                    seriesSegments[0]?.color ?? entry.color ?? getColorFromScheme(index, colorSchemes.default),
                  visible,
                };
              });
            }

            return stepsForLegend.map((step, idx) => {
              const segment = segments.find((candidate) => candidate.seriesIndex === 0 && candidate.stepIndex === idx);
              const visible = segment ? visibleSegmentIds.has(segment.id) : true;
              return {
                label: step.label,
                color: segment?.color ?? step.color ?? getColorFromScheme(idx, colorSchemes.default),
                visible,
              };
            });
          })()}
          position={legend?.position}
          align={legend?.align}
          onItemPress={(item, index, nativeEvent) => {
            if (!updateSeriesVisibility) return;

            if (seriesArr.length > 1) {
              const seriesSegments = segments.filter((segment) => segment.seriesIndex === index);
              if (!seriesSegments.length) return;

              const isVisible = seriesSegments.some((segment) => visibleSegmentIds.has(segment.id));
              seriesSegments.forEach((segment) => updateSeriesVisibility(segment.id, !isVisible));
              return;
            }

            const segment = segments.find((candidate) => candidate.seriesIndex === 0 && candidate.stepIndex === index);
            if (!segment) return;

            const isVisible = visibleSegmentIds.has(segment.id);
            const isolate = nativeEvent?.shiftKey;

            if (isolate) {
              segments
                .filter((candidate) => candidate.seriesIndex === 0)
                .forEach((candidate) => updateSeriesVisibility(candidate.id, candidate.id === segment.id ? true : !isVisible));
            } else {
              updateSeriesVisibility(segment.id, !isVisible);
            }
          }}
        />
      )}

      {Platform.OS === 'web' && (accessibilityTable?.show ?? true) && dataTable.length > 0
        ? React.createElement(
            'div',
            {
              id: accessibilityTable?.id,
              role: 'presentation',
              style: {
                position: 'absolute',
                left: -9999,
                width: 1,
                height: 1,
                overflow: 'hidden',
              },
            },
            dataTable.map((payload, payloadIndex) =>
              React.createElement(
                'table',
                {
                  key: `${payload.seriesId ?? `series-${payloadIndex}`}`,
                  role: 'table',
                  'aria-label': accessibilityTable?.summary ?? `${title ?? 'Funnel'} data ${payload.seriesName ?? ''}`,
                  style: { borderCollapse: 'collapse', marginBottom: '8px' },
                },
                [
                  React.createElement(
                    'thead',
                    { key: 'head' },
                    React.createElement(
                      'tr',
                      { key: 'header-row' },
                      ['Stage', 'Value', 'Retained vs. start', 'Retained vs. prior', 'Drop value'].map((header) =>
                        React.createElement('th', { key: header, style: { textAlign: 'left', paddingRight: '12px' } }, header)
                      )
                    )
                  ),
                  React.createElement(
                    'tbody',
                    { key: 'body' },
                    payload.rows.map((row, rowIndex) =>
                      React.createElement(
                        'tr',
                        { key: `${payloadIndex}-${rowIndex}` },
                        [
                          React.createElement('td', { key: 'label' }, row.label),
                          React.createElement('td', { key: 'value' }, formatNumber(row.value)),
                          React.createElement('td', { key: 'cum' }, `${(row.cumulativeConversion * 100).toFixed(1)}%`),
                          React.createElement('td', { key: 'step' }, `${(row.stepConversion * 100).toFixed(1)}%`),
                          React.createElement('td', { key: 'drop' }, `${row.dropValue.toLocaleString()} (${(row.dropRate * 100).toFixed(1)}%)`),
                        ]
                      )
                    )
                  ),
                ]
              )
            )
          )
        : null}
    </ChartContainer>
  );
};

FunnelChart.displayName = 'FunnelChart';
