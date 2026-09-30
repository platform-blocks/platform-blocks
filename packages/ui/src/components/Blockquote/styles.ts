import { StyleSheet, type ViewStyle } from 'react-native';

import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { resolveSurface, surfaceInteractionTint } from '../../core/theme/surfaces';
import { resolveFontSize, resolveRadius, resolveShadow, resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeToken, SizeValue } from '../../core/theme/types';

export type BlockquoteVariant = 'default' | 'testimonial' | 'featured' | 'minimal';
export type BlockquoteAlignment = 'left' | 'center' | 'right';
export type BlockquoteIconPosition = 'top-left' | 'top-center' | 'bottom-right' | 'none';

/**
 * Quotes are display text: each size reads two steps up the theme's font scale
 * (md → `fontSizes.xl`).
 */
const QUOTE_FONT_STEP: Record<SizeToken, SizeToken> = {
  xs: 'md',
  sm: 'lg',
  md: 'xl',
  lg: '2xl',
  xl: '3xl',
  '2xl': '3xl',
  '3xl': '3xl',
};

/** The quote glyph's size token for a `quoteIconSize` token (lg → `2xl`, 32px by default). */
export const QUOTE_ICON_STEP: Record<SizeToken, SizeToken> = {
  xs: 'xs',
  sm: 'sm',
  md: 'lg',
  lg: '2xl',
  xl: '3xl',
  '2xl': '3xl',
  '3xl': '3xl',
};

const QUOTE_LINE_HEIGHT = 1.4;

const px = (theme: PlocksTheme, value: SizeValue): number => {
  const resolved = resolveSpacing(theme, value);
  return typeof resolved === 'number' ? resolved : 0;
};

const alignItemsFor = (alignment: BlockquoteAlignment): ViewStyle['alignItems'] =>
  alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';

/**
 * Blockquote styles, built once per theme and prop combination (every argument
 * is a primitive, so the cache key is exact).
 */
export const getBlockquoteStyles = createThemedStyles(
  (
    theme: PlocksTheme,
    variant: BlockquoteVariant,
    size: SizeValue,
    alignment: BlockquoteAlignment,
    border: boolean,
    shadow: boolean,
    color: string | undefined,
    quoteIconSize: number,
    quoteIconPosition: BlockquoteIconPosition
  ) => {
    const isDefault = variant === 'default';
    // The default variant keeps its glyph inside the padding box rather than
    // stuck to the outer corner, so these double as the glyph's origin.
    const padY = px(theme, 'lg');
    const padX = px(theme, 'xl');

    const fontSize =
      typeof size === 'number' ? size : resolveFontSize(theme, QUOTE_FONT_STEP[size as SizeToken] ?? 'xl');

    const variantStyles: Record<BlockquoteVariant, ViewStyle> = {
      default: {
        // A tinted band on whatever it's quoted within.
        backgroundColor: surfaceInteractionTint(theme, 'band'),
        borderRadius: resolveRadius(theme, 'lg'),
        paddingVertical: padY,
        paddingHorizontal: padX,
      },
      testimonial: {
        // Card-like — resting content, level 1.
        backgroundColor: resolveSurface(theme, 1).background,
        borderRadius: resolveRadius(theme, 'md'),
        padding: px(theme, 'xl'),
        ...(shadow ? resolveShadow(theme, 'sm') : null),
      },
      featured: {
        backgroundColor: 'transparent',
        padding: px(theme, 'xl'),
        alignItems: 'center',
      },
      minimal: {
        backgroundColor: 'transparent',
        padding: px(theme, 'md'),
      },
    };

    return StyleSheet.create({
      container: {
        ...variantStyles[variant],
        ...(border && {
          borderWidth: 1,
          borderColor: theme.backgrounds.border,
        }),
        alignItems: alignItemsFor(alignment),
      },

      content: {
        position: 'relative',
        width: '100%',
        // The glyph leads the quote instead of sitting behind it, so the text
        // starts below the space it occupies.
        ...(isDefault && quoteIconPosition === 'top-left' && {
          paddingTop: quoteIconSize + px(theme, 'xs'),
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
        end: -8,
      },

      quoteIconContainer: {
        position: 'absolute',
        zIndex: 1,
      },

      quoteIconTopCenter: {
        alignSelf: 'center',
        left: '50%',
        top: -12,
        // Centred on the glyph's own width.
        transform: [{ translateX: -quoteIconSize / 2 }],
      },

      quoteIconTopLeft: isDefault
        ? // Absolute children resolve against the padding box, so the padding
          // values put the glyph exactly where the first line would have started.
          { start: padX, top: padY }
        : { start: -8, top: -8 },

      quoteText: {
        color: color || theme.text.primary,
        fontSize,
        fontStyle: variant === 'featured' ? 'italic' : 'normal',
        lineHeight: Math.round(fontSize * QUOTE_LINE_HEIGHT),
        textAlign: alignment,
        ...(variant === 'featured' && {
          fontWeight: '600',
        }),
      },
    });
  }
);
