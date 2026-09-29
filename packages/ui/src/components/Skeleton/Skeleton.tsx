import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  cancelAnimation,
  Easing
} from 'react-native-reanimated';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { getControlSize, resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, resolveStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { SkeletonProps, SkeletonShape, SkeletonFactoryPayload } from './types';

const styles = StyleSheet.create({
  root: { overflow: 'hidden' },
  pulse: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 },
});

const toNumber = (value: number | 'auto') => (value === 'auto' ? 0 : value);

/** Default box for a shape, from the theme's control size (`w` / `h` win). */
function getShapeMetrics(
  theme: PlatformBlocksTheme,
  shape: SkeletonShape,
  size: SizeValue
): { width: DimensionValue; height: DimensionValue; radius: number } {
  const control = getControlSize(theme, size);
  const height = control.height;

  switch (shape) {
    case 'text':
      return { width: '100%', height: toNumber(resolveSpacing(theme, 'md')), radius: resolveRadius(theme, 'sm') };
    case 'chip':
      return { width: height * 3, height, radius: height / 2 };
    case 'avatar':
    case 'circle':
      return { width: height, height, radius: height / 2 };
    case 'button':
      // Matches the Button it stands in for.
      return { width: height * 4, height, radius: control.radius };
    case 'card':
      return { width: '100%', height: height * 6, radius: resolveRadius(theme, 'xl') };
    case 'rounded':
      return { width: '100%', height, radius: resolveRadius(theme, 'xl') };
    case 'rectangle':
    default:
      return { width: '100%', height, radius: 0 };
  }
}

function SkeletonBase(props: SkeletonProps, ref: React.Ref<View>) {
  const {
    shape = 'rectangle',
    w,
    h,
    size = 'md',
    radius,
    animate = true,
    animationDuration = 1500,
    colors,
    accessibilityLabel,
    style,
    testID,
    ...rest
  } = props;

  // `w` / `h` replace the shape's default box below, so they are not in `rest`.
  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);

  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  // A pulse is decoration; under reduced motion the placeholder is simply static.
  const animated = animate && !reducedMotion;
  const animationProgress = useSharedValue(0);

  const baseColor = colors?.[0] || theme.backgrounds.border;
  const highlightColor = colors?.[1] || theme.backgrounds.borderStrong;

  useEffect(() => {
    if (!animated) {
      cancelAnimation(animationProgress);
      return;
    }

    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: animationDuration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    return () => cancelAnimation(animationProgress);
  }, [animated, animationDuration, animationProgress]);

  const boxStyle = useMemo(() => {
    const metrics = getShapeMetrics(theme, shape, size);
    const box = resolveStyleProps({ w, h });
    return {
      backgroundColor: baseColor,
      width: box.width ?? metrics.width,
      height: box.height ?? metrics.height,
      borderRadius: radius !== undefined ? resolveRadius(theme, radius) : metrics.radius,
    };
  }, [theme, shape, size, w, h, radius, baseColor]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: highlightColor,
    opacity: interpolate(animationProgress.value, [0, 1], [0.3, 1]),
  }));

  return (
    <View
      ref={ref}
      style={[styles.root, boxStyle, spacingStyles, style]}
      testID={testID}
      {...(accessibilityLabel
        ? a11yProps({ role: 'status', accessible: true, busy: true, label: accessibilityLabel })
        : a11yProps({ hidden: true }))}
      {...otherProps}
    >
      {animated && (
        <Animated.View style={[styles.pulse, { borderRadius: boxStyle.borderRadius }, animatedStyle]} />
      )}
    </View>
  );
}

export const Skeleton = factory<SkeletonFactoryPayload>(SkeletonBase, { displayName: 'Skeleton' });

Skeleton.displayName = 'Skeleton';
