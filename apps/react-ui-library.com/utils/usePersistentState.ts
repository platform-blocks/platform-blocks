// Generic persistent state hook using an in-memory Map.
// Survives dev remounts (StrictMode + Fast Refresh) without needing ad-hoc singletons per feature.
import React from 'react';

const STORE = new Map<string, any>();

export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = React.useState<T>(() => {
    if (STORE.has(key)) return STORE.get(key);
    const initialValue = typeof initial === 'function' ? (initial as any)() : initial;
    STORE.set(key, initialValue);
    return initialValue;
  });

  const setPersistentValue = React.useCallback((next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? (next as any)(prev) : next;
      STORE.set(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, setPersistentValue] as const;
}

export function clearPersistentState(key?: string) {
  if (key) {
    STORE.delete(key);
  } else {
    STORE.clear();
  }
}
