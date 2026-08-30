// Enhanced shadow system for React UI Library
import { Platform } from 'react-native';
import { SizeValue } from './sizes';
import { PlatformBlocksTheme } from './types';

export type ShadowValue = 
  | SizeValue 
  | 'none';

/**
 * Shadow props interface for components
 */
export interface ShadowProps {
  /** Shadow value - supports size tokens and 'none' */
  shadow?: ShadowValue;
}

/**
 * Get shadow value from shadow token
 * @param value - Shadow value (string token or 'none')
 * @param theme - PlatformBlocks theme object
 * @returns Resolved shadow string or undefined for none
 */
export function getShadowValue(
  value: ShadowValue | undefined,
  theme: PlatformBlocksTheme
): string | undefined {
  // No shadow
  if (value === 'none' || value === undefined) {
    return undefined;
  }

  // Handle size tokens. Guard the lookup — partial themes (and test doubles)
  // legitimately omit `shadows`, and `in` throws on undefined.
  if (theme?.shadows && value in theme.shadows) {
    return theme.shadows[value as keyof typeof theme.shadows];
  }

  // Fallback to undefined (no shadow)
  return undefined;
}

/**
 * Component-specific default shadows
 */
export const COMPONENT_SHADOW_DEFAULTS = {
  button: 'sm' as ShadowValue,
  badge: 'sm' as ShadowValue,
  // Single knob for a resting Card. `xs` is one soft layer; `sm` and above add
  // a second pass that reads as lifted — `Card variant="elevated"` opts into that.
  card: 'xs' as ShadowValue,
  chip: 'sm' as ShadowValue,
  modal: 'xl' as ShadowValue,
  tooltip: 'md' as ShadowValue,
  alert: 'sm' as ShadowValue,
  dialog: 'lg' as ShadowValue,
  dropdown: 'md' as ShadowValue,
  popover: 'md' as ShadowValue,
  toast: 'lg' as ShadowValue,
  fab: 'lg' as ShadowValue, // Floating Action Button
  appBar: 'sm' as ShadowValue,
  drawer: 'lg' as ShadowValue,
} as const;

/**
 * Get the default shadow for a specific component type
 */
export function getComponentDefaultShadow(
  componentType: keyof typeof COMPONENT_SHADOW_DEFAULTS
): ShadowValue {
  return COMPONENT_SHADOW_DEFAULTS[componentType];
}

/**
 * Create shadow styles object for React Native
 */
export function createShadowStyles(
  shadow: ShadowValue | undefined,
  theme: PlatformBlocksTheme,
  componentType?: keyof typeof COMPONENT_SHADOW_DEFAULTS
) {
  // Use component default if no shadow specified
  const effectiveShadow = shadow ?? (componentType ? getComponentDefaultShadow(componentType) : undefined);
  
  const shadowValue = getShadowValue(effectiveShadow, theme);
  
  if (!shadowValue) {
    return {};
  }

  // For web, use boxShadow directly to avoid deprecation warnings
  if (Platform.OS === 'web') {
    return {
      boxShadow: shadowValue,
    };
  }

  // Parse shadow string to extract values for React Native
  // CSS shadow format: "offsetX offsetY blurRadius spreadRadius? color"
  // React Native needs: shadowOffset, shadowRadius, shadowColor, shadowOpacity
  
  // Split by comma to handle multiple shadows (use the first one)
  const firstShadow = shadowValue.split(',')[0].trim();
  
  // Match shadow components: offset-x offset-y blur-radius spread-radius? color
  const shadowMatch = firstShadow.match(
    /(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)\s+(-?\d+(?:\.\d+)?px)(?:\s+(-?\d+(?:\.\d+)?px))?\s+(rgba?\([^)]+\)|#[0-9a-fA-F]+|\w+)/
  );
  
  if (!shadowMatch) {
    // Fallback for simple shadows or parsing errors
    return {
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowColor: '#000000',
      shadowOpacity: 0.1,
      elevation: 3, // Android elevation
    };
  }

  const [, offsetX, offsetY, blurRadius, , color] = shadowMatch;
  
  // Parse values
  const shadowOffsetX = parseFloat(offsetX.replace('px', ''));
  const shadowOffsetY = parseFloat(offsetY.replace('px', ''));
  const shadowRadiusValue = parseFloat(blurRadius.replace('px', ''));
  
  // Parse color and opacity
  let shadowColor = '#000000';
  let shadowOpacity = 0.1;
  
  if (color.startsWith('rgba(')) {
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (rgbaMatch) {
      const [, r, g, b, a] = rgbaMatch;
      shadowColor = `rgb(${r}, ${g}, ${b})`;
      shadowOpacity = parseFloat(a);
    }
  } else if (color.startsWith('rgb(')) {
    shadowColor = color;
    shadowOpacity = 0.1;
  } else if (color.startsWith('#')) {
    shadowColor = color;
    shadowOpacity = 0.1;
  }

  // Calculate Android elevation based on shadow intensity
  const elevation = Math.max(1, Math.round(shadowRadiusValue / 2));

  return {
    shadowOffset: { 
      width: shadowOffsetX, 
      height: shadowOffsetY 
    },
    shadowRadius: shadowRadiusValue,
    shadowColor,
    shadowOpacity,
    elevation, // Android shadow
  };
}

/**
 * Utility to get shadow styles with theme context
 */
export function useShadowStyles(
  shadow: ShadowValue | undefined,
  theme: PlatformBlocksTheme,
  componentType?: keyof typeof COMPONENT_SHADOW_DEFAULTS
) {
  return createShadowStyles(shadow, theme, componentType);
}

export default {
  getShadowValue,
  createShadowStyles,
  useShadowStyles,
  COMPONENT_SHADOW_DEFAULTS,
  getComponentDefaultShadow,
};
