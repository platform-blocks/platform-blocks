import { resolveResponsiveValue as resolveCoreResponsiveValue } from '../../../core/responsive';
import type { Breakpoint, ResponsiveSize } from '../types';

/**
 * The entry of `value` in effect at `breakpoint` — the nearest one defined at
 * or below it — without parsing strings. `undefined` when none applies.
 */
export const resolveResponsiveRaw = (
  value: ResponsiveSize,
  breakpoint: Breakpoint
): number | string | undefined => resolveCoreResponsiveValue<number | string | undefined>(value, breakpoint);

const toPx = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseInt(value, 10) || 0;
  return 0;
};

/**
 * Resolves a `ResponsiveSize` to px at `breakpoint`, walking down the scale
 * (`xl` → `lg` → … → `base`) to the nearest defined entry. Strings are parsed
 * as px (`'240'`, `'240px'` → 240); anything unparseable is 0.
 */
export const resolveResponsiveValue = (value: ResponsiveSize, breakpoint: Breakpoint): number =>
  toPx(resolveResponsiveRaw(value, breakpoint));
