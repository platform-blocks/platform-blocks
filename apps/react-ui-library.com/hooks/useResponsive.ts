import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

// Define breakpoints (mobile-first approach)
export const breakpoints = {
  xs: 0,    // 0px and up (mobile)
  sm: 640,  // 640px and up (large mobile)
  md: 768,  // 768px and up (tablet)
  lg: 1024, // 1024px and up (desktop)
  xl: 1280, // 1280px and up (large desktop)
  '2xl': 1536, // 1536px and up (extra large)
} as const;

export type Breakpoint = keyof typeof breakpoints;

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export function useResponsive() {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  // Get current breakpoint
  const getCurrentBreakpoint = (): Breakpoint => {
    if (screenWidth >= breakpoints['2xl']) return '2xl';
    if (screenWidth >= breakpoints.xl) return 'xl';
    if (screenWidth >= breakpoints.lg) return 'lg';
    if (screenWidth >= breakpoints.md) return 'md';
    if (screenWidth >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  // Check if current screen matches breakpoint
  const isBreakpoint = (breakpoint: Breakpoint): boolean => {
    return screenWidth >= breakpoints[breakpoint];
  };

  // Get responsive value based on current screen size
  const getResponsiveValue = <T>(values: ResponsiveValue<T> | T): T => {
    if (typeof values !== 'object' || values === null) {
      return values as T;
    }

    const responsiveValues = values as ResponsiveValue<T>;
    const currentBreakpoint = getCurrentBreakpoint();

    // Check from current breakpoint down to xs
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (responsiveValues[bp] !== undefined) {
        return responsiveValues[bp] as T;
      }
    }

    // Fallback to xs or first available value
    return responsiveValues.xs ?? Object.values(responsiveValues)[0] as T;
  };

  return {
    screenWidth,
    currentBreakpoint: getCurrentBreakpoint(),
    isBreakpoint,
    getResponsiveValue,
    // Convenience boolean helpers
    isXs: !isBreakpoint('sm'),
    isSm: isBreakpoint('sm') && !isBreakpoint('md'),
    isMd: isBreakpoint('md') && !isBreakpoint('lg'),
    isLg: isBreakpoint('lg') && !isBreakpoint('xl'),
    isXl: isBreakpoint('xl') && !isBreakpoint('2xl'),
    is2xl: isBreakpoint('2xl'),
    // Mobile/desktop helpers
    isMobile: !isBreakpoint('md'),
    isTablet: isBreakpoint('md') && !isBreakpoint('lg'),
    isDesktop: isBreakpoint('lg'),
  };
}

// Standalone hooks for specific use cases
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

export function useBreakpointValue<T>(values: ResponsiveValue<T> | T): T {
  const { getResponsiveValue } = useResponsive();
  return getResponsiveValue(values);
}

export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return width > height;
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });

    return () => subscription?.remove();
  }, []);

  return isLandscape;
}
