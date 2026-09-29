import type React from 'react';
import type { Role, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { Breakpoint as ResponsiveBreakpoint } from '../../core/responsive';
import type { BaseProps } from '../../core/types/base';

/**
 * A size that can change per breakpoint. Numbers are px; strings are parsed as
 * px (`'240'`, `'240px'`). The navbar's drawer width also accepts viewport
 * relative strings (`'100%'`, `'80vw'`, `'full'`).
 */
export type ResponsiveSize = number | string | {
  base?: number | string;
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
};

/**
 * Breakpoint names. Widths come from `theme.breakpoints` (xs 480, sm 576,
 * md 768, lg 992, xl 1200 by default); `base` is everything below `xs`.
 */
export type Breakpoint = ResponsiveBreakpoint;

export interface HeaderConfig {
  height: ResponsiveSize;
  /** Hide the header: `AppShell.Header` renders nothing and reserves no height. @default false */
  collapsed?: boolean;
  /**
   * Whether the main content starts below the header. `false` lets content run
   * underneath it (e.g. a translucent header over a hero image). @default true
   */
  offset?: boolean;
  /** Stacking order of `AppShell.Header`. @default theme.zIndices.header */
  zIndex?: number;
}

export interface NavbarConfig {
  width: ResponsiveSize;
  /**
   * Narrowest viewport at which the navbar is an inline rail (web). Below it the
   * navbar is an overlay drawer. Native apps always use the drawer. @default 'md'
   */
  breakpoint?: Breakpoint;
  /**
   * Initial state. `mobile: false` starts the drawer open; `desktop: true`
   * starts the desktop navbar collapsed to its rail (`startCollapsedDesktop`
   * takes precedence). The state resets when the viewport crosses `breakpoint`.
   */
  collapsed?: {
    mobile?: boolean;
    desktop?: boolean;
  };
  /**
   * Stacking order of the inline rail. @default theme.zIndices.sticky
   * (The drawer uses `theme.zIndices.overlay`, above the header; set
   * `AppShell.Navbar zIndex` to override both.)
   */
  zIndex?: number;
  collapsedWidth?: number;
  expandOnHover?: boolean;
  /**
   * When paired with `expandOnHover`, hovering the collapsed rail pushes the
   * main content aside (flexing the page) instead of overlaying it.
   * Defaults to `false` (overlay) to preserve existing behavior.
   */
  expandOnHoverPush?: boolean;
  /**
   * Auto-expand the navbar (start open, not a collapsed rail) once the viewport
   * reaches this breakpoint or wider, e.g. `'xl'`. Overrides
   * `startCollapsedDesktop` at/above the breakpoint; smaller desktops keep the
   * collapsed-with-hover behavior.
   */
  autoExpandBreakpoint?: Breakpoint;
  startCollapsedDesktop?: boolean;
}

export interface AsideConfig {
  width: ResponsiveSize;
  /** Narrowest viewport at which `collapsed.desktop` applies; below it `collapsed.mobile` does. @default 'md' */
  breakpoint?: Breakpoint;
  collapsed?: {
    /** @default true */
    mobile?: boolean;
    /** @default false */
    desktop?: boolean;
  };
  /** Stacking order of `AppShell.Aside`. @default theme.zIndices.sticky */
  zIndex?: number;
}

export interface FooterConfig {
  height: ResponsiveSize;
  /** Hide the footer: `AppShell.Footer` renders nothing and reserves no height. @default false */
  collapsed?: boolean;
  /** Whether the main content ends above the footer. `false` lets content run underneath it. @default true */
  offset?: boolean;
  /** Stacking order of `AppShell.Footer`. @default theme.zIndices.sticky */
  zIndex?: number;
}

export interface BottomNavConfig {
  height: ResponsiveSize;
  /** Only show the bottom navigation at mobile widths (and on native). @default true */
  showOnlyMobile?: boolean;
  /** Hide the bottom navigation. @default false */
  collapsed?: boolean;
  /** Stacking order of `AppShell.BottomNav`. @default theme.zIndices.sticky */
  zIndex?: number;
}

export interface LayoutVisibilityConfig {
  header?: boolean;
  navbar?: boolean;
  aside?: boolean;
  footer?: boolean;
  bottomNav?: boolean;
}

// Mobile navigation patterns
export interface MobileMenuConfig {
  type?: 'modal' | 'drawer' | 'fullscreen';
  animationType?: 'slide' | 'fade' | 'none';
  showBackdrop?: boolean;
  closeOnOutsidePress?: boolean;
  /** Open/close transition length in ms; `0` shows and hides instantly. @default 300 */
  transitionDuration?: number;
}

export interface StatusBarConfig {
  style?: 'auto' | 'light' | 'dark';
  backgroundColor?: string;
  translucent?: boolean;
  hidden?: boolean;
}

export type LayoutType = 'default' | 'alt' | 'mobile-bottom-nav' | 'mobile-tabs';

// Unified internal layout strategies used by context/layout calculators
export type LayoutStrategy =
  | 'desktop-default'
  | 'desktop-alt'
  | 'mobile-bottom-nav'
  | 'adaptive';

export interface AppShellProps extends BaseProps<ViewStyle> {
  /**
   * `'default'`: the header spans the full width and the navbar/aside sit
   * below it. `'alt'`: the navbar and aside span the full height and the
   * header sits between them. @default 'default'
   */
  layout?: 'default' | 'alt';
  header?: HeaderConfig;
  navbar?: NavbarConfig;
  aside?: AsideConfig;
  footer?: FooterConfig;
  bottomNav?: BottomNavConfig;
  showHeader?: boolean;
  /** Toggle rendering of individual autoLayout sections */
  layoutSections?: LayoutVisibilityConfig;
  /** Enable AppShell auto-composition. When true, AppShell will render its own Header/Navbar/Main/Footer/BottomBar using the provided content props instead of relying on children. */
  autoLayout?: boolean;
  /** Content to render inside AppShell.Header when autoLayout is enabled */
  headerContent?: React.ReactNode | (() => React.ReactNode);
  /** Content to render inside AppShell.Navbar when autoLayout is enabled */
  navbarContent?: React.ReactNode | (() => React.ReactNode);
  /** Content to render inside AppShell.Aside when autoLayout is enabled */
  asideContent?: React.ReactNode | (() => React.ReactNode);
  /** Content to render inside AppShell.Footer when autoLayout is enabled */
  footerContent?: React.ReactNode | (() => React.ReactNode);
  /** Items for a mobile bottom navigation bar when autoLayout is enabled */
  bottomNavItems?: BottomAppBarItem[];
  /** Additional props forwarded to BottomAppBar in autoLayout mode (items overridden by bottomNavItems) */
  bottomNavProps?: Partial<AppShellBottomNavProps>;
  mobileMenu?: MobileMenuConfig;
  /**
   * Take the shell's geometry from CSS custom properties rather than from the
   * breakpoint the JavaScript resolved. Web only, and a contract: the app must
   * inline the stylesheet `createAppShellCss` builds from the same config. It
   * exists for statically rendered apps, where the prerender has no viewport to
   * measure and every guess it makes lands as a layout shift and a hydration
   * mismatch on first paint. See `shellCssVars.ts`.
   * @default false
   */
  cssGeometry?: boolean;
  statusBar?: StatusBarConfig;
  /**
   * Padding inside the main content area: a spacing token (`'md'`), px
   * number, or a per-breakpoint object. @default no padding
   */
  padding?: ResponsiveSize;
  /** Default `withBorder` for every section. @default true */
  withBorder?: boolean;
  /** Stacking order for every section that doesn't set its own. @default each section's `theme.zIndices` layer */
  zIndex?: number;
  /** Navbar/content transition length in ms (`0` = instant). Reduced motion forces `0`. @default 200 */
  transitionDuration?: number;
  /**
   * CSS timing function for the navbar/content transitions: `'linear'`,
   * `'ease'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'` or `'cubic-bezier(…)'`.
   * @default a cubic ease-in-out
   */
  transitionTimingFunction?: string;
  disabled?: boolean;
  children: React.ReactNode;
  withSafeArea?: boolean;
  /** Maximum width for main content area to prevent stretching on wide screens */
  maxContentWidth?: number | string;
  /** Center content when maxContentWidth is set */
  centerContent?: boolean;
  /** Optional table of contents rendered at the end side of the main content */
  tableOfContents?: React.ReactNode;
  /** Hide the table of contents automatically on mobile breakpoints */
  hideTableOfContentsOnMobile?: boolean;
  /** Custom width for the table of contents column */
  tableOfContentsWidth?: number | string;
  /** Toggle border between content and table of contents */
  tableOfContentsWithBorder?: boolean;
}

/** Imperative navbar controls, from `useAppShellApi()`. */
export interface AppShellApi {
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleNavbar: () => void;
}

/** Resolved section sizes, from `useAppShellLayout()`. */
export interface AppShellLayoutValue {
  headerHeight: number | string;
  navbarWidth: number | string;
  asideWidth: number | string;
  footerHeight: number | string;
  bottomNavHeight: number | string;
}

export interface AppShellContextValue {
  headerHeight: number | string;
  navbarWidth: number | string;
  fullNavbarWidth: number | string;
  navbarCollapsedRailWidth: number | string;
  navbarExpandOnHover: boolean;
  /** Whether hover-expansion should push the main content instead of overlaying it. */
  navbarPushOnHover: boolean;
  /** Hover-expansion progress (0 = collapsed rail, 1 = fully expanded). */
  navbarHoverProgress: SharedValue<number>;
  asideWidth: number | string;
  footerHeight: number | string;
  bottomNavHeight: number | string;
  isNavbarCollapsed: boolean;
  isNavbarRail: boolean;
  isAsideCollapsed: boolean;
  /** Native, or a web viewport below `md`. */
  isMobile: boolean;
  breakpoint: Breakpoint;
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleNavbar: () => void;
  navbarOpen: boolean;
  /** Effective transition length in ms (`0` while reduced motion is on). */
  transitionDuration: number;
  /**
   * Emit the shell's geometry as `var(--pb-shell-*)` references instead of
   * resolved numbers. See `shellCssVars.ts`; web only, and only correct when
   * the app inlines the matching stylesheet.
   */
  cssGeometry: boolean;
  /**
   * The three values above as they should be *written into a style*: the same
   * numbers, or the `var()` references that stand in for them under
   * `cssGeometry`. Kept beside the numbers rather than replacing them because
   * the shell still does arithmetic with the numbers.
   */
  headerHeightStyle: number | string;
  navbarWidthStyle: number | string;
  contentBottomStyle: number | string;
}

// Configuration object consumed by layout calculator
export interface AppShellConfig {
  header?: HeaderConfig;
  navbar?: NavbarConfig;
  aside?: AsideConfig;
  footer?: FooterConfig;
  bottomNav?: BottomNavConfig;
  showHeader?: boolean;
  layoutSections?: LayoutVisibilityConfig;
}

/** Props shared by the shell's chrome sections. */
interface AppShellChromeProps extends BaseProps<ViewStyle> {
  children: React.ReactNode;
  /** Draw the hairline between this section and the content. @default AppShell `withBorder` */
  withBorder?: boolean;
  /** Stacking order; wins over the section config and the theme layer. */
  zIndex?: number;
  /** Accessible name of the section's landmark. */
  accessibilityLabel?: string;
}

/** `AppShell.Header` — rendered as the page's `banner` landmark. */
export type AppShellHeaderProps = AppShellChromeProps;

/** `AppShell.Navbar` — rendered as a `navigation` landmark. */
export interface AppShellNavbarProps extends AppShellChromeProps {
  /** Force the overlay drawer (`true`) or the inline rail (`false`). Defaults to the drawer below `navbar.breakpoint`. */
  drawerMode?: boolean;
  /** Accessible name of the navigation landmark. @default 'Main' */
  accessibilityLabel?: string;
}

/** `AppShell.Aside` — rendered as a `complementary` landmark. */
export type AppShellAsideProps = AppShellChromeProps;

/** `AppShell.Footer` — rendered as the page's `contentinfo` landmark. */
export type AppShellFooterProps = AppShellChromeProps;

export interface BottomAppBarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badgeCount?: number;
  onPress?: () => void; // per-item override
}

export interface AppShellBottomNavProps extends BaseProps<ViewStyle> {
  /** Provide custom children (legacy). If `items` provided, children are ignored. */
  children?: React.ReactNode;
  /** Structured items definition for standard navigation bar */
  items?: BottomAppBarItem[];
  /** Currently active item key */
  activeKey?: string;
  /** Callback when an item is pressed (fires after per-item onPress) */
  onItemPress?: (key: string) => void;
  /** Show labels under icons (default true). Items are still named for screen readers when hidden. */
  showLabels?: boolean;
  /** Visual variant */
  variant?: 'solid' | 'surface' | 'elevated' | 'translucent';
  /** Shadow strength for the `elevated` variant (Android-style elevation, 0–24). @default 4 */
  elevation?: number;
  /** Optional floating action button rendered centered & elevated */
  fab?: React.ReactNode;
  withBorder?: boolean;
  zIndex?: number;
  /** Accessible name of the bar's `navigation` landmark (BottomAppBar). */
  accessibilityLabel?: string;
}

export interface AppShellMainProps extends BaseProps<ViewStyle> {
  children: React.ReactNode;
  /** Element id (DOM `id` on web, `nativeID` on native). */
  id?: string;
  /** Landmark role. @default 'main' */
  role?: Role;
  /**
   * Maximum width of the content column inside the main area (the area itself
   * still fills the space between the chrome), to prevent stretching on wide screens.
   */
  maw?: number | string;
  /** Center content when `maw` is set */
  centerContent?: boolean;
  /** Table of contents content to show at the end side of the content */
  tableOfContents?: React.ReactNode;
  /** Hide table of contents on mobile */
  hideTocOnMobile?: boolean;
  /** Width of the table of contents sidebar */
  tocWidth?: number | string;
  /** Add border to table of contents */
  tocWithBorder?: boolean;
}

export interface AppShellSectionProps extends BaseProps<ViewStyle> {
  children: React.ReactNode;
  /** Take the remaining space of the navbar/aside. */
  grow?: boolean;
  /** Scroll the section's content when it overflows. */
  withScrollArea?: boolean;
}

export interface MobileMenuProps extends BaseProps<ViewStyle> {
  /** Whether the menu is open. */
  opened?: boolean;
  /** @deprecated Use `opened` instead. */
  visible?: boolean;
  /** Called when the menu asks to close (backdrop press, Escape, Android back). */
  onClose: () => void;
  children?: React.ReactNode;
  config?: MobileMenuConfig;
  /** Accessible name of the menu dialog. @default 'Menu' */
  accessibilityLabel?: string;
}

export interface StatusBarManagerProps extends StatusBarConfig {
  children?: React.ReactNode;
}
