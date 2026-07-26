import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, PanResponder, Platform } from 'react-native';
import { useTheme } from '../../core/theme';
import { resolveComponentSize, type ComponentSize } from '../../core/theme/componentSize';
import { factory } from '../../core/factory';
import { useControllableState } from '../../hooks/useControllableState';
import type { SliderProps, RangeSliderProps, SliderTick } from './types';
import {
  SLIDER_CONSTANTS,
  getOrientationProps,
  getVariantThumbSizeMultiplier,
  sliderUtils,
  useSliderTicks,
  useSliderValue,
  useSliderGesture,
  SliderTrack,
  SliderTicks,
  SliderThumb,
  SliderLabel,
  SliderValueLabel,
} from './SliderCore';

// Number of decimal places implied by a step (e.g. 0.01 -> 2, 1 -> 0). Used so the
// default value-label reflects fractional steps instead of rounding to an integer.
const decimalsFromStep = (step: number): number => {
  if (!Number.isFinite(step)) return 0;
  const str = String(step);
  if (str.includes('e-')) return Math.min(6, parseInt(str.split('e-')[1], 10) || 0);
  const frac = str.split('.')[1];
  return frac ? Math.min(6, frac.length) : 0;
};

// Formats a slider value for its label: honours an explicit `precision`, otherwise
// derives the precision from `step`. Trailing zeros are trimmed (0.10 -> "0.1").
const formatSliderValue = (val: number, step: number, precision?: number): string => {
  const decimals = precision != null ? precision : decimalsFromStep(step);
  if (decimals <= 0) return Math.round(val).toString();
  return Number(val.toFixed(decimals)).toString();
};

const SLIDER_SIZE_SCALE: Partial<Record<ComponentSize, 'sm' | 'md' | 'lg'>> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
  '2xl': 'lg',
  '3xl': 'lg',
};

const resolvePaletteColor = (themeColors: Record<string, string[]>, scheme?: SliderProps['colorScheme']) => {
  if (!scheme || typeof scheme !== 'string') {
    return undefined;
  }

  const palette = themeColors[scheme];
  if (Array.isArray(palette)) {
    return palette;
  }

  return undefined;
};

const resolveSliderColors = (
  theme: ReturnType<typeof useTheme>,
  {
    colorScheme,
    trackColor,
    activeTrackColor,
    thumbColor,
    tickColor,
    activeTickColor,
  }: Pick<SliderProps, 'colorScheme' | 'trackColor' | 'activeTrackColor' | 'thumbColor' | 'tickColor' | 'activeTickColor'>
) => {
  const palette = resolvePaletteColor(theme.colors as Record<string, string[]>, colorScheme);
  const schemeColor = palette?.[5]
    ?? (typeof colorScheme === 'string' ? colorScheme : undefined)
    ?? theme.colors.primary[5];

  const resolvedActiveTrack = activeTrackColor ?? schemeColor;
  const defaultTrackColor = theme.colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[3];
  const defaultTickColor = theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[4];

  return {
    trackColor: trackColor ?? defaultTrackColor,
    activeTrackColor: resolvedActiveTrack,
    thumbColor: thumbColor ?? resolvedActiveTrack,
    tickColor: tickColor ?? defaultTickColor,
    activeTickColor: activeTickColor ?? resolvedActiveTrack,
  };
};

// Optimized Single Slider Component
export const Slider = factory<{
  props: SliderProps;
  ref: View;
}>((props, ref) => {
  const {
    value,
    defaultValue = 0,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    size = 'md',
    orientation = 'horizontal',
    containerSize,
    fullWidth = true,
    label,
    valueLabel,
    valueLabelAlwaysOn = false,
    valueLabelPosition,
    valueLabelOffset,
    valueLabelStyle,
    valueLabelProps,
    valueLabelAsCard = true,
    precision,
    ticks,
    showTicks = false,
    restrictToTicks = false,
    trackColor,
    activeTrackColor,
    thumbColor,
    trackSize,
    thumbSize: thumbSizeProp,
    colorScheme = 'primary',
    variant = 'default',
    trackStyle,
    activeTrackStyle,
    thumbStyle,
    tickColor,
    activeTickColor,
    tickStyle,
    activeTickStyle,
    tickLabelProps,
    style,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [currentValue, setCurrentValue] = useControllableState<number>({
    value,
    defaultValue,
    finalValue: min,
    onChange,
  });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<View>(null);
  // Container geometry captured once per drag. Measuring inside the move
  // handler forced a synchronous layout flush on every pointer event (the
  // previous move had already dirtied layout via setCurrentValue), which is
  // what made dragging stutter. Geometry can't change mid-drag anyway.
  const dragMetricsRef = useRef<{ start: number; length: number } | null>(null);

  // Track actual container dimensions when fullWidth is enabled
  const [actualContainerSize, setActualContainerSize] = useState<{ width: number, height: number } | null>(null);

  // Orientation and sizing (restrict size to supported values)
  const resolvedSliderSize = resolveComponentSize(size, SLIDER_SIZE_SCALE, {
    fallback: 'md',
    allowedSizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
  });
  const sliderSize: 'sm' | 'md' | 'lg' = typeof resolvedSliderSize === 'number'
    ? resolvedSliderSize <= 36
      ? 'sm'
      : resolvedSliderSize >= 52
        ? 'lg'
        : 'md'
    : (resolvedSliderSize ?? 'md');
  const orientationProps = getOrientationProps(orientation, containerSize);
  // Apply variant size multiplier to keep thumb visual aligned with the track ends.
  const baseThumbSize = thumbSizeProp ?? SLIDER_CONSTANTS.THUMB_SIZE[sliderSize];
  const thumbSize = Math.max(8, Math.round(baseThumbSize * getVariantThumbSizeMultiplier(variant)));
  const trackHeight = trackSize ?? SLIDER_CONSTANTS.TRACK_HEIGHT[sliderSize];

  // Memoized processed value
  const clampedValue = useSliderValue(currentValue, min, max, step, restrictToTicks, ticks, false) as number;

  // Memoized value label handling
  const defaultValueFormatter = useCallback((val: number) => formatSliderValue(val, step, precision), [step, precision]);

  const resolvedValueLabel = useMemo<((value: number) => string) | null>(() => {
    if (valueLabel === null) return null;
    if (valueLabel) return valueLabel;
    return defaultValueFormatter;
  }, [valueLabel, defaultValueFormatter]);

  const labelConfig = useMemo(() => ({
    shouldShow: !!resolvedValueLabel && (valueLabelAlwaysOn || isDragging || (Platform.OS === 'web' && isHovering)),
    formatter: resolvedValueLabel ?? defaultValueFormatter,
  }), [resolvedValueLabel, valueLabelAlwaysOn, isDragging, isHovering, defaultValueFormatter]);

  const sliderColors = useMemo(() => resolveSliderColors(theme, {
    colorScheme,
    trackColor,
    activeTrackColor,
    thumbColor,
    tickColor,
    activeTickColor,
  }), [theme, colorScheme, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor]);

  // Memoized position calculations
  const positions = useMemo(() => {
    const percentage = sliderUtils.valueToPercentage(clampedValue, min, max);

    // Use actual container size when available (for fullWidth), otherwise use default
    const containerWidth = actualContainerSize?.width ?? orientationProps.containerWidth;
    const containerHeight = actualContainerSize?.height ?? orientationProps.containerHeight;
    const trackLength = (orientationProps.isVertical ? containerHeight : containerWidth) - thumbSize;
    let thumbPosition = (percentage / 100) * trackLength;

    // For vertical sliders, invert the thumb position so higher values appear at the top
    if (orientationProps.isVertical) {
      thumbPosition = trackLength - thumbPosition;
    }

    // Active length represents the progress - for vertical sliders this should extend from bottom to thumb
    const activeLength = (percentage / 100) * trackLength;

    return { percentage, trackLength, thumbPosition, activeLength };
  }, [clampedValue, min, max, orientationProps.containerWidth, orientationProps.containerHeight, orientationProps.isVertical, thumbSize, actualContainerSize]);

  // Memoized tick generation
  const allTicks = useSliderTicks(
    ticks,
    showTicks,
    min,
    max,
    step,
    positions.trackLength
  ).map(tick => ({
    ...tick,
    isActive: tick.value <= clampedValue // Update active state for single slider
  }));

  // Gesture handling
  const { calculateNewValue } = useSliderGesture(min, max, step, restrictToTicks, ticks, disabled);

  // Jump to the value under a touch relative to the container (locationX/locationY
  // are already container-relative). Shared by the tap-to-jump grant and the
  // fallback press handler so pressing anywhere on the rail moves the thumb.
  const commitFromLocation = useCallback((locationX: number, locationY: number) => {
    if (disabled) return;

    const location = orientationProps.isVertical ? locationY : locationX;
    let relativePosition = location - (thumbSize / 2);

    // For vertical sliders, invert the position so top = max value, bottom = min value
    if (orientationProps.isVertical) {
      relativePosition = positions.trackLength - relativePosition;
    }

    const clampedPosition = sliderUtils.clamp(
      relativePosition,
      0,
      positions.trackLength
    );

    const newValue = calculateNewValue(clampedPosition, positions.trackLength);

    // Sanity check: make sure the value is reasonable
    if (newValue >= min && newValue <= max) {
      setCurrentValue(newValue);
    }
  }, [disabled, positions.trackLength, calculateNewValue, setCurrentValue, thumbSize, orientationProps.isVertical, min, max]);

  const handlePress = useCallback((evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    commitFromLocation(locationX, locationY);
  }, [commitFromLocation]);

  // Snapshot container geometry for the drag about to start. `measure` is async
  // on native, so the first move may still land before it resolves — the move
  // handler falls back to location coordinates until then.
  const captureDragMetrics = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.measure((_x, _y, width, height, pageX, pageY) => {
      const start = orientationProps.isVertical ? pageY : pageX;
      const length = orientationProps.isVertical ? height : width;
      if (typeof start !== 'number' || typeof length !== 'number') return;
      dragMetricsRef.current = { start, length };
    });
  }, [orientationProps.isVertical]);

  // Memoized pan responder
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,

    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      captureDragMetrics();
      if (Platform.OS === 'web') {
        document.body.style.userSelect = 'none';
      }

      // Tap-to-jump: move the thumb to wherever the rail was pressed. The pan
      // responder claims the responder on start (overriding the container's own
      // onResponderGrant), so the jump has to happen here for a plain tap to
      // register before any drag movement.
      const { locationX, locationY } = evt.nativeEvent;
      commitFromLocation(locationX, locationY);
    },

    onPanResponderMove: (evt, gestureState) => {
      if (disabled) return;

      // Use moveX/moveY for more reliable touch tracking during drag
      const moveX = gestureState.moveX;
      const moveY = gestureState.moveY;
      const moveCoordinate = orientationProps.isVertical ? moveY : moveX;

      // Fallback to locationX/locationY if move coordinates are unreliable
      const { locationX, locationY } = evt.nativeEvent;
      const locationCoordinate = orientationProps.isVertical ? locationY : locationX;

      // Read the geometry captured on grant instead of re-measuring per move.
      const metrics = dragMetricsRef.current;
      const actualTrackLength = (metrics ? metrics.length : positions.trackLength + thumbSize) - thumbSize;

      let relativePosition: number;
      if (metrics && moveCoordinate > 0) {
        // Primary method: use move coordinate with container position
        relativePosition = moveCoordinate - metrics.start - (thumbSize / 2);
      } else if (locationCoordinate > 0) {
        // Fallback method: use location coordinate directly
        relativePosition = locationCoordinate - (thumbSize / 2);
      } else {
        return;
      }

      // For vertical sliders, invert the position so top = max value, bottom = min value
      if (orientationProps.isVertical) {
        relativePosition = actualTrackLength - relativePosition;
      }

      const clampedPosition = sliderUtils.clamp(relativePosition, 0, actualTrackLength);
      const newValue = calculateNewValue(clampedPosition, actualTrackLength);

      // Sanity check: make sure the value is reasonable
      if (newValue >= min && newValue <= max) {
        setCurrentValue(newValue);
      }
    },

    onPanResponderRelease: () => {
      setIsDragging(false);
      dragMetricsRef.current = null;
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
      }
    },

    onPanResponderTerminate: () => {
      setIsDragging(false);
      dragMetricsRef.current = null;
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
      }
    },
  }), [disabled, positions.trackLength, calculateNewValue, setCurrentValue, thumbSize, orientationProps.isVertical, min, max, commitFromLocation, captureDragMetrics]);

  return (
    <View
      style={[
        { flex: 1 },
        // The container below sizes itself with `width: '100%'`, which resolves
        // against this wrapper. Parents that shrink-to-fit their children
        // (`alignItems: 'center'`, a row, an auto-width Card) leave the wrapper
        // sized to its content, so fullWidth silently degrades to a stub.
        // Stretching here keeps the percentage meaningful.
        fullWidth && orientation === 'horizontal' && { alignSelf: 'stretch', width: '100%' },
        style,
        spacingProps,
      ]}
    >
      {/* Input label */}
      {label && <SliderLabel label={label} />}

      <View
        ref={containerRef}
        style={{
          width: fullWidth && orientation === 'horizontal' ? '100%' : orientationProps.containerWidth,
          height: fullWidth && orientation === 'vertical' ? '100%' : orientationProps.containerHeight,
          justifyContent: 'center',
          position: 'relative',
          // With fullWidth the real container size isn't known until onLayout
          // measures it, so ticks/thumb/active-track are first placed against a
          // default width and would visibly jump into place. Keep the content
          // hidden for that first frame so it pops in already positioned.
          opacity: fullWidth && !actualContainerSize ? 0 : 1,
          ...(Platform.OS === 'web' && orientation === 'vertical' ? { touchAction: 'none' as const } : null),
        }}
        onLayout={(event) => {
          // When fullWidth is enabled, track the actual container dimensions
          if (fullWidth) {
            const { width, height } = event.nativeEvent.layout;
            setActualContainerSize({ width, height });
          } else {
            // Reset to null when not using fullWidth
            setActualContainerSize(null);
          }
        }}
        onStartShouldSetResponder={() => !isDragging} // Only handle press when not dragging
        onResponderGrant={handlePress}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        })}
        {...panResponder.panHandlers}
      >
        {/* Track */}
        <SliderTrack
          disabled={disabled}
          theme={theme}
          size={sliderSize}
          orientation={orientation}
          activeWidth={positions.activeLength}
          trackColor={sliderColors.trackColor}
          activeTrackColor={sliderColors.activeTrackColor}
          trackStyle={trackStyle}
          activeTrackStyle={activeTrackStyle}
          trackHeight={trackHeight}
          thumbSize={thumbSize}
          variant={variant}
        />

        {/* Ticks */}
        <SliderTicks
          ticks={allTicks}
          disabled={disabled}
          theme={theme}
          size={sliderSize}
          orientation={orientation}
          trackHeight={trackHeight}
          thumbSize={thumbSize}
          tickColor={sliderColors.tickColor}
          activeTickColor={sliderColors.activeTickColor}
          tickStyle={tickStyle}
          activeTickStyle={activeTickStyle}
          tickLabelProps={tickLabelProps}
        />

        {/* Thumb */}
        <SliderThumb
          position={positions.thumbPosition}
          disabled={disabled}
          theme={theme}
          size={sliderSize}
          orientation={orientation}
          isDragging={isDragging}
          thumbColor={sliderColors.thumbColor}
          thumbStyle={thumbStyle}
          thumbSize={thumbSize}
          variant={variant}
        />

        {/* Value label */}
        {labelConfig.shouldShow && (
          <SliderValueLabel
            value={labelConfig.formatter(clampedValue)}
            position={positions.thumbPosition}
            size={sliderSize}
            orientation={orientation}
            isCard={valueLabelAsCard}
            thumbSize={thumbSize}
            placement={valueLabelPosition}
            offset={valueLabelOffset}
            containerStyle={valueLabelStyle}
            textProps={valueLabelProps}
          />
        )}
      </View>
    </View>
  );
});

// Optimized Range Slider Component
export const RangeSlider = factory<{
  props: RangeSliderProps;
  ref: View;
}>((props, ref) => {
  const {
    value = [0, 100],
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    size = 'md',
    orientation = 'horizontal',
    containerSize,
    fullWidth = true,
    label,
    valueLabel,
    valueLabelAlwaysOn = false,
    valueLabelPosition,
    valueLabelOffset,
    valueLabelStyle,
    valueLabelProps,
    valueLabelAsCard = true,
    precision,
    ticks,
    showTicks = false,
    restrictToTicks = false,
    pushOnOverlap = true,
    trackColor,
    activeTrackColor,
    thumbColor,
    trackSize,
    thumbSize: thumbSizeProp,
    colorScheme = 'primary',
    variant = 'default',
    trackStyle,
    activeTrackStyle,
    thumbStyle,
    tickColor,
    activeTickColor,
    tickStyle,
    activeTickStyle,
    tickLabelProps,
    style,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const [dragState, setDragState] = useState<{ thumb: 'min' | 'max' | null }>({ thumb: null });
  const [isHovering, setIsHovering] = useState(false);
  const rangeContainerRef = useRef<View>(null);
  // Captured once per drag — see the note on the single Slider's dragMetricsRef.
  const rangeDragMetricsRef = useRef<{ start: number; length: number } | null>(null);

  // Track actual container dimensions when fullWidth is enabled
  const [actualRangeContainerSize, setActualRangeContainerSize] = useState<{ width: number, height: number } | null>(null);

  // Orientation and sizing (restrict size to supported values)
  const rangeResolvedSliderSize = resolveComponentSize(size, SLIDER_SIZE_SCALE, {
    fallback: 'md',
    allowedSizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
  });
  const sliderSize: 'sm' | 'md' | 'lg' = typeof rangeResolvedSliderSize === 'number'
    ? rangeResolvedSliderSize <= 36
      ? 'sm'
      : rangeResolvedSliderSize >= 52
        ? 'lg'
        : 'md'
    : (rangeResolvedSliderSize ?? 'md');
  const orientationProps = getOrientationProps(orientation, containerSize);
  const baseThumbSize = thumbSizeProp ?? SLIDER_CONSTANTS.THUMB_SIZE[sliderSize];
  const thumbSize = Math.max(8, Math.round(baseThumbSize * getVariantThumbSizeMultiplier(variant)));
  const trackHeight = trackSize ?? SLIDER_CONSTANTS.TRACK_HEIGHT[sliderSize];
  const containerRef = useRef<View>(null);

  const sliderColors = useMemo(() => resolveSliderColors(theme, {
    colorScheme,
    trackColor,
    activeTrackColor,
    thumbColor,
    tickColor,
    activeTickColor,
  }), [theme, colorScheme, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor]);

  // Memoized processed values
  const [minValue, maxValue] = useSliderValue(value, min, max, step, restrictToTicks, ticks, true) as [number, number];

  // Memoized backward compatibility handling
  const defaultRangeFormatter = useCallback((val: number, _index?: number) => formatSliderValue(val, step, precision), [step, precision]);

  const resolvedValueLabel = useMemo<((value: number, index: number) => string) | null>(() => {
    if (valueLabel === null) return null;
    if (valueLabel) return valueLabel;
    return defaultRangeFormatter;
  }, [valueLabel, defaultRangeFormatter]);

  const labelConfig = useMemo(() => ({
    shouldShow: !!resolvedValueLabel && (valueLabelAlwaysOn || dragState.thumb !== null || (Platform.OS === 'web' && isHovering)),
    formatter: resolvedValueLabel ?? defaultRangeFormatter,
  }), [resolvedValueLabel, valueLabelAlwaysOn, dragState.thumb, isHovering, defaultRangeFormatter]);


  // Memoized position calculations
  const positions = useMemo(() => {
    // Use actual container size when available (for fullWidth), otherwise use default
    const containerWidth = actualRangeContainerSize?.width ?? orientationProps.containerWidth;
    const containerHeight = actualRangeContainerSize?.height ?? orientationProps.containerHeight;
    const trackLength = (orientationProps.isVertical ? containerHeight : containerWidth) - thumbSize;
    const minPercentage = sliderUtils.valueToPercentage(minValue, min, max);
    const maxPercentage = sliderUtils.valueToPercentage(maxValue, min, max);
    let minThumbPosition = (minPercentage / 100) * trackLength;
    let maxThumbPosition = (maxPercentage / 100) * trackLength;

    // For vertical sliders, invert the thumb positions so higher values appear at the top
    if (orientationProps.isVertical) {
      minThumbPosition = trackLength - minThumbPosition;
      maxThumbPosition = trackLength - maxThumbPosition;
    }

    // Calculate active area - it should span between the two thumb positions
    const startPosition = Math.min(minThumbPosition, maxThumbPosition);
    const endPosition = Math.max(minThumbPosition, maxThumbPosition);
    const activeLength = Math.abs(endPosition - startPosition);

    return {
      trackLength,
      minThumbPosition,
      maxThumbPosition,
      activeWidth: activeLength,
      activeLeft: thumbSize / 2 + startPosition,
    };
  }, [minValue, maxValue, min, max, orientationProps.containerWidth, orientationProps.containerHeight, orientationProps.isVertical, thumbSize, actualRangeContainerSize]);

  // Memoized tick generation
  const allTicks = useSliderTicks(
    ticks,
    showTicks,
    min,
    max,
    step,
    positions.trackLength,
    true,
    [minValue, maxValue]
  );

  // Gesture handling
  const { calculateNewValue } = useSliderGesture(min, max, step, restrictToTicks, ticks, disabled);

  const handleTrackPress = useCallback((evt: any) => {
    if (disabled || dragState.thumb) return;

    const { locationX, locationY } = evt.nativeEvent;
    const location = orientationProps.isVertical ? locationY : locationX;
    let clickPosition = location - (thumbSize / 2);

    // For vertical sliders, invert the position so top = max value, bottom = min value
    if (orientationProps.isVertical) {
      clickPosition = positions.trackLength - clickPosition;
    }

    const clampedPosition = sliderUtils.clamp(
      clickPosition,
      0,
      positions.trackLength
    );
    const clickValue = calculateNewValue(clampedPosition, positions.trackLength);

    // Sanity check: make sure the value is reasonable
    if (clickValue < min || clickValue > max) return;

    // Determine which thumb to move based on distance
    const distanceToMin = Math.abs(clickValue - minValue);
    const distanceToMax = Math.abs(clickValue - maxValue);

    if (distanceToMin <= distanceToMax) {
      const newMinValue = Math.min(clickValue, maxValue);
      onChange?.([newMinValue, maxValue]);
    } else {
      const newMaxValue = Math.max(clickValue, minValue);
      onChange?.([minValue, newMaxValue]);
    }
  }, [disabled, dragState.thumb, positions.trackLength, calculateNewValue, minValue, maxValue, onChange, thumbSize, orientationProps.isVertical, min, max]);

  const captureRangeDragMetrics = useCallback(() => {
    if (!rangeContainerRef.current) return;
    rangeContainerRef.current.measure((_x, _y, width, height, pageX, pageY) => {
      const start = orientationProps.isVertical ? pageY : pageX;
      const length = orientationProps.isVertical ? height : width;
      if (typeof start !== 'number' || typeof length !== 'number') return;
      rangeDragMetricsRef.current = { start, length };
    });
  }, [orientationProps.isVertical]);

  // Memoized pan responder factory
  const createThumbPanResponder = useCallback((thumbType: 'min' | 'max') => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: () => {
        setDragState({ thumb: thumbType });
        captureRangeDragMetrics();
        if (Platform.OS === 'web') {
          document.body.style.userSelect = 'none';
        }
        return true;
      },

      onPanResponderMove: (evt, gestureState) => {
        if (disabled) return;

        const moveX = gestureState.moveX;
        const moveY = gestureState.moveY;
        const moveCoordinate = orientationProps.isVertical ? moveY : moveX;
        const { locationX, locationY } = evt.nativeEvent;
        const locationCoordinate = orientationProps.isVertical ? locationY : locationX;

        // Read the geometry captured on grant instead of re-measuring per move.
        const metrics = rangeDragMetricsRef.current;
        const actualTrackLength = (metrics ? metrics.length : positions.trackLength + thumbSize) - thumbSize;

        let relativePosition: number;
        if (metrics && moveCoordinate > 0) {
          // Primary method: use move coordinate with container position
          relativePosition = moveCoordinate - metrics.start - (thumbSize / 2);
        } else if (locationCoordinate > 0) {
          // Fallback method: use location coordinate directly
          relativePosition = locationCoordinate - (thumbSize / 2);
        } else {
          return;
        }

        // For vertical sliders, invert the position so top = max value, bottom = min value
        if (orientationProps.isVertical) {
          relativePosition = actualTrackLength - relativePosition;
        }

        const newPosition = sliderUtils.clamp(relativePosition, 0, actualTrackLength);
        const newValue = calculateNewValue(newPosition, actualTrackLength);

        if (thumbType === 'min') {
          let clampedValue = newValue;

          if (pushOnOverlap) {
            // Default behavior: prevent overlap by clamping to max value
            clampedValue = Math.min(newValue, maxValue);
          } else {
            // Allow crossing: min thumb can go beyond max value
            // If min thumb moves beyond max, update both values
            if (clampedValue > maxValue) {
              // Sanity check
              if (clampedValue >= min && clampedValue <= max && maxValue >= min && maxValue <= max) {
                onChange?.([maxValue, clampedValue]);
              }
              return;
            }
          }

          // Sanity check
          if (clampedValue >= min && clampedValue <= max) {
            onChange?.([clampedValue, maxValue]);
          }
        } else {
          let clampedValue = newValue;

          if (pushOnOverlap) {
            // Default behavior: prevent overlap by clamping to min value
            clampedValue = Math.max(newValue, minValue);
          } else {
            // Allow crossing: max thumb can go below min value
            // If max thumb moves below min, update both values
            if (clampedValue < minValue) {
              // Sanity check
              if (clampedValue >= min && clampedValue <= max && minValue >= min && minValue <= max) {
                onChange?.([clampedValue, minValue]);
              }
              return;
            }
          }

          // Sanity check
          if (clampedValue >= min && clampedValue <= max) {
            onChange?.([minValue, clampedValue]);
          }
        }
      },

      onPanResponderRelease: () => {
        setDragState({ thumb: null });
        rangeDragMetricsRef.current = null;
        if (Platform.OS === 'web') {
          document.body.style.userSelect = '';
        }
      },

      onPanResponderTerminate: () => {
        setDragState({ thumb: null });
        rangeDragMetricsRef.current = null;
        if (Platform.OS === 'web') {
          document.body.style.userSelect = '';
        }
      },
    });
  }, [disabled, positions.trackLength, calculateNewValue, minValue, maxValue, onChange, thumbSize, orientationProps.isVertical, min, max, pushOnOverlap, captureRangeDragMetrics]);

  const minThumbPanResponder = useMemo(() => createThumbPanResponder('min'), [createThumbPanResponder]);
  const maxThumbPanResponder = useMemo(() => createThumbPanResponder('max'), [createThumbPanResponder]);

  const valueLabelSpacing = resolvedValueLabel ? 24 : 0;
  const containerSpacingStyle = orientationProps.isVertical
    ? { marginRight: valueLabelSpacing }
    : { marginBottom: valueLabelSpacing };

  return (
    <View
      style={[
        containerSpacingStyle,
        // Same shrink-to-fit guard as the single Slider — see the note there.
        fullWidth && orientation === 'horizontal' && { alignSelf: 'stretch', width: '100%' },
        style,
        spacingProps,
      ]}
    >
      {/* Input label */}
      {label && <SliderLabel label={label} />}

      <View
        ref={rangeContainerRef}
        style={{
          width: fullWidth && orientation === 'horizontal' ? '100%' : orientationProps.containerWidth,
          height: fullWidth && orientation === 'vertical' ? '100%' : orientationProps.containerHeight,
          justifyContent: 'center',
          position: 'relative',
          // See the single-slider note: hide until measured so fullWidth ticks
          // and thumbs pop in already positioned instead of jumping.
          opacity: fullWidth && !actualRangeContainerSize ? 0 : 1,
          ...(Platform.OS === 'web' && orientation === 'vertical' ? { touchAction: 'none' as const } : null),
        }}
        onLayout={(event) => {
          // When fullWidth is enabled, track the actual container dimensions
          if (fullWidth) {
            const { width, height } = event.nativeEvent.layout;
            setActualRangeContainerSize({ width, height });
          } else {
            // Reset to null when not using fullWidth
            setActualRangeContainerSize(null);
          }
        }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTrackPress}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        })}
        collapsable={false}
      >
        {/* Track */}
        <SliderTrack
          disabled={disabled}
          theme={theme}
          size={sliderSize}
          orientation={orientation}
          activeWidth={positions.activeWidth}
          activeLeft={positions.activeLeft}
          isRange={true}
          trackColor={sliderColors.trackColor}
          activeTrackColor={sliderColors.activeTrackColor}
          trackStyle={trackStyle}
          activeTrackStyle={activeTrackStyle}
          trackHeight={trackHeight}
          thumbSize={thumbSize}
          variant={variant}
        />

        {/* Ticks */}
        <SliderTicks
          ticks={allTicks}
          disabled={disabled}
          theme={theme}
          size={sliderSize}
          orientation={orientation}
          keyPrefix="range-tick"
          trackHeight={trackHeight}
          thumbSize={thumbSize}
          tickColor={sliderColors.tickColor}
          activeTickColor={sliderColors.activeTickColor}
          tickStyle={tickStyle}
          activeTickStyle={activeTickStyle}
          tickLabelProps={tickLabelProps}
        />

        {/* Min Thumb */}
        <SliderThumb
          position={positions.minThumbPosition}
          disabled={disabled}
          theme={theme}
          size={sliderSize}
          orientation={orientation}
          isDragging={dragState.thumb === 'min'}
          zIndex={dragState.thumb === 'min' ? 10 : 1}
          panHandlers={minThumbPanResponder.panHandlers}
          thumbColor={sliderColors.thumbColor}
          thumbStyle={thumbStyle}
          thumbSize={thumbSize}
          variant={variant}
        />

        {/* Max Thumb */}
        <SliderThumb
          position={positions.maxThumbPosition}
          disabled={disabled}
          theme={theme}
          size={sliderSize}
          orientation={orientation}
          isDragging={dragState.thumb === 'max'}
          zIndex={dragState.thumb === 'max' ? 10 : 2}
          panHandlers={maxThumbPanResponder.panHandlers}
          thumbColor={sliderColors.thumbColor}
          thumbStyle={thumbStyle}
          thumbSize={thumbSize}
          variant={variant}
        />

        {/* Value labels */}
        {labelConfig.shouldShow && (
          <>
            <SliderValueLabel
              value={labelConfig.formatter(minValue, 0)}
              position={positions.minThumbPosition}
              size={sliderSize}
              orientation={orientation}
              isCard={valueLabelAsCard}
              thumbSize={thumbSize}
              placement={valueLabelPosition}
              offset={valueLabelOffset}
              containerStyle={valueLabelStyle}
              textProps={valueLabelProps}
            />
            <SliderValueLabel
              value={labelConfig.formatter(maxValue, 1)}
              position={positions.maxThumbPosition}
              size={sliderSize}
              orientation={orientation}
              isCard={valueLabelAsCard}
              thumbSize={thumbSize}
              placement={valueLabelPosition}
              offset={valueLabelOffset}
              containerStyle={valueLabelStyle}
              textProps={valueLabelProps}
            />
          </>
        )}
      </View>
    </View>
  );
});