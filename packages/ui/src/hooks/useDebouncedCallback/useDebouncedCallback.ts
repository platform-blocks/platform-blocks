import { useCallback, useEffect, useRef } from 'react';

export interface UseDebouncedCallbackReturn<F extends (...args: any[]) => any> {
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
 * identity is stable so it's safe to put in dependency arrays.
 *
 * @example
 * const search = useDebouncedCallback((q: string) => fetchResults(q), 300);
 * <Input onChangeText={search} />;
 */
export function useDebouncedCallback<F extends (...args: any[]) => any>(
  callback: F,
  wait: number,
): UseDebouncedCallbackReturn<F> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<F> | null>(null);

  // Keep the latest callback without forcing the wrapper to be recreated.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cancel any pending invocation when the component unmounts.
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const debounced = useCallback((...args: Parameters<F>) => {
    lastArgsRef.current = args;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      callbackRef.current(...args);
    }, wait);
  }, [wait]) as UseDebouncedCallbackReturn<F>;

  debounced.cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  debounced.flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      if (lastArgsRef.current) callbackRef.current(...lastArgsRef.current);
    }
  }, []);

  return debounced;
}
