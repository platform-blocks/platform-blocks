import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { factory, withStatics } from '../../core/factory/factory';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { isNative, isWeb } from '../../core/platform/flags';
import { webProps } from '../../core/platform/webProps';
import { useDirection } from '../../core/providers/DirectionProvider';
import { isBreakpointAtLeast } from '../../core/responsive';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeToken } from '../../core/theme/types';
import { getZIndex, type ZIndexLayer } from '../../core/theme/zIndices';
import { useStyleProps } from '../../core/utils/spacing';
import {
  AppShellApiContext,
  AppShellContext,
  AppShellInternalContext,
  AppShellLayoutContext,
  NavbarHoverProvider,
  type AppShellInternalValue,
} from './AppShellContext';
import { AppShellAside } from './AppShellAside';
import { AppShellBottomNav } from './AppShellBottomNav';
import { AppShellFooter } from './AppShellFooter';
import { AppShellHeader } from './AppShellHeader';
import { AppShellMain } from './AppShellMain';
import { AppShellNavbar } from './AppShellNavbar';
import { AppShellSection } from './AppShellSection';
import { BottomAppBar } from './BottomAppBar';
import { useBreakpoint } from './hooks/useBreakpoint';
import { resolveResponsiveRaw, resolveResponsiveValue } from './hooks/useResponsiveValue';
import { MobileMenu } from './MobileMenu';
import { APP_SHELL_CSS_VARS, appShellVar, isMobileBreakpoint } from './shellCssVars';
import { parseTimingFunction } from './shellUtils';
import { StatusBarManager } from './StatusBarManager';
import type {
  AppShellApi,
  AppShellContextValue,
  AppShellLayoutValue,
  AppShellProps,
  Breakpoint,
  ResponsiveSize,
} from './types';

// Sub-components and hooks live in their own modules; re-exported here so
// `import { AppShellNavbar, useAppShell } from './AppShell'` keeps working.
export { AppShellHeader } from './AppShellHeader';
export { AppShellNavbar } from './AppShellNavbar';
export { AppShellAside } from './AppShellAside';
export { AppShellFooter } from './AppShellFooter';
export { AppShellBottomNav } from './AppShellBottomNav';
export { AppShellMain } from './AppShellMain';
export { AppShellSection } from './AppShellSection';
export { useAppShell, useAppShellApi, useAppShellLayout, useNavbarHover } from './AppShellContext';

const ROOT: ViewStyle = { flex: 1 };
const SAFE_AREA: ViewStyle = { flex: 1 };

const renderContent = (content: React.ReactNode | (() => React.ReactNode)): React.ReactNode =>
  typeof content === 'function' ? content() : content;

/** `padding` at one breakpoint, in px: numbers pass through, tokens resolve through `theme.spacing`. */
const resolveMainPadding = (
  theme: PlocksTheme,
  padding: ResponsiveSize | undefined,
  breakpoint: Breakpoint
): number | undefined => {
  if (padding === undefined) return undefined;
  const raw = resolveResponsiveRaw(padding, breakpoint);
  if (raw === undefined) return undefined;
  if (typeof raw === 'number') return raw;
  if (/^\s*-?[0-9.]/.test(raw)) return parseFloat(raw) || 0;
  const resolved = resolveSpacing(theme, raw as SizeToken);
  return resolved === 'auto' ? undefined : resolved;
};

// Main AppShell component
function AppShellBase(props: AppShellProps, ref: React.Ref<View>) {
  const {
    layout = 'default',
    header,
    navbar,
    aside,
    footer,
    bottomNav,
    showHeader = true,
    layoutSections,
    autoLayout,
    headerContent,
    navbarContent,
    asideContent,
    footerContent,
    bottomNavItems,
    bottomNavProps,
    mobileMenu,
    cssGeometry: cssGeometryProp = false,
    statusBar,
    padding,
    withBorder = true,
    zIndex,
    transitionDuration: transitionDurationProp = 200,
    transitionTimingFunction,
    disabled = false,
    children,
    withSafeArea = true,
    style,
    testID,
    maxContentWidth,
    centerContent,
    tableOfContents,
    hideTableOfContentsOnMobile = true,
    tableOfContentsWidth = 280,
    tableOfContentsWithBorder = true,
  } = props;

  const resolvedCenterContent = centerContent ?? Boolean(maxContentWidth);

  const theme = useTheme();
  const chrome = shellChrome(theme);
  const spacingStyles = useStyleProps(props);
  const breakpoint = useBreakpoint();
  const reducedMotion = useReducedMotion();
  const { dir } = useDirection();

  // Reduced motion: every shell transition becomes instant.
  const transitionDuration = reducedMotion ? 0 : transitionDurationProp;
  const easing = useMemo(() => parseTimingFunction(transitionTimingFunction), [transitionTimingFunction]);
  const cssTimingFunction = transitionTimingFunction ?? 'ease-in-out';

  // Native is always "mobile"; on web, below `md` (the theme's breakpoint table).
  const isMobile = isNative || isMobileBreakpoint(breakpoint);

  const headerConfig = (layoutSections?.header ?? true) && showHeader ? header : undefined;
  const navbarConfig = (layoutSections?.navbar ?? true) ? navbar : undefined;
  const asideConfig = (layoutSections?.aside ?? true) ? aside : undefined;
  const footerConfig = (layoutSections?.footer ?? true) ? footer : undefined;
  const bottomNavConfig = (layoutSections?.bottomNav ?? true) ? bottomNav : undefined;

  const headerCollapsed = !!headerConfig?.collapsed;
  const footerCollapsed = !!footerConfig?.collapsed;

  // Calculate resolved dimensions
  const headerHeight = headerConfig && !headerCollapsed ? resolveResponsiveValue(headerConfig.height, breakpoint) : 0;
  const footerHeight = footerConfig && !footerCollapsed ? resolveResponsiveValue(footerConfig.height, breakpoint) : 0;
  const bottomNavShown = !bottomNavConfig?.collapsed && (isMobile || bottomNavConfig?.showOnlyMobile === false);
  const bottomNavHeight = bottomNavConfig && bottomNavShown ? resolveResponsiveValue(bottomNavConfig.height, breakpoint) : 0;

  // Navbar: an overlay drawer on native and below `navbar.breakpoint`, else an inline rail.
  const hasNavbar = !!navbarConfig;
  const navbarIsDrawer = isNative || !isBreakpointAtLeast(breakpoint, navbarConfig?.breakpoint ?? 'md');

  // Desired desktop open state: expanded unless it starts collapsed — but always
  // once the viewport has reached `autoExpandBreakpoint` (e.g. auto-expand the
  // rail on xl screens while keeping it collapsed-with-hover on smaller desktops).
  const autoExpandBreakpoint = navbarConfig?.autoExpandBreakpoint;
  const desktopNavbarOpen =
    hasNavbar &&
    ((autoExpandBreakpoint !== undefined && isBreakpointAtLeast(breakpoint, autoExpandBreakpoint)) ||
      !(navbarConfig?.startCollapsedDesktop ?? navbarConfig?.collapsed?.desktop ?? false));
  const mobileNavbarOpen = hasNavbar && navbarConfig?.collapsed?.mobile === false;
  const initialNavbarOpen = navbarIsDrawer ? mobileNavbarOpen : desktopNavbarOpen;

  // The open state resets to its initial value whenever the navbar mode or the
  // initial value changes (crossing a breakpoint, adding/removing the navbar) —
  // computed during render, so there is no frame with the stale state.
  const navbarResetKey = `${hasNavbar}:${navbarIsDrawer}:${initialNavbarOpen}`;
  const [navbarState, setNavbarState] = useState(() => ({ key: navbarResetKey, open: initialNavbarOpen }));
  let navbarOpen = navbarState.open;
  if (navbarState.key !== navbarResetKey) {
    navbarOpen = initialNavbarOpen;
    setNavbarState({ key: navbarResetKey, open: initialNavbarOpen });
  }
  const setNavbarOpen = useCallback(
    (next: (open: boolean) => boolean) =>
      setNavbarState((state) => {
        const open = next(state.open);
        return open === state.open ? state : { ...state, open };
      }),
    []
  );
  const openNavbar = useCallback(() => setNavbarOpen(() => true), [setNavbarOpen]);
  const closeNavbar = useCallback(() => setNavbarOpen(() => false), [setNavbarOpen]);
  const toggleNavbar = useCallback(() => setNavbarOpen((open) => !open), [setNavbarOpen]);

  // Calculate navbar state (desktop inline vs mobile drawer)
  const fullNavbarWidth = navbarConfig ? resolveResponsiveValue(navbarConfig.width, breakpoint) : 0;
  const navbarWidthRaw = navbarConfig ? resolveResponsiveRaw(navbarConfig.width, breakpoint) : undefined;
  const railWidth = navbarConfig?.collapsedWidth ?? 72;
  const isNavbarCollapsed = navbarConfig
    ? navbarIsDrawer
      ? true // drawer mode renders separately when open
      : !navbarOpen // desktop inline collapse controlled by navbarOpen
    : true;
  // Layout width (space reserved for navbar). On desktop we reserve rail width when collapsed.
  const navbarWidth = navbarConfig
    ? navbarIsDrawer
      ? 0 // drawer overlays content
      : navbarOpen
        ? fullNavbarWidth
        : railWidth
    : 0;

  // Hover-expansion: when `expandOnHoverPush` is enabled the collapsed rail
  // pushes the main content aside (flexing the page) instead of overlaying it.
  // The navbar mirrors its hover progress into this shared value for anything
  // animating alongside it.
  const navbarHoverProgress = useSharedValue(0);
  const navbarExpandOnHover = navbarConfig?.expandOnHover ?? true;
  const navbarPushOnHover = Boolean(navbarConfig && !navbarIsDrawer && navbarExpandOnHover && navbarConfig.expandOnHoverPush);

  // Calculate aside state
  const asideIsMobile = isNative || !isBreakpointAtLeast(breakpoint, asideConfig?.breakpoint ?? 'md');
  const isAsideCollapsed = asideConfig
    ? asideIsMobile
      ? asideConfig.collapsed?.mobile ?? true
      : asideConfig.collapsed?.desktop ?? false
    : true;
  const asideWidth = asideConfig && !isAsideCollapsed ? resolveResponsiveValue(asideConfig.width, breakpoint) : 0;

  // Geometry the browser resolves rather than the breakpoint hook. Only on web,
  // and only when the app asked for it — see `shellCssVars.ts` for why a
  // statically rendered app needs this and what it owes in return.
  const cssGeometry = cssGeometryProp && isWeb;

  // Fallbacks inside the `var()` have to be viewport-independent, or the
  // prerender and the client emit different strings and we are back to the
  // mismatch this exists to remove. `base` is that value.
  const headerHeightBase = headerConfig && !headerCollapsed ? resolveResponsiveValue(headerConfig.height, 'base') : 0;
  const footerHeightBase = footerConfig && !footerCollapsed ? resolveResponsiveValue(footerConfig.height, 'base') : 0;
  const bottomNavHeightBase = bottomNavConfig ? resolveResponsiveValue(bottomNavConfig.height, 'base') : 0;
  const contentBottomBase = bottomNavConfig ? bottomNavHeightBase : footerHeightBase;

  const headerOffset = headerConfig?.offset !== false;
  const footerOffset = footerConfig?.offset !== false;
  const contentTop = headerOffset ? headerHeight : 0;
  const contentBottom = bottomNavShown && bottomNavHeight > 0 ? bottomNavHeight : isMobile ? 0 : footerOffset ? footerHeight : 0;

  const headerHeightStyle = cssGeometry ? appShellVar(APP_SHELL_CSS_VARS.headerHeight, headerHeightBase) : headerHeight;
  const navbarWidthStyle = cssGeometry ? appShellVar(APP_SHELL_CSS_VARS.navbarWidth, 0) : navbarWidth;
  const contentBottomStyle = cssGeometry ? appShellVar(APP_SHELL_CSS_VARS.contentBottom, contentBottomBase) : contentBottom;
  const contentTopStyle = headerOffset ? headerHeightStyle : 0;

  const mainPadding = resolveMainPadding(theme, padding, breakpoint);

  const contextValue = useMemo<AppShellContextValue>(
    () => ({
      headerHeight,
      navbarWidth,
      asideWidth,
      footerHeight,
      bottomNavHeight,
      cssGeometry,
      headerHeightStyle,
      navbarWidthStyle,
      contentBottomStyle,
      isNavbarCollapsed,
      isNavbarRail: !navbarIsDrawer && hasNavbar && !navbarOpen,
      isAsideCollapsed,
      isMobile,
      breakpoint,
      openNavbar,
      closeNavbar,
      toggleNavbar,
      navbarOpen,
      transitionDuration,
      fullNavbarWidth,
      navbarCollapsedRailWidth: railWidth,
      navbarExpandOnHover,
      navbarPushOnHover,
      navbarHoverProgress,
    }),
    [
      headerHeight,
      navbarWidth,
      asideWidth,
      footerHeight,
      bottomNavHeight,
      cssGeometry,
      headerHeightStyle,
      navbarWidthStyle,
      contentBottomStyle,
      isNavbarCollapsed,
      navbarIsDrawer,
      hasNavbar,
      navbarOpen,
      isAsideCollapsed,
      isMobile,
      breakpoint,
      openNavbar,
      closeNavbar,
      toggleNavbar,
      transitionDuration,
      fullNavbarWidth,
      railWidth,
      navbarExpandOnHover,
      navbarPushOnHover,
      navbarHoverProgress,
    ]
  );

  // Memoized selector payloads for re-render isolation
  const apiValue = useMemo<AppShellApi>(
    () => ({ openNavbar, closeNavbar, toggleNavbar }),
    [openNavbar, closeNavbar, toggleNavbar]
  );
  const layoutValue = useMemo<AppShellLayoutValue>(
    () => ({ headerHeight, navbarWidth, asideWidth, footerHeight, bottomNavHeight }),
    [headerHeight, navbarWidth, asideWidth, footerHeight, bottomNavHeight]
  );

  // Section z-index: the section's prop > its config > the shell's `zIndex` > the theme layer.
  const layerFor = (configured: number | undefined, layer: ZIndexLayer) => configured ?? zIndex ?? getZIndex(theme, layer);
  const zHeader = layerFor(header?.zIndex, 'header');
  const zNavbar = layerFor(navbar?.zIndex, 'sticky');
  // `navbar.zIndex` is the rail's; the drawer overlays the other sections (incl. the header).
  const zDrawer = layerFor(undefined, 'overlay');
  const zAside = layerFor(aside?.zIndex, 'sticky');
  const zFooter = layerFor(footer?.zIndex, 'sticky');
  const zBottomNav = layerFor(bottomNav?.zIndex, 'sticky');
  const zToc = layerFor(undefined, 'sticky');

  const internalValue = useMemo<AppShellInternalValue>(
    () => ({
      layout,
      withBorder,
      zIndices: {
        header: zHeader,
        navbar: zNavbar,
        drawer: zDrawer,
        aside: zAside,
        footer: zFooter,
        bottomNav: zBottomNav,
        toc: zToc,
      },
      navbarIsDrawer,
      navbarWidthRaw,
      headerCollapsed,
      footerCollapsed,
      bottomNavShown,
      contentTop,
      contentTopStyle,
      contentBottom,
      mainPadding,
      easing,
      cssTimingFunction,
    }),
    [
      layout,
      withBorder,
      zHeader,
      zNavbar,
      zDrawer,
      zAside,
      zFooter,
      zBottomNav,
      zToc,
      navbarIsDrawer,
      navbarWidthRaw,
      headerCollapsed,
      footerCollapsed,
      bottomNavShown,
      contentTop,
      contentTopStyle,
      contentBottom,
      mainPadding,
      easing,
      cssTimingFunction,
    ]
  );

  // `bg` arrives through `spacingStyles`, over the canvas default.
  const containerStyle = [ROOT, { backgroundColor: chrome.canvas }, spacingStyles, style];
  const safeAreaBackground = StyleSheet.flatten(containerStyle).backgroundColor ?? theme.backgrounds.base;
  // Web: hand the direction to react-native-web so the sections' logical
  // `start`/`end` styles resolve against it (native: I18nManager does this).
  const directionProps = webProps({ dir });

  if (disabled) {
    return (
      <StatusBarManager {...statusBar}>
        <View ref={ref} style={containerStyle} testID={testID} {...directionProps}>
          {children}
        </View>
      </StatusBarManager>
    );
  }

  // Check if we need to replace navbar with mobile menu for mobile platforms
  const shouldUseMobileMenu = isMobile && !!navbarConfig && !!mobileMenu && isNative;

  const content = (
    <AppShellApiContext.Provider value={apiValue}>
      <AppShellLayoutContext.Provider value={layoutValue}>
        <AppShellContext.Provider value={contextValue}>
          <AppShellInternalContext.Provider value={internalValue}>
            <NavbarHoverProvider>
              <StatusBarManager {...statusBar}>
                <View ref={ref} style={containerStyle} testID={testID} {...directionProps}>
                  {autoLayout ? (
                    <>
                      {/* Header */}
                      {headerConfig && <AppShellHeader>{renderContent(headerContent)}</AppShellHeader>}

                      {/* Navbar (inline or drawer based on breakpoint) */}
                      {navbarConfig && <AppShellNavbar>{renderContent(navbarContent)}</AppShellNavbar>}

                      {/* Aside */}
                      {asideConfig && <AppShellAside>{renderContent(asideContent)}</AppShellAside>}

                      {/* Main */}
                      <AppShellMain
                        maw={maxContentWidth}
                        centerContent={resolvedCenterContent}
                        tableOfContents={tableOfContents}
                        hideTocOnMobile={hideTableOfContentsOnMobile}
                        tocWidth={tableOfContentsWidth}
                        tocWithBorder={tableOfContentsWithBorder}
                      >
                        {children}
                      </AppShellMain>

                      {/* Footer (desktop) */}
                      {footerConfig && !isMobile && <AppShellFooter>{renderContent(footerContent)}</AppShellFooter>}

                      {/* Bottom mobile nav */}
                      {bottomNavConfig && bottomNavShown && (bottomNavItems?.length || bottomNavProps) && (
                        <BottomAppBar {...bottomNavProps} items={bottomNavItems} withBorder={withBorder} />
                      )}
                    </>
                  ) : (
                    children
                  )}
                </View>
                {/* Mobile Menu Modal - only render if configured and on mobile */}
                {shouldUseMobileMenu && (
                  <MobileMenu opened={navbarOpen} onClose={closeNavbar} config={mobileMenu}>
                    {/* Extract navbar content for mobile menu */}
                    {React.Children.toArray(children).find(
                      (child) => React.isValidElement(child) && child.type === AppShellNavbar
                    )}
                  </MobileMenu>
                )}
              </StatusBarManager>
            </NavbarHoverProvider>
          </AppShellInternalContext.Provider>
        </AppShellContext.Provider>
      </AppShellLayoutContext.Provider>
    </AppShellApiContext.Provider>
  );

  if (withSafeArea) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[SAFE_AREA, { backgroundColor: safeAreaBackground }]}>{content}</SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return content;
}

const AppShellRoot = factory<{ props: AppShellProps; ref: View }>(AppShellBase, { displayName: 'AppShell' });

/**
 * Application layout: header, navbar (inline rail on desktop, drawer on
 * mobile), aside, main content, footer and mobile bottom navigation, with the
 * geometry resolved per breakpoint from the theme's breakpoint table.
 */
export const AppShell = withStatics(AppShellRoot, {
  Header: AppShellHeader,
  Navbar: AppShellNavbar,
  Aside: AppShellAside,
  Footer: AppShellFooter,
  BottomNav: AppShellBottomNav,
  BottomAppBar,
  Main: AppShellMain,
  Section: AppShellSection,
  MobileMenu,
  StatusBarManager,
});
