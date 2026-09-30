import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useOptionalNavigation } from './NavigationContext';
import type { NavigationScreenProps, ScreenProps } from './types';

export interface ScreenComponentProps extends ScreenProps {
  children?: React.ReactNode;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});

/**
 * Declares a screen. Navigators read its props and render the active screen
 * themselves; rendered on its own it shows its component — with the current
 * route and navigation when inside a `NavigationContainer` — or its children.
 */
export function Screen({ component: Component, children }: ScreenComponentProps) {
  const navigation = useOptionalNavigation();
  const route = navigation?.state.routes[navigation.state.index];

  let content: React.ReactNode = children;
  if (Component) {
    if (navigation && route) {
      content = <Component route={route} navigation={navigation} />;
    } else {
      // Outside a container there is no route to hand it (the previous behaviour).
      const Unwired = Component as React.ComponentType<Partial<NavigationScreenProps>>;
      content = <Unwired />;
    }
  }

  return <View style={styles.screen}>{content}</View>;
}
