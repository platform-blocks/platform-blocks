// Enhanced border radius system for React UI Library
import { SizeValue, resolveSize } from './sizes';

export type RadiusValue = 
  | SizeValue 
  | 'none' 
  | 'full'
  | 'chip';

/**
 * Enhanced radius scale with special values
 */
export const RADIUS_SCALE = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999, // Large enough to be fully rounded for any component
  chip: 9999  // Alias for full
} as const;

/**
 * Get border radius value from radius token or number
 * @param value - Radius value (string token, number, or special value)
 * @param componentHeight - Height of component for chip/full calculation
 * @returns Resolved border radius as number
 */
export function getBorderRadius(
  value: RadiusValue | undefined,
  componentHeight?: number
): number {
  // Default to md if undefined
  if (value === undefined) {
    return RADIUS_SCALE.md;
  }

  // Handle numeric values
  if (typeof value === 'number') {
    return value;
  }

  // Handle special values
  if (value === 'none') {
    return 0;
  }

  if (value === 'full' || value === 'chip') {
    // For full/chip, use half the component height if available, otherwise use large value
    return componentHeight ? componentHeight / 2 : RADIUS_SCALE.full;
  }

  // Handle size tokens
  if (value in RADIUS_SCALE) {
    return RADIUS_SCALE[value as keyof typeof RADIUS_SCALE];
  }

  // Fallback to md
  return RADIUS_SCALE.md;
}

/**
 * Get component-specific default radius
 */
export const COMPONENT_RADIUS_DEFAULTS = {
  button: 'md' as RadiusValue,
  card: 'lg' as RadiusValue,
  chip: 'chip' as RadiusValue,
  input: 'lg' as RadiusValue,
  modal: 'lg' as RadiusValue,
  tooltip: 'sm' as RadiusValue,
  alert: 'md' as RadiusValue,
  badge: 0 as RadiusValue,
  indicator: 'full' as RadiusValue,
  codeBlock: 'md' as RadiusValue,
  progress: 'chip' as RadiusValue,
  switch: 'chip' as RadiusValue,
  checkbox: 'sm' as RadiusValue,
  radio: 'full' as RadiusValue,
  slider: 'chip' as RadiusValue,
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

/**
 * Create border radius styles object for React Native
 */
export function createRadiusStyles(
  radius: RadiusValue | undefined,
  componentHeight?: number,
  componentType?: keyof typeof COMPONENT_RADIUS_DEFAULTS
) {
  // Use component default if no radius specified
  const effectiveRadius = radius ?? (componentType ? getComponentDefaultRadius(componentType) : 'md');
  
  const borderRadius = getBorderRadius(effectiveRadius, componentHeight);
  
  return {
    borderRadius,
    // Also provide individual corner properties for advanced usage
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
  };
}

/**
 * Border radius utilities for specific corners
 */
export interface CornerRadiusProps extends BorderRadiusProps {
  /** Top-left corner radius */
  radiusTopLeft?: RadiusValue;
  /** Top-right corner radius */
  radiusTopRight?: RadiusValue;
  /** Bottom-left corner radius */
  radiusBottomLeft?: RadiusValue;
  /** Bottom-right corner radius */
  radiusBottomRight?: RadiusValue;
  /** Top corners radius (overrides individual top corners) */
  radiusTop?: RadiusValue;
  /** Bottom corners radius (overrides individual bottom corners) */
  radiusBottom?: RadiusValue;
  /** Left corners radius (overrides individual left corners) */
  radiusLeft?: RadiusValue;
  /** Right corners radius (overrides individual right corners) */
  radiusRight?: RadiusValue;
}

/**
 * Create advanced border radius styles with individual corner control
 */
export function createAdvancedRadiusStyles(
  props: CornerRadiusProps,
  componentHeight?: number,
  componentType?: keyof typeof COMPONENT_RADIUS_DEFAULTS
) {
  const {
    radius,
    radiusTopLeft,
    radiusTopRight,
    radiusBottomLeft,
    radiusBottomRight,
    radiusTop,
    radiusBottom,
    radiusLeft,
    radiusRight,
  } = props;

  // Base radius
  const baseRadius = radius ?? (componentType ? getComponentDefaultRadius(componentType) : 'md');
  const baseBorderRadius = getBorderRadius(baseRadius, componentHeight);

  // Calculate individual corners with precedence:
  // 1. Individual corner props (radiusTopLeft, etc.)
  // 2. Side props (radiusTop, radiusBottom, etc.)
  // 3. Base radius prop
  // 4. Component default

  const topLeftRadius = getBorderRadius(
    radiusTopLeft ?? radiusTop ?? radiusLeft ?? baseRadius,
    componentHeight
  );
  
  const topRightRadius = getBorderRadius(
    radiusTopRight ?? radiusTop ?? radiusRight ?? baseRadius,
    componentHeight
  );
  
  const bottomLeftRadius = getBorderRadius(
    radiusBottomLeft ?? radiusBottom ?? radiusLeft ?? baseRadius,
    componentHeight
  );
  
  const bottomRightRadius = getBorderRadius(
    radiusBottomRight ?? radiusBottom ?? radiusRight ?? baseRadius,
    componentHeight
  );

  return {
    borderTopLeftRadius: topLeftRadius,
    borderTopRightRadius: topRightRadius,
    borderBottomLeftRadius: bottomLeftRadius,
    borderBottomRightRadius: bottomRightRadius,
    // Include the general borderRadius for backward compatibility
    borderRadius: baseBorderRadius,
  };
}

export default {
  getBorderRadius,
  createRadiusStyles,
  createAdvancedRadiusStyles,
  RADIUS_SCALE,
  COMPONENT_RADIUS_DEFAULTS,
  getComponentDefaultRadius,
};
