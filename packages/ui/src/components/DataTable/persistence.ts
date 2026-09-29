import { useEffect, useRef } from 'react';

import { hasDOM } from '../../core/platform/flags';

/**
 * View-preference persistence for DataTable (column widths, hidden / pinned
 * columns, column order), stored in `localStorage` under
 * `datatable:${id}:${suffix}`. Everything is a no-op without an `id`, on
 * native, or when storage is unavailable (private mode, blocked site data).
 */

const storageKey = (id: string, suffix: string) => `datatable:${id}:${suffix}`;

function getStorage(): Storage | null {
  if (!hasDOM) return null;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Read a persisted preference, or `fallback` when there is none. */
export function readPref<V>(id: string | undefined, suffix: string, fallback: V): V {
  if (!id) return fallback;
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(storageKey(id, suffix));
    if (raw) return JSON.parse(raw) as V;
  } catch {
    /* storage unavailable or corrupt entry */
  }
  return fallback;
}

/** Write a preference immediately. */
export function writePref(id: string | undefined, suffix: string, value: unknown): void {
  if (!id) return;
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(storageKey(id, suffix), JSON.stringify(value));
  } catch {
    /* storage unavailable / quota exceeded */
  }
}

/** Default debounce for preference writes. */
export const PERSIST_DELAY_MS = 250;

interface PersistState {
  mounted: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  pending: { id: string; value: unknown } | null;
}

/**
 * Persists `value` whenever it changes, debounced: a burst of updates (every
 * frame of a column-resize drag) produces a single `localStorage` write once it
 * settles, instead of a synchronous `JSON.stringify` + `setItem` per frame. The
 * initial value is not written (it came from storage or props), and a pending
 * write is flushed on unmount.
 */
export function usePersistedPref(id: string | undefined, suffix: string, value: unknown, delay = PERSIST_DELAY_MS): void {
  // One mutable record (not several refs) so the unmount cleanup can read it safely.
  const state = useRef<PersistState>({ mounted: false, timer: null, pending: null }).current;

  useEffect(() => {
    if (!state.mounted) {
      state.mounted = true;
      return;
    }
    if (!id) return;
    state.pending = { id, value };
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      state.timer = null;
      const pending = state.pending;
      state.pending = null;
      if (pending) writePref(pending.id, suffix, pending.value);
    }, delay);
  }, [id, suffix, value, delay, state]);

  useEffect(
    () => () => {
      if (state.timer) clearTimeout(state.timer);
      state.timer = null;
      const pending = state.pending;
      state.pending = null;
      if (pending) writePref(pending.id, suffix, pending.value);
    },
    [suffix, state]
  );
}
