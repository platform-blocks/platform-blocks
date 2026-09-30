import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
  Extrapolation,
  cancelAnimation
} from 'react-native-reanimated';

import { Tooltip, resolveTooltipProps, getTooltipText } from '../Tooltip';
import { Text as UIText } from '../Text';
import { FieldHeader } from '../_internal/FieldHeader';
import { factory, withStatics } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText, useA11yId } from '../../core/accessibility/useA11yId';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { isWeb } from '../../core/platform/flags';
import { resolveAccentColor, resolveTextColor } from '../../core/theme/resolveColors';
import type { ThemeColor } from '../../core/theme/resolveColors';
import { getControlSize, onColor, resolveFontSize, resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { getLayoutStyles, extractLayoutProps } from '../../core/utils/layout';
import type {
  ProgressProps,
  ProgressRootProps,
  ProgressSectionProps,
  ProgressLabelProps,
  ProgressFieldProps,
  ProgressFactoryPayload,
  ProgressRootFactoryPayload,
  ProgressSectionFactoryPayload,
  ProgressLabelFactoryPayload,
  ProgressContextValue,
  ProgressOrientation
} from './types';

/** Default length along the main axis for vertical bars, which have no intrinsic height. */
const VERTICAL_LENGTH = 160;
/** Width of a single stripe; the overlay shifts by two of these per loop. */
const STRIPE_SIZE = 16;
/** Stripes rendered before the overlay has been measured. */
const MIN_STRIPES = 12;
const MIN_THICKNESS = 8;
const PERCENT_RANGE = { min: 0, max: 100 } as const;

const styles = StyleSheet.create({
  /** Fills the sized section so nested wrappers never shrink to their content. */
  fill: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  stripesHorizontal: {
    position: 'absolute',
    flexDirection: 'row',
    opacity: 0.3,
    // Overhangs by the full shift distance at *both* ends, so the leading
    // edge stays covered for every frame of the loop.
    top: 0,
    bottom: 0,
    start: -STRIPE_SIZE * 2,
    end: -STRIPE_SIZE * 2,
  },
  stripesVertical: {
    position: 'absolute',
    flexDirection: 'column',
    opacity: 0.3,
    top: -STRIPE_SIZE * 2,
    bottom: -STRIPE_SIZE * 2,
    start: 0,
    end: 0,
  },
  // Oversized on the cross axis so the skewed edges still cover the track.
  stripeHorizontal: {
    width: STRIPE_SIZE,
    height: '200%',
    transform: [{ skewX: '20deg' }, { translateY: -10 }],
  },
  stripeVertical: {
    width: '200%',
    height: STRIPE_SIZE,
    transform: [{ skewY: '20deg' }, { translateX: -10 }],
  },
  track: { overflow: 'hidden' },
  trackVertical: { justifyContent: 'flex-end' },
  rootHorizontal: { flexDirection: 'row' },
  // `column-reverse` stacks the first section at the bottom.
  rootVertical: { flexDirection: 'column-reverse' },
  barFillHorizontal: { height: '100%', overflow: 'hidden' },
  barFillVertical: { width: '100%', overflow: 'hidden' },
  sectionHorizontal: {
    // Sized as a share of the track so sections leave the remainder unfilled,
    // rather than stretching to consume it.
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sectionVertical: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  rowBar: { flex: 1, minWidth: 0 },
  label: { fontWeight: '600', textAlign: 'center' },
});

const ProgressContext = createContext<ProgressContextValue | null>(null);
/** The enclosing section's fill color, so `Progress.Label` can pick a readable text color. */
const ProgressFillContext = createContext<string | null>(null);

const DEFAULT_CONTEXT: ProgressContextValue = { orientation: 'horizontal', transitionDuration: 0, trackExtent: 0 };

function useProgressContext(): ProgressContextValue {
  return useContext(ProgressContext) ?? DEFAULT_CONTEXT;
}

const clampPercent = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0);

/**
 * Measures the track along its main axis. Unlike the filled part, the track's
 * own length is stable, so this settles on mount and only changes on resize.
 */
function useTrackExtent(isVertical: boolean) {
  const [extent, setExtent] = useState(0);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      const next = isVertical ? height : width;
      // Ignore sub-pixel jitter so a resize doesn't re-render on every frame.
      setExtent((current) => (Math.abs(next - current) > 1 ? next : current));
    },
    [isVertical]
  );

  return [extent, onLayout] as const;
}

function useResolvedColor(color: ThemeColor | undefined) {
  const theme = useTheme();
  // The shared resolver also accepts `primary.6` shade syntax and non-hex CSS
  // colors (`rgb(…)`, named colors).
  return useMemo(() => resolveAccentColor(theme, color) ?? theme.colors.primary[5], [color, theme]);
}

/** Track metrics shared by `Progress` and `Progress.Root`, resolved against the current theme. */
function useTrackMetrics(size: SizeValue, radius: ProgressProps['radius'], trackColor: string | undefined) {
  const theme = useTheme();
  return useMemo(
    () => ({
      thickness: Math.max(getControlSize(theme, size).height, MIN_THICKNESS),
      borderRadius: resolveRadius(theme, radius),
      backgroundColor: trackColor ?? theme.backgrounds.border,
    }),
    [theme, size, radius, trackColor]
  );
}

/** Animated main-axis size (percent) for a fill or section. */
function useFillStyle(percent: number, duration: number, isVertical: boolean) {
  const animatedFill = useSharedValue(duration > 0 ? 0 : percent);

  useEffect(() => {
    animatedFill.value = duration > 0 ? withTiming(percent, { duration }) : percent;
  }, [percent, duration, animatedFill]);

  return useAnimatedStyle(() => {
    const clamped = interpolate(animatedFill.value, [0, 100], [0, 100], Extrapolation.CLAMP);
    return isVertical ? { height: `${clamped}%` } : { width: `${clamped}%` };
  });
}

interface ProgressStripesProps {
  animate: boolean;
  orientation: ProgressOrientation;
  /** Fill the stripes sit on; the stripe color is chosen to read against it. */
  fillColor: string;
  /**
   * Length of the *track* along the main axis. The overlay sits inside the
   * filled part, whose length animates, so the stripe count is sized from the
   * track instead — the longest the fill can ever get.
   */
  trackExtent: number;
}

/**
 * Diagonal "barbershop pole" overlay drawn inside a filled bar or section.
 * Extends past its container on both ends so the looping shift stays seamless.
 * The loop never runs while reduced motion is on.
 */
function ProgressStripes({ animate, orientation, fillColor, trackExtent }: ProgressStripesProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animate && !reducedMotion;
  const offset = useSharedValue(0);
  const isVertical = orientation === 'vertical';
  // A fixed count only covers a fixed length, so a wide bar would run out of
  // stripes partway along. Cover the track plus the overhang at both ends.
  const stripeCount = Math.max(
    MIN_STRIPES,
    Math.ceil((trackExtent + STRIPE_SIZE * 4) / STRIPE_SIZE) + 2
  );
  const stripeColor = useMemo(() => onColor(theme, fillColor), [theme, fillColor]);

  useEffect(() => {
    if (shouldAnimate) {
      offset.value = withRepeat(
        // Linear: the loop restarts every cycle, so any easing would visibly
        // slow the stripes to a stop and snap them back.
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(offset);
      offset.value = 0;
    }

    return () => cancelAnimation(offset);
  }, [shouldAnimate, offset]);

  const animatedStyle = useAnimatedStyle(() => {
    const shift = interpolate(offset.value, [0, 1], [0, STRIPE_SIZE * 2]);
    return {
      transform: [isVertical ? { translateY: shift } : { translateX: shift }]
    };
  });

  const stripeStyle = isVertical ? styles.stripeVertical : styles.stripeHorizontal;
  const painted = useMemo(() => [stripeStyle, { backgroundColor: stripeColor, opacity: 0.4 }], [stripeStyle, stripeColor]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[isVertical ? styles.stripesVertical : styles.stripesHorizontal, animatedStyle]}
    >
      {Array.from({ length: stripeCount }, (_, i) => (
        <View key={i} style={i % 2 === 0 ? painted : stripeStyle} />
      ))}
    </Animated.View>
  );
}

interface ProgressFieldWrapperProps extends ProgressFieldProps {
  /** Bar thickness token, so the label matches the bar's scale. */
  size?: SizeValue;
  orientation: ProgressOrientation;
  labelId: string;
  descriptionId: string;
  errorId: string;
  /** Spacing/layout styles, which belong on the outermost element. */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Wraps a bar in the shared field chrome (label + description + error) used by
 * the input components. Returns the bar untouched when nothing is labelled, so
 * an unlabelled `Progress` keeps rendering as a single view.
 */
function ProgressField({
  label,
  description,
  error,
  required = false,
  withAsterisk = true,
  labelPosition = 'top',
  labelGap = 'xs',
  labelProps,
  descriptionProps,
  size,
  orientation,
  labelId,
  descriptionId,
  errorId,
  style,
  children
}: ProgressFieldWrapperProps) {
  const theme = useTheme();
  const hasField = Boolean(label || description || error);

  if (!hasField) {
    return <>{children}</>;
  }

  const isRow = labelPosition === 'left' || labelPosition === 'right';
  const isVertical = orientation === 'vertical';
  const resolvedGap = resolveSpacing(theme, labelGap);
  const gap = resolvedGap === 'auto' ? 0 : resolvedGap;

  const header = (label || (description && !error)) ? (
    <FieldHeader
      label={label}
      // Mirrors the input components: the error replaces the helper text.
      description={error ? undefined : description}
      required={required}
      withAsterisk={withAsterisk}
      error={Boolean(error)}
      // `size` doubles as a raw thickness on Progress; only forward the tokens,
      // since a pixel thickness says nothing about the label's scale.
      size={typeof size === 'string' ? size : 'md'}
      // The wrapper's flex gap owns the spacing between header and bar.
      marginBottom={0}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      labelId={labelId}
      descriptionId={descriptionId}
    />
  ) : null;

  // A horizontal bar has no intrinsic width, so beside a label it needs to be
  // told to consume the remaining space rather than collapsing to nothing.
  const bar = isRow && !isVertical ? <View style={styles.rowBar}>{children}</View> : children;

  return (
    <View style={style}>
      <View
        style={{
          flexDirection: isRow ? 'row' : 'column',
          alignItems: isRow ? 'center' : (isVertical ? 'flex-start' : 'stretch'),
          gap
        }}
      >
        {(labelPosition === 'top' || labelPosition === 'left') && header}
        {bar}
        {(labelPosition === 'bottom' || labelPosition === 'right') && header}
      </View>
      {error ? (
        <View {...a11yProps({ id: errorId, role: 'alert', live: 'polite' })}>
          <UIText size="sm" style={{ color: resolveTextColor(theme, 'error') ?? theme.text.primary, marginTop: 4 }}>
            {error}
          </UIText>
        </View>
      ) : null}
    </View>
  );
}

interface FieldA11yInput {
  ariaLabel: string | undefined;
  label: React.ReactNode;
  description: React.ReactNode;
  error: React.ReactNode;
}

/**
 * Ids for the field chrome, and the accessible name / description of the bar.
 * Web references the rendered label/description/error by id (so rich labels
 * work); native has no id references, so it gets their text.
 */
function useProgressFieldA11y({ ariaLabel, label, description, error }: FieldA11yInput) {
  const baseId = useA11yId(undefined, 'plocks-progress');
  const hasLabel = Boolean(label);
  const hasDescription = Boolean(description) && !error;
  const hasError = Boolean(error);
  const labelText = useMemo(() => (isWeb ? '' : getNodeText(label)), [label]);
  const hintText = useMemo(
    () => (isWeb ? '' : getNodeText(hasError ? error : hasDescription ? description : undefined)),
    [hasError, error, hasDescription, description]
  );

  return useMemo(() => {
    const ids = {
      label: `${baseId}-label`,
      description: `${baseId}-description`,
      error: `${baseId}-error`,
    };
    const naming = {
      label: ariaLabel ?? (isWeb ? undefined : labelText || undefined),
      labelledBy: isWeb && !ariaLabel && hasLabel ? ids.label : undefined,
      describedBy: [hasDescription && ids.description, hasError && ids.error],
      hint: hintText || undefined,
    };
    return { ids, naming };
  }, [baseId, ariaLabel, labelText, hasLabel, hasDescription, hasError, hintText]);
}

function ProgressBase(props: ProgressProps, ref: React.Ref<View>) {
  const {
    value,
    size = 'md',
    color = 'primary',
    radius = 'md',
    striped = false,
    animate = false,
    transitionDuration = 0,
    orientation = 'horizontal',
    length,
    trackColor,
    style,
    'aria-label': ariaLabel,
    'aria-valuetext': ariaValueText,
    testID,
    label,
    description,
    error,
    required,
    withAsterisk,
    labelPosition,
    labelGap,
    labelProps,
    descriptionProps,
    ...rest
  } = props;

  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(rest);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  const spacingStyles = useStyleProps(styleProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const isVertical = orientation === 'vertical';
  const { thickness, borderRadius, backgroundColor } = useTrackMetrics(size, radius, trackColor);
  const resolvedProgressColor = useResolvedColor(color);
  const progressValue = clampPercent(value);
  const duration = useTransitionDuration(transitionDuration, 0);
  const [trackExtent, handleTrackLayout] = useTrackExtent(isVertical);
  const progressAnimatedStyle = useFillStyle(progressValue, duration, isVertical);
  const { ids, naming } = useProgressFieldA11y({ ariaLabel, label, description, error });

  // The field chrome, when present, becomes the outermost element and takes the
  // spacing/layout styles with it; `style` always stays on the track.
  const hasField = Boolean(label || description || error);

  const bar = (
    <View
      ref={ref}
      style={[
        styles.track,
        { backgroundColor, borderRadius },
        isVertical
          ? [styles.trackVertical, { width: thickness, height: length ?? VERTICAL_LENGTH }]
          : { height: thickness, ...(length === undefined ? null : { width: length }) },
        // `fullWidth` first, so an explicit `w` wins.
        hasField ? null : layoutStyles,
        hasField ? null : spacingStyles,
        style
      ]}
      testID={testID}
      onLayout={handleTrackLayout}
      {...a11yProps({
        role: 'progressbar',
        ...naming,
        value: { ...PERCENT_RANGE, now: progressValue, text: ariaValueText },
      })}
      {...otherProps}
    >
      <Animated.View
        style={[
          isVertical ? styles.barFillVertical : styles.barFillHorizontal,
          { backgroundColor: resolvedProgressColor, borderRadius },
          progressAnimatedStyle
        ]}
      >
        {striped && (
          <ProgressStripes
            animate={animate}
            orientation={orientation}
            fillColor={resolvedProgressColor}
            trackExtent={trackExtent}
          />
        )}
      </Animated.View>
    </View>
  );

  return (
    <ProgressField
      label={label}
      description={description}
      error={error}
      required={required}
      withAsterisk={withAsterisk}
      labelPosition={labelPosition}
      labelGap={labelGap}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      size={size}
      orientation={orientation}
      labelId={ids.label}
      descriptionId={ids.description}
      errorId={ids.error}
      style={[layoutStyles, spacingStyles]}
    >
      {bar}
    </ProgressField>
  );
}

function ProgressRootBase(props: ProgressRootProps, ref: React.Ref<View>) {
  const {
    size = 'md',
    radius = 'md',
    orientation = 'horizontal',
    length,
    trackColor,
    transitionDuration = 0,
    children,
    style,
    'aria-label': ariaLabel,
    testID,
    label,
    description,
    error,
    required,
    withAsterisk,
    labelPosition,
    labelGap,
    labelProps,
    descriptionProps,
    ...rest
  } = props;

  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(rest);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  const spacingStyles = useStyleProps(styleProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const isVertical = orientation === 'vertical';
  const { thickness, borderRadius, backgroundColor } = useTrackMetrics(size, radius, trackColor);
  const duration = useTransitionDuration(transitionDuration, 0);
  const [trackExtent, handleTrackLayout] = useTrackExtent(isVertical);
  const { ids, naming } = useProgressFieldA11y({ ariaLabel, label, description, error });

  const context = useMemo<ProgressContextValue>(
    () => ({ orientation, transitionDuration: duration, trackExtent }),
    [orientation, duration, trackExtent]
  );

  // See `ProgressBase`: the field chrome owns the spacing/layout styles.
  const hasField = Boolean(label || description || error);
  // Each section is its own progressbar; a named root groups them under that name.
  const isNamed = Boolean(naming.label || naming.labelledBy);

  return (
    <ProgressContext.Provider value={context}>
      <ProgressField
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={withAsterisk}
        labelPosition={labelPosition}
        labelGap={labelGap}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        size={size}
        orientation={orientation}
        labelId={ids.label}
        descriptionId={ids.description}
        errorId={ids.error}
        style={[layoutStyles, spacingStyles]}
      >
        <View
          ref={ref}
          style={[
            styles.track,
            { backgroundColor, borderRadius },
            isVertical
              ? [styles.rootVertical, { width: thickness, height: length ?? VERTICAL_LENGTH }]
              : [styles.rootHorizontal, { width: length ?? '100%', height: thickness }],
            hasField ? null : layoutStyles,
            hasField ? null : spacingStyles,
            style
          ]}
          testID={testID}
          onLayout={handleTrackLayout}
          {...(isNamed ? a11yProps({ role: 'group', ...naming }) : null)}
          {...otherProps}
        >
          {children}
        </View>
      </ProgressField>
    </ProgressContext.Provider>
  );
}

function ProgressSectionBase(props: ProgressSectionProps, ref: React.Ref<View>) {
  const {
    value,
    color = 'primary',
    striped = false,
    animate = false,
    transitionDuration,
    radius,
    tooltip,
    style,
    'aria-label': ariaLabel,
    'aria-valuetext': ariaValueText,
    testID,
    onPress,
    children,
    ...rest
  } = props;

  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);
  const theme = useTheme();
  const { orientation, transitionDuration: inheritedDuration, trackExtent } = useProgressContext();
  const isVertical = orientation === 'vertical';
  const duration = useTransitionDuration(transitionDuration ?? inheritedDuration, 0);

  const resolvedProgressColor = useResolvedColor(color);
  const progressValue = clampPercent(value);
  const sectionAnimatedStyle = useFillStyle(progressValue, duration, isVertical);

  const baseStyle = [
    isVertical ? styles.sectionVertical : styles.sectionHorizontal,
    { backgroundColor: resolvedProgressColor },
    radius === undefined ? null : { borderRadius: resolveRadius(theme, radius) },
  ];

  const content = (
    <ProgressFillContext.Provider value={resolvedProgressColor}>
      {striped && (
        // The section is a slice of the track, so sizing from the track's full
        // length over-provisions — harmless, since the section clips the excess.
        <ProgressStripes
          animate={animate}
          orientation={orientation}
          fillColor={resolvedProgressColor}
          trackExtent={trackExtent}
        />
      )}
      {children}
    </ProgressFillContext.Provider>
  );

  const tooltipConfig = resolveTooltipProps(tooltip);
  const tooltipText = getTooltipText(tooltip);

  const accessibility = a11yProps({
    role: 'progressbar',
    label: ariaLabel ?? tooltipText,
    value: { ...PERCENT_RANGE, now: progressValue, text: ariaValueText },
  });

  // Only reach for Pressable when something actually listens — a plain View keeps
  // non-interactive sections out of the touch/accessibility tree. Wrappers like
  // `Tooltip` clone their child with press/hover/focus handlers, and Pressable is
  // what delivers those consistently across web and native.
  const isInteractive = Boolean(
    onPress ||
      tooltipConfig ||
      otherProps.onHoverIn ||
      otherProps.onHoverOut ||
      otherProps.onMouseEnter ||
      otherProps.onMouseLeave ||
      otherProps.onFocus ||
      otherProps.onBlur
  );

  if (isInteractive) {
    const host = (
      <Pressable
        ref={ref}
        onPress={onPress}
        style={styles.fill}
        testID={testID}
        {...accessibility}
        {...otherProps}
      >
        {content}
      </Pressable>
    );

    return (
      <Animated.View style={[baseStyle, sectionAnimatedStyle, spacingStyles, style]}>
        {tooltipConfig ? (
          // The tooltip lives *inside* the sized section and stretches to fill it,
          // so its wrapper view never becomes the flex item that carries the width.
          <Tooltip {...tooltipConfig} style={styles.fill}>
            {host}
          </Tooltip>
        ) : (
          host
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      ref={ref}
      style={[baseStyle, sectionAnimatedStyle, spacingStyles, style]}
      testID={testID}
      {...accessibility}
      {...otherProps}
    >
      {content}
    </Animated.View>
  );
}

function ProgressLabelBase(props: ProgressLabelProps, ref: React.Ref<Text>) {
  const { children, color, size = 'sm', numberOfLines = 1, style, testID, ...rest } = props;
  const theme = useTheme();
  const fill = useContext(ProgressFillContext);
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  const textStyle = useMemo<TextStyle>(
    () => ({
      fontSize: resolveFontSize(theme, size),
      color: color ?? onColor(theme, fill ?? theme.colors.primary[5]),
    }),
    [theme, size, color, fill]
  );

  return (
    <Text
      ref={ref}
      numberOfLines={numberOfLines}
      testID={testID}
      style={[styles.label, textStyle, spacingStyles, style]}
    >
      {children}
    </Text>
  );
}

const ProgressComponent = factory<ProgressFactoryPayload>(ProgressBase, { displayName: 'Progress' });
export const ProgressRoot = factory<ProgressRootFactoryPayload>(ProgressRootBase, { displayName: 'Progress.Root' });
export const ProgressSection = factory<ProgressSectionFactoryPayload>(ProgressSectionBase, {
  displayName: 'Progress.Section',
});
export const ProgressLabel = factory<ProgressLabelFactoryPayload>(ProgressLabelBase, { displayName: 'Progress.Label' });

ProgressComponent.displayName = 'Progress';
ProgressRoot.displayName = 'Progress.Root';
ProgressSection.displayName = 'Progress.Section';
ProgressLabel.displayName = 'Progress.Label';

/**
 * Compound sub-components are attached to `Progress` itself, so
 * `<Progress.Root><Progress.Section /></Progress.Root>` type-checks.
 */
export const Progress = withStatics(ProgressComponent, {
  Root: ProgressRoot,
  Section: ProgressSection,
  Label: ProgressLabel
});
