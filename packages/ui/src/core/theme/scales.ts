/**
 * The raw numbers behind the default theme's scales.
 *
 * This module has no imports on purpose: `defaultTheme.ts`, `darkTheme.ts`,
 * `design-tokens.ts` and `sizes.ts` all build their tables from these values,
 * so there is exactly one set of numbers and no import cycle between the
 * modules that publish them. Components never read this file — they resolve
 * tokens against the *current* theme through `core/theme/tokens.ts`.
 */

export const SCALE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
export type ScaleKey = (typeof SCALE_KEYS)[number];
export type NumericScale = Record<ScaleKey, number>;

export const DEFAULT_SPACING_SCALE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const DEFAULT_RADIUS_SCALE = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
} as const;

export const DEFAULT_FONT_SIZE_SCALE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
} as const;

/** General-purpose icon scale (`resolveIconSize`). Icons inside controls use `controlSizes[size].iconSize`. */
export const DEFAULT_ICON_SIZE_SCALE = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
} as const;

/** Line-height multipliers applied to the matching font size. */
export const DEFAULT_LINE_HEIGHT_SCALE = {
  xs: 1.2,
  sm: 1.3,
  md: 1.4,
  lg: 1.5,
  xl: 1.6,
  '2xl': 1.7,
  '3xl': 1.8,
} as const;

/** Viewport widths (px) at which each breakpoint starts. `base` is everything below `xs`. */
export const DEFAULT_BREAKPOINT_VALUES = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

export type BreakpointKey = keyof typeof DEFAULT_BREAKPOINT_VALUES;
export const BREAKPOINT_KEYS: readonly BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/** Metrics for one control size (Button, Input, Select, SegmentedControl, …). */
export interface ControlSizeMetrics {
  /** Outer height of the control. */
  height: number;
  /** Horizontal padding inside the control. */
  paddingX: number;
  /** Label / value font size. */
  fontSize: number;
  /** Icons rendered inside the control (start/end sections, chevrons, clear buttons). */
  iconSize: number;
  /** Default corner radius when the component has no `radius` prop. */
  radius: number;
  /** Gap between an icon/section and the label. */
  gap: number;
}

export type ControlSizes = Record<ScaleKey, ControlSizeMetrics>;

/**
 * The one control-size table.
 *
 * Heights are the canonical ladder. `paddingX` / `iconSize` / `radius` come
 * from the table Button used to render with; `fontSize` is
 * the theme font-size scale (what Button's label and Input's value actually
 * render); `gap` is Button's icon spacing (`spacing[size] / 2`).
 */
export const DEFAULT_CONTROL_SIZES: ControlSizes = {
  xs: { height: 28, paddingX: 8, fontSize: 10, iconSize: 12, radius: 4, gap: 2 },
  sm: { height: 32, paddingX: 10, fontSize: 12, iconSize: 14, radius: 6, gap: 4 },
  md: { height: 40, paddingX: 12, fontSize: 14, iconSize: 16, radius: 8, gap: 6 },
  lg: { height: 44, paddingX: 14, fontSize: 16, iconSize: 18, radius: 10, gap: 8 },
  xl: { height: 48, paddingX: 16, fontSize: 18, iconSize: 20, radius: 12, gap: 10 },
  '2xl': { height: 52, paddingX: 20, fontSize: 20, iconSize: 24, radius: 14, gap: 12 },
  '3xl': { height: 56, paddingX: 24, fontSize: 24, iconSize: 28, radius: 16, gap: 16 },
};

/** Light-scheme shadow tokens (CSS `box-shadow` syntax). */
export const DEFAULT_LIGHT_SHADOWS = {
  xs: '0 1px 3px rgba(0, 0, 0, 0.1)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
  lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  xl: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
} as const;

/** Dark-scheme shadow tokens: the same geometry, denser so they still register on near-black. */
export const DEFAULT_DARK_SHADOWS = {
  xs: '0 1px 3px rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5)',
  md: '0 3px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 20px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.2)',
  xl: '0 15px 25px rgba(0, 0, 0, 0.4), 0 5px 10px rgba(0, 0, 0, 0.1)',
} as const;

/**
 * Built-in modal backdrop (`backgrounds.scrim`) per scheme: a translucent wash
 * behind dialogs, drawers, sheets and lightboxes. Light uses a cool slate so the
 * page dims without going muddy; dark goes deeper so it still separates the
 * (already dark) page from the elevated surface above it.
 */
export const DEFAULT_SCRIM_COLORS = {
  light: 'rgba(15, 23, 42, 0.45)',
  dark: 'rgba(0, 0, 0, 0.6)',
} as const;

/** `{ xs: 4 }` → `{ xs: '4px' }`, the string form theme scales are stored in. */
export function toPxScale<K extends string>(scale: Record<K, number>): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const key of Object.keys(scale) as K[]) {
    out[key] = `${scale[key]}px`;
  }
  return out;
}
