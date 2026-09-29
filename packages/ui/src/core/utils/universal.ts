/**
 * Universal props system for Platform Blocks components.
 *
 * @deprecated The visibility props are `VisibilityProps` (`core/types/base.ts`)
 * and are implemented once by the component factory / `useVisibility`
 * (`core/factory`). These helpers remain for back-compat.
 */

import { Platform } from 'react-native';
import { ColorScheme } from '../theme/useColorScheme';
import { DEFAULT_THEME } from '../theme/defaultTheme';
import { getBreakpoints } from '../theme/tokens';
import { getViewportSnapshot } from '../responsive/viewportStore';
import type { VisibilityProps } from '../types/base';

/** @deprecated use `VisibilityProps` from `core/types/base.ts`. */
export type UniversalProps = Pick<VisibilityProps, 'lightHidden' | 'darkHidden'>;

/** @deprecated use `VisibilityProps` from `core/types/base.ts`. */
export type ResponsiveProps = Pick<VisibilityProps, 'hiddenFrom' | 'visibleFrom'>;

/** @deprecated use `VisibilityProps` from `core/types/base.ts`. */
export type UniversalSystemProps = VisibilityProps;

/**
 * Generates CSS class names based on universal props
 */
export function getUniversalClasses(props: UniversalSystemProps): string[] {
  const classes: string[] = [];

  if (props.lightHidden) {
    classes.push('platform-blocks-light-hidden');
  }

  if (props.darkHidden) {
    classes.push('platform-blocks-dark-hidden');
  }

  if (props.hiddenFrom) {
    classes.push(`platform-blocks-hidden-from-${props.hiddenFrom}`);
  }

  if (props.visibleFrom) {
    classes.push(`platform-blocks-visible-from-${props.visibleFrom}`);
  }

  return classes;
}

/**
 * Extracts universal props from component props
 */
export function extractUniversalProps<T extends UniversalSystemProps>(
  props: T
): {
  universalProps: UniversalSystemProps;
  otherProps: Omit<T, keyof UniversalSystemProps>
} {
  const {
    lightHidden,
    darkHidden,
    hiddenFrom,
    visibleFrom,
    ...otherProps
  } = props;

  const universalProps: UniversalSystemProps = {
    lightHidden,
    darkHidden,
    hiddenFrom,
    visibleFrom
  };

  return { universalProps, otherProps };
}

/**
 * Determines if a component should be hidden based on responsive breakpoints
 * (`theme.breakpoints` of the default theme). Point-in-time: reads the shared
 * viewport store once; use `useVisibility` in components.
 */
export function shouldHideForBreakpoint(
  universalProps: ResponsiveProps
): boolean {
  if (Platform.OS === 'web') {
    // On web, let CSS handle this
    return false;
  }

  const { width } = getViewportSnapshot();
  const BREAKPOINTS = getBreakpoints(DEFAULT_THEME);

  if (universalProps.hiddenFrom) {
    const breakpoint = BREAKPOINTS[universalProps.hiddenFrom];
    if (width >= breakpoint) {
      return true;
    }
  }

  if (universalProps.visibleFrom) {
    const breakpoint = BREAKPOINTS[universalProps.visibleFrom];
    if (width < breakpoint) {
      return true;
    }
  }

  return false;
}

/**
 * Determines if a component should be hidden based on current color scheme
 * This is the primary method for React Native
 */
export function shouldHideComponent(
  universalProps: UniversalSystemProps,
  colorScheme: ColorScheme
): boolean {
  // Check color scheme hiding
  if (universalProps.lightHidden && colorScheme === 'light') {
    return true;
  }

  if (universalProps.darkHidden && colorScheme === 'dark') {
    return true;
  }

  // Check responsive hiding
  return shouldHideForBreakpoint(universalProps);
}

/**
 * Hook to get universal styles for React Native components
 * Returns style objects instead of classes
 */
export function useUniversalStyles(
  universalProps: UniversalSystemProps,
  colorScheme: ColorScheme
): { display?: 'none' | 'flex' } {
  const shouldHide = shouldHideComponent(universalProps, colorScheme);

  return shouldHide ? { display: 'none' } : {};
}