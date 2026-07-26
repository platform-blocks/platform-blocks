import {
  clampSurfaceLevel,
  resolveSurface,
  resolveSurfaceBackground,
  surfaceInteractionTint,
} from '../surfaces';
import { DEFAULT_THEME } from '../defaultTheme';
import { DARK_THEME } from '../darkTheme';

describe('surface elevation ladder', () => {
  describe('resolveSurface', () => {
    it('never returns a mid-grey palette shade for a light-mode overlay', () => {
      // Regression: Menu dropdowns indexed `theme.colors.surface[4]` (#DFDFE1),
      // a step of a 10-shade palette rather than a semantic background, so they
      // rendered as a grey slab next to white popovers.
      expect(resolveSurface(DEFAULT_THEME, 2).background).toBe('#FFFFFF');
      expect(resolveSurface(DEFAULT_THEME, 2).background).not.toBe(
        DEFAULT_THEME.colors.surface[4],
      );
    });

    it('gets lighter as it rises in dark mode', () => {
      const luminance = (hex: string) => parseInt(hex.slice(1), 16);
      const levels = [0, 1, 2, 3].map(l => luminance(resolveSurface(DARK_THEME, l).background));

      for (let i = 1; i < levels.length; i++) {
        expect(levels[i]).toBeGreaterThan(levels[i - 1]);
      }
    });

    it('clamps out-of-range levels instead of returning undefined', () => {
      expect(resolveSurface(DEFAULT_THEME, 99)).toEqual(resolveSurface(DEFAULT_THEME, 3));
      expect(resolveSurface(DEFAULT_THEME, -5)).toEqual(resolveSurface(DEFAULT_THEME, 0));
    });

    it('derives a ladder from backgrounds when the theme predates surfaces', () => {
      const { surfaces, ...legacyTheme } = DEFAULT_THEME as any;

      expect(surfaces).toBeDefined(); // guard: the fixture must actually drop something
      expect(resolveSurfaceBackground(legacyTheme, 0)).toBe(DEFAULT_THEME.backgrounds.base);
      expect(resolveSurfaceBackground(legacyTheme, 1)).toBe(DEFAULT_THEME.backgrounds.surface);
      expect(resolveSurfaceBackground(legacyTheme, 2)).toBe(DEFAULT_THEME.backgrounds.elevated);
    });

    it('fills in per-field for a theme that declares only some levels', () => {
      const partial = {
        ...DEFAULT_THEME,
        surfaces: { 2: { background: '#ABCDEF' } },
      } as any;

      const token = resolveSurface(partial, 2);
      expect(token.background).toBe('#ABCDEF');
      // border/shadow fall back to the derived ladder rather than undefined
      expect(token.border).toBe(DEFAULT_THEME.backgrounds.border);
      expect(token.shadow).toBe('md');
    });
  });

  describe('clampSurfaceLevel', () => {
    it('falls back to the resting level for non-finite input', () => {
      expect(clampSurfaceLevel(NaN)).toBe(1);
    });
  });

  describe('surfaceInteractionTint', () => {
    it('darkens on light themes and lightens on dark themes', () => {
      expect(surfaceInteractionTint(DEFAULT_THEME, 'hover')).toContain('rgba(0, 0, 0');
      expect(surfaceInteractionTint(DARK_THEME, 'hover')).toContain('rgba(255, 255, 255');
    });

    it('makes pressed stronger than hover', () => {
      const alpha = (rgba: string) => parseFloat(rgba.split(',')[3]);
      expect(alpha(surfaceInteractionTint(DARK_THEME, 'pressed'))).toBeGreaterThan(
        alpha(surfaceInteractionTint(DARK_THEME, 'hover')),
      );
    });

    it('keeps band the faintest state — it marks a section, not an interaction', () => {
      const alpha = (rgba: string) => parseFloat(rgba.split(',')[3]);
      const states = ['band', 'hover', 'selected', 'pressed'] as const;
      const alphas = states.map(s => alpha(surfaceInteractionTint(DARK_THEME, s)));

      expect(Math.min(...alphas)).toBe(alphas[0]);
    });

    it('stays visible against the surface it tints in both schemes', () => {
      // A band must not resolve to the container's own color — the bug that
      // made dark-mode section headers and blockquotes disappear.
      expect(surfaceInteractionTint(DARK_THEME, 'band')).not.toBe(
        resolveSurface(DARK_THEME, 1).background,
      );
      expect(surfaceInteractionTint(DEFAULT_THEME, 'band')).not.toBe(
        resolveSurface(DEFAULT_THEME, 1).background,
      );
    });
  });
});
