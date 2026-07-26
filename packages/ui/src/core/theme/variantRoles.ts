import type { PlatformBlocksTheme } from './types';
import { adjustHexColor, withAlpha, readableTextOn, composite, pickReadable, relativeLuminance, contrastRatio } from './colorUtils';

/**
 * The canonical, component-agnostic variant vocabulary. Chip, Badge, Tabs, Pill,
 * etc. should all resolve their colors through {@link resolveVariantRoles} so a
 * `light` chip and a `light` badge read identically on every theme.
 */
export type VariantRole = 'filled' | 'outline' | 'light' | 'subtle' | 'surface' | 'gradient';

/** Theme color tokens that resolve to a palette; anything else is treated as a raw color. */
export const CORE_COLORS = ['primary', 'secondary', 'success', 'warning', 'error', 'gray'] as const;

export interface VariantRoles {
  /** Background fill (may be `transparent` or an `rgba()` tint). */
  fill: string;
  /** Border color (may be `transparent`). */
  border: string;
  /** Legible text/icon color for this variant on the current surface. */
  text: string;
}

export interface ResolveVariantOptions {
  variant?: VariantRole;
  /** A theme color token (`primary`, `success`, …) or any raw CSS/hex color. */
  color?: string;
  /**
   * Precomputed gradient stops for the `gradient` variant. Gradient rendering is
   * component-specific (it depends on an optional LinearGradient dependency), so
   * the caller supplies the stops and this only picks a legible text color.
   */
  gradientStops?: [string, string];
}

/** A step this small on either side of the surface reads as the same color. */
const PERCEPTIBLE_STEP = 1.1;

/**
 * Pick the background token that sits one perceptible step *below* `surface`.
 *
 * The `surface` variant has to read as recessed on both schemes, and the token
 * that achieves that differs: light themes get there with `subtle`, while dark
 * themes usually need `base` (their `subtle` is often a hair off the surface).
 * Rather than branch on the scheme — which breaks the moment a consumer supplies
 * their own theme — take the nearest candidate that's genuinely darker, and fall
 * back to darkening the surface directly if a theme offers nothing below it.
 */
const pickRecessed = (theme: PlatformBlocksTheme, surface: string): string => {
  const surfaceLum = relativeLuminance(surface);
  const darker = [theme.backgrounds?.subtle, theme.backgrounds?.base]
    .filter((c): c is string => Boolean(c) && relativeLuminance(c) < surfaceLum);

  const clears = darker.find((c) => contrastRatio(c, surface) >= PERCEPTIBLE_STEP);
  if (clears) return clears;

  // Nothing is a full step down: take the darkest of what's on offer, or make one.
  const darkest = darker.slice().sort((a, b) => relativeLuminance(a) - relativeLuminance(b))[0];
  return darkest ?? adjustHexColor(surface, -14);
};

/**
 * Resolve fill / border / text so every variant stays true to its name across the
 * light and dark schemes and any theme palette or custom color.
 *
 * Palettes invert between schemes (light: [0] lightest → [9] darkest; dark: the
 * reverse), so tinted variants use alpha over the current surface. Text is chosen
 * by *measured* contrast against the real (composited) background rather than a
 * fixed palette index, so it stays legible on any theme a consumer supplies.
 */
export const resolveVariantRoles = (
  theme: PlatformBlocksTheme,
  { variant = 'filled', color = 'primary', gradientStops }: ResolveVariantOptions = {}
): VariantRoles => {
  const isDark = theme.colorScheme === 'dark';
  const isCustomColor = typeof color === 'string' && !(CORE_COLORS as readonly string[]).includes(color);
  const surface = theme.backgrounds?.surface ?? (isDark ? '#000000' : '#FFFFFF');

  // `strong` = the vivid, saturated color used for solid fills.
  // `textCandidates` = shades tried (most-vivid first) when choosing surface-readable text.
  let strong: string;
  let textCandidates: string[];

  if (isCustomColor) {
    strong = color;
    // Push the custom color progressively toward the far end of the surface so a
    // legible shade always exists, ending at a guaranteed black/white fallback.
    textCandidates = isDark
      ? [strong, adjustHexColor(strong, 60), adjustHexColor(strong, 120), '#FFFFFF']
      : [strong, adjustHexColor(strong, -60), adjustHexColor(strong, -120), '#1A1A1A'];
  } else {
    const palette = (theme.colors[color as keyof typeof theme.colors] as string[] | undefined) ?? theme.colors.primary;
    strong = palette[5] ?? palette[Math.floor(palette.length / 2)] ?? palette[0];
    // Higher index = more contrast against the surface in both schemes; try the most
    // vivid first and step toward higher contrast until one clears the threshold.
    textCandidates = [palette[6], palette[7], palette[8], palette[9]].filter(Boolean);
  }

  // Alpha weights: dark surfaces need a touch more tint to register.
  const tintLight = isDark ? 0.22 : 0.14;
  const tintSubtle = isDark ? 0.14 : 0.08;
  const tintBorder = isDark ? 0.38 : 0.3;

  switch (variant) {
    case 'outline':
      return { fill: 'transparent', border: strong, text: pickReadable(textCandidates, surface) };
    case 'light': {
      const compositedBg = composite(strong, surface, tintLight);
      return {
        fill: withAlpha(strong, tintLight),
        border: withAlpha(strong, tintBorder),
        text: pickReadable(textCandidates, compositedBg),
      };
    }
    case 'subtle': {
      const compositedBg = composite(strong, surface, tintSubtle);
      return {
        fill: withAlpha(strong, tintSubtle),
        border: 'transparent',
        text: pickReadable(textCandidates, compositedBg),
      };
    }
    case 'surface': {
      // Neutral by design: the fill comes from the theme's background tokens
      // rather than the `color` palette, so a row of these reads as quiet chrome
      // (input tokens, filter pills) instead of a row of colored status chips.
      // It always sits *darker* than the surface it's on — the recessed-well look
      // — in both schemes, so a chip inside an input stays readable as a token.
      const fill = pickRecessed(theme, surface);
      const border = theme.backgrounds?.border ?? withAlpha(fill, 0.5);
      return {
        fill,
        border,
        text: pickReadable(
          [theme.text?.primary, theme.text?.secondary, isDark ? '#FFFFFF' : '#1A1A1A'].filter(Boolean) as string[],
          fill,
        ),
      };
    }
    case 'gradient': {
      const gradientFill = gradientStops?.[0] ?? strong;
      return {
        fill: gradientFill,
        border: gradientStops?.[1] ?? strong,
        text: readableTextOn(gradientFill),
      };
    }
    case 'filled':
    default:
      return { fill: strong, border: strong, text: readableTextOn(strong) };
  }
};

/**
 * The canonical two-stop gradient for the `gradient` variant. Uses a *tight*,
 * same-hue range — the base color ([5]) deepening to a darker shade ([7]) — so it
 * reads as subtle depth rather than the dated light→dark "sheen" a wide range
 * (e.g. [3]→[7]) produces. Every component that renders a gradient should build
 * its stops here so Button, Badge, Chip, and Card stay visually identical.
 */
export const resolveGradientStops = (
  theme: PlatformBlocksTheme,
  color: string = 'primary',
): [string, string] => {
  if ((CORE_COLORS as readonly string[]).includes(color)) {
    const pal = (theme.colors[color as keyof typeof theme.colors] as string[] | undefined) ?? theme.colors.primary;
    const base = pal[5] ?? pal[Math.floor(pal.length / 2)] ?? pal[0];
    const deep = pal[7] ?? pal[pal.length - 1] ?? base;
    return [base, deep];
  }
  // Custom color: deepen the same hue slightly for a cohesive, subtle gradient.
  return [color, adjustHexColor(color, -28)];
};
