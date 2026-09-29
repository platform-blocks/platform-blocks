import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { hasDOM, isNative } from '../platform';

// useLayoutEffect warns during React 18 server rendering; there's nothing to
// sync on the server anyway.
const useIsomorphicLayoutEffect = hasDOM || isNative ? useLayoutEffect : useEffect;

/**
 * Returns a function with a stable identity that always calls the latest `fn`.
 *
 * Use it for callback props that effects or subscriptions invoke, so an inline
 * `onComplete={() => …}` doesn't re-run the effect on every parent render.
 * Don't call the returned function during render.
 */
export function useLatestCallback<Args extends unknown[], R>(
  fn: ((...args: Args) => R) | undefined
): (...args: Args) => R | undefined {
  const ref = useRef(fn);

  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args: Args) => ref.current?.(...args), []);
}
