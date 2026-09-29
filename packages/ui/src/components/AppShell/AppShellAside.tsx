import React from 'react';
import { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getZIndex } from '../../core/theme/zIndices';
import { useStyleProps } from '../../core/utils/spacing';
import { useAppShell, useAppShellInternal } from './AppShellContext';
import { asDimension } from './shellUtils';
import type { AppShellAsideProps } from './types';

/**
 * The supplemental panel on the end side (right in LTR, left in RTL) — a
 * `complementary` landmark. Renders nothing while `aside.collapsed` applies.
 */
export const AppShellAside = factory<{ props: AppShellAsideProps; ref: View }>(
  function AppShellAside(props, ref) {
    const { children, withBorder: withBorderProp, zIndex, style, accessibilityLabel, testID } = props;
    const theme = useTheme();
    const chrome = shellChrome(theme);
    const spacingStyles = useStyleProps(props);
    const { asideWidth, headerHeight, headerHeightStyle, footerHeight, contentBottomStyle, isAsideCollapsed, cssGeometry } =
      useAppShell();
    const internal = useAppShellInternal();

    if (isAsideCollapsed) return null;

    const alt = internal?.layout === 'alt';
    const withBorder = withBorderProp ?? internal?.withBorder ?? true;

    return (
      <View
        ref={ref}
        testID={testID}
        role="complementary"
        aria-label={accessibilityLabel}
        style={[
          {
            width: asDimension(asideWidth),
            position: 'absolute',
            top: alt ? 0 : asDimension(cssGeometry ? headerHeightStyle : headerHeight),
            bottom: alt ? 0 : asDimension(cssGeometry ? contentBottomStyle : footerHeight),
            end: 0,
            backgroundColor: chrome.background,
            zIndex: zIndex ?? internal?.zIndices.aside ?? getZIndex(theme, 'sticky'),
            borderStartWidth: withBorder ? 1 : 0,
            borderStartColor: chrome.border,
          },
          spacingStyles,
          style,
        ]}
      >
        {children}
      </View>
    );
  },
  { displayName: 'AppShellAside' }
);
