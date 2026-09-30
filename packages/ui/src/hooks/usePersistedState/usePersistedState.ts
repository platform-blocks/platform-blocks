import { useMemo, useRef, useSyncExternalStore } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform/flags';
import { getLocalStorage } from '../../core/storage/localStorage';
import { devWarn, warnOnce } from '../../core/utils/logger';
import { defaultExportOf, resolveOptionalModule } from '../../utils/optionalModule';

/**
 * Where persisted values live. `localStorage`, `sessionStorage` and
 * `@react-native-async-storage/async-storage` fit as-is; wrap anything else
 * (MMKV, SecureStore, a server) in these three methods. Reads may be async.
 */
export interface PersistedStateStorage {
  getItem(key: string): string | null | undefined | Promise<string | null | undefined>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export interface UsePersistedStateOptions<T> {
  /**
   * Where to keep the value. Defaults to `localStorage` on the web and, on
   * native, `@react-native-async-storage/async-storage` when it is installed
   * (otherwise values live in memory until the app restarts). Pass a stable
   * object: one created during render is a new store every render.
   */
  storage?: PersistedStateStorage;
  /** Turns the value into the stored string. @default JSON.stringify */
  serialize?: (value: T) => string;
  /**
   * Turns the stored string back into a value. Throw to reject it (a stale
   * shape, a hand-edited entry); the default value is used instead.
   * @default JSON.parse
   */
  deserialize?: (raw: string) => T;
}

export interface PersistedStateControls {
  /** Deletes the stored value; the state falls back to the default value. */
  remove: () => void;
  /**
   * `false` until the stored value has been read: during static rendering and
   * hydration, and while an async storage (AsyncStorage) is loading. The state
   * shows the default value until then.
   */
  ready: boolean;
}

export type UsePersistedStateReturn<T> = readonly [
  T,
  Dispatch<SetStateAction<T>>,
  PersistedStateControls,
];

/* ------------------------------------------------------------------ storage */

const memoryValues = new Map<string, string>();

/** Fallback storage when there is nothing to persist to: survives remounts, not reloads. */
const memoryStorage: PersistedStateStorage = {
  getItem: (key) => memoryValues.get(key) ?? null,
  setItem: (key, value) => {
    memoryValues.set(key, value);
  },
  removeItem: (key) => {
    memoryValues.delete(key);
  },
};

let nativeStorage: PersistedStateStorage | null | undefined;

function getDefaultStorage(): PersistedStateStorage {
  if (isWeb) return getLocalStorage() ?? memoryStorage;
  if (nativeStorage === undefined) {
    nativeStorage = resolveOptionalModule<PersistedStateStorage>('@react-native-async-storage/async-storage', {
      accessor: (mod) => {
        const storage = defaultExportOf<PersistedStateStorage>(mod);
        return typeof storage?.getItem === 'function' ? storage : null;
      },
      devWarning:
        'usePersistedState: @react-native-async-storage/async-storage is not installed, so values are kept in memory only. Install it, or pass a `storage`.',
    });
  }
  return nativeStorage ?? memoryStorage;
}

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof (value as { then?: unknown } | null)?.then === 'function';

/** Runs a storage write, reporting (not throwing) a failure: a full quota, a rejected promise. */
function runWrite(key: string, write: () => unknown): void {
  const report = (error: unknown) => devWarn(`usePersistedState: could not write "${key}".`, error);
  try {
    const result = write();
    if (isPromise(result)) result.catch(report);
  } catch (error) {
    report(error);
  }
}

/* -------------------------------------------------------------------- store */

interface Snapshot {
  /** The stored string, or null when nothing is stored. */
  raw: string | null;
  ready: boolean;
}

interface Entry {
  snapshot: Snapshot;
  listeners: Set<() => void>;
  /** Bumped on every local write, so a slow read can't overwrite a newer value. */
  version: number;
  loading: boolean;
}

const SERVER_SNAPSHOT: Snapshot = Object.freeze({ raw: null, ready: false });

// Keyed by storage, then key: every hook on the same key shares one entry and
// sees the other's writes immediately.
const entries = new WeakMap<PersistedStateStorage, Map<string, Entry>>();

function getEntry(storage: PersistedStateStorage, key: string): Entry {
  let byKey = entries.get(storage);
  if (!byKey) {
    byKey = new Map();
    entries.set(storage, byKey);
  }
  let entry = byKey.get(key);
  if (!entry) {
    entry = { snapshot: { raw: null, ready: false }, listeners: new Set(), version: 0, loading: false };
    byKey.set(key, entry);
  }
  return entry;
}

function publish(entry: Entry, snapshot: Snapshot): void {
  if (entry.snapshot.ready === snapshot.ready && entry.snapshot.raw === snapshot.raw) return;
  entry.snapshot = snapshot;
  entry.listeners.forEach((listener) => listener());
}

/**
 * Reads `key` from storage into the entry. A synchronous storage lands right
 * away (so a client render starts on the stored value); an async one lands
 * when it resolves, unless the value was written locally in the meantime.
 */
function load(storage: PersistedStateStorage, key: string, entry: Entry): void {
  if (entry.loading) return;
  const version = entry.version;
  const settle = (raw: string | null | undefined) => {
    entry.loading = false;
    if (entry.version === version) publish(entry, { raw: raw ?? null, ready: true });
  };
  const fail = (error: unknown) => {
    devWarn(`usePersistedState: could not read "${key}".`, error);
    settle(null);
  };

  let result: ReturnType<PersistedStateStorage['getItem']>;
  try {
    result = storage.getItem(key);
  } catch (error) {
    fail(error);
    return;
  }
  if (isPromise(result)) {
    entry.loading = true;
    result.then(settle, fail);
  } else {
    settle(result);
  }
}

/* ------------------------------------------------- cross-tab sync (web only) */

let storageEventSubscribers = 0;

function onStorageEvent(event: StorageEvent): void {
  const storage = getLocalStorage();
  if (!storage || event.storageArea !== storage) return;
  const byKey = entries.get(storage);
  if (!byKey) return;
  if (event.key === null) {
    // `clear()` in another tab.
    byKey.forEach((entry) => {
      entry.version += 1;
      publish(entry, { raw: null, ready: true });
    });
    return;
  }
  const entry = byKey.get(event.key);
  if (!entry) return;
  entry.version += 1;
  publish(entry, { raw: event.newValue, ready: true });
}

function watchOtherTabs(storage: PersistedStateStorage): () => void {
  if (storage !== getLocalStorage()) return () => {};
  if (storageEventSubscribers === 0) window.addEventListener('storage', onStorageEvent);
  storageEventSubscribers += 1;
  return () => {
    storageEventSubscribers -= 1;
    if (storageEventSubscribers === 0) window.removeEventListener('storage', onStorageEvent);
  };
}

/* --------------------------------------------------------------------- hook */

const defaultSerialize = (value: unknown): string => JSON.stringify(value);
const defaultDeserialize = (raw: string): unknown => JSON.parse(raw);

/**
 * `useState` that survives reloads: the value is saved under `key` and read
 * back on the next visit. Every component using the same key shares the
 * value, and on the web it follows changes made in other tabs.
 *
 * The third item holds `remove()` (delete the stored value) and `ready`
 * (`false` until the stored value has been read). Until then — during static
 * rendering, hydration, and while an async storage loads — the state is
 * `defaultValue`, so server and client markup match.
 *
 * @example
 * const [view, setView] = usePersistedState<'grid' | 'list'>('gallery-view', 'grid');
 *
 * @example Async storage on native: wait for `ready` to avoid a flash of the default
 * const [onboarded, setOnboarded, { ready }] = usePersistedState('onboarded', false);
 * if (!ready) return null;
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options: UsePersistedStateOptions<T> = {}
): UsePersistedStateReturn<T> {
  const storage = options.storage ?? getDefaultStorage();
  const serialize = (options.serialize ?? defaultSerialize) as (value: T) => string;
  const deserialize = (options.deserialize ?? defaultDeserialize) as (raw: string) => T;

  const entry = getEntry(storage, key);

  const subscribe = useMemo(
    () => (listener: () => void) => {
      const wasIdle = entry.listeners.size === 0;
      entry.listeners.add(listener);
      // Another tab (or code outside this hook) may have changed the value
      // while nothing was subscribed: re-read it.
      if (wasIdle && entry.snapshot.ready) load(storage, key, entry);
      const unwatch = watchOtherTabs(storage);
      return () => {
        entry.listeners.delete(listener);
        unwatch();
      };
    },
    [storage, key, entry]
  );

  const getSnapshot = () => {
    if (!entry.snapshot.ready) load(storage, key, entry);
    return entry.snapshot;
  };

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);

  // Parsed once per stored string. `deserialize` is usually an inline function,
  // so it's read through a ref rather than being a dependency.
  const deserializeRef = useRef(deserialize);
  deserializeRef.current = deserialize;
  const parsed = useMemo(() => {
    if (snapshot.raw === null) return { ok: false as const };
    try {
      return { ok: true as const, value: deserializeRef.current(snapshot.raw) };
    } catch (error) {
      warnOnce(`usePersistedState:${key}`, `usePersistedState: ignoring the unreadable value stored under "${key}".`, error);
      return { ok: false as const };
    }
  }, [snapshot.raw, key]);

  const value = parsed.ok ? parsed.value : defaultValue;

  const remove = useLatestCallback(() => {
    entry.version += 1;
    publish(entry, { raw: null, ready: true });
    runWrite(key, () => storage.removeItem(key));
  });

  const setValue = useLatestCallback((action: SetStateAction<T>) => {
    // Resolve updaters against the latest stored value, so several calls in
    // one event compose.
    let previous = defaultValue;
    if (entry.snapshot.raw !== null) {
      try {
        previous = deserialize(entry.snapshot.raw);
      } catch {
        /* unreadable: start from the default */
      }
    }
    const next = typeof action === 'function' ? (action as (previous: T) => T)(previous) : action;

    let raw: string | undefined;
    try {
      raw = serialize(next);
    } catch (error) {
      devWarn(`usePersistedState: could not serialize the value for "${key}".`, error);
      return;
    }
    // `JSON.stringify(undefined)` is not a string: storing "nothing" is a removal.
    if (typeof raw !== 'string') {
      remove();
      return;
    }

    entry.version += 1;
    publish(entry, { raw, ready: true });
    runWrite(key, () => storage.setItem(key, raw));
  });

  const controls = useMemo(() => ({ remove, ready: snapshot.ready }), [remove, snapshot.ready]);

  return [value, setValue as Dispatch<SetStateAction<T>>, controls] as const;
}
