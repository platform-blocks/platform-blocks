import React, { useContext, useEffect, useRef } from 'react';
import { View } from 'react-native';
import type { DimensionValue, ViewStyle } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { factory } from '../../core/factory/factory';
import { hasDOM, isWeb } from '../../core/platform/flags';
import { webProps } from '../../core/platform/webProps';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getZIndex } from '../../core/theme/zIndices';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { useAppShell, useAppShellInternal, useNavbarPushOffset } from './AppShellContext';
import { asDimension, coerceNumber, insetTransition, spacingPx } from './shellUtils';
import type { AppShellMainProps } from './types';

const CONTENT: ViewStyle = { flex: 1, width: '100%' };
const CENTERED: ViewStyle = { alignSelf: 'center' };
const STRETCHED: ViewStyle = { alignSelf: 'stretch' };
// Web: let content (e.g. sticky headers, focus rings) paint outside the column.
const OVERFLOW_VISIBLE: ViewStyle | null = isWeb ? { overflow: 'visible' } : null;
const FLEX_1: ViewStyle = { flex: 1 };

/**
 * The content area between the shell's chrome — the page's `main` landmark.
 * Optionally caps its content column's width (`maw`) and shows a table of contents column
 * on the end side.
 */
export const AppShellMain = factory<{ props: AppShellMainProps; ref: View }>(
  function AppShellMain(props, ref) {
    const {
      children,
      style,
      id,
      role = 'main',
      // Bounds the inner content column, not the root.
      maw,
      centerContent = true,
      tableOfContents,
      hideTocOnMobile = true,
      tocWidth = 280,
      tocWithBorder = true,
      testID,
      ...styleProps
    } = props;
    const theme = useTheme();
    const chrome = shellChrome(theme);
    const spacingStyles = useStyleProps(styleProps);
    const {
      headerHeight,
      headerHeightStyle,
      navbarWidth,
      navbarWidthStyle,
      asideWidth,
      bottomNavHeight,
      footerHeight,
      isMobile,
      navbarPushOnHover,
      cssGeometry,
      contentBottomStyle,
      transitionDuration,
    } = useAppShell();
    const internal = useAppShellInternal();
    const pushOffset = useNavbarPushOffset();
    // Safe-area insets when a SafeAreaProvider is mounted (AppShell mounts one
    // unless `withSafeArea={false}`); zero otherwise, and always on web.
    const insets = useContext(SafeAreaInsetsContext);

    const numericNavbarWidth = coerceNumber(navbarWidth, 0);
    const numericAsideWidth = coerceNumber(asideWidth, 0);
    const numericTocWidth = coerceNumber(tocWidth, 280);

    const topInset = isWeb ? 0 : insets?.top ?? 0;
    const bottomInset = isWeb ? 0 : insets?.bottom ?? 0;

    // TOC width (0 if hidden on mobile or no TOC provided)
    const showToc = !!tableOfContents && (!hideTocOnMobile || !isMobile);
    const effectiveTocWidth = showToc ? numericTocWidth : 0;

    // The navbar reserves nothing in drawer mode, so these are already 0 there.
    // `pushOffset` is the hover-push delta: 0 unless the pointer is over a
    // collapsed push-mode rail. Logical `start`/`end` flip in RTL on their own.
    const contentStart = numericNavbarWidth + pushOffset;
    const contentEnd = numericAsideWidth + effectiveTocWidth;
    const baseTop = internal?.contentTop ?? coerceNumber(headerHeight, 0);
    const baseBottom = internal?.contentBottom ?? coerceNumber(isMobile ? bottomNavHeight : footerHeight, 0);
    const contentTop = baseTop + (isMobile ? topInset : 0);
    const contentBottom = baseBottom + (isMobile && coerceNumber(bottomNavHeight, 0) === 0 ? bottomInset : 0);

    const mainPadding = internal?.mainPadding;

    // On web, forward wheel events from the outer (full-width) container
    // to the inner ScrollView so scrolling works even when the cursor is
    // in the side margins outside the `maw` content column.
    const outerRef = useRef<View>(null);
    // Wheel handling needs the node; the consumer's ref is composed onto it.
    const mergedOuterRef = useMergedRef<View>(outerRef, ref);
    const scrollableRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
      if (!hasDOM) return;
      // react-native-web host refs are the DOM element.
      const el = outerRef.current as unknown as HTMLElement | null;
      if (!el || typeof el.addEventListener !== 'function') return;

      // Find the first scrollable descendant by checking computed overflow
      const findScrollable = (root: HTMLElement): HTMLElement | null => {
        const descendants = root.querySelectorAll('*');
        for (let i = 0; i < descendants.length; i++) {
          const child = descendants[i] as HTMLElement;
          const overflowY = window.getComputedStyle(child).overflowY;
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
        if (e.target !== el) return;
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
        <View
          ref={mergedOuterRef}
          testID={testID}
          id={id}
          role={role}
          {...webProps({ dataSet: cssGeometry ? { pbShellMain: 'true' } : undefined })}
          style={[
            {
              position: 'absolute',
              top: asDimension(cssGeometry ? internal?.contentTopStyle ?? headerHeightStyle : contentTop),
              bottom: asDimension(cssGeometry ? contentBottomStyle : contentBottom),
              // Under `cssGeometry` the navbar side is a custom property and the
              // hover push is a transition on it (see createAppShellCss).
              start: asDimension(cssGeometry ? navbarWidthStyle : contentStart),
              end: contentEnd,
              // Use the page background token so the area outside the centered
              // `maw` content column matches the scrollable page body (which
              // paints theme.backgrounds.base).
              backgroundColor: theme.backgrounds.base,
            },
            // Web: the hover push (and rail open/close) slides the content.
            navbarPushOnHover && !cssGeometry
              ? insetTransition(transitionDuration, internal?.cssTimingFunction ?? 'ease')
              : null,
            spacingStyles,
            style,
          ]}
        >
          {/* Content with optional max width constraint */}
          <View
            style={[
              CONTENT,
              centerContent ? CENTERED : STRETCHED,
              OVERFLOW_VISIBLE,
              maw != null ? { maxWidth: maw as DimensionValue } : null,
              mainPadding != null ? { padding: mainPadding } : null,
            ]}
          >
            {children}
          </View>
        </View>

        {/* Table of Contents */}
        {showToc && (
          <View
            style={{
              width: numericTocWidth,
              position: 'absolute',
              top: asDimension(cssGeometry ? headerHeightStyle : headerHeight),
              bottom: isMobile ? coerceNumber(bottomNavHeight, 0) : coerceNumber(footerHeight, 0),
              end: numericAsideWidth,
              backgroundColor: chrome.background,
              zIndex: internal?.zIndices.toc ?? getZIndex(theme, 'sticky'),
              borderStartWidth: tocWithBorder ? 1 : 0,
              borderStartColor: chrome.border,
            }}
          >
            <View style={[FLEX_1, { padding: spacingPx(theme, 'lg') }]}>{tableOfContents}</View>
          </View>
        )}
      </>
    );
  },
  { displayName: 'AppShellMain' }
);
