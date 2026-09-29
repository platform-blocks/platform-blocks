import React from 'react';
import { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useStyleProps } from '../../core/utils/spacing';
import { useAppShell, useAppShellInternal } from './AppShellContext';
import { asDimension } from './shellUtils';
import type { AppShellBottomNavProps } from './types';

/**
 * Container pinned to the bottom edge for mobile navigation. Shows at mobile
 * widths (and on desktop too with `bottomNav.showOnlyMobile: false`). For a
 * ready-made bar with items, use `AppShell.BottomAppBar`. With an
 * `accessibilityLabel` it is a `navigation` landmark.
 */
export const AppShellBottomNav = factory<{ props: AppShellBottomNavProps; ref: View }>(
  function AppShellBottomNav(props, ref) {
    const { children, withBorder: withBorderProp, zIndex, style, accessibilityLabel, testID } = props;
    const theme = useTheme();
    const chrome = shellChrome(theme);
    const spacingStyles = useStyleProps(props);
    const { bottomNavHeight } = useAppShell();
    const internal = useAppShellInternal();

    if (!internal?.bottomNavShown) return null;

    const withBorder = withBorderProp ?? internal.withBorder;

    return (
      <View
        ref={ref}
        testID={testID}
        // A labelled bar is a navigation landmark; unlabelled it is a plain
        // container (children such as BottomAppBar bring their own landmark).
        role={accessibilityLabel ? 'navigation' : undefined}
        aria-label={accessibilityLabel}
        style={[
          {
            height: asDimension(bottomNavHeight),
            position: 'absolute',
            bottom: 0,
            start: 0,
            end: 0,
            backgroundColor: chrome.background,
            zIndex: zIndex ?? internal.zIndices.bottomNav,
            borderTopWidth: withBorder ? 1 : 0,
            borderTopColor: chrome.border,
          },
          spacingStyles,
          style,
        ]}
      >
        {children}
      </View>
    );
  },
  { displayName: 'AppShellBottomNav' }
);
