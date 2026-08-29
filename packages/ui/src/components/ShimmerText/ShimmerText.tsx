import React, {
  useCallback,
  useEffect,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { ColorValue, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
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

import { extractSpacingProps, getSpacingStyles } from '../../core/utils';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { Text } from '../Text';
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
const resolveMaskedView = () =>
  resolveOptionalModule<any>('@react-native-masked-view/masked-view', {
    accessor: (mod) => mod?.default ?? mod,
    devWarning:
      '@react-native-masked-view/masked-view is not installed; <ShimmerText> renders static text without the shimmer effect.',
  });

const { LinearGradient: OptionalLinearGradient } = resolveLinearGradient();

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
});

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
  if (typeof document === 'undefined') return;

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
// Reduced motion
// ---------------------------------------------------------------------------

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let reducedMotionQuery: MediaQueryList | null | undefined;

/** Resolved once — `useSyncExternalStore` reads the snapshot on every render. */
const matchReducedMotion = () => {
  if (reducedMotionQuery === undefined) {
    reducedMotionQuery = Platform.OS === 'web'
      && typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      ? window.matchMedia(REDUCED_MOTION_QUERY)
      : null;
  }
  return reducedMotionQuery;
};

const subscribeToReducedMotion = (onChange: () => void) => {
  const query = matchReducedMotion();
  if (!query) return () => {};
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

/**
 * An indefinitely looping decorative animation is exactly what
 * `prefers-reduced-motion` is for, so the sweep parks itself off-box (leaving
 * plain `color`-coloured text) when the viewer has asked for less motion.
 */
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeToReducedMotion,
    () => matchReducedMotion()?.matches ?? false,
    () => false,
  );

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
  if (!color) return `rgba(255,255,255,${alpha})`;
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
const createGradientStops = (
  customColors: string[] | undefined,
  shimmerColor: string | undefined,
): GradientColors => {
  if (customColors && customColors.length >= 2) {
    return customColors as GradientColors;
  }
  const highlight = shimmerColor ?? '#ffffff';
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

const stripColorFromStyle = (styleValue: any): any => {
  if (!styleValue) return styleValue;
  if (Array.isArray(styleValue)) return styleValue.map(stripColorFromStyle);
  if (typeof styleValue === 'object') {
    const { color: _ignored, ...rest } = styleValue;
    return rest;
  }
  return styleValue;
};

// ---------------------------------------------------------------------------

export function ShimmerText(props: ShimmerTextProps) {
  const { spacingProps, otherProps } = extractSpacingProps(props as any);
  const spacingStyles = getSpacingStyles(spacingProps);

  const {
    children,
    text,
    color: baseColor = '#999999',
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
  } = otherProps as ShimmerTextProps;

  const isWeb = Platform.OS === 'web';
  const isRtl = direction === 'rtl';
  const content = children ?? text ?? null;

  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<any>(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  // `startOnView` defers the first sweep until the text is on screen; without
  // it the component is considered in view from the first render.
  const [inView, setInView] = useState(!startOnView);

  useEffect(() => {
    if (!startOnView) {
      setInView(true);
      return;
    }
    if (!isWeb || typeof IntersectionObserver === 'undefined') {
      // No observer to gate on (native, SSR, older browsers) — animate rather
      // than leave the text permanently static.
      setInView(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: inViewMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [startOnView, inViewMargin, isWeb]);

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
    () => createGradientStops(colors, shimmerColor),
    [colors, shimmerColor],
  );
  const stopStrings = useMemo(
    () => stops.map((color) => (typeof color === 'string' ? color : String(color))),
    [stops],
  );
  const locations = useMemo(() => createLocations(stops), [stops]);

  useEffect(() => {
    if (!__DEV__ || !debug) return;
    console.log('[ShimmerText]', {
      platform: Platform.OS,
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
  }, [isWeb, holdTenths]);

  const webShimmerStyle = useMemo(() => {
    if (!isWeb || bandWidth <= 0) return null;

    const stopList = stopStrings
      .map((color, index) => `${color} ${(locations[index] * 100).toFixed(3)}%`)
      .join(', ');

    return {
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
          animationIterationCount: shouldRepeat ? 'infinite' : '1',
          // One keyframes rule serves both directions: rtl plays it backwards,
          // which also moves the hold to the head of the cycle — still parked
          // off-box, so it stays invisible.
          animationDirection: isRtl ? 'reverse' : 'normal',
          // `both` parks the band off-box during `delay` and after a
          // non-repeating pass, instead of snapping to the resting position.
          animationFillMode: 'both',
        }
        : null),
    } as any;
  }, [
    isWeb, bandWidth, stopStrings, locations, baseColor, isRtl, wantsAnimation,
    holdTenths, cycleMs, delayMs, shouldRepeat,
  ]);

  // --- native --------------------------------------------------------------

  const progress = useSharedValue(0);
  const startX = useSharedValue(0);
  const endX = useSharedValue(0);

  const gradientModuleAvailable = Boolean(OptionalLinearGradient);
  const nativeShimmerReady = !isWeb
    && gradientModuleAvailable
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
    if (isWeb || !gradientModuleAvailable) return;

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
  }, [
    isWeb, gradientModuleAvailable, wantsAnimation, shouldRepeat,
    durationMs, delayMs, repeatDelayMs, progress,
  ]);

  const bandAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: startX.value + (endX.value - startX.value) * progress.value }],
  }), [progress, startX, endX]);

  const maskTextStyle = useMemo(() => stripColorFromStyle(style), [style]);

  // --- render --------------------------------------------------------------

  const resolvedContainerStyle = [
    styles.container,
    spacingStyles,
    isWeb ? ({ display: 'inline-block' } as any) : null,
    containerStyle,
  ];

  if (isWeb) {
    return (
      <View ref={containerRef} style={resolvedContainerStyle} onLayout={handleLayout} testID={testID}>
        <Text {...(textProps as any)} color={baseColor} style={[style, webShimmerStyle]}>
          {content}
        </Text>
      </View>
    );
  }

  const MaskedView = nativeShimmerReady ? resolveMaskedView() : null;

  return (
    <View style={resolvedContainerStyle} onLayout={handleLayout} testID={testID}>
      <Text {...(textProps as any)} color={baseColor} style={style}>
        {content}
      </Text>
      {MaskedView ? (
        <MaskedView
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { width: layout.width, height: layout.height }]}
          maskElement={(
            <View style={styles.maskWrapper}>
              <Text {...(textProps as any)} color="#000000" selectable={false} style={maskTextStyle}>
                {content}
              </Text>
            </View>
          )}
        >
          <View style={[styles.bandClip, { width: layout.width, height: layout.height }]}>
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: bandWidth,
                  height: layout.height,
                },
                bandAnimatedStyle,
              ]}
            >
              <OptionalLinearGradient
                colors={stopStrings}
                locations={locations as any}
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
}

export type { ShimmerTextProps } from './types';
