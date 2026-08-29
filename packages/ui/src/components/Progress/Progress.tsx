import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
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
import { factory } from '../../core/factory';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import type { ThemeColor } from '../../core/theme/resolveColors';
import { getHeight, getRadius, getSpacing } from '../../core/theme/sizes';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getSpacingStyles, extractSpacingProps, getLayoutStyles, extractLayoutProps } from '../../core/utils';
import type { SizeValue } from '../../core/theme/sizes';
import { getAccessibilityValueProps } from '../../core/accessibility/utils';
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

// Types moved to ./types

/** Default length along the main axis for vertical bars, which have no intrinsic height. */
const VERTICAL_LENGTH = 160;
/** Width of a single stripe; the overlay shifts by two of these per loop. */
const STRIPE_SIZE = 16;
/** Stripes rendered before the overlay has been measured. */
const MIN_STRIPES = 12;
const MIN_THICKNESS = 8;
/** Fills the sized section so nested wrappers never shrink to their content. */
const FILL_STYLE = {
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center'
} as const;

const ProgressContext = createContext<ProgressContextValue | null>(null);

function useProgressContext(): ProgressContextValue {
  return (
    useContext(ProgressContext) ??
    { orientation: 'horizontal', transitionDuration: 0, trackExtent: 0 }
  );
}

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

  return useMemo(() => {
    // The shared resolver also accepts `primary.6` shade syntax and non-hex CSS
    // colors (`rgb(…)`, named colors), which the old `#`-prefix test dropped.
    return resolveAccentColor(theme, color) ?? theme.colors.primary[5] ?? '#007AFF';
  }, [color, theme]);
}

interface ProgressStripesProps {
  animate: boolean;
  orientation: ProgressOrientation;
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
 */
function ProgressStripes({ animate, orientation, trackExtent }: ProgressStripesProps) {
  const offset = useSharedValue(0);
  const isVertical = orientation === 'vertical';
  // A fixed count only covers a fixed length, so a wide bar would run out of
  // stripes partway along. Cover the track plus the overhang at both ends.
  const stripeCount = Math.max(
    MIN_STRIPES,
    Math.ceil((trackExtent + STRIPE_SIZE * 4) / STRIPE_SIZE) + 2
  );

  useEffect(() => {
    if (animate) {
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
  }, [animate, offset]);

  const animatedStyle = useAnimatedStyle(() => {
    const shift = interpolate(offset.value, [0, 1], [0, STRIPE_SIZE * 2]);

    return {
      transform: [isVertical ? { translateY: shift } : { translateX: shift }]
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          flexDirection: isVertical ? 'column' : 'row',
          opacity: 0.3,
          // Overhangs by the full shift distance at *both* ends, so the leading
          // edge stays covered for every frame of the loop.
          ...(isVertical
            ? { top: -STRIPE_SIZE * 2, bottom: -STRIPE_SIZE * 2, left: 0, right: 0 }
            : { top: 0, bottom: 0, left: -STRIPE_SIZE * 2, right: -STRIPE_SIZE * 2 })
        },
        animatedStyle
      ]}
    >
      {Array.from({ length: stripeCount }, (_, i) => (
        <View
          key={i}
          style={{
            // Oversized on the cross axis so the skewed edges still cover the track
            width: isVertical ? '200%' : STRIPE_SIZE,
            height: isVertical ? STRIPE_SIZE : '200%',
            backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.4)' : 'transparent',
            transform: [
              isVertical ? { skewY: '20deg' } : { skewX: '20deg' },
              isVertical ? { translateX: -10 } : { translateY: -10 }
            ] as any
          }}
        />
      ))}
    </Animated.View>
  );
}

interface ProgressFieldWrapperProps extends ProgressFieldProps {
  /** Bar thickness token, so the label matches the bar's scale. */
  size?: SizeValue;
  orientation: ProgressOrientation;
  /** Spacing/layout styles, which belong on the outermost element. */
  style?: any;
  testID?: string;
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
  style,
  testID,
  children
}: ProgressFieldWrapperProps) {
  const theme = useTheme();
  const hasField = Boolean(label || description || error);

  if (!hasField) {
    return <>{children}</>;
  }

  const isRow = labelPosition === 'left' || labelPosition === 'right';
  const isVertical = orientation === 'vertical';
  const gap = typeof labelGap === 'number' ? labelGap : getSpacing(labelGap);

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
    />
  ) : null;

  // A horizontal bar has no intrinsic width, so beside a label it needs to be
  // told to consume the remaining space rather than collapsing to nothing.
  const bar = isRow && !isVertical ? (
    <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
  ) : children;

  return (
    <View style={style} testID={testID}>
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
        <UIText
          size="sm"
          style={{ color: theme.colors.error?.[6] || '#E03131', marginTop: 4 }}
        >
          {error}
        </UIText>
      ) : null}
    </View>
  );
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

  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(rest);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const theme = useTheme();
  const isVertical = orientation === 'vertical';
  const thickness = Math.max(getHeight(size), MIN_THICKNESS);
  const borderRadius = getRadius(radius);

  const resolvedProgressColor = useResolvedColor(color);
  const resolvedBackgroundColor = trackColor ?? theme.colors.gray[1] ?? '#E5E5EA';
  const progressValue = Math.max(0, Math.min(100, value));
  const [trackExtent, handleTrackLayout] = useTrackExtent(isVertical);

  const animatedFill = useSharedValue(transitionDuration > 0 ? 0 : progressValue);

  useEffect(() => {
    if (transitionDuration > 0) {
      animatedFill.value = withTiming(progressValue, {
        duration: transitionDuration,
      });
    } else {
      animatedFill.value = progressValue;
    }
  }, [progressValue, transitionDuration, animatedFill]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const percentage = interpolate(
      animatedFill.value,
      [0, 100],
      [0, 100],
      Extrapolation.CLAMP
    );

    return isVertical ? { height: `${percentage}%` } : { width: `${percentage}%` };
  });

  // The field chrome, when present, becomes the outermost element and takes the
  // spacing/layout styles with it; `style` always stays on the track.
  const hasField = Boolean(label || description || error);

  const bar = (
    <View
      ref={ref}
      style={[
        {
          backgroundColor: resolvedBackgroundColor,
          borderRadius,
          overflow: 'hidden',
          ...(isVertical
            ? {
                width: thickness,
                height: length ?? VERTICAL_LENGTH,
                // Vertical bars fill from the bottom up
                justifyContent: 'flex-end' as const
              }
            : { height: thickness, ...(length === undefined ? null : { width: length }) })
        },
        hasField ? null : spacingStyles,
        hasField ? null : layoutStyles,
        style
      ]}
      testID={testID}
      onLayout={handleTrackLayout}
      accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      accessibilityRole="progressbar"
      {...getAccessibilityValueProps({ min: 0, max: 100, now: progressValue })}
      {...otherProps}
    >
      <Animated.View
        style={[
          {
            backgroundColor: resolvedProgressColor,
            borderRadius,
            overflow: 'hidden',
            ...(isVertical ? { width: '100%' as const } : { height: '100%' as const })
          },
          progressAnimatedStyle
        ]}
      >
        {striped && (
          <ProgressStripes
            animate={animate}
            orientation={orientation}
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
      style={[spacingStyles, layoutStyles]}
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

  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(rest);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const theme = useTheme();
  const isVertical = orientation === 'vertical';
  const thickness = Math.max(getHeight(size), MIN_THICKNESS);
  const borderRadius = getRadius(radius);
  const backgroundColor = trackColor ?? theme.colors.gray[1] ?? '#E5E5EA';

  const [trackExtent, handleTrackLayout] = useTrackExtent(isVertical);

  const context = useMemo<ProgressContextValue>(
    () => ({ orientation, transitionDuration, trackExtent }),
    [orientation, transitionDuration, trackExtent]
  );

  // See `ProgressBase`: the field chrome owns the spacing/layout styles.
  const hasField = Boolean(label || description || error);

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
        style={[spacingStyles, layoutStyles]}
      >
        <View
          ref={ref}
          style={[
            {
              backgroundColor,
              borderRadius,
              overflow: 'hidden',
              ...(isVertical
                ? {
                    width: thickness,
                    height: length ?? VERTICAL_LENGTH,
                    // `column-reverse` stacks the first section at the bottom
                    flexDirection: 'column-reverse' as const
                  }
                : {
                    width: length ?? '100%',
                    height: thickness,
                    flexDirection: 'row' as const
                  })
            },
            hasField ? null : spacingStyles,
            hasField ? null : layoutStyles,
            style
          ]}
          testID={testID}
          onLayout={handleTrackLayout}
          accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
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
    tooltipPosition = 'top',
    style,
    'aria-label': ariaLabel,
    testID,
    onPress,
    children,
    ...rest
  } = props;

  const { orientation, transitionDuration: inheritedDuration, trackExtent } = useProgressContext();
  const isVertical = orientation === 'vertical';
  const duration = transitionDuration ?? inheritedDuration;

  const resolvedProgressColor = useResolvedColor(color);
  const progressValue = Math.max(0, Math.min(100, value));

  const animatedFill = useSharedValue(duration > 0 ? 0 : progressValue);

  useEffect(() => {
    if (duration > 0) {
      animatedFill.value = withTiming(progressValue, { duration });
    } else {
      animatedFill.value = progressValue;
    }
  }, [progressValue, duration, animatedFill]);

  const sectionAnimatedStyle = useAnimatedStyle(() => {
    const percentage = interpolate(animatedFill.value, [0, 100], [0, 100], Extrapolation.CLAMP);

    return isVertical ? { height: `${percentage}%` } : { width: `${percentage}%` };
  });

  const baseStyle = {
    // Sized as a share of the track so sections leave the remainder unfilled,
    // rather than stretching to consume it.
    ...(isVertical ? { width: '100%' as const } : { height: '100%' as const }),
    backgroundColor: resolvedProgressColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    position: 'relative' as const,
    ...(radius === undefined ? null : { borderRadius: getRadius(radius) })
  };

  const content = (
    <>
      {striped && (
        // The section is a slice of the track, so sizing from the track's full
        // length over-provisions — harmless, since the section clips the excess.
        <ProgressStripes animate={animate} orientation={orientation} trackExtent={trackExtent} />
      )}
      {children}
    </>
  );

  const tooltipConfig = resolveTooltipProps(tooltip, { position: tooltipPosition });
  const tooltipText = getTooltipText(tooltip);

  const accessibility = {
    accessibilityLabel: ariaLabel ?? tooltipText,
    accessibilityRole: 'progressbar' as const,
    ...getAccessibilityValueProps({ min: 0, max: 100, now: progressValue }),
  };

  // Only reach for Pressable when something actually listens — a plain View keeps
  // non-interactive sections out of the touch/accessibility tree. Wrappers like
  // `Tooltip` clone their child with press/hover/focus handlers, and Pressable is
  // what delivers those consistently across web and native.
  const isInteractive = Boolean(
    onPress ||
      tooltipConfig ||
      rest.onHoverIn ||
      rest.onHoverOut ||
      rest.onMouseEnter ||
      rest.onMouseLeave ||
      rest.onFocus ||
      rest.onBlur
  );

  if (isInteractive) {
    const host = (
      <Pressable
        ref={ref as React.Ref<View>}
        onPress={onPress}
        style={FILL_STYLE}
        testID={testID}
        {...accessibility}
        {...rest}
      >
        {content}
      </Pressable>
    );

    return (
      <Animated.View style={[baseStyle, sectionAnimatedStyle, style]}>
        {tooltipConfig ? (
          // The tooltip lives *inside* the sized section and stretches to fill it,
          // so its wrapper view never becomes the flex item that carries the width.
          <Tooltip {...tooltipConfig} style={FILL_STYLE}>
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
      style={[baseStyle, sectionAnimatedStyle, style]}
      testID={testID}
      {...accessibility}
      {...rest}
    >
      {content}
    </Animated.View>
  );
}

function ProgressLabelBase(props: ProgressLabelProps, ref: React.Ref<Text>) {
  const { children, color = 'white', size = 12, numberOfLines = 1, style, testID } = props;

  return (
    <Text
      ref={ref}
      numberOfLines={numberOfLines}
      testID={testID}
      style={[
        {
          fontSize: size,
          fontWeight: '600',
          color,
          textAlign: 'center'
        },
        style
      ]}
    >
      {children}
    </Text>
  );
}

const ProgressComponent = factory<ProgressFactoryPayload>(ProgressBase);
export const ProgressRoot = factory<ProgressRootFactoryPayload>(ProgressRootBase);
export const ProgressSection = factory<ProgressSectionFactoryPayload>(ProgressSectionBase);
export const ProgressLabel = factory<ProgressLabelFactoryPayload>(ProgressLabelBase);

ProgressComponent.displayName = 'Progress';
ProgressRoot.displayName = 'Progress.Root';
ProgressSection.displayName = 'Progress.Section';
ProgressLabel.displayName = 'Progress.Label';

/**
 * Compound sub-components are attached to `Progress` itself, so
 * `<Progress.Root><Progress.Section /></Progress.Root>` type-checks.
 */
export const Progress = Object.assign(ProgressComponent, {
  Root: ProgressRoot,
  Section: ProgressSection,
  Label: ProgressLabel
});
