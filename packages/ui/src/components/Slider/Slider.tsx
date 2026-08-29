import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from '../../core/theme';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useDragGesture } from '../../core/gestures';
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

const resolveSliderColors = (
  theme: ReturnType<typeof useTheme>,
  {
    color,
    trackColor,
    activeTrackColor,
    thumbColor,
    tickColor,
    activeTickColor,
  }: Pick<SliderProps, 'color' | 'trackColor' | 'activeTrackColor' | 'thumbColor' | 'tickColor' | 'activeTickColor'>
) => {
  const schemeColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];

  // The slot overrides take the same vocabulary as `color`; they used to be
  // passed through raw, so `trackColor="gray.2"` reached the style as a literal.
  const slot = (value?: string) => resolveAccentColor(theme, value);

  const resolvedActiveTrack = slot(activeTrackColor) ?? schemeColor;
  const defaultTrackColor = theme.colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[3];
  const defaultTickColor = theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[4];

  return {
    trackColor: slot(trackColor) ?? defaultTrackColor,
    activeTrackColor: resolvedActiveTrack,
    thumbColor: slot(thumbColor) ?? resolvedActiveTrack,
    tickColor: slot(tickColor) ?? defaultTickColor,
    activeTickColor: slot(activeTickColor) ?? resolvedActiveTrack,
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
    color,

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
  const [currentValue, setCurrentValue] = useControllableState<number>({
    value,
    defaultValue,
    finalValue: min,
    onChange,
  });
  const [isHovering, setIsHovering] = useState(false);

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


  const sliderColors = useMemo(() => resolveSliderColors(theme, {
    color,
    trackColor,
    activeTrackColor,
    thumbColor,
    tickColor,
    activeTickColor,
  }), [theme, color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor]);

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

  /**
   * Maps a point in the rail's own coordinate space onto a value.
   *
   * `useDragGesture` measures the rail once per gesture and derives every
   * sample from page coordinates, so this stays correct after the finger leaves
   * the control — which is what the previous moveX/locationX pair could not do.
   * The measured box is `0` until the first layout lands, so a press that beats
   * `onLayout` falls back to the configured container size.
   */
  const commitFromSurfacePoint = useCallback((
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (disabled) return;

    const isVertical = orientationProps.isVertical;
    const measured = isVertical ? height : width;
    const containerLength = measured > 0
      ? measured
      : (isVertical ? orientationProps.containerHeight : orientationProps.containerWidth);
    const trackLength = Math.max(1, containerLength - thumbSize);

    let relativePosition = (isVertical ? y : x) - (thumbSize / 2);
    // Vertical rails run max-at-the-top, so screen Y has to be flipped.
    if (isVertical) relativePosition = trackLength - relativePosition;

    const newValue = calculateNewValue(
      sliderUtils.clamp(relativePosition, 0, trackLength),
      trackLength
    );

    if (newValue >= min && newValue <= max) {
      setCurrentValue(newValue);
    }
  }, [
    disabled,
    calculateNewValue,
    setCurrentValue,
    thumbSize,
    orientationProps.isVertical,
    orientationProps.containerHeight,
    orientationProps.containerWidth,
    min,
    max,
  ]);

  const drag = useDragGesture({
    enabled: !disabled,
    // `both` (touch-action: none on web) rather than the rail's own axis: a drag
    // that drifts off-axis must keep the value, not hand the touch back to the
    // page mid-gesture.
    axis: 'both',
    cursor: disabled ? 'default' : 'pointer',
    activeCursor: 'grabbing',
    // Pressing the rail jumps the thumb there, then the same press keeps dragging.
    onStart: (point) => commitFromSurfacePoint(point.x, point.y, point.width, point.height),
    onMove: (point) => commitFromSurfacePoint(point.x, point.y, point.width, point.height),
  });

  const isDragging = drag.isDragging;

  const labelConfig = useMemo(() => ({
    shouldShow: !!resolvedValueLabel && (valueLabelAlwaysOn || isDragging || (Platform.OS === 'web' && isHovering)),
    formatter: resolvedValueLabel ?? defaultValueFormatter,
  }), [resolvedValueLabel, valueLabelAlwaysOn, isDragging, isHovering, defaultValueFormatter]);


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
        ref={drag.ref}
        style={[
          {
            width: fullWidth && orientation === 'horizontal' ? '100%' : orientationProps.containerWidth,
            height: fullWidth && orientation === 'vertical' ? '100%' : orientationProps.containerHeight,
            justifyContent: 'center',
            position: 'relative',
            // With fullWidth the real container size isn't known until onLayout
            // measures it, so ticks/thumb/active-track are first placed against a
            // default width and would visibly jump into place. Keep the content
            // hidden for that first frame so it pops in already positioned.
            opacity: fullWidth && !actualContainerSize ? 0 : 1,
          },
          // touch-action / selection / cursor — see core/gestures.
          drag.surfaceStyle,
        ]}
        onLayout={(event) => {
          drag.onLayout(event);
          // When fullWidth is enabled, track the actual container dimensions
          if (fullWidth) {
            const { width, height } = event.nativeEvent.layout;
            setActualContainerSize({ width, height });
          } else {
            // Reset to null when not using fullWidth
            setActualContainerSize(null);
          }
        }}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        })}
        {...drag.panHandlers}
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
    color,

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
  // Which thumb the in-flight gesture owns. Chosen once on grant and held for
  // the whole drag, so a thumb dragged past its sibling keeps following the
  // finger instead of the gesture jumping to whichever is now nearer.
  const activeThumbRef = useRef<'min' | 'max' | null>(null);

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

  const sliderColors = useMemo(() => resolveSliderColors(theme, {
    color,
    trackColor,
    activeTrackColor,
    thumbColor,
    tickColor,
    activeTickColor,
  }), [theme, color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor]);

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

  /** Value under a point expressed in the rail's own coordinate space. */
  const valueFromSurfacePoint = useCallback((
    x: number,
    y: number,
    width: number,
    height: number
  ): number => {
    const isVertical = orientationProps.isVertical;
    const measured = isVertical ? height : width;
    const containerLength = measured > 0
      ? measured
      : (isVertical ? orientationProps.containerHeight : orientationProps.containerWidth);
    const trackLength = Math.max(1, containerLength - thumbSize);

    let relativePosition = (isVertical ? y : x) - (thumbSize / 2);
    if (isVertical) relativePosition = trackLength - relativePosition;

    return calculateNewValue(
      sliderUtils.clamp(relativePosition, 0, trackLength),
      trackLength
    );
  }, [
    calculateNewValue,
    thumbSize,
    orientationProps.isVertical,
    orientationProps.containerHeight,
    orientationProps.containerWidth,
  ]);

  /** Applies a value to whichever thumb the gesture owns, honouring `pushOnOverlap`. */
  const commitThumbValue = useCallback((thumb: 'min' | 'max', nextValue: number) => {
    if (nextValue < min || nextValue > max) return;

    if (thumb === 'min') {
      if (pushOnOverlap) {
        onChange?.([Math.min(nextValue, maxValue), maxValue]);
        return;
      }
      // Crossing allowed: the pair stays sorted, so the thumb the user is
      // dragging becomes the max once it passes its sibling.
      if (nextValue > maxValue) {
        onChange?.([maxValue, nextValue]);
        return;
      }
      onChange?.([nextValue, maxValue]);
      return;
    }

    if (pushOnOverlap) {
      onChange?.([minValue, Math.max(nextValue, minValue)]);
      return;
    }
    if (nextValue < minValue) {
      onChange?.([nextValue, minValue]);
      return;
    }
    onChange?.([minValue, nextValue]);
  }, [min, max, minValue, maxValue, onChange, pushOnOverlap]);

  const drag = useDragGesture({
    enabled: !disabled,
    axis: 'both',
    cursor: disabled ? 'default' : 'pointer',
    activeCursor: 'grabbing',
    onStart: (point) => {
      const pressValue = valueFromSurfacePoint(point.x, point.y, point.width, point.height);
      const distanceToMin = Math.abs(pressValue - minValue);
      const distanceToMax = Math.abs(pressValue - maxValue);
      // On a tie — both thumbs stacked, or a press exactly between them — the
      // side of the press decides, so a stacked pair can always be pulled apart.
      const thumb: 'min' | 'max' = distanceToMin === distanceToMax
        ? (pressValue >= maxValue ? 'max' : 'min')
        : (distanceToMin < distanceToMax ? 'min' : 'max');

      activeThumbRef.current = thumb;
      setDragState({ thumb });
      commitThumbValue(thumb, pressValue);
    },
    onMove: (point) => {
      const thumb = activeThumbRef.current;
      if (!thumb) return;
      commitThumbValue(thumb, valueFromSurfacePoint(point.x, point.y, point.width, point.height));
    },
    onEnd: () => {
      activeThumbRef.current = null;
      setDragState({ thumb: null });
    },
    onCancel: () => {
      activeThumbRef.current = null;
      setDragState({ thumb: null });
    },
  });

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
        ref={drag.ref}
        style={[
          {
            width: fullWidth && orientation === 'horizontal' ? '100%' : orientationProps.containerWidth,
            height: fullWidth && orientation === 'vertical' ? '100%' : orientationProps.containerHeight,
            justifyContent: 'center',
            position: 'relative',
            // See the single-slider note: hide until measured so fullWidth ticks
            // and thumbs pop in already positioned instead of jumping.
            opacity: fullWidth && !actualRangeContainerSize ? 0 : 1,
          },
          drag.surfaceStyle,
        ]}
        onLayout={(event) => {
          drag.onLayout(event);
          // When fullWidth is enabled, track the actual container dimensions
          if (fullWidth) {
            const { width, height } = event.nativeEvent.layout;
            setActualRangeContainerSize({ width, height });
          } else {
            // Reset to null when not using fullWidth
            setActualRangeContainerSize(null);
          }
        }}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        })}
        collapsable={false}
        {...drag.panHandlers}
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