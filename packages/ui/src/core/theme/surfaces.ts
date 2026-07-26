import type {
  PlatformBlocksTheme,
  SurfaceLevel,
  SurfaceScale,
  SurfaceToken,
} from './types';

export type { SurfaceLevel, SurfaceScale, SurfaceToken };

/** Every level, in order — handy for demos and iteration. */
export const SURFACE_LEVELS: SurfaceLevel[] = [0, 1, 2, 3];

/**
 * Clamp any incoming value onto the ladder. Nested surfaces increment their
 * level, so it's easy to walk off the end of a 4-step scale; saturating at the
 * top is friendlier than throwing or wrapping around to the page background.
 */
export function clampSurfaceLevel(level: number): SurfaceLevel {
  if (!Number.isFinite(level)) return 1;
  const rounded = Math.round(level);
  if (rounded <= 0) return 0;
  if (rounded >= 3) return 3;
  return rounded as SurfaceLevel;
}

/**
 * Build an elevation ladder out of a theme that predates `theme.surfaces`.
 *
 * `backgrounds` already encodes an implicit ordering (base → surface →
 * elevated), it just doesn't say so. Deriving from it means every existing
 * custom theme gets a usable ladder without touching its definition.
 */
function deriveSurfaceScale(theme: PlatformBlocksTheme): SurfaceScale {
  const backgrounds = theme.backgrounds ?? ({} as PlatformBlocksTheme['backgrounds']);
  const border = backgrounds.border ?? theme.semantic?.borderDefault ?? 'rgba(0,0,0,0.08)';
  const subtleBorder = theme.semantic?.borderSubtle ?? border;
  const base = backgrounds.base ?? backgrounds.surface ?? '#FFFFFF';
  const surface = backgrounds.surface ?? base;
  const elevated = backgrounds.elevated ?? surface;

  return {
    0: { background: base, border: subtleBorder, shadow: 'none' },
    1: { background: surface, border, shadow: 'xs' },
    2: { background: elevated, border, shadow: 'md' },
    3: { background: elevated, border, shadow: 'xl' },
  };
}

/**
 * Resolve one step of the elevation ladder.
 *
 * Prefers the theme's explicit `surfaces` scale and falls back to a scale
 * derived from `backgrounds`, filling in per-field so a theme that defines
 * only some levels still resolves the rest.
 */
export function resolveSurface(
  theme: PlatformBlocksTheme,
  level: SurfaceLevel | number = 1
): SurfaceToken {
  const resolvedLevel = clampSurfaceLevel(level);
  const derived = deriveSurfaceScale(theme);
  const declared = theme.surfaces?.[resolvedLevel];

  if (!declared) return derived[resolvedLevel];

  return {
    background: declared.background ?? derived[resolvedLevel].background,
    border: declared.border ?? derived[resolvedLevel].border,
    shadow: declared.shadow ?? derived[resolvedLevel].shadow,
  };
}

/** Convenience accessor for just the fill — the most common single lookup. */
export function resolveSurfaceBackground(
  theme: PlatformBlocksTheme,
  level: SurfaceLevel | number = 1
): string {
  return resolveSurface(theme, level).background;
}

/**
 * `band` is the one non-interactive state: a section header, striped row, or
 * any strip that should read as *part of* its surface rather than as a new one.
 */
export type SurfaceInteractionState = 'band' | 'hover' | 'pressed' | 'selected';

const INTERACTION_ALPHA: Record<SurfaceInteractionState, { light: number; dark: number }> = {
  band: { light: 0.03, dark: 0.05 },
  hover: { light: 0.04, dark: 0.07 },
  pressed: { light: 0.08, dark: 0.12 },
  selected: { light: 0.06, dark: 0.1 },
};

/**
 * Tint for something sitting *on* a surface — hover, pressed, selected, or a
 * banded section.
 *
 * Returned as a translucent overlay rather than an opaque palette shade,
 * because a fixed shade can only be correct at one elevation: `gray[1]` reads
 * as a highlight on a level-1 dark panel but is *darker* than a level-2 dark
 * dropdown, so hovering a menu item used to make it recede. An overlay lightens
 * in dark mode and darkens in light mode at every level.
 */
export function surfaceInteractionTint(
  theme: PlatformBlocksTheme,
  state: SurfaceInteractionState = 'hover'
): string {
  const alpha = INTERACTION_ALPHA[state] ?? INTERACTION_ALPHA.hover;
  return theme.colorScheme === 'dark'
    ? `rgba(255, 255, 255, ${alpha.dark})`
    : `rgba(0, 0, 0, ${alpha.light})`;
}
