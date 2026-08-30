import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppShell, useToastViewportOffset } from '@platform-blocks/react-ui-library';

const coerce = (value: number | string, fallback = 0): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Publishes the app-shell layout to the toast layer so notifications never sit
 * under the header / status bar (or over the footer, bottom nav, or side rails).
 *
 * The ToastProvider lives above the AppShell in the tree and can't read its
 * context directly; this bridge is rendered *inside* the shell and pushes the
 * resolved offsets up via `useToastViewportOffset`. Mirrors the shell's own
 * content-offset math (header + safe-area inset on mobile).
 */
export const ToastShellOffsetBridge: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    headerHeight,
    footerHeight,
    navbarWidth,
    asideWidth,
    bottomNavHeight,
    isMobile,
  } = useAppShell();

  // Safe-area insets are zeroed on web, matching AppShell's own behavior.
  const topInset = Platform.OS === 'web' ? 0 : insets.top || 0;
  const bottomInset = Platform.OS === 'web' ? 0 : insets.bottom || 0;

  const top = coerce(headerHeight, 60) + (isMobile ? topInset : 0);
  const bottom = isMobile
    ? coerce(bottomNavHeight) + bottomInset
    : coerce(footerHeight);
  // Side rails only reserve space on desktop; the drawer navbar overlays on mobile.
  const left = isMobile ? 0 : coerce(navbarWidth);
  const right = isMobile ? 0 : coerce(asideWidth);

  useToastViewportOffset({ top, bottom, left, right });

  return null;
};

export default ToastShellOffsetBridge;
