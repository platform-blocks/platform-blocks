import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface TitleItem {
  id: string;
  text: string;
  order: number; // 1-6, heading depth (not page position)
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

function comparePageOrder(a: TitleItem, b: TitleItem): number {
  const aNode = a.ref?.current as Node | undefined;
  const bNode = b.ref?.current as Node | undefined;
  if (!aNode || !bNode || typeof aNode.compareDocumentPosition !== 'function') return 0;
  const position = aNode.compareDocumentPosition(bNode);
  if (position & Node.DOCUMENT_POSITION_DISCONNECTED) return 0;
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

export const TitleRegistryProvider: React.FC<TitleRegistryProviderProps> = ({ children }) => {
  const [titles, setTitles] = useState<TitleItem[]>([]);

  const registerTitle = useCallback((title: TitleItem) => {
    setTitles((prev) => {
      const existing = prev.find((t) => t.id === title.id);
      // Re-registering the same title (StrictMode, remounts) changes nothing.
      if (existing && sameTitle(existing, title)) {
        const ordered = [...prev].sort(comparePageOrder);
        return ordered.every((item, index) => item === prev[index]) ? prev : ordered;
      }
      // DOM order is authoritative on web; registration order is the fallback
      // for native nodes and headings that are not attached yet.
      const next = existing
        ? prev.map((item) => item.id === title.id ? title : item)
        : [...prev, title];
      return next.sort(comparePageOrder);
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
