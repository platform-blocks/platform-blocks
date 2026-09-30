import { useSyncExternalStore } from 'react';
import { I18nManager } from 'react-native';
import type { DimensionValue, ViewStyle } from 'react-native';
import { Easing } from 'react-native-reanimated';
import type { EasingFunction, EasingFunctionFactory } from 'react-native-reanimated';

import { isWeb } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeToken } from '../../core/theme/types';
import { useDirection } from '../../core/providers/DirectionProvider';
import {
  getServerViewportSnapshot,
  getViewportSnapshot,
  subscribeViewport,
  type ViewportSize,
} from '../../core/responsive/viewportStore';

export const FILL: ViewStyle = { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 };

/** A spacing token in px (`'auto'` → 0). */
export const spacingPx = (theme: PlocksTheme, token: SizeToken): number => {
  const value = resolveSpacing(theme, token);
  return typeof value === 'number' ? value : 0;
};

/** `value` as a number: numbers pass through, px-ish strings are parsed, percentages and junk fall back. */
export const coerceNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) return fallback;
    const parsed = parseFloat(trimmed.replace(/[^0-9.-]/g, ''));
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

/**
 * Web: animate a section's horizontal insets. react-native-web writes logical
 * `start`/`end` as `left`/`right` for the current direction, so both physical
 * sides are listed (direction-neutral). Nothing on native, or for `0` ms.
 */
export const insetTransition = (durationMs: number, timingFunction: string): ViewStyle | null =>
  durationMs > 0
    ? webStyle({ transition: `left ${durationMs}ms ${timingFunction}, right ${durationMs}ms ${timingFunction}` })
    : null;

/** A geometry value (px number or a `var()` / `calc()` string) typed for a style. */
export const asDimension = (value: number | string): DimensionValue => value as DimensionValue;

const FULL_WIDTH_KEYWORDS = new Set(['screen', 'full', '100%', '100vw']);

/** Whether a width string is relative to the viewport (`'100%'`, `'80vw'`, `'full'`). */
export const isViewportRelativeWidth = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return FULL_WIDTH_KEYWORDS.has(normalized) || /^[0-9.]+(%|vw)$/.test(normalized);
};

/**
 * Drawer width in px: numbers pass through, viewport-relative strings resolve
 * against `viewportWidth`, px strings are parsed; 0 / unparseable → `fallback`.
 */
export const resolveDrawerWidth = (
  raw: number | string | undefined,
  viewportWidth: number,
  fallback: number
): number => {
  if (typeof raw === 'number') return raw || fallback;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (FULL_WIDTH_KEYWORDS.has(normalized)) return viewportWidth || fallback;
    const relative = /^([0-9]+(?:\.[0-9]+)?)(%|vw)$/.exec(normalized);
    if (relative) {
      const fraction = parseFloat(relative[1]) / 100;
      return viewportWidth > 0 ? fraction * viewportWidth : fallback;
    }
  }
  return coerceNumber(raw, fallback) || fallback;
};

/**
 * A slice of the shared viewport store. Re-renders only when the selected
 * value changes (select primitives). Hydration-safe: the server snapshot is
 * the store's desktop default.
 */
export function useViewportSelector<T>(select: (size: ViewportSize) => T): T {
  return useSyncExternalStore(
    subscribeViewport,
    () => select(getViewportSnapshot()),
    () => select(getServerViewportSnapshot())
  );
}

export const selectViewportWidth = (size: ViewportSize): number => size.width;
export const selectViewportHeight = (size: ViewportSize): number => size.height;
export const selectNothing = (): number => 0;
export const selectIsLandscape = (size: ViewportSize): boolean => size.width > size.height;

/**
 * Whether the layout engine lays this subtree out right-to-left — the
 * direction logical `start`/`end` styles resolve against. On web that is the
 * `dir` AppShell passes down from `useDirection()`; on native it is
 * `I18nManager` (a direction change there applies after a reload).
 * Only transforms need it: styles use logical properties.
 */
export function useLayoutIsRTL(): boolean {
  const { isRTL } = useDirection();
  return isWeb ? isRTL : I18nManager.isRTL;
}

const CSS_EASINGS: Record<string, [number, number, number, number]> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};

/**
 * A CSS `transition-timing-function` as a Reanimated easing. `undefined` for
 * an unset or unrecognised value (callers keep their own default).
 */
export function parseTimingFunction(value: string | undefined): EasingFunction | EasingFunctionFactory | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'linear') return Easing.linear;
  const named = CSS_EASINGS[normalized];
  if (named) return Easing.bezier(named[0], named[1], named[2], named[3]);
  const match = /^cubic-bezier\(\s*([-0-9.]+)\s*,\s*([-0-9.]+)\s*,\s*([-0-9.]+)\s*,\s*([-0-9.]+)\s*\)$/.exec(normalized);
  if (!match) return undefined;
  const [x1, y1, x2, y2] = match.slice(1).map(Number);
  if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return undefined;
  return Easing.bezier(x1, y1, x2, y2);
}
