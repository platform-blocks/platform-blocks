import { DEFAULT_BREAKPOINT_VALUES } from './scales';
import { getBreakpoints } from './tokens';
import type { PlocksTheme } from './types';

export interface Breakpoints {
  /** Base breakpoint (0px) */
  base: number;
  /** Small phones / narrow screens */
  sm: number;
  /** Tablets / small desktop */
  md: number;
  /** Large desktop */
  lg: number;
  /** Wide screens */
  xl: number;
}

/**
 * The default theme's breakpoints (`theme.breakpoints` — the only table) in the
 * shape `resolveResponsiveProp` walks: sm 576, md 768, lg 992, xl 1200.
 * (Before the table was unified these were sm 480 / md 640 / lg 960.)
 */
export const DEFAULT_BREAKPOINTS: Breakpoints = {
  base: 0,
  sm: DEFAULT_BREAKPOINT_VALUES.sm,
  md: DEFAULT_BREAKPOINT_VALUES.md,
  lg: DEFAULT_BREAKPOINT_VALUES.lg,
  xl: DEFAULT_BREAKPOINT_VALUES.xl,
};

const themeBreakpointsCache = new WeakMap<object, Breakpoints>();

/** A theme's breakpoint table in the `Breakpoints` shape (cached per theme table). */
export function breakpointsFromTheme(theme: Partial<PlocksTheme> | null | undefined): Breakpoints {
  const table = theme?.breakpoints;
  if (!table) return DEFAULT_BREAKPOINTS;
  const cached = themeBreakpointsCache.get(table);
  if (cached) return cached;
  const values = getBreakpoints(theme);
  const result: Breakpoints = { base: 0, sm: values.sm, md: values.md, lg: values.lg, xl: values.xl };
  themeBreakpointsCache.set(table, result);
  return result;
}

export type ResponsiveProp<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

/**
 * Resolves a responsive prop value based on the current width and breakpoints
 * @param value - The responsive prop value to resolve
 * @param width - The current width to check against breakpoints
 * @param breakpoints - The breakpoints configuration to use
 * @returns The resolved value for the current width
 */
export function resolveResponsiveProp<T>(value: ResponsiveProp<T> | undefined, width: number, breakpoints: Breakpoints = DEFAULT_BREAKPOINTS): T | undefined {
  if (value === undefined) return undefined;
  if (value && typeof value !== 'object') return value as T;
  const map = value as Record<string, T | undefined>;
  /** Determine active breakpoint (largest whose min <= width) */
  const order: (keyof Breakpoints)[] = ['base', 'sm', 'md', 'lg', 'xl'];
  let active: T | undefined;
  for (const key of order) {
    const min = breakpoints[key];
    if (width >= min && map[key] !== undefined) {
      active = map[key];
    }
  }
  /** Fallback: if nothing matched, try explicit base */
  if (active === undefined) active = map.base;
  return active;
}

/**
 * Returns the first defined value from the provided arguments
 * @param vals - Values to check for defined state
 * @returns The first defined value or undefined if none are defined
 */
export function pickFirstDefined<T>(...vals: (T | undefined)[]): T | undefined {
  for (const v of vals) if (v !== undefined) return v;
  return undefined;
}