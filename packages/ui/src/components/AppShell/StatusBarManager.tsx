import React from 'react';

import { isAndroid, isNative } from '../../core/platform/flags';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveOptionalModule } from '../../utils/optionalModule';
import type { StatusBarManagerProps } from './types';

type BarStyle = 'light' | 'dark';

/** The part of expo-status-bar's `StatusBar` this component renders. */
type StatusBarComponent = React.ComponentType<{
  style?: 'auto' | 'light' | 'dark' | 'inverted';
  backgroundColor?: string;
  translucent?: boolean;
  hidden?: boolean;
}>;

/** The parts of expo-navigation-bar used here, across its SDK versions. */
interface NavigationBarModule {
  /** SDK 56+ (edge-to-edge). */
  setStyle?: (style: BarStyle) => void;
  NavigationBar?: { setStyle?: (style: BarStyle) => void };
  /** Pre edge-to-edge. */
  setButtonStyleAsync?: (style: BarStyle) => Promise<void>;
  setBackgroundColorAsync?: (color: string) => Promise<void>;
}

// Resolved lazily (and only on native), so web bundles never warn about them.
const getStatusBar = () =>
  resolveOptionalModule<StatusBarComponent>('expo-status-bar', {
    accessor: (module: { StatusBar?: StatusBarComponent }) => module.StatusBar,
    devWarning: 'expo-status-bar not found, status bar will not render',
  });

const getNavigationBar = () =>
  resolveOptionalModule<NavigationBarModule>('expo-navigation-bar', {
    devWarning: 'expo-navigation-bar not found, navigation bar will not be styled',
  });

/**
 * Styles the native status bar (expo-status-bar) and, on Android, the system
 * navigation bar (expo-navigation-bar) to match the theme. Renders its
 * children; nothing of its own on web.
 */
export const StatusBarManager: React.FC<StatusBarManagerProps> = ({
  style: statusBarStyle,
  backgroundColor,
  translucent = true,
  hidden = false,
  children,
}) => {
  const theme = useTheme();

  // Auto-determine status bar style based on theme if not specified
  const resolvedStyle = statusBarStyle || (theme.colorScheme === 'dark' ? 'light' : 'dark');

  // Auto-determine background color based on theme if not specified
  const resolvedBackgroundColor = backgroundColor || (isAndroid ? theme.backgrounds.base : 'transparent');

  React.useEffect(() => {
    if (!isAndroid) return;
    const NavigationBar = getNavigationBar();
    if (!NavigationBar) return;

    // expo-navigation-bar (SDK 56+, Android edge-to-edge) replaced the async
    // setButtonStyleAsync/setBackgroundColorAsync APIs with a synchronous setStyle.
    // Feature-detect so this works across expo-navigation-bar versions.
    const buttonStyle: BarStyle = resolvedStyle === 'light' ? 'light' : 'dark';
    const setStyle = NavigationBar.NavigationBar?.setStyle ?? NavigationBar.setStyle;
    try {
      if (typeof setStyle === 'function') {
        setStyle(buttonStyle);
      } else if (typeof NavigationBar.setButtonStyleAsync === 'function') {
        NavigationBar.setButtonStyleAsync(buttonStyle).catch(() => {
          /* noop */
        });
      }

      // Background color is only settable on legacy (pre-edge-to-edge) versions.
      if (typeof NavigationBar.setBackgroundColorAsync === 'function') {
        NavigationBar.setBackgroundColorAsync(resolvedBackgroundColor).catch(() => {
          /* noop */
        });
      }
    } catch {
      /* noop */
    }
  }, [resolvedBackgroundColor, resolvedStyle]);

  const StatusBar = isNative ? getStatusBar() : null;

  return (
    <>
      {StatusBar && (
        <StatusBar
          style={resolvedStyle}
          backgroundColor={resolvedBackgroundColor}
          translucent={translucent}
          hidden={hidden}
        />
      )}
      {children}
    </>
  );
};

StatusBarManager.displayName = 'StatusBarManager';
