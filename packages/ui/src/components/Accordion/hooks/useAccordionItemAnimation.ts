import { useEffect, useMemo } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { AccordionAnimationProp } from '../types';

export interface UseAccordionItemAnimationOptions {
  expanded: boolean;
  animated: AccordionAnimationProp;
  /**
   * Explicit transition length in ms. Wins over `animated`; `0` renders every
   * state change instantly (no chevron spin, no height animation).
   */
  transitionDuration?: number;
  /** Honors the user's OS/browser reduced-motion preference. */
  reducedMotion?: boolean;
}

export interface AccordionCollapseConfig {
  shouldAnimate: boolean;
  duration: number;
  easing?: (t: number) => number;
}

export interface UseAccordionItemAnimationResult {
  animatedChevronStyle: any;
  CollapseConfig: AccordionCollapseConfig;
}

const DEFAULT_DURATION = 220;
/** `chevron-down` renders pointing down; expanding spins it a half turn to point up. */
const CLOSED_ROTATION = 0;
const OPEN_ROTATION = 180;

export function useAccordionItemAnimation(opts: UseAccordionItemAnimationOptions): UseAccordionItemAnimationResult {
  const { expanded, animated, transitionDuration, reducedMotion = false } = opts;

  const duration = useMemo(() => {
    if (reducedMotion) return 0;
    if (transitionDuration !== undefined) return Math.max(transitionDuration, 0);
    if (animated === false) return 0;
    if (animated === true || animated === undefined) return DEFAULT_DURATION;
    return Math.max(animated.duration ?? DEFAULT_DURATION, 0);
  }, [animated, transitionDuration, reducedMotion]);

  const easing = typeof animated === 'object' && animated !== null ? animated.easing : undefined;

  const rotation = useSharedValue(expanded ? OPEN_ROTATION : CLOSED_ROTATION);

  useEffect(() => {
    const target = expanded ? OPEN_ROTATION : CLOSED_ROTATION;
    if (duration === 0) {
      rotation.value = target;
      return;
    }
    rotation.value = withTiming(target, { duration, easing: Easing.inOut(Easing.ease) });
  }, [expanded, duration, rotation]);

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const CollapseConfig = useMemo<AccordionCollapseConfig>(() => ({
    shouldAnimate: duration > 0,
    duration,
    easing,
  }), [duration, easing]);

  return {
    animatedChevronStyle,
    CollapseConfig,
  };
}
