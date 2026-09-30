import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Line, Rect, Text as SvgText } from 'react-native-svg';

import type {
  SparklineChartProps,
  SparklinePoint,
  SparklineExtremaHighlight,
  SparklineThreshold,
  SparklineBand,
  SparklineAnimationOptions,
} from './types';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { linearScale } from '../../utils/scales';
import { AnimatedSparkline } from './AnimatedSparkline';
import { useSparklineGeometry } from './useSparklineGeometry';
import { useChartPointer } from '../../interaction/useChartPointer';
import { PointSeriesHitTester } from '../../core/hittest/point';
import type { HitSeries, Mark } from '../../core/hittest/types';

const DEFAULT_PADDING = { top: 4, right: 4, bottom: 4, left: 4 };

const normalizeData = (data: SparklineChartProps['data']): SparklinePoint[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (typeof data[0] === 'number') {
    return (data as number[]).map((value, index) => ({ x: index, y: value }));
  }

  return (data as SparklinePoint[]).map((point, index) => ({
    x: Number(point.x ?? index),
    y: Number(point.y ?? 0),
  }));
};

export const SparklineChart: React.FC<SparklineChartProps> = (props) => {
  const {
    id: idProp,
    name,
    data,
    w: width = 120,
    h: height = 48,
    color,
    fill = true,
    fillOpacity = 0.3,
    strokeWidth = 2,
    smooth = true,
    showPoints = false,
    pointSize = 3,
    domain,
    highlightLast = true,
    highlightExtrema: highlightExtremaProp = false,
    valueFormatter,
    liveTooltip = true,
    multiTooltip = false,
    thresholds = [] as SparklineThreshold[],
    bands = [] as SparklineBand[],
    animation,
    disabled = false,
    style,
  } = props;

  const theme = useChartTheme();
  const strokeColor = color ?? theme.colors.accentPalette[0];
  const finalFillOpacity = Math.max(0, Math.min(1, fillOpacity));
  const thresholdsList = Array.isArray(thresholds) ? thresholds : [];
  const bandsList = Array.isArray(bands) ? bands : [];

  const animationSettings = useMemo(() => {
    const opts: SparklineAnimationOptions | undefined = animation;
    const enabled = opts?.enabled !== false;
    return {
      enabled,
      duration: opts?.duration ?? 550,
      delay: opts?.delay ?? 0,
      easing: opts?.easing ?? 'easeOutCubic',
    } as const;
  }, [animation]);

  const extremaSettings = useMemo(() => {
    if (!highlightExtremaProp) {
      return {
        enabled: false,
        showMin: false,
        showMax: false,
        color: strokeColor,
        radius: pointSize + 2,
        outlineColor: '#ffffff',
        outlineWidth: 1.5,
      };
    }

    const base: SparklineExtremaHighlight = highlightExtremaProp === true ? {} : highlightExtremaProp;
    const showMin = base.showMin ?? true;
    const showMax = base.showMax ?? true;
    const enabled = showMin || showMax;

    return {
      enabled,
      showMin,
      showMax,
      color: base.color ?? strokeColor,
      radius: base.radius ?? pointSize + 2,
      outlineColor: base.strokeColor ?? '#ffffff',
      outlineWidth: base.strokeWidth ?? 1.5,
    };
  }, [highlightExtremaProp, pointSize, strokeColor]);

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch {
    // Allow standalone usage without provider
  }

  const register = interaction?.register;
  const interactionSeries = interaction?.series;

  const normalizedData = useMemo(() => normalizeData(data), [data]);
  const padding = DEFAULT_PADDING;
  const plotWidth = Math.max(0, width - padding.left - padding.right);
  const plotHeight = Math.max(0, height - padding.top - padding.bottom);

  const generatedIdRef = useRef<string>(`spark-${Math.random().toString(36).slice(2)}`);
  const seriesId = idProp ?? generatedIdRef.current;

  const geometry = useSparklineGeometry({
    data: normalizedData,
    width,
    height,
    smooth,
    padding,
    domain,
    enableFill: fill && fillOpacity > 0,
  });

  const {
    points: chartPoints,
    strokePath,
    fillPath,
    pathLength,
    xDomain,
    yDomain,
    zeroNormalized,
  } = geometry;

  const xScale = useMemo(
    () => linearScale(xDomain, [padding.left, padding.left + plotWidth]),
    [padding.left, plotWidth, xDomain]
  );

  const yScale = useMemo(
    () => linearScale(yDomain, [padding.top + plotHeight, padding.top]),
    [padding.top, plotHeight, yDomain]
  );

  const extremaConfigForRender = useMemo(() => {
    if (!extremaSettings.enabled) return undefined;
    return {
      showMin: extremaSettings.showMin,
      showMax: extremaSettings.showMax,
      color: extremaSettings.color,
      radius: extremaSettings.radius,
      outlineColor: extremaSettings.outlineColor,
      outlineWidth: extremaSettings.outlineWidth,
    };
  }, [extremaSettings]);

  const minPoint = useMemo(() => {
    if (!extremaSettings.enabled || !extremaSettings.showMin || !chartPoints.length) {
      return null;
    }
    return chartPoints.reduce((currentMin, point) => (point.y < currentMin.y ? point : currentMin), chartPoints[0]);
  }, [chartPoints, extremaSettings.enabled, extremaSettings.showMin]);

  const maxPoint = useMemo(() => {
    if (!extremaSettings.enabled || !extremaSettings.showMax || !chartPoints.length) {
      return null;
    }
    return chartPoints.reduce((currentMax, point) => (point.y > currentMax.y ? point : currentMax), chartPoints[0]);
  }, [chartPoints, extremaSettings.enabled, extremaSettings.showMax]);

  const thresholdRender = useMemo(() => {
    if (!thresholdsList.length) {
      return { lines: [] as React.ReactNode[], labels: [] as React.ReactNode[] };
    }

    const lines: React.ReactNode[] = [];
    const labels: React.ReactNode[] = [];

    thresholdsList.forEach((threshold, index) => {
      if (!threshold || typeof threshold.value !== 'number') {
        return;
      }

      const yCoord = yScale(threshold.value);
      if (!Number.isFinite(yCoord)) {
        return;
      }

      const keyBase = `spark-threshold-${index}-${threshold.value}`;
      const stroke = threshold.color ?? strokeColor;
      const opacity = threshold.opacity ?? 0.6;
      const dash = threshold.dashed ? '4 3' : undefined;

      lines.push(
        <Line
          key={`${keyBase}-line`}
          x1={padding.left}
          x2={padding.left + plotWidth}
          y1={yCoord}
          y2={yCoord}
          stroke={stroke}
          strokeWidth={1}
          strokeDasharray={dash}
          opacity={opacity}
        />
      );

      if (threshold.label) {
        const labelOffset = threshold.labelOffset ?? -6;
        const position = threshold.labelPosition ?? 'right';
        const anchor = position === 'left' ? 'start' : 'end';
        const labelX = position === 'left' ? padding.left + 4 : padding.left + plotWidth - 4;
        labels.push(
          <SvgText
            key={`${keyBase}-label`}
            x={labelX}
            y={yCoord + labelOffset}
            fill={threshold.labelColor ?? theme.colors.textSecondary}
            fontSize={9}
            textAnchor={anchor}
          >
            {threshold.label}
          </SvgText>
        );
      }
    });

    return { lines, labels };
  }, [thresholdsList, yScale, strokeColor, padding.left, plotWidth, theme.colors.textSecondary]);

  const bandRender = useMemo(() => {
    if (!bandsList.length) return [] as React.ReactNode[];
    return bandsList
      .map((band, index) => {
        if (!band) return null;
        const from = band.from;
        const to = band.to;
        const yStart = yScale(Math.max(from, to));
        const yEnd = yScale(Math.min(from, to));
        if (!Number.isFinite(yStart) || !Number.isFinite(yEnd)) {
          return null;
        }
        const top = Math.min(yStart, yEnd);
        const bottom = Math.max(yStart, yEnd);
        const heightRect = bottom - top;
        if (heightRect <= 0) return null;
        const fill = band.color ?? strokeColor;
        const opacity = band.opacity ?? 0.1;
        return (
          <Rect
            key={`spark-band-${index}-${from}-${to}`}
            x={padding.left}
            y={top}
            width={plotWidth}
            height={heightRect}
            fill={fill}
            opacity={opacity}
            rx={2}
          />
        );
      })
      .filter(Boolean) as React.ReactNode[];
  }, [bandsList, padding.left, plotWidth, strokeColor, yScale]);

  const gradientIdRef = useRef<string>(`sparkline-gradient-${Math.random().toString(36).slice(2)}`);
  const gradientId = gradientIdRef.current;

  const dataSignature = useMemo(
    () => chartPoints.map((point) => `${point.x}:${point.y}`).join('|'),
    [chartPoints]
  );

  const seriesVisibility = interactionSeries?.find((series) => series.id === seriesId)?.visible;
  const isSeriesVisible = seriesVisibility !== false;

  // New interaction engine: build container-origin marks + a point hit-tester,
  // register it with the store, and let the shared engine drive hover/tooltip.
  // chartPoints' chartX/chartY are already container-origin (from the sparkline
  // geometry's scales), so no padding offset is needed here.
  const hitSeries: HitSeries[] = useMemo(() => [{
    id: seriesId,
    name,
    color: strokeColor,
    visible: isSeriesVisible,
    marks: chartPoints.map((p, i): Mark => ({
      id: i,
      pixel: { x: p.chartX, y: p.chartY },
      value: p.y,
      datum: p,
      dataX: p.x,
      dataY: p.y,
      formattedValue: valueFormatter ? valueFormatter(p.y) : String(p.y),
    })),
  }], [seriesId, name, strokeColor, isSeriesVisible, chartPoints, valueFormatter]);

  const tester = useMemo(() => new PointSeriesHitTester(hitSeries), [hitSeries]);

  useEffect(() => {
    if (!register) return;
    register(seriesId, { frame: { kind: 'cartesian' } as any, geometry: { kind: 'point' }, series: hitSeries });
    return () => register(seriesId, null);
  }, [register, seriesId, hitSeries]);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding,
    plotWidth,
    plotHeight,
    enabled: Boolean(interaction) && !disabled,
    // Honour the per-chart liveTooltip prop; multi-series slice is governed by the
    // shared store config (config.multiTooltip) via useChartPointer.
    hover: liveTooltip !== false,
    press: false,
    tester,
    maxDistance: 30,
  });

  const baselineTicks = useMemo(() => (
    zeroNormalized != null && Number.isFinite(zeroNormalized)
      ? [zeroNormalized]
      : []
  ), [zeroNormalized]);

  const gridConfig = useMemo(() => ({
    show: baselineTicks.length > 0,
    color: theme.colors.grid,
    thickness: 1,
    style: 'solid' as const,
    showMajor: true,
    showMinor: false,
  }), [baselineTicks.length, theme.colors.grid]);

  return (
    <View style={[{ width, height, position: 'relative' }, style]}>
      <Axis
        scale={xScale}
        orientation="bottom"
        length={plotWidth}
        offset={{ x: padding.left, y: padding.top + plotHeight }}
        showLine={false}
        showTicks={false}
        showLabels={false}
      />

      <Axis
        scale={yScale}
        orientation="left"
        length={plotHeight}
        offset={{ x: padding.left, y: padding.top }}
        showLine={false}
        showTicks={false}
        showLabels={false}
      />

      <ChartGrid
        grid={gridConfig}
        plotWidth={plotWidth}
        plotHeight={plotHeight}
        padding={padding}
        yTicks={baselineTicks}
      />

      <Svg width={width} height={height}>
        {fill && fillPath ? (
          <Defs>
            <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0%" stopColor={strokeColor} stopOpacity={finalFillOpacity} />
              <Stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>
        ) : null}

  {bandRender}
        {thresholdRender.lines}

        <AnimatedSparkline
          strokePath={strokePath}
          fillPath={fill && fillPath ? fillPath : null}
          pathLength={pathLength}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          fillColor={strokeColor}
          fillOpacity={finalFillOpacity}
          showPoints={showPoints}
          pointSize={pointSize}
          highlightLast={highlightLast}
          points={chartPoints}
          gradientId={fill && fillPath ? gradientId : undefined}
          dataSignature={dataSignature}
          disabled={disabled}
          visible={isSeriesVisible}
          highlightExtremaConfig={extremaConfigForRender}
          minPoint={minPoint}
          maxPoint={maxPoint}
          animationConfig={animationSettings}
        />

        {thresholdRender.labels}
      </Svg>

      {/* Unified cross-platform gesture surface (web PointerEvents | native
          Responder). Full-chart overlay so pointer coords are container-origin,
          matching registered mark pixels. */}
      {Boolean(interaction) && !disabled && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="sparkline-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}
    </View>
  );
};

SparklineChart.displayName = 'SparklineChart';

export default SparklineChart;
