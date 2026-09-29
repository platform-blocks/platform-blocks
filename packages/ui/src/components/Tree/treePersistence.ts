import { hasDOM } from '../../core/platform/flags';

const STORAGE_PREFIX = 'platform-blocks-tree:';

/**
 * Which branches a tree had open, remembered across reloads.
 *
 * Web only, and deliberately so: `localStorage` is the one store available
 * without pulling `@react-native-async-storage/async-storage` into every
 * consumer, and the case that needs this — a docs sidebar surviving a page
 * refresh — is a web case. Native trees keep expansion in component state,
 * which already survives navigation.
 *
 * Every read and write is wrapped: Safari in private mode throws on
 * `localStorage` access rather than returning null, and a tree that cannot
 * remember its state must still render.
 */
const storage = (): Storage | null => {
  // `hasDOM`, not `typeof window`: React Native defines a global `window` too.
  if (!hasDOM) return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
};

export const readPersistedExpansion = (key: string): string[] | null => {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    // A hand-edited or version-skewed entry is discarded rather than trusted —
    // a non-string id would flow straight into the expanded set.
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return null;
  }
};

export const writePersistedExpansion = (key: string, ids: string[]): void => {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(ids));
  } catch {
    // Quota exceeded, or storage disabled mid-session. Expansion is a
    // convenience; losing it is not worth an exception in a render effect.
  }
};

/**
 * Writes are debounced: expanding a few branches in a row (or a filter opening
 * a dozen) costs one `localStorage` write, not one per branch. Pending writes
 * are keyed by storage key, and `flushPersistedExpansion` lands one right away
 * — on unmount, so the last toggle before navigating away is not lost.
 */
const WRITE_DELAY_MS = 250;
const pendingWrites = new Map<string, { ids: string[]; timer: ReturnType<typeof setTimeout> }>();

export const schedulePersistedExpansion = (key: string, ids: string[]): void => {
  if (!hasDOM) return;
  const existing = pendingWrites.get(key);
  if (existing) clearTimeout(existing.timer);
  const timer = setTimeout(() => {
    pendingWrites.delete(key);
    writePersistedExpansion(key, ids);
  }, WRITE_DELAY_MS);
  pendingWrites.set(key, { ids, timer });
};

export const flushPersistedExpansion = (key: string): void => {
  const entry = pendingWrites.get(key);
  if (!entry) return;
  clearTimeout(entry.timer);
  pendingWrites.delete(key);
  writePersistedExpansion(key, entry.ids);
};
