import type { PlatformBlocksTheme } from './types';

/**
 * The single place a color prop turns into a concrete color.
 *
 * Every component takes exactly one color prop — `color` (with `c` as its
 * shorthand alias on text-bearing components) — and every one of them resolves
 * through {@link resolveColorProp}. What differs between components is not the
 * *mechanics* but the *vocabulary*: which named token maps a bare word may
 * refer to, and which palette shade a bare palette name lands on. Those two
 * choices are the `scopes` and `shades` options, and the presets below pin them
 * per context so a value means the same thing everywhere it's accepted.
 *
 * Accepted forms, in resolution order:
 *
 *   • `'primary.6'` — explicit palette + shade; beats every named token
 *   • a named token from one of the `scopes` (`theme.text.*`, `theme.backgrounds.*`)
 *   • a bare palette name (`'success'`) → the first shade in `shades` that exists
 *   • anything else — a raw CSS color, returned unchanged
 */

/**
 * Palette names every built-in theme defines. A consumer theme may add more —
 * `color` accepts any string — but these are the ones worth completing to.
 */
export type ThemeColorToken =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'gray';

/**
 * What every `color` prop accepts: a palette token, `'primary.6'` shade syntax,
 * or a raw CSS color.
 *
 * The `string & {}` arm keeps editor completion for the tokens above while still
 * admitting any string — a bare `string` would collapse the union and offer no
 * suggestions at all.
 */
export type ThemeColor = ThemeColorToken | (string & {});

/** Named token maps a bare value may resolve against. */
export type ColorScope = 'text' | 'backgrounds';

export interface ResolveColorOptions {
  /** Named token maps consulted, in order, before the palette lookup. */
  scopes?: readonly ColorScope[];
  /**
   * Palette indices tried, in order, for a bare palette name — and as the
   * fallback when an explicit `name.shade` index is absent from the palette.
   */
  shades?: readonly number[];
}

/**
 * Anchored on purpose: a loose `value.includes('.')` test also captures
 * `rgba(0, 0, 0, 0.5)` and splits it into nonsense.
 */
const SHADE_SYNTAX = /^([a-zA-Z0-9_-]+)\.([0-9]{1,2})$/;

/**
 * Text sits *on* a surface, so it wants one step further from it than the
 * palette's base. Palettes invert between schemes (light: [0] lightest →
 * [9] darkest; dark: the reverse), which makes [6] the higher-contrast
 * neighbour of the [5] base in both — where a fixed "darker" index would only
 * work in one.
 */
const TEXT_SHADES = [6, 5] as const;

/** Backgrounds want the subtle tint, not the vivid base. */
const BACKGROUND_SHADES = [1, 0] as const;

/** Fills, indicators, thumbs, rings: the vivid base the palette is anchored on. */
const ACCENT_SHADES = [5, 0] as const;

/** Hairlines read as chrome, so they sit well below the accent. */
const LINE_SHADES = [3, 5, 0] as const;

export function resolveColorProp(
  theme: PlatformBlocksTheme,
  value?: string,
  { scopes = [], shades = ACCENT_SHADES }: ResolveColorOptions = {},
): string | undefined {
  if (!value) return undefined;

  const fromPalette = (name: string, preferred?: number): string | undefined => {
    const palette = (theme.colors as any)?.[name];
    if (typeof palette === 'string') return palette;
    if (!Array.isArray(palette)) return undefined;
    const order = preferred === undefined ? shades : [preferred, ...shades];
    for (const shade of order) {
      if (palette[shade] != null) return palette[shade];
    }
    return palette[0];
  };

  const shadeMatch = SHADE_SYNTAX.exec(value);
  if (shadeMatch) {
    const resolved = fromPalette(shadeMatch[1], Number(shadeMatch[2]));
    if (resolved) return resolved;
  }

  for (const scope of scopes) {
    const token = (theme as any)?.[scope]?.[value];
    if (typeof token === 'string') return token;
  }

  return fromPalette(value) ?? value;
}

/**
 * Resolve a text `color` (or its `c` shorthand):
 *
 *   • `'dimmed'` → `theme.text.muted`
 *   • `'primary' | 'secondary' | 'muted' | 'disabled' | 'link'` → `theme.text.<key>`
 *   • `'info'` → the primary palette (the brand accent, not body copy)
 *   • `'primary.6'` → palette[6]
 *   • bare palette name → palette[6], the readable neighbour of the base
 *   • any other CSS color passes through
 */
export function resolveTextColor(theme: PlatformBlocksTheme, value?: string): string | undefined {
  if (!value) return undefined;
  // Long-standing alias for the muted text token.
  const normalized = value === 'dimmed' ? 'muted' : value;
  return resolveColorProp(theme, normalized, { scopes: ['text'], shades: TEXT_SHADES });
}

/**
 * Resolve a `bg` (background) prop:
 *
 *   • `'surface' | 'subtle' | 'elevated' | 'base' | 'border'` → `theme.backgrounds.<key>`
 *   • `'primary.5'` → palette[5]
 *   • bare palette name → palette[1], the subtle tint
 *   • any other CSS color passes through
 *
 * Used by Card, Block, Surface, and any other Box-rendering component that
 * accepts the `bg` shorthand.
 */
export function resolveBg(theme: PlatformBlocksTheme, value?: string): string | undefined {
  return resolveColorProp(theme, value, { scopes: ['backgrounds'], shades: BACKGROUND_SHADES });
}

/**
 * Resolve an accent `color` — the tint driving a fill, indicator, thumb, or
 * ring. Bare palette names land on the vivid base ([5]); there is no named-token
 * scope, so `'primary'` here means the brand palette rather than body text.
 */
export function resolveAccentColor(theme: PlatformBlocksTheme, value?: string): string | undefined {
  return resolveColorProp(theme, value, { shades: ACCENT_SHADES });
}

/**
 * Resolve a hairline `color` — dividers and rules.
 *
 *   • `'border' | 'subtle'` → `theme.backgrounds.<key>`
 *   • `'muted'` → `theme.text.muted`
 *   • bare palette name → palette[3], well below the accent so a tinted rule
 *     still reads as chrome
 */
export function resolveLineColor(theme: PlatformBlocksTheme, value?: string): string | undefined {
  if (!value) return undefined;
  // The only text token in this vocabulary. Looked up explicitly rather than by
  // adding `'text'` to `scopes`, which would also divert `'primary'` and
  // `'secondary'` away from their palettes and turn a tinted rule into body-text gray.
  if (value === 'muted') return theme.text?.muted ?? theme.backgrounds?.border;
  return resolveColorProp(theme, value, { scopes: ['backgrounds'], shades: LINE_SHADES });
}
