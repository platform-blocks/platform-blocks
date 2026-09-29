import { resolveColorProp, type ThemeColor } from '../../core/theme/resolveColors';
import type { PlatformBlocksTheme } from '../../core/theme/types';

/** The track reads against a light thumb, so it sits one step past the fill base. */
export const SWITCH_SHADES = [6, 5] as const;

/**
 * The "on" color of a switch: a palette token lands on shade 6 (then 5),
 * `'primary.6'` shade syntax and raw CSS colors pass through.
 */
export const getSwitchActiveColor = (theme: PlatformBlocksTheme, color: ThemeColor | undefined): string =>
  resolveColorProp(theme, color ?? 'primary', { shades: SWITCH_SHADES }) ?? theme.colors.primary[6];
