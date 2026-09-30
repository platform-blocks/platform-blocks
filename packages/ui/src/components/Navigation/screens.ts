import React, { useEffect, useMemo, type ComponentType, type ReactNode } from 'react';

import type { NavigationContext, NavigationScreenProps, Route, RouteParams } from './types';

/** Options, or a function of the route that produces them. */
export type ScreenOptionsInput<O> = O | ((props: { route: Route }) => O);

/** A `Screen` child as a navigator reads it. */
export interface CollectedScreen<O> {
  name: string;
  component: ComponentType<NavigationScreenProps>;
  options?: ScreenOptionsInput<O>;
  initialParams?: RouteParams;
}

/** The `Screen` children of a navigator, in order. Children without a `name` are skipped. */
export function useScreens<O>(children: ReactNode): CollectedScreen<O>[] {
  return useMemo(() => {
    const screens: CollectedScreen<O>[] = [];
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement<Partial<CollectedScreen<O>>>(child)) return;
      const { name, component, options, initialParams } = child.props;
      if (!name || !component) return;
      screens.push({ name, component, options, initialParams });
    });
    return screens;
  }, [children]);
}

/** Resolves a screen's options against the route and layers them over the navigator's defaults. */
export function resolveScreenOptions<O extends object>(
  screenOptions: O | undefined,
  options: ScreenOptionsInput<O> | undefined,
  route: Route
): O {
  const own = typeof options === 'function' ? options({ route }) : options;
  return { ...screenOptions, ...own } as O;
}

/** Navigates to the initial screen once, when the container has no routes yet. */
export function useInitialRoute<O>(
  navigation: NavigationContext,
  screens: CollectedScreen<O>[],
  initialRouteName: string | undefined
): void {
  const empty = navigation.state.routes.length === 0;
  const { navigate } = navigation;
  useEffect(() => {
    if (!empty || screens.length === 0) return;
    const route = screens.find(screen => screen.name === (initialRouteName || screens[0].name)) || screens[0];
    navigate(route.name, route.initialParams);
  }, [empty, initialRouteName, navigate, screens]);
}
