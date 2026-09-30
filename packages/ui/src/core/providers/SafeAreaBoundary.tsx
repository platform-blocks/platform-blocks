import React, { useContext, useMemo } from 'react';
import { Dimensions, Platform } from 'react-native';
import { SafeAreaInsetsContext, SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';

/**
 * Starting metrics for the provider we mount. Without them SafeAreaProvider
 * renders nothing until the native side reports insets — a blank first frame
 * on native, and empty markup in a static web export. Native knows the
 * window's insets synchronously; web and test environments start at zero and
 * measure after mount.
 */
function getInitialMetrics(): Metrics {
  if (Platform.OS !== 'web' && initialWindowMetrics) {
    return initialWindowMetrics;
  }
  const { width, height } = Dimensions.get('window');
  return {
    frame: { x: 0, y: 0, width, height },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}

interface SafeAreaBoundaryProps {
  enabled: boolean;
  children: React.ReactNode;
}

/**
 * Mounts a SafeAreaProvider unless one is already above: Expo Router mounts
 * its own at the root, and a nested PlocksProvider sits under the outer
 * one's. React Navigation's navigators, mounted below, reuse ours. Dialog, the
 * dropdown sheets, AppShell and useDeviceInfo read their insets from it — with
 * no provider they all see zero and draw under the notch and the home
 * indicator.
 */
export function SafeAreaBoundary({ enabled, children }: SafeAreaBoundaryProps) {
  const parentInsets = useContext(SafeAreaInsetsContext);
  const initialMetrics = useMemo(getInitialMetrics, []);

  if (!enabled || parentInsets) {
    return <>{children}</>;
  }

  return <SafeAreaProvider initialMetrics={initialMetrics}>{children}</SafeAreaProvider>;
}
