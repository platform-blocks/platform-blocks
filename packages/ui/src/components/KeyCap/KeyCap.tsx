import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, type View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { factory } from '../../core/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { hasDOM, isWeb } from '../../core/platform';
import { isComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, resolveRadius, stepDown } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { getKeyCapStyles } from './styles';
import type { KeyCapMetrics, KeyCapModifier, KeyCapProps } from './types';

/** Baseline the built-in press sequence is authored against (down + up). */
const KEYCAP_BASE_DURATION = 250;
/** A key cap is an inline glyph: it sits just below the compact control height. */
const KEYCAP_HEIGHT_RATIO = 0.875;
const KEYCAP_PADDING_RATIO = 0.75;

const KEY_ALIASES: Record<string, string> = {
  ' ': 'Space',
  Control: 'Ctrl',
  Meta: 'Cmd',
  Command: 'Cmd',
  Option: 'Alt',
};

const normalizeKeyCode = (key: string): string => KEY_ALIASES[key] ?? key;

interface ModifierState {
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}

/** Every required modifier is held (extra ones are allowed). */
const hasModifiers = (event: ModifierState, required: readonly KeyCapModifier[]): boolean => {
  const held: KeyCapModifier[] = [];
  if (event.ctrlKey) held.push('ctrl');
  if (event.metaKey) held.push('cmd', 'meta');
  if (event.altKey) held.push('alt');
  if (event.shiftKey) held.push('shift');
  return required.every((mod) => held.includes(mod));
};

/**
 * Key cap metrics from the control-size table: one step below a control of the
 * same size (`stepDown`), scaled down a little more — a key cap is an inline
 * glyph, not a control. A numeric `size` is the height in px.
 */
function getKeyCapMetrics(theme: PlatformBlocksTheme, size: ComponentSizeValue): KeyCapMetrics {
  if (typeof size === 'number') {
    const control = getControlSize(theme, size);
    return {
      height: size,
      minWidth: size,
      paddingHorizontal: Math.round(control.paddingX * KEYCAP_PADDING_RATIO),
      fontSize: control.fontSize,
    };
  }
  const control = getControlSize(theme, stepDown(isComponentSize(size) ? size : 'md'));
  const height = Math.round(control.height * KEYCAP_HEIGHT_RATIO);
  return {
    height,
    minWidth: height,
    paddingHorizontal: Math.round(control.paddingX * KEYCAP_PADDING_RATIO),
    fontSize: control.fontSize,
  };
}

/**
 * A keyboard key, for shortcuts and key combinations. With `keyCode` (web) it
 * animates — and calls `onKeyPress` — when that key combination is pressed.
 * The animation is skipped under reduced motion.
 */
export const KeyCap = factory<{ props: KeyCapProps; ref: View }>((props, ref) => {
  const {
    children,
    size = 'md',
    variant = 'default',
    color = 'gray',
    animateOnPress = true,
    transitionDuration,
    keyCode,
    modifiers,
    pressed = false,
    onKeyPress,
    testID,
    ff: fontFamily,
    radius,
    style,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps, otherProps } = extractStyleProps(rest);
  const { layoutProps } = extractLayoutProps(otherProps);

  // Press animation lives in a shared value: a key press never re-renders the cap.
  const pressedValue = useSharedValue(0);
  const pressMotionDuration = useTransitionDuration(transitionDuration, KEYCAP_BASE_DURATION);

  const metrics = useMemo(() => getKeyCapMetrics(theme, size), [theme, size]);
  const styles = useMemo(
    () => getKeyCapStyles(theme, { metrics, variant, color, pressed }),
    [theme, metrics, variant, color, pressed]
  );
  const borderRadius = resolveRadius(theme, radius ?? 'md');

  const triggerPressAnimation = useCallback(() => {
    if (!animateOnPress) return;
    // `transitionDuration={0}` (and reduced motion) leave the cap at rest.
    if (pressMotionDuration <= 0) {
      pressedValue.value = 0;
      return;
    }
    const scale = pressMotionDuration / KEYCAP_BASE_DURATION;
    pressedValue.value = withSequence(
      withTiming(1, { duration: Math.round(100 * scale) }),
      withTiming(0, { duration: Math.round(150 * scale) })
    );
  }, [animateOnPress, pressMotionDuration, pressedValue]);

  const handleKeyPress = useLatestCallback(onKeyPress);
  // A stable dependency for an inline `modifiers={['cmd']}` array.
  const modifierKey = modifiers?.join('+') ?? '';

  // Listen for the real key (web only).
  useEffect(() => {
    if (!isWeb || !hasDOM || !keyCode) return undefined;
    const required = (modifierKey ? modifierKey.split('+') : []) as KeyCapModifier[];
    const target = normalizeKeyCode(keyCode).toLowerCase();

    const handleKeyDown = (event: KeyboardEvent) => {
      // Case-insensitive, so either `k` or `K` matches.
      if (normalizeKeyCode(event.key).toLowerCase() !== target) return;
      if (!hasModifiers(event, required)) return;
      triggerPressAnimation();
      handleKeyPress();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyCode, modifierKey, triggerPressAnimation, handleKeyPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressedValue.value * 2 }, { scale: 1 - pressedValue.value * 0.05 }],
  }));

  return (
    <Animated.View
      ref={ref}
      style={[
        styles.container,
        { borderRadius },
        // `fullWidth` first, so an explicit `w` wins.
        getLayoutStyles(layoutProps),
        resolveStyleProps(styleProps, theme),
        style,
        animatedStyle,
      ]}
      testID={testID}
    >
      <Text style={[styles.text, fontFamily ? { fontFamily } : null]}>{children}</Text>
    </Animated.View>
  );
}, { displayName: 'KeyCap' });
