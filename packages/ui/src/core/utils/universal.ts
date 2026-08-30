/**
 * Universal props system for React UI Library components
 * Provides props that can be applied to all components in the library
 * Optimized for React Native (Expo) with web compatibility
 */

import { Platform, Dimensions } from 'react-native';
import { ColorScheme } from '../theme/useColorScheme';

// Universal display props interface
export interface UniversalProps {
  /** Determines whether component should be hidden in light color scheme */
  lightHidden?: boolean;
  /** Determines whether component should be hidden in dark color scheme */
  darkHidden?: boolean;
}

// Additional breakpoint-based visibility props (optional)
export interface ResponsiveProps {
  /** Hide component above this breakpoint */
  hiddenFrom?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show component only above this breakpoint */
  visibleFrom?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Combined props
export type UniversalSystemProps = UniversalProps & ResponsiveProps;

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

// Breakpoint pixel values for responsive props
const BREAKPOINTS = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1400
} as const;

/**
 * Determines if a component should be hidden based on responsive breakpoints
 */
export function shouldHideForBreakpoint(
  universalProps: ResponsiveProps
): boolean {
  if (Platform.OS === 'web') {
    // On web, let CSS handle this
    return false;
  }

  const { width } = Dimensions.get('window');

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