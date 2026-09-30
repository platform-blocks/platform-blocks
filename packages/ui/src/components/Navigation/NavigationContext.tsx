import React, { createContext, useCallback, useContext, useMemo } from 'react';

import type { NavigationContext, NavigationState, Route, RouteParams } from './types';

const NavigationStateContext = createContext<NavigationContext | null>(null);
NavigationStateContext.displayName = 'NavigationContext';

export function useNavigation(): NavigationContext {
  const context = useContext(NavigationStateContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationContainer');
  }
  return context;
}

/** The navigation context, or `null` outside a `NavigationContainer`. */
export function useOptionalNavigation(): NavigationContext | null {
  return useContext(NavigationStateContext);
}

export function useRoute(): Route {
  const navigation = useNavigation();
  return navigation.state.routes[navigation.state.index];
}

interface NavigationProviderProps {
  children: React.ReactNode;
  state: NavigationState;
  /** Should keep one identity (the container passes a latest-callback), or every consumer re-renders with it. */
  onStateChange: (state: NavigationState) => void;
}

export function NavigationProvider({ children, state, onStateChange }: NavigationProviderProps) {
  const navigate = useCallback((name: string, params?: RouteParams) => {
    const existingRouteIndex = state.routes.findIndex(route => route.name === name);

    if (existingRouteIndex !== -1) {
      // Navigate to existing route
      onStateChange({
        ...state,
        index: existingRouteIndex,
        routes: state.routes.map((route, index) =>
          index === existingRouteIndex ? { ...route, params: { ...route.params, ...params } } : route
        ),
      });
      return;
    }

    // Add new route
    const newRoute: Route = {
      key: `${name}-${Date.now()}`,
      name,
      params,
    };
    onStateChange({
      ...state,
      index: state.routes.length,
      routes: [...state.routes, newRoute],
    });
  }, [state, onStateChange]);

  const goBack = useCallback(() => {
    if (state.index > 0) {
      onStateChange({
        ...state,
        index: state.index - 1,
        routes: state.routes.slice(0, -1),
      });
    }
  }, [state, onStateChange]);

  const canGoBack = useCallback(() => state.index > 0, [state.index]);

  const reset = useCallback((newState: NavigationState) => {
    onStateChange(newState);
  }, [onStateChange]);

  const contextValue = useMemo<NavigationContext>(() => ({
    state,
    navigate,
    goBack,
    canGoBack,
    reset,
  }), [state, navigate, goBack, canGoBack, reset]);

  return (
    <NavigationStateContext.Provider value={contextValue}>
      {children}
    </NavigationStateContext.Provider>
  );
}
