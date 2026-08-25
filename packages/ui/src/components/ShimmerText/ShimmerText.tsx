import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColorValue, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import { resolveOptionalModule } from '../../utils/optionalModule';

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
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../Text';
import { GradientText } from '../GradientText';
import { extractSpacingProps, getSpacingStyles } from '../../core/utils';
import type { ShimmerTextProps } from './types';

type GradientColors = [ColorValue, ColorValue, ...ColorValue[]];

const MIN_SPREAD = 1;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  baseText: {
    opacity: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  maskWrapper: {
    flex: 1,
  },
  gradientWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  linearGradient: {
    width: '100%',
    height: '100%',
  },
});

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

const stripColorFromStyle = (styleValue: any): any => {
  if (!styleValue) {
    return styleValue;
  }
  if (Array.isArray(styleValue)) {
    return styleValue.map(stripColorFromStyle);
  }
  if (typeof styleValue === 'object') {
    const { color: _ignored, ...rest } = styleValue;
    return rest;
  }
  return styleValue;
};

const parseHex = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6 || normalized.length === 8) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return { r, g, b };
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
  if (stops.length <= 2) {
    return [0, 1];
  }
  const divisor = stops.length - 1;
  return stops.map((_, index) => index / divisor);
};

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
    onLayout: externalOnLayout,
    style,
    ...textProps
  } = otherProps as ShimmerTextProps;

  const isWeb = Platform.OS === 'web';
  const gradientModuleAvailable = Boolean(OptionalLinearGradient);

  const content = children ?? text ?? null;
  const normalizedSpread = Math.max(spread, MIN_SPREAD);
  const shouldRepeat = repeat && !once;
  const supportsShimmer = isWeb || gradientModuleAvailable;
  const shouldAnimate = supportsShimmer && (once || shouldRepeat);

  const extraDistance = normalizedSpread - 1;
  const minPosition = -extraDistance;
  const maxPosition = 1 + extraDistance;
  const initialWebPosition = direction === 'rtl' ? maxPosition : minPosition;
  const finalWebPosition = direction === 'rtl' ? minPosition : maxPosition;

  const progress = useSharedValue(0);
  const debugFlag = useSharedValue(debug ? 1 : 0);
  const startX = useSharedValue(0);
  const endX = useSharedValue(0);

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [gradientWidth, setGradientWidth] = useState(0);
  const mountCountRef = useRef(0);

  const resolvedColors = useMemo<GradientColors>(
    () => createGradientStops(colors, shimmerColor),
    [colors, shimmerColor],
  );
  const resolvedLinearColors = useMemo(
    () => resolvedColors.map((color) => (typeof color === 'string' ? color : String(color))),
    [resolvedColors],
  );
  const gradientLocations = useMemo(() => createLocations(resolvedColors), [resolvedColors]);

  // Web drives the sweep with a CSS animation rather than a JS-driven position,
  // so nothing runs per frame. `null` leaves the gradient parked at its start.
  const webAnimation = useMemo(() => {
    if (!isWeb || !shouldAnimate) return undefined;
    return {
      from: initialWebPosition,
      to: finalWebPosition,
      duration,
      delay,
      repeat: shouldRepeat,
      repeatDelay,
    };
  }, [isWeb, shouldAnimate, initialWebPosition, finalWebPosition, duration, delay, shouldRepeat, repeatDelay]);

  useEffect(() => {
    debugFlag.value = debug ? 1 : 0;
  }, [debug, debugFlag]);

  useEffect(() => {
    if (layout.width <= 0) {
      return;
    }
    const width = layout.width;
    const computedGradientWidth = width * normalizedSpread;
    setGradientWidth(computedGradientWidth);
    startX.value = direction === 'rtl' ? width : -computedGradientWidth;
    endX.value = direction === 'rtl' ? -computedGradientWidth : width;
  }, [layout.width, direction, normalizedSpread, startX, endX]);

  const logEvent = useCallback((message: string) => {
    if (!__DEV__ || !debug) {
      return;
    }
    console.log(`[ShimmerText] ${message}`);
  }, [debug]);
  useEffect(() => {
    if (isWeb || !gradientModuleAvailable) {
      return;
    }

    mountCountRef.current += 1;
    logEvent(`effect mount #${mountCountRef.current}`);

    cancelAnimation(progress);
    progress.value = 0;

    if (!shouldAnimate) {
      return () => {
        logEvent('cleanup -> cancel animation');
        cancelAnimation(progress);
      };
    }

    const durationMs = Math.max(16, duration * 1000);
    const delayMs = Math.max(0, delay * 1000);
    const repeatDelayMs = Math.max(0, repeatDelay * 1000);

    const forward = withTiming(1, {
      duration: durationMs,
      easing: Easing.linear,
    }, (finished) => {
      'worklet';
      if (finished && debugFlag.value) {
        runOnJS(logEvent)('sweep finished');
      }
    });

    const reset = withTiming(0, { duration: 0 });
    const cycle = repeatDelayMs > 0
      ? withSequence(forward, withDelay(repeatDelayMs, reset))
      : withSequence(forward, reset);

    const animation = shouldRepeat
      ? withDelay(delayMs, withRepeat(cycle, -1, false))
      : withDelay(delayMs, forward);

    if (!shouldRepeat) {
      logEvent(once ? 'starting once animation' : 'starting single sweep');
    } else {
      logEvent('starting repeat animation');
    }

    progress.value = animation;

    return () => {
      logEvent('cleanup -> cancel animation');
      cancelAnimation(progress);
    };
  }, [delay, duration, repeat, once, repeatDelay, progress, logEvent, debugFlag, isWeb, shouldAnimate, shouldRepeat, gradientModuleAvailable]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    externalOnLayout?.(event);
  }, [externalOnLayout]);

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const start = startX.value;
    const delta = endX.value - start;
    const translateX = start + delta * progress.value;
    return {
      transform: [{ translateX }],
    };
  }, [progress, startX, endX]);

  const overlayBaseStyle = useMemo(() => stripColorFromStyle(style), [style]);

  const renderNative = () => {
    if (!gradientModuleAvailable || !OptionalLinearGradient) {
      return (
        <Text
          {...textProps}
          color={baseColor}
          onLayout={externalOnLayout}
          style={style}
        >
          {content}
        </Text>
      );
    }

    if (layout.width === 0 || layout.height === 0) {
      return (
        <Text
          {...textProps}
          color={baseColor}
          onLayout={handleLayout}
          style={style}
        >
          {content}
        </Text>
      );
    }

    const MaskedView = resolveMaskedView();

    if (!MaskedView) {
      return (
        <Text
          {...textProps}
          color={baseColor}
          onLayout={handleLayout}
          style={style}
        >
          {content}
        </Text>
      );
    }

    return (
      <>
        <Text
          {...textProps}
          color={baseColor}
          onLayout={handleLayout}
          style={style}
        >
          {content}
        </Text>
        <MaskedView
          pointerEvents="none"
          style={[styles.overlay, { width: layout.width, height: layout.height }]}
          maskElement={(
            <View style={styles.maskWrapper}>
              <Text
                {...textProps}
                color="#000000"
                selectable={false}
                style={overlayBaseStyle}
              >
                {content}
              </Text>
            </View>
          )}
        >
          <View style={[styles.gradientWrapper, { width: layout.width, height: layout.height }]}>
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: gradientWidth,
                  height: layout.height,
                },
                gradientAnimatedStyle,
              ]}
            >
              <OptionalLinearGradient
                colors={resolvedLinearColors}
                locations={gradientLocations as any}
                start={{ x: direction === 'rtl' ? 1 : 0, y: 0.5 }}
                end={{ x: direction === 'rtl' ? 0 : 1, y: 0.5 }}
                style={styles.linearGradient}
              />
            </Animated.View>
          </View>
        </MaskedView>
      </>
    );
  };

  const renderWeb = () => {
    const gradientColors = resolvedLinearColors;

    return (
      <>
        <Text
          {...textProps as any}
          color={baseColor}
          style={style}
        >
          {content}
        </Text>
        {/*
          The highlight sits in its own absolutely-positioned wrapper that sizes to
          its content and is pinned to the base text's top-left. GradientText then
          renders in normal flow inside it, so the gradient overlay lines up glyph
          for glyph over the base text. (Positioning GradientText itself as absolute
          collapses its inline-block container to 0x0 and the shimmer disappears.)
        */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            alignItems: 'flex-start',
            zIndex: 1,
          } as any}
        >
          <GradientText
            {...textProps as any}
            as={(textProps as any)?.as ?? 'span'}
            colors={gradientColors}
            locations={gradientLocations}
            angle={direction === 'rtl' ? 180 : 0}
            position={initialWebPosition}
            animation={webAnimation}
            selectable={false}
            style={overlayBaseStyle}
          >
            {content}
          </GradientText>
        </View>
      </>
    );
  };

  const containerStyle = Platform.OS === 'web'
    ? [styles.container, spacingStyles, { display: 'inline-block' }]
    : [styles.container, spacingStyles];

  return (
    <View style={containerStyle}>
      {Platform.OS === 'web' ? renderWeb() : renderNative()}
    </View>
  );
}

export type { ShimmerTextProps } from './types';