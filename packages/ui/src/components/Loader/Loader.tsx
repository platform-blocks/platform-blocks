import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { isWeb } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { resolveIconSize } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { LoaderProps } from './types';

// On web the loop is a native CSS animation (react-native-web keyframes)
// instead of reanimated: reanimated 4's infinite `withRepeat(..., -1)` loops
// don't run on web, which left every spinner frozen; CSS keyframes are immune
// to that and never touch the JS thread.

interface LoaderFactoryPayload {
  props: LoaderProps;
  ref: View;
}

const DEFAULT_LABEL = 'Loading';

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

function LoaderBase(props: LoaderProps, ref: React.Ref<View>) {
  const {
    size = 'md',
    color,
    variant = 'oval',
    speed = 1000,
    accessibilityLabel,
    style,
    testID,
    ...rest
  } = props;

  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);

  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const loaderSize = resolveIconSize(theme, size);
  const loaderColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];

  const animationValue = useSharedValue(0);

  useEffect(() => {
    // Web uses CSS keyframes (see the Web* loaders). Reduced motion: no loop at
    // all — the indicator stays put and `aria-busy` still says it is busy.
    if (isWeb || reducedMotion) {
      cancelAnimation(animationValue);
      animationValue.value = 0;
      return;
    }

    animationValue.value = withRepeat(withTiming(1, { duration: speed }), -1, false);

    return () => {
      cancelAnimation(animationValue);
    };
  }, [animationValue, speed, reducedMotion]);

  const animate = !reducedMotion;
  let indicator: React.ReactNode;
  if (isWeb) {
    const Web = variant === 'bars' ? WebBarsLoader : variant === 'dots' ? WebDotsLoader : WebOvalLoader;
    indicator = <Web size={loaderSize} color={loaderColor} speed={speed} animate={animate} />;
  } else {
    const Native = variant === 'bars' ? BarsLoader : variant === 'dots' ? DotsLoader : OvalLoader;
    indicator = <Native size={loaderSize} color={loaderColor} animationValue={animationValue} />;
  }

  return (
    <View
      ref={ref}
      style={[styles.root, { width: loaderSize, height: loaderSize }, spacingStyles, style]}
      testID={testID}
      // An indeterminate progressbar: busy, named, and with no value.
      {...a11yProps({
        role: 'progressbar',
        accessible: true,
        busy: true,
        label: accessibilityLabel ?? DEFAULT_LABEL,
      })}
      {...otherProps}
    >
      {indicator}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Web loaders — driven by react-native-web CSS keyframes (no reanimated).
// CRITICAL: react-native-web only compiles `animationKeyframes` on the atomic
// CSS path (a registered style sheet), never from inline styles — see RNW's
// compiler `inline()` ("No support for 'animationKeyframes'"). So the keyframes
// live in the module-level sheet below; only the plain animation timing props
// and the geometry/color are passed inline.
// ---------------------------------------------------------------------------

/** react-native-web's keyframes style, which React Native's style types don't model. */
interface WebKeyframesStyle {
  animationKeyframes: Array<Record<string, Record<string, string | number>>>;
  animationDuration: string;
  animationTimingFunction: string;
  animationIterationCount: 'infinite';
}

type WebLoaderAnimation = 'ovalSpin' | 'barPulse' | 'dotPulse';

const WEB_KEYFRAMES: Record<WebLoaderAnimation, WebKeyframesStyle> = {
  ovalSpin: {
    // Transforms inside keyframes must be CSS strings — RNW does not normalize
    // the RN `[{ rotate }]` array form here (it stringifies to "[object Object]").
    animationKeyframes: [{ '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }],
    animationDuration: '1000ms',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  barPulse: {
    animationKeyframes: [
      { '0%': { height: '30%' }, '30%': { height: '100%' }, '60%': { height: '30%' }, '100%': { height: '30%' } },
    ],
    animationDuration: '1000ms',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  dotPulse: {
    animationKeyframes: [
      {
        '0%': { opacity: 0.5, transform: 'scale(0.8)' },
        '30%': { opacity: 1, transform: 'scale(1.2)' },
        '60%': { opacity: 0.5, transform: 'scale(0.8)' },
        '100%': { opacity: 0.5, transform: 'scale(0.8)' },
      },
    ],
    animationDuration: '1000ms',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
};

// Registered once, on web only. The cast is the one place RN's types meet RNW's keyframes.
const webKeyframes = isWeb
  ? StyleSheet.create(WEB_KEYFRAMES as unknown as Record<WebLoaderAnimation, ViewStyle>)
  : null;

interface WebLoaderProps {
  size: number;
  color: string;
  speed: number;
  /** False under reduced motion: the keyframes are not attached at all. */
  animate: boolean;
}

/** The keyframes style plus its timing, or nothing when not animating. */
function useWebAnimation(name: WebLoaderAnimation, animate: boolean, speed: number, delay = 0) {
  return useMemo(
    () =>
      animate && webKeyframes
        ? [webKeyframes[name], webStyle({ animationDuration: `${speed}ms`, animationDelay: `${delay}ms` })]
        : null,
    [name, animate, speed, delay]
  );
}

function WebOvalLoader({ size, color, speed, animate }: WebLoaderProps) {
  const animation = useWebAnimation('ovalSpin', animate, speed);
  return (
    <View
      style={[
        animation,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(2, size / 10),
          borderTopColor: color,
          borderEndColor: 'transparent',
          borderBottomColor: 'transparent',
          borderStartColor: 'transparent',
        },
      ]}
    />
  );
}

function WebBar({ index, size, color, speed, animate }: WebLoaderProps & { index: number }) {
  const barWidth = size / 8;
  const animation = useWebAnimation('barPulse', animate, speed, index * (speed / 6));
  return (
    <View
      style={[
        animation,
        {
          width: barWidth,
          height: '30%',
          backgroundColor: color,
          marginHorizontal: barWidth / 4,
          borderRadius: barWidth / 2,
        },
      ]}
    />
  );
}

function WebBarsLoader(props: WebLoaderProps) {
  return (
    <View style={[styles.barsRow, { height: props.size }]}>
      {[0, 1, 2].map((index) => (
        <WebBar key={index} index={index} {...props} />
      ))}
    </View>
  );
}

function WebDot({ index, size, color, speed, animate }: WebLoaderProps & { index: number }) {
  const dotSize = size / 4;
  const animation = useWebAnimation('dotPulse', animate, speed, index * (speed / 6));
  return (
    <View
      style={[
        animation,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
          marginHorizontal: dotSize / 4,
        },
      ]}
    />
  );
}

function WebDotsLoader(props: WebLoaderProps) {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((index) => (
        <WebDot key={index} index={index} {...props} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Native loaders — one shared reanimated loop (0 → 1), which never starts
// under reduced motion (each shape then rests at its 0 frame).
// ---------------------------------------------------------------------------

interface NativeLoaderProps {
  size: number;
  color: string;
  animationValue: SharedValue<number>;
}

// Oval Loader (rotating circle with border)
function OvalLoader({ size, color, animationValue }: NativeLoaderProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(animationValue.value, [0, 1], [0, 360]);
    return { transform: [{ rotate: `${rotation}deg` }] };
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(2, size / 10),
          borderTopColor: color,
          borderEndColor: 'transparent',
          borderBottomColor: 'transparent',
          borderStartColor: 'transparent',
        },
        animatedStyle
      ]}
    />
  );
}

function Bar({ index, size, color, animationValue }: NativeLoaderProps & { index: number }) {
  const barWidth = size / 8;
  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animationValue.value,
      [0, 0.2 + index * 0.2, 0.6 + index * 0.2, 1],
      [size * 0.3, size, size * 0.3, size * 0.3],
      Extrapolation.CLAMP
    );
    return { height };
  });

  return (
    <Animated.View
      style={[
        {
          width: barWidth,
          backgroundColor: color,
          marginHorizontal: barWidth / 4,
          borderRadius: barWidth / 2
        },
        animatedStyle
      ]}
    />
  );
}

// Bars Loader (animated bars)
function BarsLoader(props: NativeLoaderProps) {
  return (
    <View style={[styles.barsRow, { height: props.size }]}>
      {[0, 1, 2].map((index) => (
        <Bar key={index} index={index} {...props} />
      ))}
    </View>
  );
}

function Dot({ index, size, color, animationValue }: NativeLoaderProps & { index: number }) {
  const dotSize = size / 4;
  const animatedStyle = useAnimatedStyle(() => {
    const input = [0, 0.2 + index * 0.2, 0.6 + index * 0.2, 1];
    const scale = interpolate(animationValue.value, input, [0.8, 1.2, 0.8, 0.8], Extrapolation.CLAMP);
    const opacity = interpolate(animationValue.value, input, [0.5, 1, 0.5, 0.5], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View
      style={[
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
          marginHorizontal: dotSize / 4,
        },
        animatedStyle
      ]}
    />
  );
}

// Dots Loader (pulsing dots)
function DotsLoader(props: NativeLoaderProps) {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((index) => (
        <Dot key={index} index={index} {...props} />
      ))}
    </View>
  );
}

export const Loader = factory<LoaderFactoryPayload>(LoaderBase, { displayName: 'Loader' });

Loader.displayName = 'Loader';
