import { hasDOM } from '../platform/flags';

/**
 * Guarded `localStorage` access for everything in the library that remembers
 * a value across reloads: `usePersistedState`, DataTable column preferences,
 * Tree expansion and the theme mode.
 *
 * Every access is wrapped. There is no storage during static rendering or on
 * native, Safari in private mode throws on access instead of returning null,
 * and a full quota throws on write. Callers get `null` or a no-op instead, so a
 * value that can't be remembered never breaks a render.
 */

/** `window.localStorage`, or null when there is none or it can't be accessed. */
export function getLocalStorage(): Storage | null {
  // `hasDOM`, not `typeof window`: React Native defines a global `window` too.
  if (!hasDOM) return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/** The raw string stored under `key`, or null when absent or unreadable. */
export function readStored(key: string): string | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** Stores `value` under `key`; returns false when it could not be written. */
export function writeStored(key: string, value: string): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * The parsed JSON stored under `key`, or `undefined` when there is none or it
 * isn't valid JSON. The result is untrusted: validate its shape before use.
 */
export function readStoredJSON(key: string): unknown {
  const raw = readStored(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

/** Stores `value` as JSON under `key`. */
export function writeStoredJSON(key: string, value: unknown): void {
  let raw: string;
  try {
    raw = JSON.stringify(value);
  } catch {
    return;
  }
  if (typeof raw === 'string') writeStored(key, raw);
}

/** Default debounce for `scheduleStoredJSON`. */
export const STORED_WRITE_DELAY_MS = 250;

const pendingWrites = new Map<string, { value: unknown; timer: ReturnType<typeof setTimeout> }>();

/**
 * Debounced `writeStoredJSON`: a burst of updates to one key (every frame of a
 * column-resize drag, a filter expanding a dozen tree branches) costs a single
 * write once it settles. Call `flushStoredJSON` on unmount so the last update
 * before navigating away is not lost.
 */
export function scheduleStoredJSON(key: string, value: unknown, delay: number = STORED_WRITE_DELAY_MS): void {
  if (!getLocalStorage()) return;
  const existing = pendingWrites.get(key);
  if (existing) clearTimeout(existing.timer);
  const timer = setTimeout(() => {
    pendingWrites.delete(key);
    writeStoredJSON(key, value);
  }, delay);
  pendingWrites.set(key, { value, timer });
}

/** Writes a pending `scheduleStoredJSON` value for `key` right away. */
export function flushStoredJSON(key: string): void {
  const entry = pendingWrites.get(key);
  if (!entry) return;
  clearTimeout(entry.timer);
  pendingWrites.delete(key);
  writeStoredJSON(key, entry.value);
}
