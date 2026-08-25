import React, { useEffect, useMemo, useRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { GradientTextProps } from './types';
import { resolveOptionalModule } from '../../utils/optionalModule';

/**
 * Resolved lazily so apps that never render a GradientText neither bundle
 * @react-native-masked-view/masked-view nor need it installed. Without it, the
 * native branch falls back to plain text in the first gradient color.
 */
const resolveMaskedView = () =>
  resolveOptionalModule<any>('@react-native-masked-view/masked-view', {
    accessor: (mod) => mod?.default ?? mod,
    devWarning:
      '@react-native-masked-view/masked-view is not installed; <GradientText> renders plain colored text on native instead of a gradient.',
  });
import { resolveLinearGradient } from '../../utils/optionalDependencies';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

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
  return `pb-gradient-sweep-${encode(fromPercent)}-${encode(toPercent)}-${encode(holdRatio)}`;
}

/** Insert the rule for {@link sweepKeyframeName} if it isn't already present. */
function injectSweepKeyframes(name: string, fromPercent: number, toPercent: number, holdRatio: number) {
  if (typeof document === 'undefined' || injectedKeyframes.has(name)) return;

  if (!keyframeStyleEl) {
    keyframeStyleEl = document.createElement('style');
    keyframeStyleEl.setAttribute('data-platform-blocks', 'gradient-text');
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
export const GradientText = React.forwardRef<View, GradientTextProps>(
  (
    {
      children,
      colors,
      locations,
      angle = 0,
      start,
      end,
      position: controlledPosition,
      animation,
      testID,
      ...textProps
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const hasValidColors = Array.isArray(colors) && colors.length >= 2;
    const resolvedColors = useMemo(() => {
      if (Array.isArray(colors) && colors.length >= 2) {
        return colors;
      }

      if (Array.isArray(colors) && colors.length > 0) {
        return [colors[0], colors[0]];
      }

      return ['#000000', '#000000'];
    }, [colors]);

    useEffect(() => {
      if (!hasValidColors) {
        console.warn('GradientText requires at least 2 colors');
      }
    }, [hasValidColors]);

    // Calculate gradient start and end points based on angle or custom points
    const getGradientPoints = (pos: number = 0) => {
      if (start && end) {
        // Use custom start/end points with position offset
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const offsetX = dx * pos;
        const offsetY = dy * pos;
        
        return {
          start: [start[0] - offsetX, start[1] - offsetY],
          end: [end[0] - offsetX, end[1] - offsetY],
        };
      }

      // Convert angle to radians
      const radians = (angle * Math.PI) / 180;
      
      // Calculate start and end points based on angle
      // 0° = left to right, 90° = top to bottom, etc.
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      
      // Base points without position offset
      let startX = 0.5 - cos * 0.5;
      let startY = 0.5 - sin * 0.5;
      let endX = 0.5 + cos * 0.5;
      let endY = 0.5 + sin * 0.5;
      
      // Apply position offset (moves gradient along the angle direction)
      const offsetX = cos * pos;
      const offsetY = sin * pos;
      
      startX += offsetX;
      startY += offsetY;
      endX += offsetX;
      endY += offsetY;
      
      return {
        start: [startX, startY],
        end: [endX, endY],
      };
    };

    // Calculate color locations
    const colorLocations = useMemo(() => {
      if (locations && locations.length === resolvedColors.length) {
        return locations;
      }

      const divisor = resolvedColors.length > 1 ? resolvedColors.length - 1 : 1;
      return resolvedColors.map((_, index) => (divisor === 0 ? 0 : index / divisor));
    }, [locations, resolvedColors]);

    // Current position (animated or controlled)
  const getCurrentPosition = () => controlledPosition ?? 0;

    const isWeb = Platform.OS === 'web';
    const currentPosition = getCurrentPosition();
    const cssAngle = angle + 90;
    const colorStops = resolvedColors
      .map((color, i) => {
        const location = colorLocations[i];
        return `${color} ${location * 100}%`;
      })
      .join(', ');
    const positionPercent = (1 - currentPosition) * 100;

    // A CSS animation outranks the inline `background-position` below while it
    // runs, so the sweep needs no per-frame JavaScript and no re-render.
    const sweep = useMemo(() => {
      if (!isWeb || !animation) return null;

      const { from, to, duration, delay = 0, repeat = false, repeatDelay = 0 } = animation;
      const sweepSeconds = Math.max(0.001, duration);
      const total = sweepSeconds + Math.max(0, repeat ? repeatDelay : 0);
      const fromPercent = (1 - from) * 100;
      const toPercent = (1 - to) * 100;
      const holdRatio = 1 - sweepSeconds / total;

      return {
        name: sweepKeyframeName(fromPercent, toPercent, holdRatio),
        fromPercent,
        toPercent,
        holdRatio,
        css: `${sweepKeyframeName(fromPercent, toPercent, holdRatio)} ${total}s linear ${delay}s ${repeat ? 'infinite' : '1'} both`,
      };
    }, [isWeb, animation]);

    useEffect(() => {
      if (!isWeb || !hasValidColors) return;
      if (!containerRef.current) return;

      if (sweep) {
        injectSweepKeyframes(sweep.name, sweep.fromPercent, sweep.toPercent, sweep.holdRatio);
      }

      const container = containerRef.current as any;
      const allElements = [container, ...Array.from(container.querySelectorAll('*'))];
      const animationCss = sweep?.css ?? '';

      allElements.forEach((element: HTMLElement) => {
        element.style.background = `linear-gradient(${cssAngle}deg, ${colorStops})`;
        element.style.backgroundSize = '200% 200%';
        element.style.backgroundPosition = `${positionPercent}% 0`;
        element.style.webkitBackgroundClip = 'text';
        element.style.webkitTextFillColor = 'transparent';
        element.style.backgroundClip = 'text';
        element.style.color = 'transparent';
        element.style.animation = animationCss;
      });
    }, [isWeb, hasValidColors, cssAngle, colorStops, positionPercent, sweep]);

    if (!hasValidColors) {
      return (
        <Text {...textProps}>
          {children}
        </Text>
      );
    }

    // Web-specific gradient implementation with animation
    if (!hasLinearGradient) {
      return (
        <View ref={ref} testID={testID} style={styles.container}>
          <Text {...textProps}>{children}</Text>
        </View>
      );
    }

    if (isWeb) {
      return (
        <View
          ref={containerRef as any}
          data-testid={testID}
          style={{ display: 'inline-block' } as any}
        >
          <Text
            {...textProps}
            data-text-inner="true"
          >
            {children}
          </Text>
        </View>
      );
    }

    // Native implementation using MaskedView with LinearGradient
    // Note: Gradient animation is not supported on native yet
    const { start: gradientStart, end: gradientEnd } = getGradientPoints(getCurrentPosition());
    
    // Ensure we have at least 2 colors for the tuple type
    const gradientColors = resolvedColors.length >= 2
      ? resolvedColors as [string, string, ...string[]]
      : [resolvedColors[0] || '#000', resolvedColors[0] || '#000'] as [string, string];
    const gradientLocations = colorLocations.length >= 2
      ? colorLocations as [number, number, ...number[]]
      : [0, 1] as [number, number];

    const MaskedView = resolveMaskedView();

    if (!MaskedView) {
      return (
        <Text
          ref={ref as any}
          {...textProps}
          style={[textProps.style, { color: resolvedColors[0] || undefined }]}
        >
          {children}
        </Text>
      );
    }

    return (
      <MaskedView
        ref={ref as any}
        testID={testID}
        style={styles.container}
        maskElement={
          <View style={styles.maskContainer}>
            <Text {...textProps} style={[textProps.style, styles.maskText]}>
              {children}
            </Text>
          </View>
        }
      >
            <OptionalLinearGradient
          colors={gradientColors}
          locations={gradientLocations}
          start={gradientStart as [number, number]}
          end={gradientEnd as [number, number]}
          style={styles.gradient}
        >
          {/* Transparent text to maintain layout */}
          <Text {...textProps} style={[textProps.style, styles.transparentText]}>
            {children}
          </Text>
            </OptionalLinearGradient>
      </MaskedView>
    );
  }
);

GradientText.displayName = 'GradientText';

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
  maskText: {
    // This text acts as the mask - only opaque parts will show the gradient
  },
  transparentText: {
    opacity: 0,
  },
});
