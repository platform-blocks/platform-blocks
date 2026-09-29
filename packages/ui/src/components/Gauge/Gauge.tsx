import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { factory, withStatics } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { isWeb } from '../../core/platform/flags';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { resolveFontSize } from '../../core/theme/tokens';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type {
  GaugeProps,
  GaugeTrackProps,
  GaugeRangeProps,
  GaugeTicksProps,
  GaugeLabelsProps,
  GaugeNeedleProps,
  GaugeCenterProps,
  GaugeContextValue,
  GaugeEasing,
} from './types';
import { useGaugeStyles } from './styles';
import {
  valueToAngle,
  getPointOnCircle,
  generateTickPositions,
  generateLabelPositions,
  clamp,
  angleDifference,
  normalizeAngle,
  createArcPath,
} from './utils';

const DEFAULT_SIZE = 200;

// CSS timing curves, so `animationEasing` means the same thing it does in CSS.
const EASINGS: Record<GaugeEasing, ReturnType<typeof Easing.bezier> | typeof Easing.linear> = {
  linear: Easing.linear,
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),
  'ease-in': Easing.bezier(0.42, 0, 1, 1),
  'ease-out': Easing.bezier(0, 0, 0.58, 1),
  'ease-in-out': Easing.bezier(0.42, 0, 0.58, 1),
};

const resolveEasing = (name: string) => EASINGS[name as GaugeEasing] ?? EASINGS['ease-out'];

const styles = StyleSheet.create({
  layer: { position: 'absolute', width: '100%', height: '100%' },
});

// Context for sharing gauge configuration
const GaugeContext = createContext<GaugeContextValue | null>(null);

const useGaugeContext = () => {
  const context = useContext(GaugeContext);
  if (!context) {
    throw new Error('Gauge compound components must be used within a Gauge component');
  }
  return context;
};

// Main Gauge Component
const GaugeRoot = factory<{
  props: GaugeProps;
  ref: View;
}>((props, ref) => {
  const {
    value,
    min = 0,
    max = 100,
    size = DEFAULT_SIZE,
    thickness = 8,
    startAngle = 135,
    endAngle = 45,
    rotationOffset = 0,
    color = 'primary',
    trackColor: backgroundColor,
    ranges,
    ticks,
    labels,
    needle,
    animationDuration = 500,
    animationEasing = 'ease-out',
    disabled = false,
    'aria-label': ariaLabel,
    children,
    testID,
    style,
    ...rest
  } = props;

  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);

  const theme = useTheme();
  const containerSize = typeof size === 'number' ? size : DEFAULT_SIZE;
  const rootStyles = useGaugeStyles({ size: containerSize, disabled, thickness });
  const duration = useTransitionDuration(animationDuration, 0);

  // Clamp value to range
  const clampedValue = clamp(value, min, max);

  // Palette token, `primary.6` shade syntax, or a raw CSS color.
  const gaugeColor = resolveAccentColor(theme, color as string | undefined) ?? theme.colors.primary[5];

  const contextValue = useMemo<GaugeContextValue>(() => {
    const radius = (containerSize - thickness) / 2;
    return {
      value: clampedValue,
      min,
      max,
      size: containerSize,
      thickness,
      // Rotation offset applied once, here, so every part agrees.
      startAngle: normalizeAngle(startAngle + rotationOffset),
      endAngle: normalizeAngle(endAngle + rotationOffset),
      rotationOffset,
      center: { x: containerSize / 2, y: containerSize / 2 },
      radius,
      innerRadius: radius - thickness / 2,
      disabled,
      animationDuration: duration,
      animationEasing,
      color: gaugeColor,
      trackColor: backgroundColor,
    };
  }, [
    clampedValue,
    min,
    max,
    containerSize,
    thickness,
    startAngle,
    endAngle,
    rotationOffset,
    disabled,
    duration,
    animationEasing,
    gaugeColor,
    backgroundColor,
  ]);

  // Spoken value: the label formatter's text, plus the name of the band it is in.
  const formatter = labels?.formatter;
  const valueText = useMemo(() => {
    const text = formatter ? formatter(clampedValue) : String(clampedValue);
    const band = ranges?.find((range) => range.label && clampedValue >= range.from && clampedValue <= range.to);
    return band?.label ? `${text}, ${band.label}` : text;
  }, [formatter, clampedValue, ranges]);

  return (
    <GaugeContext.Provider value={contextValue}>
      <View
        ref={ref}
        style={[rootStyles.container, spacingStyles, style]}
        testID={testID}
        {...a11yProps({
          // A gauge is a measurement in a known range: `meter` on web. Native
          // platforms have no meter role (Android drops it), so they get the
          // value-bearing `progressbar`, which both read with its value.
          role: isWeb ? 'meter' : 'progressbar',
          accessible: true,
          label: ariaLabel,
          value: { min, max, now: clampedValue, text: valueText },
        })}
        {...otherProps}
      >
        {/* Render children or default components */}
        {children || (
          <>
            <GaugeTrack />
            {ranges?.map((range, index) => (
              <GaugeRange
                key={`${index}:${range.from}-${range.to}`}
                from={range.from}
                to={range.to}
                color={range.color}
              />
            ))}
            {ticks && <GaugeTicks config={ticks} />}
            {labels && <GaugeLabels config={labels} />}
            <GaugeNeedle config={needle} />
            <GaugeCenter
              show={needle?.showCenter ?? true}
              color={needle?.centerColor}
              size={needle?.centerSize}
            />
          </>
        )}
      </View>
    </GaugeContext.Provider>
  );
}, { displayName: 'Gauge' });

// Track Component - renders as a circular border
export const GaugeTrack = factory<{
  props: GaugeTrackProps;
  ref: Svg;
}>((props, ref) => {
  const { color, thickness: trackThickness, opacity = 1, style, testID, ...rest } = props;
  const context = useGaugeContext();
  const theme = useTheme();
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  const trackColor = color || context.trackColor || theme.backgrounds.borderStrong;
  const effectiveThickness = trackThickness || context.thickness;

  let totalAngle = context.endAngle - context.startAngle;
  if (totalAngle <= 0) {
    totalAngle += 360;
  }

  const isFullCircle = Math.abs(totalAngle - 360) < 0.001;
  const centerX = context.center.x;
  const centerY = context.center.y;
  const svgSize = context.size;

  return (
    <Svg
      ref={ref}
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      testID={testID}
      style={[
        {
          position: 'absolute',
          left: centerX - svgSize / 2,
          top: centerY - svgSize / 2,
        },
        spacingStyles,
        style,
      ]}
    >
      {isFullCircle ? (
        <Circle
          cx={centerX}
          cy={centerY}
          r={context.radius}
          stroke={trackColor}
          strokeWidth={effectiveThickness}
          strokeLinecap="round"
          fill="none"
          opacity={opacity}
        />
      ) : (
        <Path
          d={createArcPath(
            centerX,
            centerY,
            context.radius,
            context.startAngle,
            context.endAngle,
            totalAngle > 180
          )}
          stroke={trackColor}
          strokeWidth={effectiveThickness}
          strokeLinecap="round"
          fill="none"
          opacity={opacity}
        />
      )}
    </Svg>
  );
}, { displayName: 'Gauge.Track' });

// Range Component - renders colored sections
export const GaugeRange = factory<{
  props: GaugeRangeProps;
  ref: View;
}>((props, ref) => {
  const { from, to, color, thickness: rangeThickness, style, testID, ...rest } = props;
  const context = useGaugeContext();
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  const effectiveThickness = rangeThickness || context.thickness;

  // Calculate start and end angles for this range
  const startAngle = valueToAngle(from, context.min, context.max, context.startAngle, context.endAngle);
  const endAngle = valueToAngle(to, context.min, context.max, context.startAngle, context.endAngle);

  // Dots every ~5 degrees approximate the arc cheaply on every platform.
  const arcSpan = Math.abs(endAngle - startAngle);
  const segmentCount = Math.max(1, Math.ceil(arcSpan / 5));

  const segments = [];
  for (let i = 0; i < segmentCount; i++) {
    const angle = startAngle + (i * arcSpan / segmentCount);
    const point = getPointOnCircle(context.center.x, context.center.y, context.radius, angle);

    segments.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          width: effectiveThickness,
          height: effectiveThickness,
          backgroundColor: color,
          left: point.x - effectiveThickness / 2,
          top: point.y - effectiveThickness / 2,
          borderRadius: effectiveThickness / 2,
        }}
      />
    );
  }

  return (
    <View ref={ref} testID={testID} style={[styles.layer, spacingStyles, style]}>
      {segments}
    </View>
  );
}, { displayName: 'Gauge.Range' });

// Ticks Component - renders tick marks
export const GaugeTicks = factory<{
  props: GaugeTicksProps;
  ref: View;
}>((props, ref) => {
  const {
    config,
    major = 5,
    minor = 4,
    positions,
    length = 10,
    color,
    width,
    type = 'major',
    style,
    testID,
    ...rest
  } = props;

  const context = useGaugeContext();
  const theme = useTheme();
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  const tickConfig = config || {};
  const majorCount = tickConfig.major || major;
  const minorCount = tickConfig.minor || minor;
  const tickColor = color || tickConfig.color || theme.text.muted;
  const tickLength = tickConfig.majorLength || length;
  const minorLength = tickConfig.minorLength || length * 0.6;

  let tickPositions: number[] = [];

  if (positions) {
    tickPositions = positions;
  } else if (tickConfig.majorPositions && type === 'major') {
    tickPositions = tickConfig.majorPositions;
  } else if (tickConfig.minorPositions && type === 'minor') {
    tickPositions = tickConfig.minorPositions;
  } else {
    const generated = generateTickPositions(context.min, context.max, majorCount, minorCount);
    tickPositions = type === 'major' ? generated.major : generated.minor;
  }

  const effectiveLength = type === 'major' ? tickLength : minorLength;
  const effectiveWidth = width ?? tickConfig.width ?? (type === 'major' ? 2 : 1);

  return (
    <View ref={ref} testID={testID} style={[styles.layer, spacingStyles, style]}>
      {tickPositions.map((position, index) => {
        const angle = valueToAngle(position, context.min, context.max, context.startAngle, context.endAngle);
        const outerPoint = getPointOnCircle(context.center.x, context.center.y, context.radius, angle);
        const innerPoint = getPointOnCircle(context.center.x, context.center.y, context.radius - effectiveLength, angle);

        return (
          <View
            key={`${index}:${position}`}
            style={{
              position: 'absolute',
              width: Math.hypot(outerPoint.x - innerPoint.x, outerPoint.y - innerPoint.y),
              height: effectiveWidth,
              backgroundColor: tickColor,
              left: innerPoint.x,
              top: innerPoint.y,
              transform: [
                { rotate: `${angle}deg` },
                { translateX: -effectiveWidth / 2 }
              ],
              transformOrigin: 'left center',
            }}
          />
        );
      })}
    </View>
  );
}, { displayName: 'Gauge.Ticks' });

// Labels Component - renders value labels
export const GaugeLabels = factory<{
  props: GaugeLabelsProps;
  ref: View;
}>((props, ref) => {
  const {
    config,
    positions,
    formatter,
    color,
    fontSize,
    offset = 20,
    labelStyle,
    style,
    testID,
    ...rest
  } = props;

  const context = useGaugeContext();
  const theme = useTheme();
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  const labelsConfig = config || {};
  const show = labelsConfig.show !== false;
  const labelColor = color || labelsConfig.color || theme.text.primary;
  const labelFormatter = formatter || labelsConfig.formatter || ((value: number) => value.toString());
  const labelOffset = labelsConfig.offset || offset;
  const labelFontSize = fontSize ?? labelsConfig.fontSize ?? resolveFontSize(theme, 'sm');

  if (!show) return null;

  let labelPositions: number[] = [];

  if (positions) {
    labelPositions = positions;
  } else if (labelsConfig.positions) {
    labelPositions = labelsConfig.positions;
  } else {
    // Generate default label positions (same as major ticks)
    labelPositions = generateLabelPositions(context.min, context.max, 5);
  }

  return (
    <View ref={ref} testID={testID} style={[styles.layer, spacingStyles, style]}>
      {labelPositions.map((position, index) => {
        const angle = valueToAngle(position, context.min, context.max, context.startAngle, context.endAngle);
        const point = getPointOnCircle(
          context.center.x,
          context.center.y,
          context.radius + labelOffset,
          angle
        );

        return (
          <Text
            key={`${index}:${position}`}
            style={[
              {
                position: 'absolute',
                // Geometric placement on the dial (not reading order): physical left.
                left: point.x - 20,
                top: point.y - labelFontSize / 2,
                width: 40,
                textAlign: 'center',
                color: labelColor,
                fontSize: labelFontSize,
                fontFamily: theme.fontFamily,
              },
              labelStyle,
            ]}
          >
            {labelFormatter(position)}
          </Text>
        );
      })}
    </View>
  );
}, { displayName: 'Gauge.Labels' });

// Needle Component - renders the pointer
export const GaugeNeedle = factory<{
  props: GaugeNeedleProps;
  ref: View;
}>((props, ref) => {
  const {
    value: needleValue,
    angle,
    config,
    color,
    width = 2,
    length = 0.8,
    shape,
    animationDuration,
    style,
    testID,
    ...rest
  } = props;

  const context = useGaugeContext();
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  const needleConfig = config || {};
  const needleColor = color || needleConfig.color || context.color;
  const needleWidth = needleConfig.width || width;
  const needleLength = needleConfig.length || length;
  const needleShape = shape ?? needleConfig.shape ?? 'line';

  // Calculate needle angle
  let needleAngle: number;
  if (angle !== undefined) {
    needleAngle = angle;
  } else if (needleValue !== undefined) {
    needleAngle = valueToAngle(needleValue, context.min, context.max, context.startAngle, context.endAngle);
  } else {
    needleAngle = valueToAngle(context.value, context.min, context.max, context.startAngle, context.endAngle);
  }

  // `??` rather than `||` so an explicit 0 survives: it means "no transition".
  // Reduced motion resolves to 0 as well (the context value already is).
  const duration = useTransitionDuration(animationDuration ?? context.animationDuration, 0);
  const easing = resolveEasing(context.animationEasing);

  // Seeded to the correct angle so the needle renders in place on mount instead
  // of flashing at 0deg (straight up) and jumping. Only later changes animate.
  // The continuous (unwrapped) angle lives in a ref: it only drives the animation.
  const animatedAngle = useSharedValue(normalizeAngle(needleAngle));
  const currentAngleRef = useRef(normalizeAngle(needleAngle));

  // Animate to the new angle along the shortest path.
  useEffect(() => {
    const current = currentAngleRef.current;
    const diff = angleDifference(normalizeAngle(current), normalizeAngle(needleAngle));
    if (diff === 0) return;
    const target = current + diff;
    currentAngleRef.current = target;
    animatedAngle.value = duration === 0 ? target : withTiming(target, { duration, easing });
  }, [needleAngle, duration, easing, animatedAngle]);

  const needleRadius = context.radius * needleLength;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedAngle.value}deg` }],
  }));

  // Rotates about its bottom-center, which sits on the gauge center.
  const frameWidth = needleShape === 'line' ? needleWidth : Math.max(needleWidth * 4, 8);
  const frame: ViewStyle = {
    position: 'absolute',
    width: frameWidth,
    height: needleRadius,
    left: context.center.x - frameWidth / 2,
    top: context.center.y - needleRadius,
    transformOrigin: 'center bottom',
    alignItems: 'center',
  };

  let body: React.ReactNode = null;
  if (needleShape === 'triangle') {
    // A wedge from the full base width at the center to a point at the tip.
    body = (
      <View
        style={{
          width: 0,
          height: 0,
          borderStartWidth: frameWidth / 2,
          borderEndWidth: frameWidth / 2,
          borderBottomWidth: needleRadius,
          borderStartColor: 'transparent',
          borderEndColor: 'transparent',
          borderBottomColor: needleColor,
        }}
      />
    );
  } else if (needleShape === 'arrow') {
    const headLength = Math.min(frameWidth * 1.5, needleRadius / 2);
    body = (
      <>
        <View
          style={{
            width: 0,
            height: 0,
            borderStartWidth: frameWidth / 2,
            borderEndWidth: frameWidth / 2,
            borderBottomWidth: headLength,
            borderStartColor: 'transparent',
            borderEndColor: 'transparent',
            borderBottomColor: needleColor,
          }}
        />
        <View
          style={{
            width: needleWidth,
            flex: 1,
            backgroundColor: needleColor,
            borderBottomStartRadius: needleWidth / 2,
            borderBottomEndRadius: needleWidth / 2,
          }}
        />
      </>
    );
  }

  return (
    <Animated.View
      ref={ref}
      testID={testID}
      style={[
        frame,
        needleShape === 'line' ? { backgroundColor: needleColor, borderRadius: needleWidth / 2 } : null,
        animatedStyle,
        spacingStyles,
        style,
      ]}
    >
      {body}
    </Animated.View>
  );
}, { displayName: 'Gauge.Needle' });

// Center Component - renders center dot
export const GaugeCenter = factory<{
  props: GaugeCenterProps;
  ref: View;
}>((props, ref) => {
  const {
    color,
    size = 8,
    show = true,
    children,
    style,
    testID,
    ...rest
  } = props;

  const context = useGaugeContext();
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  if (!show && !children) return null;

  const centerColor = color || context.color;

  return (
    <View ref={ref} testID={testID} style={[styles.layer, spacingStyles, style]}>
      {show && (
        <View
          style={{
            position: 'absolute',
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: centerColor,
            left: context.center.x - size,
            top: context.center.y - size,
          }}
        />
      )}
      {children}
    </View>
  );
}, { displayName: 'Gauge.Center' });

// The memo wrappers the factory returns carry the names too (DevTools, tests).
GaugeRoot.displayName = 'Gauge';
GaugeTrack.displayName = 'Gauge.Track';
GaugeRange.displayName = 'Gauge.Range';
GaugeTicks.displayName = 'Gauge.Ticks';
GaugeLabels.displayName = 'Gauge.Labels';
GaugeNeedle.displayName = 'Gauge.Needle';
GaugeCenter.displayName = 'Gauge.Center';

/** `Gauge` with its parts attached: `<Gauge value={v}><Gauge.Track /><Gauge.Needle /></Gauge>`. */
export const Gauge = withStatics(GaugeRoot, {
  Track: GaugeTrack,
  Range: GaugeRange,
  Ticks: GaugeTicks,
  Labels: GaugeLabels,
  Needle: GaugeNeedle,
  Center: GaugeCenter,
});

/** @deprecated `Gauge` itself now carries the compound parts. */
export const GaugeWithCompound = Gauge;

export * from './types';
export * from './utils';
