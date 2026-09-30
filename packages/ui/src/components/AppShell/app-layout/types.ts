import type React from 'react';
import type { PlatformOSType, Role, StyleProp, ViewStyle } from 'react-native';

import type { PlocksTheme } from '../../../core/theme/types';
import type { AppShellMainProps, ResponsiveSize, Breakpoint, StatusBarConfig } from '../types';

export type LayoutVisibilityFn = (ctx: AppLayoutRuntimeContext) => boolean;

// `any` default: a blueprint mixes components with unrelated prop types
// (header, navbar, overlays…), and `props` is checked against each entry's
// own component where the entry is typed with an explicit `Props`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LayoutComponentEntry<Props = any> {
  component: React.ComponentType<Props>;
  props?: Props | ((ctx: AppLayoutRuntimeContext) => Props);
  show?: LayoutVisibilityFn;
  key?: string;
  target?: 'shell' | 'root' | 'root-before' | 'root-after';
}

export interface LayoutRenderEntry {
  render: (ctx: AppLayoutRuntimeContext) => React.ReactNode;
  show?: LayoutVisibilityFn;
  key?: string;
  target?: 'shell' | 'root' | 'root-before' | 'root-after';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same heterogeneous default as LayoutComponentEntry
export type LayoutEntry<Props = any> = LayoutComponentEntry<Props> | LayoutRenderEntry;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same heterogeneous default as LayoutComponentEntry
export type LayoutComponentOrRenderEntry<Props = any> = LayoutEntry<Props>;

export interface LayoutBreakpointsConfig {
  headerHeight?: ResponsiveSize;
  navbarWidth?: ResponsiveSize;
  asideWidth?: ResponsiveSize;
  footerHeight?: ResponsiveSize;
  bottomNavHeight?: ResponsiveSize;
  padding?: ResponsiveSize;
}

export interface LayoutNavbarConfig extends LayoutComponentEntry {
  width?: ResponsiveSize;
  collapsedWidth?: number;
  expandOnHover?: boolean;
  /**
   * When paired with `expandOnHover`, hover-expansion pushes the main content
   * to the side (flexing the page) instead of overlaying it. Defaults to false.
   */
  expandOnHoverPush?: boolean;
  /**
   * Auto-expand the navbar once the viewport reaches this breakpoint or wider
   * (e.g. `'xl'`), overriding `startCollapsedDesktop` at/above that width.
   */
  autoExpandBreakpoint?: Breakpoint;
  startCollapsedDesktop?: boolean;
}

export interface LayoutAsideConfig extends LayoutComponentEntry {
  width?: ResponsiveSize;
}

export interface LayoutFooterConfig extends LayoutComponentEntry {
  height?: ResponsiveSize;
}

export interface LayoutBottomNavConfig extends LayoutComponentEntry {
  height?: ResponsiveSize;
}

/** Extra props for `AppShell.Main` (unknown keys are ignored). */
export type LayoutMainExtraProps = Partial<AppShellMainProps> & Record<string, unknown>;

export interface LayoutMainConfig {
  id?: string;
  /** Landmark role of the main content. @default 'main' */
  role?: Role;
  maw?: number | string;
  centerContent?: boolean;
  tableOfContents?: LayoutEntry;
  hideTableOfContentsOnMobile?: boolean;
  tableOfContentsWidth?: number | string;
  tableOfContentsWithBorder?: boolean;
  props?: LayoutMainExtraProps | ((ctx: AppLayoutRuntimeContext) => LayoutMainExtraProps);
}

export interface LayoutOptions {
  /**
   * Resolve the shell's geometry from CSS custom properties instead of the
   * breakpoint the JavaScript resolved — for statically rendered web apps,
   * whose prerender has no viewport to measure. The app must inline the
   * stylesheet `createAppShellCss` builds. See `shellCssVars.ts`.
   */
  cssGeometry?: boolean;
  withSafeArea?: boolean;
  withBorder?: boolean;
  bg?: string;
  padding?: ResponsiveSize;
  style?: StyleProp<ViewStyle>;
  statusBar?: StatusBarConfig;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  disabled?: boolean;
  testID?: string;
}

export type LayoutSection = 'header' | 'navbar' | 'aside' | 'footer' | 'bottomNav';

export type AppLayoutEffect = (ctx: AppLayoutRuntimeContext) => void | (() => void);

export interface AppLayoutBlueprint {
  id: string;
  breakpoints?: LayoutBreakpointsConfig;
  header?: LayoutComponentOrRenderEntry;
  navbar?: LayoutNavbarConfig;
  aside?: LayoutAsideConfig;
  footer?: LayoutFooterConfig;
  bottomNav?: LayoutBottomNavConfig;
  overlays?: LayoutEntry[];
  effects?: AppLayoutEffect[];
  main?: LayoutMainConfig;
  layout?: LayoutOptions;
  visibility?: Partial<Record<LayoutSection, LayoutVisibilityFn>>;
  meta?: Record<string, unknown>;
}

export interface AppLayoutNavigation {
  push?: (path: string) => void;
  replace?: (path: string) => void;
  goBack?: () => void;
  open?: (path: string) => void;
}

export interface AppLayoutRuntimeOverrides {
  query?: Record<string, string | string[] | undefined>;
  pathname?: string;
  navigation?: AppLayoutNavigation;
  platform?: PlatformOSType;
  meta?: Record<string, unknown>;
}

export interface AppLayoutRuntimeContext {
  blueprint: AppLayoutBlueprint;
  query: Record<string, string | string[] | undefined>;
  pathname?: string;
  navigation?: AppLayoutNavigation;
  platform: PlatformOSType;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isLandscape: boolean;
  orientation: 'portrait' | 'landscape';
  theme: PlocksTheme;
  colorScheme: string | undefined;
  reducedMotion: boolean;
  meta?: Record<string, unknown>;
}

export interface AppLayoutProviderValue {
  blueprint: AppLayoutBlueprint;
  runtime: {
    query: Record<string, string | string[] | undefined>;
    pathname?: string;
    navigation?: AppLayoutNavigation;
    platform: PlatformOSType;
    meta?: Record<string, unknown>;
  };
}
