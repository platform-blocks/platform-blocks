import { useCallback, useSyncExternalStore } from 'react';

import { hasDOM, isWeb } from '../../core/platform/flags';
import {
  getViewportSnapshot,
  subscribeViewport,
  type ViewportSize,
} from '../../core/responsive/viewportStore';

/**
 * Subscribes to a CSS media query (web) or the viewport (native) and returns
 * whether the query currently matches.
 *
 * On web: uses `window.matchMedia(query)`.
 * On native: parses `(min-width: Npx)` / `(max-width: Npx)` /
 * `(min-height: Npx)` / `(max-height: Npx)` against the shared viewport store
 * (`core/responsive`). Other CSS features return `initialValue`, since RN
 * can't evaluate them.
 *
 * Hydration-safe: static rendering and the hydration pass both see
 * `initialValue`; the client re-renders with the real value right after.
 *
 * @example
 * const isCompact = useMediaQuery('(max-width: 640px)');
 * return isCompact ? <Drawer /> : <Sidebar />;
 */
export function useMediaQuery(
  query: string,
  initialValue: boolean = false,
): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => (isWeb ? subscribeMediaQuery(query, onChange) : subscribeViewport(onChange)),
    [query],
  );
  const getSnapshot = useCallback(
    () => (isWeb ? evaluateWeb(query, initialValue) : evaluateNative(query, initialValue, getViewportSnapshot())),
    [query, initialValue],
  );
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function hasMatchMedia(): boolean {
  return hasDOM && typeof window.matchMedia === 'function';
}

function subscribeMediaQuery(query: string, onChange: () => void): () => void {
  if (!hasMatchMedia()) return () => {};
  const mql = window.matchMedia(query);
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }
  // Some older browsers only expose addListener / removeListener.
  const legacy = mql as unknown as {
    addListener?: (cb: () => void) => void;
    removeListener?: (cb: () => void) => void;
  };
  legacy.addListener?.(onChange);
  return () => legacy.removeListener?.(onChange);
}

function evaluateWeb(query: string, fallback: boolean): boolean {
  if (!hasMatchMedia()) return fallback;
  try {
    return window.matchMedia(query).matches;
  } catch {
    // Malformed query in an old browser.
    return fallback;
  }
}

/**
 * Native: supports the common width/height queries via simple parsing.
 * Unparseable queries (e.g. `(prefers-color-scheme: dark)`) return `fallback`.
 */
function evaluateNative(query: string, fallback: boolean, viewport: ViewportSize): boolean {
  const minMatch = query.match(/\(\s*min-width\s*:\s*(\d+)\s*px\s*\)/);
  const maxMatch = query.match(/\(\s*max-width\s*:\s*(\d+)\s*px\s*\)/);
  const minHeightMatch = query.match(/\(\s*min-height\s*:\s*(\d+)\s*px\s*\)/);
  const maxHeightMatch = query.match(/\(\s*max-height\s*:\s*(\d+)\s*px\s*\)/);

  if (!minMatch && !maxMatch && !minHeightMatch && !maxHeightMatch) {
    return fallback;
  }

  if (minMatch && viewport.width < parseInt(minMatch[1], 10)) return false;
  if (maxMatch && viewport.width > parseInt(maxMatch[1], 10)) return false;
  if (minHeightMatch && viewport.height < parseInt(minHeightMatch[1], 10)) return false;
  if (maxHeightMatch && viewport.height > parseInt(maxHeightMatch[1], 10)) return false;

  return true;
}
