import React from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '../../../core/motion/useReducedMotion';
import { parsePx } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/ThemeProvider';

export interface PressAnimationProps extends Omit<PressableProps, 'style'> {
  /** Scale factor when pressed (default: 0.97) */
  pressScale?: number;
  /** Opacity when pressed (default: 0.8) */
  pressOpacity?: number;
  /** Animation type */
  variant?: 'scale' | 'opacity' | 'both';
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Disable the animation */
  disableAnimation?: boolean;
  /** Children to render */
  children: React.ReactNode;
}

/** `'150ms'` → 150 (theme motion durations are CSS strings). */
const toMs = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const ms = /^\s*([\d.]+)\s*ms\s*$/i.exec(value);
  if (ms) return parseFloat(ms[1]);
  return parsePx(value) ?? fallback;
};

/**
 * Pressable with press feedback (scale and/or opacity) on Reanimated shared
 * values, timed by the theme's motion tokens. Under reduced motion the press
 * state applies instantly (no animation); `disableAnimation` turns it off.
 */
export const PressAnimation: React.FC<PressAnimationProps> = ({
  pressScale = 0.97,
  pressOpacity = 0.8,
  variant = 'both',
  style,
  disableAnimation = false,
  children,
  onPressIn,
  onPressOut,
  ...pressableProps
}) => {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatesScale = !disableAnimation && (variant === 'scale' || variant === 'both');
  const animatesOpacity = !disableAnimation && (variant === 'opacity' || variant === 'both');
  const pressInDuration = reducedMotion ? 0 : toMs(theme.motion?.duration?.fast, 150);
  const pressOutDuration = reducedMotion ? 0 : toMs(theme.motion?.duration?.normal, 250);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatesScale ? scale.value : 1 }],
    opacity: animatesOpacity ? opacity.value : 1,
  }));

  const animateTo = (target: { value: number }, toValue: number, duration: number) => {
    target.value = duration === 0 ? toValue : withTiming(toValue, { duration });
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    if (animatesScale) animateTo(scale, pressScale, pressInDuration);
    if (animatesOpacity) animateTo(opacity, pressOpacity, pressInDuration);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (animatesScale) animateTo(scale, 1, pressOutDuration);
    if (animatesOpacity) animateTo(opacity, 1, pressOutDuration);
    onPressOut?.(event);
  };

  return (
    <Pressable {...pressableProps} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
};

/**
 * Wraps a component in `PressAnimation`. Press props (`onPress`, …) go to the
 * wrapper; everything else to the component.
 */
export function withPressAnimation<T extends object>(
  Component: React.ComponentType<T>,
  animationProps?: Partial<Omit<PressAnimationProps, 'children'>>
) {
  function WithPressAnimation(props: T & { style?: StyleProp<ViewStyle> }) {
    return (
      <PressAnimation {...animationProps} style={props.style}>
        <Component {...props} />
      </PressAnimation>
    );
  }
  WithPressAnimation.displayName = `withPressAnimation(${Component.displayName || Component.name || 'Component'})`;
  return WithPressAnimation;
}

/**
 * Pre-built animated button component for common use cases
 */
export const AnimatedPressable = PressAnimation;
