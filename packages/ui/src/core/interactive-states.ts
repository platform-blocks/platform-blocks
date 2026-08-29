import { Platform, ViewStyle } from 'react-native';
import { PlatformBlocksTheme } from './theme/types';
import { DESIGN_TOKENS } from './design-tokens';

/**
 * Utilities for consistent focus, hover, and interactive states
 */
export interface InteractiveStateConfig {
  focusRing?: boolean;
  hoverEffect?: boolean;
  pressedEffect?: boolean;
  disabledState?: boolean;
}

/**
 * Create consistent focus ring styles
 */
export function createFocusStyles(
  theme: PlatformBlocksTheme,
  visible: boolean = true
): ViewStyle {
  if (!visible || typeof window === 'undefined') {
    return {};
  }

  return {
    outline: 'none', // Remove browser default
    boxShadow: theme.states?.focusRing
      ? `0 0 0 ${DESIGN_TOKENS.interactive.focusRing.width}px ${theme.states.focusRing}`
      : `0 0 0 ${DESIGN_TOKENS.interactive.focusRing.width}px ${theme.colors.primary[5]}40`,
  } as ViewStyle;
}

/**
 * Create consistent hover styles
 */
export function createHoverStyles(
  theme: PlatformBlocksTheme,
  baseColor: string,
  active: boolean = true
): ViewStyle {
  if (!active || typeof window === 'undefined') {
    return {};
  }

  return {
    opacity: DESIGN_TOKENS.opacity.hover,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  } as ViewStyle;
}

/**
 * Create consistent pressed/active styles
 */
export function createPressedStyles(
  theme: PlatformBlocksTheme,
  active: boolean = true
): ViewStyle {
  if (!active) {
    return {};
  }

  return {
    opacity: DESIGN_TOKENS.opacity.pressed,
    transform: [{ scale: 0.98 }], // Subtle scale effect
  } as ViewStyle;
}

/**
 * Create consistent disabled styles
 */
export function createDisabledStyles(
  theme: PlatformBlocksTheme,
  disabled: boolean = false
): ViewStyle {
  if (!disabled) {
    return {};
  }

  return {
    opacity: DESIGN_TOKENS.opacity.disabled,
    backgroundColor: theme.colors.gray[1],
    color: theme.text.disabled,
    ...(Platform.OS === 'web' && { cursor: 'not-allowed' as any }),
  } as ViewStyle;
}

/**
 * Create comprehensive interactive styles for any component
 */
export function createInteractiveStateStyles(
  theme: PlatformBlocksTheme,
  state: {
    focused?: boolean;
    hovered?: boolean;
    pressed?: boolean;
    disabled?: boolean;
  },
  config: InteractiveStateConfig = {}
): ViewStyle {
  const styles: ViewStyle = {};

  // Apply styles in order of precedence
  if (state.disabled && config.disabledState) {
    Object.assign(styles, createDisabledStyles(theme, true));
  } else {
    if (state.focused && config.focusRing) {
      Object.assign(styles, createFocusStyles(theme, true));
    }
    if (state.hovered && config.hoverEffect) {
      Object.assign(styles, createHoverStyles(theme, '', true));
    }
    if (state.pressed && config.pressedEffect) {
      Object.assign(styles, createPressedStyles(theme, true));
    }
  }

  return styles;
}

/**
 * Create animated transition styles
 */
export function createTransitionStyles(
  properties: string[] = ['opacity', 'transform', 'background-color'],
  duration: keyof typeof DESIGN_TOKENS.motion.duration = 'normal'
): ViewStyle {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    transition: properties
      .map(prop => `${prop} ${DESIGN_TOKENS.motion.duration[duration]}ms ${DESIGN_TOKENS.motion.easing.easeOut}`)
      .join(', '),
  } as ViewStyle;
}