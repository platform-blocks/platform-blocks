// Border radius scale and per-component defaults
import type { RadiusValue } from '../types/base';
import { DEFAULT_RADIUS_SCALE } from './scales';

export type { RadiusValue };

/**
 * Enhanced radius scale with special values — the default theme's `radii`.
 */
export const RADIUS_SCALE = {
  none: 0,
  ...DEFAULT_RADIUS_SCALE,
  full: 9999, // Large enough to be fully rounded for any component
} as const;

/**
 * Get component-specific default radius
 */
export const COMPONENT_RADIUS_DEFAULTS = {
  button: 'md' as RadiusValue,
  card: 'lg' as RadiusValue,
  chip: 'full' as RadiusValue,
  input: 'lg' as RadiusValue,
  modal: 'lg' as RadiusValue,
  tooltip: 'sm' as RadiusValue,
  alert: 'md' as RadiusValue,
  badge: 0 as RadiusValue,
  indicator: 'full' as RadiusValue,
  codeBlock: 'md' as RadiusValue,
  progress: 'full' as RadiusValue,
  switch: 'full' as RadiusValue,
  checkbox: 'sm' as RadiusValue,
  radio: 'full' as RadiusValue,
  slider: 'full' as RadiusValue,
} as const;

/**
 * Border radius props interface for components
 */
export interface BorderRadiusProps {
  /** Border radius value - supports size tokens, numbers, and special values */
  radius?: RadiusValue;
}

/**
 * Get the default radius for a specific component type
 */
export function getComponentDefaultRadius(
  componentType: keyof typeof COMPONENT_RADIUS_DEFAULTS
): RadiusValue {
  return COMPONENT_RADIUS_DEFAULTS[componentType];
}

export default {
  RADIUS_SCALE,
  COMPONENT_RADIUS_DEFAULTS,
  getComponentDefaultRadius,
};
