/**
 * Token resolvers — the ONLY way components turn scale tokens into numbers.
 *
 * Every resolver takes the current theme first, so custom themes and the dark
 * scheme apply automatically. Theme scales are stored as px strings (`'8px'`);
 * they are parsed once per scale object (WeakMap cache) and numbers pass
 * through untouched. Partial themes (tests, hand-rolled doubles) fall back to
 * the default theme's numbers rather than throwing.
 */
import type { ViewStyle } from 'react-native';

import { contrastRatio, composite, normalizeHex } from './colorUtils';
import { literalBackgrounds, literalText } from './cssVariableTheme';
import {
  BREAKPOINT_KEYS,
  DEFAULT_BREAKPOINT_VALUES,
  DEFAULT_CONTROL_SIZES,
  DEFAULT_FONT_SIZE_SCALE,
  DEFAULT_ICON_SIZE_SCALE,
  DEFAULT_LINE_HEIGHT_SCALE,
  DEFAULT_RADIUS_SCALE,
  DEFAULT_SCRIM_COLORS,
  DEFAULT_SPACING_SCALE,
  SCALE_KEYS,
  type BreakpointKey,
  type ControlSizeMetrics,
  type ScaleKey,
} from './scales';
import { resolveShadow as resolveShadowStyle, type ShadowToken } from './shadow';
import type { PlocksTheme, SizeToken, SizeValue, SpacingValue } from './types';

export type { ControlSizeMetrics } from './scales';
export type { ShadowToken } from './shadow';

/** A radius prop: size token, px number, `'none'` or `'full'`. */
export type RadiusInput = SizeToken | 'none' | 'full' | number;

/** Resolved breakpoint table in px. */
export type BreakpointValues = Record<BreakpointKey, number>;

/** Anything with (some of) the theme's scales — resolvers accept partial themes. */
type ThemeLike = Partial<PlocksTheme> | null | undefined;

const FULL_RADIUS = 9999;

// ---------------------------------------------------------------------------
// px parsing
// ---------------------------------------------------------------------------

/**
 * `'8px'` → 8, `'0.5rem'` → 8, `'12'` → 12, `8` → 8. Anything unparseable → `undefined`.
 */
export function parsePx(value: string | number | null | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const match = /^\s*(-?(?:\d+\.?\d*|\.\d+))\s*(px|rem|em)?\s*$/i.exec(value);
  if (!match) return undefined;
  const n = parseFloat(match[1]);
  const unit = (match[2] ?? 'px').toLowerCase();
  return unit === 'px' ? n : n * 16;
}

const parsedScaleCache = new WeakMap<object, Record<string, number>>();

/** Parses a theme scale (`{ xs: '4px', … }`) once per object and fills gaps from `fallback`. */
function parsedScale<K extends string>(
  scale: Partial<Record<K, string | number>> | undefined,
  fallback: Record<K, number>
): Record<K, number> {
  if (!scale || typeof scale !== 'object') return fallback;
  const cached = parsedScaleCache.get(scale);
  if (cached) return cached as Record<K, number>;
  const out: Record<string, number> = { ...fallback };
  for (const key of Object.keys(scale)) {
    const parsed = parsePx(scale[key as K] as string | number | undefined);
    if (parsed !== undefined) out[key] = parsed;
  }
  parsedScaleCache.set(scale, out);
  return out as Record<K, number>;
}

function isScaleKey(value: unknown): value is ScaleKey {
  return typeof value === 'string' && (SCALE_KEYS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Scale resolvers
// ---------------------------------------------------------------------------

/**
 * Spacing token → px. `'auto'` stays `'auto'`; `0` / `'0'` → 0; numbers pass
 * through; unknown strings resolve to 0.
 */
export function resolveSpacing(theme: ThemeLike, value: SpacingValue): number | 'auto' {
  if (value === 'auto') return 'auto';
  if (typeof value === 'number') return value;
  if (value === '0' || value == null) return 0;
  const scale = parsedScale(theme?.spacing, DEFAULT_SPACING_SCALE as Record<ScaleKey, number>);
  if (isScaleKey(value) || value in scale) return scale[value as ScaleKey] ?? 0;
  return parsePx(value) ?? 0;
}

/** Radius → px. `'none'` → 0, `'full'` → 9999, tokens read `theme.radii`, `undefined` → md. */
export function resolveRadius(theme: ThemeLike, value: RadiusInput | undefined): number {
  if (typeof value === 'number') return value;
  if (value === 'none') return 0;
  if (value === 'full') return FULL_RADIUS;
  const scale = parsedScale(theme?.radii, DEFAULT_RADIUS_SCALE as Record<ScaleKey, number>);
  return scale[(value ?? 'md') as ScaleKey] ?? scale.md;
}

/** Font-size token → px (`theme.fontSizes`). Numbers pass through; `undefined` → md. */
export function resolveFontSize(theme: ThemeLike, size: SizeValue | undefined): number {
  if (typeof size === 'number') return size;
  const scale = parsedScale(theme?.fontSizes, DEFAULT_FONT_SIZE_SCALE as Record<ScaleKey, number>);
  return scale[(size ?? 'md') as ScaleKey] ?? scale.md;
}

function lineHeightMultiplier(size: SizeValue | undefined): number {
  if (typeof size === 'number') {
    if (size <= 12) return 1.4;
    if (size <= 16) return 1.3;
    if (size <= 24) return 1.2;
    if (size <= 48) return 1.1;
    if (size <= 72) return 1.0;
    return 0.9;
  }
  return DEFAULT_LINE_HEIGHT_SCALE[(size ?? 'md') as ScaleKey] ?? DEFAULT_LINE_HEIGHT_SCALE.md;
}

/**
 * Absolute line height in px for text at `size` — `resolveFontSize × multiplier`,
 * ready for RN's `lineHeight`. Numeric sizes are font sizes in px.
 */
export function resolveLineHeight(theme: ThemeLike, size: SizeValue | undefined): number {
  return resolveFontSize(theme, size) * lineHeightMultiplier(size);
}

/** General icon size (`xs 12 … 3xl 40`). Numbers pass through. Icons inside controls use `getControlSize(...).iconSize`. */
export function resolveIconSize(_theme: ThemeLike, size: SizeValue | undefined): number {
  if (typeof size === 'number') return size;
  return DEFAULT_ICON_SIZE_SCALE[(size ?? 'md') as ScaleKey] ?? DEFAULT_ICON_SIZE_SCALE.md;
}

// ---------------------------------------------------------------------------
// Control sizes
// ---------------------------------------------------------------------------

const controlCache = new WeakMap<object, Map<string, ControlSizeMetrics>>();

function controlTable(theme: ThemeLike): Record<ScaleKey, ControlSizeMetrics> {
  const table = theme?.controlSizes as Partial<Record<ScaleKey, Partial<ControlSizeMetrics>>> | undefined;
  if (!table) return DEFAULT_CONTROL_SIZES;
  return table as Record<ScaleKey, ControlSizeMetrics>;
}

/**
 * Metrics for a fixed-height control at `size`: `{ height, paddingX, fontSize,
 * iconSize, radius, gap }`, read from `theme.controlSizes`.
 *
 * A numeric `size` is taken as the control height; the other metrics scale
 * from the `md` entry's proportions. Compact controls (Chip, Badge, KeyCap,
 * Pagination items) pass `stepDown(size)`.
 */
export function getControlSize(theme: ThemeLike, size: SizeValue | undefined): ControlSizeMetrics {
  const table = controlTable(theme);
  const key = size === undefined ? 'md' : String(size);
  let perTable = controlCache.get(table);
  if (!perTable) {
    perTable = new Map();
    controlCache.set(table, perTable);
  }
  const cached = perTable.get(key);
  if (cached) return cached;

  let metrics: ControlSizeMetrics;
  if (typeof size === 'number') {
    const md = { ...DEFAULT_CONTROL_SIZES.md, ...table.md };
    const ratio = size / md.height;
    metrics = {
      height: size,
      paddingX: Math.round(md.paddingX * ratio),
      fontSize: Math.round(md.fontSize * ratio),
      iconSize: Math.round(md.iconSize * ratio),
      radius: Math.round(md.radius * ratio),
      gap: Math.round(md.gap * ratio),
    };
  } else {
    const token: ScaleKey = isScaleKey(size) ? size : 'md';
    // Per-field fallback so a theme that overrides only `height` keeps the rest.
    metrics = { ...DEFAULT_CONTROL_SIZES[token], ...table[token] };
  }
  const frozen = Object.freeze(metrics);
  perTable.set(key, frozen);
  return frozen;
}

/**
 * One step down the size ladder (`md` → `sm`, `xs` stays `xs`). Numbers pass
 * through unchanged. Compact components size themselves with
 * `getControlSize(theme, stepDown(size))`.
 */
export function stepDown(size: SizeValue | undefined): SizeValue {
  if (typeof size === 'number') return size;
  const index = SCALE_KEYS.indexOf((size ?? 'md') as ScaleKey);
  if (index < 0) return 'sm';
  return SCALE_KEYS[Math.max(0, index - 1)];
}

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

/**
 * The theme's shadow token as a cross-platform style — `{ boxShadow }` on web,
 * `shadowColor/Offset/Opacity/Radius` + `elevation` on native. Reads the
 * current theme's shadows (the dark theme has its own). `'none'` → `{}`.
 */
export function resolveShadow(theme: ThemeLike, token: ShadowToken | undefined): ViewStyle {
  return resolveShadowStyle(theme as Pick<PlocksTheme, 'shadows'>, token);
}

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

/** `theme.breakpoints` as numbers (`{ xs: 480, sm: 576, md: 768, lg: 992, xl: 1200 }` by default). */
export function getBreakpoints(theme: ThemeLike): BreakpointValues {
  return parsedScale(theme?.breakpoints, DEFAULT_BREAKPOINT_VALUES as BreakpointValues);
}

export { BREAKPOINT_KEYS };
export type { BreakpointKey };

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

/** `var(--x, #abc)` → `#abc`; anything else unchanged. */
function unwrapVar(color: string): string {
  const match = /^var\([^,]+,\s*(.+)\)$/.exec(color.trim());
  return match ? match[1].trim() : color;
}

/** Any CSS color we can measure → opaque `#rrggbb` (translucent colors are composited over `backdrop`). */
function toOpaqueHex(color: string, backdrop: string): string | null {
  const value = unwrapVar(color).trim();
  const hex = normalizeHex(value);
  if (hex) return hex;
  const match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(value);
  if (!match) return null;
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const solid = `#${toHex(+match[1])}${toHex(+match[2])}${toHex(+match[3])}`;
  if (match[4] === undefined) return solid;
  const alpha = match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4]);
  const base = normalizeHex(unwrapVar(backdrop)) ?? '#ffffff';
  return composite(solid, base, alpha);
}

/**
 * `color` (hex, `rgb[a]()` or a `var(--x, fallback)` reference) re-expressed
 * with alpha `opacity`; colors it can't parse come back unchanged.
 */
function withOpacity(color: string, opacity: number): string {
  const alpha = Math.max(0, Math.min(1, opacity));
  const value = unwrapVar(color).trim();
  const hex = normalizeHex(value);
  if (hex) {
    const n = parseInt(hex.slice(1, 7), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  const match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value);
  return match ? `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})` : color;
}

/**
 * The modal backdrop color (`theme.backgrounds.scrim`). With `opacity`, the
 * scrim's color at that alpha instead of its own — for components that expose
 * an opacity prop (Overlay, Lightbox) or animate the strength. Partial themes
 * fall back to the built-in scrim of their scheme.
 */
export function resolveScrim(theme: ThemeLike, opacity?: number): string {
  const fallback = DEFAULT_SCRIM_COLORS[theme?.colorScheme === 'dark' ? 'dark' : 'light'];
  const token = theme?.backgrounds?.scrim ?? fallback;
  if (opacity == null || Number.isNaN(opacity)) return token;
  const literal = theme?.backgrounds ? literalBackgrounds(theme as PlocksTheme)?.scrim : undefined;
  return withOpacity(literal ?? token, opacity);
}

/**
 * A readable text color for an arbitrary fill `bg` (hex, rgb[a] or a
 * `var(--x, fallback)` theme reference). Prefers the theme's `text.onPrimary`,
 * then `text.primary`, then pure white / near-black — the first that reaches
 * `minContrast` (WCAG AA body text, 4.5, by default), else the best available.
 * Translucent fills are measured composited over `backgrounds.surface`.
 */
export function onColor(theme: ThemeLike, bg: string, minContrast: number = 4.5): string {
  const text = theme?.text ? literalText(theme as PlocksTheme) : undefined;
  const backgrounds = theme?.backgrounds ? literalBackgrounds(theme as PlocksTheme) : undefined;
  const candidates = [text?.onPrimary, text?.primary, '#FFFFFF', '#111827'].filter(
    (c): c is string => typeof c === 'string' && normalizeHex(c) !== null
  );
  const fill = toOpaqueHex(bg, backgrounds?.surface ?? '#FFFFFF');
  if (!fill) return candidates[0] ?? '#FFFFFF';
  let best = candidates[0];
  let bestRatio = -1;
  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate, fill);
    if (ratio >= minContrast) return candidate;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return best;
}
