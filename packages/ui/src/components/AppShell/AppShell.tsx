import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react';
import { View, ViewStyle, Platform, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, interpolate, Easing } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { getSpacingStyles, extractSpacingProps, useMergedRef } from '../../core/utils';
import { useDirection } from '../../core/providers/DirectionProvider';
import type {
  AppShellProps,
  AppShellContextValue,
  AppShellHeaderProps,
  AppShellNavbarProps,
  AppShellAsideProps,
  AppShellFooterProps,
  AppShellBottomNavProps,
  AppShellMainProps,
  AppShellSectionProps
} from './types';
import { useBreakpoint } from './hooks/useBreakpoint';
import { resolveResponsiveValue } from './hooks/useResponsiveValue';
import { MobileMenu } from './MobileMenu';
import { APP_SHELL_CSS_VARS, appShellVar, appShellVarPlus } from './shellCssVars';
import { BottomAppBar } from './BottomAppBar';
import { StatusBarManager } from './StatusBarManager';

// (Breakpoint + responsive value utilities moved to hooks/)

// Enhanced AppShell context for accessing layout values (type imported)

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);
// Split contexts to minimize re-renders in hot components
type AppShellApi = { openNavbar: () => void; closeNavbar: () => void; toggleNavbar: () => void };
type AppShellLayout = { headerHeight: number | string; navbarWidth: number | string; asideWidth: number | string; footerHeight: number | string; bottomNavHeight: number | string };
const AppShellApiContext = createContext<AppShellApi | undefined>(undefined);
const AppShellLayoutContext = createContext<AppShellLayout | undefined>(undefined);
// Local (navbar-only) hover expansion context so descendants can reveal labels without causing full app re-render
const NavbarHoverContext = createContext(false);
export const useNavbarHover = () => useContext(NavbarHoverContext);

export const useAppShell = () => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within an AppShell component');
  }
  return context;
};

export const useAppShellApi = (): AppShellApi => {
  const api = useContext(AppShellApiContext);
  if (!api) throw new Error('useAppShellApi must be used within an AppShell component');
  return api;
};

export const useAppShellLayout = (): AppShellLayout => {
  const layout = useContext(AppShellLayoutContext);
  if (!layout) throw new Error('useAppShellLayout must be used within an AppShell component');
  return layout;
};

// Component for header
export const AppShellHeader = React.forwardRef<View, AppShellHeaderProps>(({
  children,
  withBorder = true,
  zIndex,
  style,
}, ref) => {
  const theme = useTheme();
  const chrome = shellChrome(theme);
  const { headerHeightStyle } = useAppShell();

  return (
    <View
      ref={ref}
      style={[
        {
          height: headerHeightStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: chrome.background,
          zIndex: zIndex || 1000,
          borderBottomWidth: withBorder ? 1 : 0,
          borderBottomColor: chrome.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

AppShellHeader.displayName = 'AppShellHeader';

const BREAKPOINT_ORDER = ['base', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

// True when the current breakpoint is at least as wide as `target`.
const isBreakpointAtLeast = (current: string, target?: string): boolean => {
  if (!target) return false;
  const ci = BREAKPOINT_ORDER.indexOf(current as (typeof BREAKPOINT_ORDER)[number]);
  const ti = BREAKPOINT_ORDER.indexOf(target as (typeof BREAKPOINT_ORDER)[number]);
  if (ci === -1 || ti === -1) return false;
  return ci >= ti;
};

const coerceNumber = (val: any, fallback: number): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.endsWith('%')) return fallback;
    const parsed = parseFloat(trimmed.replace(/[^0-9.\-]/g, ''));
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

// Component for navbar
export const AppShellNavbar = React.forwardRef<View, AppShellNavbarProps>(({
  children,
  withBorder = true,
  zIndex,
  style,
  drawerMode,
}, ref) => {
  const theme = useTheme();
  const chrome = shellChrome(theme);
  const { isRTL } = useDirection();
  const { navbarWidth, fullNavbarWidth, headerHeight, footerHeight, isNavbarCollapsed, isMobile, navbarOpen, closeNavbar, transitionDuration, navbarCollapsedRailWidth, navbarExpandOnHover, navbarPushOnHover, navbarHoverProgress, cssGeometry, headerHeightStyle, navbarWidthStyle, contentBottomStyle } = useAppShell();
  const { width: windowWidth } = useWindowDimensions();
  const [hovering, setHovering] = React.useState(false);

  // Determine effective drawer mode: mobile defaults to overlay.
  //
  // Under `cssGeometry` it never does. The drawer and the inline rail are
  // different markup, and picking between them from the breakpoint is exactly
  // the guess a prerender cannot make — so the rail is what renders at every
  // width and the stylesheet hides it where it doesn't belong. Apps that want a
  // drawer under it supply their own (the docs site does).
  const effectiveDrawer = drawerMode ?? (cssGeometry ? false : isMobile);

  const railWidth = React.useMemo(() => coerceNumber(navbarCollapsedRailWidth, 72), [navbarCollapsedRailWidth]);
  const targetExpandedWidth = React.useMemo(() => coerceNumber(fullNavbarWidth, 240), [fullNavbarWidth]);

  // Animated value controls slide/width. `transitionDuration={0}` means "no
  // transition": assign the target directly instead of timing over 0ms.
  const animateTo = React.useCallback(
    (shared: { value: number }, next: number, easing: (t: number) => number) => {
      if (transitionDuration <= 0) {
        shared.value = next;
        return;
      }
      shared.value = withTiming(next, { duration: transitionDuration, easing });
    },
    [transitionDuration]
  );

  const progress = useSharedValue(navbarOpen ? 1 : 0);
  React.useEffect(() => {
    animateTo(progress, navbarOpen ? 1 : 0, Easing.inOut(Easing.cubic));
  }, [navbarOpen, animateTo, progress]);

  const widthValue = useSharedValue<number>(navbarOpen ? targetExpandedWidth : railWidth);
  React.useEffect(() => {
    if (effectiveDrawer) return;
    const next = navbarOpen ? targetExpandedWidth : railWidth;
    animateTo(widthValue, next, Easing.inOut(Easing.cubic));
  }, [effectiveDrawer, navbarOpen, targetExpandedWidth, railWidth, animateTo, widthValue]);

  React.useEffect(() => {
    if (effectiveDrawer) return;
    if (!navbarExpandOnHover || navbarOpen) return;
    const next = hovering ? targetExpandedWidth : railWidth;
    animateTo(widthValue, next, Easing.out(Easing.cubic));
  }, [effectiveDrawer, hovering, navbarOpen, navbarExpandOnHover, targetExpandedWidth, railWidth, animateTo, widthValue]);

  // Push mode: mirror the hover state into the shared progress value so the
  // main content can flex alongside the expanding rail (0 = rail, 1 = expanded).
  React.useEffect(() => {
    if (effectiveDrawer || !navbarPushOnHover) return;
    const next = (hovering && !navbarOpen) ? 1 : 0;
    animateTo(navbarHoverProgress, next, Easing.out(Easing.cubic));
  }, [effectiveDrawer, navbarPushOnHover, hovering, navbarOpen, animateTo, navbarHoverProgress]);

  const widthAnimatedStyles = useAnimatedStyle(() => ({ width: widthValue.value }), [widthValue]);
  const contentAnimatedStyles = useAnimatedStyle(() => ({
    height: '100%',
    opacity: 1,
    transform: [{ translateX: 0 }],
  }));

  const drawerWidth = React.useMemo(() => {
    const raw = fullNavbarWidth;

    if (typeof raw === 'number') {
      return raw || 280;
    }

    if (typeof raw === 'string') {
      const normalized = raw.trim().toLowerCase();

      if (normalized === 'screen' || normalized === 'full' || normalized === '100%' || normalized === '100vw') {
        return windowWidth;
      }

      const percentMatch = normalized.match(/^([0-9]+(?:\.[0-9]+)?)%$/);
      if (percentMatch) {
        const percent = parseFloat(percentMatch[1]);
        if (!Number.isNaN(percent)) {
          return (percent / 100) * windowWidth;
        }
      }

      const vwMatch = normalized.match(/^([0-9]+(?:\.[0-9]+)?)vw$/);
      if (vwMatch) {
        const vw = parseFloat(vwMatch[1]);
        if (!Number.isNaN(vw)) {
          return (vw / 100) * windowWidth;
        }
      }
    }

    const coerced = coerceNumber(raw, 280);
    return coerced || 280;
  }, [fullNavbarWidth, windowWidth]);
  const drawerAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-drawerWidth, 0]) }],
  }), [drawerWidth, progress]);
  const backdropAnimatedStyles = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.35]),
  }), [progress]);

  const navAccessibilityProps: any = {
    accessibilityElementsHidden: !navbarOpen,
    importantForAccessibility: navbarOpen ? 'auto' : 'no-hide-descendants',
  };

  // Under `cssGeometry` the rail's width and the content's offset are the same
  // custom property, so expanding on hover is one assignment and the browser
  // moves both together. Writing a property beats animating two values that
  // then have to be kept in step — and it never re-renders the page subtree.
  React.useEffect(() => {
    if (!cssGeometry || typeof document === 'undefined') return;
    if (!navbarExpandOnHover || effectiveDrawer) return;
    const root = document.documentElement;
    const expand = hovering && !navbarOpen && navbarPushOnHover;
    if (expand) {
      root.style.setProperty(APP_SHELL_CSS_VARS.navbarWidth, `${targetExpandedWidth}px`);
    } else {
      // Removing rather than setting a value hands the variable back to the
      // stylesheet, so the media queries stay in charge of the resting width.
      root.style.removeProperty(APP_SHELL_CSS_VARS.navbarWidth);
    }
    return () => {
      root.style.removeProperty(APP_SHELL_CSS_VARS.navbarWidth);
    };
  }, [cssGeometry, hovering, navbarOpen, navbarExpandOnHover, navbarPushOnHover, effectiveDrawer, targetExpandedWidth]);

  const hoverHandlers: any = Platform.OS === 'web' && navbarExpandOnHover
    ? {
        onMouseEnter: () => setHovering(true),
        onMouseLeave: () => setHovering(false),
      }
    : {};

  const backdropAccessibilityProps: any = {
    accessibilityRole: 'button',
  };

  // Keep content always visible so icons show in rail mode

  // DESKTOP (inline collapse) ----------------------------------
  if (!effectiveDrawer) {
    // Always render (even when collapsed) so width can animate between rail and expanded
    if (fullNavbarWidth === 0) return null; // truly no navbar configured
    return (
      <Animated.View
        ref={ref}
        {...(cssGeometry ? ({ dataSet: { pbShellNavbar: 'true' } } as any) : {})}
        style={[
          {
            // height: '100%',
            position: 'absolute',
            top: cssGeometry ? headerHeightStyle : headerHeight,
            bottom: cssGeometry ? contentBottomStyle : footerHeight,
            ...(isRTL ? { right: 0 } : { left: 0 }),
            overflow: 'hidden',
            backgroundColor: chrome.background,
            zIndex: zIndex || 900,
            ...(isRTL ? {
              borderLeftWidth: withBorder ? 1 : 0,
              borderLeftColor: chrome.border,
            } : {
              borderRightWidth: withBorder ? 1 : 0,
              borderRightColor: chrome.border,
            }),
          },
          cssGeometry ? { width: navbarWidthStyle as any } : widthAnimatedStyles,
          style,
        ]}
        {...navAccessibilityProps}
        pointerEvents={'auto'}
        {...hoverHandlers}
      >
        <NavbarHoverContext.Provider value={hovering}>
          <Animated.View style={contentAnimatedStyles}>
            {children}
          </Animated.View>
        </NavbarHoverContext.Provider>
      </Animated.View>
    );
  }

  // MOBILE DRAWER ----------------------------------------------
  return (
    <>
      {/* Backdrop (kept mounted, pointer events only when open) */}
      <Animated.View
        {...backdropAccessibilityProps}
        onTouchEnd={closeNavbar}
        onStartShouldSetResponder={() => true}
        style={[{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,1)',
          zIndex: (zIndex || 900) - 1,
          pointerEvents: navbarOpen ? 'auto' : 'none',
        }, backdropAnimatedStyles]}
      />
      <Animated.View
        ref={ref}
        style={[
          {
            width: drawerWidth,
            position: 'absolute',
            top: 0, // cover header on mobile to differentiate appearance
            bottom: 0,
            ...(isRTL ? { right: 0 } : { left: 0 }),
            backgroundColor: chrome.background,
            zIndex: zIndex || 1000,
            ...(isRTL ? {
              borderLeftWidth: withBorder ? 1 : 0,
              borderLeftColor: chrome.border,
            } : {
              borderRightWidth: withBorder ? 1 : 0,
              borderRightColor: chrome.border,
            }),
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            pointerEvents: navbarOpen ? 'auto' : 'none'
          },
          drawerAnimatedStyles,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </>
  );
});

AppShellNavbar.displayName = 'AppShellNavbar';

// Component for aside (right panel)
export const AppShellAside = React.forwardRef<View, AppShellAsideProps>(({
  children,
  withBorder = true,
  zIndex,
  style,
}, ref) => {
  const theme = useTheme();
  const chrome = shellChrome(theme);
  const { isRTL } = useDirection();
  const { asideWidth, headerHeight, footerHeight, isAsideCollapsed } = useAppShell();

  if (isAsideCollapsed) return null;

  return (
    <View
      ref={ref}
      style={[
        {
          width: asideWidth,
          position: 'absolute',
          top: headerHeight,
          bottom: footerHeight,
          ...(isRTL ? { left: 0 } : { right: 0 }),
          backgroundColor: chrome.background,
          zIndex: zIndex || 900,
          ...(isRTL ? {
            borderRightWidth: withBorder ? 1 : 0,
            borderRightColor: chrome.border,
          } : {
            borderLeftWidth: withBorder ? 1 : 0,
            borderLeftColor: chrome.border,
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

AppShellAside.displayName = 'AppShellAside';

// Component for footer
export const AppShellFooter = React.forwardRef<View, AppShellFooterProps>(({
  children,
  withBorder = true,
  zIndex,
  style,
}, ref) => {
  const theme = useTheme();
  const chrome = shellChrome(theme);
  const { isRTL } = useDirection();
  const { footerHeight, navbarWidth, asideWidth } = useAppShell();

  return (
    <View
      ref={ref}
      style={[
        {
          height: footerHeight,
          position: 'absolute',
          bottom: 0,
          ...(isRTL ? {
            left: asideWidth,
            right: navbarWidth,
          } : {
            left: navbarWidth,
            right: asideWidth,
          }),
          backgroundColor: chrome.background,
          zIndex: zIndex || 800,
          borderTopWidth: withBorder ? 1 : 0,
          borderTopColor: chrome.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

AppShellFooter.displayName = 'AppShellFooter';

// Component for bottom navigation (mobile)
export const AppShellBottomNav = React.forwardRef<View, AppShellBottomNavProps>(({
  children,
  withBorder = true,
  zIndex,
  style,
}, ref) => {
  const theme = useTheme();
  const chrome = shellChrome(theme);
  const { bottomNavHeight, isMobile } = useAppShell();

  if (!isMobile) return null;

  return (
    <View
      ref={ref}
      style={[
        {
          height: bottomNavHeight,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: chrome.background,
          zIndex: zIndex || 1000,
          borderTopWidth: withBorder ? 1 : 0,
          borderTopColor: chrome.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

AppShellBottomNav.displayName = 'AppShellBottomNav';

// Component for main content
export const AppShellMain = React.forwardRef<View, AppShellMainProps>(({
  children,
  style,
  id,
  role,
  maxWidth,
  centerContent = true,
  tableOfContents,
  hideTocOnMobile = true,
  tocWidth = 280,
  tocWithBorder = true,
}, ref) => {
  const theme = useTheme();
  const chrome = shellChrome(theme);
  const { isRTL } = useDirection();
  const {
    headerHeight,
    footerHeight,
    navbarWidth,
    asideWidth,
    bottomNavHeight,
    isMobile,
    navbarPushOnHover,
    navbarHoverProgress,
    fullNavbarWidth,
    navbarCollapsedRailWidth,
    navbarOpen,
    cssGeometry,
    headerHeightStyle,
    navbarWidthStyle,
    contentBottomStyle,
  } = useAppShell();
  const insets = useSafeAreaInsets();

  const numericHeaderHeight = coerceNumber(headerHeight, 0);
  const numericFooterHeight = coerceNumber(footerHeight, 0);
  const numericNavbarWidth = coerceNumber(navbarWidth, 0);
  const numericAsideWidth = coerceNumber(asideWidth, 0);
  const numericBottomNavHeight = coerceNumber(bottomNavHeight, 0);
  const numericTocWidth = typeof tocWidth === 'number' ? tocWidth : coerceNumber(tocWidth, 280);

  const topInset = Platform.OS === 'web' ? 0 : insets.top || 0;
  const bottomInset = Platform.OS === 'web' ? 0 : insets.bottom || 0;

  // Calculate TOC width (0 if hidden on mobile or no TOC provided)
  const effectiveTocWidth = (hideTocOnMobile && isMobile) || !tableOfContents ? 0 : numericTocWidth;

  // Calculate content area dimensions - swap in RTL
  const contentLeft = isRTL 
    ? (isMobile ? 0 : numericAsideWidth + effectiveTocWidth)
    : (isMobile ? 0 : numericNavbarWidth);
  const contentRight = isRTL
    ? (isMobile ? 0 : numericNavbarWidth)
    : (isMobile ? 0 : numericAsideWidth + effectiveTocWidth);
  const contentTop = numericHeaderHeight + (isMobile ? topInset : 0);
  const contentBottom = (isMobile ? numericBottomNavHeight : numericFooterHeight) + (isMobile && numericBottomNavHeight === 0 ? bottomInset : 0);

  // Push-on-hover: how much further the content slides once the rail is fully
  // expanded. `numericNavbarWidth` already equals the collapsed rail width, so
  // we only add the remaining delta up to the full width, scaled by progress.
  const pushDelta = React.useMemo(() => {
    if (!navbarPushOnHover || isMobile || navbarOpen) return 0;
    return Math.max(0, coerceNumber(fullNavbarWidth, 0) - coerceNumber(navbarCollapsedRailWidth, 0));
  }, [navbarPushOnHover, isMobile, navbarOpen, fullNavbarWidth, navbarCollapsedRailWidth]);

  // Own both horizontal insets from the worklet. Reanimated exclusively manages
  // any property an animated style ever sets, so a static `left` would freeze at
  // its first value once hover animates it. Driving left/right here keeps them in
  // sync with layout changes (e.g. the rail auto-expanding at xl) AND animates the
  // hover push. `pushDelta` is 0 whenever push mode is off or the rail is already
  // open, so this reduces to the plain static offset in every other case.
  const contentInsetStyle = useAnimatedStyle(() => {
    const extra = navbarHoverProgress.value * pushDelta;
    return isRTL
      ? { left: contentLeft, right: contentRight + extra }
      : { left: contentLeft + extra, right: contentRight };
  }, [pushDelta, contentLeft, contentRight, isRTL]);

  // Under `cssGeometry` the navbar side is a custom property and the hover push
  // is a transition on it, so there is nothing here for the UI thread to drive.
  const cssInsetStyle = isRTL
    ? { left: contentLeft, right: navbarWidthStyle }
    : { left: navbarWidthStyle, right: contentRight };

  const horizontalPadding = maxWidth && centerContent ? 0 : 0;

  const contentStyles = [
    {
      flex: 1,
      width: '100%',
      alignSelf: centerContent ? 'center' : 'stretch',
      paddingHorizontal: horizontalPadding,
      ...(Platform.OS === 'web' && { overflow: 'visible' as any }),
    },
    maxWidth ? { maxWidth } : null,
  ].filter(Boolean);

  const tocStyles = {
    width: numericTocWidth,
    position: 'absolute',
    top: numericHeaderHeight,
    bottom: isMobile ? numericBottomNavHeight : numericFooterHeight,
    ...(isRTL ? { left: numericAsideWidth } : { right: numericAsideWidth }),
    backgroundColor: chrome.background,
    zIndex: 850,
    ...(isRTL ? {
      borderRightWidth: tocWithBorder ? 1 : 0,
      borderRightColor: chrome.border,
    } : {
      borderLeftWidth: tocWithBorder ? 1 : 0,
      borderLeftColor: chrome.border,
    }),
  } as any;

  const webAttributes: any = {
    ...(id ? { id } : {}),
    ...(role ? { role } : {}),
  };

  // On web, forward wheel events from the outer (full-width) container
  // to the inner ScrollView so scrolling works even when the cursor is
  // in the left/right margins outside the maxWidth content area.
  const outerRef = useRef<View>(null);
  // Wheel handling needs the node; the consumer's ref is composed onto it.
  const mergedOuterRef = useMergedRef<View>(outerRef, ref);
  const scrollableRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = (outerRef.current as any) as HTMLElement | null;
    if (!el || !el.addEventListener) return;

    // Find the first scrollable descendant by checking computed overflow
    const findScrollable = (root: HTMLElement): HTMLElement | null => {
      const children = root.querySelectorAll('*');
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const style = window.getComputedStyle(child);
        const overflowY = style.overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return child;
        }
      }
      return null;
    };

    // Cache after a short delay to allow children to mount
    const timer = setTimeout(() => {
      scrollableRef.current = findScrollable(el);
    }, 100);

    const handleWheel = (e: WheelEvent) => {
      // Only forward if the event target is the outer container itself
      // (i.e. the margins), not a child element that can scroll on its own.
      const target = e.target as HTMLElement;
      if (target !== el) return;

      // Lazily find if not cached
      if (!scrollableRef.current) {
        scrollableRef.current = findScrollable(el);
      }

      if (scrollableRef.current) {
        scrollableRef.current.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      clearTimeout(timer);
      el.removeEventListener('wheel', handleWheel);
      scrollableRef.current = null;
    };
  }, []);

  return (
    <>
      <Animated.View
        ref={mergedOuterRef}
        {...webAttributes}
        {...(cssGeometry ? ({ dataSet: { pbShellMain: 'true' } } as any) : {})}
        style={[
          {
            position: 'absolute',
            top: cssGeometry ? headerHeightStyle : contentTop,
            bottom: cssGeometry ? contentBottomStyle : contentBottom,
            // Use the page background token so the area outside the centered
            // maxWidth content column matches the scrollable page body (which
            // paints theme.backgrounds.base). gray[0] is a slightly different
            // light-mode grey and produced a visible seam at the column edge.
            backgroundColor: theme.backgrounds.base,
          },
          // left/right (incl. hover push) are owned by the animated style —
          // except under `cssGeometry`, where the stylesheet owns them.
          cssGeometry ? (cssInsetStyle as any) : contentInsetStyle,
          style,
        ]}
      >
        {/* Content with optional max width constraint */}
        <View style={contentStyles as any}>
          {children}
        </View>
      </Animated.View>

      {/* Table of Contents */}
      {tableOfContents && (!hideTocOnMobile || !isMobile) && (
        <View style={tocStyles}>
          <View style={{ flex: 1, padding: 16 }}>
            {tableOfContents}
          </View>
        </View>
      )}
    </>
  );
});

AppShellMain.displayName = 'AppShellMain';

// Section component for organizing navbar/aside content
export const AppShellSection = React.forwardRef<View, AppShellSectionProps>(({
  children,
  grow = false,
  withScrollArea = false,
  style,
}, ref) => {
  return (
    <View
      ref={ref}
      style={[
        {
          flex: grow ? 1 : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});

AppShellSection.displayName = 'AppShellSection';

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
    padding = 'md',
    withBorder = true,
    zIndex = 100,
    transitionDuration = 200,
    transitionTimingFunction = 'ease',
    disabled = false,
    children,
    backgroundColor,
    withSafeArea = true,
    style,
    testID,
    maxContentWidth,
    centerContent,
    tableOfContents,
    hideTableOfContentsOnMobile = true,
    tableOfContentsWidth = 280,
    tableOfContentsWithBorder = true,
    ...rest
  } = props;

  const resolvedCenterContent = centerContent ?? Boolean(maxContentWidth);

  const layoutVisibility = React.useMemo(() => ({
    header: (layoutSections?.header ?? true) && showHeader,
    navbar: layoutSections?.navbar ?? true,
    aside: layoutSections?.aside ?? true,
    footer: layoutSections?.footer ?? true,
    bottomNav: layoutSections?.bottomNav ?? true,
  }), [layoutSections, showHeader]);

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);
  const theme = useTheme();
  const chrome = shellChrome(theme);
  const breakpoint = useBreakpoint();

  // Determine if mobile based on breakpoint and platform
  const isMobile = Platform.OS !== 'web' || breakpoint === 'xs' || breakpoint === 'sm';

  const headerConfig = layoutVisibility.header ? header : undefined;
  const navbarConfig = layoutVisibility.navbar ? navbar : undefined;
  const asideConfig = layoutVisibility.aside ? aside : undefined;
  const footerConfig = layoutVisibility.footer ? footer : undefined;
  const bottomNavConfig = layoutVisibility.bottomNav ? bottomNav : undefined;

  // Calculate resolved dimensions
  const headerHeight = headerConfig ? resolveResponsiveValue(headerConfig.height, breakpoint) : 0;
  const footerHeight = footerConfig ? resolveResponsiveValue(footerConfig.height, breakpoint) : 0;
  const bottomNavHeight = bottomNavConfig && isMobile ? resolveResponsiveValue(bottomNavConfig.height, breakpoint) : 0;

  // Desired desktop open state: expanded when `startCollapsedDesktop` is off, or
  // when the viewport has reached `autoExpandBreakpoint` (e.g. auto-expand the
  // rail on xl screens while keeping it collapsed-with-hover on smaller desktops).
  const desktopNavbarOpen = React.useMemo(() => {
    if (!navbarConfig) return false;
    if (isBreakpointAtLeast(breakpoint, navbarConfig.autoExpandBreakpoint)) return true;
    return !navbarConfig.startCollapsedDesktop;
  }, [navbarConfig, breakpoint]);

  // Local state for drawer open when mobile
  const [navbarOpen, setNavbarOpen] = React.useState(() => {
    if (!navbarConfig) return false;
    if (isMobile) return false;
    return desktopNavbarOpen;
  });
  const openNavbar = React.useCallback(() => setNavbarOpen(true), []);
  const closeNavbar = React.useCallback(() => setNavbarOpen(false), []);
  const toggleNavbar = React.useCallback(() => setNavbarOpen(o => !o), []);

  // When breakpoint changes, ensure desktop shows navbar and mobile closes by default
  React.useEffect(() => {
    if (!navbarConfig) {
      setNavbarOpen(false);
      return;
    }
    if (isMobile) {
      setNavbarOpen(false);
    } else {
      setNavbarOpen(desktopNavbarOpen);
    }
  }, [isMobile, navbarConfig, desktopNavbarOpen]);

  // Calculate navbar state (desktop inline vs mobile drawer)
  const fullNavbarWidth = navbarConfig ? resolveResponsiveValue(navbarConfig.width, breakpoint) : 0;
  const railWidth = navbarConfig?.collapsedWidth ?? 72;
  const isNavbarCollapsed = navbarConfig
    ? isMobile
      ? true // drawer mode renders separately when open
      : !navbarOpen // desktop inline collapse controlled by navbarOpen
    : true;
  // Layout width (space reserved for navbar). On desktop we reserve rail width when collapsed.
  const navbarWidth = navbarConfig
    ? (isMobile
      ? 0 // drawer overlays content
      : navbarOpen ? fullNavbarWidth : railWidth)
    : 0;

  // Hover-expansion: when `expandOnHoverPush` is enabled the collapsed rail
  // pushes the main content aside (flexing the page) instead of overlaying it.
  // The navbar writes to this shared value on hover; AppShellNavbar and
  // AppShellMain both read it via animated styles so the content reflows on the
  // UI thread without re-rendering the (heavy) page subtree.
  const navbarHoverProgress = useSharedValue(0);
  const navbarPushOnHover = Boolean(
    navbarConfig
      && !isMobile
      && (navbarConfig.expandOnHover ?? true)
      && (navbarConfig as { expandOnHoverPush?: boolean }).expandOnHoverPush
  );

  // Calculate aside state
  const isAsideCollapsed = asideConfig
    ? isMobile
      ? asideConfig.collapsed?.mobile ?? true
      : asideConfig.collapsed?.desktop ?? false
    : true;
  const asideWidth = asideConfig && !isAsideCollapsed
    ? resolveResponsiveValue(asideConfig.width, breakpoint)
    : 0;

  // Geometry the browser resolves rather than the breakpoint hook. Only on web,
  // and only when the app asked for it — see `shellCssVars.ts` for why a
  // statically rendered app needs this and what it owes in return.
  const cssGeometry = cssGeometryProp && Platform.OS === 'web';

  // Fallbacks inside the `var()` have to be viewport-independent, or the
  // prerender and the client emit different strings and we are back to the
  // mismatch this exists to remove. `base` is that value.
  const headerHeightBase = headerConfig ? resolveResponsiveValue(headerConfig.height, 'base') : 0;
  const footerHeightBase = footerConfig ? resolveResponsiveValue(footerConfig.height, 'base') : 0;
  const bottomNavHeightBase = bottomNavConfig ? resolveResponsiveValue(bottomNavConfig.height, 'base') : 0;
  const contentBottomBase = bottomNavConfig ? bottomNavHeightBase : footerHeightBase;

  const contentBottom = isMobile ? bottomNavHeight : footerHeight;
  const headerHeightStyle = cssGeometry
    ? appShellVar(APP_SHELL_CSS_VARS.headerHeight, headerHeightBase)
    : headerHeight;
  const navbarWidthStyle = cssGeometry
    ? appShellVar(APP_SHELL_CSS_VARS.navbarWidth, 0)
    : navbarWidth;
  const contentBottomStyle = cssGeometry
    ? appShellVar(APP_SHELL_CSS_VARS.contentBottom, contentBottomBase)
    : contentBottom;

  const contextValue = React.useMemo<AppShellContextValue>(() => ({
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
    isNavbarRail: !isMobile && !!navbarConfig && !navbarOpen,
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
    navbarExpandOnHover: navbarConfig?.expandOnHover ?? true,
    navbarPushOnHover,
    navbarHoverProgress,
  }), [
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
    isMobile,
    navbarConfig,
    navbarOpen,
    breakpoint,
    openNavbar,
    closeNavbar,
    toggleNavbar,
    transitionDuration,
    fullNavbarWidth,
    railWidth,
    isAsideCollapsed,
    navbarPushOnHover,
    navbarHoverProgress,
  ]);

  // Memoized selector payloads for re-render isolation
  const apiValue = React.useMemo<AppShellApi>(() => ({ openNavbar, closeNavbar, toggleNavbar }), [openNavbar, closeNavbar, toggleNavbar]);
  const layoutValue = React.useMemo<AppShellLayout>(() => ({ headerHeight, navbarWidth, asideWidth, footerHeight, bottomNavHeight }), [headerHeight, navbarWidth, asideWidth, footerHeight, bottomNavHeight]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: backgroundColor || chrome.canvas,
    ...spacingStyles,
    ...style,

    
  };

  const safeAreaBackground = (containerStyle.backgroundColor as string | undefined) ?? theme.backgrounds.base;

  if (disabled) {
    return (
      <StatusBarManager {...statusBar}>
        <View ref={ref} style={containerStyle} testID={testID} {...otherProps}>
          {children}
        </View>
      </StatusBarManager>
    );
  }

  // Check if we need to replace navbar with mobile menu for mobile platforms
  const shouldUseMobileMenu = isMobile && !!navbarConfig && mobileMenu && Platform.OS !== 'web';

  const content = (
    <AppShellApiContext.Provider value={apiValue}>
      <AppShellLayoutContext.Provider value={layoutValue}>
        <AppShellContext.Provider value={contextValue}>
          <StatusBarManager {...statusBar}>



            <View ref={ref} style={containerStyle} testID={testID} {...otherProps}>
              {autoLayout ? (
                <>
                  {/* Header */}
                  {headerConfig && (
                    <AppShellHeader>
                      {typeof headerContent === 'function' ? headerContent() : headerContent}
                    </AppShellHeader>
                  )}

                  {/* Navbar (inline or drawer based on breakpoint) */}
                  {navbarConfig && (
                    <AppShellNavbar drawerMode={isMobile}>
                      {typeof navbarContent === 'function' ? navbarContent() : navbarContent}
                    </AppShellNavbar>
                  )}

                  {/* Aside */}
                  {asideConfig && (
                    <AppShellAside>
                      {typeof asideContent === 'function' ? asideContent() : asideContent}
                    </AppShellAside>
                  )}

                  {/* Main */}
                  <AppShellMain
                    maxWidth={maxContentWidth}
                    centerContent={resolvedCenterContent}
                    tableOfContents={tableOfContents}
                    hideTocOnMobile={hideTableOfContentsOnMobile}
                    tocWidth={tableOfContentsWidth}
                    tocWithBorder={tableOfContentsWithBorder}
                  >
                    {children}
                  </AppShellMain>

                  {/* Footer (desktop) */}
                  {footerConfig && !isMobile && (
                    <AppShellFooter>
                      {typeof footerContent === 'function' ? footerContent() : footerContent}
                    </AppShellFooter>
                  )}

                  {/* Bottom mobile nav */}
                  {bottomNavConfig && isMobile && (bottomNavItems?.length || bottomNavProps) && (
                    <BottomAppBar
                      {...bottomNavProps}
                      items={bottomNavItems}
                      withBorder={withBorder}
                    />
                  )}
                </>
              ) : (
                children
              )}
            </View>
            {/* Mobile Menu Modal - only render if configured and on mobile */}
            {shouldUseMobileMenu && (
              <MobileMenu
                visible={navbarOpen}
                onClose={closeNavbar}
                config={mobileMenu}
              >
                {/* Extract navbar content for mobile menu */}
                {React.Children.toArray(children).find(child =>
                  React.isValidElement(child) && child.type === AppShellNavbar
                )}
              </MobileMenu>
            )}
          </StatusBarManager>
        </AppShellContext.Provider>
      </AppShellLayoutContext.Provider>
    </AppShellApiContext.Provider>
  );

  if (withSafeArea) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: safeAreaBackground }}>
          {content}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return content;
}

interface AppShellFactoryPayload {
  props: AppShellProps;
  ref: View;
}

// Export enhanced AppShell with all sub-components
const AppShellComponent = factory<AppShellFactoryPayload>((props, ref) =>
  AppShellBase(props, ref)
);

// Create compound component with sub-components
type AppShellType = typeof AppShellComponent & {
  Header: typeof AppShellHeader;
  Navbar: typeof AppShellNavbar;
  Aside: typeof AppShellAside;
  Footer: typeof AppShellFooter;
  BottomNav: typeof AppShellBottomNav;
  BottomAppBar: typeof BottomAppBar;
  Main: typeof AppShellMain;
  Section: typeof AppShellSection;
  MobileMenu: typeof MobileMenu;
  StatusBarManager: typeof StatusBarManager;
};

export const AppShell = AppShellComponent as AppShellType;

// Attach sub-components
AppShell.Header = AppShellHeader;
AppShell.Navbar = AppShellNavbar;
AppShell.Aside = AppShellAside;
AppShell.Footer = AppShellFooter;
AppShell.BottomNav = AppShellBottomNav;
AppShell.BottomAppBar = BottomAppBar;
AppShell.Main = AppShellMain;
AppShell.Section = AppShellSection;
AppShell.MobileMenu = MobileMenu;
AppShell.StatusBarManager = StatusBarManager;

AppShell.displayName = 'AppShell';
