import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { BubbleChartProps, ChartDataPoint, ChartInteractionEvent, ChartGrid as ChartGridConfig, ChartLegendItem } from '../../types';
import { ChartContainer, ChartTitle, ChartLegend , withChartBandPadding } from '../../ChartBase';
import { useChartTheme } from '../../theme/ChartThemeContext';
import { ChartGrid } from '../../core/ChartGrid';
import { Axis } from '../../core/Axis';
import { useChartInteractionContext } from '../../interaction/ChartInteractionContext';
import { scaleLinear, generateTicks, formatNumber, getColorFromScheme, colorSchemes } from '../../utils';
import { linearScale as createLinearScale } from '../../utils/scales';
import type { Scale } from '../../utils/scales';
import { AnimatedBubble } from './AnimatedBubble';
import type { ActiveTarget } from '../../core/hittest/types';

// Backwards compatibility alias
export type SimpleBubbleChartProps = BubbleChartProps;

const clamp01 = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const isLikelyColor = (value: unknown) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^#|^rgba?\(|^hsla?\(|^var\(/i.test(trimmed);
};

interface AxisState {
  isNumeric: boolean;
  domain: [number, number];
  categories: string[];
}

interface AxisTick {
  label: string;
  value: number | string;
  gridRatio: number; // normalized for grid placement
}

interface BubbleInternal<T = any> {
  index: number;
  id: string | number;
  record: T;
  rawX: any;
  rawY: any;
  value: number;
  radius: number;
  plotX: number;
  plotY: number;
  dataX: number;
  dataY: number;
  color: string;
  label: string;
  formattedValue: string;
  tooltipPayload: {
    record: T;
    value: number;
    label: string;
    rawX: any;
    rawY: any;
    index: number;
    color: string;
  };
  customTooltip?: React.ReactNode | string;
  legendLabel: string;
  legendKey?: string;
}

const resolveLegendItemKey = (item: Partial<ChartLegendItem> | undefined, index: number): string => {
  if (!item) return String(index);
  const candidate = (item as any).key ?? (item as any).id ?? item.label;
  if (candidate == null) return String(index);
  return String(candidate);
};

const setsEqual = (a: Set<string>, b: Set<string>) => {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
};

const deriveAxisState = (values: any[]): AxisState => {
  const filtered = values.filter((v) => v != null);
  if (!filtered.length) {
    return { isNumeric: true, domain: [0, 1], categories: [] };
  }

  const numericValues = filtered.filter((v) => typeof v === 'number' && Number.isFinite(v)) as number[];
  const isNumeric = numericValues.length === filtered.length;

  if (isNumeric) {
    let min = Math.min(...numericValues);
    let max = Math.max(...numericValues);
    if (min === max) {
      const delta = Math.abs(min) * 0.1 || 1;
      min -= delta;
      max += delta;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      min = 0;
      max = 1;
    }
    return { isNumeric: true, domain: [min, max], categories: [] };
  }

  const categories = Array.from(new Set(filtered.map((v) => String(v))));
  return {
    isNumeric: false,
    domain: [0, Math.max(categories.length - 1, 1)],
    categories,
  };
};

export const BubbleChart: React.FC<BubbleChartProps> = (props) => {
  const {
    data = [],
    dataKey,
    width = 400,
    height,
    h,
    range = [36, 576],
    color,
    colorScale,
    textColor,
    gridColor,
    grid = true,
    xAxis = {},
    yAxis = {},
    label,
    valueFormatter,
    withTooltip = true,
    tooltip,
    minBubbleSize,
    maxBubbleSize,
    bubbleOpacity: bubbleOpacityProp,
    bubbleStrokeColor = 'rgba(0,0,0,0.12)',
    bubbleStrokeWidth = 1,
    title,
    subtitle,
    onPress,
    onDataPointPress,
    disabled = false,
    animationDuration,
    style,
    legend,
    ...rest
  } = props;

  const theme = useChartTheme();

  const [hiddenLegendKeys, setHiddenLegendKeys] = useState<Set<string>>(() => {
    if (!legend?.items) return new Set();
    const initial = new Set<string>();
    legend.items.forEach((item, index) => {
      if (item.visible === false) {
        initial.add(resolveLegendItemKey(item, index));
      }
    });
    return initial;
  });

  const legendItemsSignature = useMemo(() => {
    if (!legend?.items) return null;
    return legend.items
      .map((item, index) => `${resolveLegendItemKey(item, index)}:${item.visible === false ? '0' : '1'}`)
      .join('|');
  }, [legend?.items]);

  useEffect(() => {
    if (!legend?.items) {
      setHiddenLegendKeys((prev) => (prev.size === 0 ? prev : new Set()));
      return;
    }
    const nextHidden = new Set<string>();
    legend.items.forEach((item, index) => {
      if (item.visible === false) {
        nextHidden.add(resolveLegendItemKey(item, index));
      }
    });
    setHiddenLegendKeys((prev) => (setsEqual(prev, nextHidden) ? prev : nextHidden));
  }, [legendItemsSignature, legend?.items]);

  const resolvedHeight = h ?? height ?? 300;
  const resolvedBubbleOpacity = bubbleOpacityProp ?? 0.85;

  const padding = React.useMemo(() => {
    // The y-axis caption sits in the same top band as the title, so it stacks below it
    // rather than competing for the space — hence topAllowance rather than a bigger base.
    const base = {
      top: label ? 68 : 48,
      right: 32,
      bottom: xAxis?.title ? 72 : 56,
      left: yAxis?.show === false ? 48 : 80,
    };
    return withChartBandPadding(base, {
      title,
      subtitle,
      containerWidth: width,
      topAllowance: label ? 44 : 24,
    });
  }, [title, subtitle, label, xAxis?.title, yAxis?.show, width]);

  const plotWidth = Math.max(1, width - padding.left - padding.right);
  const plotHeight = Math.max(1, resolvedHeight - padding.top - padding.bottom);

  const xState = useMemo(() => {
    const values = data.map((item) => (item as any)[dataKey.x]);
    return deriveAxisState(values);
  }, [data, dataKey.x]);

  const yState = useMemo(() => {
    const values = data.map((item) => (item as any)[dataKey.y]);
    return deriveAxisState(values);
  }, [data, dataKey.y]);

  const getXRatio = useCallback(
    (value: any) => {
      if (xState.isNumeric) {
        const num = typeof value === 'number' && Number.isFinite(value) ? value : Number(value);
        const [min, max] = xState.domain;
        if (!Number.isFinite(num) || max === min) return 0.5;
        const ratio = (num - min) / (max - min);
        return clamp01(ratio);
      }
      const count = xState.categories.length;
      if (!count) return 0.5;
      const idx = xState.categories.indexOf(String(value));
      if (count === 1) return 0.5;
      return clamp01((idx < 0 ? 0 : idx) / (count - 1));
    },
    [xState]
  );

  const getYRatio = useCallback(
    (value: any) => {
      if (yState.isNumeric) {
        const num = typeof value === 'number' && Number.isFinite(value) ? value : Number(value);
        const [min, max] = yState.domain;
        if (!Number.isFinite(num) || max === min) return 0.5;
        const ratio = (num - min) / (max - min);
        return clamp01(ratio);
      }
      const count = yState.categories.length;
      if (!count) return 0.5;
      const idx = yState.categories.indexOf(String(value));
      if (count === 1) return 0.5;
      return clamp01((idx < 0 ? 0 : idx) / (count - 1));
    },
    [yState]
  );

  const sizeDomain = useMemo(() => {
    const zKey = dataKey.z;
    if (!zKey) {
      return { min: 0, max: 1 };
    }
    const values = data
      .map((item) => Number((item as any)[zKey]))
      .filter((val) => Number.isFinite(val)) as number[];
    if (!values.length) {
      return { min: 0, max: 1 };
    }
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      const delta = Math.abs(min) * 0.1 || 1;
      min = Math.max(0, min - delta);
      max = max + delta;
    }
    if (max <= 0) {
      max = 1;
      min = 0;
    }
    return { min: Math.max(0, min), max: Math.max(max, 1) };
  }, [data, dataKey.z]);

  const [minAreaInput, maxAreaInput] = range;
  const minArea = Math.max(0, Math.min(minAreaInput, maxAreaInput));
  const maxArea = Math.max(minArea + 1, Math.max(minAreaInput, maxAreaInput));
  const derivedMinRadius = Math.sqrt(minArea / Math.PI);
  const derivedMaxRadius = Math.sqrt(maxArea / Math.PI);
  const minRadius = Math.max(0, minBubbleSize ?? derivedMinRadius);
  const maxRadius = Math.max(minRadius, maxBubbleSize ?? derivedMaxRadius);

  const computeRadius = useCallback(
    (rawValue: number | undefined, index: number) => {
      const value = rawValue != null && Number.isFinite(rawValue) ? Math.max(0, rawValue) : undefined;
      if (sizeDomain.max === sizeDomain.min) {
        return minRadius;
      }
      const fallback = (sizeDomain.min + sizeDomain.max) / 2;
      const normalized = (Math.max(0, value ?? fallback) - sizeDomain.min) / (sizeDomain.max - sizeDomain.min);
      const area = minArea + clamp01(normalized) * (maxArea - minArea);
      const radius = Math.sqrt(Math.max(area, 0) / Math.PI);
      return Math.max(minRadius, Math.min(maxRadius, radius));
    },
    [sizeDomain, minArea, maxArea, minRadius, maxRadius]
  );

  const resolvedTextColor = textColor || theme.colors.textSecondary;
  const xTitleColor = xAxis?.titleColor || resolvedTextColor;
  const yTitleColor = yAxis?.titleColor || resolvedTextColor;

  const tooltipEnabled = withTooltip && (tooltip?.show ?? true);

  const chartGridConfig = useMemo<ChartGridConfig | null>(() => {
    if (grid === false) return null;
    if (grid === true || grid == null) {
      return {
        show: true,
        color: gridColor || theme.colors.grid,
        thickness: 1,
        style: 'solid',
      };
    }
    return {
      show: grid.show !== false,
      color: gridColor || grid.color || theme.colors.grid,
      thickness: grid.thickness ?? 1,
      style: grid.style,
      showMajor: grid.showMajor,
      showMinor: grid.showMinor,
      majorLines: grid.majorLines,
      minorLines: grid.minorLines,
    };
  }, [grid, gridColor, theme.colors.grid]);

  const xTicks: AxisTick[] = useMemo(() => {
    if (xState.isNumeric) {
      const [min, max] = xState.domain;
      const tickValues = generateTicks(min, max, Math.min(6, Math.max(3, data.length)));
      return tickValues.map((value) => {
        const ratio = clamp01((value - min) / (max - min));
        return {
          value,
          label: xAxis?.labelFormatter ? xAxis.labelFormatter(value) : formatNumber(value, 2),
          gridRatio: ratio,
        };
      });
    }
    const categories = xState.categories.length
      ? xState.categories
      : data.map((_item, idx) => String(idx + 1));
    return categories.map((labelValue, idx) => {
      const count = categories.length;
      const ratio = count <= 1 ? 0.5 : idx / (count - 1);
      return {
        value: labelValue,
        label: labelValue,
        gridRatio: ratio,
      };
    });
  }, [xState, xAxis, data, plotWidth]);

  const yTicks: AxisTick[] = useMemo(() => {
    if (yState.isNumeric) {
      const [min, max] = yState.domain;
      const tickValues = generateTicks(min, max, 5);
      return tickValues.map((value) => {
        const ratio = clamp01((value - min) / (max - min));
        const gridRatio = 1 - ratio;
        return {
          value,
          label: yAxis?.labelFormatter ? yAxis.labelFormatter(value) : formatNumber(value, 2),
          gridRatio,
        };
      });
    }
    const categories = yState.categories.length
      ? yState.categories
      : data.map((_item, idx) => String(idx + 1));
    return categories.map((labelValue, idx) => {
      const count = categories.length;
      const ratio = count <= 1 ? 0.5 : idx / (count - 1);
      const gridRatio = 1 - ratio;
      return {
        value: labelValue,
        label: labelValue,
        gridRatio,
      };
    });
  }, [yState, yAxis, data, plotHeight]);

  const xTickValues = useMemo(() => xTicks.map((tick) => tick.value), [xTicks]);
  const yTickValues = useMemo(() => yTicks.map((tick) => tick.value), [yTicks]);

  const xAxisTickSize = xAxis?.tickLength ?? 4;
  const yAxisTickSize = yAxis?.tickLength ?? 4;
  const axisTickPadding = 4;

  const axisScaleX = useMemo<Scale<any>>(() => {
    if (plotWidth <= 0) {
      const scale = ((_: any) => 0) as Scale<any>;
      scale.domain = () => [];
      scale.range = () => [0, 0];
      scale.ticks = () => [];
      return scale;
    }

    if (xState.isNumeric) {
      const [min, max] = xState.domain;
      const scale = createLinearScale([min, max], [0, plotWidth]);
      const numericTicks = xTickValues.filter((val): val is number => typeof val === 'number' && Number.isFinite(val));
      const baseTicks = scale.ticks ? scale.ticks.bind(scale) : undefined;
      scale.ticks = (count?: number) => {
        if (numericTicks.length) return numericTicks;
        return baseTicks ? baseTicks(count) : [];
      };
      return scale;
    }

    const domain = (xState.categories.length ? xState.categories : xTickValues.map((val) => String(val))) as string[];
    const count = domain.length;
    const step = count > 1 ? plotWidth / (count - 1) : 0;
    const scale = ((value: any) => {
      if (!count) return 0;
      const str = String(value);
      const idx = domain.indexOf(str);
      if (count === 1) {
        return plotWidth / 2;
      }
      const clampedIdx = idx >= 0 ? idx : 0;
      return clampedIdx * step;
    }) as Scale<any>;
    scale.domain = () => domain.slice();
    scale.range = () => [0, plotWidth];
    scale.ticks = () => domain.slice();
    return scale;
  }, [plotWidth, xState, xTickValues]);

  const axisScaleY = useMemo<Scale<any>>(() => {
    if (plotHeight <= 0) {
      const scale = ((_: any) => 0) as Scale<any>;
      scale.domain = () => [];
      scale.range = () => [0, 0];
      scale.ticks = () => [];
      return scale;
    }

    if (yState.isNumeric) {
      const [min, max] = yState.domain;
      const scale = createLinearScale([min, max], [plotHeight, 0]);
      const numericTicks = yTickValues.filter((val): val is number => typeof val === 'number' && Number.isFinite(val));
      const baseTicks = scale.ticks ? scale.ticks.bind(scale) : undefined;
      scale.ticks = (count?: number) => {
        if (numericTicks.length) return numericTicks;
        return baseTicks ? baseTicks(count) : [];
      };
      return scale;
    }

    const domain = (yState.categories.length ? yState.categories : yTickValues.map((val) => String(val))) as string[];
    const count = domain.length;
    const step = count > 1 ? plotHeight / (count - 1) : 0;
    const scale = ((value: any) => {
      if (!count) return plotHeight;
      const str = String(value);
      const idx = domain.indexOf(str);
      if (count === 1) {
        return plotHeight / 2;
      }
      const clampedIdx = idx >= 0 ? idx : 0;
      return plotHeight - clampedIdx * step;
    }) as Scale<any>;
    scale.domain = () => domain.slice();
    scale.range = () => [plotHeight, 0];
    scale.ticks = () => domain.slice();
    return scale;
  }, [plotHeight, yState, yTickValues]);

  const allBubbles: BubbleInternal[] = useMemo(() => {
    if (!plotWidth || !plotHeight) return [];
    return data.map((item, index) => {
      const rawX = (item as any)[dataKey.x];
      const rawY = (item as any)[dataKey.y];
      const rawZ = dataKey.z ? Number((item as any)[dataKey.z]) : undefined;

      const ratioX = getXRatio(rawX);
      const ratioY = getYRatio(rawY);

      const plotX = clamp01(ratioX) * plotWidth;
      const plotY = (1 - clamp01(ratioY)) * plotHeight;

      const value = rawZ != null && Number.isFinite(rawZ) ? Math.max(0, rawZ) : undefined;
      const radius = computeRadius(value, index);

      const rawColorValue = dataKey.color ? (item as any)[dataKey.color] : undefined;

      let bubbleColor = colorScale ? colorScale(rawColorValue, item, index) : undefined;

      if (!bubbleColor && rawColorValue != null) {
        if (isLikelyColor(rawColorValue)) {
          bubbleColor = String(rawColorValue);
        }
      }

      if (!bubbleColor && (item as any).color != null) {
        const inferred = (item as any).color;
        if (isLikelyColor(inferred)) {
          bubbleColor = String(inferred);
        }
      }

      if (!bubbleColor && color) {
        bubbleColor = color;
      }

      if (!bubbleColor) {
        bubbleColor = getColorFromScheme(index, theme.colors.accentPalette ?? colorSchemes.default);
      }

      const labelValue = dataKey.label ? (item as any)[dataKey.label] : rawX;
      const legendKey = rawColorValue != null ? String(rawColorValue) : undefined;
      const legendLabel = legendKey ?? (labelValue != null ? String(labelValue) : String(rawX ?? index + 1));
      const idValue = dataKey.id ? (item as any)[dataKey.id] : (item as any).id ?? index;

      const dataXNumeric = xState.isNumeric
        ? (typeof rawX === 'number' && Number.isFinite(rawX) ? rawX : Number(rawX) || index)
        : Math.max(0, xState.categories.indexOf(String(rawX)));

      const dataYNumeric = yState.isNumeric
        ? (typeof rawY === 'number' && Number.isFinite(rawY) ? rawY : Number(rawY) || index)
        : Math.max(0, yState.categories.indexOf(String(rawY)));

      const bubbleValue = value ?? (sizeDomain.min === sizeDomain.max ? sizeDomain.max : (sizeDomain.min + sizeDomain.max) / 2);
      const formattedValue = valueFormatter ? valueFormatter(bubbleValue, item, index) : formatNumber(bubbleValue, 2);
      const tooltipPayload = {
        record: item,
        value: bubbleValue,
        label: labelValue != null ? String(labelValue) : String(rawX ?? index + 1),
        rawX,
        rawY,
        index,
        color: bubbleColor,
      };
      const customTooltip = tooltip?.formatter?.(tooltipPayload);

      return {
        index,
        id: typeof idValue === 'string' || typeof idValue === 'number' ? idValue : String(idValue ?? index),
        record: item,
        rawX,
        rawY,
        value: bubbleValue,
        radius,
        plotX,
        plotY,
        dataX: Number.isFinite(dataXNumeric) ? dataXNumeric : index,
        dataY: Number.isFinite(dataYNumeric) ? dataYNumeric : index,
        color: bubbleColor,
        label: labelValue != null ? String(labelValue) : String(rawX ?? index + 1),
        formattedValue,
        tooltipPayload,
        customTooltip,
        legendLabel,
        legendKey,
      } as BubbleInternal;
    });
  }, [data, dataKey, getXRatio, getYRatio, computeRadius, color, colorScale, theme.colors.accentPalette, xState, yState, sizeDomain, valueFormatter, plotWidth, plotHeight, tooltip?.formatter]);

  const bubbles: BubbleInternal[] = useMemo(() => {
    if (!hiddenLegendKeys.size) return allBubbles;
    return allBubbles.filter((bubble) => !hiddenLegendKeys.has(bubble.legendKey ?? bubble.legendLabel));
  }, [allBubbles, hiddenLegendKeys]);

  const legendItems = useMemo(() => {
    if (!legend?.show) return [] as Array<ChartLegendItem & { key: string }>;
    if (legend.items && legend.items.length > 0) {
      return legend.items.map((item: ChartLegendItem, index) => {
        const key = resolveLegendItemKey(item, index);
        const hidden = hiddenLegendKeys.has(key);
        return {
          ...item,
          key,
          visible: !hidden,
        };
      });
    }

    const entries = new Map<string, ChartLegendItem & { key: string }>();
    for (const bubble of allBubbles) {
      const key = bubble.legendKey ?? bubble.legendLabel;
      if (!entries.has(key)) {
        entries.set(key, {
          label: bubble.legendLabel,
          color: bubble.color,
          key,
          visible: !hiddenLegendKeys.has(key),
        });
      }
    }

    return Array.from(entries.values());
  }, [legend, hiddenLegendKeys, allBubbles]);

  const legendEntryKeys = useMemo(
    () => legendItems.map((item, index) => resolveLegendItemKey(item, index)),
    [legendItems]
  );

  const handleLegendPress = useCallback(
    (item: ChartLegendItem, index: number, nativeEvent?: any) => {
      if (!legend?.show) return;
      const key = resolveLegendItemKey(item, index);
      setHiddenLegendKeys((prev) => {
        const entryKeys = legendEntryKeys.filter(Boolean);
        if (!entryKeys.length) return prev;

        if (nativeEvent?.shiftKey) {
          const visibleKeys = entryKeys.filter((entryKey) => !prev.has(entryKey));
          if (visibleKeys.length === 1 && visibleKeys[0] === key) {
            return prev.size === 0 ? prev : new Set();
          }
          const nextHidden = new Set(entryKeys.filter((entryKey) => entryKey !== key));
          return setsEqual(prev, nextHidden) ? prev : nextHidden;
        }

        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return setsEqual(prev, next) ? prev : next;
      });
    },
    [legend?.show, legendEntryKeys]
  );

  const interactionContext = (() => {
    try {
      return useChartInteractionContext();
    } catch {
      return null;
    }
  })();

  const setPointer = interactionContext?.setPointer;
  const setActiveTarget = interactionContext?.setActiveTarget;
  const setActiveSlice = interactionContext?.setActiveSlice;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handlePointer = useCallback(
    (nativeEvent: any, firePress: boolean = false) => {
      if (!nativeEvent || disabled) return;
      const { locationX, locationY, pageX, pageY } = nativeEvent;
      if (typeof locationX !== 'number' || typeof locationY !== 'number') return;
      const x = clamp01(locationX / plotWidth) * plotWidth;
      const y = clamp01(locationY / plotHeight) * plotHeight;

      let closest: BubbleInternal | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const bubble of bubbles) {
        const dx = x - bubble.plotX;
        const dy = y - bubble.plotY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const threshold = Math.max(bubble.radius * 1.15, 12);
        if (distance <= threshold && distance < closestDistance) {
          closest = bubble;
          closestDistance = distance;
        }
      }

      if (closest) {
        setHoveredIndex(closest.index);
        if (tooltipEnabled && setPointer) {
          const pointerData = {
            type: 'bubble' as const,
            label: closest.label,
            value: closest.value,
            formattedValue: closest.formattedValue,
            rawX: closest.rawX,
            rawY: closest.rawY,
            record: closest.record,
            color: closest.color,
            radius: closest.radius,
            customTooltip: closest.customTooltip,
            payload: closest.tooltipPayload,
          };
          setPointer({ x: closest.plotX, y: closest.plotY, inside: true, pageX, pageY, data: pointerData });
          // New engine: publish the resolved bubble as the shared ActiveTarget (container
          // -origin pixel) so ChartActiveTooltip renders it — replaces the legacy crosshair.
          const target: ActiveTarget = {
            seriesId: 'bubble-series',
            markId: closest.id,
            kind: 'point',
            datum: closest.record ?? closest,
            pixel: { x: closest.plotX + padding.left, y: closest.plotY + padding.top },
            value: closest.value,
            distance: closestDistance,
            label: closest.label,
            color: closest.color,
            formattedValue: closest.formattedValue,
            customTooltip: closest.customTooltip,
            dataX: closest.dataX,
            dataY: closest.dataY,
          };
          setActiveTarget?.(target);
          setActiveSlice?.([target]);
        }

        if (firePress) {
          const bubblePoint: ChartDataPoint = {
            id: closest.id,
            x: closest.dataX,
            y: closest.dataY,
            label: closest.label,
            color: closest.color,
            size: closest.radius,
            data: closest.record,
          };
          const interactionEvent: ChartInteractionEvent = {
            nativeEvent,
            chartX: closest.plotX,
            chartY: closest.plotY,
            dataX: closest.dataX,
            dataY: closest.dataY,
            dataPoint: bubblePoint,
            distance: closestDistance,
          };
          onDataPointPress?.(bubblePoint, interactionEvent);
          onPress?.(interactionEvent);
        }
      } else {
        setHoveredIndex(null);
        if (tooltipEnabled && setPointer) {
          setPointer({ x, y, inside: true, pageX, pageY, data: null });
          setActiveTarget?.(null);
          setActiveSlice?.([]);
        }
      }
    },
    [bubbles, disabled, plotWidth, plotHeight, tooltipEnabled, setPointer, setActiveTarget, setActiveSlice, padding.left, padding.top, onDataPointPress, onPress]
  );

  const handlePointerEnd = useCallback(() => {
    setHoveredIndex(null);
    if (tooltipEnabled && setPointer) {
      setPointer({ x: 0, y: 0, inside: false, data: null });
      setActiveTarget?.(null);
      setActiveSlice?.([]);
    }
  }, [tooltipEnabled, setPointer, setActiveTarget, setActiveSlice]);

  useEffect(() => {
    if (hoveredIndex == null) return;
    const stillVisible = bubbles.some((bubble) => bubble.index === hoveredIndex);
    if (!stillVisible) {
      setHoveredIndex(null);
      if (tooltipEnabled && setPointer) {
        setPointer({ x: 0, y: 0, inside: false, data: null });
        setActiveTarget?.(null);
        setActiveSlice?.([]);
      }
    }
  }, [bubbles, hoveredIndex, tooltipEnabled, setPointer, setActiveTarget, setActiveSlice]);

  const isWeb = Platform.OS === 'web';

  const mapWebPointerEvent = useCallback((event: any) => {
    const rect = event.currentTarget?.getBoundingClientRect?.();
    return {
      locationX: rect ? event.clientX - rect.left : 0,
      locationY: rect ? event.clientY - rect.top : 0,
      pageX: event.pageX ?? event.clientX,
      pageY: event.pageY ?? event.clientY,
    };
  }, []);

  return (
    <ChartContainer
      width={width}
      height={resolvedHeight}
      padding={padding}
      disabled={disabled}
      style={style}
      animationDuration={animationDuration}
      interactionConfig={tooltipEnabled ? { multiTooltip: true, enableCrosshair: true, pointerRAF: true } : { multiTooltip: false, enableCrosshair: false }}
      suppressPopover={!tooltipEnabled}
      {...rest}
    >
      {(title || subtitle) && (
        <ChartTitle
          title={title}
          subtitle={subtitle}
          align="left"
        />
      )}

      {label && (
        <Text
          style={{
            position: 'absolute',
            left: padding.left,
            top: (title || subtitle) ? padding.top - 28 : padding.top - 32,
            fontSize: 13,
            fontWeight: '600',
            color: resolvedTextColor,
          }}
        >
          {label}
        </Text>
      )}

      {chartGridConfig && (
        <ChartGrid
          grid={chartGridConfig}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          xTicks={xTicks.map((tick) => tick.gridRatio)}
          yTicks={yTicks.map((tick) => tick.gridRatio)}
          padding={padding}
        />
      )}

      {yAxis?.title && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: padding.top - 28,
            width: padding.left,
            alignItems: 'flex-start',
          }}
        >
          <Text
            style={{
              fontSize: yAxis?.titleFontSize || 12,
              color: yTitleColor,
              fontWeight: '500',
            }}
          >
            {yAxis.title}
          </Text>
        </View>
      )}

      {yAxis?.show !== false && plotHeight > 0 && (
        <Axis
          scale={axisScaleY}
          orientation="left"
          length={plotHeight}
          offset={{ x: padding.left, y: padding.top }}
          tickCount={yTickValues.length || undefined}
          tickSize={yAxisTickSize}
          tickPadding={axisTickPadding}
          tickFormat={(value) => {
            if (yState.isNumeric) {
              const numeric = typeof value === 'number' ? value : Number(value);
              return yAxis?.labelFormatter ? yAxis.labelFormatter(numeric) : formatNumber(numeric, 2);
            }
            return String(value);
          }}
          showLabels={yAxis?.showLabels !== false}
          showTicks={yAxis?.showTicks !== false}
          stroke={yAxis?.color || theme.colors.grid}
          strokeWidth={yAxis?.thickness ?? 1}
          tickLabelColor={yAxis?.labelColor || resolvedTextColor}
          tickLabelFontSize={yAxis?.labelFontSize}
          labelColor={yAxis?.titleColor || resolvedTextColor}
          labelFontSize={yAxis?.titleFontSize}
          style={{ width: padding.left, height: plotHeight }}
        />
      )}

      {xAxis?.show !== false && plotWidth > 0 && (
        <Axis
          scale={axisScaleX}
          orientation="bottom"
          length={plotWidth}
          offset={{ x: padding.left, y: padding.top + plotHeight }}
          tickCount={xTickValues.length || undefined}
          tickSize={xAxisTickSize}
          tickPadding={axisTickPadding}
          tickFormat={(value) => {
            if (xState.isNumeric) {
              const numeric = typeof value === 'number' ? value : Number(value);
              return xAxis?.labelFormatter ? xAxis.labelFormatter(numeric) : formatNumber(numeric, 2);
            }
            return String(value);
          }}
          showLabels={xAxis?.showLabels !== false}
          showTicks={xAxis?.showTicks !== false}
          stroke={xAxis?.color || theme.colors.grid}
          strokeWidth={xAxis?.thickness ?? 1}
          tickLabelColor={xAxis?.labelColor || resolvedTextColor}
          tickLabelFontSize={xAxis?.labelFontSize}
          labelColor={xAxis?.titleColor || resolvedTextColor}
          labelFontSize={xAxis?.titleFontSize}
        />
      )}

      {xAxis?.title && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: padding.left,
            top: padding.top + plotHeight + 32,
            width: plotWidth,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: xAxis?.titleFontSize || 12,
              color: xTitleColor,
              fontWeight: '500',
            }}
          >
            {xAxis.title}
          </Text>
        </View>
      )}

      <View
        style={{
          position: 'absolute',
          left: padding.left,
          top: padding.top,
          width: plotWidth,
          height: plotHeight,
        }}
      >
        {bubbles.map((bubble, index) => (
          <AnimatedBubble
            key={bubble.id}
            bubble={{
              ...bubble.record,
              id: bubble.id,
              x: bubble.dataX,
              y: bubble.dataY,
              chartX: bubble.plotX,
              chartY: bubble.plotY,
              radius: bubble.radius,
              value: bubble.value,
            }}
            color={bubble.color}
            opacity={resolvedBubbleOpacity}
            strokeColor={bubbleStrokeColor}
            strokeWidth={bubbleStrokeWidth}
            isSelected={hoveredIndex === bubble.index}
            index={index}
            disabled={disabled}
            theme={theme}
          />
        ))}
      </View>

      <View
        testID="bubble-gesture-surface"
        style={{
          position: 'absolute',
          left: padding.left,
          top: padding.top,
          width: plotWidth,
          height: plotHeight,
        }}
        pointerEvents={disabled ? 'none' : isWeb ? 'auto' : 'box-only'}
        {...(isWeb
          ? {
            onPointerMove: (event: any) => {
              handlePointer(mapWebPointerEvent(event));
            },
            onPointerDown: (event: any) => {
              event.preventDefault?.();
              event.currentTarget?.setPointerCapture?.(event.pointerId);
              handlePointer(mapWebPointerEvent(event));
            },
            onPointerUp: (event: any) => {
              event.currentTarget?.releasePointerCapture?.(event.pointerId);
              handlePointer(mapWebPointerEvent(event), true);
              handlePointerEnd();
            },
            onPointerLeave: () => {
              handlePointerEnd();
            },
            onPointerCancel: () => {
              handlePointerEnd();
            },
          }
          : {
            onStartShouldSetResponder: () => !disabled,
            onMoveShouldSetResponder: () => !disabled,
            onResponderGrant: (e: any) => handlePointer(e.nativeEvent),
            onResponderMove: (e: any) => handlePointer(e.nativeEvent),
            onResponderRelease: (e: any) => {
              handlePointer(e.nativeEvent, true);
              handlePointerEnd();
            },
            onResponderTerminate: handlePointerEnd,
            onResponderTerminationRequest: () => true,
          })}
      />

      {legend?.show && legendItems.length > 0 && (
        <ChartLegend
          items={legendItems}
          position={legend.position}
          align={legend.align}
          textColor={legend.textColor}
          fontSize={legend.fontSize}
          onItemPress={handleLegendPress}
        />
      )}
    </ChartContainer>
  );
};

BubbleChart.displayName = 'BubbleChart';

export default BubbleChart;
