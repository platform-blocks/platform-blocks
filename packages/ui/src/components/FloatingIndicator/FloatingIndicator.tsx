import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { factory } from '../../core/factory';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { isWeb } from '../../core/platform';
import { pointerEventsStyles } from '../../core/platform/pointerEvents';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { FloatingIndicatorProps } from './types';
type Rect = { x: number; y: number; width: number; height: number };
function measure(target: View | HTMLElement, parent: View | HTMLElement, setRect: (rect: Rect) => void) {
  if (isWeb && 'getBoundingClientRect' in target && 'getBoundingClientRect' in parent) {
    const child = target.getBoundingClientRect(); const container = parent.getBoundingClientRect();
    setRect({ x: child.left - container.left, y: child.top - container.top, width: child.width, height: child.height });
  } else if ('measureLayout' in target) {
    (target as View).measureLayout(parent as View, (x, y, width, height) => setRect({ x, y, width, height }));
  }
}
const Root = factory<{ props: FloatingIndicatorProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { target, parent, transitionDuration = 150, onTransitionStart, onTransitionEnd, displayAfterTransitionEnd, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const reduced = useReducedMotion();
  const [rect, setRect] = useState<Rect | null>(null);
  const [canDisplay, setCanDisplay] = useState(!displayAfterTransitionEnd);
  const x = useSharedValue(0), y = useSharedValue(0), width = useSharedValue(0), height = useSharedValue(0);
  const [placed, setPlaced] = useState(false);
  const finish = useCallback(() => onTransitionEnd?.(), [onTransitionEnd]);
  useEffect(() => {
    if (!target || !parent) { setRect(null); return; }
    const update = () => measure(target, parent, setRect);
    update();
    const dimensions = Dimensions.addEventListener('change', update);
    let observer: ResizeObserver | undefined;
    if (isWeb && typeof ResizeObserver !== 'undefined' && target instanceof Element && parent instanceof Element) {
      observer = new ResizeObserver(update); observer.observe(target); observer.observe(parent);
    }
    return () => { dimensions.remove(); observer?.disconnect(); };
  }, [target, parent]);
  useEffect(() => {
    if (!parent || !displayAfterTransitionEnd || !isWeb || !(parent instanceof Element)) { setCanDisplay(true); return; }
    setCanDisplay(false);
    const show = () => setCanDisplay(true);
    parent.addEventListener('transitionend', show, { once: true });
    return () => parent.removeEventListener('transitionend', show);
  }, [parent, displayAfterTransitionEnd]);
  useEffect(() => {
    if (!rect) { setPlaced(false); return; }
    if (!placed || reduced || transitionDuration <= 0) {
      x.value = rect.x; y.value = rect.y; width.value = rect.width; height.value = rect.height; setPlaced(true); return;
    }
    onTransitionStart?.();
    const config = { duration: transitionDuration };
    x.value = withTiming(rect.x, config);
    y.value = withTiming(rect.y, config);
    width.value = withTiming(rect.width, config);
    height.value = withTiming(rect.height, config, (done) => { if (done) runOnJS(finish)(); });
  }, [rect, placed, reduced, transitionDuration, x, y, width, height, onTransitionStart, finish]);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }], width: width.value, height: height.value }));
  if (!target || !parent || !rect || !canDisplay) return null;
  return <Animated.View ref={ref} testID={testID} aria-hidden importantForAccessibility="no-hide-descendants" style={[{ position: 'absolute', top: 0, left: 0 }, pointerEventsStyles.none, animated, spacing, style]} />;
}, { displayName: 'FloatingIndicator' });
export const FloatingIndicator = Root;
