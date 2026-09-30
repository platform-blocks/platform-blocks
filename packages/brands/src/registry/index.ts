import { brandIcons, type BrandName } from './icons';
import { brandColors, FALLBACK_BRAND_COLORS, type BrandColors } from './colors';
import { brandLabels } from './labels';

export { brandIcons, brandColors, brandLabels };
export type { BrandName, BrandColors };

/** Everything the registry knows about one brand. */
export interface BrandInfo {
  name: BrandName;
  /** The brand's own spelling of its name, e.g. `GitHub`, `Node.js`. */
  label: string;
  colors: BrandColors;
  /** See {@link getBrandPalette}. */
  palette: string[];
}

/** Every brand in the registry, A–Z. */
export const brandNames: readonly BrandName[] = (Object.keys(brandIcons) as BrandName[]).sort();

/**
 * Whether `value` names a brand in the registry. Narrows a string that came
 * from outside the type system (a URL, CMS field or config) to `BrandName`.
 */
export const isBrandName = (value: unknown): value is BrandName =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(brandIcons, value);

/** The fill, text and optional border color a filled BrandButton uses for `brand`. */
export const getBrandColors = (brand: BrandName): BrandColors => ({
  ...(brandColors[brand] ?? FALLBACK_BRAND_COLORS),
});

/** `#abc` and `#aabbcc` as `#AABBCC`; `undefined` for `currentColor`, `url(#…)` and the like. */
function toHex(value: string | undefined): string | undefined {
  const match = value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return undefined;
  const digits = match[1].length === 3 ? match[1].replace(/./g, (d) => d + d) : match[1];
  return `#${digits.toUpperCase()}`;
}

interface MarkColors {
  content?: unknown;
  full?: unknown;
  defs?: { linearGradients?: ReadonlyArray<{ stops: ReadonlyArray<{ stopColor: string }> }> };
}

/**
 * The brand's colors: its primary color (the BrandButton fill) first, then
 * every other color in its full-color mark, gradient stops included, in the
 * order they're drawn. Hex, uppercase, no duplicates.
 */
export function getBrandPalette(brand: BrandName): string[] {
  const mark = brandIcons[brand] as MarkColors | undefined;
  const shapes = mark?.full ?? mark?.content;
  const found = [getBrandColors(brand).backgroundColor];
  if (Array.isArray(shapes)) {
    for (const shape of shapes as ReadonlyArray<{ fill?: string; stroke?: string }>) {
      found.push(shape.fill ?? '', shape.stroke ?? '');
    }
  }
  for (const gradient of mark?.defs?.linearGradients ?? []) {
    for (const stop of gradient.stops) found.push(stop.stopColor);
  }
  return [...new Set(found.map(toHex).filter((color): color is string => color !== undefined))];
}

/** A brand's label, colors and palette in one lookup. */
export const getBrand = (brand: BrandName): BrandInfo => ({
  name: brand,
  label: brandLabels[brand] ?? brand,
  colors: getBrandColors(brand),
  palette: getBrandPalette(brand),
});
