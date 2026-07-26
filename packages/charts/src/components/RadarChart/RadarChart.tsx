import React, { useMemo, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line as SvgLine, G, Rect, Text as SvgText, TSpan } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

import { RadarChartProps, RadarChartSeries, RadarAxisPoint } from './types';
import {
  ChartContainer,
  ChartTitle,
  ChartLegend,
  estimateChartTextWidth,
  measureChartLegendBand,
  measureChartTitleBand,
} from '../../ChartBase';
import { useChartInteractionContext, usePointer } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { RadarAxisHitTester } from '../../core/hittest/radarAxis';
import type { HitSeries, Mark } from '../../core/hittest/types';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { getColorFromScheme, colorSchemes } from '../../utils';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const buildRadarPath = (points: Array<{ x: number; y: number }>, smooth: number) => {
  if (!points.length) return '';
  if (points.length < 3 || smooth <= 0) {
    let d = '';
    points.forEach((p, i) => {
      d += (i === 0 ? 'M' : 'L') + ` ${p.x} ${p.y}`;
    });
    return d + (points.length ? ' Z' : '');
  }

  const tension = clamp(smooth, 0.01, 1);
  const total = points.length;
  const getPoint = (idx: number) => points[(idx + total) % total];
  const path: string[] = [];
  const start = points[0];
  path.push('M', String(start.x), String(start.y));

  for (let i = 0; i < total; i++) {
    const p0 = getPoint(i - 1);
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);
    const p3 = getPoint(i + 2);

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

    path.push('C', String(cp1x), String(cp1y), String(cp2x), String(cp2y), String(p2.x), String(p2.y));
  }

  path.push('Z');
  return path.join(' ');
};

interface PlotBox { left: number; top: number; width: number; height: number }

/** Keeps the outermost ring off the edge of the plot box. */
const RADAR_MIN_MARGIN = 8;
/** Padding around a ring label's background plate. */
const RING_LABEL_PLATE_PAD_X = 4;
const RING_LABEL_PLATE_PAD_Y = 2;
const RADAR_EPS = 1e-6;
/** Above this much upward lean, a label is treated as sitting above the web. */
const RADAR_VERTICAL_LABEL_THRESHOLD = -0.35;

const radarAngleFor = (idx: number, axisCount: number) =>
  (Math.PI * 2 * idx / axisCount) - Math.PI / 2;

/**
 * Largest web radius whose axis labels still fit inside the plot box. What a label costs
 * depends on its angle and text anchor — "Collaboration" at 9 o'clock needs its full width
 * as gutter, the same string at 12 o'clock needs almost none — so the limit is solved per
 * axis and the tightest one wins. A single uniform padding either clips the wide ones or
 * shrinks the web to fit a worst case that isn't there.
 */
function fitRadarRadius(options: {
  plot: PlotBox;
  labels: string[];
  axisCount: number;
  fontSize: number;
  labelOffset: number;
  placement: 'outside' | 'edge' | 'inside';
}): number {
  const { plot, labels, axisCount, fontSize, labelOffset, placement } = options;
  const cx = plot.left + plot.width / 2;
  const cy = plot.top + plot.height / 2;
  const right = plot.left + plot.width;
  const bottom = plot.top + plot.height;
  const ceiling = Math.min(plot.width, plot.height) / 2 - RADAR_MIN_MARGIN;

  // Inside labels sit within the web, so only the box itself constrains the radius.
  if (placement === 'inside') return Math.max(ceiling, 8);

  let best = ceiling;

  labels.forEach((label, index) => {
    const angle = radarAngleFor(index, axisCount);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const lines = String(label ?? '').split('\n');
    const textWidth = lines.reduce(
      (max, line) => Math.max(max, estimateChartTextWidth(line, fontSize)),
      0
    );
    const lineHeight = fontSize * 1.2;

    // Mirrors the textAnchor the label is actually rendered with.
    const anchor = Math.abs(cos) < 0.35 ? 'middle' : cos > 0 ? 'start' : 'end';
    const padRight = anchor === 'start' ? textWidth : anchor === 'middle' ? textWidth / 2 : 0;
    const padLeft = anchor === 'end' ? textWidth : anchor === 'middle' ? textWidth / 2 : 0;
    // SvgText y is the baseline, so most of the glyph sits above it. Labels above the web
    // are bottom-anchored (see the axis-label render), so their extra lines stack upwards.
    const stacked = (lines.length - 1) * lineHeight;
    const above = sin < RADAR_VERTICAL_LABEL_THRESHOLD;
    const padUp = fontSize * 0.8 + (above ? stacked : 0);
    const padDown = fontSize * 0.25 + (above ? 0 : stacked);

    // cx + cos * (r + offset) ± pad must stay inside the box; solve each side for r.
    if (cos > RADAR_EPS) best = Math.min(best, (right - padRight - cx) / cos - labelOffset);
    if (cos < -RADAR_EPS) best = Math.min(best, (plot.left + padLeft - cx) / cos - labelOffset);
    if (sin > RADAR_EPS) best = Math.min(best, (bottom - padDown - cy) / sin - labelOffset);
    if (sin < -RADAR_EPS) best = Math.min(best, (plot.top + padUp - cy) / sin - labelOffset);
  });

  return Math.max(best, 8);
}

/**
 * Radar grid geometry, centred on the plot box rather than the container. The box excludes
 * the bands ChartTitle and ChartLegend overlay, which the web would otherwise render under.
 */
function useRadarGrid(plot: PlotBox, axisCount: number, radius: number) {
  const { left, top, width, height } = plot;
  return useMemo(() => {
    const angleFor = (idx: number) => radarAngleFor(idx, axisCount);
    const valueToRadius = (value: number, maxValue: number) => (value / maxValue) * radius;

    return {
      centerX: left + width / 2,
      centerY: top + height / 2,
      radius,
      angleFor,
      valueToRadius,
    };
  }, [left, top, width, height, axisCount, radius]);
}

// Animated radar area component
const AnimatedRadarArea: React.FC<{
  path: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  animationProgress: SharedValue<number>;
  fill: boolean;
  disabled: boolean;
}> = React.memo(({ 
  path, 
  fillColor, 
  strokeColor, 
  strokeWidth, 
  opacity, 
  animationProgress, 
  fill, 
  disabled 
}) => {
  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value;
    return {
      strokeDasharray: disabled ? undefined : `${progress * 1000} 1000`,
      fillOpacity: fill ? opacity * progress : 0,
      strokeOpacity: progress,
    } as any;
  }, [fill, opacity, disabled]);

  return (
    <AnimatedPath
      d={path}
      fill={fill ? fillColor : 'none'}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      animatedProps={animatedProps}
    />
  );
});

AnimatedRadarArea.displayName = 'AnimatedRadarArea';

// Animated radar point component
const AnimatedRadarPoint: React.FC<{
  cx: number;
  cy: number;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  animationProgress: SharedValue<number>;
  delay: number;
  isHighlighted: boolean;
  disabled: boolean;
}> = React.memo(({ 
  cx, 
  cy, 
  radius, 
  fill, 
  stroke, 
  strokeWidth, 
  animationProgress, 
  delay,
  isHighlighted,
  disabled 
}) => {
  const scale = useSharedValue(disabled ? 1 : 0);
  const highlightScale = useSharedValue(isHighlighted ? 1.5 : 1);

  useEffect(() => {
    if (disabled) {
      scale.value = 1;
      return;
    }
    scale.value = withDelay(delay, withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.back(1.2)),
    }));
  }, [disabled, delay, scale]);

  useEffect(() => {
    highlightScale.value = withTiming(isHighlighted ? 1.5 : 1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [isHighlighted, highlightScale]);

  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value;
    const currentScale = scale.value * highlightScale.value;
    return {
      r: radius * currentScale * progress,
      fillOpacity: progress,
      strokeOpacity: progress,
    } as any;
  }, [radius]);

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      animatedProps={animatedProps}
    />
  );
});

AnimatedRadarPoint.displayName = 'AnimatedRadarPoint';
export const RadarChart: React.FC<RadarChartProps> = (props) => {
  const {
    series,
    width = 400,
    height = 400,
    title,
    subtitle,
    maxValue: maxValueProp,
    radialGrid,
    smooth,
    fill = true,
    legend,
    enableCrosshair,
    multiTooltip,
    liveTooltip,
    tooltip,
    disabled = false,
    animationDuration = 800,
    style,
    // Chart-specific + these leftovers are pulled out so only base props
    // (testID, accessibility*, spacing, useOwnInteractionProvider, suppressPopover)
    // flow through `...rest` onto ChartContainer.
    ...rest
  } = props;

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch {
    interaction = null;
  }

  const theme = useChartTheme();
  const register = interaction?.register;
  const updateSeriesVisibility = interaction?.updateSeriesVisibility;
  const defaultScheme = colorSchemes.default;

  // Extract unique axes from all series
  const axisEntries = useMemo(() => {
    const map = new Map<string | number, RadarAxisPoint>();
    series.forEach(s =>
      s.data.forEach(p => {
        if (!map.has(p.axis)) map.set(p.axis, p);
      })
    );
    return Array.from(map.values());
  }, [series]);

  const axes = useMemo(() => axisEntries.map(entry => entry.axis), [axisEntries]);

  const axisCount = Math.max(axes.length, 3);
  const maxValue = useMemo(
    () => maxValueProp ?? Math.max(1, ...series.flatMap(s => s.data.map(p => p.value))),
    [series, maxValueProp]
  );

  const legendItems = useMemo(
    () =>
      series.map((s, si) => {
        const override = interaction?.series.find(sr => sr.id === (s.id || si));
        const visible = override ? override.visible !== false : s.visible !== false;
        return {
          label: s.name || String(s.id || si),
          color: s.color || getColorFromScheme(si, colorSchemes.default),
          visible,
        };
      }),
    [series, interaction?.series]
  );

  // ChartTitle and ChartLegend are absolutely positioned overlays on the container, so the
  // web has to reserve their bands or it draws straight underneath them.
  const legendShown = legend?.show !== false;
  const legendPosition = legend?.position ?? 'bottom';
  const titleBand = useMemo(() => measureChartTitleBand(title, subtitle), [title, subtitle]);
  const legendBand = useMemo(
    () =>
      measureChartLegendBand({
        items: legendShown ? legendItems : undefined,
        containerWidth: width,
        position: legendPosition,
      }),
    [legendShown, legendItems, legendPosition, width]
  );

  const plotBox = useMemo(
    () => ({
      left: legendBand.left,
      top: titleBand + legendBand.top,
      width: Math.max(width - legendBand.left - legendBand.right, 1),
      height: Math.max(height - titleBand - legendBand.top - legendBand.bottom, 1),
    }),
    [width, height, titleBand, legendBand]
  );

  const axisLabelPlacement = radialGrid?.axisLabelPlacement ?? 'outside';
  const axisLabelOffset = radialGrid?.axisLabelOffset ?? (
    axisLabelPlacement === 'outside'
      ? 16
      : axisLabelPlacement === 'inside'
        ? 12
        : 0
  );
  const axisLabelFormatter = radialGrid?.axisLabelFormatter;

  const axisLabels = useMemo(
    () =>
      axes.map((a, ai) => {
        const axisEntry = axisEntries[ai];
        const formatted = axisLabelFormatter
          ? axisLabelFormatter(a, { index: ai, total: axes.length, label: axisEntry?.label })
          : axisEntry?.label ?? a;
        return formatted == null ? '' : String(formatted);
      }),
    [axes, axisEntries, axisLabelFormatter]
  );

  // Use radar grid geometry hook
  const fittedRadius = useMemo(
    () =>
      fitRadarRadius({
        plot: plotBox,
        labels: axisLabels,
        axisCount,
        fontSize: theme.fontSize.sm,
        labelOffset: axisLabelOffset,
        placement: axisLabelPlacement,
      }),
    [plotBox, axisLabels, axisCount, theme.fontSize.sm, axisLabelOffset, axisLabelPlacement]
  );

  const { centerX, centerY, radius, angleFor, valueToRadius } = useRadarGrid(
    plotBox,
    axisCount,
    fittedRadius
  );

  // Animation
  const animationProgress = useSharedValue(disabled ? 1 : 0);
  const dataSignature = useMemo(() => {
    return series
      .map(s => 
        `${s.id}-${s.data.map(p => `${p.axis}:${p.value}`).join('|')}`
      )
      .join('||');
  }, [series]);

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

  // New interaction engine: one hit-series per data series, one mark per spoke. Each
  // mark encodes its spoke's canonical angle (0=top, CW) in dataX + extent.axisIndex,
  // so the axis tester resolves the nearest spoke by angle. slice() then returns every
  // series' value at that spoke (the multi-series radar tooltip).
  const hitSeries: HitSeries[] = useMemo(() => series.map((s, si) => {
    const override = interaction?.series.find((sr) => sr.id === (s.id || si));
    const visible = override ? override.visible !== false : s.visible !== false;
    const color = s.color || getColorFromScheme(si, defaultScheme);
    const marks: Mark[] = axes.map((a, ai) => {
      const point = s.data.find((p) => p.axis === a);
      const val = point ? point.value : 0;
      const rr = valueToRadius(val, maxValue);
      const ang = angleFor(ai);
      let custom: any;
      if (point && point.tooltip != null) {
        custom = typeof point.tooltip === 'function'
          ? point.tooltip(point, { axisIndex: ai, seriesIndex: si, series: s })
          : point.tooltip;
      }
      // Only tooltip.formatter + tooltip.show are honored per-chart; styling props are
      // resolved globally by ChartActiveTooltip. Per-datum overrides (point.tooltip /
      // point.formattedValue) win; the chart-level formatter fills where neither exists.
      const datum = point ?? { axis: a, value: val };
      const tf = custom == null && point?.formattedValue == null
        ? tooltip?.formatter?.(datum)
        : undefined;
      const rawFormatted = point?.formattedValue
        ?? (typeof custom === 'string' || typeof custom === 'number' ? custom
          : typeof tf === 'string' ? tf
          : val);
      const formattedValue = rawFormatted == null ? undefined : String(rawFormatted);
      return {
        id: ai,
        pixel: { x: centerX + Math.cos(ang) * rr, y: centerY + Math.sin(ang) * rr },
        value: val,
        dataX: (360 * ai) / axisCount,
        datum,
        label: s.name || `Series ${si + 1}`,
        color,
        extent: { axisIndex: ai },
        formattedValue,
        customTooltip: typeof custom === 'object' && custom !== null
          ? custom
          : (tf != null && typeof tf !== 'string' ? tf : undefined),
      };
    });
    return { id: s.id ?? si, name: s.name || `Series ${si + 1}`, color, visible, marks };
  }), [series, axes, centerX, centerY, angleFor, valueToRadius, maxValue, axisCount, defaultScheme, interaction?.series, tooltip]);

  const tester = useMemo(() => new RadarAxisHitTester(centerX, centerY, hitSeries), [centerX, centerY, hitSeries]);

  useEffect(() => {
    if (!register) return;
    register('radar', { frame: { kind: 'polar', cx: centerX, cy: centerY } as any, geometry: { kind: 'axis', cx: centerX, cy: centerY }, series: hitSeries });
    return () => register('radar', null);
  }, [register, hitSeries, centerX, centerY]);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    plotWidth: width,
    plotHeight: height,
    enabled: Boolean(interaction) && !disabled,
    hover: true,
    press: false,
    tester,
  });

  // Grid rings
  const ringCount = radialGrid?.rings ?? 4;
  const ringRadii = Array.from({ length: ringCount }, (_, i) => radius * (i + 1) / ringCount);


  const computedRingLabels = useMemo(() => {
    if (!radialGrid?.ringLabels) return null;
    const { ringLabels } = radialGrid;

    return Array.from({ length: ringCount }, (_, index) => {
      const value = maxValue * ((index + 1) / ringCount);
      if (Array.isArray(ringLabels)) {
        return ringLabels[index] ?? '';
      }
      return ringLabels({ index, ringCount, value, maxValue }) ?? '';
    });
  }, [radialGrid, ringCount, maxValue]);

  const showRingLabels = Boolean(computedRingLabels?.some(label => label));
  const ringLabelPosition = radialGrid?.ringLabelPosition ?? 'outside';
  const ringLabelOffset = radialGrid?.ringLabelOffset ?? 10;

  // Compute polygon paths with interaction visibility
  const smoothTension = typeof smooth === 'number' ? smooth : smooth ? 0.45 : 0;

  const polygons = useMemo(() => {
    return series.map((s, si) => {
      const override = interaction?.series.find(sr => sr.id === (s.id || si));
      const visible = override ? override.visible !== false : s.visible !== false;

      const points = axes.map((a, ai) => {
        const d = s.data.find(p => p.axis === a);
        const val = d ? d.value : 0;
        const rr = valueToRadius(val, maxValue);
        const ang = angleFor(ai);
        const x = centerX + Math.cos(ang) * rr;
        const y = centerY + Math.sin(ang) * rr;
        return { x, y, value: val, axis: a, raw: d };
      });

      const path = buildRadarPath(points, smoothTension);

      return {
        id: s.id || si,
        color: s.color || getColorFromScheme(si, defaultScheme),
        d: path,
        points,
        series: s,
        visible,
      };
    });
  }, [series, axes, centerX, centerY, valueToRadius, maxValue, angleFor, defaultScheme, interaction?.series, smoothTension]);

  // Pointer-derived radial crosshair — pointer subscription.
  const pointer = usePointer();
  const activeAxisIndex = useMemo(() => {
    if (!pointer || !enableCrosshair || !pointer.inside) return null;
    const dx = pointer.x - centerX;
    const dy = pointer.y - centerY;
    const angle = Math.atan2(dy, dx) + Math.PI / 2; // rotate so 0 at top
    const norm = (angle < 0 ? angle + Math.PI * 2 : angle) % (Math.PI * 2);
    const idx = Math.round(norm / (Math.PI * 2) * axisCount) % axisCount;
    return idx;
  }, [pointer, enableCrosshair, centerX, centerY, axisCount]);


  // Highlighted points for active axis
  const highlightedAxisPoints = useMemo(() => {
    if (activeAxisIndex == null) return [];
    
    return series
      .map((s, si) => {
        const override = interaction?.series.find(sr => sr.id === (s.id || si));
        const visible = override ? override.visible !== false : s.visible !== false;
        if (!visible) return null;

        const axisKey = axes[activeAxisIndex];
        const d = s.data.find(p => p.axis === axisKey);
        if (!d) return null;

        const rr = valueToRadius(d.value, maxValue);
        const ang = angleFor(activeAxisIndex);
        const x = centerX + Math.cos(ang) * rr;
        const y = centerY + Math.sin(ang) * rr;

        return {
          x,
          y,
          color: s.color || getColorFromScheme(si, defaultScheme),
          id: (s.id || si) + '-' + String(axisKey),
          value: d.value,
          seriesIndex: si,
        };
      })
      .filter(Boolean) as Array<{
        x: number;
        y: number;
        color: string;
        id: any;
        value: number;
        seriesIndex: number;
      }>;
  }, [activeAxisIndex, series, axes, interaction?.series, centerX, centerY, valueToRadius, maxValue, angleFor, defaultScheme]);

  return (
    <ChartContainer
      {...rest}
      width={width}
      height={height}
      style={style}
      interactionConfig={{
        enableCrosshair,
        multiTooltip: multiTooltip !== false,
        liveTooltip: tooltip?.show === false ? false : liveTooltip !== false,
      }}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}
      
      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <G>
          {/* Crosshair line */}
          {enableCrosshair && activeAxisIndex != null && (() => {
            const ang = angleFor(activeAxisIndex);
            const x2 = centerX + Math.cos(ang) * radius;
            const y2 = centerY + Math.sin(ang) * radius;
            return (
              <SvgLine
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke="#6366f1"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            );
          })()}

          {/* Grid rings */}
          {ringRadii.map((rr, i) =>
            radialGrid?.shape === 'polygon' ? (
              <Path
                key={i}
                d={
                  axes
                    .map((a, ai) => {
                      const ang = angleFor(ai);
                      const x = centerX + Math.cos(ang) * rr;
                      const y = centerY + Math.sin(ang) * rr;
                      return `${ai === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ') + ' Z'
                }
                stroke="#e5e7eb"
                strokeWidth={1}
                fill="none"
              />
            ) : (
              <Circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={rr}
                stroke="#e5e7eb"
                strokeWidth={1}
                fill="none"
              />
            )
          )}

          {/* Axis lines */}
          {radialGrid?.showAxes !== false &&
            axes.map((a, ai) => {
              const ang = angleFor(ai);
              const x2 = centerX + Math.cos(ang) * radius;
              const y2 = centerY + Math.sin(ang) * radius;
              return (
                <SvgLine
                  key={ai}
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="#d1d5db"
                  strokeWidth={1}
                />
              );
            })}

          {/* Radar areas */}
          {polygons.map((p, pi) =>
            p.visible ? (
              <AnimatedRadarArea
                key={p.id}
                path={p.d}
                fillColor={p.color}
                strokeColor={p.color}
                strokeWidth={2}
                opacity={p.series.opacity ?? 0.3}
                animationProgress={animationProgress}
                fill={fill}
                disabled={disabled}
              />
            ) : null
          )}

          {/* Data points */}
          {series.map((s, si) => {
            const override = interaction?.series.find(sr => sr.id === (s.id || si));
            const visible = override ? override.visible !== false : s.visible !== false;
            if (!visible || !s.showPoints) return null;

            return axes.map((a, ai) => {
              const d = s.data.find(p => p.axis === a);
              if (!d) return null;

              const rr = valueToRadius(d.value, maxValue);
              const ang = angleFor(ai);
              const x = centerX + Math.cos(ang) * rr;
              const y = centerY + Math.sin(ang) * rr;
              
              const isHighlighted = highlightedAxisPoints.some(hp => hp.seriesIndex === si && hp.x === x && hp.y === y);

              return (
                <AnimatedRadarPoint
                  key={si + '-' + ai}
                  cx={x}
                  cy={y}
                  radius={s.pointSize || 3}
                  fill={s.color || getColorFromScheme(si, colorSchemes.default)}
                  stroke="#fff"
                  strokeWidth={1}
                  animationProgress={animationProgress}
                  delay={ai * 100}
                  isHighlighted={isHighlighted}
                  disabled={disabled}
                />
              );
            });
          })}

          {/* Highlighted axis points */}
          {highlightedAxisPoints.map(p => (
            <Circle
              key={'hl-' + p.id}
              cx={p.x}
              cy={p.y}
              r={8}
              fill={p.color}
              stroke="#fff"
              strokeWidth={2}
              opacity={0.9}
            />
          ))}

          {/* Ring labels */}
          {showRingLabels &&
            ringRadii.map((rr, index) => {
              const label = computedRingLabels?.[index];
              if (!label) return null;

              const offsetRadius =
                ringLabelPosition === 'inside'
                  ? Math.max(rr - ringLabelOffset, 0)
                  : rr + ringLabelOffset;
              const labelY = centerY - offsetRadius;
              // Ring labels sit on the top spoke, inside the web — grid lines and series
              // strokes run straight through them. A plate in the chart background colour
              // knocks out whatever is behind so the text stays readable.
              const text = String(label);
              const fontSize = theme.fontSize.xs;
              const plateWidth = estimateChartTextWidth(text, fontSize) + RING_LABEL_PLATE_PAD_X * 2;
              const plateHeight = fontSize + RING_LABEL_PLATE_PAD_Y * 2;

              return (
                <G key={`ring-label-${index}`}>
                  <Rect
                    x={centerX - plateWidth / 2}
                    y={labelY - fontSize * 0.8 - RING_LABEL_PLATE_PAD_Y}
                    width={plateWidth}
                    height={plateHeight}
                    rx={3}
                    fill={theme.colors.background}
                    opacity={0.85}
                  />
                  <SvgText
                    x={centerX}
                    y={labelY}
                    fill={theme.colors.textSecondary}
                    fontSize={fontSize}
                    fontFamily={theme.fontFamily}
                    textAnchor="middle"
                  >
                    {text}
                  </SvgText>
                </G>
              );
            })}

          {/* Axis labels */}
          {axes.map((a, ai) => {
            const ang = angleFor(ai);
            const cos = Math.cos(ang);
            const sin = Math.sin(ang);
            let baseRadius: number;
            if (axisLabelPlacement === 'outside') {
              baseRadius = radius + axisLabelOffset;
            } else if (axisLabelPlacement === 'edge') {
              baseRadius = radius + axisLabelOffset;
            } else {
              baseRadius = Math.max(0, radius - axisLabelOffset);
            }
            const x = centerX + cos * baseRadius;
            const y = centerY + sin * baseRadius;
            // Same strings the radius was fitted against, so the two can't disagree.
            const lines = axisLabels[ai].split('\n');
            const textAnchor: 'start' | 'middle' | 'end' = Math.abs(cos) < 0.35 ? 'middle' : cos > 0 ? 'start' : 'end';
            const lineHeight = theme.fontSize.sm * 1.2;
            // Extra lines stack downwards from the anchor, which walks a label above the web
            // back into the rings (and the ring labels). Bottom-anchor those so they grow up.
            const anchorY = sin < RADAR_VERTICAL_LABEL_THRESHOLD
              ? y - (lines.length - 1) * lineHeight
              : y;

            return (
              <SvgText
                key={String(a)}
                x={x}
                y={anchorY}
                fill={theme.colors.textPrimary}
                fontSize={theme.fontSize.sm}
                fontFamily={theme.fontFamily}
                textAnchor={textAnchor}
              >
                <TSpan>{lines[0]}</TSpan>
                {lines.slice(1).map((line, idx) => (
                  <TSpan key={`${a}-line-${idx}`} x={x} dy={lineHeight}>
                    {line}
                  </TSpan>
                ))}

              </SvgText>
            );
          })}
        </G>
      </Svg>

      {legendShown && (
        <ChartLegend
          items={legendItems}
          position={legend?.position}
          align={legend?.align}
          // Pin the legend to the band the plot box was shrunk by, and start it below the
          // title so a side legend centres against the web rather than the container.
          style={
            legendPosition === 'left' || legendPosition === 'right'
              ? { maxWidth: legendBand[legendPosition], top: titleBand }
              : { maxHeight: legendBand[legendPosition], ...(legendPosition === 'top' ? { top: titleBand } : null) }
          }
          onItemPress={(item, index, nativeEvent) => {
            const target = series[index];
            if (!target || !updateSeriesVisibility) return;
            
            const id = target.id || index;
            const override = interaction?.series.find(sr => sr.id === id);
            const current = override ? override.visible !== false : target.visible !== false;
            const isolate = nativeEvent?.shiftKey;
            
            if (isolate) {
              const visIds = series
                .filter((s, si) => {
                  const seriesId = s.id || si;
                  const seriesOverride = interaction?.series.find(sr => sr.id === seriesId);
                  return seriesOverride ? seriesOverride.visible !== false : s.visible !== false;
                })
                .map(s => s.id || series.indexOf(s));
              const isSole = visIds.length === 1 && visIds[0] === id;
              
              series.forEach((s, si) =>
                updateSeriesVisibility(s.id || si, isSole ? true : (s.id || si) === id)
              );
            } else {
              updateSeriesVisibility(id, !current);
            }
          }}
        />
      )}

      {/* Gesture surface driven by useChartPointer + the radar axis hit-tester.
          Full-chart overlay (radar geometry is centered on the whole container);
          feeds the pointer (for the spoke highlight) + the multi-series tooltip. */}
      {Boolean(interaction) && !disabled && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="radar-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}
    </ChartContainer>
  );
};

RadarChart.displayName = 'RadarChart';
