import React, { useCallback, useEffect, useInsertionEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  type ColorValue,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { factory } from '../../core/factory/factory';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { hasDOM, isWeb } from '../../core/platform/flags';
import { webStyle, type WebStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { isDev, devLog } from '../../core/utils/logger';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { defaultExportOf, resolveOptionalModule } from '../../utils/optionalModule';
import { Text } from '../Text/Text';
import type { ShimmerTextProps } from './types';

/**
 * ShimmerText
 *
 * ## The one invariant
 *
 * A single highlight band travels across the text once per cycle, and it is
 * parked *entirely outside the text box at both ends of the timeline*. The last
 * frame of a cycle and the first frame of the next therefore paint exactly the
 * same thing — no highlight anywhere — so the wrap is invisible by
 * construction. Colours, spread, direction and delays only change how the band
 * looks or how fast it moves; none of them can reintroduce a seam.
 *
 * The earlier implementation broke that invariant on web: it left
 * `background-repeat` at its `repeat` default (the `background` shorthand
 * resets it) while sweeping 3x the text width across a 2x-wide tile. The
 * gradient repeated every 2x, so every wrap snapped the pattern sideways by a
 * full text width — the visible "jump".
 *
 * ## How each platform runs it
 *
 * Web: one CSS animation over `background-position` on a `background-clip:
 * text` element. Nothing runs on the JS thread per frame and the compositor
 * owns the timeline, so the sweep cannot drift or stutter under load. The
 * keyframes are static and read the band width from the `--pb-shimmer-band`
 * custom property, so a resize retunes the geometry by changing one inline
 * value — without restarting the running animation.
 *
 * Native: the equivalent translate driven by Reanimated on the UI thread,
 * masking a LinearGradient to the glyphs.
 *
 * ## Why the endpoints are exact
 *
 * `background-position` percentages resolve against
 * `positioningArea - backgroundImage`, so `100%` *is* `boxWidth - bandWidth`
 * and `calc(100% + var(--pb-shimmer-band))` is exactly `boxWidth`: the band's
 * leading edge sits on the box's far edge. That holds for any band width, which
 * means a stale or slightly-off measurement can only make the highlight a bit
 * wider or narrower — it can never desynchronise the loop.
 */

/**
 * Resolved lazily so apps that never render a ShimmerText neither bundle
 * @react-native-masked-view/masked-view nor need it installed. Without it, the
 * text renders without the shimmer overlay.
 */
interface MaskedViewProps {
  maskElement: React.ReactElement;
  pointerEvents?: ViewStyle['pointerEvents'];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const resolveMaskedView = () =>
  resolveOptionalModule<React.ComponentType<MaskedViewProps>>('@react-native-masked-view/masked-view', {
    accessor: (mod) => defaultExportOf<React.ComponentType<MaskedViewProps>>(mod),
    devWarning:
      '@react-native-masked-view/masked-view is not installed; <ShimmerText> renders static text without the shimmer effect.',
  });

/** Native only, and resolved on first use so web never looks for expo-linear-gradient. */
let linearGradient: ReturnType<typeof resolveLinearGradient> | null = null;
const getLinearGradient = () => (linearGradient ??= resolveLinearGradient());

type GradientColors = [ColorValue, ColorValue, ...ColorValue[]];

/** Band widths below this collapse into an invisible sliver; clamp instead. */
const MIN_SPREAD = 0.1;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  maskWrapper: {
    flex: 1,
  },
  bandClip: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

const WEB_CONTAINER_STYLE = webStyle({ display: 'inline-block' });

/**
 * Web-only CSS the sweep needs beyond `WebStyle`: background geometry and the
 * `--pb-shimmer-band` custom property the keyframes read.
 */
interface ShimmerWebStyle extends WebStyle {
  backgroundColor?: string;
  backgroundRepeat?: 'no-repeat';
  backgroundSize?: string;
  backgroundPosition?: string;
  '--pb-shimmer-band'?: string;
}

// ---------------------------------------------------------------------------
// Web sweep keyframes
// ---------------------------------------------------------------------------

/** Band fully clear of the leading edge. */
const SWEEP_START = 'calc(0px - var(--pb-shimmer-band)) 0';
/** Band fully clear of the trailing edge — see the note on exact endpoints. */
const SWEEP_END = 'calc(100% + var(--pb-shimmer-band)) 0';

const injectedSweeps = new Set<string>();
let sweepStyleElement: HTMLStyleElement | null = null;

/**
 * `repeatDelay` is expressed as a hold at the end of the timeline rather than a
 * gap between animations, so the browser never has to stop and restart
 * anything. The hold is quantised to a tenth of a percent of the cycle (a
 * sub-millisecond error at any sane duration) so that every instance pausing
 * for the same fraction of its cycle shares a single keyframes rule.
 */
const HOLD_PRECISION = 10;

const sweepAnimationName = (holdTenths: number) =>
  holdTenths > 0
    ? `pb-shimmer-sweep-hold-${String(holdTenths / HOLD_PRECISION).replace('.', '-')}`
    : 'pb-shimmer-sweep';

function ensureSweepKeyframes(holdTenths: number) {
  if (!hasDOM) return;

  const name = sweepAnimationName(holdTenths);
  if (injectedSweeps.has(name)) return;

  if (!sweepStyleElement) {
    sweepStyleElement = document.createElement('style');
    sweepStyleElement.setAttribute('data-platform-blocks', 'shimmer-text');
    document.head.appendChild(sweepStyleElement);
  }

  const rule = holdTenths > 0
    ? `@keyframes ${name}{`
      + `0%{background-position:${SWEEP_START}}`
      + `${100 - holdTenths / HOLD_PRECISION}%{background-position:${SWEEP_END}}`
      + `100%{background-position:${SWEEP_END}}}`
    : `@keyframes ${name}{`
      + `from{background-position:${SWEEP_START}}`
      + `to{background-position:${SWEEP_END}}}`;

  const sheet = sweepStyleElement.sheet;
  if (!sheet) return;

  sheet.insertRule(rule, sheet.cssRules.length);
  injectedSweeps.add(name);
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

const parseHex = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16),
    };
  }
  if (normalized.length === 6 || normalized.length === 8) {
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }
  return null;
};

const applyAlpha = (color: string, alpha: number) => {
  if (color.startsWith('#')) {
    const parsed = parseHex(color);
    if (parsed) {
      const { r, g, b } = parsed;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

/**
 * The default band fades in and out of full transparency so it reads as a
 * highlight passing over the base colour rather than a hard-edged swipe.
 */
const createGradientStops = (customColors: string[] | undefined, highlight: string): GradientColors => {
  if (customColors && customColors.length >= 2) {
    return customColors as GradientColors;
  }
  return [
    applyAlpha(highlight, 0),
    applyAlpha(highlight, 0.7),
    applyAlpha(highlight, 0),
  ] as GradientColors;
};

const createLocations = (stops: GradientColors) => {
  if (stops.length <= 2) return [0, 1];
  const divisor = stops.length - 1;
  return stops.map((_, index) => index / divisor);
};

/** The mask only reads alpha: drop any colour so the mask text stays opaque. */
const stripColorFromStyle = (styleValue: StyleProp<TextStyle>): StyleProp<TextStyle> => {
  if (!styleValue) return styleValue;
  const { color: _ignored, ...rest } = StyleSheet.flatten(styleValue) ?? {};
  return rest;
};

/** Any opaque colour works as the mask: MaskedView only reads its alpha channel. */
const MASK_COLOR = 'black';

// ---------------------------------------------------------------------------

export const ShimmerText = factory<{ props: ShimmerTextProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const spacingStyles = useStyleProps(styleProps);
  const theme = useTheme();

  const {
    children,
    text,
    c: color,
    colors,
    shimmerColor,
    duration = 1.8,
    delay = 0,
    repeatDelay = 0,
    repeat = true,
    once = false,
    direction = 'ltr',
    spread = 2,
    debug = false,
    startOnView = false,
    inViewMargin = '0px',
    onLayout: externalOnLayout,
    containerStyle,
    testID,
    style,
    ...textProps
  } = otherProps;

  // Muted text with the foreground colour sweeping over it reads as a
  // highlight in both colour schemes.
  const baseColor = color ?? theme.text.muted;
  const highlightColor = shimmerColor ?? theme.text.primary;

  const isRtl = direction === 'rtl';
  const content = children ?? text ?? null;

  // An indefinitely looping decorative animation is exactly what the
  // reduced-motion preference is for: the band stays parked off-box, leaving
  // plain `color`-coloured text.
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<View>(null);
  const mergedRef = useMergedRef(containerRef, ref);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  // `startOnView` defers the first sweep until the text is on screen. Without
  // an observer to gate on (native, SSR, older browsers) the text animates
  // rather than staying permanently static.
  const canObserve = startOnView && hasDOM && typeof IntersectionObserver !== 'undefined';
  const [seen, setSeen] = useState(false);
  const inView = !canObserve || seen;

  useEffect(() => {
    if (!canObserve || seen) return;
    // react-native-web's View ref is the DOM element.
    const node = containerRef.current as unknown as Element | null;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: inViewMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canObserve, seen, inViewMargin]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    externalOnLayout?.(event);
  }, [externalOnLayout]);

  // --- geometry & timing (identical on both platforms) ---------------------

  const spreadValue = Math.max(MIN_SPREAD, spread);
  const bandWidth = layout.width * spreadValue;

  const shouldRepeat = repeat && !once;
  const wantsAnimation = (once || shouldRepeat) && !prefersReducedMotion && inView;

  const durationMs = Math.max(16, duration * 1000);
  const delayMs = Math.max(0, delay * 1000);
  const repeatDelayMs = shouldRepeat ? Math.max(0, repeatDelay * 1000) : 0;
  const cycleMs = durationMs + repeatDelayMs;
  // Capped just short of the full cycle so the sweep itself always gets a
  // non-zero slice of the timeline, however large `repeatDelay` grows.
  const holdTenths = Math.min(
    99 * HOLD_PRECISION,
    Math.round((repeatDelayMs / cycleMs) * 100 * HOLD_PRECISION),
  );

  const stops = useMemo(
    () => createGradientStops(colors, highlightColor),
    [colors, highlightColor],
  );
  const stopStrings = useMemo(
    () => stops.map((stop) => (typeof stop === 'string' ? stop : String(stop))),
    [stops],
  );
  const locations = useMemo(() => createLocations(stops), [stops]);

  useEffect(() => {
    if (!isDev || !debug) return;
    devLog('[ShimmerText]', {
      platform: isWeb ? 'web' : 'native',
      width: layout.width,
      bandWidth,
      cycleMs,
      holdTenths,
      animating: wantsAnimation && bandWidth > 0,
    });
  }, [debug, layout.width, bandWidth, cycleMs, holdTenths, wantsAnimation]);

  // --- web -----------------------------------------------------------------

  // Keyframes have to exist in a stylesheet before the inline `animation-name`
  // that references them is applied. `useInsertionEffect` is the hook designed
  // for exactly that ordering: it runs before layout effects and before paint.
  useInsertionEffect(() => {
    if (!isWeb) return;
    ensureSweepKeyframes(holdTenths);
  }, [holdTenths]);

  const webShimmerStyle = useMemo((): TextStyle | null => {
    if (!isWeb || bandWidth <= 0) return null;

    const stopList = stopStrings
      .map((stop, index) => `${stop} ${(locations[index] * 100).toFixed(3)}%`)
      .join(', ');

    const css: ShimmerWebStyle = {
      // `background-clip: text` paints both of these through the glyphs only:
      // the flat colour is the resting text colour, the gradient is the band
      // riding over it. One element, one text node — no stacked second copy of
      // the text to blur the antialiasing or repeat itself to screen readers.
      backgroundColor: baseColor,
      backgroundImage: `linear-gradient(${isRtl ? 270 : 90}deg, ${stopList})`,
      // Non-negotiable: tiling the band would make the wrap visible again.
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${bandWidth}px 100%`,
      backgroundPosition: isRtl ? SWEEP_END : SWEEP_START,
      '--pb-shimmer-band': `${bandWidth}px`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      // Keep the box a single background-positioning area; an inline element
      // fragments its background per line box, which would give each wrapped
      // line its own out-of-phase band.
      display: 'inline-block',
      ...(wantsAnimation
        ? {
          animationName: sweepAnimationName(holdTenths),
          animationDuration: `${cycleMs}ms`,
          animationDelay: `${delayMs}ms`,
          animationTimingFunction: 'linear',
          animationIterationCount: shouldRepeat ? 'infinite' : 1,
          // One keyframes rule serves both directions: rtl plays it backwards,
          // which also moves the hold to the head of the cycle — still parked
          // off-box, so it stays invisible.
          animationDirection: isRtl ? 'reverse' : 'normal',
          // `both` parks the band off-box during `delay` and after a
          // non-repeating pass, instead of snapping to the resting position.
          animationFillMode: 'both',
        }
        : null),
    };
    // Text renders a DOM element on web and passes CSS through; this is the
    // one place the web-only keys cross into React Native's style type.
    return css as unknown as TextStyle;
  }, [
    bandWidth, stopStrings, locations, baseColor, isRtl, wantsAnimation,
    holdTenths, cycleMs, delayMs, shouldRepeat,
  ]);

  // --- native --------------------------------------------------------------

  const progress = useSharedValue(0);
  const startX = useSharedValue(0);
  const endX = useSharedValue(0);

  const gradient = isWeb ? null : getLinearGradient();
  const hasLinearGradient = !!gradient?.hasLinearGradient;
  const nativeShimmerReady = hasLinearGradient
    && layout.width > 0
    && layout.height > 0;

  // Geometry lives in shared values so a resize retunes the sweep in place
  // rather than restarting the animation — the native mirror of updating
  // `--pb-shimmer-band` on web.
  useEffect(() => {
    if (layout.width <= 0) return;
    startX.value = isRtl ? layout.width : -bandWidth;
    endX.value = isRtl ? -bandWidth : layout.width;
  }, [layout.width, bandWidth, isRtl, startX, endX]);

  useEffect(() => {
    if (isWeb || !hasLinearGradient) return;

    cancelAnimation(progress);
    progress.value = 0;

    if (!wantsAnimation) {
      return () => cancelAnimation(progress);
    }

    const sweep = withTiming(1, { duration: durationMs, easing: Easing.linear });
    // `withRepeat(..., -1, false)` already restarts each iteration from 0, so
    // the only reason to build a sequence is to hold at the far edge for
    // `repeatDelay` first. The band is off-box at 1, so the hold reads as a
    // pause between passes.
    const cycle = repeatDelayMs > 0
      ? withSequence(sweep, withDelay(repeatDelayMs, withTiming(0, { duration: 0 })))
      : sweep;

    progress.value = withDelay(
      delayMs,
      shouldRepeat ? withRepeat(cycle, -1, false) : sweep,
    );

    return () => cancelAnimation(progress);
  }, [hasLinearGradient, wantsAnimation, shouldRepeat, durationMs, delayMs, repeatDelayMs, progress]);

  const bandAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: startX.value + (endX.value - startX.value) * progress.value }],
  }), [progress, startX, endX]);

  const maskTextStyle = useMemo(() => stripColorFromStyle(style), [style]);

  // --- render --------------------------------------------------------------

  const resolvedContainerStyle = [styles.container, spacingStyles, WEB_CONTAINER_STYLE, containerStyle];

  if (isWeb) {
    return (
      <View ref={mergedRef} style={resolvedContainerStyle} onLayout={handleLayout} testID={testID}>
        <Text {...textProps} c={baseColor} style={[style, webShimmerStyle]}>
          {content}
        </Text>
      </View>
    );
  }

  const MaskedView = nativeShimmerReady ? resolveMaskedView() : null;
  const LinearGradient = gradient?.LinearGradient;
  const size = { width: layout.width, height: layout.height };

  return (
    <View ref={mergedRef} style={resolvedContainerStyle} onLayout={handleLayout} testID={testID}>
      <Text {...textProps} c={baseColor} style={style}>
        {content}
      </Text>
      {MaskedView && LinearGradient ? (
        <MaskedView
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, size]}
          maskElement={(
            <View style={styles.maskWrapper}>
              {/* A duplicate of the text used only as a mask: hidden from assistive technology. */}
              <Text
                {...textProps}
                c={MASK_COLOR}
                selectable={false}
                style={maskTextStyle}
                aria-hidden
                importantForAccessibility="no-hide-descendants"
              >
                {content}
              </Text>
            </View>
          )}
        >
          <View style={[styles.bandClip, size]}>
            <Animated.View
              pointerEvents="none"
              style={[styles.band, { width: bandWidth, height: layout.height }, bandAnimatedStyle]}
            >
              <LinearGradient
                colors={stopStrings}
                locations={locations}
                start={{ x: isRtl ? 1 : 0, y: 0.5 }}
                end={{ x: isRtl ? 0 : 1, y: 0.5 }}
                style={styles.fill}
              />
            </Animated.View>
          </View>
        </MaskedView>
      ) : null}
    </View>
  );
}, { displayName: 'ShimmerText' });

export type { ShimmerTextProps } from './types';
