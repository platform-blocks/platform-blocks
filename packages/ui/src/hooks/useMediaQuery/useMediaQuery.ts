import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

/**
 * Subscribes to a CSS media query (web) or Dimensions changes (native) and
 * returns whether the query currently matches.
 *
 * On web: uses `window.matchMedia(query)`.
 * On native: parses `(min-width: Npx)` / `(max-width: Npx)` and watches
 * `Dimensions.addEventListener('change')`. Other CSS features are returned as
 * the `initialValue` since RN can't evaluate them.
 *
 * @example
 * const isCompact = useMediaQuery('(max-width: 640px)');
 * return isCompact ? <Drawer /> : <Sidebar />;
 */
export function useMediaQuery(
  query: string,
  initialValue: boolean = false,
): boolean {
  const [matches, setMatches] = useState<boolean>(() => evaluate(query, initialValue));

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const mql = window.matchMedia(query);
      const handler = (event: MediaQueryListEvent | MediaQueryList) => {
        setMatches(event.matches);
      };
      handler(mql);
      // Some older browsers only expose addListener / removeListener.
      if (mql.addEventListener) {
        mql.addEventListener('change', handler as (event: MediaQueryListEvent) => void);
        return () => mql.removeEventListener('change', handler as (event: MediaQueryListEvent) => void);
      }
      const legacy = mql as unknown as {
        addListener: (cb: (e: MediaQueryListEvent) => void) => void;
        removeListener: (cb: (e: MediaQueryListEvent) => void) => void;
      };
      const legacyHandler = handler as (e: MediaQueryListEvent) => void;
      legacy.addListener(legacyHandler);
      return () => legacy.removeListener(legacyHandler);
    }

    // Native: watch Dimensions, re-evaluate the parsed query.
    const update = () => setMatches(evaluate(query, initialValue));
    update();
    const subscription = Dimensions.addEventListener('change', update);
    return () => subscription?.remove?.();
  }, [query, initialValue]);

  return matches;
}

/**
 * Evaluates `query` synchronously where possible. Used both as the initial
 * useState lazy value and on every Dimensions `change` event on native.
 */
function evaluate(query: string, fallback: boolean): boolean {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.matchMedia) return fallback;
    return window.matchMedia(query).matches;
  }

  // Native: support the most common width-based queries via simple parsing.
  const win = Dimensions.get('window');
  const minMatch = query.match(/\(\s*min-width\s*:\s*(\d+)\s*px\s*\)/);
  const maxMatch = query.match(/\(\s*max-width\s*:\s*(\d+)\s*px\s*\)/);
  const minHeightMatch = query.match(/\(\s*min-height\s*:\s*(\d+)\s*px\s*\)/);
  const maxHeightMatch = query.match(/\(\s*max-height\s*:\s*(\d+)\s*px\s*\)/);

  if (!minMatch && !maxMatch && !minHeightMatch && !maxHeightMatch) {
    // Unparseable query (e.g. `(prefers-color-scheme: dark)`) — return fallback.
    return fallback;
  }

  if (minMatch && win.width < parseInt(minMatch[1], 10)) return false;
  if (maxMatch && win.width > parseInt(maxMatch[1], 10)) return false;
  if (minHeightMatch && win.height < parseInt(minHeightMatch[1], 10)) return false;
  if (maxHeightMatch && win.height > parseInt(maxHeightMatch[1], 10)) return false;

  return true;
}
