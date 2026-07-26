import type { TextStyle, ViewStyle } from 'react-native';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { getFontSize, getSpacing, SizeValue } from '../../core/theme/sizes';
import { withAlpha } from '../../core/theme/colorUtils';
import type { AccordionProps, AccordionComputedStyles } from './types';

/**
 * Resolve the accent shades used to emphasize the expanded item from the
 * `color` prop. Shade 5 is the base brand color in both light and dark themes;
 * shade 6 stays readable as text on either background. Falls back to gray.
 */
export const resolveAccent = (theme: PlatformBlocksTheme, color: AccordionProps['color']) => {
  const palette = (theme.colors as any)?.[color as string] ?? theme.colors.gray;
  const main = palette?.[5] ?? palette?.[palette.length - 1];
  const text = palette?.[6] ?? main;
  return { main, text };
};

export interface AccordionAccentStyles {
  activeHeaderText: TextStyle;
  activeItem: ViewStyle;
  /**
   * Chevron tint while expanded. Left undefined when no accent is set so the
   * chevron keeps its resting color — the open state reads from the rotation
   * and bolded title, not from a shift in icon weight.
   */
  activeChevronColor?: string;
}

/**
 * Build the expanded-item emphasis styles for a given color. Shared by the
 * accordion-level `color` prop and per-item `color` overrides so a single
 * accordion can mix accents.
 *
 * With no `color` set (the default) the expanded item stays neutral — the open
 * state reads from the bolded title and the rotated chevron alone, with no color
 * tint or surface fill. A brand accent is opt-in via the `color` prop.
 */
export const buildAccentStyles = (
  theme: PlatformBlocksTheme,
  color: AccordionProps['color']
): AccordionAccentStyles => {
  if (!color) {
    return {
      activeHeaderText: { fontWeight: '600' as const, color: theme.text.primary },
      activeItem: {},
      activeChevronColor: undefined,
    };
  }
  const accent = resolveAccent(theme, color);
  return {
    activeHeaderText: { fontWeight: '600' as const, color: accent.text },
    activeItem: { backgroundColor: withAlpha(accent.main, 0.06) },
    activeChevronColor: accent.main,
  };
};

// Variant + density token maps
type VariantTokenFn = (theme: PlatformBlocksTheme, radiusStyles: any) => {
  container: any; item: any; header: any; content: any;
};

// Extract color/variant composition to allow theme overrides later.
export const accordionVariants: Record<string, VariantTokenFn> = {
  // Semantic surface tokens (theme.backgrounds.*) are used instead of raw
  // palette swatches so the Accordion blends into whatever surface it sits on
  // and adapts automatically across light/dark themes.
  default: (theme) => ({
    container: { backgroundColor: 'transparent' },
    item: {
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: theme.backgrounds.border,
    },
    header: { backgroundColor: 'transparent' },
    content: { backgroundColor: 'transparent' },
  }),
  separated: (theme, radius) => ({
    container: { backgroundColor: 'transparent' },
    item: {
      backgroundColor: theme.backgrounds.subtle,
      borderWidth: 1,
      borderColor: theme.backgrounds.border,
      marginBottom: 8,
      ...(radius || { borderRadius: 8 }),
    },
    header: { backgroundColor: 'transparent', ...(radius || { borderTopLeftRadius: 8, borderTopRightRadius: 8 }) },
    content: { backgroundColor: 'transparent' },
  }),
  bordered: (theme, radius) => ({
    container: { borderWidth: 1, borderColor: theme.backgrounds.border, ...(radius || { borderRadius: 8 }), overflow: 'hidden' as const },
    item: {
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: theme.backgrounds.border,
    },
    header: { backgroundColor: theme.backgrounds.subtle },
    content: { backgroundColor: 'transparent' },
  }),
};

// Style resolver extracted from previous inline implementation.
export const getAccordionStyles = (
  theme: PlatformBlocksTheme,
  variant: AccordionProps['variant'] = 'default',
  size: SizeValue = 'md',
  color: AccordionProps['color'] = undefined,
  radiusStyles: any | undefined,
  density: AccordionProps['density'] = 'comfortable'
): AccordionComputedStyles & {
  activeHeaderText: TextStyle;
  disabledHeaderText: TextStyle;
  activeItem: ViewStyle;
  activeChevronColor?: string;
} => {
  const fontSize = getFontSize(size);
  const basePadding = getSpacing(size);
  const densityFactor = density === 'compact' ? 0.6 : density === 'spacious' ? 1.3 : 1;
  const padding = basePadding * densityFactor;

  const baseHeaderStyles = {
    paddingHorizontal: padding,
    paddingVertical: padding * 0.75,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  };

  const baseContentStyles = {
    paddingHorizontal: padding,
    paddingTop: 0,
    paddingBottom: padding,
  };

  const variantTokens = (accordionVariants[variant] || accordionVariants.default)(theme, radiusStyles);
  const accent = buildAccentStyles(theme, color);

  return {
  container: { ...variantTokens.container },
  item: { ...variantTokens.item, ...baseHeaderStyles && { } },
  header: { ...baseHeaderStyles, ...variantTokens.header },
  content: { ...baseContentStyles, ...variantTokens.content },
    headerText: {
      fontSize,
      fontWeight: '500' as const,
      color: theme.text.primary,
      flex: 1,
    },
    // Expanded item emphasis derived from the `color` prop (may be overridden
    // per-item via `item.color`).
    activeHeaderText: accent.activeHeaderText,
    disabledHeaderText: { color: theme.text.disabled },
    activeItem: accent.activeItem,
    activeChevronColor: accent.activeChevronColor,
    chevron: { marginLeft: 8 },
  };
};

export default getAccordionStyles;
// TODO: Extract style resolver to styles.ts returning a typed AccordionComputedStyles.