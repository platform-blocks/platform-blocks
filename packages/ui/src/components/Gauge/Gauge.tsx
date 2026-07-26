import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { SpacingProps, getSpacingStyles, extractSpacingProps } from '../../core/utils';
import {
  GaugeProps,
  GaugeTrackProps,
  GaugeRangeProps,
  GaugeTicksProps,
  GaugeLabelsProps,
  GaugeNeedleProps,
  GaugeCenterProps,
  GaugeContextValue,
} from './types';
import { useGaugeStyles } from './styles';
import { getAccessibilityValueProps } from '../../core/accessibility/utils';
import {
  valueToAngle,
  getPointOnCircle,
  generateTickPositions,
  generateLabelPositions,
  clamp,
  applyRotationOffset,
  angleDifference,
  normalizeAngle,
  createArcPath,
} from './utils';

// Context for sharing gauge configuration
const GaugeContext = createContext<GaugeContextValue | null>(null);

const useGaugeContext = () => {
  const context = useContext(GaugeContext);
  if (!context) {
    throw new Error('Gauge compound components must be used within a Gauge component');
  }
  return context;
};

// Helper function to create stroke-dasharray for arcs
const createStrokeDashArray = (
  radius: number,
  startAngle: number,
  endAngle: number,
  circumference: number
) => {
  const totalAngle = Math.abs(endAngle - startAngle);
  const arcLength = (totalAngle / 360) * circumference;
  const offset = (startAngle / 360) * circumference;
  
  return {
    strokeDasharray: `${arcLength} ${circumference}`,
    strokeDashoffset: -offset,
  };
};

// Main Gauge Component
export const Gauge = factory<{
  props: GaugeProps;
  ref: View;
}>((props, ref) => {
  const {
    value,
    min = 0,
    max = 100,
    size = 200,
    thickness = 8,
    startAngle = 135,
    endAngle = 45,
    rotationOffset = 0,
    color = 'primary',
    backgroundColor,
    ranges = [],
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

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);

  const theme = useTheme();
  const styles = useGaugeStyles({ size: typeof size === 'number' ? size : 200, disabled, thickness });

 // Calculate dimensions - fix radius calculation
  const containerSize = typeof size === 'number' ? size : 200;
  const center = { x: containerSize / 2, y: containerSize / 2 };
  const radius = (containerSize - thickness) / 2; // Remove the -10 padding
   const innerRadius = radius - thickness / 2;

  // Clamp value to range
  const clampedValue = clamp(value, min, max);

  // Apply rotation offset consistently
  const adjustedStartAngle = normalizeAngle(startAngle + rotationOffset);
  const adjustedEndAngle = normalizeAngle(endAngle + rotationOffset);

  // Calculate needle angle
  const needleAngle = valueToAngle(clampedValue, min, max, startAngle, endAngle);

  // Get color from theme or use direct color
  const gaugePalette = typeof color === 'string' ? theme.colors[color as keyof typeof theme.colors] : undefined;
  const gaugeColor = gaugePalette ? gaugePalette[5] : (typeof color === 'string' ? color : theme.colors.primary[5]);

   const contextValue: GaugeContextValue = {
    value: clampedValue,
    min,
    max,
    size: containerSize,
    thickness,
    startAngle: adjustedStartAngle,
    endAngle: adjustedEndAngle,
    rotationOffset,
    center,
    radius,
    innerRadius: radius - thickness / 2,
    disabled,
    animationDuration,
    animationEasing,
  };

  return (
    <GaugeContext.Provider value={contextValue}>
      <View
        ref={ref}
        style={[styles.container, spacingStyles, style]}
        testID={testID}
        accessibilityLabel={ariaLabel || `Gauge value ${clampedValue}`}
        // Without a value-bearing role the value has nowhere to land, on either platform.
        accessibilityRole="progressbar"
        {...getAccessibilityValueProps({ min, max, now: clampedValue })}
        {...otherProps}
      >
        {/* Render children or default components */}
        {children || (
          <>
            <GaugeTrack />
            {ranges.length > 0 && ranges.map((range, index) => (
              <GaugeRange
                key={index}
                from={range.from}
                to={range.to}
                color={range.color}
              />
            ))}
            {ticks && <GaugeTicks config={ticks} />}
            {labels && <GaugeLabels config={labels} />}
            <GaugeNeedle config={needle} />
            <GaugeCenter />
          </>
        )}
      </View>
    </GaugeContext.Provider>
  );
});

// Track Component - renders as a circular border
export const GaugeTrack = factory<{
  props: GaugeTrackProps;
  ref: HTMLDivElement;
}>((props, ref) => {
  const { color, thickness: trackThickness, opacity = 1, style, ...rest } = props;
  const context = useGaugeContext();
  const theme = useTheme();

  const trackColor = color || theme.colors.gray[2];
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
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      style={[
        {
          position: 'absolute',
          left: centerX - svgSize / 2,
          top: centerY - svgSize / 2,
        },
        style,
      ]}
      {...rest}
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
});

// Range Component - renders colored sections
export const GaugeRange = factory<{
  props: GaugeRangeProps;
  ref: HTMLDivElement;
}>((props, ref) => {
  const { from, to, color, thickness: rangeThickness, style, ...rest } = props;
  const context = useGaugeContext();
  
  const effectiveThickness = rangeThickness || context.thickness;
  
  // Calculate start and end angles for this range
  const startAngle = valueToAngle(from, context.min, context.max, context.startAngle, context.endAngle);
  const endAngle = valueToAngle(to, context.min, context.max, context.startAngle, context.endAngle);
  
  // Create a more accurate arc representation
  const arcSpan = Math.abs(endAngle - startAngle);
  const segmentCount = Math.max(1, Math.ceil(arcSpan / 5)); // 5-degree segments for better performance
  
  const segments = [];
  for (let i = 0; i < segmentCount; i++) {
    const angle = startAngle + (i * arcSpan / segmentCount);
    const point = getPointOnCircle(
      context.center.x,
      context.center.y,
      context.radius,
      angle
    );
    
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
    <View style={[{ position: 'absolute', width: '100%', height: '100%' }, style]} {...rest}>
      {segments}
    </View>
  );
});

// Ticks Component - renders tick marks
export const GaugeTicks = factory<{
  props: GaugeTicksProps;
  ref: HTMLDivElement;
}>((props, ref) => {
  const {
    config,
    major = 5,
    minor = 4,
    positions,
    length = 10,
    color,
    width = 1,
    type = 'major',
    ...rest
  } = props;
  
  const context = useGaugeContext();
  const theme = useTheme();

  const tickConfig = config || {};
  const majorCount = tickConfig.major || major;
  const minorCount = tickConfig.minor || minor;
  const tickColor = color || tickConfig.color || theme.colors.gray[4];
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
  const effectiveWidth = type === 'major' ? 2 : 1;

  return (
  <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
    {tickPositions.map((position, index) => {
      const angle = valueToAngle(position, context.min, context.max, context.startAngle, context.endAngle);
      const outerPoint = getPointOnCircle(context.center.x, context.center.y, context.radius, angle);
      const innerPoint = getPointOnCircle(context.center.x, context.center.y, context.radius - effectiveLength, angle);

      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            width: Math.sqrt(Math.pow(outerPoint.x - innerPoint.x, 2) + Math.pow(outerPoint.y - innerPoint.y, 2)),
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
          {...rest}
        />
      );
    })}
  </View>
);
});

// Labels Component - renders value labels
export const GaugeLabels = factory<{
  props: GaugeLabelsProps;
  ref: HTMLDivElement;
}>((props, ref) => {
  const {
    config,
    positions,
    formatter,
    color,
    fontSize = 12,
    offset = 20,
    ...rest
  } = props;
  
  const context = useGaugeContext();
  const theme = useTheme();

  const labelsConfig = config || {};
  const show = labelsConfig.show !== false;
  const labelColor = color || labelsConfig.color || theme.text.primary;
  const labelFormatter = formatter || labelsConfig.formatter || ((value: number) => value.toString());
  const labelOffset = labelsConfig.offset || offset;
  
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
    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
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
            key={index}
            style={{
              position: 'absolute',
              left: point.x - 20, // Approximate centering
              top: point.y - fontSize / 2,
              width: 40,
              textAlign: 'center',
              color: labelColor,
              fontSize,
              fontFamily: theme.fontFamily,
            }}
            {...rest}
          >
            {labelFormatter(position)}
          </Text>
        );
      })}
    </View>
  );
});

// Needle Component - renders the pointer
export const GaugeNeedle = factory<{
  props: GaugeNeedleProps;
  ref: HTMLDivElement;
}>((props, ref) => {
  const {
    value: needleValue,
    angle,
    config,
    color,
    width = 2,
    length = 0.8,
    shape = 'line',
    animationDuration,
    ...rest
  } = props;
  
  const context = useGaugeContext();
  const theme = useTheme();

  const needleConfig = config || {};
  const needleColor = color || needleConfig.color || theme.colors.primary[5];
  const needleWidth = needleConfig.width || width;
  const needleLength = needleConfig.length || length;

  // Calculate needle angle
  let needleAngle: number;
  if (angle !== undefined) {
    needleAngle = angle;
  } else if (needleValue !== undefined) {
    needleAngle = valueToAngle(needleValue, context.min, context.max, context.startAngle, context.endAngle);
  } else {
    needleAngle = valueToAngle(context.value, context.min, context.max, context.startAngle, context.endAngle);
  }

  // `?? ` rather than `||` so an explicit 0 survives: it means "no transition".
  const duration = Math.max(animationDuration ?? context.animationDuration ?? 0, 0);

  // Seed both the shared value and the tracked angle to the correct initial
  // position so the needle renders in place on mount instead of flashing at
  // 0deg (straight up) and jumping. Only subsequent value changes animate.
  const animatedAngle = useSharedValue(normalizeAngle(needleAngle));
  const [currentAngle, setCurrentAngle] = useState(() => normalizeAngle(needleAngle));
  const isFirstRender = useRef(true);

  // Animate to new angle using shortest path (skips the initial placement).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // already seeded to the correct angle — don't animate on mount
    }

    const normalizedTarget = normalizeAngle(needleAngle);
    const normalizedCurrent = normalizeAngle(currentAngle);

    // Calculate the shortest angle difference
    const diff = angleDifference(normalizedCurrent, normalizedTarget);
    const targetAngle = currentAngle + diff;

    animatedAngle.value = duration === 0 ? targetAngle : withTiming(targetAngle, { duration });

    // Update current angle after animation completes
    setCurrentAngle(targetAngle);
  }, [needleAngle, duration, animatedAngle, currentAngle]);

  const needleRadius = context.radius * needleLength;

  // Animated style for the needle rotation
  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      animatedAngle.value,
      [-360, 0, 360, 720],
      [-360, 0, 360, 720]
    );

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: needleWidth,
          height: needleRadius,
          backgroundColor: needleColor,
          left: context.center.x - needleWidth / 2,
          top: context.center.y - needleRadius,
          transformOrigin: 'center bottom',
          borderRadius: needleWidth / 2,
       
        },
        animatedStyle,
      ]}
      {...rest}
    />
  );
});

// Center Component - renders center dot
export const GaugeCenter = factory<{
  props: GaugeCenterProps;
  ref: HTMLDivElement;
}>((props, ref) => {
  const {
    color,
    size = 8,
    show = true,
    children,
    ...rest
  } = props;
  
  const context = useGaugeContext();
  const theme = useTheme();

  if (!show && !children) return null;

  const centerColor = color || theme.colors.primary[5];
  const centerSize = size;

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {show && (
        <View
          style={{
            position: 'absolute',
            width: centerSize * 2,
            height: centerSize * 2,
            borderRadius: centerSize,
            backgroundColor: centerColor,
            left: context.center.x - centerSize,
            top: context.center.y - centerSize,
          }}
          {...rest}
        />
      )}
      {children}
    </View>
  );
});

// Compound component setup
const GaugeCompound = Gauge as typeof Gauge & {
  Track: typeof GaugeTrack;
  Range: typeof GaugeRange;
  Ticks: typeof GaugeTicks;
  Labels: typeof GaugeLabels;
  Needle: typeof GaugeNeedle;
  Center: typeof GaugeCenter;
};

GaugeCompound.Track = GaugeTrack;
GaugeCompound.Range = GaugeRange;
GaugeCompound.Ticks = GaugeTicks;
GaugeCompound.Labels = GaugeLabels;
GaugeCompound.Needle = GaugeNeedle;
GaugeCompound.Center = GaugeCenter;

// Display names
Gauge.displayName = 'Gauge';
GaugeTrack.displayName = 'Gauge.Track';
GaugeRange.displayName = 'Gauge.Range';
GaugeTicks.displayName = 'Gauge.Ticks';
GaugeLabels.displayName = 'Gauge.Labels';
GaugeNeedle.displayName = 'Gauge.Needle';
GaugeCenter.displayName = 'Gauge.Center';

export { GaugeCompound as GaugeWithCompound };
export * from './types';
export * from './utils';
