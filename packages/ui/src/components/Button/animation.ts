import { useCallback, useRef } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../core/motion/useReducedMotion';

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
  /** Animated style for the wrapper that carries the press scale. */
  wrapperStyle: ReturnType<typeof useAnimatedStyle>;
  /** Animated style driving the gradient variant's hover drift. */
  gradientStyle: ReturnType<typeof useAnimatedStyle>;
  /** Whether a press is currently held — decides if an activation needs a pulse. */
  isPressing: () => boolean;
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
 * Press, hover and pulse animations for Button, on Reanimated shared values:
 * pressing never re-renders the Button. Every duration collapses to 0 (apply the
 * end state immediately) under reduced motion.
 */
export function useButtonAnimation({
  transitionDuration,
}: UseButtonAnimationOptions = {}): ButtonAnimation {
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(1);
  const hoverProgress = useSharedValue(0);
  // Press state only decides whether an activation needs a pulse, so it lives
  // in a ref rather than in React state.
  const pressingRef = useRef(false);

  const pressDuration = reducedMotion ? 0 : Math.max(transitionDuration ?? DEFAULT_PRESS_DURATION, 0);
  const hoverDuration = reducedMotion
    ? 0
    : transitionDuration != null
      ? Math.max(transitionDuration, 0)
      : DEFAULT_HOVER_DURATION;

  const animateScaleTo = useCallback(
    (toValue: number) => {
      scale.value =
        pressDuration === 0
          ? toValue
          : withTiming(toValue, { duration: pressDuration, easing: Easing.out(Easing.quad) });
    },
    [scale, pressDuration],
  );

  const pressIn = useCallback(() => {
    pressingRef.current = true;
    animateScaleTo(PRESSED_SCALE);
  }, [animateScaleTo]);

  const pressOut = useCallback(() => {
    pressingRef.current = false;
    animateScaleTo(1);
  }, [animateScaleTo]);

  const isPressing = useCallback(() => pressingRef.current, []);

  const hover = useCallback(
    (toValue: number) => {
      hoverProgress.value =
        hoverDuration === 0
          ? toValue
          : withTiming(toValue, { duration: hoverDuration, easing: Easing.out(Easing.cubic) });
    },
    [hoverProgress, hoverDuration],
  );

  const pulse = useCallback(() => {
    // Nothing to pulse when transitions are off — the button would just sit at
    // rest scale through both legs.
    if (pressDuration === 0) return;
    const pulseIn = transitionDuration != null ? pressDuration : DEFAULT_PULSE_IN;
    const pulseOut = transitionDuration != null ? pressDuration : DEFAULT_PULSE_OUT;
    scale.value = withSequence(
      withTiming(PULSE_SCALE, { duration: pulseIn, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: pulseOut, easing: Easing.out(Easing.quad) }),
    );
  }, [scale, pressDuration, transitionDuration]);

  const wrapperStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hoverProgress.value * GRADIENT_DRIFT_DISTANCE }],
  }));

  return { wrapperStyle, gradientStyle, isPressing, pressIn, pressOut, hover, pulse };
}
