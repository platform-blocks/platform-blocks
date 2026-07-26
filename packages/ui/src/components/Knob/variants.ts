import type { PlatformBlocksTheme } from '../../core/theme/types';
import type { KnobAppearance, KnobVariant } from './types';

/**
 * Visual variants change the knob's *form* — stroke weights, caps, whether the body is
 * filled, whether the indicator is an arm or a dot. They deliberately do not invent their
 * own palettes: color still comes from the theme and the accent, so a variant reads the
 * same in light and dark and never fights a brand.
 *
 * Every value here is a default. The preset is merged *under* the caller's `appearance`,
 * so any single property can still be overridden without opting out of the variant.
 */
export type KnobVariantContext = {
  theme: PlatformBlocksTheme;
  /** Resolved diameter in pixels — every metric below scales off it. */
  size: number;
  /** The already-resolved highlight color for this knob. */
  accentColor: string;
  disabled: boolean;
};

const scale = (size: number, ratio: number, min: number) => Math.max(min, Math.round(size * ratio));

/** Segments in the `digital` collar — a 7-bit ladder, dense enough to read as continuous. */
const DIGITAL_SEGMENT_COUNT = 128;

type KnobVariantBuilder = (context: KnobVariantContext) => KnobAppearance;

const VARIANT_BUILDERS: Record<Exclude<KnobVariant, 'default'>, KnobVariantBuilder> = {
  /**
   * Hairline everything, for dense panels and toolbars. No body, no arm — just a thin
   * track, the filled arc, and a small dot. (`pointer: false` restates the base default so
   * the preset stays a complete description of the look.)
   */
  minimal: ({ theme, size, accentColor }) => ({
    fill: { color: 'transparent' },
    ring: {
      thickness: scale(size, 0.022, 2),
      color: theme.colors.gray[2],
      trailColor: theme.colors.gray[2],
      cap: 'round',
    },
    progress: { mode: 'contiguous', color: accentColor, roundedCaps: true },
    thumb: { size: scale(size, 0.085, 8), color: accentColor },
    pointer: false,
  }),

  /**
   * A step-based gear readout: a collar of individually lit segments inside the ring that
   * fills as the value climbs, plus butt caps and a square glowing marker. The segment count
   * is fixed rather than derived from `step`, so the collar reads the same whether the knob
   * runs 0–1 or 0–360.
   */
  digital: ({ theme, size, accentColor, disabled }) => ({
    fill: { color: 'transparent' },
    ring: {
      thickness: scale(size, 0.06, 4),
      color: theme.colors.gray[2],
      trailColor: theme.colors.gray[2],
      cap: 'butt',
    },
    progress: { mode: 'contiguous', color: accentColor, roundedCaps: false },
    ticks: {
      source: 'count',
      count: DIGITAL_SEGMENT_COUNT,
      shape: 'line',
      position: 'inner',
      // Sits just inside the ring, with a gap so the lit segments read as their own collar
      // rather than as fringe on the track.
      radiusOffset: -scale(size, 0.035, 3),
      length: scale(size, 0.05, 4),
      width: 1,
      color: accentColor,
      inactiveColor: theme.colors.gray[2],
      // Lights everything up to the value, the way a meter fills.
      activeMode: 'fill',
    },
    thumb: {
      shape: 'square',
      size: scale(size, 0.13, 10),
      color: accentColor,
      glow: disabled ? undefined : { color: accentColor, intensity: 0.55, blur: scale(size, 0.3, 12) },
    },
    pointer: { width: scale(size, 0.022, 2), cap: 'butt', color: accentColor },
  }),

  /**
   * Skeuomorphic hardware: a solid body with a bevel-ish border, no dot on the rim, and a
   * stubby indicator arm over a center cap. Mark ticks, when the knob has marks, sit
   * outside the body like a silkscreened panel.
   */
  retro: ({ theme, size, accentColor }) => ({
    fill: {
      color: theme.colors.gray[7],
      borderWidth: Math.max(2, Math.round(size * 0.015)),
      borderColor: theme.colors.gray[5],
      radiusOffset: -scale(size, 0.035, 3),
    },
    ring: {
      thickness: scale(size, 0.03, 2),
      color: theme.colors.gray[4],
      trailColor: theme.colors.gray[3],
      cap: 'round',
    },
    progress: false,
    thumb: false,
    pointer: {
      length: scale(size, 0.3, 18),
      width: scale(size, 0.035, 3),
      color: theme.backgrounds.surface,
      cap: 'round',
      counterweight: { size: scale(size, 0.09, 8), color: theme.backgrounds.surface },
    },
    ticks: {
      source: 'marks',
      shape: 'line',
      position: 'outer',
      length: scale(size, 0.055, 5),
      width: 2,
      radiusOffset: scale(size, 0.02, 2),
      color: accentColor,
      inactiveColor: theme.colors.gray[4],
      activeMode: 'nearest',
    },
  }),

  /**
   * The plugin-rack look: a chunky track, a bright filled arc, and a rim dot outlined
   * against the surface so it stays legible on top of the arc.
   */
  studio: ({ theme, size, accentColor }) => ({
    fill: { color: 'transparent' },
    ring: {
      thickness: scale(size, 0.075, 5),
      color: theme.colors.gray[2],
      trailColor: theme.colors.gray[2],
      cap: 'round',
    },
    progress: { mode: 'contiguous', color: accentColor, roundedCaps: true },
    thumb: {
      size: scale(size, 0.11, 9),
      color: accentColor,
      strokeWidth: 2,
      strokeColor: theme.backgrounds.surface,
    },
    pointer: { width: scale(size, 0.018, 2), color: accentColor },
  }),
};

/** Resolves a variant to its appearance defaults. `default` (or unset) adds nothing. */
export const buildKnobVariantAppearance = (
  variant: KnobVariant | undefined,
  context: KnobVariantContext
): KnobAppearance | undefined => {
  if (!variant || variant === 'default') return undefined;
  return VARIANT_BUILDERS[variant]?.(context);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Merges a caller's appearance over a variant preset, one layer deep. `false`/`null` from
 * the caller wins outright (that is how a layer gets removed), arrays replace rather than
 * concatenate, and anything the caller leaves out keeps the preset's value — so
 * `variant="retro"` plus `appearance={{ ring: { color: 'red' } }}` keeps retro's thickness.
 */
export const mergeKnobAppearance = (
  base: KnobAppearance | undefined,
  override: KnobAppearance | undefined
): KnobAppearance | undefined => {
  if (!base) return override;
  if (!override) return base;

  const merged: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override) as (keyof KnobAppearance)[]) {
    const next = override[key];
    if (next === undefined) continue;
    const previous = merged[key];
    merged[key] =
      isPlainObject(previous) && isPlainObject(next) ? { ...previous, ...next } : next;
  }
  return merged as KnobAppearance;
};
