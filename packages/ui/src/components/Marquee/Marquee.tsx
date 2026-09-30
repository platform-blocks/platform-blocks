import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { DimensionValue } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { factory } from '../../core/factory';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { webProps, webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { withAlpha } from '../../core/theme/colorUtils';
import { isWeb } from '../../core/platform/flags';
import { pointerEventsStyles } from '../../core/platform/pointerEvents';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { resolveSpacing } from '../../core/theme/tokens';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { MarqueeProps } from './types';
const Root = factory<{ props: MarqueeProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, duration = 20000, reverse = false, pauseOnHover = false, orientation = 'horizontal', repeat = 4, gap = 'md', fadeEdges = true, fadeEdgeColor, fadeEdgeSize = '5%', style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [length, setLength] = useState(0);
  const [paused, setPaused] = useState(false);
  const resolvedGap = resolveSpacing(theme, gap);
  const pixelGap = typeof resolvedGap === 'number' ? resolvedGap : 0;
  const distance = length + pixelGap;
  const progress = useSharedValue(reverse ? -distance : 0);
  useEffect(() => {
    cancelAnimation(progress);
    if (!distance || reduced || paused) return;
    progress.value = reverse ? -distance : 0;
    progress.value = withRepeat(withTiming(reverse ? 0 : -distance, { duration: Math.max(1, duration), easing: Easing.linear }), -1, false);
    return () => cancelAnimation(progress);
  }, [distance, reduced, paused, reverse, duration, progress]);
  const movement = useAnimatedStyle(() => ({ transform: orientation === 'horizontal' ? [{ translateX: progress.value }] : [{ translateY: progress.value }] }), [orientation]);
  const horizontal = orientation === 'horizontal';
  const fadeColor = fadeEdgeColor ?? theme.backgrounds.base;
  const fadeDimension = fadeEdgeSize as DimensionValue;
  const { LinearGradient } = resolveLinearGradient();
  const edge = fadeEdges && !fadeEdgeColor ? webStyle({ WebkitMaskImage: horizontal ? `linear-gradient(to right, transparent, black ${fadeEdgeSize}, black calc(100% - ${fadeEdgeSize}), transparent)` : `linear-gradient(to bottom, transparent, black ${fadeEdgeSize}, black calc(100% - ${fadeEdgeSize}), transparent)` }) : undefined;
  return <View ref={ref} testID={testID} {...webProps({ onMouseEnter: pauseOnHover ? () => setPaused(true) : undefined, onMouseLeave: pauseOnHover ? () => setPaused(false) : undefined })} onTouchStart={pauseOnHover ? () => setPaused(true) : undefined} onTouchEnd={pauseOnHover ? () => setPaused(false) : undefined} style={[{ overflow: 'hidden' }, spacing, edge, style]}>
    <Animated.View style={[{ flexDirection: horizontal ? 'row' : 'column', alignSelf: 'flex-start', gap: resolveSpacing(theme, gap) }, !reduced && movement]}>
      {Array.from({ length: reduced ? 1 : Math.max(2, repeat) }, (_, i) => <View key={i} onLayout={i === 0 ? (event) => setLength(horizontal ? event.nativeEvent.layout.width : event.nativeEvent.layout.height) : undefined} accessibilityElementsHidden={i > 0} importantForAccessibility={i > 0 ? 'no-hide-descendants' : 'auto'} aria-hidden={i > 0} style={horizontal ? { flexDirection: 'row', alignItems: 'center', gap: resolveSpacing(theme, gap) } : { flexDirection: 'column', gap: resolveSpacing(theme, gap) }}>{children}</View>)}
    </Animated.View>
    {fadeEdges && (!isWeb || !!fadeEdgeColor) && <><LinearGradient colors={[fadeColor, withAlpha(fadeColor, 0)]} start={{ x: 0, y: 0 }} end={horizontal ? { x: 1, y: 0 } : { x: 0, y: 1 }} style={[{ position: 'absolute', top: 0, start: 0 }, horizontal ? { width: fadeDimension, height: '100%' } : { height: fadeDimension, width: '100%' }, pointerEventsStyles.none]} /><LinearGradient colors={[withAlpha(fadeColor, 0), fadeColor]} start={{ x: 0, y: 0 }} end={horizontal ? { x: 1, y: 0 } : { x: 0, y: 1 }} style={[{ position: 'absolute', bottom: 0, end: 0 }, horizontal ? { width: fadeDimension, height: '100%' } : { height: fadeDimension, width: '100%' }, pointerEventsStyles.none]} /></>}
  </View>;
}, { displayName: 'Marquee' });
export const Marquee = Root;
