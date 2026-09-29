import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface TitleItem {
  id: string;
  text: string;
  order: number; // 1-6, maps to depth
  /** The heading's host element (a DOM element on web). */
  ref?: React.RefObject<unknown>;
}

export interface TitleRegistryContextValue {
  titles: TitleItem[];
  registerTitle: (title: TitleItem) => void;
  unregisterTitle: (id: string) => void;
  clearTitles: () => void;
}

const TitleRegistryContext = createContext<TitleRegistryContextValue | null>(null);
TitleRegistryContext.displayName = 'TitleRegistryContext';

export const useTitleRegistry = (): TitleRegistryContextValue => {
  const context = useContext(TitleRegistryContext);
  if (!context) {
    throw new Error('useTitleRegistry must be used within a TitleRegistryProvider');
  }
  return context;
};

export const useTitleRegistryOptional = (): TitleRegistryContextValue | null => {
  return useContext(TitleRegistryContext);
};

export interface TitleRegistryProviderProps {
  children: ReactNode;
}

const sameTitle = (a: TitleItem, b: TitleItem) =>
  a.id === b.id && a.text === b.text && a.order === b.order && a.ref === b.ref;

export const TitleRegistryProvider: React.FC<TitleRegistryProviderProps> = ({ children }) => {
  const [titles, setTitles] = useState<TitleItem[]>([]);

  const registerTitle = useCallback((title: TitleItem) => {
    setTitles((prev) => {
      const existing = prev.find((t) => t.id === title.id);
      // Re-registering the same title (StrictMode, remounts) changes nothing.
      if (existing && sameTitle(existing, title)) return prev;
      // Replace any title with the same id; order by depth, then registration order (stable sort).
      const filtered = prev.filter((t) => t.id !== title.id);
      return [...filtered, title].sort((a, b) => a.order - b.order);
    });
  }, []);

  const unregisterTitle = useCallback((id: string) => {
    setTitles((prev) => (prev.some((t) => t.id === id) ? prev.filter((t) => t.id !== id) : prev));
  }, []);

  const clearTitles = useCallback(() => {
    setTitles((prev) => (prev.length ? [] : prev));
  }, []);

  const value = useMemo(
    () => ({ titles, registerTitle, unregisterTitle, clearTitles }),
    [titles, registerTitle, unregisterTitle, clearTitles]
  );

  return <TitleRegistryContext.Provider value={value}>{children}</TitleRegistryContext.Provider>;
};
