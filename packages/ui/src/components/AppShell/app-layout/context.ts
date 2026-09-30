import React from 'react';
import type { AppLayoutProviderValue } from './types';

export const AppLayoutContext = React.createContext<AppLayoutProviderValue | undefined>(undefined);

/**
 * Returns the enclosing `AppLayoutProvider`'s value — the `defineAppLayout`
 * `blueprint` plus the resolved `runtime` (`query`, `pathname`, `navigation`,
 * `platform`, `meta`) — for custom renderers that read the layout the way
 * `AppLayoutRenderer` does, and throws when called outside an `AppLayoutProvider`.
 */
export const useAppLayoutContext = (): AppLayoutProviderValue => {
  const ctx = React.useContext(AppLayoutContext);
  if (!ctx) {
    throw new Error('useAppLayoutContext must be used within an AppLayoutProvider');
  }
  return ctx;
};
