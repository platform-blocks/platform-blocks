import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent, type View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  isWorkletFunction,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type WithTimingConfig,
} from 'react-native-reanimated';

import { factory } from '../../core/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { isWeb, webStyle } from '../../core/platform';
import { warnOnce } from '../../core/utils/logger';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { CollapseProps, CollapseTiming } from './types';

type TimingEasing = WithTimingConfig['easing'];

const EASING_PRESETS: Record<CollapseTiming, TimingEasing> = {
  linear: Easing.linear,
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),
  'ease-in': Easing.in(Easing.ease),
  'ease-in-out': Easing.inOut(Easing.ease),
  'ease-out': Easing.out(Easing.ease),
};

/**
 * A caller-supplied easing runs on the UI thread on native, so it has to be a
 * worklet there. Web runs animations on the JS thread and takes any function.
 */
function resolveEasing(easing: CollapseProps['easing'], timing: CollapseTiming): TimingEasing {
  const preset = EASING_PRESETS[timing] ?? EASING_PRESETS['ease-out'];
  if (!easing) return preset;
  if (isWeb) return easing;
  const worklet = typeof isWorkletFunction === 'function' && isWorkletFunction(easing);
  if (worklet) return easing;
  warnOnce(
    'Collapse.easing.worklet',
    '[plocks] Collapse: `easing` must be a Reanimated worklet on iOS/Android ' +
      '(e.g. `Easing.bezier(...)` from react-native-reanimated). Falling back to the `timing` preset.'
  );
  return preset;
}

const MARGIN_KEYS = new Set(['marginTop', 'marginBottom', 'marginStart', 'marginEnd']);

/** Margins belong on the clipping frame; paddings on the measured content, so they count toward its height. */
function splitSpacing(style: ViewStyle): { outer: ViewStyle; inner: ViewStyle } {
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    (MARGIN_KEYS.has(key) ? outer : inner)[key] = value;
  }
  return { outer: outer as ViewStyle, inner: inner as ViewStyle };
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});

const HIDDEN_WEB = webStyle({ visibility: 'hidden' });

/**
 * Animates its children between a collapsed height (`collapsedHeight`, 0 by
 * default) and their measured natural height. Runs on Reanimated, respects the
 * reduced-motion preference (transitions become instant), and takes fully
 * collapsed content out of the tab order and the accessibility tree.
 */
export const Collapse = factory<{ props: CollapseProps; ref: View }>((props, ref) => {
  const {
    isCollapsed,
    children,
    duration: durationProp = 300,
    transitionDuration,
    timing = 'ease-out',
    easing,
    style,
    contentStyle,
    onAnimationStart,
    onAnimationEnd,
    animateOnMount = false,
    collapsedHeight = 0,
    fadeContent = true,
    testID,
    ...rest
  } = props;

  const { styleProps } = extractStyleProps(rest);
  const spacing = useStyleProps(styleProps);
  const { outer: outerSpacing, inner: innerSpacing } = useMemo(() => splitSpacing(spacing), [spacing]);

  // `transitionDuration` is the cross-component spelling; `duration` remains
  // supported. `0` (or reduced motion) means "no transition".
  const duration = useTransitionDuration(transitionDuration ?? durationProp, 300);
  const easingFn = resolveEasing(easing, timing);

  // Stable identities: inline callbacks must not restart the animation.
  const handleStart = useLatestCallback(onAnimationStart);
  const handleEnd = useLatestCallback(onAnimationEnd);

  const height = useSharedValue(collapsedHeight);
  // `animateOnMount` fades in from 0 as well as unrolling.
  const opacity = useSharedValue(isCollapsed || animateOnMount ? 0 : 1);
  const [contentHeight, setContentHeight] = useState(0);
  const didInitRef = useRef(false);
  const collapsedRef = useRef(isCollapsed);
  collapsedRef.current = isCollapsed;
  // The target the last run animated to. Only a new target starts a
  // transition: a re-run caused by anything else (a new `easing` identity, a
  // changed `duration`, `animateOnMount` flipping) must not restart it.
  const lastTargetRef = useRef<{ height: number; collapsed: boolean } | null>(null);

  // Fully collapsed content is hidden from assistive tech and the tab order
  // once the collapse has finished (it stays laid out, so it can be measured).
  const [settledCollapsed, setSettledCollapsed] = useState(isCollapsed);
  const settle = useCallback(() => {
    setSettledCollapsed(collapsedRef.current);
    handleEnd();
  }, [handleEnd]);

  const targetHeight = isCollapsed ? collapsedHeight : contentHeight;
  const targetOpacity = isCollapsed ? 0 : 1;

  useEffect(() => {
    if (contentHeight === 0) return; // wait for the content to be measured

    const last = lastTargetRef.current;
    if (last && last.height === targetHeight && last.collapsed === isCollapsed) return;
    lastTargetRef.current = { height: targetHeight, collapsed: isCollapsed };

    // First pass after measuring: jump straight to the target (unless
    // animateOnMount). Re-applied here rather than trusting the layout-time
    // snapshot: a parent may resolve `isCollapsed` in the same commit.
    if (!didInitRef.current) {
      didInitRef.current = true;
      if (!animateOnMount) {
        height.value = targetHeight;
        if (fadeContent) opacity.value = targetOpacity;
        setSettledCollapsed(isCollapsed);
        return;
      }
    }

    if (!isCollapsed) setSettledCollapsed(false);

    if (duration === 0) {
      height.value = targetHeight;
      if (fadeContent) opacity.value = targetOpacity;
      handleStart();
      settle();
      return;
    }

    handleStart();
    height.value = withTiming(targetHeight, { duration, easing: easingFn }, (finished) => {
      'worklet';
      if (finished) runOnJS(settle)();
    });
    if (fadeContent) {
      // Slightly faster fade than the height travel.
      opacity.value = withTiming(targetOpacity, { duration: duration * 0.8, easing: easingFn });
    }
  }, [
    targetHeight,
    targetOpacity,
    isCollapsed,
    contentHeight,
    duration,
    easingFn,
    fadeContent,
    animateOnMount,
    height,
    opacity,
    handleStart,
    settle,
  ]);

  const handleContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const measured = event.nativeEvent.layout.height;
      if (!didInitRef.current && !animateOnMount) {
        // Seed before the measured frame paints, so it never flashes at 0.
        height.value = collapsedRef.current ? collapsedHeight : measured;
        if (fadeContent) opacity.value = collapsedRef.current ? 0 : 1;
      }
      setContentHeight((prev) => (Math.abs(prev - measured) > 0.5 ? measured : prev));
    },
    [animateOnMount, collapsedHeight, fadeContent, height, opacity]
  );

  const heightStyle = useAnimatedStyle(() => ({ height: height.value }));
  const opacityStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const measured = contentHeight > 0;
  const hidden = settledCollapsed && isCollapsed && collapsedHeight === 0;

  return (
    <Animated.View
      ref={ref}
      testID={testID}
      style={[
        styles.clip,
        // Before the first measurement: clamp to the collapsed height when the
        // content starts collapsed or is about to unroll (so it never flashes
        // at full height for a frame); the content still measures its natural
        // height inside the clip.
        measured ? heightStyle : isCollapsed || animateOnMount ? { height: collapsedHeight } : null,
        outerSpacing,
        style,
      ]}
      {...(hidden
        ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const }
        : null)}
    >
      <Animated.View
        style={[innerSpacing, contentStyle, fadeContent ? opacityStyle : null, hidden ? HIDDEN_WEB : null]}
        onLayout={handleContentLayout}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}, { displayName: 'Collapse' });

export default Collapse;
