import { useEffect, useMemo, useRef } from 'react';

import { useLatestCallback } from '../../core/hooks/useLatestCallback';

// `never[]` parameters accept any function type (parameters are contravariant)
// without resorting to `any`; `Parameters<F>` still recovers the real ones.
type AnyFunction = (...args: never[]) => unknown;

export interface UseDebouncedCallbackReturn<F extends AnyFunction> {
  /** Call to schedule the wrapped function. Identity is stable across renders. */
  (...args: Parameters<F>): void;
  /** Cancel any pending invocation. */
  cancel: () => void;
  /** Run the wrapped function immediately with the most recent args. */
  flush: () => void;
}

/**
 * Returns a stable debounced wrapper around `callback`.
 *
 * Differs from `useDebouncedValue`: this debounces the *call*, useful for
 * imperative side-effects driven by event handlers (search inputs, autosave,
 * scroll handlers). Use `useDebouncedValue` for declarative React patterns.
 *
 * The returned function exposes `.cancel()` and `.flush()`. The wrapper
 * identity is stable (until `wait` changes), so it's safe in dependency
 * arrays; it always calls the latest `callback`. A pending call is cancelled
 * on unmount.
 *
 * @example
 * const search = useDebouncedCallback((q: string) => fetchResults(q), 300);
 * <Input onChangeText={search} />;
 */
export function useDebouncedCallback<F extends AnyFunction>(
  callback: F,
  wait: number,
): UseDebouncedCallbackReturn<F> {
  // TS can't see that a generic F accepts Parameters<F>; this view is exact.
  const latest = useLatestCallback(callback as unknown as (...args: Parameters<F>) => unknown);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<F> | null>(null);

  // Cancel any pending invocation when the component unmounts.
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    },
    [],
  );

  return useMemo(() => {
    const debounced = ((...args: Parameters<F>) => {
      lastArgsRef.current = args;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        latest(...args);
      }, wait);
    }) as UseDebouncedCallbackReturn<F>;

    debounced.cancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    debounced.flush = () => {
      if (!timeoutRef.current) return;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      if (lastArgsRef.current) latest(...lastArgsRef.current);
    };

    return debounced;
  }, [wait, latest]);
}
