import React, { useCallback, useSyncExternalStore } from 'react';

import {
  getBreakpointForWidth,
  isBreakpointAtLeast,
  useBreakpointValues,
  type Breakpoint,
} from '../responsive';
import {
  SERVER_VIEWPORT,
  getViewportSnapshot,
  subscribeViewport,
} from '../responsive/viewportStore';
import { useTheme } from '../theme/ThemeProvider';
import type { VisibilityProps } from '../types/base';

export type { VisibilityProps };

const VISIBILITY_KEYS = ['lightHidden', 'darkHidden', 'hiddenFrom', 'visibleFrom'] as const;

/** True when any visibility prop is set (not `undefined` / `false`). */
export function hasVisibilityProps(props: object | null | undefined): boolean {
  if (!props) return false;
  const p = props as VisibilityProps;
  return Boolean(p.lightHidden || p.darkHidden || p.hiddenFrom || p.visibleFrom);
}

/** Splits the visibility props off a props object. */
export function splitVisibilityProps<P extends object>(
  props: P
): { visibility: VisibilityProps; rest: Omit<P, keyof VisibilityProps> } {
  const { lightHidden, darkHidden, hiddenFrom, visibleFrom, ...rest } = props as P & VisibilityProps;
  return { visibility: { lightHidden, darkHidden, hiddenFrom, visibleFrom }, rest: rest as Omit<P, keyof VisibilityProps> };
}

/**
 * Pure visibility rule:
 * - `lightHidden` / `darkHidden`: hidden in that color scheme;
 * - `hiddenFrom="md"`: hidden when the breakpoint is `md` or wider;
 * - `visibleFrom="md"`: shown only when the breakpoint is `md` or wider.
 */
export function isHiddenBy(
  visibility: VisibilityProps,
  colorScheme: 'light' | 'dark',
  breakpoint: Breakpoint
): boolean {
  if (visibility.lightHidden && colorScheme === 'light') return true;
  if (visibility.darkHidden && colorScheme === 'dark') return true;
  if (visibility.hiddenFrom && isBreakpointAtLeast(breakpoint, visibility.hiddenFrom)) return true;
  if (visibility.visibleFrom && !isBreakpointAtLeast(breakpoint, visibility.visibleFrom)) return true;
  return false;
}

const noopSubscribe = () => () => {};
const constantBase = (): Breakpoint => 'base';

/**
 * Whether a component with these visibility props should render.
 *
 * For components not built with `factory` (the factory calls this for you).
 * Hook-order-safe: the same hooks run whatever props are set, and the
 * viewport is only subscribed to when `hiddenFrom` / `visibleFrom` is set, so a
 * component without them never re-renders on resize. Hydration-safe: the
 * server and hydration pass assume the desktop default (`xl`).
 *
 * ```tsx
 * const visible = useVisibility(props);
 * if (!visible) return null;
 * ```
 */
export function useVisibility(props: VisibilityProps): boolean {
  const theme = useTheme();
  const values = useBreakpointValues();
  const needsViewport = Boolean(props.hiddenFrom || props.visibleFrom);

  const getSnapshot = useCallback(
    () => (needsViewport ? getBreakpointForWidth(getViewportSnapshot().width, values) : 'base'),
    [needsViewport, values]
  );
  const getServerSnapshot = useCallback(
    () => (needsViewport ? getBreakpointForWidth(SERVER_VIEWPORT.width, values) : 'base'),
    [needsViewport, values]
  );
  const breakpoint = useSyncExternalStore(
    needsViewport ? subscribeViewport : noopSubscribe,
    needsViewport ? getSnapshot : constantBase,
    needsViewport ? getServerSnapshot : constantBase
  ) as Breakpoint;

  return !isHiddenBy(props, theme.colorScheme === 'dark' ? 'dark' : 'light', breakpoint);
}

interface VisibilityGateProps extends VisibilityProps {
  children: React.ReactNode;
}

/** Renders `children` only while the visibility props allow it. */
export function VisibilityGate({ children, lightHidden, darkHidden, hiddenFrom, visibleFrom }: VisibilityGateProps) {
  const visible = useVisibility({ lightHidden, darkHidden, hiddenFrom, visibleFrom });
  return visible ? <>{children}</> : null;
}
VisibilityGate.displayName = 'VisibilityGate';

export { VISIBILITY_KEYS };
