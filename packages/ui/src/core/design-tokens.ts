import { SizeValue } from './theme/types';
import {
  DEFAULT_CONTROL_SIZES,
  DEFAULT_LIGHT_SHADOWS,
  DEFAULT_RADIUS_SCALE,
  DEFAULT_SPACING_SCALE,
} from './theme/scales';

/**
 * Static design tokens.
 *
 * The spacing, radius, shadow and control-height numbers here are the default
 * theme's own (both are built from `core/theme/scales.ts`), so there is one set
 * of numbers. They are static, though — they never follow a custom theme or the
 * dark scheme. Components resolve tokens against the current theme through
 * `core/theme/tokens.ts` (`resolveSpacing`, `resolveRadius`, `getControlSize`,
 * `resolveShadow`, …); reading `DESIGN_TOKENS` from a component is deprecated.
 */

/**
 * Animation tokens
 */
export const MOTION_TOKENS = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 200,
    slow: 300,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

/**
 * Shadow tokens for depth and elevation — the light theme's `shadows`.
 * @deprecated use `resolveShadow(theme, token)`, which follows the dark theme too.
 */
export const SHADOW_TOKENS = DEFAULT_LIGHT_SHADOWS;

/**
 * Border radius tokens — the default theme's `radii` plus `none` / `full`.
 * @deprecated use `resolveRadius(theme, value)`.
 */
export const RADIUS_TOKENS = {
  none: 0,
  ...DEFAULT_RADIUS_SCALE,
  full: 9999,
} as const;

/**
 * Spacing tokens — the default theme's `spacing`.
 * @deprecated use `resolveSpacing(theme, value)`.
 */
export const SPACING_TOKENS = DEFAULT_SPACING_SCALE;

/**
 * Typography tokens.
 *
 * NOTE: this font-size ladder (md 16) is one step larger than the theme's
 * `fontSizes` (md 14) — it is kept as-is because the components that still read
 * it would visibly change size. They migrate to `resolveFontSize(theme, size)`.
 * @deprecated use `resolveFontSize` / `resolveLineHeight`.
 */
export const TYPOGRAPHY_TOKENS = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/** 
 * Interactive element tokens 
 */
export const INTERACTIVE_TOKENS = {
  // Consistent heights for interactive elements — the canonical control heights.
  height: {
    xs: DEFAULT_CONTROL_SIZES.xs.height,
    sm: DEFAULT_CONTROL_SIZES.sm.height,
    md: DEFAULT_CONTROL_SIZES.md.height,
    lg: DEFAULT_CONTROL_SIZES.lg.height,
    xl: DEFAULT_CONTROL_SIZES.xl.height,
    '2xl': DEFAULT_CONTROL_SIZES['2xl'].height,
    '3xl': DEFAULT_CONTROL_SIZES['3xl'].height,
  },
  // Consistent padding for interactive elements
  padding: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  // Hit targets for touch interfaces
  hitTarget: {
    minimum: 44, // iOS/Android minimum
    comfortable: 48,
    large: 56,
  },
  // Focus ring sizes
  focusRing: {
    width: 2,
    offset: 1,
  },
} as const;

/** 
 * Color opacity tokens 
 */
export const OPACITY_TOKENS = {
  disabled: 0.5,
  hover: 0.9,
  pressed: 0.8,
  overlay: 0.6,
  backdrop: 0.4,
  subtle: 0.1,
} as const;

/** 
 * Component-specific tokens
 */
export const COMPONENT_TOKENS = {
  clearButton: {
    size: 14, // Icon size
    padding: 4,
    margin: -4, // Negative margin to not affect layout
    borderRadius: 6,
    hitSlop: 6,
  },
  divider: {
    thickness: 1,
    opacity: 0.1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    padding: 6,
  },
} as const;

/**
 * Get design token value
 */
export function getToken<T extends keyof typeof DESIGN_TOKENS, K extends keyof typeof DESIGN_TOKENS[T]>(
  category: T,
  token: K
): typeof DESIGN_TOKENS[T][K] {
  return DESIGN_TOKENS[category][token];
}

/**
 * All design tokens grouped for easy access
 */
export const DESIGN_TOKENS = {
  motion: MOTION_TOKENS,
  shadow: SHADOW_TOKENS,
  radius: RADIUS_TOKENS,
  spacing: SPACING_TOKENS,
  typography: TYPOGRAPHY_TOKENS,
  interactive: INTERACTIVE_TOKENS,
  opacity: OPACITY_TOKENS,
  component: COMPONENT_TOKENS,
} as const;

/**
 * Create consistent transition styles
 */
export function createTransition(
  properties: string[] = ['all'],
  duration: keyof typeof MOTION_TOKENS.duration = 'normal',
  easing: keyof typeof MOTION_TOKENS.easing = 'easeOut'
) {
  return `${properties.join(', ')} ${MOTION_TOKENS.duration[duration]}ms ${MOTION_TOKENS.easing[easing]}`;
}

/**
 * Get responsive value based on size
 */
export function getResponsiveValue<T>(
  values: Partial<Record<SizeValue, T>>,
  size: SizeValue = 'md'
): T | undefined {
  return values[size] || values.md;
}