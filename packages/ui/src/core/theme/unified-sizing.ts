import { SizeValue } from '../theme/types';
import { PlatformBlocksTheme } from '../theme/types';

/**
 * Unified sizing system for all UI components
 * This ensures consistent spacing, heights, and typography across the library
 */

export interface ComponentSizeConfig {
  fontSize: number;
  padding: number;
  height: number;
  iconSize: number;
  borderRadius: number;
}

export const COMPONENT_SIZES: Record<SizeValue, ComponentSizeConfig> = {
  xs: {
    fontSize: 12,
    padding: 8,
    height: 32,
    iconSize: 12,
    borderRadius: 4,
  },
  sm: {
    fontSize: 14,
    padding: 10,
    height: 36,
    iconSize: 14,
    borderRadius: 6,
  },
  md: {
    fontSize: 16,
    padding: 12,
    height: 40,
    iconSize: 16,
    borderRadius: 8,
  },
  lg: {
    fontSize: 18,
    padding: 14,
    height: 44,
    iconSize: 18,
    borderRadius: 10,
  },
  xl: {
    fontSize: 20,
    padding: 16,
    height: 48,
    iconSize: 20,
    borderRadius: 12,
  },
  '2xl': {
    fontSize: 24,
    padding: 20,
    height: 52,
    iconSize: 24,
    borderRadius: 14,
  },
  '3xl': {
    fontSize: 28,
    padding: 24,
    height: 56,
    iconSize: 28,
    borderRadius: 16,
  },
};

/**
 * Get unified size configuration for any component
 */
export function getComponentSize(size: SizeValue = 'md'): ComponentSizeConfig {
  // `SizeValue` allows numbers and arbitrary tokens, so a direct lookup can miss.
  // Fall back to the default config rather than returning `undefined` (which would
  // crash callers that read e.g. `.iconSize`).
  return (typeof size === 'string' && COMPONENT_SIZES[size as keyof typeof COMPONENT_SIZES]) || COMPONENT_SIZES.md;
}

/**
 * Create consistent interactive element styles (buttons, inputs, etc.)
 */
export function createInteractiveStyles(
  theme: PlatformBlocksTheme,
  size: SizeValue = 'md',
  variant: 'filled' | 'outline' | 'ghost' = 'filled',
  state: 'default' | 'hover' | 'focus' | 'disabled' = 'default'
) {
  const sizeConfig = getComponentSize(size);
  
  const baseStyles = {
    minHeight: sizeConfig.height,
    paddingHorizontal: sizeConfig.padding,
    paddingVertical: Math.round(sizeConfig.padding * 0.5),
    borderRadius: sizeConfig.borderRadius,
    fontSize: sizeConfig.fontSize,
    borderWidth: variant === 'outline' ? 1 : 0,
  };

  const stateStyles = {
    default: {
      opacity: 1,
    },
    hover: {
      opacity: 0.9,
    },
    focus: {
      // Focus is a primary-colored border, not an outer ring/glow.
      borderColor: theme.colors.primary[5],
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.gray[1],
      color: theme.text.disabled,
    },
  };

  return {
    ...baseStyles,
    ...stateStyles[state],
  };
}

/**
 * Consistent icon sizing within components
 */
export function getIconSize(componentSize: SizeValue = 'md', context: 'default' | 'small' | 'large' = 'default'): number {
  const sizeConfig = getComponentSize(componentSize);
  
  switch (context) {
    case 'small': // For things like clear buttons, dropdown arrows
      return Math.max(12, sizeConfig.iconSize - 2);
    case 'large': // For primary icons in buttons
      return sizeConfig.iconSize + 2;
    default:
      return sizeConfig.iconSize;
  }
}

/**
 * Consistent spacing for component sections (left/right sections, gaps, etc.)
 */
export function getSectionSpacing(size: SizeValue = 'md'): number {
  const sizeConfig = getComponentSize(size);
  return Math.round(sizeConfig.padding * 0.5);
}