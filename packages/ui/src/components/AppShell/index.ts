// Enhanced responsive AppShell system (main export)
export { 
  AppShell,
  useAppShell,
  useAppShellApi,
  useAppShellLayout,
  AppShellHeader,
  AppShellNavbar,
  AppShellAside,
  AppShellFooter,
  AppShellBottomNav,
  AppShellMain,
  AppShellSection
} from './AppShell';

// New mobile-native components
export { MobileMenu } from './MobileMenu';
export { BottomAppBar } from './BottomAppBar';
export { StatusBarManager } from './StatusBarManager';
// Static-rendering geometry: see shellCssVars.ts
export {
  APP_SHELL_CSS_VARS,
  createAppShellCss,
  resolveNavbarReservedWidth,
  resolveContentBottom,
  isMobileBreakpoint,
} from './shellCssVars';
export type { AppShellCssConfig, AppShellCssVar } from './shellCssVars';

// Hooks
export { useBreakpoint } from './hooks/useBreakpoint';
export { useNavbarHover } from './AppShell';
export { resolveResponsiveValue } from './hooks/useResponsiveValue';

// Declarative layout blueprints
export {
  defineAppLayout,
  AppLayoutProvider,
  AppLayoutRenderer,
  useAppLayoutContext,
} from './app-layout';
export type {
  AppLayoutBlueprint,
  AppLayoutRuntimeOverrides,
  AppLayoutRuntimeContext,
  LayoutEntry,
  LayoutComponentEntry,
  LayoutNavbarConfig,
  LayoutAsideConfig,
  LayoutFooterConfig,
  LayoutBottomNavConfig,
  LayoutMainConfig,
  LayoutOptions,
  LayoutSection,
} from './app-layout';

// Defaults & meta schema
export { DEFAULT_HEADER, DEFAULT_NAVBAR, DEFAULT_ASIDE, DEFAULT_FOOTER, DEFAULT_BOTTOM_NAV } from './defaults';
export { APP_SHELL_META } from './meta.schema';

// Enhanced AppShell types
export type {
  AppShellProps,
  LayoutType,
  ResponsiveSize,
  Breakpoint,
  HeaderConfig,
  NavbarConfig,
  AsideConfig,
  FooterConfig,
  BottomNavConfig,
  AppShellBottomNavProps,
  BottomAppBarItem
} from './types';
