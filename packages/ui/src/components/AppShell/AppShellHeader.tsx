import React from 'react';
import { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getZIndex } from '../../core/theme/zIndices';
import { useStyleProps } from '../../core/utils/spacing';
import { useAppShell, useAppShellInternal, useNavbarPushOffset } from './AppShellContext';
import { asDimension, insetTransition } from './shellUtils';
import type { AppShellHeaderProps } from './types';

/**
 * The shell's top bar — the page's `banner` landmark. Spans the full width in
 * the default layout; in the `alt` layout it sits between the navbar and aside.
 */
export const AppShellHeader = factory<{ props: AppShellHeaderProps; ref: View }>(
  function AppShellHeader(props, ref) {
    const { children, withBorder: withBorderProp, zIndex, style, accessibilityLabel, testID } = props;
    const theme = useTheme();
    const chrome = shellChrome(theme);
    const spacingStyles = useStyleProps(props);
    const { headerHeightStyle, navbarWidth, navbarWidthStyle, asideWidth, cssGeometry, transitionDuration } = useAppShell();
    const internal = useAppShellInternal();
    const pushOffset = useNavbarPushOffset();

    if (internal?.headerCollapsed) return null;

    const alt = internal?.layout === 'alt';
    const withBorder = withBorderProp ?? internal?.withBorder ?? true;
    const start = !alt ? 0 : cssGeometry ? navbarWidthStyle : (typeof navbarWidth === 'number' ? navbarWidth : 0) + pushOffset;

    return (
      <View
        ref={ref}
        testID={testID}
        role="banner"
        aria-label={accessibilityLabel}
        style={[
          {
            height: asDimension(headerHeightStyle),
            position: 'absolute',
            top: 0,
            start: asDimension(start),
            end: alt ? asDimension(asideWidth) : 0,
            backgroundColor: chrome.background,
            zIndex: zIndex ?? internal?.zIndices.header ?? getZIndex(theme, 'header'),
            borderBottomWidth: withBorder ? 1 : 0,
            borderBottomColor: chrome.border,
          },
          alt && !cssGeometry ? insetTransition(transitionDuration, internal?.cssTimingFunction ?? 'ease') : null,
          spacingStyles,
          style,
        ]}
      >
        {children}
      </View>
    );
  },
  { displayName: 'AppShellHeader' }
);
