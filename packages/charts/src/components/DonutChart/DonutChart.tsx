import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText, TSpan } from 'react-native-svg';
import Animated, { Easing, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { ChartContainer, ChartLegend, ChartTitle } from '../../ChartBase';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import { useChartPointer } from '../../interaction/useChartPointer';
import { AngularSliceHitTester } from '../../core/hittest/angular';
import type { HitSeries, Mark } from '../../core/hittest/types';
import { ChartInteractionEvent } from '../../types';
import { createColorAssigner } from '../../colors';
import { formatPercentage } from '../../utils';
import { AnimatedPieSlice, type ComputedSlice } from '../PieChart/PieChart';
import type {
  DonutChartDataPoint,
  DonutChartProps,
  DonutChartRingDetails,
  DonutChartSliceDetails,
  DonutChartLabelFormatterContext,
  DonutChartLabelsConfig,
} from './types';

type SliceGeometry = ComputedSlice & DonutChartDataPoint & {
  id: string;
  baseId?: string | number;
  anglePercentage: number;
  ringId: string;
  ringIndex: number;
  ringLabel?: string;
  ringTotal: number;
  globalIndex: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DEFAULT_PADDING = { top: 80, right: 48, bottom: 88, left: 48 } as const;
const DEFAULT_RING_GAP = 8;
const DEFAULT_LABEL_MIN_ANGLE = 6;
const DEFAULT_LABEL_OFFSET = 24;
const DEFAULT_LABEL_LEADER_LENGTH = 12;
const ANGLE_EPSILON = 0.0001;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface ResolvedSlice extends DonutChartDataPoint {
  id: string;
  baseId?: string | number;
  index: number;
  globalIndex: number;
  color: string;
  visible: boolean;
  ringId: string;
  ringIndex: number;
  ringLabel?: string;
}

interface RingState {
  id: string;
  label?: string;
  index: number;
  startAngle: number;
  endAngle: number;
  padAngle: number;
  innerRadius: number;
  outerRadius: number;
  total: number;
  slices: SliceGeometry[];
  resolvedSlices: ResolvedSlice[];
  showInLegend: boolean;
}

interface LabelAnnotation {
  id: string;
  lines: string[];
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  fontSize: number;
  lineHeight: number;
  color: string;
  leader?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    width: number;
  };
}

const sliceToDetails = (slice: SliceGeometry): DonutChartSliceDetails => ({
  id: slice.baseId ?? slice.id,
  label: slice.label,
  value: slice.value,
  color: slice.color,
  data: slice.data,
  ringId: slice.ringId,
  ringIndex: slice.ringIndex,
  ringLabel: slice.ringLabel,
  percentage: slice.anglePercentage,
});

const DonutCenterContent: React.FC<{
  label?: string;
  value: string;
  subLabel?: string;
  percentage?: string | null;
  theme: ReturnType<typeof useChartTheme>;
}> = React.memo(({ label, value, subLabel, percentage, theme }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 }}>
    {label ? (
      <Text
        style={{
          fontSize: theme.fontSize.sm,
          color: theme.colors.textSecondary,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
    ) : null}
    <Text
      style={{
        fontSize: theme.fontSize.lg + 8,
        fontWeight: '700',
        color: theme.colors.textPrimary,
      }}
    >
      {value}
    </Text>
    {subLabel ? (
      <Text
        style={{
          fontSize: theme.fontSize.sm,
          color: theme.colors.textSecondary,
          marginTop: 4,
        }}
      >
        {subLabel}
      </Text>
    ) : null}
    {percentage ? (
      <Text
        style={{
          fontSize: theme.fontSize.xs,
          color: theme.colors.textSecondary,
          marginTop: 2,
        }}
      >
        {percentage}
      </Text>
    ) : null}
  </View>
));

DonutCenterContent.displayName = 'DonutChart.CenterContent';

export const DonutChart: React.FC<DonutChartProps> = (props) => {
  const {
    data,
    rings,
    ringGap: ringGapProp,
    primaryRingIndex = 0,
    legendRingIndex: legendRingIndexProp,
    inheritColorByLabel = true,
    size = 280,
    width: widthProp,
    height: heightProp,
    innerRadiusRatio = 0.55,
    thickness,
    padAngle = 1.5,
    startAngle = -90,
    endAngle = 270,
    legend,
    animation,
    centerLabel,
    centerSubLabel,
    centerValueFormatter,
    renderCenterContent,
    emptyLabel = 'No data',
    padding: paddingProp,
    disabled = false,
    animationDuration = 800,
    style,
    title,
    subtitle,
    onPress,
    onDataPointPress,
    isolateOnClick = false,
    labels: labelsConfigProp,
    tooltip,
    ...rest
  } = props;

  const dataset = data ?? [];
  const resolvedRingsProp = Array.isArray(rings) ? rings.filter(Boolean) : [];
  const hasCustomRings = resolvedRingsProp.length > 0;

  const theme = useChartTheme();
  const padding = useMemo(() => paddingProp ?? DEFAULT_PADDING, [paddingProp]);
  const width = widthProp ?? (size + padding.left + padding.right);
  const height = heightProp ?? (size + padding.top + padding.bottom);
  const plotWidth = Math.max(0, width - padding.left - padding.right);
  const plotHeight = Math.max(0, height - padding.top - padding.bottom);
  const centerX = plotWidth / 2;
  const centerY = plotHeight / 2;
  const maxRadius = Math.max(0, Math.min(plotWidth, plotHeight) / 2);
  const outerRadius = maxRadius;
  const baseInnerRadius = thickness != null && !hasCustomRings
    ? Math.max(0, outerRadius - thickness)
    : outerRadius * clamp(innerRadiusRatio, 0.05, 0.95);
  const resolvedRingGap = hasCustomRings ? Math.max(0, ringGapProp ?? DEFAULT_RING_GAP) : 0;

  const colorAssigner = useMemo(() => createColorAssigner(), []);

  let interaction: ReturnType<typeof useChartInteractionContext> | null = null;
  try {
    interaction = useChartInteractionContext();
  } catch { /* noop */ }

  const register = interaction?.register;
  const updateSeriesVisibility = interaction?.updateSeriesVisibility;
  const interactionSeries = interaction?.series;

  const ringStates = useMemo<RingState[]>(() => {
    const baseRings = hasCustomRings
      ? resolvedRingsProp
      : [
          {
            id: 'primary',
            data: dataset,
            padAngle,
            startAngle,
            endAngle,
            showInLegend: true,
          },
        ];

    const derived: RingState[] = [];
    const colorCache = inheritColorByLabel ? new Map<string, string>() : null;
    let colorIndexCursor = 0;
    let cursorOuterRadius = outerRadius;
    let globalSliceIndex = 0;

    baseRings.forEach((ringConfig, ringIndex) => {
      const ringId = String(ringConfig.id ?? ringIndex);
      const ringPadAngle = ringConfig.padAngle ?? padAngle;
      const ringStartAngle = ringConfig.startAngle ?? startAngle;
      const ringEndAngle = ringConfig.endAngle ?? endAngle;
      const ringData = (ringConfig.data ?? []) as DonutChartDataPoint[];
      const isLastRing = ringIndex === baseRings.length - 1;

      let targetInnerRadius: number | null = null;
      if (typeof ringConfig.innerRadiusRatio === 'number') {
        targetInnerRadius = outerRadius * clamp(ringConfig.innerRadiusRatio, 0.05, 0.99);
      } else if (typeof ringConfig.thickness === 'number') {
        targetInnerRadius = cursorOuterRadius - ringConfig.thickness;
      } else if (typeof ringConfig.thicknessRatio === 'number') {
        targetInnerRadius = cursorOuterRadius - outerRadius * clamp(ringConfig.thicknessRatio, 0, 1);
      }

      const ringsRemaining = baseRings.length - ringIndex;
      if (targetInnerRadius == null) {
        const remainingGaps = Math.max(ringsRemaining - 1, 0) * resolvedRingGap;
        const remainingSpace = cursorOuterRadius - baseInnerRadius;
        const autoThickness = ringsRemaining > 0 ? Math.max(0, (remainingSpace - remainingGaps) / ringsRemaining) : 0;
        targetInnerRadius = cursorOuterRadius - autoThickness;
      }

      let ringInnerRadius = Math.max(baseInnerRadius, targetInnerRadius);
      ringInnerRadius = Math.min(ringInnerRadius, cursorOuterRadius - 0.5);
      const ringOuterRadius = Math.max(ringInnerRadius, cursorOuterRadius);

      const baseResolved: ResolvedSlice[] = ringData.map((datum, datumIndex) => {
        const baseId = datum.id ?? datum.label ?? datumIndex;
        const uniqueId = `${ringId}:${baseId}`;
        const registryEntry = interactionSeries?.find((series) => String(series.id) === uniqueId);
        const visible = registryEntry ? registryEntry.visible !== false : true;
        const colorKey = inheritColorByLabel && (datum.id ?? datum.label) != null ? String(datum.id ?? datum.label) : null;

        let color = datum.color;
        if (!color) {
          if (colorKey && colorCache?.has(colorKey)) {
            color = colorCache.get(colorKey)!;
          } else if (ringConfig.colorPalette?.length) {
            color = ringConfig.colorPalette[datumIndex % ringConfig.colorPalette.length];
          } else {
            color = colorAssigner(colorIndexCursor++, datum.id);
          }
        }

        if (color && colorKey && colorCache) {
          colorCache.set(colorKey, color);
        }

        const mergedData = inheritColorByLabel
          ? (() => {
              const payload = datum.data;
              if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                return { ...payload };
              }
              return payload ?? undefined;
            })()
          : datum.data;

        return {
          ...datum,
          data: mergedData,
          id: uniqueId,
          baseId: baseId as string | number,
          index: datumIndex,
          globalIndex: -1,
          color: color!,
          visible,
          ringId,
          ringIndex,
          ringLabel: ringConfig.label,
        };
      });

      const totalValue = baseResolved.reduce((sum, slice) => {
        if (!slice.visible) return sum;
        return sum + Math.max(slice.value, 0);
      }, 0);

      const angleSpan = Math.max(ringEndAngle - ringStartAngle, 0);
      const activeSlices = baseResolved.filter((slice) => slice.visible && Math.max(slice.value, 0) > 0);
      const gapCount = activeSlices.length > 1 ? activeSlices.length : 0;
      let effectivePadAngle = gapCount > 0 ? Math.max(ringPadAngle, 0) : 0;
      let totalPad = effectivePadAngle * gapCount;
      if (gapCount > 0) {
        const padBudget = Math.max(angleSpan - ANGLE_EPSILON, 0);
        if (totalPad > padBudget) {
          effectivePadAngle = padBudget / gapCount;
          totalPad = effectivePadAngle * gapCount;
        }
      }
      const availableAngle = Math.max(angleSpan - totalPad, 0);

      let currentAngle = ringStartAngle;
      const decoratedResolved: ResolvedSlice[] = [];
      const slicesWithGeometry: SliceGeometry[] = baseResolved.map((slice) => {
        const safeValue = slice.visible ? Math.max(slice.value, 0) : 0;
        const ratio = totalValue > 0 ? safeValue / totalValue : 0;
        const sweep = availableAngle * ratio;
        const sliceStart = totalValue > 0 ? currentAngle : ringStartAngle;
        const sliceEnd = totalValue > 0 ? sliceStart + sweep : ringStartAngle;
        const centerAngle = totalValue > 0 ? sliceStart + sweep / 2 : ringStartAngle;
        if (totalValue > 0 && safeValue > 0) {
          currentAngle = sliceEnd + (gapCount > 0 ? effectivePadAngle : 0);
        }

        const globalIndex = globalSliceIndex++;
        const ringTotal = totalValue;
        const rawData: DonutChartDataPoint = {
            id: slice.baseId,
            label: slice.label,
            value: slice.value,
            color: slice.color,
            data: slice.data,
          };

        const geometry: SliceGeometry = {
          ...slice,
          key: slice.id,
          raw: rawData,
          index: globalIndex,
          globalIndex,
          value: slice.value,
          label: slice.label,
          color: slice.color,
          style: {
            strokeColor: theme.colors.background,
            strokeWidth: 1,
          },
          startAngle: sliceStart,
          endAngle: sliceEnd,
          centerAngle,
          anglePercentage: ratio,
          valueRatio: ratio,
          innerRadius: ringInnerRadius,
          outerRadius: ringOuterRadius,
          layerId: `donut-chart-ring-${ringId}`,
          layerIndex: ringIndex,
          visible: slice.visible,
          ringId,
          ringIndex,
          ringLabel: slice.ringLabel,
          ringTotal,
          baseId: slice.baseId,
          data: slice.data,
        };

        decoratedResolved.push({ ...slice, globalIndex });
        return geometry;
      });

      derived.push({
        id: ringId,
        label: ringConfig.label,
        index: ringIndex,
        startAngle: ringStartAngle,
        endAngle: ringEndAngle,
        padAngle: ringPadAngle,
        innerRadius: ringInnerRadius,
        outerRadius: ringOuterRadius,
        total: totalValue,
        slices: slicesWithGeometry,
        resolvedSlices: decoratedResolved,
        showInLegend: ringConfig.showInLegend ?? ringIndex === 0,
      });

      const gapForNext = !isLastRing ? resolvedRingGap : 0;
      cursorOuterRadius = Math.max(baseInnerRadius, ringInnerRadius - gapForNext);
    });

    return derived;
  }, [
    baseInnerRadius,
    dataset,
    hasCustomRings,
    inheritColorByLabel,
    interactionSeries,
    outerRadius,
    padAngle,
    resolvedRingGap,
    resolvedRingsProp,
    startAngle,
    endAngle,
    theme.colors.background,
    colorAssigner,
  ]);

  const flatSlices = useMemo(() => ringStates.flatMap((ring) => ring.slices), [ringStates]);
  const ringSnapshots = useMemo<DonutChartRingDetails[]>(
    () =>
      ringStates.map((ring) => ({
        id: ring.id,
        index: ring.index,
        label: ring.label,
        total: ring.total,
        slices: ring.slices.map((slice) => sliceToDetails(slice)),
      })),
    [ringStates]
  );
  const totalSlicesCount = Math.max(flatSlices.length, 1);
  const hasRenderableSlices = flatSlices.some((slice) => slice.visible && slice.anglePercentage > 0);

  const animationProgress = useSharedValue(disabled ? 1 : 0);
  const animationType = animation?.type || 'drawOn';
  const animationDelay = animation?.delay ?? 0;
  const animationStagger = animation?.stagger ?? 110;
  const resolvedAnimationDuration = animation?.duration ?? animationDuration;

  // Mount-only intro: legend toggles re-flow the rings (AnimatedPieSlice tweens the
  // angles) rather than replaying the grow-and-fade.
  const hasPlayedIntro = useRef(false);

  useEffect(() => {
    if (disabled) {
      animationProgress.value = 1;
      hasPlayedIntro.current = true;
      return;
    }
    if (hasPlayedIntro.current) {
      animationProgress.value = 1;
      return;
    }
    hasPlayedIntro.current = true;
    animationProgress.value = 0;
    animationProgress.value = withDelay(
      animationDelay,
      withTiming(1, {
        duration: Math.max(resolvedAnimationDuration, 250),
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [animationDelay, animationProgress, resolvedAnimationDuration, disabled]);

  const [focusedSliceId, setFocusedSliceId] = useState<string | null>(null);
  const focusedSlice = useMemo(
    () =>
      flatSlices.find((slice) => slice.id === focusedSliceId && slice.visible && slice.anglePercentage > 0) || null,
    [flatSlices, focusedSliceId]
  );

  useEffect(() => {
    if (focusedSliceId && !focusedSlice) {
      setFocusedSliceId(null);
    }
  }, [focusedSliceId, focusedSlice]);

  const defaultValueFormatter = useCallback((value: number) => {
    try {
      return Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);
    } catch {
      return value.toString();
    }
  }, []);

  // New interaction engine: every visible slice is an angular-sector mark (its real
  // rendered sweep + radii). The angular tester resolves which slice the pointer is
  // over. Container-origin center = plot center + padding offset (the SVG is offset
  // by padding). Gaps between slices resolve to null (they're outside every sweep).
  const hitCx = padding.left + centerX;
  const hitCy = padding.top + centerY;
  const hitSeries: HitSeries[] = useMemo(() => {
    const marks: Mark[] = flatSlices
      .filter((slice) => slice.visible && slice.anglePercentage > 0)
      .map((slice) => {
        const midRadius = (slice.innerRadius + slice.outerRadius) / 2;
        const rad = ((slice.centerAngle - 90) * Math.PI) / 180;
        // Only tooltip.formatter and tooltip.show are honored; per-chart tooltip styling
        // (backgroundColor/textColor/fontSize/…) is not, because the tooltip is rendered by
        // the shared/global ChartActiveTooltip. Pass the slice's own DonutChartDataPoint so
        // the formatter matches ChartTooltip<DonutChartDataPoint>. String -> formattedValue,
        // ReactNode -> customTooltip; falls back to defaultValueFormatter.
        const datum: DonutChartDataPoint = {
          id: slice.baseId ?? slice.id,
          label: slice.label,
          value: slice.value,
          color: slice.color,
          data: slice.data,
        };
        const tf = tooltip?.formatter?.(datum);
        return {
          id: slice.globalIndex,
          pixel: { x: hitCx + midRadius * Math.cos(rad), y: hitCy + midRadius * Math.sin(rad) },
          value: slice.value,
          datum: slice,
          label: slice.label,
          color: slice.color,
          extent: {
            slice: {
              // Slices are drawn via AnimatedPieSlice's raw math-convention polarToCartesian
              // (0° = right), but the hit-tester's angleFromPoint is canonical (0° = top).
              // Convert the sweep to canonical (canonical = mathAngle + 90) so hover/press
              // line up with the drawn wedges instead of being rotated 90°.
              startAngle: slice.startAngle + 90,
              endAngle: slice.endAngle + 90,
              innerRadius: slice.innerRadius,
              outerRadius: slice.outerRadius,
            },
          },
          formattedValue: typeof tf === 'string' ? tf : defaultValueFormatter(slice.value),
          ...(tf != null && typeof tf !== 'string' ? { customTooltip: tf } : {}),
        };
      });
    return [{ id: 'donut', name: 'Donut', color: theme.colors.accentPalette[0], visible: true, marks }];
  }, [flatSlices, hitCx, hitCy, defaultValueFormatter, theme.colors.accentPalette, tooltip]);

  const tester = useMemo(() => new AngularSliceHitTester(hitCx, hitCy, hitSeries), [hitCx, hitCy, hitSeries]);

  useEffect(() => {
    if (!register) return;
    register('donut', { frame: { kind: 'polar', cx: hitCx, cy: hitCy } as any, geometry: { kind: 'slice', cx: hitCx, cy: hitCy }, series: hitSeries });
    return () => register('donut', null);
  }, [register, hitSeries, hitCx, hitCy]);

  const labelAnnotations = useMemo<LabelAnnotation[]>(() => {
    const labelsConfig = labelsConfigProp;
    if (!labelsConfig?.show) {
      return [];
    }

    const position = labelsConfig.position ?? 'outside';
    const minAngle = labelsConfig.minAngle ?? DEFAULT_LABEL_MIN_ANGLE;
    const fontSize = labelsConfig.fontSize ?? theme.fontSize.sm;
    const lineHeight = labelsConfig.lineHeight ?? fontSize + 2;
    const textColor = labelsConfig.textColor ?? theme.colors.textPrimary;
    const offset = labelsConfig.offset ?? DEFAULT_LABEL_OFFSET;
    const leaderConfig = labelsConfig.leaderLine ?? {};
    const showLeader = leaderConfig.show ?? position === 'outside';
    const leaderLength = leaderConfig.length ?? DEFAULT_LABEL_LEADER_LENGTH;
    const leaderColor = leaderConfig.color ?? (labelsConfig.textColor ?? theme.colors.textSecondary);
    const leaderWidth = leaderConfig.width ?? 1;
    const showValue = labelsConfig.showValue ?? false;
    const showPercentage = labelsConfig.showPercentage ?? position === 'outside';
    const allowedRings = labelsConfig.rings;

    const includeRing = (ringId: string, ringIndex: number) => {
      if (!allowedRings || allowedRings.length === 0) {
        return true;
      }
      return allowedRings.some((target) =>
        typeof target === 'number' ? target === ringIndex : String(target) === ringId
      );
    };

    const annotations: LabelAnnotation[] = [];

    ringStates.forEach((ring) => {
      if (!includeRing(ring.id, ring.index)) {
        return;
      }

      const ringDetail: DonutChartRingDetails =
        ringSnapshots[ring.index] ?? {
          id: ring.id,
          index: ring.index,
          label: ring.label,
          total: ring.total,
          slices: [],
        };

      ring.slices.forEach((slice) => {
        if (!slice.visible || slice.anglePercentage <= 0) {
          return;
        }

        const sweep = Math.abs(slice.endAngle - slice.startAngle);
        if (sweep < minAngle) {
          return;
        }

        const context: DonutChartLabelFormatterContext = {
          slice: sliceToDetails(slice),
          ring: ringDetail,
          value: slice.value,
          percentage: slice.anglePercentage,
        };

        const formatted = labelsConfig.formatter?.(context);
        const lines: string[] = [];

        if (Array.isArray(formatted)) {
          formatted
            .map((line) => (line != null ? String(line) : ''))
            .filter((line) => line.trim().length > 0)
            .forEach((line) => lines.push(line));
        } else if (typeof formatted === 'string' && formatted.trim().length > 0) {
          lines.push(formatted);
        } else {
          lines.push(slice.label);
        }

        if (showValue) {
          const valueLine = labelsConfig.valueFormatter?.(context) ?? defaultValueFormatter(slice.value);
          if (valueLine && valueLine.toString().trim().length > 0) {
            lines.push(valueLine.toString());
          }
        }

        if (showPercentage) {
          const percentageLabel = formatPercentage(slice.value, ring.total);
          if (percentageLabel) {
            lines.push(percentageLabel);
          }
        }

        const trimmed = lines.filter((line) => line != null && line.trim().length > 0);
        if (!trimmed.length) {
          return;
        }

        const angleRad = (slice.centerAngle * Math.PI) / 180;

        if (position === 'inside') {
          const labelRadius = slice.innerRadius + (slice.outerRadius - slice.innerRadius) * 0.5;
          const x = centerX + Math.cos(angleRad) * labelRadius;
          const y = centerY + Math.sin(angleRad) * labelRadius;

          annotations.push({
            id: `${slice.id}-inside-label`,
            lines: trimmed,
            x,
            y,
            anchor: 'middle',
            fontSize,
            lineHeight,
            color: textColor,
          });
          return;
        }

        const anchor: 'start' | 'end' = Math.cos(angleRad) >= 0 ? 'start' : 'end';
        const leaderInnerRadius = slice.outerRadius;
        const leaderOuterRadius = slice.outerRadius + leaderLength;
        const textRadius = leaderOuterRadius + offset;
        const x1 = centerX + Math.cos(angleRad) * leaderInnerRadius;
        const y1 = centerY + Math.sin(angleRad) * leaderInnerRadius;
        const x2 = centerX + Math.cos(angleRad) * leaderOuterRadius;
        const y2 = centerY + Math.sin(angleRad) * leaderOuterRadius;
        const textX =
          centerX + Math.cos(angleRad) * textRadius + (anchor === 'start' ? 6 : -6);
        const textY = centerY + Math.sin(angleRad) * textRadius;

        annotations.push({
          id: `${slice.id}-outside-label`,
          lines: trimmed,
          x: textX,
          y: textY,
          anchor,
          fontSize,
          lineHeight,
          color: textColor,
          leader: showLeader
            ? {
                x1,
                y1,
                x2,
                y2,
                color: leaderColor,
                width: leaderWidth,
              }
            : undefined,
        });
      });
    });

    return annotations;
  }, [
    labelsConfigProp,
    ringStates,
    ringSnapshots,
    theme,
    centerX,
    centerY,
    defaultValueFormatter,
  ]);

  const resolvedPrimaryIndex = Math.min(
    Math.max(primaryRingIndex, 0),
    Math.max(ringStates.length - 1, 0)
  );
  const primaryRing = ringSnapshots[resolvedPrimaryIndex];
  const primaryRingState = ringStates[resolvedPrimaryIndex];
  const activeTotal = primaryRingState?.total ?? 0;
  const datasetForCenter = useMemo<DonutChartDataPoint[]>(() => {
    if (primaryRing) {
  return primaryRing.slices.map((slice): DonutChartDataPoint => ({
        id: slice.id,
        label: slice.label,
        value: slice.value,
        color: slice.color,
        data: slice.data,
      }));
    }
    return dataset;
  }, [primaryRing, dataset]);
  const focusedRing = focusedSlice ? ringStates[focusedSlice.ringIndex] : undefined;
  const focusedSliceDetails = useMemo(() => (focusedSlice ? sliceToDetails(focusedSlice) : null), [focusedSlice]);
  const focusedRingTotal = focusedRing?.total ?? activeTotal;

  const centerValue = focusedSlice
    ? centerValueFormatter?.(focusedSlice.value, focusedRingTotal, focusedSlice) ?? defaultValueFormatter(focusedSlice.value)
    : centerValueFormatter?.(activeTotal, activeTotal, null) ?? defaultValueFormatter(activeTotal);

  const centerPrimaryLabel = useMemo(() => {
    if (typeof centerLabel === 'function') {
      return centerLabel(activeTotal, datasetForCenter, focusedSlice);
    }
    if (focusedSlice) {
      return focusedSlice.label;
    }
    return centerLabel ?? undefined;
  }, [centerLabel, activeTotal, datasetForCenter, focusedSlice]);

  const centerSecondaryLabel = useMemo(() => {
    if (typeof centerSubLabel === 'function') {
      return centerSubLabel(activeTotal, datasetForCenter, focusedSlice);
    }
    if (focusedSlice) {
      return undefined;
    }
    return centerSubLabel ?? undefined;
  }, [centerSubLabel, activeTotal, datasetForCenter, focusedSlice]);

  const centerPercentage = focusedSlice && focusedRingTotal > 0
    ? formatPercentage(focusedSlice.value, focusedRingTotal)
    : null;

  const hasCustomCenterRenderer = typeof renderCenterContent === 'function';
  const customCenterContent = hasCustomCenterRenderer
    ? renderCenterContent({
        total: activeTotal,
        primaryRing,
        rings: ringSnapshots,
        focusedSlice: focusedSliceDetails,
      })
    : undefined;

  const handleSlicePress = useCallback(
    (slice: SliceGeometry, nativeEvent: any) => {
      if (!slice.visible) return;
      setFocusedSliceId(slice.id);

      const middleRadius = (slice.outerRadius + slice.innerRadius) / 2;
      const angleInRadians = (slice.centerAngle * Math.PI) / 180;
      const localX = centerX + Math.cos(angleInRadians) * middleRadius;
      const localY = centerY + Math.sin(angleInRadians) * middleRadius;
      const absoluteX = padding.left + localX;
      const absoluteY = padding.top + localY;

      const originalData = slice.data;
      const enrichedData = (() => {
        if (originalData && typeof originalData === 'object' && !Array.isArray(originalData)) {
          return { ...originalData, ringId: slice.ringId, ringLabel: slice.ringLabel };
        }
        if (originalData != null) {
          return { value: originalData, ringId: slice.ringId, ringLabel: slice.ringLabel };
        }
        return { ringId: slice.ringId, ringLabel: slice.ringLabel };
      })();

      const emittedDataPoint: DonutChartDataPoint = {
        id: slice.baseId ?? slice.id,
        label: slice.label,
        value: slice.value,
        color: slice.color,
        data: enrichedData,
      };

      const interactionEvent: ChartInteractionEvent<DonutChartDataPoint> = {
        nativeEvent,
        chartX: width ? absoluteX / width : 0,
        chartY: height ? absoluteY / height : 0,
        dataX: slice.globalIndex,
        dataY: slice.value,
        dataPoint: emittedDataPoint,
      };

      onDataPointPress?.(emittedDataPoint, interactionEvent);
      onPress?.(interactionEvent);

      if (isolateOnClick && updateSeriesVisibility) {
        const matchingSlices = inheritColorByLabel
          ? flatSlices.filter((candidate) => candidate.baseId === slice.baseId || candidate.label === slice.label)
          : [slice];
        const matchingIds = new Set(matchingSlices.map((candidate) => candidate.id));
        const visibleSlices = flatSlices.filter((candidate) => candidate.visible);
        const alreadyIsolated =
          visibleSlices.length === matchingIds.size &&
          visibleSlices.every((candidate) => matchingIds.has(candidate.id));

        flatSlices.forEach((candidate) => {
          const shouldShow = alreadyIsolated ? true : matchingIds.has(candidate.id);
          updateSeriesVisibility(candidate.id, shouldShow);
        });
      }
    },
    [
      centerX,
      centerY,
      flatSlices,
      inheritColorByLabel,
      isolateOnClick,
      onDataPointPress,
      onPress,
      padding.left,
      padding.top,
      updateSeriesVisibility,
      width,
      height,
    ]
  );

  // Gesture surface: hover drives the tooltip + the center-label focus; press routes
  // to handleSlicePress (isolate-on-click + onDataPointPress). Full-chart overlay so
  // pointer coords are container-origin, matching the slice sectors.
  const { handlers: pointerHandlers, ref: surfaceRef, onLayout: surfaceOnLayout } = useChartPointer({
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    plotWidth: width,
    plotHeight: height,
    enabled: Boolean(interaction) && !disabled,
    hover: true,
    press: true,
    tester,
    onPointer: (_e, target) => setFocusedSliceId(target ? String((target.datum as SliceGeometry).id) : null),
    onLeave: () => setFocusedSliceId(null),
    onPress: (e, target) => { if (target) handleSlicePress(target.datum as SliceGeometry, (e.raw as any)?.nativeEvent ?? e.raw); },
  });

  const resolvedLegendIndex = (() => {
    if (!ringStates.length) return 0;
    const requested = Math.min(Math.max(legendRingIndexProp ?? resolvedPrimaryIndex, 0), ringStates.length - 1);
    const requestedRing = ringStates[requested];
    if (requestedRing && requestedRing.showInLegend !== false) {
      return requested;
    }
    const fallbackIndex = ringStates.findIndex((ring) => ring.showInLegend !== false);
    return fallbackIndex >= 0 ? fallbackIndex : requested;
  })();

  const legendRing = ringStates[resolvedLegendIndex];

  const legendItems = useMemo(
    () =>
      legendRing
        ? legendRing.slices.map((slice) => ({
            label: slice.label,
            color: slice.color,
            visible: slice.visible,
          }))
        : [],
    [legendRing]
  );

  return (
    <ChartContainer
      width={width}
      height={height}
      padding={padding}
      animationDuration={resolvedAnimationDuration}
      disabled={disabled}
      style={style}
      title={title}
      subtitle={subtitle}
      interactionConfig={{ liveTooltip: tooltip?.show === false ? false : true }}
      {...rest}
    >
      {(title || subtitle) && <ChartTitle title={title} subtitle={subtitle} />}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: padding.left,
          top: padding.top,
          width: plotWidth,
          height: plotHeight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasRenderableSlices ? (
          hasCustomCenterRenderer
            ? customCenterContent === undefined
              ? (
                <DonutCenterContent
                  label={centerPrimaryLabel}
                  value={centerValue}
                  subLabel={centerSecondaryLabel}
                  percentage={centerPercentage}
                  theme={theme}
                />
              )
              : customCenterContent
            : (
              <DonutCenterContent
                label={centerPrimaryLabel}
                value={centerValue}
                subLabel={centerSecondaryLabel}
                percentage={centerPercentage}
                theme={theme}
              />
            )
        ) : (
          <Text
            style={{
              fontSize: theme.fontSize.md,
              color: theme.colors.textSecondary,
            }}
          >
            {emptyLabel}
          </Text>
        )}
      </View>

      <Svg
        width={plotWidth}
        height={plotHeight}
        style={{ position: 'absolute', left: padding.left, top: padding.top, overflow: 'visible' }}
      >
        {ringStates.map((ring) => {
          const strokeWidth = Math.max(ring.outerRadius - ring.innerRadius, 0);
          if (strokeWidth <= 0.2) {
            return null;
          }
          return (
            <AnimatedCircle
              key={`ring-track-${ring.id}`}
              cx={centerX}
              cy={centerY}
              r={ring.innerRadius + strokeWidth / 2}
              stroke={theme.colors.grid}
              strokeWidth={strokeWidth}
              opacity={0.25}
              fill="none"
            />
          );
        })}

        <G>
          {ringStates.map((ring) =>
            ring.slices.map((slice) => {
              if (!slice.visible || slice.anglePercentage <= 0) {
                return null;
              }

              return (
                <AnimatedPieSlice
                  key={slice.id}
                  slice={slice}
                  centerX={centerX}
                  centerY={centerY}
                  innerRadius={slice.innerRadius}
                  outerRadius={slice.outerRadius}
                  animationProgress={animationProgress}
                  animationType={animationType}
                  animationDuration={resolvedAnimationDuration}
                  animationDelay={animationDelay}
                  animationStagger={animationStagger}
                  index={slice.index}
                  totalSlices={totalSlicesCount}
                  fill={slice.color}
                  stroke={theme.colors.background}
                  strokeOpacity={1}
                  baseFillOpacity={1}
                  highlightOpacity={0.85}
                  radiusOffset={4}
                  strokeWidth={1}
                  disabled={disabled}
                  onPress={(event: any) => {
                    const nativeEvent = event?.nativeEvent ?? event;
                    handleSlicePress(slice, nativeEvent);
                  }}
                />
              );
            })
          )}
        </G>

        {labelAnnotations.length > 0 && (
          <G pointerEvents="none">
            {labelAnnotations.map((annotation) => {
              const baseY =
                annotation.y - ((annotation.lines.length - 1) * annotation.lineHeight) / 2;

              return (
                <G key={annotation.id} pointerEvents="none">
                  {annotation.leader ? (
                    <Line
                      x1={annotation.leader.x1}
                      y1={annotation.leader.y1}
                      x2={annotation.leader.x2}
                      y2={annotation.leader.y2}
                      stroke={annotation.leader.color}
                      strokeWidth={annotation.leader.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                  <SvgText
                    x={annotation.x}
                    y={baseY}
                    fill={annotation.color}
                    fontSize={annotation.fontSize}
                    textAnchor={annotation.anchor}
                    alignmentBaseline="middle"
                    fontWeight="600"
                  >
                    {annotation.lines.map((line, index) => (
                      <TSpan
                        key={`${annotation.id}-line-${index}`}
                        x={annotation.x}
                        dy={index === 0 ? 0 : annotation.lineHeight}
                      >
                        {line}
                      </TSpan>
                    ))}
                  </SvgText>
                </G>
              );
            })}
          </G>
        )}
      </Svg>

      {legend?.show !== false && legendRing && legendItems.length > 0 && (
        <ChartLegend
          items={legendItems}
          position={legend?.position}
          align={legend?.align}
          textColor={legend?.textColor}
          fontSize={legend?.fontSize}
          onItemPress={
            updateSeriesVisibility
              ? (item, index, nativeEvent) => {
                  const slice = legendRing.slices[index];
                  if (!slice) return;
                  const matchingSlices = inheritColorByLabel
                    ? flatSlices.filter(
                        (candidate) => candidate.baseId === slice.baseId || candidate.label === slice.label
                      )
                    : [slice];
                  const matchingIds = new Set(matchingSlices.map((candidate) => candidate.id));
                  const isolate = nativeEvent?.shiftKey;

                  if (isolate) {
                    const visibleSlices = flatSlices.filter((candidate) => candidate.visible);
                    const alreadyIsolated =
                      visibleSlices.length === matchingIds.size &&
                      visibleSlices.every((candidate) => matchingIds.has(candidate.id));
                    flatSlices.forEach((candidate) => {
                      const shouldShow = alreadyIsolated ? true : matchingIds.has(candidate.id);
                      updateSeriesVisibility(candidate.id, shouldShow);
                    });
                  } else {
                    const targetVisibility = !slice.visible;
                    matchingSlices.forEach((candidate) => {
                      updateSeriesVisibility(candidate.id, targetVisibility);
                    });
                  }
                }
              : undefined
          }
        />
      )}

      {/* Gesture surface driven by useChartPointer + the angular hit-tester. Full-chart
          overlay (donut geometry is centered on the whole container). */}
      {Boolean(interaction) && !disabled && (
        <View
          ref={surfaceRef}
          onLayout={surfaceOnLayout}
          testID="donut-gesture-surface"
          style={{ position: 'absolute', left: 0, top: 0, width, height }}
          {...pointerHandlers}
        />
      )}
    </ChartContainer>
  );
};

DonutChart.displayName = 'DonutChart';