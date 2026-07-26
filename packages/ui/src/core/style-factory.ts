import { ViewStyle, TextStyle } from 'react-native';
import { PlatformBlocksTheme, SizeValue } from './theme/types';
import { createRadiusStyles } from './theme/radius';
import { DESIGN_TOKENS } from './design-tokens';
import { getComponentSize } from './theme/unified-sizing';

/**
 * Factory for creating consistent component styles
 * This centralizes styling logic and ensures consistency across components
 */

export interface StyleFactoryConfig {
  component: 'input' | 'button' | 'card' | 'badge' | 'select' | 'generic';
  variant?: string;
  size?: SizeValue;
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
  radius?: any;
}

// ---------------------------------------------------------------------------
// Style cache — avoids recomputing identical style objects across renders.
// Keyed by a string derived from the config + theme identity.
// Uses a bounded LRU-style Map (oldest entries evicted first).
// ---------------------------------------------------------------------------
const CACHE_MAX = 256;
const styleCache = new Map<string, { container: ViewStyle; content: ViewStyle; text: TextStyle }>();

function buildCacheKey(theme: PlatformBlocksTheme, config: StyleFactoryConfig): string {
  return `${theme.colorScheme}|${theme.primaryColor}|${config.component}|${config.variant ?? 'default'}|${config.size ?? 'md'}|${config.disabled ? 1 : 0}|${config.error ? 1 : 0}|${config.focused ? 1 : 0}|${config.radius ?? 'md'}|${theme.fontFamily}`;
}

/**
 * Base component style factory — now backed by a bounded cache.
 * Repeated calls with identical theme + config return the same object reference.
 */
export function createComponentStyles(
  theme: PlatformBlocksTheme,
  config: StyleFactoryConfig
): {
  container: ViewStyle;
  content: ViewStyle;
  text: TextStyle;
} {
  // --- cache lookup ---
  const cacheKey = buildCacheKey(theme, config);
  const cached = styleCache.get(cacheKey);
  if (cached) return cached;

  const {
    component,
    variant = 'default',
    size = 'md',
    disabled = false,
    error = false,
    focused = false,
    radius,
  } = config;

  const sizeConfig = getComponentSize(size);
  const radiusStyles = createRadiusStyles(radius || 'md');

  // Base styles all components share
  const baseContainer: ViewStyle = {
    ...radiusStyles,
    minHeight: sizeConfig.height,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const baseContent: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const baseText: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontFamily: theme.fontFamily,
    color: disabled ? theme.text.disabled : theme.text.primary,
  };

  // Component-specific styles
  let result: { container: ViewStyle; content: ViewStyle; text: TextStyle };

  switch (component) {
    case 'input':
      result = createInputComponentStyles(theme, config, baseContainer, baseContent, baseText);
      break;
    
    case 'button':
      result = createButtonComponentStyles(theme, config, baseContainer, baseContent, baseText);
      break;
    
    case 'card':
      result = createCardComponentStyles(theme, config, baseContainer, baseContent, baseText);
      break;
    
    case 'badge':
      result = createBadgeComponentStyles(theme, config, baseContainer, baseContent, baseText);
      break;
    
    case 'select':
      result = createSelectComponentStyles(theme, config, baseContainer, baseContent, baseText);
      break;
    
    default:
      result = {
        container: baseContainer,
        content: baseContent,
        text: baseText,
      };
  }

  // --- cache store (evict oldest if full) ---
  if (styleCache.size >= CACHE_MAX) {
    const firstKey = styleCache.keys().next().value;
    if (firstKey !== undefined) styleCache.delete(firstKey);
  }
  styleCache.set(cacheKey, result);

  return result;
}

function createInputComponentStyles(
  theme: PlatformBlocksTheme,
  config: StyleFactoryConfig,
  baseContainer: ViewStyle,
  baseContent: ViewStyle,
  baseText: TextStyle
) {
  const { size = 'md', disabled, error, focused } = config;
  const sizeConfig = getComponentSize(size);

  const container: ViewStyle = {
    ...baseContainer,
    flexDirection: 'row',
    paddingHorizontal: sizeConfig.padding,
    paddingVertical: Math.round(sizeConfig.padding * 0.5),
    backgroundColor: disabled
      ? (theme.colorScheme === 'dark' ? '#2C2C2E' : theme.colors.gray[0])
      : theme.backgrounds.surface,
    borderWidth: 1,
    borderColor: error
      ? theme.colors.error[5]
      : focused
        ? theme.colors.primary[5]
        : disabled
          ? theme.backgrounds.border
          : 'transparent',
    // No focus ring/glow — focus is carried by `borderColor` above.
    // Subtle shadow
    ...(!disabled && theme.colorScheme === 'light' && {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    }),
    elevation: disabled ? 0 : 1,
  };

  const content: ViewStyle = {
    ...baseContent,
    flex: 1,
    justifyContent: 'flex-start',
  };

  const text: TextStyle = {
    ...baseText,
    textAlignVertical: 'center',
  };

  return { container, content, text };
}

function createButtonComponentStyles(
  theme: PlatformBlocksTheme,
  config: StyleFactoryConfig,
  baseContainer: ViewStyle,
  baseContent: ViewStyle,
  baseText: TextStyle
) {
  const { variant = 'filled', size = 'md', disabled } = config;
  const sizeConfig = getComponentSize(size);

  const variants = {
    filled: {
      backgroundColor: disabled ? theme.colors.gray[2] : theme.colors.primary[5],
      borderWidth: 0,
      color: theme.text.onPrimary || '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? theme.colors.gray[3] : theme.colors.primary[5],
      color: disabled ? theme.text.disabled : theme.colors.primary[5],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      color: disabled ? theme.text.disabled : theme.colors.primary[5],
    },
  };

  const variantStyles = variants[variant as keyof typeof variants] || variants.filled;

  const container: ViewStyle = {
    ...baseContainer,
    paddingHorizontal: sizeConfig.padding,
    paddingVertical: Math.round(sizeConfig.padding * 0.5),
    ...variantStyles,
    opacity: disabled ? DESIGN_TOKENS.opacity.disabled : 1,
  };

  const text: TextStyle = {
    ...baseText,
    color: variantStyles.color,
    fontWeight: '600',
  };

  return { container, content: baseContent, text };
}

function createCardComponentStyles(
  theme: PlatformBlocksTheme,
  config: StyleFactoryConfig,
  baseContainer: ViewStyle,
  baseContent: ViewStyle,
  baseText: TextStyle
) {
  const { variant = 'default', size = 'md' } = config;
  const sizeConfig = getComponentSize(size);

  const variants = {
    default: {
      backgroundColor: theme.backgrounds.surface,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: theme.backgrounds.surface,
      borderWidth: 1,
      borderColor: theme.backgrounds.border,
    },
    elevated: {
      backgroundColor: theme.backgrounds.elevated,
      ...DESIGN_TOKENS.shadow.md && { boxShadow: DESIGN_TOKENS.shadow.md },
      elevation: 2,
    },
  };

  const variantStyles = variants[variant as keyof typeof variants] || variants.default;

  const container: ViewStyle = {
    ...baseContainer,
    padding: sizeConfig.padding,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    ...variantStyles,
  };

  return { container, content: baseContent, text: baseText };
}

function createBadgeComponentStyles(
  theme: PlatformBlocksTheme,
  config: StyleFactoryConfig,
  baseContainer: ViewStyle,
  baseContent: ViewStyle,
  baseText: TextStyle
) {
  const { variant = 'filled', size = 'sm' } = config;
  const sizeConfig = getComponentSize(size);

  const container: ViewStyle = {
    ...baseContainer,
    minHeight: Math.max(20, sizeConfig.height * 0.6),
    paddingHorizontal: Math.max(6, sizeConfig.padding * 0.5),
    paddingVertical: 2,
    backgroundColor: theme.colors.primary[5],
  };

  const text: TextStyle = {
    ...baseText,
    fontSize: Math.max(10, sizeConfig.fontSize * 0.75),
    fontWeight: '600',
    color: theme.text.onPrimary || '#ffffff',
  };

  return { container, content: baseContent, text };
}

function createSelectComponentStyles(
  theme: PlatformBlocksTheme,
  config: StyleFactoryConfig,
  baseContainer: ViewStyle,
  baseContent: ViewStyle,
  baseText: TextStyle
) {
  // Select uses same styles as input but with different content alignment
  const inputStyles = createInputComponentStyles(theme, config, baseContainer, baseContent, baseText);
  
  return {
    ...inputStyles,
    content: {
      ...inputStyles.content,
      justifyContent: 'space-between' as const, // Space between content and dropdown arrow
    },
  };
}