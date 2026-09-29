import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Text } from '../Text';
import type { RingProps, RingRenderContext } from './types';

interface RingFactoryPayload {
  props: RingProps;
  ref: View;
}

const clampValue = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const getColorFromStops = (percent: number, stops: RingProps['colorStops']) => {
  if (!stops || stops.length === 0) {
    return undefined;
  }

  const sorted = [...stops].sort((a, b) => a.value - b.value);
  let resolved = sorted[0].color;

  for (let index = 0; index < sorted.length; index += 1) {
    if (percent >= sorted[index].value) {
      resolved = sorted[index].color;
    } else {
      break;
    }
  }

  return resolved;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    start: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const Ring = factory<RingFactoryPayload>((props, ref) => {
  const {
    value,
    min = 0,
    max = 100,
    size = 100,
    thickness = 12,
    caption,
    label,
    subLabel,
    showValue = true,
    valueFormatter,
    trackColor,
    progressColor,
    colorStops,
    neutral = false,
    roundedCaps = true,
    style,
    ringStyle,
    contentStyle,
    labelStyle,
    subLabelStyle,
    captionStyle,
    labelColor,
    subLabelColor,
    captionColor,
    children,
    testID,
    accessibilityLabel,
    ...rest
  } = props;

  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);
  const theme = useTheme();

  const { clampedValue, percent, radius, circumference, dashOffset } = useMemo(() => {
    const safeMin = Number.isFinite(min) ? min : 0;
    const safeMax = Number.isFinite(max) ? max : 100;
    const range = safeMax === safeMin ? 1 : safeMax - safeMin;
    const clamped = clampValue(value, Math.min(safeMin, safeMax), Math.max(safeMin, safeMax));
    const normalized = (clamped - safeMin) / range;
    const bounded = Number.isFinite(normalized) ? Math.min(Math.max(normalized, 0), 1) : 0;
    const effectiveSize = Math.max(size, thickness);
    const computedRadius = Math.max((effectiveSize - thickness) / 2, 0);
    const computedCircumference = 2 * Math.PI * computedRadius;
    const offset = computedCircumference - computedCircumference * bounded;

    return {
      clampedValue: clamped,
      percent: bounded * 100,
      radius: computedRadius,
      circumference: computedCircumference,
      dashOffset: offset,
    };
  }, [min, max, size, thickness, value]);

  const defaultTrackColor = trackColor ?? theme.backgrounds.border;
  const secondaryTextColor = subLabelColor ?? theme.text.secondary;
  const captionTextColor = captionColor ?? theme.text.muted;

  const resolvedProgressColor = useMemo(() => {
    if (neutral) {
      return defaultTrackColor;
    }

    if (typeof progressColor === 'function') {
      return progressColor(clampedValue, percent);
    }

    if (typeof progressColor === 'string') {
      return progressColor;
    }

    const stopColor = getColorFromStops(percent, colorStops);
    if (stopColor) {
      return stopColor;
    }

    return theme.colors.primary[5];
  }, [colorStops, clampedValue, percent, progressColor, neutral, defaultTrackColor, theme.colors]);

  const formattedValue = useMemo(() => {
    if (!showValue) {
      return undefined;
    }

    if (valueFormatter) {
      return valueFormatter(clampedValue, percent);
    }

    return `${Math.round(percent)}%`;
  }, [showValue, valueFormatter, clampedValue, percent]);

  const renderContext: RingRenderContext = useMemo(() => ({
    value: clampedValue,
    percent,
    min,
    max,
  }), [clampedValue, percent, min, max]);

  const centerContent = useMemo(() => {
    if (typeof children === 'function') {
      return children(renderContext);
    }
    if (children !== undefined && children !== null) {
      return children;
    }

    const primary = label ?? formattedValue;
    const secondary = label ? (subLabel ?? formattedValue) : subLabel;

    return (
      <>
        {primary !== undefined && primary !== null ? (
          React.isValidElement(primary) ? (
            primary
          ) : (
            <Text variant="span" size="lg" fw="700" c={labelColor} style={labelStyle}>
              {primary}
            </Text>
          )
        ) : null}
        {secondary !== undefined && secondary !== null ? (
          React.isValidElement(secondary) ? (
            secondary
          ) : (
            <Text variant="span" size="sm" c={secondaryTextColor} fw="600" style={[{ marginTop: 2 }, subLabelStyle]}>
              {secondary}
            </Text>
          )
        ) : null}
      </>
    );
  }, [children, renderContext, label, formattedValue, subLabel, labelColor, labelStyle, subLabelStyle, secondaryTextColor]);

  // Named by the explicit label, else the caption, else a text center label.
  // The value itself travels as aria-value* (plus the displayed text, when it is text).
  const accessibleName = accessibilityLabel ?? (getNodeText(caption) || getNodeText(label) || undefined);
  const valueText = typeof formattedValue === 'string' || typeof formattedValue === 'number'
    ? String(formattedValue)
    : undefined;

  return (
    <View
      ref={ref}
      style={[styles.container, spacingStyles, style]}
      testID={testID}
      {...a11yProps({
        role: 'progressbar',
        // One node on native, so the label and value are read together.
        accessible: true,
        label: accessibleName,
        value: { min, max, now: clampedValue, text: valueText },
      })}
      {...otherProps}
    >
      <View style={[styles.ringWrapper, { width: size, height: size }, ringStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={defaultTrackColor}
            strokeWidth={thickness}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={resolvedProgressColor}
            strokeWidth={thickness}
            strokeLinecap={roundedCaps ? 'round' : 'butt'}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View pointerEvents="none" style={[styles.centerContent, { width: size, height: size }, contentStyle]}>
          {centerContent}
        </View>
      </View>
      {caption !== undefined && caption !== null ? (
        React.isValidElement(caption) ? (
          caption
        ) : (
          <Text
            variant="span"
            size="xs"
            c={captionTextColor}
            fw="600"
            style={[{ marginTop: 6, letterSpacing: 1 }, captionStyle]}
          >
            {caption}
          </Text>
        )
      ) : null}
    </View>
  );
}, { displayName: 'Ring' });

export default Ring;
