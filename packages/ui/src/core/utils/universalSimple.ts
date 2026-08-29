/**
 * Simple universal props system optimized for React Native (Expo)
 * Provides lightHidden/darkHidden functionality with React Native compatibility
 */

import { useEffect, useState } from 'react';
import { Platform, Dimensions } from 'react-native';

export type ColorScheme = 'light' | 'dark';

// Universal display props interface  
export interface UniversalProps {
  /** Hide component in light color scheme */
  lightHidden?: boolean;
  /** Hide component in dark color scheme */  
  darkHidden?: boolean;
}

// Responsive props (breakpoints are raw pixel widths, not named tokens)
export interface ResponsiveProps {
  /** Hide component above this screen width (pixels) */
  hiddenFrom?: number;
  /** Show component only above this screen width (pixels) */
  visibleFrom?: number;
}

// Combined props
export type UniversalSystemProps = UniversalProps & ResponsiveProps;

/**
 * Width used when there is no viewport to measure — web static rendering (SSR),
 * where touching `window` would throw. Matches the `xl` breakpoint so prerendered
 * HTML reflects the desktop layout; the client remeasures on mount.
 */
const SSR_FALLBACK_WIDTH = 1200;

/** Current viewport width on either platform. */
export function getViewportWidth(): number {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.innerWidth : SSR_FALLBACK_WIDTH;
  }
  return Dimensions.get('window').width;
}

function hasResponsiveProps(props: UniversalSystemProps): boolean {
  return props.hiddenFrom !== undefined || props.visibleFrom !== undefined;
}

function isHiddenForWidth(props: UniversalSystemProps, width: number): boolean {
  if (props.hiddenFrom !== undefined && width >= props.hiddenFrom) return true;
  if (props.visibleFrom !== undefined && width < props.visibleFrom) return true;
  return false;
}

/**
 * Viewport width that re-renders on resize (web) or orientation/size change (native).
 * `enabled` is false when the caller has no responsive props, so components that
 * never use them don't pay for a resize listener.
 */
export function useViewportWidth(enabled: boolean = true): number {
  const [width, setWidth] = useState(() => (enabled ? getViewportWidth() : SSR_FALLBACK_WIDTH));

  useEffect(() => {
    if (!enabled) return;

    const update = () => setWidth(getViewportWidth());
    // Remeasure on mount: the first value may come from SSR, or the window may
    // have been resized between the initial render and this effect.
    update();

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    const subscription = Dimensions.addEventListener('change', update);
    return () => subscription?.remove();
  }, [enabled]);

  return width;
}

/**
 * Determines if component should be hidden based on universal props.
 * Point-in-time check — it reads the viewport once and does not re-render on
 * resize. Prefer `useShouldHideComponent` inside components.
 */
export function shouldHideComponent(
  props: UniversalSystemProps,
  colorScheme: ColorScheme
): boolean {
  // Check color scheme hiding
  if (props.lightHidden && colorScheme === 'light') return true;
  if (props.darkHidden && colorScheme === 'dark') return true;

  // Check responsive hiding — on web too: these props are pixel widths, so there
  // is no matching breakpoint class in the global universal CSS to fall back on.
  if (!hasResponsiveProps(props)) return false;

  return isHiddenForWidth(props, getViewportWidth());
}

/**
 * Reactive version of `shouldHideComponent` — recomputes when the viewport changes.
 */
export function useShouldHideComponent(
  props: UniversalSystemProps,
  colorScheme: ColorScheme
): boolean {
  const width = useViewportWidth(hasResponsiveProps(props));

  if (props.lightHidden && colorScheme === 'light') return true;
  if (props.darkHidden && colorScheme === 'dark') return true;
  if (!hasResponsiveProps(props)) return false;

  return isHiddenForWidth(props, width);
}

/**
 * Simple hook to check if component should render
 */
export function useUniversalProps(
  props: UniversalSystemProps,
  colorScheme: ColorScheme
): { shouldRender: boolean } {
  const shouldRender = !useShouldHideComponent(props, colorScheme);
  return { shouldRender };
}

/**
 * Extract universal props from component props
 */
export function extractUniversalProps<T extends UniversalSystemProps>(
  props: T
): {
  universalProps: UniversalSystemProps;
  componentProps: Omit<T, keyof UniversalSystemProps>;
} {
  const {
    lightHidden,
    darkHidden, 
    hiddenFrom,
    visibleFrom,
    ...componentProps
  } = props;

  return {
    universalProps: { lightHidden, darkHidden, hiddenFrom, visibleFrom },
    componentProps: componentProps as Omit<T, keyof UniversalSystemProps>
  };
}
