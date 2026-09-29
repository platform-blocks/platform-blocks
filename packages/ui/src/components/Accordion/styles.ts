import type { TextStyle, ViewStyle } from 'react-native';

import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { withAlpha } from '../../core/theme/colorUtils';
import { resolveAccentColor, resolveColorProp } from '../../core/theme/resolveColors';
import { resolveFontSize, resolveSpacing } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import type { AccordionComputedStyles, AccordionProps, AccordionVariant } from './types';

/**
 * Resolve the accent shades used to emphasize the expanded item from the
 * `color` prop. Shade 5 is the base brand color in both light and dark themes;
 * shade 6 stays readable as text on either background.
 */
export const resolveAccent = (theme: PlatformBlocksTheme, color: AccordionProps['color']) => {
  // Two resolutions rather than a palette array, so `primary.6` shade syntax and
  // raw CSS colors work. A raw color has no ramp, so it comes back as itself for both.
  const main = resolveAccentColor(theme, color) ?? theme.text.secondary;
  const text = resolveColorProp(theme, color, { shades: [6, 5] }) ?? main;
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
 * accordion can mix accents. Cached per theme + color.
 *
 * With no `color` set (the default) the expanded item stays neutral — the open
 * state reads from the bolded title and the rotated chevron alone, with no color
 * tint or surface fill. A brand accent is opt-in via the `color` prop.
 */
export const buildAccentStyles = createThemedStyles(
  (theme: PlatformBlocksTheme, color: string | undefined): AccordionAccentStyles => {
    if (!color) {
      return {
        activeHeaderText: { fontWeight: '600', color: theme.text.primary },
        activeItem: {},
        activeChevronColor: undefined,
      };
    }
    const accent = resolveAccent(theme, color);
    return {
      activeHeaderText: { fontWeight: '600', color: accent.text },
      activeItem: { backgroundColor: withAlpha(accent.main, 0.06) },
      activeChevronColor: accent.main,
    };
  }
);

interface VariantTokens {
  container: ViewStyle;
  item: ViewStyle;
  header: ViewStyle;
  content: ViewStyle;
}

// Variant token maps. A numeric `radius` (px) replaces the variant's default corners.
type VariantTokenFn = (theme: PlatformBlocksTheme, radius: number | undefined) => VariantTokens;

// Extract color/variant composition to allow theme overrides later.
export const accordionVariants: Record<AccordionVariant, VariantTokenFn> = {
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
      borderRadius: radius ?? 8,
    },
    header: {
      backgroundColor: 'transparent',
      ...(radius !== undefined ? { borderRadius: radius } : { borderTopStartRadius: 8, borderTopEndRadius: 8 }),
    },
    content: { backgroundColor: 'transparent' },
  }),
  bordered: (theme, radius) => ({
    container: {
      borderWidth: 1,
      borderColor: theme.backgrounds.border,
      borderRadius: radius ?? 8,
      overflow: 'hidden',
    },
    item: {
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: theme.backgrounds.border,
    },
    header: { backgroundColor: theme.backgrounds.subtle },
    content: { backgroundColor: 'transparent' },
  }),
};

export type AccordionStyles = AccordionComputedStyles & {
  activeItem: ViewStyle;
  activeChevronColor?: string;
  lastItem: ViewStyle;
  headerRow: ViewStyle;
  icon: ViewStyle;
  chevronEnd: ViewStyle;
  panel: ViewStyle;
  panelClosed: ViewStyle;
};

/** The style table for one (theme, variant, size, color, radius, density) combination, cached per theme. */
export const getAccordionStyles = createThemedStyles(
  (
    theme: PlatformBlocksTheme,
    variant: AccordionVariant,
    size: SizeValue,
    color: string | undefined,
    radius: number | undefined,
    density: NonNullable<AccordionProps['density']>
  ): AccordionStyles => {
    const fontSize = resolveFontSize(theme, size);
    const basePadding = resolveSpacing(theme, size);
    const densityFactor = density === 'compact' ? 0.6 : density === 'spacious' ? 1.3 : 1;
    const padding = (typeof basePadding === 'number' ? basePadding : 0) * densityFactor;

    const variantTokens = (accordionVariants[variant] || accordionVariants.default)(theme, radius);
    const accent = buildAccentStyles(theme, color);

    return {
      container: { ...variantTokens.container },
      item: { ...variantTokens.item },
      lastItem: variant === 'default' ? { borderBottomWidth: 0 } : {},
      header: {
        paddingHorizontal: padding,
        paddingVertical: padding * 0.75,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...variantTokens.header,
      },
      headerRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
      content: {
        paddingHorizontal: padding,
        paddingTop: 0,
        paddingBottom: padding,
        ...variantTokens.content,
      },
      headerText: {
        fontSize,
        fontWeight: '500',
        color: theme.text.primary,
        flex: 1,
      },
      // Expanded item emphasis derived from the `color` prop (may be overridden
      // per-item via `item.color`).
      activeHeaderText: accent.activeHeaderText,
      disabledHeaderText: { color: theme.text.disabled },
      activeItem: accent.activeItem,
      activeChevronColor: accent.activeChevronColor,
      icon: { marginEnd: 12 },
      chevron: { marginStart: 8 },
      chevronEnd: { marginStart: 'auto' },
      panel: { position: 'relative', zIndex: 1 },
      panelClosed: { height: 0, overflow: 'hidden' },
    };
  }
);

export default getAccordionStyles;
