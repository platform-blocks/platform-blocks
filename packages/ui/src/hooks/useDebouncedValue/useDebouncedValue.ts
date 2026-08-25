import { useEffect, useRef, useState } from 'react';

export interface UseDebouncedValueOptions {
  /** Skip the initial debounce — first value is set immediately. Default: true. */
  leading?: boolean;
}

/**
 * Returns a tuple `[debouncedValue, cancel]`. `debouncedValue` updates only
 * after `value` stops changing for `wait` ms. `cancel()` clears any pending
 * timeout so the latest committed `debouncedValue` sticks.
 *
 * Useful for search inputs, filter triggers, autosave, etc.
 *
 * @example
 * const [query, setQuery] = useState('');
 * const [debouncedQuery] = useDebouncedValue(query, 300);
 *
 * useEffect(() => {
 *   if (debouncedQuery) fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 */
export function useDebouncedValue<T>(
  value: T,
  wait: number,
  options: UseDebouncedValueOptions = {},
): [T, () => void] {
  const { leading = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const mountedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownRef = useRef(false);

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (leading && !cooldownRef.current) {
      // Fire immediately on the first change after a quiet period, then start
      // the cooldown.
      setDebouncedValue(value);
      cooldownRef.current = true;
      timeoutRef.current = setTimeout(() => {
        cooldownRef.current = false;
      }, wait);
      return;
    }

    cancel();
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      cooldownRef.current = false;
    }, wait);

    return cancel;
  }, [value, wait, leading]);

  useEffect(() => () => cancel(), []);

  return [debouncedValue, cancel];
}
