import React, { useCallback, useMemo } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { getControlSize, resolveShadow } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { Card } from '../Card';
import { Text } from '../Text';
import type {
  SliderTick,
  SliderTicksProps,
  SliderTrackProps,
  SliderThumbProps,
  SliderValueLabelProps,
  SliderVariant,
} from './types';

// Layout constants (the hit area around the track, and the fallback length
// used until the first layout lands).
export const SLIDER_CONSTANTS = {
  CONTAINER_HEIGHT: 40,
  CONTAINER_WIDTH: 300,
  LABEL_OFFSET: 8,
};

/**
 * Per-variant thumb size multiplier (e.g. `minimal` shrinks the thumb). Applied
 * before position math so the visual stays aligned with the track ends.
 */
export const getVariantThumbSizeMultiplier = (variant: SliderVariant = 'default'): number => {
  switch (variant) {
    case 'minimal':
      return 0.7;
    case 'segmented':
      return 0.9;
    case 'filled':
      return 1.1;
    default:
      return 1;
  }
};

/**
 * Thumb and track sizes. Both are ratios of the theme's control-size icon (md:
 * a 20px thumb on a 6px track), so they follow `theme.controlSizes`; explicit
 * `thumbSize` / `trackSize` props win.
 */
export const getSliderMetrics = (
  theme: PlatformBlocksTheme,
  size: SizeValue | undefined,
  variant: SliderVariant,
  thumbSizeProp?: number,
  trackSizeProp?: number
) => {
  const baseThumb = thumbSizeProp ?? Math.round(getControlSize(theme, size).iconSize * 1.25);
  const thumbSize = Math.max(8, Math.round(baseThumb * getVariantThumbSizeMultiplier(variant)));
  const trackHeight = trackSizeProp ?? Math.max(2, Math.round(baseThumb * 0.3));
  return { thumbSize, trackHeight };
};

type VariantTrackStyle = { inactive: ViewStyle; active: ViewStyle; trackHeightMultiplier: number };

/** Per-variant track chrome, cached per theme / variant / state / colors. */
const getVariantTrackStyle = createThemedStyles(
  (
    theme: PlatformBlocksTheme,
    variant: SliderVariant,
    disabled: boolean,
    trackColor: string,
    activeTrackColor: string
  ): VariantTrackStyle => {
    switch (variant) {
      case 'filled':
        return {
          inactive: { backgroundColor: disabled ? theme.backgrounds.border : theme.backgrounds.borderStrong },
          active: { backgroundColor: activeTrackColor },
          trackHeightMultiplier: 1.6,
        };
      case 'outline':
        return {
          inactive: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: disabled ? theme.backgrounds.borderStrong : trackColor,
          },
          active: { backgroundColor: activeTrackColor },
          trackHeightMultiplier: 1.4,
        };
      case 'minimal':
        return {
          inactive: { backgroundColor: trackColor },
          active: { backgroundColor: activeTrackColor },
          trackHeightMultiplier: 0.4,
        };
      case 'segmented':
      case 'unstyled':
        // Segmented lets the per-segment tick fills carry the visual; unstyled
        // leaves everything to `trackStyle` / `activeTrackStyle`.
        return {
          inactive: { backgroundColor: 'transparent' },
          active: { backgroundColor: 'transparent' },
          trackHeightMultiplier: 1,
        };
      case 'default':
      default:
        return {
          inactive: { backgroundColor: trackColor },
          active: { backgroundColor: activeTrackColor },
          trackHeightMultiplier: 1,
        };
    }
  }
);

/** Per-variant thumb chrome, cached per theme / variant / state / color. */
const getVariantThumbStyle = createThemedStyles(
  (theme: PlatformBlocksTheme, variant: SliderVariant, disabled: boolean, thumbColor: string): ViewStyle => {
    // The ring around a solid thumb matches the surface it sits on.
    const ring = theme.backgrounds.surface;
    switch (variant) {
      case 'filled':
        return { backgroundColor: thumbColor, borderWidth: 0, ...resolveShadow(theme, 'md') };
      case 'outline':
        return {
          backgroundColor: theme.backgrounds.surface,
          borderWidth: 2,
          borderColor: disabled ? theme.text.disabled : thumbColor,
          ...resolveShadow(theme, 'none'),
        };
      case 'minimal':
        return { backgroundColor: thumbColor, borderWidth: 0, ...resolveShadow(theme, 'none') };
      case 'segmented':
        return { backgroundColor: thumbColor, borderWidth: 2, borderColor: ring, borderRadius: 4, ...resolveShadow(theme, 'sm') };
      case 'unstyled':
        return { backgroundColor: 'transparent', borderWidth: 0, ...resolveShadow(theme, 'none') };
      case 'default':
      default:
        return { backgroundColor: thumbColor, borderWidth: 2, borderColor: ring, ...resolveShadow(theme, 'sm') };
    }
  }
);

export const getOrientationProps = (orientation: 'horizontal' | 'vertical' = 'horizontal', containerSize?: number) => {
  const isVertical = orientation === 'vertical';
  const length = containerSize || SLIDER_CONSTANTS.CONTAINER_WIDTH;
  return {
    isVertical,
    containerWidth: isVertical ? SLIDER_CONSTANTS.CONTAINER_HEIGHT : length,
    containerHeight: isVertical ? length : SLIDER_CONSTANTS.CONTAINER_HEIGHT,
  };
};

export const sliderUtils = {
  clamp: (value: number, min: number, max: number): number => (value < min ? min : value > max ? max : value),

  roundToStep: (value: number, step: number): number => Math.round(value / step) * step,

  /** Closest tick value (ticks sorted ascending for the binary search on long lists). */
  roundToTicks: (value: number, ticks: SliderTick[]): number => {
    if (!ticks.length) return value;
    if (ticks.length <= 8) {
      let closest = ticks[0].value;
      let minDistance = Math.abs(value - closest);
      for (let i = 1; i < ticks.length; i++) {
        const distance = Math.abs(value - ticks[i].value);
        if (distance < minDistance) {
          minDistance = distance;
          closest = ticks[i].value;
        }
      }
      return closest;
    }
    let left = 0;
    let right = ticks.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (ticks[mid].value < value) left = mid + 1;
      else right = mid;
    }
    if (left > 0) {
      const leftDist = Math.abs(value - ticks[left - 1].value);
      const rightDist = Math.abs(value - ticks[left].value);
      return leftDist <= rightDist ? ticks[left - 1].value : ticks[left].value;
    }
    return ticks[left].value;
  },

  valueToPercentage: (value: number, min: number, max: number): number =>
    max === min ? 0 : ((value - min) / (max - min)) * 100,

  percentageToValue: (percentage: number, min: number, max: number): number => min + (percentage / 100) * (max - min),
};

/** The tick after (`direction` 1) or before (-1) `current`, or `current` at the ends. */
export const adjacentTickValue = (current: number, ticks: SliderTick[], direction: 1 | -1): number => {
  const values = ticks.map((tick) => tick.value).sort((a, b) => a - b);
  if (direction > 0) return values.find((value) => value > current + 1e-9) ?? current;
  for (let i = values.length - 1; i >= 0; i--) if (values[i] < current - 1e-9) return values[i];
  return current;
};

export interface ResolvedTick extends SliderTick {
  /** Offset along the track from its start (px), already direction-adjusted. */
  position: number;
  isActive: boolean;
}

/**
 * Tick marks to draw: the explicit `ticks`, or one per `step` with `showTicks`.
 * `isActive(value)` decides which ones sit on the active range.
 */
export const useSliderTicks = (
  ticks: SliderTick[] | undefined,
  showTicks: boolean,
  min: number,
  max: number,
  step: number,
  valueToOffset: (value: number) => number,
  isActive: (value: number) => boolean
): ResolvedTick[] =>
  useMemo(() => {
    const source: SliderTick[] =
      ticks && ticks.length > 0
        ? ticks
        : showTicks && step > 0
          ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => ({ value: min + i * step }))
          : [];
    return source.map((tick) => ({ ...tick, position: valueToOffset(tick.value), isActive: isActive(tick.value) }));
  }, [ticks, showTicks, min, max, step, valueToOffset, isActive]);

/** Clamps / snaps a raw value to the slider's constraints. */
export const useSliderValueConstraint = (
  min: number,
  max: number,
  step: number,
  restrictToTicks: boolean,
  ticks: SliderTick[] | undefined
) =>
  useCallback(
    (value: number) => {
      const clamped = sliderUtils.clamp(value, min, max);
      const snapped =
        restrictToTicks && ticks && ticks.length > 0
          ? sliderUtils.roundToTicks(clamped, ticks)
          : step > 0
            ? sliderUtils.roundToStep(clamped, step)
            : clamped;
      return sliderUtils.clamp(snapped, min, max);
    },
    [min, max, step, restrictToTicks, ticks]
  );

export const SliderTrack: React.FC<SliderTrackProps> = ({
  disabled,
  theme,
  orientation,
  activeLength = 0,
  activeStart,
  trackColor,
  activeTrackColor,
  trackStyle,
  activeTrackStyle,
  trackHeight,
  thumbSize,
  variant = 'default',
}) => {
  const isVertical = orientation === 'vertical';
  const inactiveColor = disabled && !trackColor ? theme.backgrounds.border : trackColor ?? theme.backgrounds.borderStrong;
  const activeColor = disabled && !activeTrackColor ? theme.text.disabled : activeTrackColor ?? theme.colors.primary[5];
  const variantStyle = getVariantTrackStyle(theme, variant, disabled, inactiveColor, activeColor);
  const height = Math.max(1, Math.round(trackHeight * variantStyle.trackHeightMultiplier));
  const radius = variant === 'segmented' ? 0 : height / 2;
  // Logical insets throughout, so a horizontal slider mirrors under RTL.
  const crossOffset = isVertical
    ? { start: (thumbSize - height) / 2, width: height }
    : { top: (SLIDER_CONSTANTS.CONTAINER_HEIGHT - height) / 2, height };
  const start = activeStart ?? thumbSize / 2;

  return (
    <>
      <View
        style={[
          { position: 'absolute', borderRadius: radius },
          variantStyle.inactive,
          isVertical ? { top: thumbSize / 2, bottom: thumbSize / 2 } : { start: thumbSize / 2, end: thumbSize / 2 },
          crossOffset,
          trackStyle,
        ]}
      />
      {activeLength > 0 ? (
        <View
          style={[
            { position: 'absolute', borderRadius: radius },
            variantStyle.active,
            isVertical ? { top: start, height: activeLength } : { start, width: activeLength },
            crossOffset,
            activeTrackStyle,
          ]}
        />
      ) : null}
    </>
  );
};

export const SliderTicks: React.FC<SliderTicksProps> = ({
  ticks,
  disabled,
  theme,
  orientation,
  keyPrefix = 'tick',
  trackHeight,
  thumbSize,
  activeTickColor,
  tickColor,
  tickStyle,
  activeTickStyle,
  tickLabelProps,
}) => {
  const isVertical = orientation === 'vertical';
  const inactiveColor = disabled && !tickColor ? theme.backgrounds.border : tickColor ?? theme.text.muted;
  const activeColor = disabled && !activeTickColor ? theme.text.disabled : activeTickColor ?? theme.colors.primary[5];

  return (
    <>
      {ticks.map((tick, index) => (
        <View
          key={`${keyPrefix}-${tick.value}-${index}`}
          style={[
            { position: 'absolute', borderRadius: 1, backgroundColor: tick.isActive ? activeColor : inactiveColor },
            isVertical
              ? { top: thumbSize / 2 + tick.position, start: (thumbSize - trackHeight) / 2 - 3, height: 2, width: trackHeight + 6 }
              : {
                  start: thumbSize / 2 + tick.position,
                  top: (SLIDER_CONSTANTS.CONTAINER_HEIGHT - trackHeight) / 2 - 3,
                  width: 2,
                  height: trackHeight + 6,
                },
            // A per-tick `style` wins over the global tickStyle / activeTickStyle.
            tick.isActive ? activeTickStyle : tickStyle,
            tick.style,
          ]}
        />
      ))}
      {ticks.map((tick, index) =>
        tick.label ? (
          <View
            key={`${keyPrefix}-label-${tick.value}-${index}`}
            style={
              isVertical
                ? { position: 'absolute', top: thumbSize / 2 + tick.position - 10, start: thumbSize + 8, height: 20, justifyContent: 'center' }
                : { position: 'absolute', start: thumbSize / 2 + tick.position - 20, top: SLIDER_CONSTANTS.CONTAINER_HEIGHT + 8, width: 40, alignItems: 'center' }
            }
          >
            <Text
              {...mergeSlotProps(
                { size: 'xs' as const, style: isVertical ? undefined : { textAlign: 'center' as const } },
                tickLabelProps
              )}
            >
              {tick.label}
            </Text>
          </View>
        ) : null
      )}
    </>
  );
};

/**
 * One focusable thumb. The caller passes the adjustable props (role slider,
 * aria-value*, keys, actions) — it is the control.
 */
export const SliderThumb = React.forwardRef<View, SliderThumbProps>(function SliderThumb(
  {
    position,
    disabled,
    theme,
    orientation,
    isDragging,
    raised = false,
    thumbColor,
    thumbStyle,
    thumbSize,
    variant = 'default',
    a11y,
    onFocus,
    onBlur,
    testID,
  },
  ref
) {
  const color = disabled && !thumbColor ? theme.text.disabled : thumbColor ?? theme.colors.primary[5];
  const variantStyle = getVariantThumbStyle(theme, variant, disabled, color);
  const isVertical = orientation === 'vertical';

  return (
    <View
      ref={ref}
      testID={testID}
      {...a11y}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[
        {
          position: 'absolute',
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          transform: [{ scale: isDragging ? 1.1 : 1 }],
          // The thumb being dragged draws over its sibling.
          zIndex: raised ? 2 : 1,
        },
        variantStyle,
        isVertical ? { top: position, start: 0 } : { start: position, top: (SLIDER_CONSTANTS.CONTAINER_HEIGHT - thumbSize) / 2 },
        thumbStyle,
      ]}
    />
  );
});

export const SliderValueLabel: React.FC<SliderValueLabelProps> = ({
  value,
  position,
  orientation,
  isCard = false,
  thumbSize,
  placement,
  offset,
  containerStyle,
  textProps,
}) => {
  const isVertical = orientation === 'vertical';

  // Horizontal labels are centered in a 100px-wide wrapper (so the Card needs
  // `margin: auto` and the Text `textAlign: center`); vertical ones anchor by edge.
  const renderContent = (centered: boolean) => {
    const cardStyle: StyleProp<ViewStyle> = centered ? [{ margin: 'auto' }, containerStyle] : containerStyle;
    const textBase = { size: 'sm' as const, style: centered ? { textAlign: 'center' as const } : undefined };
    const text = <Text {...mergeSlotProps(textBase, textProps)}>{value}</Text>;
    if (!isCard) return text;
    return (
      <Card style={cardStyle} p="xs" variant="filled" shadow={centered ? 'md' : undefined}>
        {text}
      </Card>
    );
  };

  // Decorative: the thumb already exposes the value (aria-valuetext).
  const hidden: ViewProps = { importantForAccessibility: 'no-hide-descendants', accessibilityElementsHidden: true, 'aria-hidden': true };

  if (isVertical) {
    const right = placement === 'right';
    const lateral = thumbSize + (offset ?? 16);
    return (
      <View
        {...hidden}
        style={[
          {
            position: 'absolute',
            top: position + thumbSize / 2 - 10,
            height: 20,
            justifyContent: 'center',
            alignItems: right ? 'flex-start' : 'flex-end',
            pointerEvents: 'none',
          },
          right ? { start: lateral } : { end: lateral },
        ]}
      >
        {renderContent(false)}
      </View>
    );
  }

  const bottom = placement === 'bottom';
  const gap = offset ?? 6;
  return (
    <View
      {...hidden}
      style={[
        { position: 'absolute', start: position + thumbSize / 2 - 50, width: 100, alignItems: 'center', pointerEvents: 'none' },
        bottom ? { top: SLIDER_CONSTANTS.CONTAINER_HEIGHT - gap } : { bottom: SLIDER_CONSTANTS.CONTAINER_HEIGHT - gap },
      ]}
    >
      {renderContent(true)}
    </View>
  );
};
