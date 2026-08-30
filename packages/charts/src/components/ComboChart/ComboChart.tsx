import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import Animated, { SharedValue, useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

import { ComboChartProps, ComboChartLayer } from './types';
import { ChartContainer, ChartTitle, ChartLegend , withChartBandPadding } from '../../ChartBase';
import { resolveCartesianPadding, domainTickLabels, measureWidestLabel } from '../../core/axisLayout';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { useChartInteractionContext, usePointer, useActiveTarget } from '../../interaction/ChartInteractionContext';
import type { ActiveTarget } from '../../core/hittest/types';
import { ChartInteractionEvent } from '../../types';
import { linearScale, generateNiceTicks, type Scale } from '../../utils/scales';
import { createSmoothPath } from '../../utils';
import { roundedBarPath, barCornerMask } from '../../utils/barPath';
import { createColorAssigner } from '../../colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TargetAxis = 'left' | 'right';

interface NormalizedLayer {
  id: string;
  name: string;
  type: ComboChartLayer['type'];
  targetAxis: TargetAxis;
  color: string;
  points: Array<{ x: number; y: number; meta?: any }>;
  raw: ComboChartLayer;
  visible: boolean;
}

interface NormalizedBarLayer extends NormalizedLayer {
  type: 'bar' | 'histogram';
}

interface NormalizedLineLikeLayer extends NormalizedLayer {
  type: 'line' | 'area' | 'density';
}

interface ComputedBarRect {
  id: string;
  dataX: number;
  dataY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  axis: TargetAxis;
  dataMeta?: any;
  visible: boolean;
}

const toNativePointerEvent = (event: any) => {
  const rect = event?.currentTarget?.getBoundingClientRect?.();
  return {
    nativeEvent: {
      locationX: rect ? event.clientX - rect.left : 0,
      locationY: rect ? event.clientY - rect.top : 0,
      pageX: event?.pageX ?? event?.clientX,
      pageY: event?.pageY ?? event?.clientY,
    },
  };
};

const useComboAnimation = (disabled: boolean, duration: number, signature: string) => {
  const progress = useSharedValue(disabled ? 1 : 0);
  useEffect(() => {
    if (disabled) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [disabled, duration, signature, progress]);
  return progress;
};

const computeHistogramPoints = (layer: Extract<ComboChartLayer, { type: 'histogram' }>) => {
  const values = layer.values;
  if (!values.length) return [] as Array<{ x: number; y: number; meta?: any }>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const n = values.length;
  let bins = layer.bins ?? Math.ceil(Math.log2(n) + 1);
  if (layer.binMethod === 'sqrt') bins = Math.ceil(Math.sqrt(n));
  if (layer.binMethod === 'fd') {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(0.25 * (n - 1))];
    const q3 = sorted[Math.floor(0.75 * (n - 1))];
    const iqr = q3 - q1 || (max - min);
    const h = 2 * iqr * Math.pow(n, -1 / 3);
    bins = h ? Math.ceil((max - min) / h) : bins;
  }
  const width = (max - min) / (bins || 1) || 1;
  const ranges = Array.from({ length: bins }, (_, i) => ({
    start: min + i * width,
    end: min + (i + 1) * width,
    count: 0,
  }));
  values.forEach((v) => {
    const idx = Math.min(ranges.length - 1, Math.floor((v - min) / width));
    ranges[idx].count += 1;
  });
  return ranges.map((bin) => ({
    x: (bin.start + bin.end) / 2,
    y: bin.count,
    meta: { binStart: bin.start, binEnd: bin.end, count: bin.count },
  }));
};

const computeDensityPoints = (layer: Extract<ComboChartLayer, { type: 'density' }>) => {
  const values = layer.values;
  if (!values.length) return [] as Array<{ x: number; y: number }>;
  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((acc, v) => acc + v, 0) / n;
  const std = Math.sqrt(values.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / n) || 1;
  const bandwidth = layer.bandwidth || 1.06 * std * Math.pow(n, -1 / 5);
  const sorted = [...values].sort((a, b) => a - b);
  const kernel = (x: number) => {
    return sorted.reduce((sum, v) => {
      const u = (x - v) / bandwidth;
      return sum + Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    }, 0) / (n * bandwidth);
  };
  const steps = 80;
  const span = max - min || 1;
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const x = min + (span * i) / steps;
    points.push({ x, y: kernel(x) });
  }
  return points;
};

const ComboBarSeries: React.FC<{
  layer: NormalizedBarLayer;
  scaleX: Scale<number>;
  scaleY: Scale<number>;
  plotWidth: number;
  plotHeight: number;
  padding: { left: number; top: number };
  animationProgress: SharedValue<number>;
  disabled: boolean;
  onBarHover: (bar: ComputedBarRect) => void;
  onBarHoverEnd: (bar: ComputedBarRect) => void;
  onBarPress: (bar: ComputedBarRect, nativeEvent: any) => void;
}> = React.memo(({ layer, scaleX, scaleY, plotWidth, plotHeight, padding, animationProgress, disabled, onBarHover, onBarHoverEnd, onBarPress }) => {
  const bandwidthFromScale = scaleX.bandwidth?.() ?? 0;
  const layerOpacity = (layer.raw as Extract<ComboChartLayer, { type: 'bar' | 'histogram' }>).opacity ?? 1;
  const bars = useMemo(() => {
    const defaultWidth = bandwidthFromScale > 0 ? bandwidthFromScale * 0.8 : plotWidth / Math.max(1, layer.points.length) * 0.6;
    return layer.points.map((point, index) => {
      const raw = layer.raw as Extract<ComboChartLayer, { type: 'bar' | 'histogram' }>;
      let width = raw.type === 'bar' ? raw.barWidth ?? defaultWidth : defaultWidth;
      if (raw.type === 'histogram' && point.meta) {
        const meta = point.meta as { binStart?: number; binEnd?: number };
        if (meta.binStart != null && meta.binEnd != null) {
          const startPx = scaleX(meta.binStart);
          const endPx = scaleX(meta.binEnd);
          width = Math.max(1, Math.abs(endPx - startPx) - 2);
        }
      }
      const center = scaleX(point.x);
      const x = padding.left + center - width / 2;
      const yPixel = scaleY(point.y);
      const baselinePixel = scaleY(0);
      const isPositive = point.y >= 0;
      const rectY = padding.top + (isPositive ? yPixel : baselinePixel);
      const height = Math.max(0, Math.abs(baselinePixel - yPixel));
      return {
        id: `${layer.id}-${index}`,
        dataX: point.x,
        dataY: point.y,
        x,
        y: rectY,
        width,
        height,
        color: point.meta?.color || layer.color,
        axis: layer.targetAxis,
        dataMeta: point.meta,
        visible: layer.visible,
      } as ComputedBarRect;
    });
  }, [layer, scaleX, scaleY, padding.left, padding.top, bandwidthFromScale, plotWidth]);

  return (
    <>
      {bars.map((bar) => {
        if (!bar.visible || bar.height <= 0 || bar.width <= 0) return null;
        const corners = barCornerMask('vertical', bar.dataY >= 0);
        const animatedProps = useAnimatedProps(() => {
          const progress = animationProgress.value;
          const height = bar.height * progress;
          const y = bar.y + (bar.height - height);
          return {
            d: roundedBarPath(bar.x, y, bar.width, height, 3, corners.tl, corners.tr, corners.br, corners.bl),
          } as any;
        });
        const isWeb = Platform.OS === 'web';
        return (
          <AnimatedPath
            key={bar.id}
            testID={`combo-bar-${bar.id}`}
            animatedProps={animatedProps}
            fill={bar.color}
            opacity={bar.visible ? layerOpacity : 0}
            pointerEvents={bar.visible ? 'auto' : 'none'}
            {...(isWeb
              ? {
                  onPointerEnter: () => !disabled && onBarHover(bar),
                  onPointerLeave: () => onBarHoverEnd(bar),
                  onPointerDown: (event: any) => {
                    if (disabled) return;
                    event.currentTarget?.setPointerCapture?.(event.pointerId);
                  },
                  onPointerUp: (event: any) => {
                    if (disabled) return;
                    event.currentTarget?.releasePointerCapture?.(event.pointerId);
                    onBarPress(bar, toNativePointerEvent(event));
                  },
                  onPointerCancel: () => onBarHoverEnd(bar),
                }
              : {
                  onPressIn: () => !disabled && onBarHover(bar),
                  onPressOut: () => onBarHoverEnd(bar),
                  onPress: (event: any) => !disabled && onBarPress(bar, { nativeEvent: event.nativeEvent }),
                })}
          />
        );
      })}
    </>
  );
});

ComboBarSeries.displayName = 'ComboBarSeries';

const computePathLength = (points: Array<{ x: number; y: number }>) => {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
};

const ComboLineSeries: React.FC<{
  layer: NormalizedLineLikeLayer;
  scaleX: Scale<number>;
  scaleY: Scale<number>;
  plotHeight: number;
  animationProgress: SharedValue<number>;
  showPoints?: boolean;
}> = React.memo(({ layer, scaleX, scaleY, plotHeight, animationProgress, showPoints }) => {
  if (layer.points.length < 2 && layer.type !== 'density') return null;

  const pixelPoints = useMemo(() => layer.points.map((point) => ({
    x: scaleX(point.x),
    y: scaleY(point.y),
  })), [layer.points, scaleX, scaleY]);

  const pathData = useMemo(() => {
    if (layer.points.length === 0) return '';
    if (layer.type === 'line' || layer.type === 'density') {
      if ((layer.raw as any).smooth) {
        const input = pixelPoints.map((p) => ({ x: p.x, y: p.y }));
        return createSmoothPath(input);
      }
      return pixelPoints
        .map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
    }
    // area — top edge follows the same smoothing rule as the line layer
    const topPath = (layer.raw as any).smooth
      ? createSmoothPath(pixelPoints.map((p) => ({ x: p.x, y: p.y })))
      : pixelPoints
          .map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
          .join(' ');
    const last = layer.points[layer.points.length - 1];
    const first = layer.points[0];
    const baseline = scaleY(0);
    return `${topPath} L ${scaleX(last.x)} ${baseline} L ${scaleX(first.x)} ${baseline} Z`;
  }, [layer, pixelPoints, scaleX, scaleY]);

  const pathLength = useMemo(() => (layer.type === 'line' || layer.type === 'density' ? computePathLength(pixelPoints) : 0), [layer.type, pixelPoints]);

  const animatedStrokeProps = useAnimatedProps(() => {
    if (layer.type === 'line' || layer.type === 'density') {
      const dashLength = Math.max(pathLength, 1);
      const offset = dashLength * (1 - animationProgress.value);
      return {
        strokeDasharray: `${dashLength}`,
        strokeDashoffset: offset,
      } as any;
    }
    return {} as any;
  });

  const animatedFillProps = useAnimatedProps(() => ({
    opacity: animationProgress.value,
  }));

  const renderPoints = showPoints && layer.type === 'line';

  return (
    <>
      {layer.type === 'area' ? (
        <AnimatedPath d={pathData} fill={layer.color} fillOpacity={(layer.raw as any).fillOpacity ?? 0.2} stroke={layer.color} strokeWidth={1} animatedProps={animatedFillProps} />
      ) : (
        <AnimatedPath d={pathData} fill="none" stroke={layer.color} strokeWidth={(layer.raw as any).thickness || (layer.type === 'density' ? 1.5 : 2)} animatedProps={animatedStrokeProps} />
      )}
      {renderPoints && pixelPoints.map((point, index) => (
        <AnimatedCircle
          key={`${layer.id}-point-${index}`}
          cx={point.x}
          cy={point.y}
          r={(layer.raw as any).pointSize || 3}
          fill={layer.color}
          animatedProps={animatedFillProps}
        />
      ))}
    </>
  );
});

ComboLineSeries.displayName = 'ComboLineSeries';

export const ComboChart: React.FC<ComboChartProps> = (props) => {
  const {
    layers,
    width = 520,
    height = 320,
    title,
    subtitle,
    enableCrosshair = true,
    multiTooltip = true,
    liveTooltip = true,
    xDomain: xDomainProp,
    yDomain: yDomainLeftProp,
    yDomainRight: yDomainRightProp,
    xAxis,
    yAxis,
    yAxisRight,
    legend,
    grid,
    style,
    disabled = false,
    onPress,
    onDataPointPress,
  } = props;

  const theme = useChartTheme();
  const assignColor = useMemo(() => createColorAssigner(), []);

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch { /* noop */ }

  const updateSeriesVisibility = interaction?.updateSeriesVisibility;
  const setPointer = interaction?.setPointer;
  const setActiveTarget = interaction?.setActiveTarget;
  const setActiveSlice = interaction?.setActiveSlice;
  // Subscribe to the live pointer + resolved active target so we can draw a crosshair that
  // tracks the cursor (usePointer re-renders per-frame during hover — acceptable for a
  // cursor-following visual, and only mounted when a crosshair is actually requested).
  const pointer = usePointer();
  const { activeTarget } = useActiveTarget();
  const wantsCrosshairUpdates = (enableCrosshair !== false) || Boolean(multiTooltip);
  const pointerStateAvailable = Boolean(setPointer || (wantsCrosshairUpdates && setActiveSlice));
  const isWeb = Platform.OS === 'web';

  const normalizedLayers = useMemo<NormalizedLayer[]>(() => {
    return layers.map((layer, index) => {
      const id = String(layer.id ?? `layer-${index}`);
      const targetAxis: TargetAxis = layer.targetAxis === 'right' ? 'right' : 'left';
      const color = layer.color || assignColor(index, layer.id);
      let points: Array<{ x: number; y: number; meta?: any }> = [];
      switch (layer.type) {
        case 'bar':
        case 'line':
        case 'area':
          points = layer.data.map((point) => {
            const meta = point.meta ? { ...point.meta } : {};
            if (meta.color == null && point.color != null) {
              meta.color = point.color;
            }
            return { x: point.x, y: point.y, meta };
          });
          break;
        case 'histogram':
          points = computeHistogramPoints(layer);
          break;
        case 'density':
          points = computeDensityPoints(layer);
          break;
      }
      return {
        id,
        name: layer.name || `${layer.type}-${index + 1}`,
        type: layer.type,
        targetAxis,
        color,
        points,
        raw: layer,
        visible: true,
      };
    });
  }, [layers, assignColor]);

  const seriesVisibility = useMemo(() => {
    const map = new Map<string, boolean>();
    interaction?.series.forEach((series) => {
      map.set(String(series.id), series.visible);
    });
    return map;
  }, [interaction?.series]);

  const resolvedLayers = useMemo(() =>
    normalizedLayers.map((layer) => ({
      ...layer,
      visible: seriesVisibility.has(layer.id) ? seriesVisibility.get(layer.id)! : true,
    })),
  [normalizedLayers, seriesVisibility]);

  const hasRightAxis = resolvedLayers.some((layer) => layer.targetAxis === 'right') || !!yAxisRight;

  // Grown so the plot clears the title and legend overlays. The topmost tick label sits
  // just below the title band, so it gets an allowance rather than competing for it.
  const legendLabels = useMemo(
    () => resolvedLayers.map((layer) => ({ label: layer.name })),
    [resolvedLayers]
  );
  const { xDomain, yDomainLeft, yDomainRight } = useMemo(() => {
    const leftLayers = resolvedLayers.filter((layer) => layer.targetAxis === 'left');
    const rightLayersOnly = resolvedLayers.filter((layer) => layer.targetAxis === 'right');

    const xValues = resolvedLayers.flatMap((layer) => layer.points.map((p) => p.x));
    let xMin = xDomainProp?.[0];
    let xMax = xDomainProp?.[1];
    if (xMin == null || xMax == null) {
      const min = xValues.length ? Math.min(...xValues) : 0;
      const max = xValues.length ? Math.max(...xValues) : 1;
      if (xMin == null) xMin = min;
      if (xMax == null) xMax = max;
    }
    if (xMin === xMax) {
      const delta = xMin === 0 ? 1 : Math.abs(xMin) * 0.1;
      xMin -= delta;
      xMax += delta;
    }

    const extractDomain = (layersSubset: NormalizedLayer[], provided?: [number, number]) => {
      if (provided) return provided;
      const values = layersSubset.flatMap((layer) => layer.points.map((p) => p.y));
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 1;
      if (min === max) {
        const delta = min === 0 ? 1 : Math.abs(min) * 0.1;
        return [min - delta, max + delta] as [number, number];
      }
      return [min, max] as [number, number];
    };

    const leftDomain = extractDomain(leftLayers, yDomainLeftProp);
    const rightDomain = rightLayersOnly.length ? extractDomain(rightLayersOnly, yDomainRightProp) : extractDomain(leftLayers, yDomainRightProp);

    return {
      xDomain: [xMin!, xMax!] as [number, number],
      yDomainLeft: leftDomain,
      yDomainRight: rightDomain,
    };
  }, [resolvedLayers, xDomainProp, yDomainLeftProp, yDomainRightProp]);

  // Margins measured off the labels each axis will draw, rather than a flat 80px
  // gutter that a narrow chart could not afford.
  const axisPadding = useMemo(
    () => resolveCartesianPadding({
      yTickLabels: domainTickLabels(yDomainLeft, (value) => (yAxis?.labelFormatter ? yAxis.labelFormatter(value) : `${value}`)),
      xTickLabels: domainTickLabels(xDomain, (value) => (xAxis?.labelFormatter ? xAxis.labelFormatter(value) : `${value}`)),
      yTitle: yAxis?.title,
      xTitle: xAxis?.title,
      showYAxis: yAxis?.show !== false,
      showXAxis: xAxis?.show !== false,
      showYTickLabels: yAxis?.showLabels !== false,
      showXTickLabels: xAxis?.showLabels !== false,
      containerWidth: width,
      containerHeight: height,
      // A right-hand value axis needs its own label column.
      rightAllowance: hasRightAxis
        ? Math.ceil(measureWidestLabel(
            domainTickLabels(yDomainRight, (value) => (yAxisRight?.labelFormatter ? yAxisRight.labelFormatter(value) : `${value}`)),
            11,
          )) + 12
        : 0,
    }),
    [yDomainLeft, yDomainRight, xDomain, yAxis?.labelFormatter, xAxis?.labelFormatter, yAxisRight?.labelFormatter,
     yAxis?.title, xAxis?.title, yAxis?.show, xAxis?.show, yAxis?.showLabels, xAxis?.showLabels, hasRightAxis, width, height]
  );
  const padding = useMemo(() => withChartBandPadding(
    axisPadding,
    {
      title,
      subtitle,
      legendItems: legend?.show ? legendLabels : undefined,
      legendPosition: legend?.position,
      legendFontSize: legend?.fontSize,
      containerWidth: width,
      topAllowance: 10,
    },
  ), [axisPadding, title, subtitle, legend?.show, legend?.position, legend?.fontSize, legendLabels, width]);

  const plotWidth = Math.max(0, width - padding.left - padding.right);
  const plotHeight = Math.max(0, height - padding.top - padding.bottom);
  const pointerTrackingEnabled = pointerStateAvailable && !disabled && plotWidth > 0 && plotHeight > 0;
  const hasContinuousPointerTracking = pointerTrackingEnabled && isWeb;


  const scaleX = useMemo(() => linearScale(xDomain, [0, plotWidth]), [xDomain, plotWidth]);
  const scaleYLeft = useMemo(() => linearScale(yDomainLeft, [plotHeight, 0]), [yDomainLeft, plotHeight]);
  const scaleYRight = useMemo(() => linearScale(yDomainRight, [plotHeight, 0]), [yDomainRight, plotHeight]);

  // Dedupe key of the last-published slice. The tooltip content only changes when the
  // pointer crosses into a new x-category, so we skip the (unthrottled) setActiveSlice/
  // setActiveTarget churn — and the slice rebuild — while the pointer stays in one category.
  const lastSliceKeyRef = useRef<string | null>(null);

  const updatePointerFromPlotCoords = useCallback((plotX: number, plotY: number, meta?: { pageX?: number; pageY?: number; data?: any }) => {
    if (!pointerStateAvailable) return;
    const chartX = padding.left + plotX;
    const chartY = padding.top + plotY;
    const insideX = plotX >= 0 && plotX <= plotWidth;
    const insideY = plotY >= 0 && plotY <= plotHeight;
    if (setPointer) {
      setPointer({
        x: chartX,
        y: chartY,
        inside: insideX && insideY,
        insideX,
        insideY,
        pageX: meta?.pageX,
        pageY: meta?.pageY,
        data: meta?.data ?? null,
      });
    }
    if (wantsCrosshairUpdates && setActiveSlice) {
      // Engine-swap: build a multi-layer ActiveTarget slice at the pointer x (one mark per
      // visible layer, snapped to its nearest data point) instead of feeding a legacy crosshair.
      const slice: ActiveTarget[] = [];
      for (const layer of resolvedLayers) {
        if (!layer.visible || layer.points.length === 0) continue;
        const axisScale = layer.targetAxis === 'right' ? scaleYRight : scaleYLeft;
        let nearest = layer.points[0];
        let nearestDist = Infinity;
        for (const point of layer.points) {
          const dist = Math.abs(scaleX(point.x) - plotX);
          if (dist < nearestDist) { nearestDist = dist; nearest = point; }
        }
        const formatter = layer.targetAxis === 'right' ? yAxisRight?.labelFormatter : yAxis?.labelFormatter;
        const px = padding.left + scaleX(nearest.x);
        const py = padding.top + axisScale(nearest.y);
        slice.push({
          seriesId: layer.id,
          markId: nearest.x,
          kind: 'point',
          datum: nearest,
          pixel: { x: px, y: py },
          value: nearest.y,
          distance: nearestDist,
          label: layer.name,
          color: (nearest.meta?.color as string | undefined) ?? layer.color,
          formattedValue: formatter ? formatter(nearest.y) : String(nearest.y),
          dataX: nearest.x,
          dataY: nearest.y,
        });
      }
      if (slice.length > 0) {
        // Only re-publish when the resolved category changes (markIds identify the x). While
        // the pointer stays in one category the content is identical — skip the re-render;
        // setPointer (rAF-throttled, above) keeps the tooltip following the cursor.
        const key = slice.map((s) => s.markId).join('|');
        if (key !== lastSliceKeyRef.current) {
          lastSliceKeyRef.current = key;
          setActiveSlice(slice);
          // Anchor the primary target to the layer whose point is closest to the pointer x.
          const primary = slice.reduce((a, b) => (b.distance < a.distance ? b : a), slice[0]);
          setActiveTarget?.(primary);
        }
      } else if (lastSliceKeyRef.current !== null) {
        lastSliceKeyRef.current = null;
        setActiveSlice([]);
        setActiveTarget?.(null);
      }
    }
  }, [pointerStateAvailable, padding.left, padding.top, plotWidth, plotHeight, setPointer, wantsCrosshairUpdates, setActiveSlice, setActiveTarget, resolvedLayers, scaleX, scaleYLeft, scaleYRight, yAxis, yAxisRight]);

  const clearPointerState = useCallback(() => {
    if (!pointerStateAvailable) return;
    if (setPointer) {
      setPointer({ x: 0, y: 0, inside: false, insideX: false, insideY: false, data: null });
    }
    if (wantsCrosshairUpdates) {
      lastSliceKeyRef.current = null;
      setActiveSlice?.([]);
      setActiveTarget?.(null);
    }
  }, [pointerStateAvailable, setPointer, wantsCrosshairUpdates, setActiveSlice, setActiveTarget]);

  useEffect(() => {
    if (!pointerTrackingEnabled) {
      clearPointerState();
    }
  }, [pointerTrackingEnabled, clearPointerState]);

  const handleWebPointerMove = useCallback((event: any) => {
    if (!hasContinuousPointerTracking) return;
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    updatePointerFromPlotCoords(x, y, { pageX: event.pageX ?? event.clientX, pageY: event.pageY ?? event.clientY });
  }, [hasContinuousPointerTracking, updatePointerFromPlotCoords]);

  const handlePointerLeave = useCallback(() => {
    if (!hasContinuousPointerTracking) return;
    clearPointerState();
  }, [hasContinuousPointerTracking, clearPointerState]);

  const svgPointerHandlers = useMemo(() => {
    if (!hasContinuousPointerTracking) return {};
    return {
      onPointerMove: handleWebPointerMove,
      onPointerDown: handleWebPointerMove,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerLeave,
    } as const;
  }, [hasContinuousPointerTracking, handleWebPointerMove, handlePointerLeave]) as Record<string, any>;

  const barLayers = resolvedLayers.filter((layer): layer is NormalizedBarLayer => layer.type === 'bar' || layer.type === 'histogram');
  const lineLayers = resolvedLayers.filter((layer): layer is NormalizedLineLikeLayer => layer.type === 'line' || layer.type === 'area' || layer.type === 'density');

  const layerSignature = useMemo(() => resolvedLayers.map((layer) => {
    const pointsSig = layer.points.map((point) => `${point.x}:${point.y}`).join('|');
    return `${layer.id}:${layer.visible ? '1' : '0'}:${pointsSig}`;
  }).join('||'), [resolvedLayers]);

  const animationProgress = useComboAnimation(disabled, 800, layerSignature);

  const handleBarHover = useCallback((bar: ComputedBarRect) => {
    const centerPlotX = bar.x + bar.width / 2 - padding.left;
    const pointerPlotY = bar.y - padding.top;
    updatePointerFromPlotCoords(centerPlotX, pointerPlotY);
  }, [padding.left, padding.top, updatePointerFromPlotCoords]);

  const handleBarHoverEnd = useCallback((_bar: ComputedBarRect) => {
    if (hasContinuousPointerTracking) return;
    clearPointerState();
  }, [hasContinuousPointerTracking, clearPointerState]);

  const handleBarPress = useCallback((bar: ComputedBarRect, nativeEvent: any) => {
    const chartEvent: ChartInteractionEvent = {
      nativeEvent,
      chartX: (bar.x + bar.width / 2) / width,
      chartY: (bar.y + bar.height / 2) / height,
      dataX: bar.dataX,
      dataY: bar.dataY,
      dataPoint: {
        x: bar.dataX,
        y: bar.dataY,
        ...bar.dataMeta,
      },
    };
    onPress?.(chartEvent);
    if (chartEvent.dataPoint) {
      onDataPointPress?.(chartEvent.dataPoint, chartEvent);
    }
  }, [height, onDataPointPress, onPress, width]);

  const xTicks = useMemo(() => xAxis?.ticks ?? generateNiceTicks(xDomain[0], xDomain[1], 6), [xAxis?.ticks, xDomain]);
  const yTicksLeft = useMemo(() => yAxis?.ticks ?? generateNiceTicks(yDomainLeft[0], yDomainLeft[1], 5), [yAxis?.ticks, yDomainLeft]);
  const yTicksRight = useMemo(() => yAxisRight?.ticks ?? generateNiceTicks(yDomainRight[0], yDomainRight[1], 5), [yAxisRight?.ticks, yDomainRight]);

  const normalizedXTicks = useMemo(() => {
    if (plotWidth <= 0) return [] as number[];
    return xTicks.map((tick) => (scaleX(tick) / (plotWidth || 1)));
  }, [xTicks, plotWidth, scaleX]);

  const normalizedYTicksLeft = useMemo(() => {
    if (plotHeight <= 0) return [] as number[];
    return yTicksLeft.map((tick) => (scaleYLeft(tick) / (plotHeight || 1)));
  }, [yTicksLeft, plotHeight, scaleYLeft]);

  const normalizedYTicksRight = useMemo(() => {
    if (plotHeight <= 0) return [] as number[];
    return yTicksRight.map((tick) => (scaleYRight(tick) / (plotHeight || 1)));
  }, [yTicksRight, plotHeight, scaleYRight]);

  const xAxisScale = useMemo<Scale<number>>(() => {
    const scale = linearScale(xDomain, [0, plotWidth]);
    scale.ticks = () => xTicks;
    return scale;
  }, [xDomain, plotWidth, xTicks]);

  const yAxisScaleLeft = useMemo<Scale<number>>(() => {
    const scale = linearScale(yDomainLeft, [plotHeight, 0]);
    scale.ticks = () => yTicksLeft;
    return scale;
  }, [yDomainLeft, plotHeight, yTicksLeft]);

  const yAxisScaleRight = useMemo<Scale<number>>(() => {
    const scale = linearScale(yDomainRight, [plotHeight, 0]);
    scale.ticks = () => yTicksRight;
    return scale;
  }, [yDomainRight, plotHeight, yTicksRight]);

  return (
    <ChartContainer
      width={width}
      height={height}
      padding={padding}
      disabled={disabled}
      animationDuration={800}
      style={style}
      interactionConfig={{ enableCrosshair, multiTooltip, liveTooltip }}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

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
          yTicks={normalizedYTicksLeft}
          padding={padding}
        />
      )}

      <Svg
        width={plotWidth}
        height={plotHeight}
        style={{ position: 'absolute', left: padding.left, top: padding.top }}
        {...svgPointerHandlers}
      >
        <G>
          {barLayers.map((layer) => (
            layer.visible ? (
              <ComboBarSeries
                key={layer.id}
                layer={layer}
                scaleX={scaleX}
                scaleY={layer.targetAxis === 'right' ? scaleYRight : scaleYLeft}
                plotWidth={plotWidth}
                plotHeight={plotHeight}
                padding={padding}
                animationProgress={animationProgress}
                disabled={disabled}
                onBarHover={handleBarHover}
                onBarHoverEnd={handleBarHoverEnd}
                onBarPress={handleBarPress}
              />
            ) : null
          ))}

          {lineLayers.map((layer) => (
            layer.visible ? (
              <ComboLineSeries
                key={layer.id}
                layer={layer}
                scaleX={scaleX}
                scaleY={layer.targetAxis === 'right' ? scaleYRight : scaleYLeft}
                plotHeight={plotHeight}
                animationProgress={animationProgress}
                showPoints={(layer.raw as any).showPoints}
              />
            ) : null
          ))}
        </G>
      </Svg>

      {/* Crosshair — a vertical guide tracking the cursor x across the plot. Snaps to the
          resolved active target (the nearest categorical mark) when one exists, otherwise
          follows the raw pointer x. Positioned in chart-absolute space (padding.left + plotX),
          matching how pointer.x / activeTarget.pixel.x are stored. */}
      {enableCrosshair !== false && pointer?.inside && (() => {
        const rawX = activeTarget?.pixel?.x ?? pointer.x;
        if (!Number.isFinite(rawX)) return null;
        const crosshairX = Math.max(padding.left, Math.min(padding.left + plotWidth, rawX));
        return (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: crosshairX,
              top: padding.top,
              height: plotHeight,
              width: 1,
              backgroundColor: theme.colors.grid || 'rgba(0,0,0,0.2)',
            }}
          />
        );
      })()}

      {xAxis?.show !== false && (
        <Axis
          orientation="bottom"
          scale={xAxisScale}
          length={plotWidth}
          offset={{ x: padding.left, y: padding.top + plotHeight }}
          tickCount={xTicks.length}
          tickSize={xAxis?.tickLength ?? 4}
          tickPadding={8}
          tickFormat={(value: number) => (xAxis?.labelFormatter ? xAxis.labelFormatter(value) : `${value}`)}
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
          scale={yAxisScaleLeft}
          length={plotHeight}
          offset={{ x: padding.left, y: padding.top }}
          tickCount={yTicksLeft.length}
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

      {hasRightAxis && (yAxisRight?.show ?? true) && (
        <Axis
          orientation="right"
          scale={yAxisScaleRight}
          length={plotHeight}
          offset={{ x: width - padding.right, y: padding.top }}
          tickCount={yTicksRight.length}
          tickSize={yAxisRight?.tickLength ?? 4}
          tickPadding={6}
          tickFormat={(value: number) => (yAxisRight?.labelFormatter ? yAxisRight.labelFormatter(value) : `${value}`)}
          label={yAxisRight?.title}
          stroke={yAxisRight?.color || theme.colors.grid}
          strokeWidth={yAxisRight?.thickness ?? 1}
          showLine={yAxisRight?.show ?? true}
          showTicks={yAxisRight?.showTicks ?? true}
          showLabels={yAxisRight?.showLabels ?? true}
          tickLabelColor={yAxisRight?.labelColor || theme.colors.textSecondary}
          tickLabelFontSize={yAxisRight?.labelFontSize ?? 11}
        />
      )}

      {legend?.show && (
        <ChartLegend
          items={resolvedLayers.map((layer) => ({
            label: layer.name,
            color: layer.color,
            visible: layer.visible,
          }))}
          position={legend.position}
          align={legend.align}
          textColor={legend.textColor}
          fontSize={legend.fontSize}
          onItemPress={updateSeriesVisibility ? (item, index, nativeEvent) => {
            const layer = resolvedLayers[index];
            if (!layer) return;
            const currentVisible = interaction?.series.find((series) => String(series.id) === layer.id)?.visible ?? layer.visible;
            const isolate = nativeEvent?.shiftKey;
            if (isolate) {
              const currentlyVisible = resolvedLayers.filter((entry) => entry.visible).map((entry) => entry.id);
              const isSole = currentlyVisible.length === 1 && currentlyVisible[0] === layer.id;
              resolvedLayers.forEach((entry) => updateSeriesVisibility(entry.id, isSole ? true : entry.id === layer.id));
            } else {
              updateSeriesVisibility(layer.id, !currentVisible);
            }
          } : undefined}
        />
      )}
    </ChartContainer>
  );
};

ComboChart.displayName = 'ComboChart';
