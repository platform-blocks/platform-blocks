import { useEffect, useRef } from 'react';

import {
  STORED_WRITE_DELAY_MS,
  flushStoredJSON,
  readStoredJSON,
  scheduleStoredJSON,
  writeStoredJSON,
} from '../../core/storage/localStorage';

/**
 * View-preference persistence for DataTable (column widths, hidden / pinned
 * columns, column order), stored in `localStorage` under
 * `datatable:${id}:${suffix}`. Everything is a no-op without an `id`, on
 * native, or when storage is unavailable (private mode, blocked site data).
 */

const storageKey = (id: string, suffix: string) => `datatable:${id}:${suffix}`;

/** Read a persisted preference, or `fallback` when there is none. */
export function readPref<V>(id: string | undefined, suffix: string, fallback: V): V {
  if (!id) return fallback;
  const stored = readStoredJSON(storageKey(id, suffix));
  return stored === undefined ? fallback : (stored as V);
}

/** Write a preference immediately. */
export function writePref(id: string | undefined, suffix: string, value: unknown): void {
  if (!id) return;
  writeStoredJSON(storageKey(id, suffix), value);
}

/** Default debounce for preference writes. */
export const PERSIST_DELAY_MS = STORED_WRITE_DELAY_MS;

/**
 * Persists `value` whenever it changes, debounced: a burst of updates (every
 * frame of a column-resize drag) produces a single `localStorage` write once it
 * settles, instead of a synchronous `JSON.stringify` + `setItem` per frame. The
 * initial value is not written (it came from storage or props), and a pending
 * write is flushed on unmount.
 */
export function usePersistedPref(id: string | undefined, suffix: string, value: unknown, delay = PERSIST_DELAY_MS): void {
  const key = id ? storageKey(id, suffix) : null;
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (key) scheduleStoredJSON(key, value, delay);
  }, [key, value, delay]);

  useEffect(() => {
    if (!key) return undefined;
    return () => flushStoredJSON(key);
  }, [key]);
}
