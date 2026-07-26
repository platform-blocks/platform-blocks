// Accessible / semantic color palettes & assignment utilities

import { colorSchemes } from './utils';

/**
 * Default categorical palette — validated for both color schemes.
 *
 * The same eight hues stepped for each surface (not an automatic flip): the slot
 * ORDER is the CVD-safety mechanism, chosen so every adjacent pair clears the
 * hard gates (worst adjacent CVD ΔE ≈ 9.1 light / 8.4 dark, OKLab ×100; normal-
 * vision ΔE ≈ 19.6 light / 19.3 dark) on the light `#FFFFFF` and dark `#1C1C1F`
 * chart surfaces. Do not reorder or re-step without re-running the palette
 * validator against both surfaces. Slots past #3 cannot clear the all-pairs
 * floors (scatter/bubble) — fold extras to "Other" or facet rather than cycling.
 */
export const paletteDefaultLight = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
];

export const paletteDefaultDark = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
  '#e66767', // red
];

/**
 * Back-compat alias — light is the historical default. Prefer selecting
 * {@link paletteDefaultLight} / {@link paletteDefaultDark} by the active scheme.
 */
export const paletteDefault = paletteDefaultLight;

/**
 * Pick the validated categorical palette for a color scheme.
 */
export function getDefaultPalette(scheme: 'light' | 'dark' = 'light'): string[] {
  return scheme === 'dark' ? paletteDefaultDark : paletteDefaultLight;
}

/**
 * Okabe–Ito colorblind safe palette (8 colors)
 */
export const paletteColorBlind = [
  '#000000', // black
  '#E69F00', // orange
  '#56B4E9', // sky blue
  '#009E73', // bluish green
  '#F0E442', // yellow
  '#0072B2', // blue
  '#D55E00', // vermillion
  '#CC79A7', // reddish purple
];

/**
 * High contrast palette for accessibility
 */
export const paletteHighContrast = [
  '#000000', '#ffffff', '#ff005e', '#00d5ff', '#ffb800', '#6200ff', '#00c500', '#ff8400'
];

/**
 * Available palette names
 */
export type PaletteName = 'default' | 'colorBlind' | 'highContrast';

/**
 * Palette registry mapping names to color arrays
 */
const registry: Record<PaletteName, string[]> = {
  default: paletteDefault,
  colorBlind: paletteColorBlind,
  highContrast: paletteHighContrast,
};

/**
 * Options for color assignment
 */
export interface ColorAssignOptions {
  /** Palette name or custom color array */
  palette?: PaletteName | string[];
  /** Use deterministic hashing by id */
  hash?: boolean;
}

/**
 * Simple string hashing function for deterministic color assignment
 * @param str - String to hash
 * @returns Hash value
 */
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Creates a color assignment function based on palette and hashing options
 * @param opts - Color assignment options
 * @returns Function that assigns colors by index or id
 */
export function createColorAssigner(opts: ColorAssignOptions = {}) {
  let palette: string[];
  if (Array.isArray(opts.palette)) {
    palette = opts.palette;
  } else if (!opts.palette || opts.palette === 'default') {
    palette = colorSchemes.default;
  } else {
    palette = registry[opts.palette] || registry.default;
  }
  return (index: number, id?: string | number) => {
    if (opts.hash && id != null) {
      const h = hashString(String(id));
      return palette[h % palette.length];
    }
    return palette[index % palette.length];
  };
}
