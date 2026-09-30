import { DARK_THEME } from './darkTheme';
import { DEFAULT_FONT_FAMILY_MONO, DEFAULT_THEME } from './defaultTheme';
import { DEFAULT_CONTROL_SIZES, SCALE_KEYS, type ControlSizes } from './scales';
import { parsePx } from './tokens';
import type {
  PlocksTheme,
  PlocksThemeOverride,
  PlocksThemePair,
  ThemeBackgrounds,
} from './types';
import { DEFAULT_Z_INDICES } from './zIndices';

/**
 * The built-in theme for each scheme. `DARK_THEME` is complete, but spreading
 * `DEFAULT_THEME` first keeps anything it doesn't define (e.g. `designTokens`).
 */
const BUILT_IN_THEMES: Record<'light' | 'dark', PlocksTheme> = {
  light: DEFAULT_THEME,
  dark: { ...DEFAULT_THEME, ...DARK_THEME, colorScheme: 'dark' },
};

/** The built-in (library default) theme for a color scheme. */
export function getBuiltInTheme(scheme: 'light' | 'dark'): PlocksTheme {
  return BUILT_IN_THEMES[scheme];
}

/**
 * Deep merges a theme override with a base theme.
 *
 * Arrays (palettes) are replaced, not merged, and control-size font sizes
 * follow an overridden `fontSizes` scale unless the override also sets
 * `controlSizes`.
 */
export function mergeTheme(
  defaultTheme: PlocksTheme,
  themeOverride?: PlocksThemeOverride
): PlocksTheme {
  if (!themeOverride) {
    return defaultTheme;
  }

  const merged = deepMerge(defaultTheme, themeOverride);

  if (themeOverride.fontSizes && !themeOverride.controlSizes) {
    merged.controlSizes = controlSizesForFontSizes(merged.controlSizes, merged.fontSizes);
  }

  return merged;
}

/** Re-points each control size's `fontSize` at the matching entry of `fontSizes`. */
function controlSizesForFontSizes(
  controlSizes: ControlSizes | undefined,
  fontSizes: PlocksTheme['fontSizes']
): ControlSizes {
  const base = controlSizes ?? DEFAULT_CONTROL_SIZES;
  const out = {} as ControlSizes;
  for (const key of SCALE_KEYS) {
    const fontSize = parsePx(fontSizes?.[key]);
    out[key] = { ...DEFAULT_CONTROL_SIZES[key], ...base[key], ...(fontSize !== undefined ? { fontSize } : {}) };
  }
  return out;
}

type PlainObject = Record<string, unknown>;

/**
 * Helper function for deep merging objects: plain objects merge key by key,
 * anything else (arrays included) in `source` replaces the target value. The
 * result has the target's shape: `source` is a (deep) partial of it.
 */
function deepMerge<T extends object>(target: T, source: object): T {
  const result = { ...target } as PlainObject;

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = result[key];
    result[key] = isObject(sourceValue) && isObject(targetValue)
      ? deepMerge(targetValue, sourceValue)
      : sourceValue;
  }

  return result as T;
}

function isObject(item: unknown): item is PlainObject {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}

const NEW_BACKGROUND_ROLES: (keyof ThemeBackgrounds)[] = [
  'borderStrong',
  'hover',
  'pressed',
  'selected',
  'disabled',
  'mark',
  'scrim',
];

const normalizedCache = new WeakMap<object, PlocksTheme>();

/**
 * Fills the groups a hand-written theme object tends to leave out — a complete
 * custom theme handed to a provider, say. Missing `controlSizes`, `zIndices`,
 * `fontFamilyMono` and background roles come from the built-in theme of the
 * same color scheme.
 *
 * Returns the input itself when nothing is missing, and a cached object per
 * input otherwise, so the result is referentially stable.
 */
export function normalizeTheme(theme: PlocksTheme): PlocksTheme {
  if (!theme || typeof theme !== 'object') return theme;
  const cached = normalizedCache.get(theme);
  if (cached) return cached;

  const builtIn = getBuiltInTheme(theme.colorScheme === 'dark' ? 'dark' : 'light');
  const backgrounds = theme.backgrounds as Partial<ThemeBackgrounds> | undefined;
  const missingRoles = NEW_BACKGROUND_ROLES.filter((role) => !backgrounds?.[role]);
  const needsFill =
    !theme.controlSizes ||
    !theme.zIndices ||
    !theme.fontFamilyMono ||
    missingRoles.length > 0;

  if (!needsFill) {
    normalizedCache.set(theme, theme);
    return theme;
  }

  const filledBackgrounds = { ...builtIn.backgrounds, ...(backgrounds ?? {}) } as ThemeBackgrounds;
  const normalized: PlocksTheme = {
    ...theme,
    backgrounds: filledBackgrounds,
    controlSizes: theme.controlSizes ?? builtIn.controlSizes ?? DEFAULT_CONTROL_SIZES,
    zIndices: { ...DEFAULT_Z_INDICES, ...(theme.zIndices ?? {}) },
    fontFamilyMono: theme.fontFamilyMono ?? builtIn.fontFamilyMono ?? DEFAULT_FONT_FAMILY_MONO,
  };
  // A theme rewritten to CSS variables keeps its literal twins in step.
  const literalBackgroundsIn = theme.literalColors?.backgrounds as Partial<ThemeBackgrounds> | undefined;
  if (theme.literalColors && NEW_BACKGROUND_ROLES.some((role) => !literalBackgroundsIn?.[role])) {
    normalized.literalColors = {
      ...theme.literalColors,
      backgrounds: { ...builtIn.backgrounds, ...theme.literalColors.backgrounds },
    };
  }
  normalizedCache.set(theme, normalized);
  return normalized;
}

/** True for `{ light?, dark? }` theme pairs (as opposed to a single theme override). */
export function isThemePair(value: unknown): value is PlocksThemePair {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if ('colors' in candidate || 'colorScheme' in candidate || 'primaryColor' in candidate) return false;
  const hasSide = 'light' in candidate || 'dark' in candidate;
  if (!hasSide) return false;
  return Object.keys(candidate).every((key) => key === 'light' || key === 'dark');
}

const schemeThemeCache = new WeakMap<object, Partial<Record<'light' | 'dark', PlocksTheme>>>();

/**
 * The complete theme for `scheme` given a provider's `theme` prop:
 *
 * - `undefined` → the built-in theme for the scheme;
 * - `{ light, dark }` → that side merged onto the built-in theme for the scheme;
 * - an override with an explicit `colorScheme` → merged onto the built-in theme
 *   of THAT scheme (the scheme switch does not apply — the theme pins it);
 * - any other partial override → merged onto the built-in theme for `scheme`,
 *   so a custom theme keeps light/dark switching.
 *
 * Results are cached per input object and scheme (stable identity).
 */
export function resolveThemeForScheme(
  theme: PlocksThemeOverride | PlocksThemePair | undefined | null,
  scheme: 'light' | 'dark'
): PlocksTheme {
  if (!theme) return getBuiltInTheme(scheme);

  let perInput = schemeThemeCache.get(theme);
  if (!perInput) {
    perInput = {};
    schemeThemeCache.set(theme, perInput);
  }
  const cached = perInput[scheme];
  if (cached) return cached;

  let resolved: PlocksTheme;
  if (isThemePair(theme)) {
    const side = theme[scheme];
    resolved = side ? mergeOnto(scheme, side) : getBuiltInTheme(scheme);
  } else {
    const override = theme as PlocksThemeOverride;
    const pinned = override.colorScheme === 'dark' || override.colorScheme === 'light' ? override.colorScheme : scheme;
    resolved = mergeOnto(pinned, override);
  }
  perInput[scheme] = resolved;
  return resolved;
}

function mergeOnto(scheme: 'light' | 'dark', override: PlocksThemeOverride): PlocksTheme {
  const merged = mergeTheme(getBuiltInTheme(scheme), override);
  if (!override.colorScheme) merged.colorScheme = scheme;
  return normalizeTheme(merged);
}

/**
 * Creates a theme object with proper type checking
 */
export function createTheme(themeOverride: PlocksThemeOverride): PlocksThemeOverride {
  return themeOverride;
}
