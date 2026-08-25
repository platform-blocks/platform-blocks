import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { CORE_COLORS, resolveVariantRoles, type VariantRole, type VariantRoles } from '../../core/theme/variantRoles';
import { getFontSize, getSpacing, type SizeValue } from '../../core/theme/sizes';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { DESIGN_TOKENS, getUnifiedComponentSize } from '../../core/unified-styles';
import type { ButtonProps } from './types';

/**
 * Button variants that carry a color. Everything else (secondary, ghost, link,
 * none) is neutral by design and keeps its bespoke styling.
 */
const CANONICAL_VARIANTS: Record<string, VariantRole | undefined> = {
  filled: 'filled',
  light: 'light',
  subtle: 'subtle',
  outline: 'outline',
  gradient: 'gradient',
};

/** Maps a Button variant onto the shared color-bearing variant model. */
export const getCanonicalVariant = (variant: string | undefined): VariantRole | undefined =>
  variant ? CANONICAL_VARIANTS[variant] : undefined;

export interface ButtonStyleParams {
  theme: PlatformBlocksTheme;
  variant: ButtonProps['variant'];
  size: SizeValue;
  disabled: boolean;
  loading: boolean;
  radiusStyles: Record<string, unknown>;
  shadowStyles: Record<string, unknown>;
  /** Resolved fill/border/text for the color-bearing variants; `null` for neutral ones. */
  roles: VariantRoles | null;
  isIconButton: boolean;
}

/**
 * Visual style for the Button's Pressable — box metrics, fill, border, radius.
 *
 * @note `fullWidth` and flex are deliberately NOT handled here. The Pressable
 * sits two Views deep, so width/flex on it cannot grow the button inside a flex
 * row; see {@link splitButtonLayoutStyles}, which routes those to the outer
 * wrapper instead.
 */
export const getButtonStyles = ({
  theme,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  radiusStyles,
  shadowStyles,
  roles,
  isIconButton = false,
}: ButtonStyleParams): any => {
  const sizeConfig = getUnifiedComponentSize(size as any);
  const horizontalSpacing = isIconButton ? 0 : sizeConfig.padding;

  const baseStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: sizeConfig.height,
    minHeight: sizeConfig.height,
    minWidth: sizeConfig.height,
    // Icon buttons are square; everything else pads horizontally.
    ...(isIconButton ? { width: sizeConfig.height } : { paddingHorizontal: horizontalSpacing }),
    paddingVertical: Math.round(sizeConfig.padding * 0.25),
    borderWidth: 1,
    opacity: disabled ? DESIGN_TOKENS.opacity.disabled : loading ? DESIGN_TOKENS.opacity.pressed : 1,
    ...radiusStyles,
    ...(typeof window !== 'undefined' && {
      transition: `all ${DESIGN_TOKENS.motion.duration.fast}ms ${DESIGN_TOKENS.motion.easing.easeOut}`,
    }),
  };

  // Color-bearing variants resolve fill + border through the shared, theme-independent
  // variant model. Buttons are flat unless the consumer opts in via `shadow`.
  if (roles) {
    return { ...baseStyles, backgroundColor: roles.fill, borderColor: roles.border, ...shadowStyles };
  }

  const isDark = theme.colorScheme === 'dark';
  switch (variant) {
    case 'default':
      // A neutral chrome fill plus a hairline, so it reads as a button
      // without claiming the accent color.
      // Dark mode sits one step above the page background, which is what makes
      // it look raised. Light mode takes the recessed gray instead and leaves
      // the surface white to `secondary`, so the selected/emphasised state is
      // the one that pops off a light page.
      return {
        ...baseStyles,
        backgroundColor: isDark
          ? theme.backgrounds?.surface ?? '#1C1C1F'
          : theme.colors.gray[1],
        // A touch stronger than `backgrounds.border` (a separator hairline) so the
        // button's edge is unmistakable against the surface it sits on.
        borderColor: isDark ? theme.colors.gray[3] : theme.colors.gray[2],
        ...shadowStyles,
      };
    case 'secondary':
      return {
        ...baseStyles,
        // gray[1] equals the surface in dark mode, so lift the fill a step there.
        // In light mode this is the white surface — the inverse of `default`.
        backgroundColor: isDark
          ? theme.colors.gray[3]
          : theme.backgrounds?.surface ?? '#FFFFFF',
        borderColor: isDark ? theme.colors.gray[4] : theme.colors.gray[3],
        ...shadowStyles,
      };
    case 'link':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textDecorationLine: 'underline' as const,
        paddingHorizontal: 0,
        paddingVertical: 0,
      };
    case 'none':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        height: 'auto' as const,
        paddingHorizontal: 0,
        paddingVertical: 0,
      };
    case 'ghost':
    default:
      return { ...baseStyles, backgroundColor: 'transparent', borderColor: 'transparent' };
  }
};

/**
 * Resolves a color token to a concrete value. Accepts `palette`,
 * `palette.shade`, or a raw CSS/hex color (returned unchanged).
 */
export const resolveTokenColor = (
  theme: PlatformBlocksTheme,
  token?: string,
): string | undefined => {
  if (!token) return undefined;

  const shadeMatch = token.match(/^([a-zA-Z0-9_-]+)\.([0-9]{1,2})$/);
  if (shadeMatch) {
    const [, palette, shadeStr] = shadeMatch;
    const shade = parseInt(shadeStr, 10);
    const paletteValue = (theme.colors as any)[palette];
    if (Array.isArray(paletteValue) && paletteValue[shade] != null) return paletteValue[shade];
  }

  const paletteValue = (theme.colors as any)[token];
  if (paletteValue) {
    return Array.isArray(paletteValue) ? paletteValue[5] || paletteValue[0] : paletteValue;
  }

  return token; // raw css color
};

/**
 * Tint color for the color-bearing variants. Core palette tokens pass through
 * as tokens (the shared resolver does its own palette lookup); `palette.shade`
 * and raw CSS colors are pre-resolved to a concrete value.
 */
export const resolveRoleColor = (theme: PlatformBlocksTheme, token?: string): string => {
  if (!token) return 'primary';
  if ((CORE_COLORS as readonly string[]).includes(token)) return token;
  return resolveTokenColor(theme, token) ?? token;
};

export interface ButtonTextColorParams {
  theme: PlatformBlocksTheme;
  variant: ButtonProps['variant'];
  roles: VariantRoles | null;
  /** Explicit `textColor` prop, if any — always wins. */
  textColorProp?: string;
  /** Whether the consumer asked for a specific tint via `color`/`colorVariant`. */
  hasExplicitColor: boolean;
  /** Accent text color, used by ghost/link when a tint was requested. */
  accentText: string;
}

/** Label (and icon, and loader) color for a given variant. */
export const resolveButtonTextColor = ({
  theme,
  variant,
  roles,
  textColorProp,
  hasExplicitColor,
  accentText,
}: ButtonTextColorParams): string => {
  if (textColorProp) return resolveTokenColor(theme, textColorProp) || textColorProp;
  if (roles) return roles.text;

  switch (variant) {
    case 'default':
      // Neutral chrome: normal body text.
      return theme.text.primary;
    case 'secondary':
      return theme.colors.gray[7];
    case 'ghost':
      return hasExplicitColor ? accentText : theme.colors.gray[7];
    case 'link':
      return hasExplicitColor ? accentText : theme.colors.primary[5];
    case 'none':
      return 'currentColor';
    default:
      return theme.text.primary;
  }
};

/**
 * Fill/border/text for a color-bearing variant. Returns `null` for the neutral
 * variants (secondary, ghost, link, none), which keep their bespoke styling.
 */
export const resolveButtonRoles = (
  theme: PlatformBlocksTheme,
  canonicalVariant: VariantRole | undefined,
  roleColor: string,
  gradientStops: [string, string],
): VariantRoles | null =>
  canonicalVariant
    ? resolveVariantRoles(theme, { variant: canonicalVariant, color: roleColor, gradientStops })
    : null;

/**
 * Extra feedback layered on top of the press scale: a dip in opacity, plus a
 * 1px nudge downward on native (where it reads as a physical press).
 */
export const getButtonPressedStyle = (variant: ButtonProps['variant']) => ({
  opacity: variant === 'ghost' || variant === 'none' ? 0.6 : 0.9,
  ...(Platform.OS !== 'web' ? { transform: [{ translateY: 1 }] } : {}),
});

/** Accent text color used by ghost/link when the consumer requests a tint. */
export const resolveAccentTextColor = (theme: PlatformBlocksTheme, roleColor: string): string =>
  resolveVariantRoles(theme, { variant: 'outline', color: roleColor }).text;

/** Gap between the label and any start/end icon. */
export const getButtonIconSpacing = (size: SizeValue): number => getSpacing(size) / 2;

/** Base label style, before `labelProps` is merged over it. */
export const getButtonLabelStyle = (size: SizeValue) => ({
  lineHeight: getFontSize(size) * 1.3,
  textAlignVertical: 'center' as const,
});

export interface ButtonLayoutSplit {
  /** Width-family layout + hoisted flex — belongs on the outer wrapper. */
  outer: Record<string, unknown>;
  /** Height-family layout — belongs on the Pressable. */
  pressableLayout: Record<string, unknown>;
  /** Consumer `style` minus the flex props hoisted to the wrapper. */
  pressableStyle: Record<string, unknown>;
}

/**
 * Splits layout between the Button's outer wrapper and its inner Pressable.
 *
 * The Pressable is nested two Views deep, so width/flex applied to it can't
 * size the button within a flex row. Width-family layout (`fullWidth`/`w`/
 * `maxW`/`minW`), `alignSelf`, and any flex props in the consumer's `style` go
 * to the outer wrapper; height-family layout and all visual style stay on the
 * Pressable.
 */
export const splitButtonLayoutStyles = (
  layoutStyles: Record<string, unknown>,
  style: StyleProp<ViewStyle>,
): ButtonLayoutSplit => {
  const {
    width: layoutWidth,
    maxWidth: layoutMaxWidth,
    minWidth: layoutMinWidth,
    ...pressableLayout
  } = layoutStyles;

  const outer: Record<string, unknown> = {};
  if (layoutWidth !== undefined) outer.width = layoutWidth;
  if (layoutMaxWidth !== undefined) outer.maxWidth = layoutMaxWidth;
  if (layoutMinWidth !== undefined) outer.minWidth = layoutMinWidth;

  const flatStyle = (StyleSheet.flatten(style) || {}) as Record<string, unknown>;
  const {
    flex: styleFlex,
    flexGrow: styleFlexGrow,
    flexShrink: styleFlexShrink,
    flexBasis: styleFlexBasis,
    // The wrapper is the element the parent aligns, so `alignSelf` has to live
    // there — on the Pressable it would only align inside the hugged wrapper.
    alignSelf: styleAlignSelf,
    ...pressableStyle
  } = flatStyle;

  if (styleFlex !== undefined) outer.flex = styleFlex;
  if (styleFlexGrow !== undefined) outer.flexGrow = styleFlexGrow;
  if (styleFlexShrink !== undefined) outer.flexShrink = styleFlexShrink;
  if (styleFlexBasis !== undefined) outer.flexBasis = styleFlexBasis;
  if (styleAlignSelf !== undefined) outer.alignSelf = styleAlignSelf;

  return { outer, pressableLayout, pressableStyle };
};

/**
 * Cross-axis sizing for the Button's outer wrapper.
 *
 * Buttons hug their content by default, so `alignItems: 'flex-start'` keeps the
 * Pressable at its natural width. Note this constrains the *Pressable*, not the
 * wrapper: the wrapper still takes whatever alignment its parent gives it, so a
 * centering parent (`<Block align="center">`) keeps centering the button rather
 * than being overridden. Anything that asks the button to fill — `fullWidth`,
 * an explicit width, or a flex value — switches back to `stretch`.
 */
export const getButtonFillStyle = (outer: Record<string, unknown>) => {
  const fills =
    outer.width !== undefined ||
    outer.flex !== undefined ||
    outer.flexGrow !== undefined ||
    outer.flexBasis !== undefined;

  return { alignItems: fills ? ('stretch' as const) : ('flex-start' as const) };
};
