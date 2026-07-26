import React, { createContext, useContext } from 'react';
import { Platform, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

// Breakpoint system
export type Breakpoint = 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BREAKPOINTS = {
  base: 0,    // Mobile first (default)
  xs: 480,    // Extra small devices
  sm: 576,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 992,    // Large devices (desktops)
  xl: 1200,   // Extra large devices (large desktops)
} as const;

// Responsive value type - can be a single value or breakpoint object
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// Common responsive types
export type ResponsiveSize = ResponsiveValue<number>;
export type ResponsiveString = ResponsiveValue<string>;
export type ResponsiveBoolean = ResponsiveValue<boolean>;

// Shared breakpoint context — a single resize listener feeds all consumers
const BreakpointContext = createContext<Breakpoint | null>(null);

function computeBreakpoint(): Breakpoint {
  let width: number;
  if (Platform.OS === 'web') {
    // During web static rendering (SSR) there is no `window`; accessing it would
    // throw and blank the prerendered tree. Default to a desktop width so the
    // static HTML reflects the full desktop layout; the client recomputes on
    // mount via the resize listener in BreakpointProvider.
    width = typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.xl;
  } else {
    width = Dimensions.get('window').width;
  }

  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  if (width >= BREAKPOINTS.xs) return 'xs';
  return 'base';
}

/**
 * Provider that maintains a single resize / Dimensions listener and shares
 * the current breakpoint with all descendants via context.
 * Mount once near the root of the app (PlatformBlocksProvider does this automatically).
 */
function BreakpointProvider({ children }: { children: React.ReactNode }) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(computeBreakpoint);

  useEffect(() => {
    const update = () => {
      setBreakpoint(computeBreakpoint());
    };

    if (Platform.OS === 'web') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    } else {
      const subscription = Dimensions.addEventListener('change', update);
      return () => subscription?.remove();
    }
  }, []);

  return React.createElement(
    BreakpointContext.Provider,
    { value: breakpoint },
    children
  );
}

// Hook to get current breakpoint.
// When a BreakpointProvider is present it reads from context (zero extra listeners).
// Falls back to a local listener for standalone usage.
const useBreakpoint = (): Breakpoint => {
  const contextValue = useContext(BreakpointContext);
  
  // Fast path — provider exists, just return context value
  if (contextValue !== null) {
    return contextValue;
  }

  // Fallback — no provider, use local state + listener (backwards compatible)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(computeBreakpoint);
  
  useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(computeBreakpoint());
    };
    
    updateBreakpoint();
    
    if (Platform.OS === 'web') {
      window.addEventListener('resize', updateBreakpoint);
      return () => window.removeEventListener('resize', updateBreakpoint);
    } else {
      const subscription = Dimensions.addEventListener('change', updateBreakpoint);
      return () => subscription?.remove();
    }
  }, []);
  
  return breakpoint;
};

// Utility to check if we're on mobile
const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'base' || breakpoint === 'xs' || breakpoint === 'sm';
};

// Utility to resolve responsive values
const resolveResponsiveValue = <T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: Breakpoint
): T => {
  // If it's not an object, return the value directly
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }
  
  // Array of breakpoints in order from largest to smallest
  const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs', 'base'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  const responsiveObj = value as Partial<Record<Breakpoint, T>>;
  
  // Look for the closest breakpoint value, starting from current and going down
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (responsiveObj[bp] !== undefined) {
      return responsiveObj[bp] as T;
    }
  }
  
  // If no value found, return undefined (TypeScript will handle this)
  return undefined as T;
};

// Hook to resolve responsive values reactively
const useResponsiveValue = <T>(value: ResponsiveValue<T>): T => {
  const breakpoint = useBreakpoint();
  return resolveResponsiveValue(value, breakpoint);
};

// Utility function to create responsive styles for React Native
const createResponsiveStyle = <T extends Record<string, any>>(
  styleValue: ResponsiveValue<T>,
  breakpoint: Breakpoint
): T => {
  return resolveResponsiveValue(styleValue, breakpoint);
};

// Utility to check if a value is responsive
const isResponsiveValue = <T>(value: ResponsiveValue<T>): value is Partial<Record<Breakpoint, T>> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// CSS-in-JS style helper for web
const createResponsiveCSS = <T>(
  property: string,
  value: ResponsiveValue<T>,
  unit: string = ''
): Record<string, any> => {
  if (Platform.OS !== 'web') {
    return {};
  }
  
  if (!isResponsiveValue(value)) {
    return { [property]: `${value}${unit}` };
  }
  
  const styles: Record<string, any> = {};
  
  Object.entries(value).forEach(([bp, val]) => {
    const breakpoint = bp as Breakpoint;
    if (val !== undefined) {
      if (breakpoint === 'base') {
        styles[property] = `${val}${unit}`;
      } else {
        const mediaQuery = `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`;
        if (!styles[mediaQuery]) {
          styles[mediaQuery] = {};
        }
        styles[mediaQuery][property] = `${val}${unit}`;
      }
    }
  });
  
  return styles;
};

// Helper to get responsive padding/margin values
const getResponsiveSpacing = (
  value: ResponsiveValue<number | string>,
  breakpoint: Breakpoint,
  multiplier: number = 1
): number => {
  const resolved = resolveResponsiveValue(value, breakpoint);
  
  if (typeof resolved === 'number') {
    return resolved * multiplier;
  }
  
  if (typeof resolved === 'string') {
    // Handle string values like 'xs', 'sm', etc.
    const spacingMap = {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 40,
      '3xl': 48,
    };
    
    return (spacingMap[resolved as keyof typeof spacingMap] || 0) * multiplier;
  }
  
  return 0;
};

// Export all utilities
export {
  BREAKPOINTS,
  BreakpointProvider,
  useBreakpoint,
  useIsMobile,
  resolveResponsiveValue,
  useResponsiveValue,
  createResponsiveStyle,
  isResponsiveValue,
  createResponsiveCSS,
  getResponsiveSpacing,
};
