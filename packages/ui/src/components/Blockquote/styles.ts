import { StyleSheet } from 'react-native';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { resolveSurface, surfaceInteractionTint } from '../../core/theme/surfaces';

interface StyleConfig {
  variant: 'default' | 'testimonial' | 'featured' | 'minimal';
  size: ComponentSizeValue;
  alignment: 'left' | 'center' | 'right';
  border: boolean;
  shadow: boolean;
  color?: string;
  /** Resolved pixel size of the quote glyph — decides how much room it needs. */
  quoteIconSize: number;
  quoteIconPosition: 'top-left' | 'top-center' | 'bottom-right' | 'none';
}

export const createBlockquoteStyles = (theme: PlatformBlocksTheme, config: StyleConfig) => {
  const { variant, size, alignment, border, shadow, color, quoteIconSize, quoteIconPosition } = config;

  const isDefault = variant === 'default';
  // The default variant keeps its glyph inside the padding box rather than
  // stuck to the outer corner, so these double as the glyph's origin.
  const padY = parseInt(theme.spacing.lg);
  const padX = parseInt(theme.spacing.xl);

  // Size mappings
  const sizeMap: Partial<Record<ComponentSize, { fontSize: number; lineHeight: number; iconSize: number }>> = {
    xs: { fontSize: 14, lineHeight: 20, iconSize: 20 },
    sm: { fontSize: 16, lineHeight: 22, iconSize: 24 },
    md: { fontSize: 18, lineHeight: 26, iconSize: 28 },
    lg: { fontSize: 22, lineHeight: 32, iconSize: 36 },
    xl: { fontSize: 28, lineHeight: 38, iconSize: 44 },
  };
  
  const currentSize = resolveComponentSize(size, sizeMap, {
    fallback: 'md',
    allowedSizes: ['xs', 'sm', 'md', 'lg', 'xl'],
  });
  const sizeTokens = typeof currentSize === 'number'
    ? { fontSize: currentSize, lineHeight: currentSize * 1.4, iconSize: currentSize * 1.6 }
    : currentSize ?? sizeMap.md!;
  
  // Variant-specific styles
  const variantStyles = {
    default: {
      // A tinted band on whatever it's quoted within. `gray[0]` was the page
      // background itself in dark mode, so the quote had no visible body.
      backgroundColor: surfaceInteractionTint(theme, 'band'),
      borderRadius: parseInt(theme.radii.lg),
      paddingVertical: padY,
      paddingHorizontal: padX,
    },
    testimonial: {
      // Card-like — resting content, level 1.
      backgroundColor: resolveSurface(theme, 1).background,
      borderRadius: 8,
      padding: parseInt(theme.spacing.xl),
      ...(shadow && {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
      }),
    },
    featured: {
      backgroundColor: 'transparent',
      padding: parseInt(theme.spacing.xl),
      alignItems: 'center' as const,
    },
    minimal: {
      backgroundColor: 'transparent',
      padding: parseInt(theme.spacing.md),
    },
  };

  return StyleSheet.create({
    container: {
      ...variantStyles[variant],
      ...(border && {
        borderWidth: 1,
        borderColor: theme.colors.gray[2],
      }),
      alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
    },

    content: {
      position: 'relative',
      width: '100%',
      // The glyph leads the quote instead of sitting behind it, so the text
      // starts below the space it occupies.
      ...(isDefault && quoteIconPosition === 'top-left' && {
        paddingTop: quoteIconSize + parseInt(theme.spacing.xs),
      }),
    },

    pressed: {
      opacity: 0.7,
    },
    
    quoteIcon: {
      opacity: 0.3,
    },
    
    quoteIconBottomRight: {
      bottom: -8,
      right: -8,
    },
    
    quoteIconContainer: {
      position: 'absolute',
      zIndex: 1,
    },
    
    quoteIconTopCenter: {
      alignSelf: 'center',
      left: '50%',
      top: -12,
      // Centred on the glyph's own width — `sizeTokens.iconSize` tracks the
      // quote's text size, not the glyph, and pulled it off-centre.
      transform: [{ translateX: -quoteIconSize / 2 }],
    },

    quoteIconTopLeft: isDefault
      // Absolute children resolve against the padding box, so the padding
      // values put the glyph exactly where the first line would have started.
      ? { left: padX, top: padY }
      : { left: -8, top: -8 },
    
    quoteText: {
      color: color || theme.text.primary,
      fontSize: sizeTokens.fontSize,
      fontStyle: variant === 'featured' ? 'italic' : 'normal',
      lineHeight: sizeTokens.lineHeight,
      textAlign: alignment,
      ...(variant === 'featured' && {
        fontWeight: '600',
      }),
    },
  });
};