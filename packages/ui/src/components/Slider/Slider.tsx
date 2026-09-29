import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native';

import type { A11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { useAdjustable, type AdjustableProps } from '../../core/accessibility/useAdjustable';
import { factory } from '../../core/factory';
import type { DragPoint } from '../../core/gestures/types';
import { useDragGesture } from '../../core/gestures/useDragGesture';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { getLayoutStyles } from '../../core/utils/layout';
import { warnOnce } from '../../core/utils/logger';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { useHover } from '../../hooks/useHover/useHover';
import { Disclaimer } from '../_internal/Disclaimer/Disclaimer';
import { Field } from '../_internal/Field/Field';
import type { FieldRenderProps } from '../_internal/Field/Field';
import {
  SliderThumb,
  SliderTicks,
  SliderTrack,
  SliderValueLabel,
  adjacentTickValue,
  getOrientationProps,
  getSliderMetrics,
  sliderUtils,
  useSliderTicks,
  useSliderValueConstraint,
} from './SliderCore';
import type { RangeSliderProps, SliderBaseProps, SliderProps, SliderTick } from './types';

/** Decimal places implied by a step (0.01 → 2, 1 → 0), so the default label shows fractional steps. */
const decimalsFromStep = (step: number): number => {
  if (!Number.isFinite(step)) return 0;
  const text = String(step);
  if (text.includes('e-')) return Math.min(6, parseInt(text.split('e-')[1], 10) || 0);
  const fraction = text.split('.')[1];
  return fraction ? Math.min(6, fraction.length) : 0;
};

/** Label text for a value: explicit `precision`, else the step's precision; trailing zeros trimmed. */
const formatSliderValue = (value: number, step: number, precision?: number): string => {
  const decimals = precision != null ? precision : decimalsFromStep(step);
  if (decimals <= 0) return Math.round(value).toString();
  return Number(value.toFixed(decimals)).toString();
};

type SliderColorProps = Pick<
  SliderBaseProps,
  'color' | 'trackColor' | 'activeTrackColor' | 'thumbColor' | 'tickColor' | 'activeTickColor'
>;

/** Slot colors: each override takes the same vocabulary as `color`. */
const resolveSliderColors = (theme: PlatformBlocksTheme, colors: SliderColorProps) => {
  const slot = (value?: string) => resolveAccentColor(theme, value);
  const accent = slot(colors.color) ?? theme.colors.primary[5];
  const activeTrack = slot(colors.activeTrackColor) ?? accent;
  return {
    // The inactive track must stay visible on the surface in both schemes.
    trackColor: slot(colors.trackColor) ?? theme.backgrounds.borderStrong,
    activeTrackColor: activeTrack,
    thumbColor: slot(colors.thumbColor) ?? activeTrack,
    tickColor: slot(colors.tickColor) ?? theme.text.muted,
    activeTickColor: slot(colors.activeTickColor) ?? activeTrack,
  };
};

/** Adds labelled min / max marks (`showMarks`) to the tick list. */
const withEndMarks = (
  ticks: SliderTick[] | undefined,
  showMarks: boolean,
  min: number,
  max: number,
  format: (value: number) => string
): SliderTick[] | undefined => {
  if (!showMarks) return ticks;
  const list = [...(ticks ?? [])];
  for (const end of [min, max]) {
    const index = list.findIndex((tick) => tick.value === end);
    if (index === -1) list.push({ value: end, label: format(end) });
    else if (!list[index].label) list[index] = { ...list[index], label: format(end) };
  }
  return list.sort((a, b) => a.value - b.value);
};

interface TrackGeometryOptions {
  orientation: 'horizontal' | 'vertical';
  containerSize?: number;
  fullWidth: boolean;
  thumbSize: number;
  inverted: boolean;
  isRTL: boolean;
  min: number;
  max: number;
}

/**
 * Maps values to thumb offsets and pointer points to values.
 *
 * Offsets are measured from the track's *start* edge (the left in LTR, the
 * right in RTL, the top when vertical) and everything is laid out with logical
 * `start` insets, so a horizontal slider mirrors under RTL on both platforms.
 * Vertical sliders put the maximum at the top; `inverted` reverses either axis.
 */
function useTrackGeometry({ orientation, containerSize, fullWidth, thumbSize, inverted, isRTL, min, max }: TrackGeometryOptions) {
  const vertical = orientation === 'vertical';
  const fallback = getOrientationProps(orientation, containerSize);
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null);
  const width = (fullWidth && measured?.width) || fallback.containerWidth;
  const height = (fullWidth && measured?.height) || fallback.containerHeight;
  const trackLength = Math.max(1, (vertical ? height : width) - thumbSize);
  // Offsets grow from the start edge; "reversed" means the maximum sits there.
  const reversed = vertical !== inverted;

  const valueToOffset = useCallback(
    (value: number) => {
      const ratio = sliderUtils.valueToPercentage(sliderUtils.clamp(value, min, max), min, max) / 100;
      return (reversed ? 1 - ratio : ratio) * trackLength;
    },
    [min, max, reversed, trackLength]
  );

  /** Raw (unsnapped) value under a point in the surface's own coordinates. */
  const pointToValue = useCallback(
    (point: DragPoint) => {
      const measuredLength = vertical ? point.height : point.width;
      const length = Math.max(1, (measuredLength > 0 ? measuredLength : vertical ? height : width) - thumbSize);
      // Pointer coordinates are physical; RTL runs a horizontal track right-to-left.
      const along = vertical ? point.y : isRTL ? (point.width > 0 ? point.width : width) - point.x : point.x;
      const offset = sliderUtils.clamp(along - thumbSize / 2, 0, length);
      const ratio = offset / length;
      return sliderUtils.percentageToValue((reversed ? 1 - ratio : ratio) * 100, min, max);
    },
    [vertical, height, width, thumbSize, isRTL, reversed, min, max]
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!fullWidth) return;
      const { width: w, height: h } = event.nativeEvent.layout;
      setMeasured((current) => (current && current.width === w && current.height === h ? current : { width: w, height: h }));
    },
    [fullWidth]
  );

  return { vertical, trackLength, valueToOffset, pointToValue, onLayout, containerWidth: fallback.containerWidth, containerHeight: fallback.containerHeight };
}

/** Whether the value bubble shows: `tooltip` / `valueLabelAlwaysOn`, else while dragged, hovered or focused. */
const shouldShowValueLabel = (
  enabled: boolean,
  tooltip: SliderBaseProps['tooltip'],
  alwaysOn: boolean,
  interacting: boolean
) => enabled && (alwaysOn || tooltip === 'always' || (tooltip !== 'never' && interacting));

/** The adjustable props for a thumb, combined with the field wiring. */
const thumbA11y = (field: A11yProps, adjustable: AdjustableProps): AdjustableProps => ({ ...field, ...adjustable });

/** Container style for the drag surface. */
const surfaceStyle = (fullWidth: boolean, vertical: boolean, width: number, height: number): ViewStyle => ({
  width: fullWidth && !vertical ? '100%' : width,
  height: fullWidth && vertical ? '100%' : height,
  justifyContent: 'center',
  position: 'relative',
});

/**
 * A single-value slider. The thumb is the control: `role="slider"` (native:
 * adjustable) with aria-value*, named by the field label, with arrow /
 * PageUp / PageDown / Home / End keys and increment/decrement actions. Pressing
 * the track jumps there and keeps dragging.
 */
export const Slider = factory<{ props: SliderProps; ref: View }>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    disabled = false,
    readOnly = false,
    size = 'md',
    orientation = 'horizontal',
    inverted = false,
    containerSize,
    fullWidth = true,
    label,
    description,
    error,
    helperText,
    required = false,
    withAsterisk,
    labelProps,
    descriptionProps,
    accessibilityLabel,
    accessibilityHint,
    valueLabel,
    valueLabelAlwaysOn = false,
    tooltip = 'hover',
    valueLabelPosition,
    valueLabelOffset,
    valueLabelStyle,
    valueLabelProps,
    valueLabelAsCard = true,
    precision,
    ticks,
    showTicks = false,
    showMarks = false,
    restrictToTicks = false,
    trackSize,
    thumbSize: thumbSizeProp,
    variant = 'default',
    trackStyle,
    activeTrackStyle,
    thumbStyle,
    tickStyle,
    activeTickStyle,
    tickLabelProps,
    onFocus,
    onBlur,
    style,
    testID,
    id,
    disclaimer,
    disclaimerProps,
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const spacingStyles = useStyleProps(props);
  const layoutStyles = getLayoutStyles(props);
  const locked = disabled || readOnly;

  const [currentValue, setCurrentValue] = useControllableState<number>({
    value,
    defaultValue,
    finalValue: min,
    onChange,
  });

  const defaultFormatter = useCallback((next: number) => formatSliderValue(next, step, precision), [step, precision]);
  const formatter = valueLabel ?? defaultFormatter;
  const markTicks = useMemo(
    () => withEndMarks(ticks, showMarks, min, max, formatter),
    [ticks, showMarks, min, max, formatter]
  );
  const constrain = useSliderValueConstraint(min, max, step, restrictToTicks, markTicks);
  const clampedValue = constrain(currentValue);

  // Latest committed value, so drag samples and key repeats between renders build on each other.
  const valueRef = useRef(clampedValue);
  valueRef.current = clampedValue;
  const emitChangeEnd = useLatestCallback(onChangeEnd);

  const apply = useCallback(
    (next: number) => {
      if (locked) return;
      const constrained = constrain(next);
      if (constrained === valueRef.current) return;
      valueRef.current = constrained;
      setCurrentValue(constrained);
    },
    [locked, constrain, setCurrentValue]
  );

  const { thumbSize, trackHeight } = getSliderMetrics(theme, size, variant, thumbSizeProp, trackSize);
  const geometry = useTrackGeometry({ orientation, containerSize, fullWidth, thumbSize, inverted, isRTL, min, max });
  const thumbOffset = geometry.valueToOffset(clampedValue);
  const minEndOffset = geometry.valueToOffset(min);

  const { color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor } = props;
  const colors = useMemo(
    () => resolveSliderColors(theme, { color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor }),
    [theme, color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor]
  );

  const isTickActive = useCallback((tickValue: number) => tickValue <= clampedValue, [clampedValue]);
  const allTicks = useSliderTicks(markTicks, showTicks, min, max, step, geometry.valueToOffset, isTickActive);

  const drag = useDragGesture({
    enabled: !locked,
    // `both` (touch-action: none on web): a drag that drifts off-axis must keep
    // the value, not hand the touch back to the page mid-gesture.
    axis: 'both',
    cursor: locked ? 'default' : 'pointer',
    activeCursor: 'grabbing',
    // Pressing the track jumps the thumb there, then the same press keeps dragging.
    onStart: (point) => apply(geometry.pointToValue(point)),
    onMove: (point) => apply(geometry.pointToValue(point)),
    onEnd: () => emitChangeEnd(valueRef.current),
    onCancel: () => emitChangeEnd(valueRef.current),
  });
  const surfaceRef = useMergedRef(drag.ref, ref);
  const [hovered, hover] = useHover();
  const [focused, setFocused] = useState(false);

  const sortedTicks = useMemo(() => (markTicks ? [...markTicks].sort((a, b) => a.value - b.value) : []), [markTicks]);
  const snapsToTicks = restrictToTicks && sortedTicks.length > 0;

  const { adjustableProps } = useAdjustable({
    value: clampedValue,
    min,
    max,
    step,
    largeStep,
    onChange: apply,
    onChangeEnd: () => emitChangeEnd(valueRef.current),
    valueText: formatter,
    orientation,
    disabled,
    readOnly,
    // A reversed horizontal track runs the other way: swap the arrows like RTL does.
    rtl: isRTL !== (inverted && orientation === 'horizontal'),
    getNextValue: snapsToTicks ? (current, direction) => adjacentTickValue(current, sortedTicks, direction) : undefined,
    getBoundValue: snapsToTicks
      ? (bound) => (bound === 'min' ? sortedTicks[0].value : sortedTicks[sortedTicks.length - 1].value)
      : undefined,
  });

  const labelText = getNodeText(label);
  if (!labelText && !accessibilityLabel) {
    warnOnce('Slider.accessibilityLabel', '[Slider] Pass `label` or `accessibilityLabel` so the slider has an accessible name.');
  }

  const showValueLabel = shouldShowValueLabel(
    valueLabel !== null,
    tooltip,
    valueLabelAlwaysOn,
    drag.isDragging || hovered || focused
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);
  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  const renderBody = ({ controlProps }: FieldRenderProps) => (
    <View
      ref={surfaceRef}
      testID={testID}
      style={[surfaceStyle(fullWidth, geometry.vertical, geometry.containerWidth, geometry.containerHeight), drag.surfaceStyle]}
      onLayout={(event) => {
        drag.onLayout(event);
        geometry.onLayout(event);
      }}
      {...(isWeb ? { onPointerEnter: hover.onHoverIn, onPointerLeave: hover.onHoverOut } : null)}
      {...drag.panHandlers}
    >
      <SliderTrack
        disabled={disabled}
        theme={theme}
        orientation={orientation}
        activeLength={Math.abs(thumbOffset - minEndOffset)}
        activeStart={thumbSize / 2 + Math.min(thumbOffset, minEndOffset)}
        trackColor={colors.trackColor}
        activeTrackColor={colors.activeTrackColor}
        trackStyle={trackStyle}
        activeTrackStyle={activeTrackStyle}
        trackHeight={trackHeight}
        thumbSize={thumbSize}
        variant={variant}
      />
      <SliderTicks
        ticks={allTicks}
        disabled={disabled}
        theme={theme}
        orientation={orientation}
        trackHeight={trackHeight}
        thumbSize={thumbSize}
        tickColor={colors.tickColor}
        activeTickColor={colors.activeTickColor}
        tickStyle={tickStyle}
        activeTickStyle={activeTickStyle}
        tickLabelProps={tickLabelProps}
      />
      <SliderThumb
        position={thumbOffset}
        disabled={disabled}
        theme={theme}
        orientation={orientation}
        isDragging={drag.isDragging}
        thumbColor={colors.thumbColor}
        thumbStyle={thumbStyle}
        thumbSize={thumbSize}
        variant={variant}
        a11y={thumbA11y(controlProps, adjustableProps)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        testID={testID ? `${testID}-thumb` : undefined}
      />
      {showValueLabel ? (
        <SliderValueLabel
          value={formatter(clampedValue)}
          position={thumbOffset}
          orientation={orientation}
          isCard={valueLabelAsCard}
          thumbSize={thumbSize}
          placement={valueLabelPosition}
          offset={valueLabelOffset}
          containerStyle={valueLabelStyle}
          textProps={valueLabelProps}
        />
      ) : null}
    </View>
  );

  return (
    <Field
      id={id}
      label={label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[
        { flex: 1 },
        // Parents that shrink-to-fit (`alignItems: 'center'`, a row, an
        // auto-width Card) would otherwise leave fullWidth as a stub.
        fullWidth && orientation === 'horizontal' ? { alignSelf: 'stretch' } : null,
        spacingStyles,
        layoutStyles,
        style,
      ]}
    >
      {(field: FieldRenderProps) => (
        <>
          {renderBody(field)}
          {disclaimer ? <Disclaimer {...disclaimerProps}>{disclaimer}</Disclaimer> : null}
        </>
      )}
    </Field>
  );
}, { displayName: 'Slider' });

Slider.displayName = 'Slider';

type Thumb = 'min' | 'max';

/**
 * A two-thumb range slider. Each thumb is its own `role="slider"` control with
 * a distinct name (`rangeLabels`, default "Minimum" / "Maximum"); the pair is a
 * `role="group"` named by the field label. The minimum thumb's range ends at
 * the maximum's value and vice versa (keyboard never crosses them).
 */
export const RangeSlider = factory<{ props: RangeSliderProps; ref: View }>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    disabled = false,
    readOnly = false,
    size = 'md',
    orientation = 'horizontal',
    inverted = false,
    containerSize,
    fullWidth = true,
    label,
    description,
    error,
    helperText,
    required = false,
    withAsterisk,
    labelProps,
    descriptionProps,
    accessibilityLabel,
    accessibilityHint,
    valueLabel,
    valueLabelAlwaysOn = false,
    tooltip = 'hover',
    valueLabelPosition,
    valueLabelOffset,
    valueLabelStyle,
    valueLabelProps,
    valueLabelAsCard = true,
    precision,
    ticks,
    showTicks = false,
    showMarks = false,
    restrictToTicks = false,
    minRange = 0,
    allowCross,
    pushOnOverlap = true,
    rangeLabels,
    trackSize,
    thumbSize: thumbSizeProp,
    variant = 'default',
    trackStyle,
    activeTrackStyle,
    thumbStyle,
    tickStyle,
    activeTickStyle,
    tickLabelProps,
    onFocus,
    onBlur,
    style,
    testID,
    id,
    disclaimer,
    disclaimerProps,
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const spacingStyles = useStyleProps(props);
  const layoutStyles = getLayoutStyles(props);
  const locked = disabled || readOnly;
  const crossing = allowCross ?? !pushOnOverlap;

  const [range, setRange] = useControllableState<[number, number]>({
    value,
    defaultValue: defaultValue ?? [min, max],
    finalValue: [min, max],
    onChange,
  });

  const defaultFormatter = useCallback((next: number) => formatSliderValue(next, step, precision), [step, precision]);
  const formatter = useCallback(
    (next: number, index: number) => (valueLabel ? valueLabel(next, index) : defaultFormatter(next)),
    [valueLabel, defaultFormatter]
  );
  const markFormatter = useCallback((next: number) => defaultFormatter(next), [defaultFormatter]);
  const markTicks = useMemo(
    () => withEndMarks(ticks, showMarks, min, max, markFormatter),
    [ticks, showMarks, min, max, markFormatter]
  );
  const constrain = useSliderValueConstraint(min, max, step, restrictToTicks, markTicks);
  const minValue = constrain(Math.min(range[0], range[1]));
  const maxValue = constrain(Math.max(range[0], range[1]));

  const rangeRef = useRef<[number, number]>([minValue, maxValue]);
  rangeRef.current = [minValue, maxValue];
  const emitChangeEnd = useLatestCallback(onChangeEnd);
  const settle = useCallback(() => emitChangeEnd(rangeRef.current), [emitChangeEnd]);

  /** Moves one thumb, keeping the pair ordered (stopping at, or swapping past, its sibling). */
  const commitThumb = useCallback(
    (thumb: Thumb, raw: number, allowSwap: boolean) => {
      if (locked) return;
      const [low, high] = rangeRef.current;
      const nextValue = constrain(raw);
      let next: [number, number];
      if (thumb === 'min') {
        if (allowSwap && nextValue > high) next = [high, nextValue];
        else next = [Math.min(nextValue, Math.max(min, high - minRange)), high];
      } else if (allowSwap && nextValue < low) {
        next = [nextValue, low];
      } else {
        next = [low, Math.max(nextValue, Math.min(max, low + minRange))];
      }
      if (next[0] === low && next[1] === high) return;
      rangeRef.current = next;
      setRange(next);
    },
    [locked, constrain, min, max, minRange, setRange]
  );

  const { thumbSize, trackHeight } = getSliderMetrics(theme, size, variant, thumbSizeProp, trackSize);
  const geometry = useTrackGeometry({ orientation, containerSize, fullWidth, thumbSize, inverted, isRTL, min, max });
  const minOffset = geometry.valueToOffset(minValue);
  const maxOffset = geometry.valueToOffset(maxValue);

  const { color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor } = props;
  const colors = useMemo(
    () => resolveSliderColors(theme, { color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor }),
    [theme, color, trackColor, activeTrackColor, thumbColor, tickColor, activeTickColor]
  );

  const isTickActive = useCallback((tickValue: number) => tickValue >= minValue && tickValue <= maxValue, [minValue, maxValue]);
  const allTicks = useSliderTicks(markTicks, showTicks, min, max, step, geometry.valueToOffset, isTickActive);

  // Which thumb the in-flight gesture owns: chosen once on grant and held for the
  // whole drag, so a thumb dragged past its sibling keeps following the finger.
  const [dragThumb, setDragThumb] = useState<Thumb | null>(null);
  const dragThumbRef = useRef<Thumb | null>(null);

  const drag = useDragGesture({
    enabled: !locked,
    axis: 'both',
    cursor: locked ? 'default' : 'pointer',
    activeCursor: 'grabbing',
    onStart: (point) => {
      const pressValue = constrain(geometry.pointToValue(point));
      const [low, high] = rangeRef.current;
      const toLow = Math.abs(pressValue - low);
      const toHigh = Math.abs(pressValue - high);
      // On a tie (stacked thumbs, or a press exactly between them) the side of
      // the press decides, so a stacked pair can always be pulled apart.
      const thumb: Thumb = toLow === toHigh ? (pressValue >= high ? 'max' : 'min') : toLow < toHigh ? 'min' : 'max';
      dragThumbRef.current = thumb;
      setDragThumb(thumb);
      commitThumb(thumb, pressValue, crossing);
    },
    onMove: (point) => {
      const thumb = dragThumbRef.current;
      if (thumb) commitThumb(thumb, geometry.pointToValue(point), crossing);
    },
    onEnd: () => {
      dragThumbRef.current = null;
      setDragThumb(null);
      settle();
    },
    onCancel: () => {
      dragThumbRef.current = null;
      setDragThumb(null);
      settle();
    },
  });
  const surfaceRef = useMergedRef(drag.ref, ref);
  const [hovered, hover] = useHover();
  const [focusedThumb, setFocusedThumb] = useState<Thumb | null>(null);

  const sortedTicks = useMemo(() => (markTicks ? [...markTicks].sort((a, b) => a.value - b.value) : []), [markTicks]);
  const snapsToTicks = restrictToTicks && sortedTicks.length > 0;
  const getNextValue = snapsToTicks
    ? (current: number, direction: 1 | -1) => adjacentTickValue(current, sortedTicks, direction)
    : undefined;

  const thumbNames = rangeLabels ?? ['Minimum', 'Maximum'];
  const labelText = accessibilityLabel ?? getNodeText(label);
  // Native has no group semantics, so the field label joins each thumb's name there.
  const thumbName = (index: 0 | 1) => (!isWeb && labelText ? `${labelText}, ${thumbNames[index]}` : thumbNames[index]);
  const swapArrows = isRTL !== (inverted && orientation === 'horizontal');

  // Keyboard never crosses the thumbs: each one's range ends at the other's value.
  const minThumb = useAdjustable({
    value: minValue,
    min,
    max: Math.max(min, maxValue - minRange),
    step,
    largeStep,
    onChange: (next) => commitThumb('min', next, false),
    onChangeEnd: settle,
    label: thumbName(0),
    valueText: (next) => formatter(next, 0),
    orientation,
    disabled,
    readOnly,
    rtl: swapArrows,
    getNextValue,
  });
  const maxThumb = useAdjustable({
    value: maxValue,
    min: Math.min(max, minValue + minRange),
    max,
    step,
    largeStep,
    onChange: (next) => commitThumb('max', next, false),
    onChangeEnd: settle,
    label: thumbName(1),
    valueText: (next) => formatter(next, 1),
    orientation,
    disabled,
    readOnly,
    rtl: swapArrows,
    getNextValue,
  });

  const showValueLabels = shouldShowValueLabel(
    valueLabel !== null,
    tooltip,
    valueLabelAlwaysOn,
    dragThumb !== null || hovered || focusedThumb !== null
  );

  const focusHandlers = (thumb: Thumb) => ({
    onFocus: () => {
      setFocusedThumb(thumb);
      onFocus?.();
    },
    onBlur: () => {
      setFocusedThumb(null);
      onBlur?.();
    },
  });

  const renderLabel = (thumb: Thumb) => (
    <SliderValueLabel
      value={formatter(thumb === 'min' ? minValue : maxValue, thumb === 'min' ? 0 : 1)}
      position={thumb === 'min' ? minOffset : maxOffset}
      orientation={orientation}
      isCard={valueLabelAsCard}
      thumbSize={thumbSize}
      placement={valueLabelPosition}
      offset={valueLabelOffset}
      containerStyle={valueLabelStyle}
      textProps={valueLabelProps}
    />
  );

  const renderBody = ({ controlProps }: FieldRenderProps) => {
    // The pair is a group named by the field; each thumb carries its own name.
    const { id: groupId, 'aria-labelledby': labelledBy, 'aria-label': groupLabel, ...describe } = controlProps;
    return (
      <View
        ref={surfaceRef}
        testID={testID}
        id={groupId}
        role="group"
        aria-labelledby={labelledBy}
        aria-label={groupLabel}
        collapsable={false}
        style={[surfaceStyle(fullWidth, geometry.vertical, geometry.containerWidth, geometry.containerHeight), drag.surfaceStyle]}
        onLayout={(event) => {
          drag.onLayout(event);
          geometry.onLayout(event);
        }}
        {...(isWeb ? { onPointerEnter: hover.onHoverIn, onPointerLeave: hover.onHoverOut } : null)}
        {...drag.panHandlers}
      >
        <SliderTrack
          disabled={disabled}
          theme={theme}
          orientation={orientation}
          activeLength={Math.abs(maxOffset - minOffset)}
          activeStart={thumbSize / 2 + Math.min(minOffset, maxOffset)}
          trackColor={colors.trackColor}
          activeTrackColor={colors.activeTrackColor}
          trackStyle={trackStyle}
          activeTrackStyle={activeTrackStyle}
          trackHeight={trackHeight}
          thumbSize={thumbSize}
          variant={variant}
        />
        <SliderTicks
          ticks={allTicks}
          disabled={disabled}
          theme={theme}
          orientation={orientation}
          keyPrefix="range-tick"
          trackHeight={trackHeight}
          thumbSize={thumbSize}
          tickColor={colors.tickColor}
          activeTickColor={colors.activeTickColor}
          tickStyle={tickStyle}
          activeTickStyle={activeTickStyle}
          tickLabelProps={tickLabelProps}
        />
        <SliderThumb
          position={minOffset}
          disabled={disabled}
          theme={theme}
          orientation={orientation}
          isDragging={dragThumb === 'min'}
          raised={dragThumb === 'min'}
          thumbColor={colors.thumbColor}
          thumbStyle={thumbStyle}
          thumbSize={thumbSize}
          variant={variant}
          a11y={thumbA11y(describe, minThumb.adjustableProps)}
          {...focusHandlers('min')}
          testID={testID ? `${testID}-thumb-min` : undefined}
        />
        <SliderThumb
          position={maxOffset}
          disabled={disabled}
          theme={theme}
          orientation={orientation}
          isDragging={dragThumb === 'max'}
          raised={dragThumb !== 'min'}
          thumbColor={colors.thumbColor}
          thumbStyle={thumbStyle}
          thumbSize={thumbSize}
          variant={variant}
          a11y={thumbA11y(describe, maxThumb.adjustableProps)}
          {...focusHandlers('max')}
          testID={testID ? `${testID}-thumb-max` : undefined}
        />
        {showValueLabels ? (
          <>
            {renderLabel('min')}
            {renderLabel('max')}
          </>
        ) : null}
      </View>
    );
  };

  const valueLabelSpace = valueLabel !== null ? 24 : 0;

  return (
    <Field
      id={id}
      label={label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[
        orientation === 'vertical' ? { marginEnd: valueLabelSpace } : { marginBottom: valueLabelSpace },
        fullWidth && orientation === 'horizontal' ? { alignSelf: 'stretch' } : null,
        spacingStyles,
        layoutStyles,
        style,
      ]}
    >
      {(field: FieldRenderProps) => (
        <>
          {renderBody(field)}
          {disclaimer ? <Disclaimer {...disclaimerProps}>{disclaimer}</Disclaimer> : null}
        </>
      )}
    </Field>
  );
}, { displayName: 'RangeSlider' });

RangeSlider.displayName = 'RangeSlider';
