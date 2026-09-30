import { useBreakpoint as useResponsiveBreakpoint } from '../../../core/responsive';
import type { Breakpoint } from '../types';

/**
 * Returns the current breakpoint name, from the theme's breakpoint table
 * (`theme.breakpoints`, or a `BreakpointProvider` override): `base` below
 * `xs` (480), then `xs`, `sm` (576), `md` (768), `lg` (992), `xl` (1200).
 *
 * The shared viewport store behind it is hydration-safe: static rendering and
 * the hydration pass see the desktop default (`xl`), then the real width.
 * Re-renders only when the breakpoint changes, not on every resize.
 */
export const useBreakpoint = (): Breakpoint => useResponsiveBreakpoint();
