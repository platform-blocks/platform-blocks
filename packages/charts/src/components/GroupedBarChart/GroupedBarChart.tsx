import React, { useMemo, useEffect, useCallback, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, G, Text as SvgText } from 'react-native-svg';
import { roundedBarPath, barCornerMask } from '../../utils/barPath';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, SharedValue } from 'react-native-reanimated';

import { GroupedBarChartProps } from './types';
import { ChartContainer, ChartTitle, ChartLegend , withChartBandPadding } from '../../ChartBase';
import { resolveCartesianPadding, domainTickLabels } from '../../core/axisLayout';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { useChartInteractionContext, useActiveTarget } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { BandCategoryHitTester } from '../../core/hittest/band';
import type { HitSeries, Mark } from '../../core/hittest/types';
import type { InteractionConfig } from '../../interaction/ChartInteractionContext';
import { ChartInteractionEvent } from '../../types';
import { bandScale, linearScale, generateNiceTicks, type Scale } from '../../utils/scales';
import { formatNumber } from '../../utils';
import { createColorAssigner } from '../../colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type ResolvedSeries = {
  id: string;
  name?: string;
  color: string;
  visible: boolean;
  data: GroupedDatumInput[];
  dataLookup: Map<string, GroupedDatumInput>;
  seriesIndex: number;
};

interface GroupedDatumInput {
  category: string;
  value: number;
  color?: string;
  id?: string | number;
  data?: any;
}

interface ComputedBar {
  id: string;
  category: string;
  categoryIndex: number;
  seriesId: string;
  seriesIndex: number;
  color: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isPositive: boolean;
  baseline: number;
  dataPoint?: GroupedDatumInput;
  visible: boolean;
}


// Pure visual bar. Pointer/press is handled by the shared gesture surface +
// hit-test engine (overlay + useChartPointer below), not per-rect handlers.
const AnimatedGroupedBar: React.FC<{
  bar: ComputedBar;
  animationProgress: SharedValue<number>;
  borderRadius: number;
}> = React.memo(({ bar, animationProgress, borderRadius }) => {
  const corners = useMemo(() => barCornerMask('vertical', bar.isPositive), [bar.isPositive]);
  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value;
    const height = bar.height * progress;
    const y = bar.isPositive ? bar.y + (bar.height - height) : bar.y;
    return {
      d: roundedBarPath(bar.x, y, bar.width, height, borderRadius, corners.tl, corners.tr, corners.br, corners.bl),
    } as any;
  }, [bar, borderRadius, corners]);

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill={bar.color}
      opacity={bar.visible ? 1 : 0}
      pointerEvents="none"
    />
  );
});

AnimatedGroupedBar.displayName = 'AnimatedGroupedBar';

export const GroupedBarChart: React.FC<GroupedBarChartProps> = (props) => {
  const {
    series,
    width = 400,
    height = 300,
    barSpacing = 0.2,
    innerBarSpacing = 0.1,
    title,
    subtitle,
    legend = { show: true, position: 'bottom', align: 'center' },
    disabled = false,
    animationDuration = 800,
    animation,
    style,
    xAxis,
    yAxis,
    grid,
    colorOptions,
    valueLabels,
    multiTooltip,
    liveTooltip,
    enableCrosshair,
    onPress,
    onDataPointPress,
    ...rest
  } = props;

  const theme = useChartTheme();
  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch { /* noop */ }
  // Target-only subscription: this chart draws a crosshair from the active target, which
  // moves in category steps — so it re-renders only when the active column changes, not on
  // every pointer frame.
  const { activeTarget } = useActiveTarget();

  const register = interaction?.register;
  const updateSeriesVisibility = interaction?.updateSeriesVisibility;
  const interactionSeries = interaction?.series;

  // The axis domain is derived further down, but its extremes are already in the
  // data — enough to size the label column before the scales exist.
  const categoryLabels = React.useMemo(() => {
    const set = new Set<string>();
    (series ?? []).forEach((s) => s.data.forEach((d) => set.add(d.category)));
    return Array.from(set);
  }, [series]);
  const basePadding = React.useMemo(() => {
    let min = 0;
    let max = 0;
    (series ?? []).forEach((s) => s.data.forEach((d) => {
      min = Math.min(min, d.value);
      max = Math.max(max, d.value);
    }));
    return resolveCartesianPadding({
      yTickLabels: domainTickLabels([min, max], (value) => (yAxis?.labelFormatter ? yAxis.labelFormatter(value) : `${value}`)),
      xTickLabels: categoryLabels,
      yTitle: yAxis?.title,
      xTitle: xAxis?.title,
      showYAxis: yAxis?.show !== false,
      showXAxis: xAxis?.show !== false,
      showYTickLabels: yAxis?.showLabels !== false,
      showXTickLabels: xAxis?.showLabels !== false,
      containerWidth: width,
      containerHeight: height,
    });
  }, [series, categoryLabels, yAxis?.labelFormatter, yAxis?.title, xAxis?.title, yAxis?.show,
      xAxis?.show, yAxis?.showLabels, xAxis?.showLabels, width, height]);
  // Grown so the plot clears the title and legend overlays.
  const legendLabels = React.useMemo(
    () => (series ?? []).map((s, i) => ({ label: s.name || `Series ${i + 1}` })),
    [series]
  );
  const padding = React.useMemo(
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    series.forEach((s) => s.data.forEach((d) => set.add(d.category)));
    return Array.from(set);
  }, [series]);

  const categoryIndexMap = useMemo(() => new Map(categories.map((category, index) => [category, index] as const)), [categories]);

  const assignColor = useMemo(() => createColorAssigner(colorOptions), [colorOptions]);

  const resolvedSeries = useMemo<ResolvedSeries[]>(() => {
    return series.map((seriesEntry, index) => {
      const id = String(seriesEntry.id ?? `group-${index}`);
      const override = interactionSeries?.find((entry) => entry.id === id);
      const visible = override ? override.visible !== false : seriesEntry.visible !== false;
      const color = seriesEntry.color || assignColor(index, seriesEntry.id);
      const normalizedData = seriesEntry.data.map((datum) => ({
        category: datum.category,
        value: datum.value,
        color: datum.color,
        id: datum.id,
        data: datum.data,
      }));
      const dataLookup = new Map<string, GroupedDatumInput>();
      normalizedData.forEach((datum) => {
        dataLookup.set(datum.category, datum);
      });
      return {
        id,
        name: seriesEntry.name,
        color,
        visible,
        data: normalizedData,
        dataLookup,
        seriesIndex: index,
      };
    });
  }, [series, interactionSeries, assignColor]);

  const resolvedSeriesMap = useMemo(() => {
    const map = new Map<string, ResolvedSeries>();
    resolvedSeries.forEach((entry) => {
      map.set(entry.id, entry);
    });
    return map;
  }, [resolvedSeries]);


  const interactionConfig = useMemo<InteractionConfig | undefined>(() => {
    const config: InteractionConfig = {};
    if (typeof multiTooltip === 'boolean') config.multiTooltip = multiTooltip;
    if (typeof liveTooltip === 'boolean') config.liveTooltip = liveTooltip;
    if (typeof enableCrosshair === 'boolean') config.enableCrosshair = enableCrosshair;
    return Object.keys(config).length ? config : undefined;
  }, [enableCrosshair, liveTooltip, multiTooltip]);

  const showValueLabels = !!(valueLabels && valueLabels.show);
  const valueLabelPosition = valueLabels?.position ?? 'auto';
  const valueLabelOffset = valueLabels?.offset ?? 12;
  const valueLabelFontSize = valueLabels?.fontSize ?? 11;
  const valueLabelFontWeight = valueLabels?.fontWeight ?? '600';
  const valueLabelFontFamily = valueLabels?.fontFamily || theme.fontFamily;
  const minBarHeightForInside = valueLabels?.minBarHeightForInside ?? (valueLabelFontSize + 6);

  const formatValueLabel = useCallback(
    (
      value: number,
      datum: GroupedDatumInput,
      context: { category: string; categoryIndex: number; series: ResolvedSeries }
    ) => {
      if (typeof valueLabels?.formatter === 'function') {
        return valueLabels.formatter({
          value,
          category: context.category,
          categoryIndex: context.categoryIndex,
          seriesId: context.series.id,
          seriesName: context.series.name,
          seriesIndex: context.series.seriesIndex,
          datum: datum as any,
        });
      }
      return formatNumber(value);
    },
    [valueLabels?.formatter]
  );

  const valueDomain = useMemo<[number, number]>(() => {
    let min = 0;
    let max = 0;
    resolvedSeries.forEach((seriesEntry) => {
      seriesEntry.data.forEach((datum) => {
        if (datum.value < min) min = datum.value;
        if (datum.value > max) max = datum.value;
      });
    });
    if (min === max) {
      if (min === 0) return [-1, 1];
      const delta = Math.abs(min) * 0.1 || 1;
      return [min - delta, max + delta];
    }
    return [Math.min(min, 0), Math.max(max, 0)];
  }, [resolvedSeries]);

  const outerScale = useMemo(() => {
    const paddingInner = Math.min(Math.max(barSpacing, 0), 0.9);
    const paddingOuter = 0.1;
    return bandScale(categories, [0, plotWidth], { paddingInner, paddingOuter });
  }, [categories, plotWidth, barSpacing]);

  const outerBandwidth = outerScale.bandwidth ? outerScale.bandwidth() : categories.length ? plotWidth / categories.length : 0;

  const seriesIds = useMemo(() => resolvedSeries.map((entry) => entry.id), [resolvedSeries]);

  const innerScale = useMemo(() => {
    const paddingInner = Math.min(Math.max(innerBarSpacing, 0), 0.9);
    return bandScale(seriesIds, [0, outerBandwidth], { paddingInner, paddingOuter: 0 });
  }, [seriesIds, outerBandwidth, innerBarSpacing]);

  const valueScale = useMemo(() => linearScale(valueDomain, [plotHeight, 0]), [valueDomain, plotHeight]);

  const baseline = valueScale(0);

  const computedBars = useMemo(() => {
    return categories.flatMap((category) => {
      const categoryIndex = categoryIndexMap.get(category) ?? 0;
      const outerX = outerScale(category) ?? 0;
      return resolvedSeries.map((seriesEntry) => {
        const datum = seriesEntry.dataLookup.get(category);
        const innerX = innerScale(seriesEntry.id) ?? 0;
        const x = outerX + innerX;
        const width = innerScale.bandwidth ? innerScale.bandwidth() : outerBandwidth / Math.max(1, resolvedSeries.length);
        const value = datum?.value ?? 0;
        const barTop = valueScale(Math.max(value, 0));
        const barBottom = valueScale(Math.min(value, 0));
        const y = value >= 0 ? barTop : baseline;
        const height = Math.max(0, Math.abs(barBottom - barTop));
        const color = datum?.color || seriesEntry.color;
        const dataPoint = datum || { category, value };
        return {
          id: `${seriesEntry.id}::${category}`,
          category,
          categoryIndex,
          seriesId: seriesEntry.id,
          seriesIndex: seriesEntry.seriesIndex,
          color,
          value,
          x,
          y: y,
          width,
          height,
          isPositive: value >= 0,
          baseline: baseline,
          dataPoint,
          visible: seriesEntry.visible,
        } as ComputedBar;
      });
    });
  }, [categories, categoryIndexMap, outerScale, innerScale, resolvedSeries, outerBandwidth, valueScale, baseline]);

  const animationProgress = useSharedValue(disabled ? 1 : 0);

  const dataSignature = useMemo(() => {
    return resolvedSeries
      .map((seriesEntry) => {
        const values = categories.map((category) => {
          const datum = seriesEntry.dataLookup.get(category);
          return `${category}:${datum?.value ?? 0}`;
        });
        return `${seriesEntry.id}:${seriesEntry.visible ? '1' : '0'}:${values.join('|')}`;
      })
      .join('||');
  }, [resolvedSeries, categories]);

  useEffect(() => {
    if (disabled) {
      animationProgress.value = 1;
      return;
    }
    animationProgress.value = 0;
    animationProgress.value = withTiming(1, {
      duration: animation?.duration ?? animationDuration ?? 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [animationProgress, animation?.duration, animationDuration, dataSignature, disabled]);

  const valueTicks = useMemo(() => {
    if (yAxis?.ticks && yAxis.ticks.length) {
      return yAxis.ticks;
    }
    return generateNiceTicks(valueDomain[0], valueDomain[1], 5);
  }, [valueDomain, yAxis?.ticks]);

  const normalizedXTicks = useMemo(() => {
    if (plotWidth <= 0) return [] as number[];
    const bandwidth = outerScale.bandwidth ? outerScale.bandwidth() : 0;
    return categories.map((category) => {
      const pos = (outerScale(category) ?? 0) + bandwidth / 2;
      return pos / plotWidth;
    });
  }, [categories, outerScale, plotWidth]);

  const normalizedYTicks = useMemo(() => {
    if (plotHeight <= 0) return [] as number[];
    return valueTicks.map((tick) => valueScale(tick) / plotHeight);
  }, [valueTicks, valueScale, plotHeight]);

  const xAxisScale = useMemo<Scale<string>>(() => {
    const bandwidth = outerScale.bandwidth ? outerScale.bandwidth() : categories.length ? plotWidth / categories.length : 0;
    const scale = ((value: string) => {
      const base = outerScale(value) ?? 0;
      return base + bandwidth / 2;
    }) as Scale<string>;
    scale.domain = () => categories.slice();
    scale.range = () => [0, plotWidth];
    scale.ticks = () => categories.slice();
    scale.bandwidth = () => bandwidth;
    return scale;
  }, [outerScale, categories, plotWidth]);

  const yAxisScale = useMemo<Scale<number>>(() => {
    const scale = ((value: number) => valueScale(value)) as Scale<number>;
    scale.domain = () => valueScale.domain();
    scale.range = () => valueScale.range();
    scale.ticks = () => valueTicks.slice();
    return scale;
  }, [valueScale, valueTicks]);

  const handleBarPress = useCallback((bar: ComputedBar, nativeEvent: any) => {
    const dataPoint = {
      category: bar.category,
      value: bar.value,
      color: bar.color,
      id: bar.dataPoint?.id,
      data: bar.dataPoint?.data,
    };

    const interactionEvent: ChartInteractionEvent<typeof dataPoint> = {
      nativeEvent,
      chartX: (padding.left + bar.x + bar.width / 2) / width,
      chartY: (padding.top + bar.y + bar.height / 2) / height,
      dataX: bar.categoryIndex,
      dataY: bar.value,
      dataPoint,
    };

    onDataPointPress?.(dataPoint, interactionEvent);
    onPress?.(interactionEvent);
  }, [height, onDataPointPress, onPress, width, padding.left, padding.top]);

  // New interaction engine: each grouped bar is a band mark with its rect
  // (container-origin) + category-index key. One hit-series per series → rect
  // membership resolves the hovered bar; slice() returns every series' bar at the
  // category (the grouped-column tooltip).
  const hitSeries: HitSeries[] = useMemo(() => {
    const bySeries = new Map<string, Mark[]>();
    resolvedSeries.forEach((s) => bySeries.set(s.id, []));
    computedBars.forEach((bar) => {
      const arr = bySeries.get(bar.seriesId);
      if (!arr) return;
      const fallbackDatum: GroupedDatumInput = bar.dataPoint ?? { category: bar.category, value: bar.value };
      const formatted = formatValueLabel(bar.value, fallbackDatum, {
        category: bar.category,
        categoryIndex: bar.categoryIndex,
        series: resolvedSeriesMap.get(bar.seriesId)!,
      });
      arr.push({
        id: bar.categoryIndex,
        pixel: { x: bar.x + bar.width / 2 + padding.left, y: bar.y + padding.top },
        value: bar.value,
        datum: bar,
        extent: { rect: { x: bar.x + padding.left, y: bar.y + padding.top, width: bar.width, height: bar.height } },
        formattedValue: formatted == null ? undefined : String(formatted),
      });
    });
    return resolvedSeries.map((s) => ({
      id: s.id,
      name: s.name || `Series ${s.seriesIndex + 1}`,
      color: s.color,
      visible: s.visible !== false,
      marks: bySeries.get(s.id) ?? [],
    }));
  }, [computedBars, resolvedSeries, resolvedSeriesMap, padding.left, padding.top, formatValueLabel]);

  const tester = useMemo(() => new BandCategoryHitTester(hitSeries, { orientation: 'x' }), [hitSeries]);

  useEffect(() => {
    if (!register) return;
    register('grouped-bar', { frame: { kind: 'cartesian' } as any, geometry: { kind: 'band', orientation: 'x' }, series: hitSeries });
    return () => register('grouped-bar', null);
  }, [register, hitSeries]);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding,
    plotWidth,
    plotHeight,
    enabled: Boolean(interaction) && !disabled,
    hover: true,
    press: true,
    tester,
    onPress: (e, target) => { if (target) handleBarPress(target.datum as ComputedBar, (e.raw as any)?.nativeEvent ?? e.raw); },
  });

  return (
    <ChartContainer
      width={width}
      height={height}
      padding={padding}
      disabled={disabled}
      animationDuration={animationDuration}
      style={style}
      interactionConfig={interactionConfig}
      {...rest}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} style={{ top: -24 }} />}

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
        />
      )}

      <Svg width={plotWidth} height={plotHeight} style={{ position: 'absolute', left: padding.left, top: padding.top }}>
        {computedBars.map((bar) => (
          bar.visible && bar.height > 0 ? (
            <AnimatedGroupedBar
              key={bar.id}
              bar={bar}
              animationProgress={animationProgress}
              borderRadius={3}
            />
          ) : null
        ))}
        {(enableCrosshair || multiTooltip) && activeTarget && (() => {
          // Guide line driven by the hit-test engine's active target (container-origin pixel).
          const relativeX = (activeTarget.pixel?.x ?? 0) - padding.left;
          if (!Number.isFinite(relativeX)) return null;
          const clampedX = Math.max(0, Math.min(plotWidth, relativeX));
          return (
            <Rect
              x={clampedX - 0.5}
              y={0}
              width={1}
              height={plotHeight}
              fill={theme.colors.grid}
              opacity={0.45}
              pointerEvents="none"
            />
          );
        })()}
        {showValueLabels && computedBars.map((bar) => {
          if (!bar.visible || bar.height <= 0) return null;
          const seriesEntry = resolvedSeriesMap.get(bar.seriesId);
          if (!seriesEntry) return null;
          const rawDatum = seriesEntry.dataLookup.get(bar.category) || bar.dataPoint;
          const datum: GroupedDatumInput = rawDatum ?? { category: bar.category, value: bar.value };
          const label = formatValueLabel(bar.value, datum, {
            category: bar.category,
            categoryIndex: bar.categoryIndex,
            series: seriesEntry,
          });
          if (label == null) return null;
          const labelText = String(label).trim();
          if (!labelText) return null;

          const canFitInside = bar.height >= minBarHeightForInside;
          let useInside = valueLabelPosition === 'inside' || (valueLabelPosition === 'auto' && canFitInside);
          if (valueLabelPosition === 'outside') useInside = false;
          if (valueLabelPosition === 'inside' && !canFitInside) useInside = false;

          const x = bar.x + bar.width / 2;
          let y: number;
          let alignmentBaseline: any = 'baseline';
          const clampY = (val: number) => Math.max(0, Math.min(plotHeight, val));
          if (useInside) {
            const insideOffset = Math.min(Math.max(4, valueLabelOffset), Math.max(4, bar.height - 2));
            if (bar.isPositive) {
              y = clampY(bar.y + insideOffset);
              alignmentBaseline = 'baseline';
            } else {
              y = clampY(bar.y + bar.height - insideOffset);
              alignmentBaseline = 'baseline';
            }
          } else {
            const outsideOffset = Math.max(4, valueLabelOffset);
            if (bar.isPositive) {
              y = clampY(bar.y - outsideOffset);
              alignmentBaseline = 'baseline';
            } else {
              y = clampY(bar.y + bar.height + outsideOffset);
              alignmentBaseline = 'hanging';
            }
          }

          const fillColor = valueLabels?.color || (useInside ? theme.colors.background : theme.colors.textPrimary);

          return (
            <SvgText
              key={`label-${bar.id}`}
              x={x}
              y={y}
              fill={fillColor}
              fontSize={valueLabelFontSize}
              fontWeight={valueLabelFontWeight}
              fontFamily={valueLabelFontFamily}
              textAnchor="middle"
              alignmentBaseline={alignmentBaseline}
            >
              {labelText}
            </SvgText>
          );
        })}
      </Svg>

      {/* Unified cross-platform gesture surface (web PointerEvents | native
          Responder), driven by useChartPointer + the band hit-tester. Full-chart
          overlay so pointer coords are container-origin, matching the bar rects. */}
      {Boolean(interaction) && !disabled && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="grouped-bar-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}

      {xAxis?.show !== false && (
        <Axis
          orientation="bottom"
          scale={xAxisScale}
          length={plotWidth}
          offset={{ x: padding.left, y: padding.top + plotHeight }}
          tickCount={categories.length}
          tickSize={xAxis?.tickLength ?? 4}
          tickPadding={8}
          tickFormat={(value: string) => (xAxis?.labelFormatter ? xAxis.labelFormatter(categoryIndexMap.get(value) ?? 0) : String(value))}
          label={xAxis?.title}
          stroke={xAxis?.color || theme.colors.grid}
          strokeWidth={xAxis?.thickness ?? 1}
          showLine={xAxis?.show ?? true}
          showTicks={xAxis?.showTicks ?? true}
          showLabels={xAxis?.showLabels ?? true}
          tickLabelColor={xAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={xAxis?.labelFontSize ?? 11}
        />
      )}

      {yAxis?.show !== false && (
        <Axis
          orientation="left"
          scale={yAxisScale}
          length={plotHeight}
          offset={{ x: padding.left, y: padding.top }}
          ticks={valueTicks}
          tickLabelWidth={basePadding.yTickLabelWidth}
          tickSize={yAxis?.tickLength ?? 4}
          tickPadding={6}
          tickFormat={(value: number) => (yAxis?.labelFormatter ? yAxis.labelFormatter(value) : `${value}`)}
          label={yAxis?.title}
          stroke={yAxis?.color || theme.colors.grid}
          strokeWidth={yAxis?.thickness ?? 1}
          showLine={yAxis?.show ?? true}
          showTicks={yAxis?.showTicks ?? true}
          showLabels={yAxis?.showLabels ?? true}
          tickLabelColor={yAxis?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={yAxis?.labelFontSize ?? 11}
        />
      )}

      {legend?.show && (
        <ChartLegend
          items={resolvedSeries.map((seriesEntry, index) => ({
            label: seriesEntry.name || `Series ${index + 1}`,
            color: seriesEntry.color,
            visible: seriesEntry.visible,
          }))}
          position={legend.position}
          align={legend.align}
          textColor={legend.textColor}
          fontSize={legend.fontSize}
          onItemPress={updateSeriesVisibility ? (item, index, nativeEvent) => {
            const seriesEntry = resolvedSeries[index];
            if (!seriesEntry) return;
            const id = seriesEntry.id;
            const currentVisible = interactionSeries?.find((s) => s.id === id)?.visible ?? seriesEntry.visible;
            const isolate = nativeEvent?.shiftKey;
            if (isolate) {
              const currentlyVisible = resolvedSeries.filter((s) => s.visible).map((s) => s.id);
              const isSole = currentlyVisible.length === 1 && currentlyVisible[0] === id;
              resolvedSeries.forEach((entry) => updateSeriesVisibility(entry.id, isSole ? true : entry.id === id));
            } else {
              updateSeriesVisibility(id, !(currentVisible !== false));
            }
          } : undefined}
        />
      )}
    </ChartContainer>
  );
};

GroupedBarChart.displayName = 'GroupedBarChart';
