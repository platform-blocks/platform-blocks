import {
  flushStoredJSON,
  readStoredJSON,
  scheduleStoredJSON,
  writeStoredJSON,
} from '../../core/storage/localStorage';

const STORAGE_PREFIX = 'plocks-tree:';

/**
 * Which branches a tree had open, remembered across reloads.
 *
 * Web only, and deliberately so: `localStorage` is the one store available
 * without pulling `@react-native-async-storage/async-storage` into every
 * consumer, and the case that needs this — a docs sidebar surviving a page
 * refresh — is a web case. Native trees keep expansion in component state,
 * which already survives navigation.
 *
 * Storage access is guarded (core/storage): a tree that cannot remember its
 * state must still render.
 */
export const readPersistedExpansion = (key: string): string[] | null => {
  const parsed = readStoredJSON(`${STORAGE_PREFIX}${key}`);
  // A hand-edited or version-skewed entry is discarded rather than trusted —
  // a non-string id would flow straight into the expanded set.
  if (!Array.isArray(parsed)) return null;
  return parsed.filter((id): id is string => typeof id === 'string');
};

export const writePersistedExpansion = (key: string, ids: string[]): void => {
  writeStoredJSON(`${STORAGE_PREFIX}${key}`, ids);
};

/**
 * Writes are debounced: expanding a few branches in a row (or a filter opening
 * a dozen) costs one `localStorage` write, not one per branch.
 * `flushPersistedExpansion` lands a pending write right away — on unmount, so
 * the last toggle before navigating away is not lost.
 */
export const schedulePersistedExpansion = (key: string, ids: string[]): void => {
  scheduleStoredJSON(`${STORAGE_PREFIX}${key}`, ids);
};

export const flushPersistedExpansion = (key: string): void => {
  flushStoredJSON(`${STORAGE_PREFIX}${key}`);
};
