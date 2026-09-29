import type { ComponentType, ReactNode } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';

import type { BaseProps } from '../../core/types/base';

/** Route params: whatever the screen was navigated to with. */
export type RouteParams = Record<string, unknown>;

export interface NavigationState {
  routes: Route[];
  index: number;
  key: string;
}

export interface Route {
  key: string;
  name: string;
  params?: RouteParams;
}

export interface NavigationOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerLeft?: () => ReactNode;
  headerRight?: () => ReactNode;
  headerBackTitle?: string;
}

/** Props every screen component receives from its navigator. */
export interface NavigationScreenProps {
  route: Route;
  navigation: NavigationContext;
}

export interface ScreenProps {
  name: string;
  component: ComponentType<NavigationScreenProps>;
  options?: NavigationOptions | ((props: { route: Route }) => NavigationOptions);
  initialParams?: RouteParams;
}

/** Navigators accept the common component props: `style` / `testID` / spacing apply to their root view. */
export interface NavigatorProps extends BaseProps<ViewStyle> {
  children: ReactNode;
  initialRouteName?: string;
  screenOptions?: NavigationOptions;
}

export interface DrawerOptions extends NavigationOptions {
  drawerIcon?: (props: { color: string; size: number; focused: boolean }) => ReactNode;
  drawerLabel?: string;
}

export interface DrawerScreenProps extends Omit<ScreenProps, 'options'> {
  options?: DrawerOptions | ((props: { route: Route }) => DrawerOptions);
}

/** A screen as a drawer navigator collected it from its `Screen` children. */
export interface DrawerScreenConfig {
  name: string;
  component: ComponentType<NavigationScreenProps>;
  options?: DrawerScreenProps['options'];
  initialParams?: RouteParams;
}

/** What a custom `drawerContent` renderer receives. */
export interface DrawerContentProps {
  navigation: NavigationContext;
  screens: DrawerScreenConfig[];
  currentRoute: Route;
  /** Closes the drawer (the default content closes it after navigating). */
  closeDrawer: () => void;
}

export interface DrawerNavigatorProps extends NavigatorProps {
  screenOptions?: DrawerOptions;
  drawerStyle?: StyleProp<ViewStyle>;
  drawerContent?: (props: DrawerContentProps) => ReactNode;
  /**
   * Accessible name of the drawer panel, which opens as a modal dialog.
   * @default 'Navigation'
   */
  drawerAccessibilityLabel?: string;
}

export interface StackOptions extends NavigationOptions {
  /** @deprecated Not implemented — every screen presents as a card. Accepted for React Navigation parity. */
  presentation?: 'modal' | 'card';
  /** @deprecated Not implemented — there is no swipe-back gesture. Accepted for React Navigation parity. */
  gestureEnabled?: boolean;
}

export interface StackScreenProps extends Omit<ScreenProps, 'options'> {
  options?: StackOptions | ((props: { route: Route }) => StackOptions);
}

export interface StackNavigatorProps extends NavigatorProps {
  screenOptions?: StackOptions;
}

export interface NavigationContext {
  state: NavigationState;
  navigate: (name: string, params?: RouteParams) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  reset: (state: NavigationState) => void;
}

/** A screen's path, or a nested navigator with its own path and screens. */
export type LinkingScreenConfig = string | { path?: string; screens?: Record<string, LinkingScreenConfig> };

/** Basic URL ↔ route mapping for web (a subset of React Navigation's `linking`). */
export interface LinkingOptions {
  /** Accepted for React Navigation parity; only the path is matched. */
  prefixes?: string[];
  config?: {
    screens?: Record<string, LinkingScreenConfig>;
  };
}

export interface NavigationContainerProps extends BaseProps<ViewStyle> {
  children: ReactNode;
  initialState?: NavigationState;
  onStateChange?: (state: NavigationState) => void;
  /**
   * @deprecated Ignored. Accepted so React Navigation-style call sites type-check;
   * the navigators read the platform-blocks theme.
   */
  theme?: unknown;
  /** Web: sync the current route with the URL (push on navigate, follow back/forward). */
  linking?: LinkingOptions;
}
