import React, { useMemo, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

import { RadialBarChartProps, RadialBarDatum } from './types';
import { ChartInteractionEvent } from '../../types';
import { ChartContainer, ChartTitle, ChartLegend , measureChartLegendBand, measureChartTitleBand } from '../../ChartBase';
import { useChartInteractionContext, useActiveTarget } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { AngularSliceHitTester } from '../../core/hittest/angular';
import type { HitSeries, Mark } from '../../core/hittest/types';
import { getColorFromScheme, colorSchemes, formatNumber } from '../../utils';
import { useChartTheme } from '../../theme/ChartThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  'worklet';
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

// Simple polar arc path helper
function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  'worklet';
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0  ${end.x} ${end.y}`;
}

// Animated radial bar component (adapted from AnimatedPieSlice pattern)
const AnimatedRadialBar: React.FC<{
  datum: RadialBarDatum;
  index: number;
  centerX: number;
  centerY: number;
  radius: number;
  thickness: number;
  startAngle: number;
  endAngle: number;
  globalMax: number;
  animationProgress: SharedValue<number>;
  color: string;
  trackColor: string;
  disabled: boolean;
  dimmed?: boolean;
}> = React.memo(({
  datum,
  index,
  centerX,
  centerY,
  radius,
  thickness,
  startAngle,
  endAngle,
  globalMax,
  animationProgress,
  color,
  trackColor,
  disabled,
  dimmed = false,
}) => {
  const scale = useSharedValue(disabled ? 1 : 0);

  useEffect(() => {
    if (disabled) {
      scale.value = 1;
      return;
    }
    const delay = index * 150; // Stagger animation
    scale.value = withDelay(delay, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }));
  }, [disabled, index, scale]);

  const maxValue = datum.max || globalMax;
  const percentage = maxValue > 0 ? datum.value / maxValue : 0;
  const targetSpan = (endAngle - startAngle) * percentage;
  
  const trackPath = arcPath(centerX, centerY, radius, startAngle, endAngle);
  const fullValuePath = arcPath(centerX, centerY, radius, startAngle, startAngle + targetSpan);

  const animatedProps = useAnimatedProps(() => {
    const progress = animationProgress.value * scale.value;
    const currentSpan = targetSpan * progress;
    const currentEndAngle = startAngle + Math.max(0, currentSpan);
    
    if (currentSpan <= 0) {
      return { d: '' } as any;
    }
    
    return {
      d: arcPath(centerX, centerY, radius, startAngle, currentEndAngle),
    } as any;
  }, [startAngle, targetSpan, centerX, centerY, radius]);

  return (
    <G opacity={dimmed ? 0.3 : 1}>
      {/* Pointer/hover handled by the shared gesture surface + angular hit-tester. */}
      {/* Track */}
      <Path
        d={trackPath}
        stroke={trackColor}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />

      {/* Animated value bar */}
      <AnimatedPath
        animatedProps={animatedProps}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
});

AnimatedRadialBar.displayName = 'AnimatedRadialBar';

export const RadialBarChart: React.FC<RadialBarChartProps> = (props) => {
  const {
    data,
    width = 240,
    height = 240,
    title,
    subtitle,
    barThickness = 14,
    gap = 8,
    radius,
    startAngle = -90,
    endAngle = 270,
    showValueLabels = true,
    valueFormatter,
    legend,
    style,
    multiTooltip = true,
    liveTooltip = true,
    enableCrosshair = false,
    tooltip,
    disabled = false,
    animationDuration = 800,
    centerLabel,
    centerSubLabel,
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
  const updateSeriesVisibility = interaction?.updateSeriesVisibility;

  // Resolved hovered target drives the "highlighted arc" crosshair (dim the other rings).
  const { activeTarget } = useActiveTarget();
  const activeRingIndex = enableCrosshair && activeTarget != null
    ? (typeof activeTarget.markId === 'number' ? activeTarget.markId : null)
    : null;

  // Reserve space for the (absolutely positioned) title and legend bands so the outer
  // ring doesn't overlap them. Measured rather than guessed — a wrapping legend or a
  // long side label needs more room than a fixed constant can know about.
  const titleInset = measureChartTitleBand(title, subtitle);
  const legendInset = measureChartLegendBand({
    items: legend?.show ? data.map((d, i) => ({ label: d.label || String(d.id ?? i) })) : undefined,
    containerWidth: width,
    position: legend?.position,
    fontSize: legend?.fontSize,
  });

  // Normalized bounding box of the arc sweep (unit circle, component angle
  // convention). Lets partial sweeps (e.g. a semicircle gauge) fill the plot
  // area and stay centered instead of reserving an empty half. A full circle
  // yields the usual centered layout.
  const arcExtent = useMemo(() => {
    let uxMin = Infinity, uxMax = -Infinity, uyMin = Infinity, uyMax = -Infinity;
    const lo = Math.min(startAngle, endAngle);
    const hi = Math.max(startAngle, endAngle);
    for (let a = lo; a <= hi + 0.0001; a += 1) {
      const rad = (a - 90) * Math.PI / 180;
      const x = Math.cos(rad), y = Math.sin(rad);
      if (x < uxMin) uxMin = x; if (x > uxMax) uxMax = x;
      if (y < uyMin) uyMin = y; if (y > uyMax) uyMax = y;
    }
    if (!isFinite(uxMin)) { uxMin = -1; uxMax = 1; uyMin = -1; uyMax = 1; }
    return { uxMin, uxMax, uyMin, uyMax };
  }, [startAngle, endAngle]);

  const PAD = 20;
  const spanX = Math.max(1e-3, arcExtent.uxMax - arcExtent.uxMin);
  const spanY = Math.max(1e-3, arcExtent.uyMax - arcExtent.uyMin);
  const plotTop = titleInset + legendInset.top;
  const plotLeft = legendInset.left;
  const plotW = Math.max(1, width - legendInset.left - legendInset.right);
  const plotH = Math.max(1, height - plotTop - legendInset.bottom);
  const availW = Math.max(1, plotW - PAD * 2);
  const availH = Math.max(1, plotH - PAD * 2);
  // Outer extent radius (to the outer edge of the outermost stroke).
  const outerExtent = radius != null
    ? radius + barThickness / 2
    : Math.min(availW / spanX, availH / spanY);
  const maxRadius = Math.max(0, outerExtent - barThickness / 2);
  // Center so the arc's bounding box is centered in the available plot area.
  const centerX = plotLeft + plotW / 2 - ((arcExtent.uxMin + arcExtent.uxMax) / 2) * outerExtent;
  const centerY = plotTop + plotH / 2
    - ((arcExtent.uyMin + arcExtent.uyMax) / 2) * outerExtent;
  // Visual middle of the arc's bounding box (used for the center readout so it
  // sits in the bowl of a partial sweep rather than on the geometric center).
  const layoutCenterY = plotTop + plotH / 2;

  const values = data.map(d => d.value);
  const maxDatumValue = Math.max(...values, 1);
  const globalMax = Math.max(maxDatumValue, ...data.map(d => d.max || 0));

  // Animation
  const animationProgress = useSharedValue(disabled ? 1 : 0);
  const dataSignature = useMemo(() => {
    return data.map(d => `${d.id || 'auto'}-${d.value}-${d.max || ''}`).join('|');
  }, [data]);

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

  // Labels fade in as the arcs draw.
  const labelOpacityProps = useAnimatedProps(() => ({
    opacity: animationProgress.value,
  }));

  // Compute ring positions and visibility
  const rings = useMemo(() => {
    return data.map((d, i) => {
      const override = interaction?.series.find(s => s.id === (d.id ?? i));
      const visible = override ? override.visible !== false : true;
      
      const ringRadius = maxRadius - i * (barThickness + gap) - barThickness / 2;
      const color = d.color || getColorFromScheme(i, colorSchemes.default);
      const trackColor = d.trackColor || theme.colors.background || '#f1f5f9';
      
      return {
        datum: d,
        index: i,
        radius: ringRadius,
        color,
        trackColor,
        visible,
        isValid: ringRadius - barThickness / 2 > 0,
      };
    });
  }, [data, maxRadius, barThickness, gap, theme.colors.background, interaction?.series]);

  // New interaction engine: each ring is a single angular-sector mark (annular band
  // at the ring's radius across the full track). The angular hit-tester resolves
  // which ring the pointer is over; the tooltip reads the resolved target.
  const hitSeries: HitSeries[] = useMemo(() => rings.map((ring) => {
    const d = ring.datum;
    const maxValue = d.max || globalMax;
    const percentage = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
    const midAngle = startAngle + (endAngle - startAngle) * 0.5;
    const anchor = polarToCartesian(centerX, centerY, ring.radius, midAngle);
    // Tooltip content: an explicit tooltip.formatter wins; a string result is the row
    // value, a ReactNode result becomes the custom tooltip body. Falls back to
    // valueFormatter, then the percentage.
    const customTooltip = tooltip?.formatter?.({ ...d, percentage } as RadialBarDatum);
    const mark: Mark = {
      id: ring.index,
      pixel: { x: anchor.x, y: anchor.y },
      value: d.value,
      datum: { ...d, percentage },
      extent: {
        slice: {
          startAngle,
          endAngle,
          innerRadius: Math.max(0, ring.radius - barThickness / 2),
          outerRadius: ring.radius + barThickness / 2,
        },
        ringIndex: ring.index,
      },
      formattedValue: typeof customTooltip === 'string'
        ? customTooltip
        : (valueFormatter ? valueFormatter(d.value, d, ring.index) : `${percentage.toFixed(0)}%`),
      ...(customTooltip != null && typeof customTooltip !== 'string' ? { customTooltip } : {}),
    };
    return {
      id: d.id ?? ring.index,
      name: d.label || String(d.id ?? ring.index),
      color: ring.color,
      visible: ring.visible !== false,
      marks: [mark],
    };
  }), [rings, globalMax, startAngle, endAngle, centerX, centerY, barThickness, valueFormatter, tooltip]);

  const tester = useMemo(() => new AngularSliceHitTester(centerX, centerY, hitSeries), [centerX, centerY, hitSeries]);

  useEffect(() => {
    if (!register) return;
    register('radial-bar', { frame: { kind: 'polar', cx: centerX, cy: centerY } as any, geometry: { kind: 'slice', cx: centerX, cy: centerY }, series: hitSeries });
    return () => register('radial-bar', null);
  }, [register, hitSeries, centerX, centerY]);

  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    plotWidth: width,
    plotHeight: height,
    enabled: Boolean(interaction) && !disabled,
    hover: true,
    press: Boolean(onDataPointPress || onPress),
    tester,
    onPress: (e, target) => {
      if (!target) return;
      const datum = target.datum as RadialBarDatum;
      const event: ChartInteractionEvent<RadialBarDatum> = {
        nativeEvent: e.raw,
        // radial: the plot spans the whole width/height (padding 0).
        chartX: width > 0 ? e.plotX / width : 0,
        chartY: height > 0 ? e.plotY / height : 0,
        dataX: target.dataX,
        dataY: target.dataY,
        dataPoint: datum,
        distance: target.distance,
      };
      onDataPointPress?.(datum, event);
      onPress?.(event);
    },
  });

  return (
    <ChartContainer
      {...rest}
      width={width}
      height={height}
      style={style}
      interactionConfig={{ multiTooltip, liveTooltip: tooltip?.show === false ? false : liveTooltip }}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}
      
      <Svg width={width} height={height}>
        <G>
          {rings.map(ring => {
            if (!ring.visible || !ring.isValid) return null;
            
            return (
              <AnimatedRadialBar
                key={ring.datum.id || ring.index}
                datum={ring.datum}
                index={ring.index}
                centerX={centerX}
                centerY={centerY}
                radius={ring.radius}
                thickness={barThickness}
                startAngle={startAngle}
                endAngle={endAngle}
                globalMax={globalMax}
                animationProgress={animationProgress}
                color={ring.color}
                trackColor={ring.trackColor}
                disabled={disabled}
                dimmed={activeRingIndex != null && activeRingIndex !== ring.index}
              />
            );
          })}

          {/* Value labels at the tip of each filled arc */}
          {showValueLabels && (
            <AnimatedG animatedProps={labelOpacityProps}>
              {rings.map(ring => {
                if (!ring.visible || !ring.isValid) return null;
                const d = ring.datum;
                const maxValue = d.max || globalMax;
                const percentage = maxValue > 0 ? d.value / maxValue : 0;
                const tipAngle = startAngle + (endAngle - startAngle) * percentage;
                // Sit just beyond the bar tip so inner-ring labels clear the
                // center readout rather than overlapping it.
                const labelRadius = ring.radius + barThickness / 2 + 4;
                const tip = polarToCartesian(centerX, centerY, labelRadius, tipAngle);
                const text = valueFormatter
                  ? valueFormatter(d.value, d, ring.index)
                  : `${(percentage * 100).toFixed(0)}%`;
                return (
                  <G key={`label-${ring.datum.id ?? ring.index}`}>
                    {/* White halo for legibility over arcs */}
                    <SvgText
                      x={tip.x}
                      y={tip.y}
                      dy={theme.fontSize.sm * 0.35}
                      fontSize={theme.fontSize.sm}
                      fontWeight="700"
                      fill={theme.colors.background || '#ffffff'}
                      stroke={theme.colors.background || '#ffffff'}
                      strokeWidth={4}
                      fontFamily={theme.fontFamily}
                      textAnchor="middle"
                    >
                      {text}
                    </SvgText>
                    <SvgText
                      x={tip.x}
                      y={tip.y}
                      dy={theme.fontSize.sm * 0.35}
                      fontSize={theme.fontSize.sm}
                      fontWeight="700"
                      fill={ring.color}
                      fontFamily={theme.fontFamily}
                      textAnchor="middle"
                    >
                      {text}
                    </SvgText>
                  </G>
                );
              })}
            </AnimatedG>
          )}

          {/* Center readout */}
          {(centerLabel || centerSubLabel) && (
            <AnimatedG animatedProps={labelOpacityProps}>
              {centerLabel && (
                <SvgText
                  x={centerX}
                  y={layoutCenterY}
                  dy={centerSubLabel ? -theme.fontSize.sm * 0.2 : theme.fontSize.lg * 0.35}
                  fontSize={theme.fontSize.lg * 1.6}
                  fontWeight="700"
                  fill={theme.colors.textPrimary}
                  fontFamily={theme.fontFamily}
                  textAnchor="middle"
                >
                  {centerLabel}
                </SvgText>
              )}
              {centerSubLabel && (
                <SvgText
                  x={centerX}
                  y={layoutCenterY}
                  dy={theme.fontSize.md * 1.15}
                  fontSize={theme.fontSize.sm}
                  fill={theme.colors.textSecondary}
                  fontFamily={theme.fontFamily}
                  textAnchor="middle"
                >
                  {centerSubLabel}
                </SvgText>
              )}
            </AnimatedG>
          )}
        </G>
      </Svg>

      {legend?.show && (
        <ChartLegend
          items={data.map((d, i) => {
            const override = interaction?.series.find(s => s.id === (d.id ?? i));
            const visible = override ? override.visible !== false : true;
            return {
              label: d.label || String(d.id || i),
              color: d.color || getColorFromScheme(i, colorSchemes.default),
              visible,
            };
          })}
          position={legend.position}
          align={legend.align}
          onItemPress={(item, index, nativeEvent) => {
            const datum = data[index];
            if (!datum || !updateSeriesVisibility) return;
            
            const id = datum.id ?? index;
            const override = interaction?.series.find(sr => sr.id === id);
            const current = override ? override.visible !== false : true;
            const isolate = nativeEvent?.shiftKey;
            
            if (isolate) {
              const visibleIds = data
                .filter((d, i) => {
                  const seriesId = d.id ?? i;
                  const seriesOverride = interaction?.series.find(sr => sr.id === seriesId);
                  return seriesOverride ? seriesOverride.visible !== false : true;
                })
                .map(d => d.id || data.indexOf(d));
              const isSole = visibleIds.length === 1 && visibleIds[0] === id;
              
              data.forEach((d, i) =>
                updateSeriesVisibility(d.id || i, isSole ? true : (d.id || i) === id)
              );
            } else {
              updateSeriesVisibility(id, !current);
            }
          }}
        />
      )}

      {/* Unified cross-platform gesture surface driven by useChartPointer + the
          angular hit-tester. Full-chart overlay (radial geometry is centered on
          the whole container). */}
      {Boolean(interaction) && !disabled && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="radial-bar-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}
    </ChartContainer>
  );
};

RadialBarChart.displayName = 'RadialBarChart';
