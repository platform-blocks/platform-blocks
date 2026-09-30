import React, { createContext, useContext, useMemo } from 'react';
import type { EasingFunction, EasingFunctionFactory } from 'react-native-reanimated';

import { useHover, type UseHoverHandlers } from '../../hooks/useHover/useHover';
import type { AppShellApi, AppShellContextValue, AppShellLayoutValue } from './types';

export const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);
// Split contexts to minimize re-renders in hot components
export const AppShellApiContext = createContext<AppShellApi | undefined>(undefined);
export const AppShellLayoutContext = createContext<AppShellLayoutValue | undefined>(undefined);

/**
 * Returns the full state of the enclosing `AppShell` — resolved section sizes,
 * navbar open/collapsed/rail flags, the current `breakpoint` and `isMobile`,
 * and the `openNavbar` / `closeNavbar` / `toggleNavbar` controls — and throws
 * when called outside an `AppShell`.
 *
 * It re-renders on every shell change; components that only need the navbar
 * controls or the section sizes should use `useAppShellApi()` or
 * `useAppShellLayout()` instead.
 */
export const useAppShell = (): AppShellContextValue => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within an AppShell component');
  }
  return context;
};

/**
 * Returns just the enclosing `AppShell`'s navbar controls (`openNavbar`,
 * `closeNavbar`, `toggleNavbar`) — for menu buttons and links that drive the
 * navbar without re-rendering on layout changes — and throws when called
 * outside an `AppShell`.
 */
export const useAppShellApi = (): AppShellApi => {
  const api = useContext(AppShellApiContext);
  if (!api) throw new Error('useAppShellApi must be used within an AppShell component');
  return api;
};

/**
 * Returns just the enclosing `AppShell`'s resolved section sizes
 * (`headerHeight`, `navbarWidth`, `asideWidth`, `footerHeight`,
 * `bottomNavHeight`) — for content that has to position itself around the
 * shell chrome — and throws when called outside an `AppShell`.
 */
export const useAppShellLayout = (): AppShellLayoutValue => {
  const layout = useContext(AppShellLayoutContext);
  if (!layout) throw new Error('useAppShellLayout must be used within an AppShell component');
  return layout;
};

// ---------------------------------------------------------------------------
// Internal: section settings the root resolves once for its sections
// ---------------------------------------------------------------------------

/** Resolved stacking order per section. */
export interface AppShellSectionZIndices {
  header: number;
  navbar: number;
  drawer: number;
  aside: number;
  footer: number;
  bottomNav: number;
  toc: number;
}

/** @internal Settings the shell's own sections read; not part of the public context. */
export interface AppShellInternalValue {
  layout: 'default' | 'alt';
  withBorder: boolean;
  zIndices: AppShellSectionZIndices;
  /** The navbar is an overlay drawer (native, or below `navbar.breakpoint`). */
  navbarIsDrawer: boolean;
  /** The configured navbar width at the current breakpoint, unparsed (`'100%'` stays a string). */
  navbarWidthRaw: number | string | undefined;
  headerCollapsed: boolean;
  footerCollapsed: boolean;
  /** Whether `AppShell.BottomNav` shows at the current width. */
  bottomNavShown: boolean;
  /** Top of the content area in px (0 when `header.offset === false`), before safe-area insets. */
  contentTop: number;
  /** `contentTop` as a style value (a `var()` under `cssGeometry`). */
  contentTopStyle: number | string;
  /** Bottom of the content area in px, before safe-area insets. */
  contentBottom: number;
  /** Resolved `padding` of the main content, in px. */
  mainPadding: number | undefined;
  /** Easing for the navbar/content transitions (`undefined` = the shell's default curve). */
  easing: EasingFunction | EasingFunctionFactory | undefined;
  /** The same curve as a CSS timing function, for web transitions. */
  cssTimingFunction: string;
}

export const AppShellInternalContext = createContext<AppShellInternalValue | undefined>(undefined);

/** @internal The shell's section settings, or `undefined` outside an AppShell. */
export const useAppShellInternal = (): AppShellInternalValue | undefined => useContext(AppShellInternalContext);

// ---------------------------------------------------------------------------
// Navbar hover
// ---------------------------------------------------------------------------

/**
 * Whether the pointer is over the navbar rail (only tracked while
 * `navbar.expandOnHover` is on, on web). Kept in its own context so hovering
 * re-renders only the components that read it — never the page subtree.
 */
const NavbarHoverContext = createContext(false);
const NavbarHoverHandlersContext = createContext<UseHoverHandlers | undefined>(undefined);

/**
 * Returns `true` while the pointer is over the `AppShell` navbar rail (web,
 * with `navbar.expandOnHover` on) and `false` otherwise, including outside an
 * `AppShell` — for navbar content that should show its labels only while the
 * collapsed rail is hover-expanded.
 */
export const useNavbarHover = (): boolean => useContext(NavbarHoverContext);

/** @internal Hover handlers the navbar rail spreads onto its root. */
export const useNavbarHoverHandlers = (): UseHoverHandlers | undefined => useContext(NavbarHoverHandlersContext);

/**
 * Owns the navbar hover state. Rendered by AppShell around its content; its
 * `children` element is created by AppShell, so a hover change re-renders only
 * the hover context's consumers.
 */
export function NavbarHoverProvider({ children }: { children?: React.ReactNode }) {
  const [hovered, handlers] = useHover();
  const { onHoverIn, onHoverOut, onMouseEnter, onMouseLeave } = handlers;
  const stableHandlers = useMemo<UseHoverHandlers>(
    () => ({ onHoverIn, onHoverOut, onMouseEnter, onMouseLeave }),
    [onHoverIn, onHoverOut, onMouseEnter, onMouseLeave]
  );
  return (
    <NavbarHoverHandlersContext.Provider value={stableHandlers}>
      <NavbarHoverContext.Provider value={hovered}>{children}</NavbarHoverContext.Provider>
    </NavbarHoverHandlersContext.Provider>
  );
}

/**
 * How far hover-push moves the content (and, in the `alt` layout, the header)
 * past the rail right now: the expanded width minus the rail while the pointer
 * is over a collapsed, push-mode rail; otherwise 0. Always 0 under
 * `cssGeometry`, where the stylesheet variable does the pushing.
 */
export function useNavbarPushOffset(): number {
  const hovered = useNavbarHover();
  const shell = useContext(AppShellContext);
  const internal = useAppShellInternal();
  if (!hovered || !shell || !internal) return 0;
  if (!shell.navbarPushOnHover || shell.navbarOpen || shell.cssGeometry || internal.navbarIsDrawer) return 0;
  const full = typeof shell.fullNavbarWidth === 'number' ? shell.fullNavbarWidth : 0;
  const rail = typeof shell.navbarCollapsedRailWidth === 'number' ? shell.navbarCollapsedRailWidth : 0;
  return Math.max(0, full - rail);
}
