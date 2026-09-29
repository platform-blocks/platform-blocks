import React from 'react';
import { Platform } from 'react-native';
import { AppLayoutContext } from './context';
import type { AppLayoutBlueprint, AppLayoutRuntimeOverrides } from './types';

const EMPTY_QUERY: Record<string, string | string[] | undefined> = {};

export interface AppLayoutProviderProps {
  blueprint: AppLayoutBlueprint;
  value?: AppLayoutRuntimeOverrides;
  children: React.ReactNode;
}

export const AppLayoutProvider: React.FC<AppLayoutProviderProps> = ({
  blueprint,
  value,
  children,
}) => {
  // Keyed on the fields, not the `value` object, so an inline `value={{ … }}`
  // doesn't hand every consumer a new context (and re-run blueprint effects)
  // on each parent render.
  const query = value?.query;
  const pathname = value?.pathname;
  const navigation = value?.navigation;
  // The OS name is runtime data here (`ctx.platform`), not a platform branch.
  // eslint-disable-next-line no-restricted-syntax -- exposes the OS name as data, not a branch
  const platform = value?.platform ?? Platform.OS;
  const meta = value?.meta;
  const runtime = React.useMemo(() => ({
    query: query ?? EMPTY_QUERY,
    pathname,
    navigation,
    platform,
    meta,
  }), [query, pathname, navigation, platform, meta]);

  const contextValue = React.useMemo(() => ({
    blueprint,
    runtime,
  }), [blueprint, runtime]);

  return (
    <AppLayoutContext.Provider value={contextValue}>
      {children}
    </AppLayoutContext.Provider>
  );
};
