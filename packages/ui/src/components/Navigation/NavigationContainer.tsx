import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { hasDOM } from '../../core/platform/flags';
import { warnOnce } from '../../core/utils/logger';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';

import { NavigationProvider } from './NavigationContext';
import type {
  LinkingOptions,
  LinkingScreenConfig,
  NavigationContainerProps,
  NavigationState,
  Route,
} from './types';

export type { NavigationContainerProps } from './types';

type LinkingConfig = NonNullable<LinkingOptions['config']>;

const FILL: ViewStyle = { flex: 1 };

const defaultInitialState: NavigationState = {
  routes: [],
  index: 0,
  key: 'root',
};

// The URL is read through useSyncExternalStore so the first render is
// hydration-safe: the server snapshot (and the hydration pass) see `null`,
// the client sees the real path. `hasDOM`, not `typeof window`: React Native
// defines a `window` without a `location`.
const noopSubscribe = () => () => {};
const readPathname = (): string | null => (hasDOM ? window.location.pathname : null);
const readServerPathname = (): string | null => null;

function stateFromPath(pathname: string | null, config: LinkingConfig | undefined): NavigationState | null {
  if (pathname === null || !config) return null;
  const route = parseUrl(pathname, config);
  return route ? { routes: [route], index: 0, key: 'root' } : null;
}

const NavigationContainerBase = factory<{ props: NavigationContainerProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const {
    children,
    initialState = defaultInitialState,
    onStateChange,
    theme,
    linking,
    style,
    testID,
  } = otherProps;

  if (theme !== undefined) {
    warnOnce(
      'NavigationContainer.theme',
      '[platform-blocks] NavigationContainer: `theme` is ignored; the navigators read the platform-blocks theme.'
    );
  }

  const spacing = useStyleProps(styleProps);
  const linkingConfig = linking?.config;
  const notifyStateChange = useLatestCallback(onStateChange);

  const pathname = useSyncExternalStore(noopSubscribe, readPathname, readServerPathname);
  const [urlSeeded, setUrlSeeded] = useState(pathname !== null);
  const [state, setState] = useState<NavigationState>(
    () => stateFromPath(pathname, linkingConfig) ?? initialState
  );

  if (!urlSeeded && pathname !== null) {
    // First client render after hydration: the URL is readable now, so the
    // route it names replaces the server-rendered initial state (once).
    setUrlSeeded(true);
    const fromUrl = stateFromPath(pathname, linkingConfig);
    if (fromUrl) setState(fromUrl);
  }

  // Browser back / forward.
  const handlePopState = useLatestCallback(() => {
    const next = stateFromPath(readPathname(), linking?.config);
    if (!next) return;
    setState(next);
    notifyStateChange(next);
  });
  const hasLinking = !!linkingConfig;
  useEffect(() => {
    if (!hasLinking || !hasDOM) return undefined;
    const listener = () => handlePopState();
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, [handlePopState, hasLinking]);

  // Stable identity, so the navigation context only changes with the state.
  const handleStateChange = useLatestCallback((next: NavigationState) => {
    setState(next);
    notifyStateChange(next);

    // Basic web URL sync. Held back until the URL has been read (see above),
    // so a navigator's initial navigate during hydration can't overwrite the
    // address the page was loaded at.
    if (!linking?.config || !hasDOM || !urlSeeded) return;
    const currentRoute = next.routes[next.index];
    if (!currentRoute) return;
    const url = generateUrl(currentRoute, linking.config);
    if (url !== window.location.pathname) window.history.pushState({}, '', url);
  });

  return (
    <View ref={ref} testID={testID} style={[FILL, spacing, style]}>
      <NavigationProvider state={state} onStateChange={handleStateChange}>
        {children}
      </NavigationProvider>
    </View>
  );
}, { displayName: 'NavigationContainer' });

export const NavigationContainer = NavigationContainerBase;

// Helper function to generate URLs for web routing
function generateUrl(route: Route, config: LinkingConfig): string {
  if (!config.screens) return '/';

  // Simple URL generation - can be enhanced for complex routing
  const screenConfig = config.screens[route.name];
  if (typeof screenConfig === 'string') {
    return screenConfig;
  }
  if (screenConfig?.path) {
    let path = screenConfig.path;
    // Replace params in path
    if (route.params) {
      Object.entries(route.params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, String(value));
      });
    }
    return path;
  }

  return `/${route.name.toLowerCase()}`;
}

const routeFor = (name: string, params: Record<string, string> = {}): Route => ({
  key: `${name}-${Date.now()}`,
  name,
  params,
});

/** Whether `pathname` is `base` or sits below it (segment-aware: `/app` covers `/app/x`, not `/apple`). */
const isWithin = (pathname: string, base: string): boolean =>
  pathname === base || pathname.startsWith(base.endsWith('/') ? base : `${base}/`);

// Helper function to parse URLs and match routes
function parseUrl(pathname: string, config: LinkingConfig): Route | null {
  if (!config.screens) return null;

  for (const [screenName, screenConfig] of Object.entries(config.screens) as [string, LinkingScreenConfig][]) {
    if (typeof screenConfig === 'string') {
      if (pathname === screenConfig) return routeFor(screenName);
      continue;
    }

    const configPath = screenConfig.path;
    if (!configPath) continue;

    // Exact match
    if (pathname === configPath) return routeFor(screenName);

    // Parameterized paths (basic implementation)
    const pathPattern = configPath.replace(/:([^/]+)/g, '([^/]+)');
    const match = pathname.match(new RegExp(`^${pathPattern}$`));
    if (match) {
      const params: Record<string, string> = {};
      const paramNames = [...configPath.matchAll(/:([^/]+)/g)].map(m => m[1]);
      paramNames.forEach((paramName, index) => {
        params[paramName] = match[index + 1];
      });
      return routeFor(screenName, params);
    }

    // A nested navigator: anything under its path lands on the parent route.
    if (screenConfig.screens && isWithin(pathname, configPath)) return routeFor(screenName);
  }

  return null;
}
