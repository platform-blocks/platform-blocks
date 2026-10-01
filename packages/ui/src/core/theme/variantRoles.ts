import type { PlocksTheme } from './types';
import { adjustHexColor, withAlpha, readableTextOn, composite, pickReadable, relativeLuminance, contrastRatio } from './colorUtils';
import { literalBackgrounds, literalText, themeColorForFirstPaint, themeVariantFillForFirstPaint } from './cssVariableTheme';

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
const pickRecessed = (theme: PlocksTheme, surface: string): { rendered: string; literal: string } => {
  const surfaceLum = relativeLuminance(surface);
  // Choose against the literal colors — `var(--x)` has no luminance — but return
  // whatever `theme.backgrounds` renders for the winner, so the fill still tracks
  // the scheme under a CSS-variable theme.
  const literal = literalBackgrounds(theme);
  const rendered = theme.backgrounds;
  const candidates = (['subtle', 'base'] as const)
    .map((token) => ({ token, value: literal?.[token] }))
    .filter((c): c is { token: 'subtle' | 'base'; value: string } =>
      Boolean(c.value) && relativeLuminance(c.value as string) < surfaceLum);

  const clears = candidates.find((c) => contrastRatio(c.value, surface) >= PERCEPTIBLE_STEP);
  if (clears) return { rendered: rendered?.[clears.token] ?? clears.value, literal: clears.value };

  // Nothing is a full step down: take the darkest of what's on offer, or make one.
  const darkest = candidates
    .slice()
    .sort((a, b) => relativeLuminance(a.value) - relativeLuminance(b.value))[0];
  if (darkest) return { rendered: rendered?.[darkest.token] ?? darkest.value, literal: darkest.value };
  const adjusted = adjustHexColor(surface, -14);
  return { rendered: adjusted, literal: adjusted };
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
  theme: PlocksTheme,
  { variant = 'filled', color = 'primary', gradientStops }: ResolveVariantOptions = {}
): VariantRoles => {
  const isDark = theme.colorScheme === 'dark';
  const isCustomColor = typeof color === 'string' && !(CORE_COLORS as readonly string[]).includes(color);
  // Measured against, and composited with, throughout this function — so it has
  // to be the literal color rather than a `var()` reference.
  const surface = literalBackgrounds(theme)?.surface ?? (isDark ? '#000000' : '#FFFFFF');

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

  const firstPaint = (roles: VariantRoles, tintedLight = false): VariantRoles => {
    if (!theme.literalColors) return roles;
    return {
      fill: tintedLight
        ? themeVariantFillForFirstPaint(theme, 'light-fill', color, roles.fill)
        : themeColorForFirstPaint(theme, roles.fill) ?? roles.fill,
      border: themeColorForFirstPaint(theme, roles.border) ?? roles.border,
      text: themeColorForFirstPaint(theme, roles.text) ?? roles.text,
    };
  };

  switch (variant) {
    case 'outline':
      return firstPaint({ fill: 'transparent', border: strong, text: pickReadable(textCandidates, surface) });
    case 'light': {
      const compositedBg = composite(strong, surface, tintLight);
      return firstPaint({
        fill: withAlpha(strong, tintLight),
        border: 'transparent',
        text: pickReadable(textCandidates, compositedBg),
      }, true);
    }
    case 'subtle': {
      return firstPaint({
        fill: 'transparent',
        border: 'transparent',
        text: pickReadable(textCandidates, surface),
      });
    }
    case 'surface': {
      // Neutral by design: the fill comes from the theme's background tokens
      // rather than the `color` palette, so a row of these reads as quiet chrome
      // (input tokens, filter pills) instead of a row of colored status chips.
      // It always sits *darker* than the surface it's on — the recessed-well look
      // — in both schemes, so a chip inside an input stays readable as a token.
      const fill = pickRecessed(theme, surface);
      const border = theme.backgrounds?.border ?? withAlpha(fill.literal, 0.5);
      const textTokens = literalText(theme);
      const chosenText = pickReadable(
        [textTokens?.primary, textTokens?.secondary, isDark ? '#FFFFFF' : '#1A1A1A'].filter(Boolean) as string[],
        fill.literal,
      );
      const text = chosenText === textTokens?.primary
        ? theme.text?.primary ?? chosenText
        : chosenText === textTokens?.secondary
          ? theme.text?.secondary ?? chosenText
          : chosenText;
      return firstPaint({
        fill: fill.rendered,
        border,
        text,
      });
    }
    case 'gradient': {
      const gradientFill = gradientStops?.[0] ?? strong;
      return firstPaint({
        fill: gradientFill,
        border: 'transparent',
        text: readableTextOn(gradientFill),
      });
    }
    case 'filled':
    default:
      return firstPaint({ fill: strong, border: 'transparent', text: readableTextOn(strong) });
  }
};

/** The interaction wash for a subtle control, which is clear at rest. */
export const resolveSubtleHoverFill = (theme: PlocksTheme, color: string = 'primary'): string => {
  const palette = (theme.colors as Record<string, string[] | undefined>)[color];
  const strong = palette?.[5] ?? palette?.[Math.floor(palette.length / 2)] ?? palette?.[0] ?? color;
  return themeVariantFillForFirstPaint(
    theme,
    'subtle-hover',
    color,
    withAlpha(strong, theme.colorScheme === 'dark' ? 0.14 : 0.08),
  );
};

/**
 * The canonical two-stop gradient for the `gradient` variant. Uses a *tight*,
 * same-hue range — the base color ([5]) deepening to a darker shade ([7]) — so it
 * reads as subtle depth rather than the dated light→dark "sheen" a wide range
 * (e.g. [3]→[7]) produces. Every component that renders a gradient should build
 * its stops here so Button, Badge, Chip, and Card stay visually identical.
 */
export const resolveGradientStops = (
  theme: PlocksTheme,
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
