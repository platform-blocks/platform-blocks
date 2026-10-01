import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, { SharedValue, useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { MarimekkoChartProps, MarimekkoCategory, MarimekkoSegment, MarimekkoDataPoint } from './types';
import { ChartContainer, ChartTitle, ChartLegend, measureChartTitleBand } from '../../ChartBase';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import type { ActiveTarget } from '../../core/hittest/types';
import { ChartInteractionEvent } from '../../types';
import { linearScale, type Scale } from '../../utils/scales';
import { createColorAssigner } from '../../colors';
import { isChartTouchInput } from '../../interaction/touchInput';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const toNativePointerEvent = (event: any) => {
  const rect = event?.currentTarget?.getBoundingClientRect?.();
  return {
    nativeEvent: {
      locationX: rect ? event.clientX - rect.left : 0,
      locationY: rect ? event.clientY - rect.top : 0,
      pageX: event?.pageX ?? event?.clientX,
      pageY: event?.pageY ?? event?.clientY,
      pointerType: event?.pointerType,
    },
  };
};

interface NormalizedSegment {
  original: MarimekkoSegment;
  id: string | number;
  label: string;
  value: number;
}

interface NormalizedCategory {
  original: MarimekkoCategory;
  id: string | number;
  label: string;
  segments: NormalizedSegment[];
  total: number;
}

interface SegmentDefinition {
  id: string;
  label: string;
  color: string;
}

interface ComputedSegment {
  id: string;
  categoryId: string | number;
  categoryLabel: string;
  categoryIndex: number;
  segmentId: string | number;
  segmentLabel: string;
  segmentIndex: number;
  value: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  center: { x: number; y: number };
  visible: boolean;
  dataPoint: MarimekkoDataPoint;
}

interface ComputedCategory {
  id: string | number;
  label: string;
  index: number;
  x: number;
  width: number;
  center: number;
  share: number;
  visibleShare: number;
  total: number;
  visibleTotal: number;
  original: MarimekkoCategory;
  segments: ComputedSegment[];
}

interface LayoutResult {
  categories: ComputedCategory[];
  segments: ComputedSegment[];
}

const DEFAULT_Y_TICKS = [0, 0.25, 0.5, 0.75, 1];
const DEFAULT_PADDING = { top: 64, right: 32, bottom: 72, left: 88 };
const DEFAULT_ANIMATION_DURATION = 700;

const AnimatedMarimekkoSegment: React.FC<{
  segment: ComputedSegment;
  animation: SharedValue<number>;
  borderRadius: number;
  disabled: boolean;
  onHoverIn: (segment: ComputedSegment, event?: any) => void;
  onHoverOut: (segment: ComputedSegment) => void;
  onPress: (segment: ComputedSegment, event: any) => void;
}> = React.memo(({ segment, animation, borderRadius, disabled, onHoverIn, onHoverOut, onPress }) => {
  if (segment.width <= 0 || segment.height <= 0) {
    return null;
  }

  const animatedProps = useAnimatedProps(() => {
    // Clamped: after a long mount frame the timing animation's first tick can land
    // before its start time, and Easing.out(cubic) goes negative for t < 0.
    const progress = Math.min(1, Math.max(0, animation.value));
    const height = segment.height * progress;
    const y = segment.y + (segment.height - height);
    return {
      x: segment.x,
      y,
      width: segment.width,
      height,
    } as any;
  }, [segment]);

  const isWeb = Platform.OS === 'web';

  return (
    <AnimatedRect
      testID={`marimekko-segment-${segment.id}`}
      animatedProps={animatedProps}
      fill={segment.color}
      rx={borderRadius}
      ry={borderRadius}
      opacity={segment.visible ? 1 : 0}
      pointerEvents={segment.visible ? 'auto' : 'none'}
      {...(isWeb
        ? {
            onPointerEnter: (event: any) => !disabled && onHoverIn(segment, event),
            onPointerMove: (event: any) => !disabled && onHoverIn(segment, event),
            onPointerLeave: () => onHoverOut(segment),
            onPointerDown: (event: any) => {
              if (disabled) return;
              onHoverIn(segment, event);
              event.currentTarget?.setPointerCapture?.(event.pointerId);
            },
            onPointerUp: (event: any) => {
              if (disabled) return;
              event.currentTarget?.releasePointerCapture?.(event.pointerId);
              onPress(segment, toNativePointerEvent(event));
            },
            onPointerCancel: () => onHoverOut(segment),
          }
        : {
            onPressIn: (event: any) => !disabled && onHoverIn(segment, event),
            onPressOut: () => onHoverOut(segment),
            onPress: (event: any) => !disabled && onPress(segment, { nativeEvent: event.nativeEvent }),
          })}
    />
  );
});

AnimatedMarimekkoSegment.displayName = 'MarimekkoSegment';

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

export const MarimekkoChart: React.FC<MarimekkoChartProps> = (props) => {
  const {
    data,
    legend,
    xAxis,
    yAxis,
    grid,
    columnGap = 12,
    segmentBorderRadius = 2,
    categoryLabelFormatter,
    w: width = 640,
    h: height = 400,
    title,
    subtitle,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    disabled = false,
    onPress,
    onDataPointPress,
    style,
    useOwnInteractionProvider,
    suppressPopover,
    padding: paddingProp,
    ...rest
  } = props;

  const theme = useChartTheme();
  const assignColor = useMemo(
    () => createColorAssigner({ hash: true }, theme.colors.accentPalette),
    [theme.colors.accentPalette]
  );
  const interactionConfig = useMemo(() => ({ multiTooltip: true, liveTooltip: true }), []);

  const normalizedCategories = useMemo<NormalizedCategory[]>(() => {
    return data
      .map((category) => {
        if (!category || category.visible === false) {
          return null;
        }
        const segments = Array.isArray(category.segments)
          ? category.segments
              .filter((segment): segment is MarimekkoSegment => !!segment && segment.visible !== false && Number.isFinite(segment.value))
              .map((segment) => ({
                original: segment,
                id: segment.id ?? segment.label,
                label: segment.label,
                value: Math.max(0, Number(segment.value) || 0),
              }))
              .filter((segment) => segment.value > 0)
          : [];
        const total = segments.reduce((acc, segment) => acc + segment.value, 0);
        if (!segments.length || total <= 0) {
          return null;
        }
        return {
          original: category,
          id: category.id ?? category.label,
          label: category.label,
          segments,
          total,
        } satisfies NormalizedCategory;
      })
      .filter((category): category is NormalizedCategory => category != null);
  }, [data]);

  const totalValue = useMemo(() => normalizedCategories.reduce((sum, category) => sum + category.total, 0), [normalizedCategories]);
  const safeTotal = totalValue > 0 ? totalValue : 1;

  const segmentLabelOrder = useMemo(() => {
    const order = new Map<string, number>();
    normalizedCategories.forEach((category) => {
      category.segments.forEach((segment) => {
        if (!order.has(segment.label)) {
          order.set(segment.label, order.size);
        }
      });
    });
    return order;
  }, [normalizedCategories]);

  const colorAssignments = useMemo(() => {
    const map = new Map<string, string>();
    normalizedCategories.forEach((category) => {
      category.segments.forEach((segment) => {
        const override = segment.original.color ?? category.original.color;
        if (!map.has(segment.label)) {
          const index = segmentLabelOrder.get(segment.label) ?? map.size;
          map.set(segment.label, override ?? assignColor(index, segment.label));
        } else if (override) {
          map.set(segment.label, override);
        }
      });
    });
    return map;
  }, [normalizedCategories, segmentLabelOrder, assignColor]);

  const segmentDefinitions = useMemo<SegmentDefinition[]>(() => {
    return Array.from(segmentLabelOrder.entries()).map(([label, index]) => ({
      id: label,
      label,
      color: colorAssignments.get(label) ?? assignColor(index, label),
    }));
  }, [segmentLabelOrder, colorAssignments, assignColor]);

  const padding = paddingProp ?? {
    ...DEFAULT_PADDING,
    top: Math.max(DEFAULT_PADDING.top, measureChartTitleBand(title, subtitle, { containerWidth: width })),
  };
  const plotWidth = Math.max(0, width - padding.left - padding.right);
  const plotHeight = Math.max(0, height - padding.top - padding.bottom);
  const gap = Math.max(0, columnGap);
  const effectiveWidth = Math.max(0, plotWidth - gap * Math.max(normalizedCategories.length - 1, 0));

  const yScale = useMemo(() => linearScale([0, 1], [plotHeight, 0]), [plotHeight]);

  const defaultYAxis = useMemo(() => ({
    show: true,
    showTicks: true,
    showLabels: true,
    title: 'Share of category',
    labelFormatter: (value: number) => `${Math.round(value * 100)}%`,
  }), []);

  const resolvedYAxis = {
    ...defaultYAxis,
    ...(yAxis ?? {}),
    title: yAxis?.title ?? defaultYAxis.title,
    labelFormatter: yAxis?.labelFormatter ?? defaultYAxis.labelFormatter,
  };

  const yTickValues = useMemo(() => {
    if (Array.isArray(yAxis?.ticks) && yAxis.ticks.length) {
      return yAxis.ticks.map((tick) => {
        if (Math.abs(tick) > 1) {
          // Treat as percentage input (0-100)
          return Math.max(0, Math.min(1, tick / 100));
        }
        return Math.max(0, Math.min(1, tick));
      });
    }
    return DEFAULT_Y_TICKS;
  }, [yAxis?.ticks]);

  const defaultXAxis = useMemo(() => ({
    show: true,
    showTicks: true,
    showLabels: true,
  }), []);

  const resolvedXAxis = {
    ...defaultXAxis,
    ...(xAxis ?? {}),
  };

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch { /* noop */ }

  const updateSeriesVisibility = interaction?.updateSeriesVisibility;
  const setPointer = interaction?.setPointer;
  const setActiveTarget = interaction?.setActiveTarget;
  const setActiveSlice = interaction?.setActiveSlice;
  const interactionSeries = interaction?.series;

  const visibilityBySegmentLabel = useMemo(() => {
    const map = new Map<string, boolean>();
    segmentDefinitions.forEach((definition) => {
      const override = interactionSeries?.find((entry) => entry.id === definition.id);
      map.set(definition.label, override ? override.visible !== false : true);
    });
    return map;
  }, [segmentDefinitions, interactionSeries]);

  const visibleTotalValue = useMemo(() => {
    return normalizedCategories.reduce((categoryAcc, category) => {
      const segmentSum = category.segments.reduce((segmentAcc, segment) => {
        return visibilityBySegmentLabel.get(segment.label) === false ? segmentAcc : segmentAcc + segment.value;
      }, 0);
      return categoryAcc + segmentSum;
    }, 0);
  }, [normalizedCategories, visibilityBySegmentLabel]);

  const safeVisibleTotal = visibleTotalValue > 0 ? visibleTotalValue : 1;

  const layout = useMemo<LayoutResult>(() => {
    if (!normalizedCategories.length || plotWidth <= 0 || plotHeight <= 0) {
      return { categories: [], segments: [] };
    }

    const categories: ComputedCategory[] = [];
    const segments: ComputedSegment[] = [];
    let cursor = 0;

    normalizedCategories.forEach((category, categoryIndex) => {
      const share = safeTotal > 0 ? category.total / safeTotal : 0;
      const visibleCategoryTotal = category.segments.reduce((acc, segment) => {
        return visibilityBySegmentLabel.get(segment.label) === false ? acc : acc + segment.value;
      }, 0);
      const effectiveCategoryTotal = visibleCategoryTotal > 0 ? visibleCategoryTotal : category.total;
      const visibleCategoryShare = safeVisibleTotal > 0 && visibleCategoryTotal > 0 ? visibleCategoryTotal / safeVisibleTotal : 0;
      const widthPx = effectiveWidth * share;
      if (widthPx <= 0) {
        return;
      }

      const x = cursor;
      const center = x + widthPx / 2;
      const categorySegments: ComputedSegment[] = [];
      let usedHeight = 0;

      category.segments.forEach((segment, segmentIndex) => {
        const isVisible = visibilityBySegmentLabel.get(segment.label) !== false;
        const shareOfCategory = category.total > 0 ? segment.value / category.total : 0;
        const visibleShareOfCategory = isVisible && effectiveCategoryTotal > 0 ? segment.value / effectiveCategoryTotal : 0;
        const shareOfTotal = safeTotal > 0 ? segment.value / safeTotal : 0;
        const visibleShareOfTotal = isVisible && safeVisibleTotal > 0 ? segment.value / safeVisibleTotal : 0;
        if (!isVisible && visibleShareOfCategory <= 0 && shareOfCategory <= 0) {
          return;
        }
        const segmentTop = plotHeight - usedHeight;
        const heightPx = isVisible ? plotHeight * visibleShareOfCategory : 0;
        if (heightPx < 0.0001 && !isVisible) {
          return;
        }
        const y = segmentTop - heightPx;
        const color = segment.original.color
          ?? category.original.color
          ?? colorAssignments.get(segment.label)
          ?? assignColor(segmentLabelOrder.get(segment.label) ?? segmentIndex, segment.label);
        const visible = isVisible && heightPx > 0;
        const dataPoint: MarimekkoDataPoint = {
          categoryId: category.original.id ?? category.id,
          categoryLabel: category.label,
          categoryIndex,
          categoryValue: category.total,
          categoryShare: share,
          visibleCategoryTotal: effectiveCategoryTotal,
          visibleCategoryShare,
          segmentId: segment.original.id ?? segment.id,
          segmentLabel: segment.label,
          segmentIndex,
          value: segment.value,
          segmentShareOfCategory: shareOfCategory,
          visibleSegmentShareOfCategory: visibleShareOfCategory,
          segmentShareOfTotal: shareOfTotal,
          visibleSegmentShareOfTotal: visibleShareOfTotal,
          color,
          category: category.original,
          segment: segment.original,
          formattedValue: formatNumber(segment.value),
          formattedSegmentShareOfCategory: formatPercent(shareOfCategory),
          formattedVisibleSegmentShareOfCategory: formatPercent(visibleShareOfCategory),
          formattedSegmentShareOfTotal: formatPercent(shareOfTotal),
          formattedVisibleSegmentShareOfTotal: formatPercent(visibleShareOfTotal),
        };
        const computed: ComputedSegment = {
          id: `${String(category.id)}-${String(segment.id)}`,
          categoryId: dataPoint.categoryId ?? category.id,
          categoryLabel: category.label,
          categoryIndex,
          segmentId: dataPoint.segmentId ?? segment.id,
          segmentLabel: segment.label,
          segmentIndex,
          value: segment.value,
          color,
          x,
          y,
          width: widthPx,
          height: heightPx,
          center: { x: x + widthPx / 2, y: y + heightPx / 2 },
          visible,
          dataPoint,
        };
        categorySegments.push(computed);
        segments.push(computed);
        if (visible) {
          usedHeight += heightPx;
        }
      });

      categories.push({
        id: category.id,
        label: category.label,
        index: categoryIndex,
        x,
        width: widthPx,
        center,
        share,
        visibleShare: visibleCategoryShare,
        total: category.total,
        visibleTotal: effectiveCategoryTotal,
        original: category.original,
        segments: categorySegments,
      });

      cursor += widthPx + (categoryIndex < normalizedCategories.length - 1 ? gap : 0);
    });

    return { categories, segments };
  }, [normalizedCategories, plotWidth, plotHeight, effectiveWidth, safeTotal, safeVisibleTotal, gap, colorAssignments, assignColor, segmentLabelOrder, visibilityBySegmentLabel]);

  const normalizedXTicks = useMemo(() => {
    if (!plotWidth) return [] as number[];
    return layout.categories.map((category) => (category.center / plotWidth));
  }, [layout.categories, plotWidth]);

  const normalizedYTicks = useMemo(() => {
    if (!plotHeight) return [] as number[];
    return yTickValues.map((tick) => {
      const pixel = yScale(tick);
      return plotHeight ? pixel / plotHeight : 0;
    });
  }, [yTickValues, yScale, plotHeight]);

  const xScale = useMemo<Scale<string>>(() => {
    const centerMap = new Map<string, number>();
    layout.categories.forEach((category) => {
      centerMap.set(category.label, category.center);
    });
    const scale = ((value: string) => centerMap.get(value) ?? 0) as Scale<string>;
    scale.domain = () => layout.categories.map((category) => category.label);
    scale.range = () => [0, plotWidth];
    scale.ticks = () => layout.categories.map((category) => category.label);
    scale.bandwidth = () => 0;
    return scale;
  }, [layout.categories, plotWidth]);

  const yAxisScale = useMemo<Scale<number>>(() => {
    const scale = ((value: number) => yScale(value)) as Scale<number>;
    scale.domain = () => [0, 1];
    scale.range = () => [plotHeight, 0];
    scale.ticks = () => yTickValues.slice();
    return scale;
  }, [yScale, plotHeight, yTickValues]);

  const dataSignature = useMemo(() => {
    return normalizedCategories
      .map((category) => {
        const segmentsSig = category.segments
          .map((segment) => `${segment.label}:${segment.value}`)
          .join('|');
        return `${category.label}:${segmentsSig}`;
      })
      .join('||');
  }, [normalizedCategories]);

  const animationProgress = useSharedValue(disabled ? 1 : 0);
  const hasPlayedIntro = React.useRef(false);
  useEffect(() => {
    if (hasPlayedIntro.current) {
      return;
    }
    hasPlayedIntro.current = true;
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

  const hoverRef = useRef<string | null>(null);

  const handleHoverIn = useCallback((segment: ComputedSegment, event?: any) => {
    if (event && isChartTouchInput(event)) interaction?.cancelTouchHold();
    hoverRef.current = segment.id;
    const pointerX = padding.left + segment.center.x;
    const pointerY = padding.top + segment.center.y;
    // Feed the shared tooltip the real page coordinates so the portal (position: fixed)
    // anchors at the cursor. Without these it falls back to the segment-center container
    // coords, which land far from a tall segment's cursor. Updates on move to follow.
    const pageX = event?.pageX ?? event?.nativeEvent?.pageX;
    const pageY = event?.pageY ?? event?.nativeEvent?.pageY;
    setPointer?.({ x: pointerX, y: pointerY, inside: true, pageX, pageY, data: segment.dataPoint });
    // Engine-swap: the hovered segment is a single ActiveTarget (cell-like geometry).
    const dp = segment.dataPoint;
    const target: ActiveTarget = {
      seriesId: segment.segmentId,
      markId: segment.id,
      kind: 'cell',
      datum: dp,
      pixel: { x: pointerX, y: pointerY },
      value: dp.value,
      distance: 0,
      label: dp.segmentLabel,
      color: dp.color ?? segment.color,
      formattedValue: dp.formattedValue,
      customTooltip: `${dp.formattedValue} · ${dp.formattedVisibleSegmentShareOfTotal} of total (${dp.formattedVisibleSegmentShareOfCategory} of category)`,
      categoryIndex: segment.categoryIndex,
    };
    setActiveTarget?.(target);
    setActiveSlice?.([target]);
  }, [padding.left, padding.top, setPointer, setActiveTarget, setActiveSlice, interaction]);

  const handleHoverOut = useCallback((segment: ComputedSegment) => {
    if (hoverRef.current !== segment.id) {
      return;
    }
    hoverRef.current = null;
    setPointer?.(null);
    setActiveTarget?.(null);
    setActiveSlice?.([]);
  }, [setPointer, setActiveTarget, setActiveSlice]);

  const handlePress = useCallback((segment: ComputedSegment, pressEvent: any) => {
    if (isChartTouchInput(pressEvent)) {
      handleHoverIn(segment, pressEvent);
      interaction?.holdTouchTarget();
    }
    const absoluteX = padding.left + segment.center.x;
    const absoluteY = padding.top + segment.center.y;
    const chartX = width ? absoluteX / width : 0;
    const chartY = height ? absoluteY / height : 0;

    const interactionEvent: ChartInteractionEvent<MarimekkoDataPoint> = {
      nativeEvent: pressEvent.nativeEvent,
      chartX,
      chartY,
      dataX: segment.dataPoint.visibleCategoryShare || segment.dataPoint.categoryShare,
      dataY: segment.dataPoint.visibleSegmentShareOfCategory,
      dataPoint: segment.dataPoint,
    };

    onDataPointPress?.(segment.dataPoint, interactionEvent);
    onPress?.(interactionEvent);
  }, [height, width, onDataPointPress, onPress, padding.left, padding.top, handleHoverIn, interaction]);

  const legendItems = useMemo(() => {
    if (legend?.items && legend.items.length) {
      return legend.items;
    }
    return segmentDefinitions.map((definition) => ({
      label: definition.label,
      color: definition.color,
      visible: visibilityBySegmentLabel.get(definition.label) !== false,
    }));
  }, [legend?.items, segmentDefinitions, visibilityBySegmentLabel]);

  const legendPosition = legend?.position ?? 'bottom';
  const legendAlign = legend?.align ?? 'center';
  const showLegend = legend?.show ?? true;

  const xTickFormatter = useCallback((value: string) => {
    const category = layout.categories.find((entry) => entry.label === value);
    if (!category) return value;
    if (categoryLabelFormatter) {
      return categoryLabelFormatter(category.original, category.index);
    }
    if (xAxis?.labelFormatter) {
      return xAxis.labelFormatter(category.index);
    }
    return category.label;
  }, [layout.categories, categoryLabelFormatter, xAxis?.labelFormatter]);

  const yTickFormatter = useCallback((value: number) => {
    return resolvedYAxis.labelFormatter ? resolvedYAxis.labelFormatter(value) : `${Math.round(value * 100)}%`;
  }, [resolvedYAxis.labelFormatter]);

  return (
    <ChartContainer
      w={width}
      h={height}
      padding={padding}
      disabled={disabled}
      animationDuration={animationDuration}
      style={style}
      useOwnInteractionProvider={useOwnInteractionProvider}
      suppressPopover={suppressPopover}
      interactionConfig={interactionConfig}
      {...rest}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

      {grid?.show !== false && plotWidth > 0 && plotHeight > 0 && (
        <ChartGrid
          grid={{
            show: true,
            color: grid?.color || theme.colors.grid,
            thickness: grid?.thickness ?? 1,
            style: grid?.style ?? 'dotted',
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
        />
      )}

      <Svg
        width={plotWidth}
        height={plotHeight}
        style={{ position: 'absolute', left: padding.left, top: padding.top }}
      >
        {layout.segments.map((segment) => (
          <AnimatedMarimekkoSegment
            key={segment.id}
            segment={segment}
            animation={animationProgress}
            borderRadius={segmentBorderRadius}
            disabled={disabled}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            onPress={handlePress}
          />
        ))}
      </Svg>

      {resolvedXAxis.show !== false && layout.categories.length > 0 && (
        <Axis
          orientation="bottom"
          scale={xScale}
          length={plotWidth}
          offset={{ x: padding.left, y: padding.top + plotHeight }}
          tickCount={layout.categories.length}
          tickSize={resolvedXAxis.tickLength ?? 4}
          tickPadding={8}
          tickFormat={(value: string) => xTickFormatter(value)}
          label={resolvedXAxis.title}
          stroke={resolvedXAxis.color || theme.colors.grid}
          strokeWidth={resolvedXAxis.thickness ?? 1}
          showLine={resolvedXAxis.show ?? true}
          showTicks={resolvedXAxis.showTicks ?? true}
          showLabels={resolvedXAxis.showLabels ?? true}
          tickLabelColor={resolvedXAxis.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={resolvedXAxis.labelFontSize ?? 11}
        />
      )}

      {resolvedYAxis.show !== false && (
        <Axis
          orientation="left"
          scale={yAxisScale}
          length={plotHeight}
          offset={{ x: padding.left, y: padding.top }}
          tickCount={yTickValues.length}
          tickSize={resolvedYAxis.tickLength ?? 4}
          tickPadding={6}
          tickFormat={(value: number) => yTickFormatter(value)}
          label={resolvedYAxis.title}
          stroke={resolvedYAxis.color || theme.colors.grid}
          strokeWidth={resolvedYAxis.thickness ?? 1}
          showLine={resolvedYAxis.show ?? true}
          showTicks={resolvedYAxis.showTicks ?? true}
          showLabels={resolvedYAxis.showLabels ?? true}
          tickLabelColor={resolvedYAxis.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={resolvedYAxis.labelFontSize ?? 11}
        />
      )}

      {showLegend && legendItems.length > 0 && (
        <ChartLegend
          items={legendItems}
          position={legendPosition}
          align={legendAlign}
          textColor={legend?.textColor}
          fontSize={legend?.fontSize}
          onItemPress={legend?.items || !updateSeriesVisibility ? undefined : (item, index, nativeEvent) => {
            const definition = segmentDefinitions[index];
            if (!definition) return;
            const currentVisible = interactionSeries?.find((entry) => entry.id === definition.id)?.visible ?? (item.visible !== false);
            const isolate = nativeEvent?.shiftKey;
            if (isolate) {
              const currentlyVisible = segmentDefinitions
                .filter((def) => visibilityBySegmentLabel.get(def.label) !== false)
                .map((def) => def.id);
              const isSole = currentlyVisible.length === 1 && currentlyVisible[0] === definition.id;
              segmentDefinitions.forEach((def) => updateSeriesVisibility(def.id, isSole ? true : def.id === definition.id));
            } else {
              updateSeriesVisibility?.(definition.id, !(currentVisible !== false));
            }
          }}
        />
      )}
    </ChartContainer>
  );
};

MarimekkoChart.displayName = 'MarimekkoChart';
