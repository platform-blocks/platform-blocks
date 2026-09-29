import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from '../Text';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
  withRepeat,
  cancelAnimation,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { resolveOptionalModule } from '../../utils/optionalModule';

/** The pan gesture builder slice of react-native-gesture-handler used for swipe-to-dismiss. */
interface PanGestureLike {
  onUpdate(handler: (event: PanGestureEventLike) => void): PanGestureLike;
  onEnd(handler: (event: PanGestureEventLike) => void): PanGestureLike;
}

/** The parts of react-native-gesture-handler (an optional dependency) Toast uses. */
interface GestureHandlerModule {
  Gesture?: { Pan(): PanGestureLike };
  GestureDetector?: React.ComponentType<{ gesture: PanGestureLike; children?: React.ReactNode }>;
  GestureHandlerRootView?: React.ComponentType<{ style?: StyleProp<ViewStyle>; children?: React.ReactNode }>;
}

// Optional gesture handler support with graceful fallback
const gestureHandler = resolveOptionalModule<GestureHandlerModule>('react-native-gesture-handler', {
  devWarning: 'react-native-gesture-handler not found. Swipe gestures will be disabled for Toast component.',
});

const GestureDetector = gestureHandler?.GestureDetector;
const Gesture = gestureHandler?.Gesture;
const GestureHandlerRootView = gestureHandler?.GestureHandlerRootView;

import { factory } from '../../core/factory';
import {
  resolveComponentSize,
  type ComponentSize,
  type ComponentSizeValue,
} from '../../core/theme/componentSize';
import { useTheme } from '../../core/theme/ThemeProvider';
import { readableTextOn, withAlpha } from '../../core/theme/colorUtils';
import { resolveSurface } from '../../core/theme/surfaces';
import { resolveRadius, resolveShadow } from '../../core/theme/tokens';
import { useStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { useViewport } from '../../core/responsive';
import { isAndroid, isWeb, webProps, webStyle } from '../../core/platform';
import type { WebKeyboardEvent } from '../../core/platform';
import { announce } from '../../core/accessibility/announce';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import type { ToastProps, ToastSeverity, ToastAnimationType, ToastSizeMetrics } from './types';
import type { ThemeColor } from '../../core/theme/resolveColors';
import { useHaptics } from '../../hooks/useHaptics';
import { IconButton } from '../IconButton';
import { devWarn } from '../../core/utils/logger';

/** The fields of a gesture-handler pan event the swipe reads. */
interface PanGestureEventLike {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
}

interface ToastFactoryPayload {
  props: ToastProps;
  ref: View;
}

const TOAST_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

// Full seven-token scale. `md` reproduces the historical toast metrics exactly,
// so adding the prop is a no-op for existing usage.
const TOAST_SIZE_SCALE: Record<ComponentSize, ToastSizeMetrics> = {
  xs: {
    padding: 6, gap: 4, titleSize: 12, titleGap: 2, bodySize: 11, bodyLineHeight: 15,
    iconSize: 14, minHeight: 36, actionFontSize: 10,
    actionPaddingHorizontal: 6, actionPaddingVertical: 2, closeButtonSize: 24,
  },
  sm: {
    padding: 9, gap: 6, titleSize: 14, titleGap: 3, bodySize: 12, bodyLineHeight: 17,
    iconSize: 16, minHeight: 48, actionFontSize: 11,
    actionPaddingHorizontal: 6, actionPaddingVertical: 3, closeButtonSize: 28,
  },
  md: {
    padding: 12, gap: 8, titleSize: 16, titleGap: 4, bodySize: 14, bodyLineHeight: 20,
    iconSize: 20, minHeight: 60, actionFontSize: 12,
    actionPaddingHorizontal: 8, actionPaddingVertical: 4, closeButtonSize: 32,
  },
  lg: {
    padding: 14, gap: 10, titleSize: 18, titleGap: 5, bodySize: 16, bodyLineHeight: 23,
    iconSize: 24, minHeight: 68, actionFontSize: 14,
    actionPaddingHorizontal: 10, actionPaddingVertical: 5, closeButtonSize: 36,
  },
  xl: {
    padding: 16, gap: 12, titleSize: 20, titleGap: 6, bodySize: 18, bodyLineHeight: 26,
    iconSize: 28, minHeight: 76, actionFontSize: 15,
    actionPaddingHorizontal: 12, actionPaddingVertical: 6, closeButtonSize: 40,
  },
  '2xl': {
    padding: 20, gap: 14, titleSize: 24, titleGap: 7, bodySize: 20, bodyLineHeight: 29,
    iconSize: 32, minHeight: 88, actionFontSize: 16,
    actionPaddingHorizontal: 14, actionPaddingVertical: 7, closeButtonSize: 44,
  },
  '3xl': {
    padding: 24, gap: 16, titleSize: 28, titleGap: 8, bodySize: 22, bodyLineHeight: 32,
    iconSize: 40, minHeight: 100, actionFontSize: 18,
    actionPaddingHorizontal: 16, actionPaddingVertical: 8, closeButtonSize: 52,
  },
};

const BASE_TOAST_METRICS = TOAST_SIZE_SCALE.md;

/**
 * Motion tokens. A toast is a small object that arrives at the edge of an
 * existing stack, so it travels a short distance along the axis of the edge it
 * is anchored to rather than flying across the viewport. Vertical stacks keep
 * the travel under one toast height so an arriving toast never sweeps across
 * the message above it; edge-anchored (left/right) stacks can travel their full
 * width because nothing sits between them and the edge.
 */
const VERTICAL_TRAVEL = 40;
const HORIZONTAL_TRAVEL_FALLBACK = 400;
const HORIZONTAL_TRAVEL_GUTTER = 32;
/** Entry scale for translating animations — a hair of depth, not a zoom. */
const SLIDE_SCALE_FROM = 0.96;
/** Entry scale for the explicit `scale` animation type. */
const SCALE_SCALE_FROM = 0.85;
/** Exit is shorter than entry: arriving asks for attention, leaving should not. */
const EXIT_DURATION_RATIO = 0.6;
/** Max tilt while dragging a toast sideways. */
const SWIPE_ROTATION = 6;
const SWIPE_FLING_DURATION = 180;

const resolveToastMetrics = (value: ComponentSizeValue | undefined): ToastSizeMetrics => {
  // A numeric size is read as the title font size; everything else scales with it
  // so a custom value stays proportional instead of snapping to the nearest token.
  if (typeof value === 'number') {
    const ratio = value / BASE_TOAST_METRICS.titleSize;
    return {
      padding: Math.max(4, Math.round(BASE_TOAST_METRICS.padding * ratio)),
      gap: Math.max(2, Math.round(BASE_TOAST_METRICS.gap * ratio)),
      titleSize: value,
      titleGap: Math.max(1, Math.round(BASE_TOAST_METRICS.titleGap * ratio)),
      bodySize: Math.max(9, Math.round(BASE_TOAST_METRICS.bodySize * ratio)),
      bodyLineHeight: Math.max(12, Math.round(BASE_TOAST_METRICS.bodyLineHeight * ratio)),
      iconSize: Math.max(10, Math.round(BASE_TOAST_METRICS.iconSize * ratio)),
      minHeight: Math.max(28, Math.round(BASE_TOAST_METRICS.minHeight * ratio)),
      actionFontSize: Math.max(9, Math.round(BASE_TOAST_METRICS.actionFontSize * ratio)),
      actionPaddingHorizontal: Math.max(4, Math.round(BASE_TOAST_METRICS.actionPaddingHorizontal * ratio)),
      actionPaddingVertical: Math.max(2, Math.round(BASE_TOAST_METRICS.actionPaddingVertical * ratio)),
      closeButtonSize: Math.max(16, Math.round(BASE_TOAST_METRICS.closeButtonSize * ratio)),
    };
  }

  const resolved = resolveComponentSize(value, TOAST_SIZE_SCALE, {
    allowedSizes: TOAST_ALLOWED_SIZES,
    fallback: 'md',
  });

  return typeof resolved === 'number' ? resolveToastMetrics(resolved) : resolved;
};

// Helper function to map severity to theme colors
const getSeverityColor = (severity: ToastSeverity): ThemeColor => {
  switch (severity) {
    case 'info':
      return 'primary';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'primary';
  }
};

function ToastBase(props: ToastProps, ref: React.Ref<View>) {
  const {
    variant = 'light',
    size = 'md',
    color = 'gray',
    severity,
    title,
    children,
    icon,
    withCloseButton = true,
    loading = false,
    closeButtonLabel = 'Close notification',
    onClose,
    onExited,
    visible = false,
    animationDuration = 300,
    transitionDuration,
    autoHide = 4000,
    paused = false,
    position = 'top',
    style,
    testID,
    radius,
    actions,
    dismissOnTap = false,
    persistent = false,
    animationConfig,
    swipeConfig,
    onSwipeDismiss,
    keepMounted = true,
    selectable = false,
    titleProps,
    bodyProps,
    ...rest
  } = props;

  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);
  // A side-anchored toast slides in from past its own width (`maw` caps it).
  const travelWidth = typeof styleProps.maw === 'number' ? styleProps.maw : HORIZONTAL_TRAVEL_FALLBACK;

  const theme = useTheme();

  const borderRadius = resolveRadius(theme, radius ?? 'md');
  const metrics = useMemo(() => resolveToastMetrics(size), [size]);
  const padding = metrics.padding;

  const { width: screenWidth } = useViewport();
  const reducedMotion = useReducedMotion();

  // ---- Motion configuration -------------------------------------------------
  // Everything the transition depends on is reduced to primitives here so the
  // enter/exit effect can key off stable values. Object props (`animationConfig`,
  // callbacks) are almost always created inline by callers; depending on their
  // identity is what previously restarted every toast's entrance animation on
  // each provider render.
  const motionType: ToastAnimationType = animationConfig?.type ?? 'slide';
  // `transitionDuration` is the cross-component spelling and wins over the
  // Toast-specific `animationDuration`; `animationConfig.duration` is the most
  // specific of the three. 0 shows/hides with no transition.
  const enterDuration = Math.max(
    animationConfig?.duration ?? transitionDuration ?? animationDuration,
    0
  );
  const exitDuration = Math.round(enterDuration * EXIT_DURATION_RATIO);
  // Reduced motion drops the travel, the scale and the spring — not the
  // transition itself. An opacity change is not the kind of motion the setting
  // is about, and a toast that pops in and out of existence with no transition
  // at all is harder to follow, not easier.
  const springEnter = motionType === 'bounce' && !reducedMotion;

  const swipeEnabled = (swipeConfig?.enabled ?? true) && !!Gesture;
  const swipeDirection = swipeConfig?.direction ?? 'horizontal';
  const swipeThreshold = swipeConfig?.threshold ?? screenWidth * 0.4;
  const swipeVelocityThreshold = swipeConfig?.velocityThreshold ?? 500;

  // Distance the toast travels on the axis of the edge it is anchored to.
  const travel = useMemo(() => {
    switch (position) {
      case 'left':
        return -(travelWidth + HORIZONTAL_TRAVEL_GUTTER);
      case 'right':
        return travelWidth + HORIZONTAL_TRAVEL_GUTTER;
      case 'bottom':
        return VERTICAL_TRAVEL;
      case 'top':
      default:
        return -VERTICAL_TRAVEL;
    }
  }, [position, travelWidth]);
  const travelAxis: 'x' | 'y' = position === 'left' || position === 'right' ? 'x' : 'y';
  const scaleFrom = reducedMotion || motionType === 'fade'
    ? 1
    : motionType === 'scale' ? SCALE_SCALE_FROM : SLIDE_SCALE_FROM;
  // `fade` and `scale` are non-positional by definition.
  const travelDistance = reducedMotion || motionType === 'fade' || motionType === 'scale'
    ? 0
    : travel;

  // ---- Animation values -----------------------------------------------------
  // A single `progress` value (0 hidden → 1 shown) drives opacity, travel and
  // scale together. Separate slide/fade values could — and did — desynchronise
  // whenever one of them was retargeted mid-flight.
  const progress = useSharedValue(0);
  const swipeX = useSharedValue(0);
  const swipeY = useSharedValue(0);
  const swipeFade = useSharedValue(1);

  const shouldUnmountOnHide = !keepMounted;
  const [shouldRender, setShouldRender] = React.useState(shouldUnmountOnHide ? visible : true);

  useEffect(() => {
    if (!shouldUnmountOnHide) setShouldRender(true);
  }, [shouldUnmountOnHide]);

  // Callbacks live in refs so the transition effect never re-runs — and never
  // restarts an in-flight animation — just because a parent re-rendered.
  const onCloseRef = useRef(onClose);
  const onExitedRef = useRef(onExited);
  const onSwipeDismissRef = useRef(onSwipeDismiss);
  const easingRef = useRef(animationConfig?.easing);
  const springRef = useRef(animationConfig?.springConfig);
  useEffect(() => {
    onCloseRef.current = onClose;
    onExitedRef.current = onExited;
    onSwipeDismissRef.current = onSwipeDismiss;
    easingRef.current = animationConfig?.easing;
    springRef.current = animationConfig?.springConfig;
  });

  const requestClose = useCallback(() => {
    onCloseRef.current?.();
  }, []);

  const handleExited = useCallback(() => {
    if (shouldUnmountOnHide) setShouldRender(false);
    onExitedRef.current?.();
  }, [shouldUnmountOnHide]);

  const handleSwipeDismissed = useCallback(() => {
    onSwipeDismissRef.current?.();
    onCloseRef.current?.();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const remaining = 1 - p;

    const enterX = travelAxis === 'x' ? remaining * travelDistance : 0;
    const enterY = travelAxis === 'y' ? remaining * travelDistance : 0;
    const enterScale = scaleFrom + (1 - scaleFrom) * p;

    const dragX = swipeX.value;
    const dragY = swipeY.value;
    const dragging = dragX !== 0 || dragY !== 0;

    const transforms: Array<{ translateX: number } | { translateY: number } | { rotate: string } | { scale: number }> = [
      { translateX: enterX + dragX },
      { translateY: enterY + dragY },
    ];

    if (dragging) {
      // Tilt and shrink only while a drag is actually in progress. Leaving these
      // in the transform list at rest made every toast pay for two interpolations
      // per frame and pinned the toast to a rotated origin during entry.
      if (swipeDirection !== 'vertical') {
        transforms.push({
          rotate: `${interpolate(
            dragX,
            [-screenWidth * 0.5, 0, screenWidth * 0.5],
            [-SWIPE_ROTATION, 0, SWIPE_ROTATION],
            'clamp'
          )}deg`,
        });
      }
      const dragScale = interpolate(
        Math.abs(dragX) + Math.abs(dragY),
        [0, Math.max(swipeThreshold, 1)],
        [1, 0.94],
        'clamp'
      );
      transforms.push({ scale: enterScale * dragScale });
    } else if (enterScale !== 1) {
      transforms.push({ scale: enterScale });
    }

    return {
      transform: transforms,
      opacity: p * swipeFade.value,
    };
  }, [travelAxis, travelDistance, scaleFrom, swipeDirection, swipeThreshold, screenWidth]);

  const haptics = useHaptics();

  // Improved haptic feedback with error handling
  const triggerHapticFeedback = useCallback((severity?: ToastSeverity) => {
    try {
      switch (severity) {
        case 'success':
          haptics.notifySuccess?.();
          break;
        case 'warning':
          haptics.notifyWarning?.();
          break;
        case 'error':
          haptics.notifyError?.();
          break;
        default:
          haptics.notifySuccess?.(); // gentle default
      }
    } catch (error) {
      // Silently fail if haptics are not available
      devWarn('Haptic feedback failed:', error);
    }
  }, [haptics]);
  const triggerHapticRef = useRef(triggerHapticFeedback);
  triggerHapticRef.current = triggerHapticFeedback;

  // Plain text of the toast (never "[object Object]" for element children).
  const accessibleText = [title, getNodeText(children)].filter(Boolean).join('. ');
  const announceRef = useRef(() => {});
  announceRef.current = () => {
    if (!accessibleText) return;
    announce(accessibleText, {
      politeness: severity === 'error' || severity === 'warning' ? 'assertive' : 'polite',
    });
  };

  // ---- Enter / exit ---------------------------------------------------------
  // Keyed on `visible` and the resolved motion primitives only. Re-running this
  // for any other reason retargets an animation that is already playing.
  useEffect(() => {
    if (visible) {
      if (shouldUnmountOnHide) setShouldRender(true);
      // Clear any leftover drag from a previous appearance. This runs on a real
      // show, not on every render — resetting it per render is what used to
      // cancel a swipe the instant any other toast appeared.
      swipeX.value = 0;
      swipeY.value = 0;
      swipeFade.value = 1;
      triggerHapticRef.current(severity);
      // Screen readers: live regions are Android-only on native (and a toast
      // may mount already visible), so every appearance is announced
      // explicitly — assertive for errors and warnings, polite otherwise.
      announceRef.current();

      if (enterDuration === 0) {
        progress.value = 1;
        return;
      }

      if (springEnter) {
        progress.value = withSpring(1, {
          damping: 15,
          stiffness: 100,
          mass: 1,
          ...springRef.current,
        });
      } else {
        progress.value = withTiming(1, {
          duration: enterDuration,
          easing: easingRef.current ?? Easing.out(Easing.cubic),
        });
      }
      return;
    }

    if (exitDuration === 0) {
      progress.value = 0;
      handleExited();
      return;
    }

    progress.value = withTiming(
      0,
      { duration: exitDuration, easing: Easing.in(Easing.cubic) },
      (finished) => {
        'worklet';
        if (finished) runOnJS(handleExited)();
      }
    );
  }, [
    visible,
    springEnter,
    enterDuration,
    exitDuration,
    severity,
    shouldUnmountOnHide,
    handleExited,
    progress,
    swipeX,
    swipeY,
    swipeFade,
  ]);

  // ---- Auto hide ------------------------------------------------------------
  // The countdown is suspended while `paused` (the stack pauses on hover/focus)
  // and resumes with the time that was left, so reaching for a toast does not
  // cost the user the toast underneath it.
  const remainingRef = useRef(autoHide);
  const timedOut = autoHide > 0 && !persistent;

  useEffect(() => {
    remainingRef.current = autoHide;
  }, [visible, autoHide, persistent]);

  useEffect(() => {
    if (!visible || !timedOut || paused) return;
    const startedAt = Date.now();
    const remaining = remainingRef.current;
    const timer = setTimeout(() => {
      remainingRef.current = 0;
      requestClose();
    }, remaining);
    return () => {
      clearTimeout(timer);
      remainingRef.current = Math.max(0, remaining - (Date.now() - startedAt));
    };
  }, [visible, timedOut, paused, requestClose]);

  // ---- Loading ring ---------------------------------------------------------
  const spin = useSharedValue(0);
  useEffect(() => {
    if (!loading || reducedMotion) {
      cancelAnimation(spin);
      spin.value = 0;
      return;
    }
    spin.value = 0;
    spin.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(spin);
  }, [loading, reducedMotion, spin]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }), []);

  // ---- Swipe ----------------------------------------------------------------
  const panGesture = useMemo(() => {
    if (!swipeEnabled || !Gesture) return null;

    const tracksX = swipeDirection === 'horizontal' || swipeDirection === 'both';
    const tracksY = swipeDirection === 'vertical' || swipeDirection === 'both';

    return Gesture.Pan()
      .onUpdate((event: PanGestureEventLike) => {
        'worklet';
        if (tracksX) swipeX.value = event.translationX;
        if (tracksY) swipeY.value = event.translationY;
      })
      .onEnd((event: PanGestureEventLike) => {
        'worklet';
        const pastX = tracksX
          && (Math.abs(event.translationX) > swipeThreshold
            || Math.abs(event.velocityX) > swipeVelocityThreshold);
        const pastY = tracksY
          && (Math.abs(event.translationY) > swipeThreshold
            || Math.abs(event.velocityY) > swipeVelocityThreshold);

        if (pastX || pastY) {
          // Fling out along whichever axis the user actually moved, then hand
          // dismissal back to the owner. `swipeFade` is separate from `progress`
          // so the fling is not fighting the exit transition for the transform.
          if (pastX && Math.abs(event.translationX) >= Math.abs(event.translationY)) {
            swipeX.value = withSpring(event.translationX > 0 ? screenWidth : -screenWidth, {
              velocity: event.velocityX,
              damping: 40,
              stiffness: 180,
            });
          } else {
            swipeY.value = withSpring(event.translationY > 0 ? 300 : -300, {
              velocity: event.velocityY,
              damping: 40,
              stiffness: 180,
            });
          }

          swipeFade.value = withTiming(0, { duration: SWIPE_FLING_DURATION }, (finished) => {
            'worklet';
            if (finished) runOnJS(handleSwipeDismissed)();
          });
          return;
        }

        swipeX.value = withSpring(0, { damping: 22, stiffness: 260 });
        swipeY.value = withSpring(0, { damping: 22, stiffness: 260 });
      });
  }, [
    swipeEnabled,
    swipeDirection,
    swipeThreshold,
    swipeVelocityThreshold,
    screenWidth,
    swipeX,
    swipeY,
    swipeFade,
    handleSwipeDismissed,
  ]);

  // A toast floats above everything, so it sits at the top of the elevation
  // ladder alongside Dialog. (A gray palette shade used to be the fill; in the
  // dark theme that is the page base itself —
  // background exactly and the message read as floating text with no container.
  const surface = resolveSurface(theme, 3);

  // Determine final color - severity overrides color prop
  const memoizedColors = useMemo(() => {
    const finalColor = severity ? getSeverityColor(severity) : color;

    // Check if finalColor is a theme color or custom color string
    const isThemeColor = typeof finalColor === 'string' &&
      ['primary', 'secondary', 'success', 'warning', 'error', 'gray'].includes(finalColor);

    const colorConfig = isThemeColor
      ? theme.colors[finalColor as keyof typeof theme.colors]
      : null;

    return { finalColor, isThemeColor, colorConfig };
  }, [severity, color, theme]);

  const { finalColor, colorConfig } = memoizedColors;

  const getToastStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius,
      padding,
      flexDirection: 'row',
      alignItems: 'center',
      ...(isAndroid
        ? {
          minHeight: metrics.minHeight - 4,
          maxHeight: metrics.minHeight * 2,
          width: '100%',
          alignSelf: 'stretch',
          marginHorizontal: 0, // Ensure no horizontal margins
        }
        : {
          minHeight: metrics.minHeight,
          width: '100%',
          maxWidth: 400,
        }),
      // Theme-driven so the dark scale's heavier shadows apply; a fixed 25%
      // black shadow is invisible against a near-black page.
      ...resolveShadow(theme, 'lg'),
      // Press-and-hold on a toast should swipe/dismiss it, never start a text
      // selection. Text slots opt out too, but the container covers the padding
      // and non-text chrome as well.
      ...(selectable ? null : webStyle({ userSelect: 'none', WebkitUserSelect: 'none' })),
    };

    if (colorConfig) {
      // Use theme colors
      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: colorConfig[5]
          };
        case 'outline':
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            borderWidth: 1,
            borderColor: colorConfig[5]
          };
        case 'light':
        default:
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            // Hairline on the three non-accent sides: dark mode reads elevation
            // through the border, since the shadow barely registers there.
            borderWidth: 1,
            borderColor: surface.border,
            borderStartWidth: 4,
            borderStartColor: colorConfig[5]
          };
      }
    } else {
      // Use custom color
      const customColor = finalColor as string;
      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: customColor
          };
        case 'outline':
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            borderWidth: 1,
            borderColor: customColor
          };
        case 'light':
        default:
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            borderWidth: 1,
            borderColor: surface.border,
            borderStartWidth: 4,
            borderStartColor: customColor
          };
      }
    }
  };

  // Background fill for the 'filled' variant, used to pick legible foreground
  // colors. Bright fills (e.g. success green, warning yellow) fail with white
  // text, so readableTextOn flips to near-black when white is unreadable.
  const filledFill = colorConfig ? colorConfig[5] : (finalColor as string);

  const getTextColor = () => {
    switch (variant) {
      case 'filled':
        return readableTextOn(filledFill);
      case 'outline':
      case 'light':
      default:
        return theme.text.primary;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'filled':
        return readableTextOn(filledFill);
      case 'outline':
      case 'light':
      default:
        return colorConfig ? colorConfig[5] : (finalColor as string);
    }
  };

  const toastStyles = getToastStyles();
  const textColor = getTextColor();
  const iconColor = getIconColor();
  // The close affordance follows the toast's text, not its status color: on a
  // filled toast that means the readable foreground, otherwise muted chrome.
  const closeIconColor = variant === 'filled' ? readableTextOn(filledFill) : theme.text.muted;
  // The loading ring sits inside the icon slot, slightly inset so it reads as
  // the same optical weight as a severity glyph at every size.
  const spinnerSize = Math.max(10, Math.round(metrics.iconSize * 0.8));

  if (shouldUnmountOnHide && !shouldRender) {
    return null;
  }

  // Check if swipe is enabled and gesture handler is available
  const needsGestureHandler = swipeEnabled && panGesture && GestureDetector && GestureHandlerRootView;

  // The transform lives on the outermost node so the toast's hit area travels
  // with it. Previously the touch target stayed at the untranslated position for
  // the whole entrance, so clicks during the transition landed nowhere.
  // Escape dismisses a toast while focus is inside it (web). Toasts are not
  // layers: they trap nothing, and must not take Escape / Android back away
  // from the dialog or menu the user is actually in.
  const handleKeyDown = (event: WebKeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    event.stopPropagation();
    requestClose();
  };

  const toastContent = (
    <Animated.View style={[FULL_WIDTH, animatedStyle]} pointerEvents="box-none">
      <Pressable
        onPress={dismissOnTap ? requestClose : undefined}
        disabled={!dismissOnTap}
        // Not a tab stop of its own; the close / action buttons are.
        tabIndex={-1}
        style={({ pressed }) => [FULL_WIDTH, dismissOnTap && pressed ? PRESSED : null]}
      >
        <View
          ref={ref}
          style={[
            toastStyles,
            spacingStyles,
            style
          ]}
          testID={testID}
          // Announced with announce() when it appears; the group gives screen
          // reader users browsing to it the whole message as one name.
          role="group"
          aria-label={accessibleText || undefined}
          {...webProps({ onKeyDown: handleKeyDown })}
          {...otherProps}
        >
      {/* Icon or Loading */}
      {(icon || loading) && (
        <View style={{
          marginEnd: metrics.gap,
          // Inherit the row's alignItems:'center' on every platform. (Android
          // previously forced alignSelf:'flex-start', which pinned the icon to
          // the top instead of centering it like web.)
          marginTop: 2,
        }}>
          {loading ? (
            <View style={{ width: metrics.iconSize, height: metrics.iconSize, justifyContent: 'center', alignItems: 'center' }}>
              {/* The ring only reads as "working" if it turns — it was drawing a
                  static gap-topped circle, which looks like a rendering fault. */}
              <Animated.View
                style={[
                  {
                    width: spinnerSize,
                    height: spinnerSize,
                    borderRadius: spinnerSize / 2,
                    borderWidth: Math.max(1, Math.round(spinnerSize / 8)),
                    borderColor: iconColor,
                    borderTopColor: 'transparent',
                  },
                  spinnerStyle,
                ]}
              />
            </View>
          ) : icon ? (
            React.isValidElement<{ color?: string; size?: number }>(icon)
              ? React.cloneElement(icon, {
                color: iconColor,
                size: metrics.iconSize
              })
              : icon
          ) : null}
        </View>
      )}

      {/* Content */}
      <View style={isAndroid ? ANDROID_CONTENT : FLEX_1}>
        {title && (
          <Text
            {...mergeSlotProps(
              {
                size: metrics.titleSize,
                fw: '600',
                numberOfLines: 2,
                selectable,
                style: {
                  color: textColor,
                  marginBottom: children ? metrics.titleGap : 0,
                  ...(isAndroid ? { lineHeight: Math.round(metrics.titleSize * 1.25) } : null),
                },
              },
              titleProps
            )}
          >
            {title}
          </Text>
        )}

        {children && (
          <Text
            {...mergeSlotProps(
              {
                size: metrics.bodySize,
                lh: metrics.bodyLineHeight,
                numberOfLines: 3,
                selectable,
                style: {
                  color: textColor,
                  ...(isAndroid ? { includeFontPadding: false } : null),
                },
              },
              bodyProps
            )}
          >
            {children}
          </Text>
        )}
      </View>

      {/* Action buttons */}
      {actions && actions.length > 0 && (
        <View style={{
          flexDirection: 'row',
          marginStart: metrics.gap,
          gap: Math.max(2, Math.round(metrics.gap / 2))
        }}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                {
                  paddingHorizontal: metrics.actionPaddingHorizontal,
                  paddingVertical: metrics.actionPaddingVertical,
                  // ≥24px web / ≥44pt native touch area without growing the chip visually.
                  minHeight: isWeb ? 24 : 32,
                  justifyContent: 'center',
                  borderRadius: 4,
                  backgroundColor: action.color || withAlpha(variant === 'filled' ? textColor : iconColor, 0.15),
                },
                pressed ? PRESSED : null,
              ]}
              hitSlop={isWeb ? undefined : 6}
              role="button"
              aria-label={action.label}
            >
              <Text
                selectable={selectable}
                style={{
                  fontSize: metrics.actionFontSize,
                  fontWeight: '600',
                  color: action.color || textColor,
                }}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Close Button — dismissal is chrome, not part of the message, so it
          stays neutral instead of picking up the severity color the leading
          icon uses. */}
      {withCloseButton && (
        <IconButton
          icon="close"
          onPress={requestClose}
          variant="ghost"
          size={metrics.closeButtonSize}
          iconSize={Math.round(metrics.closeButtonSize / 2)}
          iconColor={closeIconColor}
          accessibilityLabel={closeButtonLabel || 'Close notification'}
          style={{
            marginStart: metrics.gap,
            marginTop: -Math.round(metrics.gap / 2),
            marginEnd: -Math.round(metrics.gap / 2),
          }}
        />
      )}
        </View>
      </Pressable>
    </Animated.View>
  );

  // Conditionally wrap with gesture handling
  if (needsGestureHandler) {
    return (
      <GestureHandlerRootView style={FULL_WIDTH}>
        <GestureDetector gesture={panGesture}>
          {toastContent}
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  return toastContent;
}

const FULL_WIDTH: ViewStyle = { width: '100%' };
const FLEX_1: ViewStyle = { flex: 1 };
// Extra vertical room for Android's text rendering.
const ANDROID_CONTENT: ViewStyle = { flex: 1, paddingVertical: 4 };
const PRESSED: ViewStyle = { opacity: 0.8 };

export const Toast = factory<ToastFactoryPayload>(ToastBase, { displayName: 'Toast' });
