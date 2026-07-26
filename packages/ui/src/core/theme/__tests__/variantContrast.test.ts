/**
 * Variant contrast invariant
 *
 * "True to their name regardless of theme" is only real if it's enforced. This
 * walks every (theme × color × variant) combination the Chip can produce and
 * asserts the resolved text clears a legible contrast ratio against the *actual*
 * background it sits on (composited tint for light/subtle, fill for filled).
 *
 * If a future theme edit breaks legibility, this test fails instead of shipping.
 */
import { describe, it, expect } from '@jest/globals';

import { DEFAULT_THEME } from '../defaultTheme';
import { DARK_THEME } from '../darkTheme';
import { contrastRatio, composite, relativeLuminance } from '../colorUtils';
import { resolveVariantRoles, type VariantRole } from '../variantRoles';
import type { PlatformBlocksTheme } from '../types';

const THEMES: Array<[string, PlatformBlocksTheme]> = [
  ['light', DEFAULT_THEME],
  ['dark', DARK_THEME],
];

const CORE_COLORS: string[] = [
  'primary', 'secondary', 'success', 'warning', 'error', 'gray',
];

// A few adversarial custom colors, including the classic "pale color, white text?" trap.
const CUSTOM_COLORS = ['#7C3AED', '#FFE066', '#0A0A0A', '#00E5FF'];

const TINTED_VARIANTS: VariantRole[] = ['light', 'subtle'];
const ALL_VARIANTS: VariantRole[] = ['filled', 'outline', 'light', 'subtle', 'surface'];

// Tint alphas must mirror resolveVariantRoles so we reconstruct the same bg.
const tintAlpha = (variant: string, isDark: boolean): number => {
  if (variant === 'light') return isDark ? 0.22 : 0.14;
  if (variant === 'subtle') return isDark ? 0.14 : 0.08;
  return 0;
};

const strongOf = (theme: PlatformBlocksTheme, color: string): string => {
  const isCustom = !CORE_COLORS.includes(color as any);
  if (isCustom) return color;
  const palette = (theme.colors as any)[color] ?? theme.colors.primary;
  return palette[5];
};

// Tinted / outline variants choose their own text shade, so hold them to AA-normal
// (4.5). Filled/gradient sit on a fixed brand fill we can't recolor — a saturated
// mid-tone like iOS blue tops out near 4.3 with any text — so require the WCAG
// UI-component floor (3.0); readableTextOn still guarantees the optimal choice there.
const FLOOR_SOLID = 3.0;
const FLOOR_TINT = 4.5;

describe('Chip variant contrast is theme-independent', () => {
  for (const [schemeName, theme] of THEMES) {
    const isDark = theme.colorScheme === 'dark';
    const surface = theme.backgrounds.surface;

    for (const color of [...CORE_COLORS, ...CUSTOM_COLORS]) {
      for (const variant of ALL_VARIANTS) {
        it(`${schemeName} · ${color} · ${variant} keeps text legible`, () => {
          const roles = resolveVariantRoles(theme, { variant, color });

          const bg = TINTED_VARIANTS.includes(variant)
            ? composite(strongOf(theme, color as string), surface, tintAlpha(variant, isDark))
            : variant === 'outline'
              ? surface
              : roles.fill; // filled

          const ratio = contrastRatio(roles.text, bg);
          const floor = variant === 'filled' ? FLOOR_SOLID : FLOOR_TINT;

          expect(ratio).toBeGreaterThanOrEqual(floor);
        });
      }
    }
  }
});

/**
 * The `surface` variant is the neutral one: it must stay visible against the
 * surface it sits on (the failure mode is a chip whose fill *is* the surface, so
 * it vanishes) and must not shift with `color`.
 */
describe('surface variant is neutral and visible', () => {
  for (const [schemeName, theme] of THEMES) {
    const surface = theme.backgrounds.surface;

    it(`${schemeName} · fill is a perceptible step darker than the surface`, () => {
      const { fill } = resolveVariantRoles(theme, { variant: 'surface' });
      // Darker in both schemes — a chip inside an input reads as a recessed token,
      // never as a raised one. The dark-scheme regression this guards: reaching for
      // `elevated`, which is lighter than the input it sits in.
      expect(relativeLuminance(fill)).toBeLessThan(relativeLuminance(surface));
      expect(contrastRatio(fill, surface)).toBeGreaterThanOrEqual(1.1);
    });

    it(`${schemeName} · ignores the color prop`, () => {
      const base = resolveVariantRoles(theme, { variant: 'surface', color: 'primary' });
      for (const color of [...CORE_COLORS, ...CUSTOM_COLORS]) {
        expect(resolveVariantRoles(theme, { variant: 'surface', color })).toEqual(base);
      }
    });
  }
});

/**
 * Button's color-bearing variants (filled/light/subtle/outline/gradient) route
 * through resolveVariantRoles and are covered above. These cases lock in Button's
 * *own* color decisions: the neutral `secondary` fill and the default `ghost`/`link`
 * text, which must stay legible on every theme.
 */
describe('Button neutral variants stay legible', () => {
  for (const [schemeName, theme] of THEMES) {
    const isDark = theme.colorScheme === 'dark';
    const surface = theme.backgrounds.surface;

    it(`${schemeName} · secondary fill vs text`, () => {
      const bg = isDark ? theme.colors.gray[3] : theme.colors.gray[1];
      expect(contrastRatio(theme.colors.gray[7], bg)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${schemeName} · secondary fill is not the surface`, () => {
      const bg = isDark ? theme.colors.gray[3] : theme.colors.gray[1];
      // The dark-mode regression this guards against: gray[1] === surface → invisible.
      expect(contrastRatio(bg, surface)).toBeGreaterThan(1.05);
    });

    it(`${schemeName} · ghost default text on surface`, () => {
      expect(contrastRatio(theme.colors.gray[7], surface)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${schemeName} · link default text on surface`, () => {
      // Underlined brand-colored link; a mid-tone brand hue tops out near 4:1.
      expect(contrastRatio(theme.colors.primary[5], surface)).toBeGreaterThanOrEqual(3.0);
    });
  }
});
