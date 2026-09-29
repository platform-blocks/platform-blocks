// Shadow system for Platform Blocks.
//
// Theme shadows are authored once, as CSS `box-shadow` strings. The web renders
// them verbatim; native has no box-shadow, so the string is parsed and the most
// prominent layer is mapped onto the iOS `shadow*` props and Android
// `elevation`. The parser has to accept what the tokens actually contain — a
// bare `0` offset, decimals, negatives, several comma-separated layers — which
// the previous regex (a `px` suffix on every length) did not, so every native
// shadow silently collapsed to one hard-coded fallback.
import { Platform, type ViewStyle } from 'react-native';

import { SizeValue } from './sizes';
import type { PlatformBlocksTheme, SurfaceShadowToken } from './types';

export type ShadowValue =
  | SizeValue
  | 'none';

/** A named theme shadow, or the explicit opt-out. */
export type ShadowToken = SurfaceShadowToken;

/**
 * Shadow props interface for components
 */
export interface ShadowProps {
  /** Shadow value - supports size tokens and 'none' */
  shadow?: ShadowValue;
}

/** One parsed `box-shadow` layer. Lengths are in px. */
export interface ShadowLayer {
  inset: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  /** Opaque color (`#rrggbb`, `rgb(...)` or a CSS keyword). */
  color: string;
  /** Alpha of the layer color, 0–1. */
  opacity: number;
}

/** The native (iOS + Android) shadow style for one layer. */
export interface NativeShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/** Splits on commas that are not inside parentheses (`rgba(0, 0, 0, .1)`). */
function splitTopLevel(value: string, separator: ',' | ' '): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);
    const isSeparator = separator === ' ' ? /\s/.test(char) : char === separator;
    if (isSeparator && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const LENGTH = /^(-?(?:\d+\.?\d*|\.\d+))(px|rem|em)?$/i;

function parseLength(token: string): number | null {
  const match = LENGTH.exec(token);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = (match[2] ?? 'px').toLowerCase();
  return unit === 'px' ? value : value * 16;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0, Math.min(1, value));
}

/** Parses a CSS color into an opaque color plus its alpha. */
export function parseShadowColor(input: string): { color: string; opacity: number } {
  const value = input.trim();
  const lower = value.toLowerCase();

  if (lower === 'transparent') return { color: '#000000', opacity: 0 };

  if (lower.startsWith('#')) {
    let hex = lower.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length === 8) {
      return { color: `#${hex.slice(0, 6)}`, opacity: clamp01(parseInt(hex.slice(6, 8), 16) / 255) };
    }
    return { color: `#${hex.slice(0, 6)}`, opacity: 1 };
  }

  const fn = /^(rgba?|hsla?)\((.*)\)$/i.exec(value);
  if (fn) {
    const kind = fn[1].toLowerCase().startsWith('rgb') ? 'rgb' : 'hsl';
    // Accept both `r, g, b, a` and `r g b / a`.
    const [channelPart, slashAlpha] = fn[2].split('/');
    const channels = channelPart.split(/[\s,]+/).filter(Boolean);
    const alphaToken = slashAlpha?.trim() ?? channels[3];
    let opacity = 1;
    if (alphaToken !== undefined) {
      opacity = alphaToken.endsWith('%')
        ? clamp01(parseFloat(alphaToken) / 100)
        : clamp01(parseFloat(alphaToken));
    }
    const [a, b, c] = channels;
    return { color: `${kind}(${a}, ${b}, ${c})`, opacity };
  }

  return { color: value, opacity: 1 };
}

/**
 * Parses a CSS `box-shadow` value into its layers. Unparseable layers are
 * dropped; `none` / empty input yields `[]`.
 */
export function parseBoxShadow(value: string | undefined | null): ShadowLayer[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'none') return [];

  const layers: ShadowLayer[] = [];
  for (const layerText of splitTopLevel(trimmed, ',')) {
    const tokens = splitTopLevel(layerText, ' ');
    const lengths: number[] = [];
    let inset = false;
    let colorToken: string | undefined;
    for (const token of tokens) {
      if (token.toLowerCase() === 'inset') {
        inset = true;
        continue;
      }
      const length = parseLength(token);
      if (length !== null && lengths.length < 4) {
        lengths.push(length);
        continue;
      }
      colorToken = token;
    }
    if (lengths.length < 2) continue;
    const { color, opacity } = parseShadowColor(colorToken ?? 'rgba(0, 0, 0, 1)');
    layers.push({
      inset,
      offsetX: lengths[0],
      offsetY: lengths[1],
      blur: Math.max(0, lengths[2] ?? 0),
      spread: lengths[3] ?? 0,
      color,
      opacity,
    });
  }
  return layers;
}

/**
 * The layer native renders. Native draws a single shadow, so it takes the most
 * prominent outer layer: largest blur, then largest vertical offset, then the
 * most opaque. Inset layers are ignored (native cannot draw them).
 */
export function pickProminentLayer(layers: ShadowLayer[]): ShadowLayer | undefined {
  let best: ShadowLayer | undefined;
  for (const layer of layers) {
    if (layer.inset || layer.opacity <= 0) continue;
    if (
      !best ||
      layer.blur > best.blur ||
      (layer.blur === best.blur && Math.abs(layer.offsetY) > Math.abs(best.offsetY)) ||
      (layer.blur === best.blur && Math.abs(layer.offsetY) === Math.abs(best.offsetY) && layer.opacity > best.opacity)
    ) {
      best = layer;
    }
  }
  return best;
}

/**
 * Maps one CSS layer to native shadow props.
 *
 * iOS: CSS blur radius is roughly twice a Core Animation `shadowRadius`, so the
 * radius is halved; the alpha becomes `shadowOpacity` over an opaque color.
 * Android: `elevation` grows with how far the layer lifts (y-offset) and how
 * wide it spreads (blur) — `y/2 + blur/3`, which lands the theme's xs…xl on
 * roughly 2 / 2 / 4 / 12 / 16dp.
 */
export function layerToNativeShadow(layer: ShadowLayer): NativeShadowStyle {
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    shadowColor: layer.color,
    shadowOffset: { width: round(layer.offsetX), height: round(layer.offsetY) },
    shadowOpacity: round(layer.opacity),
    shadowRadius: round(layer.blur / 2),
    elevation: Math.max(1, Math.round(Math.max(0, layer.offsetY) / 2 + layer.blur / 3)),
  };
}

/**
 * Cross-platform style for a CSS `box-shadow` string: `{ boxShadow }` on web,
 * native shadow props elsewhere, `{}` when there is nothing to draw.
 */
export function boxShadowToStyle(value: string | undefined | null): ViewStyle {
  if (!value || value.trim().toLowerCase() === 'none') return {};
  if (Platform.OS === 'web') return { boxShadow: value };
  const layer = pickProminentLayer(parseBoxShadow(value));
  return layer ? layerToNativeShadow(layer) : {};
}

const EMPTY_STYLE: ViewStyle = Object.freeze({}) as ViewStyle;
const resolvedShadowCache = new WeakMap<object, Map<string, ViewStyle>>();

/**
 * The theme's shadow `token` as a cross-platform style (web: `boxShadow`;
 * native: `shadowColor/Offset/Opacity/Radius` + `elevation`).
 *
 * Reads the CURRENT theme's `shadows`, so the dark theme's denser shadows apply
 * in dark mode. `'none'` (or an unknown token) returns an empty style. Results
 * are cached per `theme.shadows` object, so the returned object is stable and
 * safe to use in memo deps.
 */
export function resolveShadow(
  theme: Pick<PlatformBlocksTheme, 'shadows'> | null | undefined,
  token: ShadowToken | undefined
): ViewStyle {
  if (!token || token === 'none') return EMPTY_STYLE;
  const shadows = theme?.shadows;
  if (!shadows) return EMPTY_STYLE;
  let perTheme = resolvedShadowCache.get(shadows);
  if (!perTheme) {
    perTheme = new Map();
    resolvedShadowCache.set(shadows, perTheme);
  }
  const cached = perTheme.get(token);
  if (cached) return cached;
  const style = Object.freeze(boxShadowToStyle(shadows[token as keyof typeof shadows])) as ViewStyle;
  perTheme.set(token, style);
  return style;
}

/**
 * Get shadow value from shadow token
 * @param value - Shadow value (string token or 'none')
 * @param theme - PlatformBlocks theme object
 * @returns Resolved shadow string or undefined for none
 */
export function getShadowValue(
  value: ShadowValue | undefined,
  theme: PlatformBlocksTheme
): string | undefined {
  // No shadow
  if (value === 'none' || value === undefined) {
    return undefined;
  }

  // Handle size tokens. Guard the lookup — partial themes (and test doubles)
  // legitimately omit `shadows`, and `in` throws on undefined.
  if (theme?.shadows && typeof value === 'string' && value in theme.shadows) {
    return theme.shadows[value as keyof typeof theme.shadows];
  }

  // Fallback to undefined (no shadow)
  return undefined;
}

/**
 * Component-specific default shadows
 */
export const COMPONENT_SHADOW_DEFAULTS = {
  button: 'sm' as ShadowValue,
  badge: 'sm' as ShadowValue,
  // Single knob for a resting Card. `xs` is one soft layer; `sm` and above add
  // a second pass that reads as lifted — `Card variant="elevated"` opts into that.
  card: 'xs' as ShadowValue,
  chip: 'sm' as ShadowValue,
  modal: 'xl' as ShadowValue,
  tooltip: 'md' as ShadowValue,
  alert: 'sm' as ShadowValue,
  dialog: 'lg' as ShadowValue,
  dropdown: 'md' as ShadowValue,
  popover: 'md' as ShadowValue,
  toast: 'lg' as ShadowValue,
  fab: 'lg' as ShadowValue, // Floating Action Button
  appBar: 'sm' as ShadowValue,
  drawer: 'lg' as ShadowValue,
} as const;

/**
 * Get the default shadow for a specific component type
 */
export function getComponentDefaultShadow(
  componentType: keyof typeof COMPONENT_SHADOW_DEFAULTS
): ShadowValue {
  return COMPONENT_SHADOW_DEFAULTS[componentType];
}

/**
 * Create shadow styles object for React Native / web.
 *
 * Kept for existing callers; new code uses `resolveShadow(theme, token)`.
 */
export function createShadowStyles(
  shadow: ShadowValue | undefined,
  theme: PlatformBlocksTheme,
  componentType?: keyof typeof COMPONENT_SHADOW_DEFAULTS
): ViewStyle {
  // Use component default if no shadow specified
  const effectiveShadow = shadow ?? (componentType ? getComponentDefaultShadow(componentType) : undefined);
  if (effectiveShadow === undefined || effectiveShadow === 'none' || typeof effectiveShadow === 'number') {
    return {};
  }
  // A fresh object, as before — callers are free to spread or extend it.
  return { ...resolveShadow(theme, effectiveShadow as ShadowToken) };
}

/**
 * Utility to get shadow styles with theme context
 */
export function useShadowStyles(
  shadow: ShadowValue | undefined,
  theme: PlatformBlocksTheme,
  componentType?: keyof typeof COMPONENT_SHADOW_DEFAULTS
) {
  return createShadowStyles(shadow, theme, componentType);
}

export default {
  getShadowValue,
  createShadowStyles,
  useShadowStyles,
  resolveShadow,
  COMPONENT_SHADOW_DEFAULTS,
  getComponentDefaultShadow,
};
