import React from 'react';
import { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { shellChrome } from '../../core/theme/cssVariableTheme';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getZIndex } from '../../core/theme/zIndices';
import { useStyleProps } from '../../core/utils/spacing';
import { useAppShell, useAppShellInternal } from './AppShellContext';
import { asDimension } from './shellUtils';
import type { AppShellFooterProps } from './types';

/**
 * The bottom bar between the navbar and the aside — the page's `contentinfo`
 * landmark. Renders nothing while `footer.collapsed` is set.
 */
export const AppShellFooter = factory<{ props: AppShellFooterProps; ref: View }>(
  function AppShellFooter(props, ref) {
    const { children, withBorder: withBorderProp, zIndex, style, accessibilityLabel, testID } = props;
    const theme = useTheme();
    const chrome = shellChrome(theme);
    const spacingStyles = useStyleProps(props);
    const { footerHeight, navbarWidth, navbarWidthStyle, asideWidth, cssGeometry } = useAppShell();
    const internal = useAppShellInternal();

    if (internal?.footerCollapsed) return null;

    const withBorder = withBorderProp ?? internal?.withBorder ?? true;

    return (
      <View
        ref={ref}
        testID={testID}
        role="contentinfo"
        aria-label={accessibilityLabel}
        style={[
          {
            height: asDimension(footerHeight),
            position: 'absolute',
            bottom: 0,
            start: asDimension(cssGeometry ? navbarWidthStyle : navbarWidth),
            end: asDimension(asideWidth),
            backgroundColor: chrome.background,
            zIndex: zIndex ?? internal?.zIndices.footer ?? getZIndex(theme, 'sticky'),
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
  { displayName: 'AppShellFooter' }
);
