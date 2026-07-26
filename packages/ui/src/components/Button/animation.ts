import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';

import { useReducedMotion } from '../../core/accessibility/hooks';

/** Rest / pressed scale for the press feedback. */
const PRESSED_SCALE = 0.96;
/** Scale bottom for the keyboard-activation pulse. */
const PULSE_SCALE = 0.95;

const DEFAULT_PRESS_DURATION = 110;
const DEFAULT_HOVER_DURATION = 320;
const DEFAULT_PULSE_IN = 90;
const DEFAULT_PULSE_OUT = 140;

/** How far the gradient variant drifts sideways on hover. */
const GRADIENT_DRIFT_DISTANCE = 44;

export interface UseButtonAnimationOptions {
  /**
   * Consumer override in ms, applied to both press and hover. `0` snaps to the
   * end state without animating — a 0ms timing would still cost a frame.
   */
  transitionDuration?: number;
}

export interface ButtonAnimation {
  /** Style for the wrapper that carries the press scale. */
  wrapperStyle: { transform: [{ scale: Animated.Value }] };
  /** Horizontal offset driving the gradient variant's hover drift. */
  gradientDrift: Animated.AnimatedInterpolation<number>;
  /** Whether a press is currently held — used to decide if a pulse is needed. */
  isPressing: boolean;
  pressIn: () => void;
  pressOut: () => void;
  hover: (toValue: number) => void;
  /**
   * One-shot down-up bounce for activations that produce no pressIn
   * (keyboard, programmatic). No-op when transitions are disabled.
   */
  pulse: () => void;
}

/**
 * Press, hover and pulse animations for Button. Honors the reduced-motion
 * setting through `useReducedMotion().getDuration`, so every duration below is
 * a request rather than a guarantee.
 */
export function useButtonAnimation({
  transitionDuration,
}: UseButtonAnimationOptions = {}): ButtonAnimation {
  const { getDuration } = useReducedMotion();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const [isPressing, setIsPressing] = useState(false);

  const pressDuration = getDuration(Math.max(transitionDuration ?? DEFAULT_PRESS_DURATION, 0));
  const hoverDuration = getDuration(
    transitionDuration != null ? Math.max(transitionDuration, 0) : DEFAULT_HOVER_DURATION,
  );

  const animateScaleTo = useCallback(
    (toValue: number) => {
      if (pressDuration === 0) {
        scaleAnim.setValue(toValue);
        return;
      }
      Animated.timing(scaleAnim, {
        toValue,
        duration: pressDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [scaleAnim, pressDuration],
  );

  const pressIn = useCallback(() => {
    setIsPressing(true);
    animateScaleTo(PRESSED_SCALE);
  }, [animateScaleTo]);

  const pressOut = useCallback(() => {
    setIsPressing(false);
    animateScaleTo(1);
  }, [animateScaleTo]);

  // Animated rather than CSS `transition`, which RN-web drops.
  const hover = useCallback(
    (toValue: number) => {
      if (hoverDuration === 0) {
        hoverAnim.setValue(toValue);
        return;
      }
      Animated.timing(hoverAnim, {
        toValue,
        duration: hoverDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    },
    [hoverAnim, hoverDuration],
  );

  const pulse = useCallback(() => {
    // Nothing to pulse when transitions are off — the button would just sit at
    // rest scale through both legs.
    if (pressDuration === 0) return;

    const pulseIn = transitionDuration != null ? pressDuration : getDuration(DEFAULT_PULSE_IN);
    const pulseOut = transitionDuration != null ? pressDuration : getDuration(DEFAULT_PULSE_OUT);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: PULSE_SCALE,
        duration: pulseIn,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: pulseOut,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, pressDuration, transitionDuration, getDuration]);

  const wrapperStyle = useMemo(
    () => ({ transform: [{ scale: scaleAnim }] as [{ scale: Animated.Value }] }),
    [scaleAnim],
  );

  const gradientDrift = useMemo(
    () => hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0, GRADIENT_DRIFT_DISTANCE] }),
    [hoverAnim],
  );

  return { wrapperStyle, gradientDrift, isPressing, pressIn, pressOut, hover, pulse };
}
