import React, { useEffect, useInsertionEffect, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { hasDOM, isWeb } from '../../core/platform/flags';
import { webStyle, type WebStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { warnOnce } from '../../core/utils/logger';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { defaultExportOf, resolveOptionalModule } from '../../utils/optionalModule';
import { Text } from '../Text/Text';
import type { GradientTextProps } from './types';

interface MaskedViewProps {
  maskElement: React.ReactElement;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Resolved lazily so apps that never render a GradientText neither bundle
 * @react-native-masked-view/masked-view nor need it installed. Without it, the
 * native branch falls back to plain text in the first gradient color.
 */
const resolveMaskedView = () =>
  resolveOptionalModule<React.ComponentType<MaskedViewProps>>('@react-native-masked-view/masked-view', {
    accessor: (mod) => defaultExportOf<React.ComponentType<MaskedViewProps>>(mod),
    devWarning:
      '@react-native-masked-view/masked-view is not installed; <GradientText> renders plain colored text on native instead of a gradient.',
  });

/** Native only, and resolved on first use so web never looks for expo-linear-gradient. */
let linearGradient: ReturnType<typeof resolveLinearGradient> | null = null;
const getLinearGradient = () => (linearGradient ??= resolveLinearGradient());

/** Web-only CSS for the gradient fill beyond `WebStyle`. */
interface GradientWebStyle extends WebStyle {
  backgroundSize?: string;
  backgroundPosition?: string;
}

const WEB_CONTAINER_STYLE = webStyle({ display: 'inline-block' });

// Keyframes for animated sweeps are injected once per unique shape and shared by
// every instance, so N gradient texts cost one stylesheet rule rather than N.
const injectedKeyframes = new Set<string>();
let keyframeStyleEl: HTMLStyleElement | null = null;

/**
 * Name for a sweep of `background-position` from `fromPercent` to `toPercent`
 * that holds at the end for `holdRatio` of the timeline. Pure — two sweeps with
 * the same shape share one keyframes rule.
 */
function sweepKeyframeName(fromPercent: number, toPercent: number, holdRatio: number): string {
  // Names must be valid CSS identifiers, so encode the (possibly negative,
  // possibly fractional) percentages rather than interpolating them raw.
  const encode = (n: number) => Math.round(n * 100).toString().replace('-', 'n');
  return `plocks-gradient-sweep-${encode(fromPercent)}-${encode(toPercent)}-${encode(holdRatio)}`;
}

/** Insert the rule for {@link sweepKeyframeName} if it isn't already present. */
function injectSweepKeyframes(name: string, fromPercent: number, toPercent: number, holdRatio: number) {
  if (!hasDOM || injectedKeyframes.has(name)) return;

  if (!keyframeStyleEl) {
    keyframeStyleEl = document.createElement('style');
    keyframeStyleEl.setAttribute('data-plocks', 'gradient-text');
    document.head.appendChild(keyframeStyleEl);
  }

  const sweepEnd = Math.max(0, Math.min(100, (1 - holdRatio) * 100));
  const rule = sweepEnd >= 100
    ? `@keyframes ${name}{from{background-position:${fromPercent}% 0}to{background-position:${toPercent}% 0}}`
    : `@keyframes ${name}{0%{background-position:${fromPercent}% 0}`
      + `${sweepEnd}%{background-position:${toPercent}% 0}`
      + `100%{background-position:${toPercent}% 0}}`;

  keyframeStyleEl.sheet?.insertRule(rule, keyframeStyleEl.sheet.cssRules.length);
  injectedKeyframes.add(name);
}

/**
 * GradientText Component
 * 
 * Renders text with a gradient color effect using linear gradients.
 * Displays text using a linear gradient fill across the glyphs.
 * 
 * **Note**: For native platforms (iOS/Android), gradient animation is currently
 * supported on web only. Native platforms show static gradients.
 * 
 * @example
 * ```tsx
 * // Basic gradient
 * <GradientText colors={['#FF0080', '#7928CA']}>
 *   Hello World
 * </GradientText>
 *
 * // Custom gradient direction
 * <GradientText 
 *   colors={['red', 'blue']} 
 *   angle={45}
 * >
 *   Diagonal Gradient
 * </GradientText>
 * 
 * // Controlled gradient position (web only)
 * <GradientText 
 *   colors={['#FF0080', '#7928CA']} 
 *   position={0.5}
 * >
 *   Mid Position
 * </GradientText>
 * ```
 */
export const GradientText = factory<{ props: GradientTextProps; ref: View }>(
  (props, ref) => {
    const { styleProps, otherProps } = extractStyleProps(props);
    const {
      children,
      colors,
      locations,
      angle = 0,
      start,
      end,
      position: controlledPosition,
      animation,
      testID,
      style,
      ...textProps
    } = otherProps;
    const spacingStyle = useStyleProps(styleProps);
    const theme = useTheme();
    const reducedMotion = useReducedMotion();

    const hasValidColors = Array.isArray(colors) && colors.length >= 2;
    const resolvedColors = useMemo(() => {
      if (Array.isArray(colors) && colors.length >= 2) return colors;
      if (Array.isArray(colors) && colors.length > 0) return [colors[0], colors[0]];
      return [theme.text.primary, theme.text.primary];
    }, [colors, theme.text.primary]);

    useEffect(() => {
      if (!hasValidColors) {
        warnOnce('gradient-text:colors', 'GradientText requires at least 2 colors');
      }
    }, [hasValidColors]);

    // Calculate color locations
    const colorLocations = useMemo(() => {
      if (locations && locations.length === resolvedColors.length) return locations;
      const divisor = resolvedColors.length > 1 ? resolvedColors.length - 1 : 1;
      return resolvedColors.map((_, index) => index / divisor);
    }, [locations, resolvedColors]);

    const currentPosition = controlledPosition ?? 0;

    // A CSS animation outranks the inline `background-position` while it runs,
    // so the sweep needs no per-frame JavaScript and no re-render. Skipped
    // entirely under reduced motion (the gradient rests at `position`).
    const sweep = useMemo(() => {
      if (!isWeb || !animation || reducedMotion) return null;

      const { from, to, duration, delay = 0, repeat = false, repeatDelay = 0 } = animation;
      const sweepSeconds = Math.max(0.001, duration);
      const total = sweepSeconds + Math.max(0, repeat ? repeatDelay : 0);
      const fromPercent = (1 - from) * 100;
      const toPercent = (1 - to) * 100;
      const holdRatio = 1 - sweepSeconds / total;
      const name = sweepKeyframeName(fromPercent, toPercent, holdRatio);

      return { name, fromPercent, toPercent, holdRatio, total, delay, repeat };
    }, [animation, reducedMotion]);

    // Keyframes must exist before the inline animation that names them applies.
    useInsertionEffect(() => {
      if (sweep) injectSweepKeyframes(sweep.name, sweep.fromPercent, sweep.toPercent, sweep.holdRatio);
    }, [sweep]);

    const webGradientStyle = useMemo((): TextStyle | null => {
      if (!isWeb || !hasValidColors) return null;
      const colorStops = resolvedColors
        .map((color, i) => `${color} ${colorLocations[i] * 100}%`)
        .join(', ');
      const css: GradientWebStyle = {
        backgroundImage: `linear-gradient(${angle + 90}deg, ${colorStops})`,
        backgroundSize: '200% 200%',
        backgroundPosition: `${(1 - currentPosition) * 100}% 0`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        // Inherited, so nested Text children show the gradient too.
        WebkitTextFillColor: 'transparent',
        ...(sweep
          ? {
              animationName: sweep.name,
              animationDuration: `${sweep.total}s`,
              animationTimingFunction: 'linear',
              animationDelay: `${sweep.delay}s`,
              animationIterationCount: sweep.repeat ? 'infinite' : 1,
              animationFillMode: 'both',
            }
          : null),
      };
      // Text renders a DOM element on web and passes CSS through; this is where
      // the web-only keys cross into React Native's style type.
      return css as unknown as TextStyle;
    }, [hasValidColors, resolvedColors, colorLocations, angle, currentPosition, sweep]);

    if (!hasValidColors) {
      return (
        <View ref={ref} testID={testID} style={[styles.container, WEB_CONTAINER_STYLE, spacingStyle]}>
          <Text {...textProps} style={style}>
            {children}
          </Text>
        </View>
      );
    }

    if (isWeb) {
      return (
        <View ref={ref} testID={testID} style={[WEB_CONTAINER_STYLE, spacingStyle]}>
          <Text {...textProps} style={[style, webGradientStyle]}>
            {children}
          </Text>
        </View>
      );
    }

    // Native: a MaskedView over a LinearGradient. The sweep animation is web-only.
    const { LinearGradient, hasLinearGradient } = getLinearGradient();
    const MaskedView = hasLinearGradient ? resolveMaskedView() : null;

    if (!MaskedView) {
      return (
        <View ref={ref} testID={testID} style={[styles.container, spacingStyle]}>
          <Text {...textProps} style={[style, { color: resolvedColors[0] }]}>
            {children}
          </Text>
        </View>
      );
    }

    const { start: gradientStart, end: gradientEnd } = getGradientPoints(angle, start, end, currentPosition);

    return (
      <View ref={ref} testID={testID} style={[styles.container, spacingStyle]}>
        <MaskedView
          style={styles.container}
          maskElement={
            <View style={styles.maskContainer}>
              {/* The mask copy is visual only; the transparent copy below carries the text. */}
              <Text {...textProps} style={style} aria-hidden importantForAccessibility="no-hide-descendants">
                {children}
              </Text>
            </View>
          }
        >
          <LinearGradient
            colors={resolvedColors}
            locations={colorLocations}
            start={gradientStart}
            end={gradientEnd}
            style={styles.gradient}
          >
            {/* Transparent text to maintain layout */}
            <Text {...textProps} style={[style, styles.transparentText]}>
              {children}
            </Text>
          </LinearGradient>
        </MaskedView>
      </View>
    );
  },
  { displayName: 'GradientText' }
);

/** Gradient start / end points from the angle (or explicit points), shifted by `pos` along the line. */
function getGradientPoints(
  angle: number,
  start: [number, number] | undefined,
  end: [number, number] | undefined,
  pos: number
): { start: [number, number]; end: [number, number] } {
  if (start && end) {
    const offsetX = (end[0] - start[0]) * pos;
    const offsetY = (end[1] - start[1]) * pos;
    return {
      start: [start[0] - offsetX, start[1] - offsetY],
      end: [end[0] - offsetX, end[1] - offsetY],
    };
  }

  // 0° = left to right, 90° = top to bottom, etc.
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const offsetX = cos * pos;
  const offsetY = sin * pos;

  return {
    start: [0.5 - cos * 0.5 + offsetX, 0.5 - sin * 0.5 + offsetY],
    end: [0.5 + cos * 0.5 + offsetX, 0.5 + sin * 0.5 + offsetY],
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  gradient: {
    flexDirection: 'row',
  },
  maskContainer: {
    backgroundColor: 'transparent',
  },
  transparentText: {
    opacity: 0,
  },
});
