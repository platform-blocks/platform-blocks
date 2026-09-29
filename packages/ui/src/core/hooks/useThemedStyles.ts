import { useMemo, type DependencyList } from 'react';

import { useTheme } from '../theme/ThemeProvider';
import type { PlatformBlocksTheme } from '../theme/types';

/**
 * Builds a style table from the theme once per theme identity + `deps`, instead
 * of on every render.
 *
 * @example
 * const styles = useThemedStyles(
 *   (theme) => StyleSheet.create({ root: { backgroundColor: theme.backgrounds.surface, padding: gap } }),
 *   [gap]
 * );
 */
export function useThemedStyles<T>(
  factory: (theme: PlatformBlocksTheme) => T,
  deps: DependencyList = []
): T {
  const theme = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `factory` is usually an inline arrow; callers list everything it closes over in `deps`
  return useMemo(() => factory(theme), [theme, ...deps]);
}

type CacheKey = string | number | boolean | null | undefined;

/**
 * Module-level style factory with a per-theme cache, for style tables that
 * depend on the theme plus a few scalar arguments (size, variant, ...):
 *
 * @example
 * const getChipStyles = createThemedStyles((theme, size: SizeToken, variant: ChipVariant) =>
 *   StyleSheet.create({ root: { height: getControlSize(theme, size).height } })
 * );
 * // in render:
 * const styles = getChipStyles(theme, size, variant); // same object for the same (theme, size, variant)
 *
 * The cache is a `WeakMap` keyed by the theme object (so a discarded theme frees
 * its entries) holding a `Map` keyed by every other argument. Extra arguments
 * must be primitives: an object argument would be a new key on each call.
 */
export function createThemedStyles<Args extends CacheKey[], T>(
  factory: (theme: PlatformBlocksTheme, ...args: Args) => T
): (theme: PlatformBlocksTheme, ...args: Args) => T {
  const cache = new WeakMap<PlatformBlocksTheme, Map<string, T>>();

  return (theme: PlatformBlocksTheme, ...args: Args): T => {
    let byArgs = cache.get(theme);
    if (!byArgs) {
      byArgs = new Map();
      cache.set(theme, byArgs);
    }
    // Type-tagged so `undefined` / `null` / `'1'` / `1` / `true` never collide.
    const key = args.length ? JSON.stringify(args.map((arg) => (arg === undefined ? ['u'] : [typeof arg, arg]))) : '';
    let styles = byArgs.get(key);
    if (styles === undefined) {
      styles = factory(theme, ...args);
      byArgs.set(key, styles);
    }
    return styles;
  };
}
