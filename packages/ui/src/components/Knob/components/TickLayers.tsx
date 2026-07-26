import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Icon } from '../../Icon';
import { Text } from '../../Text';
import type { KnobAppearance, KnobMark, KnobTickLayer } from '../types';
import type { LayoutState } from '../hooks/useKnobGeometry';
import { clamp } from '../utils/math';
import { knobStyles as styles } from '../styles';
import { polarToCartesian, getPositionRadius, toRadians, angularDistance } from '../utils/geometry';

/**
 * `count` evenly spaced values across the range, endpoints included. Used for fixed-
 * resolution rings (an LED collar) where the tick count is a property of the look rather
 * than of `step`. On a full-circle arc the last value shares an angle with the first, which
 * simply overlaps.
 */
const generateCountValues = (min: number, max: number, count?: number) => {
  if (!(Number.isFinite(count) && count && count >= 2) || max <= min) {
    return [] as number[];
  }
  const total = Math.min(Math.round(count), 512);
  const span = max - min;
  return Array.from({ length: total }, (_, index) =>
    Number((min + (span * index) / (total - 1)).toFixed(6))
  );
};

const generateStepValues = (min: number, max: number, step?: number) => {
  if (!(Number.isFinite(step) && step && step > 0) || max <= min) {
    return [] as number[];
  }
  const values: number[] = [];
  const limit = 600;
  let count = 0;
  for (let current = min; current <= max + 1e-8 && count < limit; current += step) {
    values.push(Number(current.toFixed(6)));
    count += 1;
  }
  if (values[values.length - 1] !== max) {
    values.push(max);
  }
  return values;
};

export type TickLayersProps = {
  appearanceTicks?: KnobAppearance['ticks'];
  marksNormalized: KnobMark[];
  min: number;
  max: number;
  step: number;
  isEndless: boolean;
  valueToAngle: (value: number) => number;
  layoutState: LayoutState;
  ringRadius: number;
  ringThickness: number;
  theme: any;
  boundedRatio: number;
  size: number;
  thumbSize: number;
  resolvedBehavior: string;
  displayValue: number;
  activeMark?: KnobMark | null;
  disabled: boolean;
  markLabelStyle?: StyleProp<TextStyle>;
  labelColor: string;
};

type DerivedTickItem = {
  value: number;
  angle: number;
  ratio: number;
  mark?: KnobMark;
};

type DerivedTickLayer = {
  id: string;
  config: KnobTickLayer;
  source: 'marks' | 'steps' | 'values';
  ticks: DerivedTickItem[];
};

export const TickLayers: React.FC<TickLayersProps> = ({
  appearanceTicks,
  marksNormalized,
  min,
  max,
  step,
  isEndless,
  valueToAngle,
  layoutState,
  ringRadius,
  ringThickness,
  theme,
  boundedRatio,
  size,
  thumbSize,
  resolvedBehavior,
  displayValue,
  disabled,
  markLabelStyle,
  labelColor,
  activeMark,
}) => {
  const derivedTickLayers = useMemo<DerivedTickLayer[]>(() => {
    const layersArray = Array.isArray(appearanceTicks)
      ? appearanceTicks
      : appearanceTicks
        ? [appearanceTicks]
        : [];
    if (!layersArray.length) return [];
    const span = max - min;
    return layersArray
      .map((layer: KnobTickLayer, layerIndex: number) => {
        const source = layer.source ?? 'marks';
        let entries: { value: number; mark?: KnobMark }[] = [];
        if (source === 'marks') {
          entries = marksNormalized.map((mark) => ({ value: mark.value, mark }));
        } else if (source === 'values') {
          const rawValues = Array.isArray(layer.values) ? layer.values : [];
          entries = rawValues.map((val: number) => ({ value: val }));
        } else if (source === 'count') {
          entries = generateCountValues(min, max, layer.count).map((val: number) => ({ value: val }));
        } else if (source === 'steps') {
          const stepValues =
            Array.isArray(layer.values) && layer.values.length > 0
              ? layer.values
              : generateStepValues(min, max, step);
          entries = stepValues.map((val: number) => ({ value: val }));
        }
        if (!entries.length) {
          return null;
        }
        const seen = new Set<number>();
        const ticks = entries
          .map((entry) => {
            const candidate = Number.isFinite(entry.value) ? entry.value : min;
            const clampedValue = isEndless ? candidate : clamp(candidate, min, max);
            if (!isEndless && (clampedValue < min || clampedValue > max)) {
              return null;
            }
            const key = Number(clampedValue.toFixed(6));
            if (seen.has(key)) {
              return null;
            }
            seen.add(key);
            const angleForValue = valueToAngle(clampedValue);
            const ratio = !isEndless && span > 0 ? (clampedValue - min) / span : 0;
            return {
              value: clampedValue,
              angle: angleForValue,
              ratio,
              mark: entry.mark,
            } as DerivedTickItem;
          })
          .filter(Boolean) as DerivedTickItem[];
        if (!ticks.length) return null;
        ticks.sort((a, b) => a.value - b.value);
        return {
          id: `tick-layer-${layerIndex}`,
          config: layer,
          source,
          ticks,
        } as DerivedTickLayer;
      })
      .filter(Boolean) as DerivedTickLayer[];
  }, [appearanceTicks, marksNormalized, min, max, step, isEndless, valueToAngle]);

  // For `activeMode: 'nearest'`, the one tick each layer's pointer is aimed at. Resolved by
  // angle rather than value so it holds on endless knobs, where the value keeps climbing past
  // `max` but the pointer still aims somewhere on the dial.
  const nearestTickIndexByLayer = useMemo(() => {
    const result: Record<string, number> = {};
    const valueAngle = valueToAngle(displayValue);
    derivedTickLayers.forEach((layerData) => {
      if ((layerData.config.activeMode ?? 'fill') !== 'nearest') return;
      let nearestIndex = -1;
      let nearestDistance = Infinity;
      layerData.ticks.forEach((tick, index) => {
        const distance = angularDistance(tick.angle, valueAngle);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      result[layerData.id] = nearestIndex;
    });
    return result;
  }, [derivedTickLayers, displayValue, valueToAngle]);

  const hasTickLayers = derivedTickLayers.length > 0;

  const markRadius = Math.max(0, ringRadius);
  const markDotSize = Math.max(4, Math.round(size * 0.05));
  const markLabelDistance = markRadius + thumbSize / 2 + 16;
  const markLabelWidth = Math.max(48, Math.round(size * 0.55));
  const markLabelHeight = Math.max(20, Math.round(size * 0.18));
  const markColor = disabled ? theme.colors.gray[4] : theme.colors.gray[6];

  if (hasTickLayers) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {derivedTickLayers.map((layerData) => {
          const shape = layerData.config.shape ?? 'dot';
          const position = layerData.config.position ?? 'center';
          const radiusOffset = layerData.config.radiusOffset ?? 0;
          const baseRadius = getPositionRadius(
            ringRadius,
            ringThickness,
            position,
            radiusOffset
          );
          const tickLength = layerData.config.length ?? Math.max(6, Math.round(ringThickness * 0.9));
          const tickWidth = layerData.config.width ?? Math.max(2, Math.round(ringThickness * 0.25));
          const colorInput = layerData.config.color;
          const inactiveColorInput = layerData.config.inactiveColor;
          const labelConfig = layerData.config.label;
          const labelPosition = labelConfig?.position ?? 'outer';
          const labelOffset = labelConfig?.offset ?? 12;
          const activeMode = layerData.config.activeMode ?? 'fill';
          const nearestTickIndex = nearestTickIndexByLayer[layerData.id] ?? -1;
          const isTickActive = (tick: DerivedTickItem, tickIndex: number) =>
            activeMode === 'nearest'
              ? tickIndex === nearestTickIndex
              : !isEndless && tick.ratio <= boundedRatio + 0.0001;

          /**
           * A tick's color, most specific source first: a resolver the caller passed, then
           * the mark's own accent (which is what lets marks-sourced ticks each carry their
           * own color without a resolver), then the layer's flat color, then the theme.
           */
          const resolveTickColor = (tick: DerivedTickItem, tickIndex: number, isActive: boolean) => {
            const input = isActive ? colorInput : inactiveColorInput;
            if (typeof input === 'function') {
              const resolved = input({
                value: tick.value,
                index: tickIndex,
                angle: tick.angle,
                isActive,
                mark: tick.mark,
              });
              if (resolved) return resolved;
            }
            if (isActive && tick.mark?.accentColor) return tick.mark.accentColor;
            if (typeof input === 'string') return input;
            return isActive
              ? theme.text.primary
              : theme.colors.gray?.[4] ?? 'rgba(0,0,0,0.4)';
          };

          // Line ticks share one SVG per layer. An SVG clips to its own viewport, so the
          // viewport is grown past the knob box by however far the strokes reach — otherwise
          // `position: 'outer'` ticks get squared off at the edge of the knob.
          const lineStartRadius =
            position === 'center' ? baseRadius - tickLength / 2 : baseRadius;
          const lineEndRadius =
            position === 'inner'
              ? Math.max(0, baseRadius - tickLength)
              : position === 'outer'
                ? baseRadius + tickLength
                : baseRadius + tickLength / 2;
          // Round caps overhang the endpoint by half the stroke width.
          const lineReach = Math.max(lineStartRadius, lineEndRadius) + tickWidth / 2;
          const linePad = Math.max(0, Math.ceil(lineReach - layoutState.radius));
          const lineCx = layoutState.cx + linePad;
          const lineCy = layoutState.cy + linePad;

          return (
            <React.Fragment key={layerData.id}>
              {shape === 'line' ? (
                <Svg
                  pointerEvents="none"
                  width={layoutState.width + linePad * 2}
                  height={layoutState.height + linePad * 2}
                  style={[styles.tickLineSvg, { left: -linePad, top: -linePad }]}
                >
                  {layerData.ticks.map((tick, tickIndex) => {
                    const start = polarToCartesian(lineCx, lineCy, lineStartRadius, tick.angle);
                    const end = polarToCartesian(lineCx, lineCy, lineEndRadius, tick.angle);
                    return (
                      <Line
                        key={`${layerData.id}-${tickIndex}-line`}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={resolveTickColor(tick, tickIndex, isTickActive(tick, tickIndex))}
                        strokeWidth={tickWidth}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </Svg>
              ) : null}
              {layerData.ticks.map((tick, tickIndex) => {
                const tickKey = `${layerData.id}-${tickIndex}`;
                const isActive = isTickActive(tick, tickIndex);
                const color = resolveTickColor(tick, tickIndex, isActive);
                const coords = polarToCartesian(
                  layoutState.cx,
                  layoutState.cy,
                  baseRadius,
                  tick.angle
                );

                let tickNode: React.ReactNode = null;
                if (shape === 'line') {
                  // Already drawn in the shared SVG above.
                  tickNode = null;
                } else if (shape === 'icon' && layerData.config.iconName) {
                  const iconSize = Math.max(12, tickWidth * 2);
                  tickNode = (
                    <View
                      key={`${tickKey}-icon`}
                      pointerEvents="none"
                      style={[
                        styles.tickIcon,
                        {
                          left: coords.x,
                          top: coords.y,
                          transform: [
                            { translateX: -iconSize / 2 },
                            { translateY: -iconSize / 2 },
                          ],
                        },
                      ]}
                    >
                      <Icon name={layerData.config.iconName} size={iconSize} color={color} decorative />
                    </View>
                  );
                } else if (shape === 'custom' && layerData.config.renderTick) {
                  const customSize = Math.max(8, tickWidth * 2);
                  const customNode = layerData.config.renderTick({
                    value: tick.value,
                    angle: tick.angle,
                    index: tickIndex,
                    isActive,
                    center: { x: layoutState.cx, y: layoutState.cy },
                    radius: baseRadius,
                  });
                  tickNode = customNode ? (
                    <View
                      key={`${tickKey}-custom`}
                      pointerEvents="none"
                      style={[
                        styles.tickCustom,
                        {
                          left: coords.x,
                          top: coords.y,
                          transform: [
                            { translateX: -customSize / 2 },
                            { translateY: -customSize / 2 },
                          ],
                        },
                      ]}
                    >
                      {customNode}
                    </View>
                  ) : null;
                } else {
                  const dotSize = Math.max(4, tickWidth);
                  tickNode = (
                    <View
                      key={`${tickKey}-dot`}
                      pointerEvents="none"
                      style={[
                        styles.tickDot,
                        {
                          width: dotSize,
                          height: dotSize,
                          borderRadius: dotSize / 2,
                          backgroundColor: color,
                          left: coords.x - dotSize / 2,
                          top: coords.y - dotSize / 2,
                        },
                      ]}
                    />
                  );
                }

                const labelNodes: React.ReactNode[] = [];
                if (labelConfig) {
                  const wantsLabel =
                    labelConfig.show ??
                    Boolean(labelConfig.formatter || tick.mark?.label != null);
                  if (wantsLabel) {
                    const labelRadius = getPositionRadius(
                      ringRadius,
                      ringThickness,
                      labelPosition,
                      radiusOffset + labelOffset
                    );
                    const labelCoords = polarToCartesian(
                      layoutState.cx,
                      layoutState.cy,
                      labelRadius,
                      tick.angle
                    );
                    const markForLabel = tick.mark ?? ({ value: tick.value } as KnobMark);
                    const formatted =
                      labelConfig.formatter?.(markForLabel, tickIndex) ?? tick.mark?.label;
                    const labelContent =
                      formatted ?? (labelConfig.show ? `${Math.round(tick.value)}` : null);
                    if (labelContent != null) {
                      labelNodes.push(
                        <View
                          key={`${tickKey}-label`}
                          pointerEvents="none"
                          style={[
                            styles.tickLabelContainer,
                            {
                              left: labelCoords.x,
                              top: labelCoords.y,
                              width: markLabelWidth,
                              height: markLabelHeight,
                              transform: [
                                { translateX: -markLabelWidth / 2 },
                                { translateY: -markLabelHeight / 2 },
                              ],
                            },
                          ]}
                        >
                          {typeof labelContent === 'string' || typeof labelContent === 'number' ? (
                            <Text
                              size="xs"
                              weight="500"
                              selectable={false}
                              style={[styles.tickLabelText, labelConfig.style]}
                            >
                              {labelContent}
                            </Text>
                          ) : (
                            labelContent
                          )}
                        </View>
                      );
                    }
                  }
                }

                return (
                  <React.Fragment key={tickKey}>
                    {tickNode}
                    {labelNodes}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  if (marksNormalized.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {marksNormalized.map((mark) => {
        const markAngle = valueToAngle(mark.value);
        const rad = toRadians(markAngle);
        const dotX = layoutState.cx + Math.sin(rad) * markRadius - markDotSize / 2;
        const dotY = layoutState.cy - Math.cos(rad) * markRadius - markDotSize / 2;
        const labelX = layoutState.cx + Math.sin(rad) * markLabelDistance;
        const labelY = layoutState.cy - Math.cos(rad) * markLabelDistance;
        const isActiveMark = activeMark?.value === mark.value;
        const dotScale = isActiveMark && resolvedBehavior !== 'status' ? 1.25 : 1;
        const dotAccent =
          !disabled && isActiveMark ? mark.accentColor ?? theme.colors.primary[5] : markColor;

        return (
          <React.Fragment key={`mark-${mark.value}`}>
            <View
              pointerEvents="none"
              style={[
                styles.markDot,
                {
                  width: markDotSize * dotScale,
                  height: markDotSize * dotScale,
                  borderRadius: (markDotSize * dotScale) / 2,
                  left: dotX,
                  top: dotY,
                  backgroundColor: dotAccent,
                },
              ]}
            />
            {mark.label != null && (
              <View
                pointerEvents="none"
                style={[
                  styles.markLabelContainer,
                  {
                    left: labelX,
                    top: labelY,
                    width: markLabelWidth,
                    height: markLabelHeight,
                    transform: [
                      { translateX: -markLabelWidth / 2 },
                      { translateY: -markLabelHeight / 2 },
                    ],
                  },
                ]}
              >
                {typeof mark.label === 'string' ? (
                  <Text
                    size="xs"
                    weight="500"
                    selectable={false}
                    style={[
                      styles.markLabelText,
                      {
                        color:
                          isActiveMark && !disabled
                            ? mark.accentColor ?? labelColor
                            : labelColor,
                      },
                      markLabelStyle,
                    ]}
                  >
                    {mark.label}
                  </Text>
                ) : (
                  mark.label
                )}
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};
