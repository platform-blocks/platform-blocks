import type { Breakpoint } from '../types';
import { useBreakpoint as useResponsiveBreakpoint } from '../../../core/responsive';

// Central breakpoint values (keep in sync with design tokens if needed)
export const BREAKPOINT_VALUES = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

export const useBreakpoint = (): Breakpoint => useResponsiveBreakpoint();
