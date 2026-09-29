import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { EasingFunction, EasingFunctionFactory, SharedValue } from 'react-native-reanimated';

import { factory } from '../../core/factory/factory';
import { useLayer } from '../../core/overlay/useLayer';
import { hasDOM, isWeb } from '../../core/platform/flags';
import { webProps } from '../../core/platform/webProps';
import { webStyle } from '../../core/platform/webStyle';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveScrim, resolveShadow } from '../../core/theme/tokens';
import { getZIndex } from '../../core/theme/zIndices';
import { flipHorizontal } from '../../core/utils/rtl';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { useAppShell, useAppShellInternal, useNavbarHover, useNavbarHoverHandlers } from './AppShellContext';
import { APP_SHELL_CSS_VARS } from './shellCssVars';
import {
  FILL,
  asDimension,
  coerceNumber,
  isViewportRelativeWidth,
  resolveDrawerWidth,
  selectNothing,
  selectViewportWidth,
  useLayoutIsRTL,
  useViewportSelector,
} from './shellUtils';
import type { AppShellNavbarProps } from './types';

const OPEN_CLOSE_EASING = Easing.inOut(Easing.cubic);
const HOVER_EASING = Easing.out(Easing.cubic);
const FULL_HEIGHT: ViewStyle = { height: '100%' };
const DEFAULT_DRAWER_WIDTH = 280;

type Easer = EasingFunction | EasingFunctionFactory;

/**
 * The shell's navigation — a `navigation` landmark. On desktop it is an inline
 * rail that collapses to `navbar.collapsedWidth` and can expand on hover; below
 * `navbar.breakpoint` (and on native) it is an overlay drawer with a scrim that
 * closes on scrim press, Escape and Android back, and keeps focus inside while
 * open.
 */
export const AppShellNavbar = factory<{ props: AppShellNavbarProps; ref: View }>(
  function AppShellNavbar(props, ref) {
    const {
      children,
      withBorder: withBorderProp,
      zIndex,
      style,
      drawerMode,
      accessibilityLabel = 'Main',
      testID,
    } = props;
    const theme = useTheme();
    const chrome = shellChrome(theme);
    const spacingStyles = useStyleProps(props);
    const layoutRTL = useLayoutIsRTL();
    const hovering = useNavbarHover();
    const hoverHandlers = useNavbarHoverHandlers();
    const internal = useAppShellInternal();
    const {
      headerHeight,
      footerHeight,
      fullNavbarWidth,
      navbarOpen,
      closeNavbar,
      transitionDuration,
      navbarCollapsedRailWidth,
      navbarExpandOnHover,
      navbarPushOnHover,
      navbarHoverProgress,
      cssGeometry,
      headerHeightStyle,
      navbarWidthStyle,
      contentBottomStyle,
    } = useAppShell();

    const withBorder = withBorderProp ?? internal?.withBorder ?? true;
    const alt = internal?.layout === 'alt';
    const easing = internal?.easing;

    // Determine effective drawer mode: below `navbar.breakpoint` (and on
    // native) the navbar is an overlay drawer.
    //
    // Under `cssGeometry` it never is. The drawer and the inline rail are
    // different markup, and picking between them from the breakpoint is exactly
    // the guess a prerender cannot make — so the rail is what renders at every
    // width and the stylesheet hides it where it doesn't belong. Apps that want a
    // drawer under it supply their own (the docs site does).
    const effectiveDrawer = drawerMode ?? (cssGeometry ? false : internal?.navbarIsDrawer ?? false);

    const railWidth = coerceNumber(navbarCollapsedRailWidth, 72);
    const targetExpandedWidth = coerceNumber(fullNavbarWidth, 240);

    // Animated value controls slide/width. `transitionDuration` 0 (also forced
    // by reduced motion) means "no transition": assign the target directly.
    const animateTo = useCallback(
      (shared: SharedValue<number>, next: number, fallbackEasing: Easer) => {
        if (transitionDuration <= 0) {
          shared.value = next;
          return;
        }
        shared.value = withTiming(next, { duration: transitionDuration, easing: easing ?? fallbackEasing });
      },
      [transitionDuration, easing]
    );

    const progress = useSharedValue(navbarOpen ? 1 : 0);
    useEffect(() => {
      animateTo(progress, navbarOpen ? 1 : 0, OPEN_CLOSE_EASING);
    }, [navbarOpen, animateTo, progress]);

    const hoverExpands = !effectiveDrawer && navbarExpandOnHover && !navbarOpen;
    const widthValue = useSharedValue<number>(navbarOpen ? targetExpandedWidth : railWidth);
    useEffect(() => {
      if (effectiveDrawer) return;
      const expanded = navbarOpen || (hoverExpands && hovering);
      animateTo(widthValue, expanded ? targetExpandedWidth : railWidth, hovering ? HOVER_EASING : OPEN_CLOSE_EASING);
    }, [effectiveDrawer, navbarOpen, hoverExpands, hovering, targetExpandedWidth, railWidth, animateTo, widthValue]);

    // Push mode: mirror the hover state into the shared progress value (0 =
    // rail, 1 = expanded) for anything animating alongside the rail.
    useEffect(() => {
      if (effectiveDrawer || !navbarPushOnHover) return;
      animateTo(navbarHoverProgress, hovering && !navbarOpen ? 1 : 0, HOVER_EASING);
    }, [effectiveDrawer, navbarPushOnHover, hovering, navbarOpen, animateTo, navbarHoverProgress]);

    // Under `cssGeometry` the rail's width and the content's offset are the same
    // custom property, so expanding on hover is one assignment and the browser
    // moves both together. Writing a property beats animating two values that
    // then have to be kept in step — and it never re-renders the page subtree.
    useEffect(() => {
      if (!cssGeometry || !hasDOM) return;
      if (!navbarExpandOnHover || effectiveDrawer) return;
      const root = document.documentElement;
      if (hovering && !navbarOpen && navbarPushOnHover) {
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

    // Drawer: a viewport-relative width ('100%', '80vw') follows the viewport.
    const navbarWidthRaw = internal?.navbarWidthRaw ?? fullNavbarWidth;
    const viewportWidth = useViewportSelector(
      effectiveDrawer && isViewportRelativeWidth(navbarWidthRaw) ? selectViewportWidth : selectNothing
    );
    const drawerWidth = resolveDrawerWidth(navbarWidthRaw, viewportWidth, DEFAULT_DRAWER_WIDTH);

    const widthAnimatedStyles = useAnimatedStyle(() => ({ width: widthValue.value }), [widthValue]);
    const closedOffset = flipHorizontal(-drawerWidth, layoutRTL);
    const drawerAnimatedStyles = useAnimatedStyle(
      () => ({ transform: [{ translateX: interpolate(progress.value, [0, 1], [closedOffset, 0]) }] }),
      [closedOffset, progress]
    );
    const backdropAnimatedStyles = useAnimatedStyle(
      () => ({ opacity: progress.value }),
      [progress]
    );

    // The open drawer is a layer: Escape / Android back close it, Tab stays
    // inside it, and focus returns to the opener when it closes.
    const drawerRef = useRef<View>(null);
    const mergedRef = useMergedRef<View>(drawerRef, ref);
    useLayer({
      active: effectiveDrawer && navbarOpen,
      onDismiss: closeNavbar,
      containerRef: drawerRef,
      trapFocus: true,
    });

    // DESKTOP (inline rail) ----------------------------------
    if (!effectiveDrawer) {
      // Always render (even when collapsed) so width can animate between rail and expanded
      if (fullNavbarWidth === 0) return null; // truly no navbar configured
      return (
        <Animated.View
          ref={mergedRef}
          testID={testID}
          role="navigation"
          aria-label={accessibilityLabel}
          {...webProps({ dataSet: cssGeometry ? { pbShellNavbar: 'true' } : undefined })}
          {...(isWeb && navbarExpandOnHover ? hoverHandlers : undefined)}
          style={[
            {
              position: 'absolute',
              top: alt ? 0 : asDimension(cssGeometry ? headerHeightStyle : headerHeight),
              bottom: alt ? 0 : asDimension(cssGeometry ? contentBottomStyle : footerHeight),
              start: 0,
              overflow: 'hidden',
              backgroundColor: chrome.background,
              zIndex: zIndex ?? internal?.zIndices.navbar ?? getZIndex(theme, 'sticky'),
              borderEndWidth: withBorder ? 1 : 0,
              borderEndColor: chrome.border,
            },
            cssGeometry ? { width: asDimension(navbarWidthStyle) } : widthAnimatedStyles,
            spacingStyles,
            style,
          ]}
        >
          <View style={FULL_HEIGHT}>{children}</View>
        </Animated.View>
      );
    }

    // MOBILE DRAWER ----------------------------------------------
    const drawerZIndex = zIndex ?? internal?.zIndices.drawer ?? getZIndex(theme, 'overlay');
    return (
      <>
        {/* Scrim: a pointer affordance only (Escape / back / the app's close button cover keyboard and AT). */}
        <Animated.View
          aria-hidden
          style={[
            FILL,
            // The theme scrim (its alpha is the strength); the opacity fades it in.
            { backgroundColor: resolveScrim(theme), zIndex: drawerZIndex, pointerEvents: navbarOpen ? 'auto' : 'none' },
            backdropAnimatedStyles,
          ]}
        >
          <Pressable
            testID={testID ? `${testID}-backdrop` : undefined}
            style={FILL}
            onPress={closeNavbar}
            tabIndex={-1}
            aria-hidden
            importantForAccessibility="no-hide-descendants"
          />
        </Animated.View>
        <Animated.View
          ref={mergedRef}
          testID={testID}
          role="navigation"
          aria-label={accessibilityLabel}
          aria-hidden={!navbarOpen}
          style={[
            {
              width: drawerWidth,
              position: 'absolute',
              top: 0, // cover header on mobile to differentiate appearance
              bottom: 0,
              start: 0,
              backgroundColor: chrome.background,
              zIndex: drawerZIndex,
              borderEndWidth: withBorder ? 1 : 0,
              borderEndColor: chrome.border,
              overflow: 'hidden',
              pointerEvents: navbarOpen ? 'auto' : 'none',
            },
            navbarOpen ? resolveShadow(theme, 'lg') : null,
            // Web: once closed (after the slide-out), take the drawer out of the
            // tab order and the accessibility tree.
            webStyle({
              visibility: navbarOpen ? 'visible' : 'hidden',
              transition: navbarOpen ? 'visibility 0s' : `visibility 0s linear ${transitionDuration}ms`,
            }),
            drawerAnimatedStyles,
            spacingStyles,
            style,
          ]}
        >
          {children}
        </Animated.View>
      </>
    );
  },
  { displayName: 'AppShellNavbar' }
);
