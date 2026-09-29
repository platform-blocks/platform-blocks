import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { isNative, isWeb, webStyle } from '../../core/platform';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import type { SizeValue } from '../../core/theme/sizes';
import { getControlSize } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { CORE_COLORS, resolveVariantRoles, type VariantRole, type VariantRoles } from '../../core/theme/variantRoles';
import type { ButtonVariant } from './types';

/** Opacity of a disabled / loading button. */
const DISABLED_OPACITY = 0.5;
const LOADING_OPACITY = 0.8;

/**
 * Button variants that carry a color. Everything else (default, secondary,
 * ghost, link, none) is neutral by design and keeps its bespoke styling.
 */
const CANONICAL_VARIANTS: Partial<Record<ButtonVariant, VariantRole>> = {
  filled: 'filled',
  light: 'light',
  subtle: 'subtle',
  outline: 'outline',
  gradient: 'gradient',
};

/** Maps a Button variant onto the shared color-bearing variant model. */
export const getCanonicalVariant = (variant: ButtonVariant | undefined): VariantRole | undefined =>
  variant ? CANONICAL_VARIANTS[variant] : undefined;

export interface ButtonStyleParams {
  theme: PlatformBlocksTheme;
  variant: ButtonVariant;
  size: SizeValue;
  disabled: boolean;
  loading: boolean;
  /** Resolved corner radius in px. */
  borderRadius: number;
  /** Resolved `shadow` style (`resolveShadow`), `{}` for none. */
  shadowStyle: ViewStyle;
  /** Resolved fill/border/text for the color-bearing variants; `null` for neutral ones. */
  roles: VariantRoles | null;
  isIconButton: boolean;
  /** Reduced motion: no CSS color transition on web. */
  reducedMotion: boolean;
}

/**
 * Visual style for the Button's Pressable — box metrics, fill, border, radius.
 * Metrics come from `getControlSize`, the one control-size table, so a Button
 * lines up with an Input / Select / IconButton of the same size.
 *
 * @note `fullWidth` and flex are deliberately NOT handled here. The Pressable
 * sits two Views deep, so width/flex on it cannot grow the button inside a flex
 * row; see {@link splitButtonLayoutStyles}, which routes those to the outer
 * wrapper instead.
 */
export const getButtonStyles = ({
  theme,
  variant,
  size,
  disabled,
  loading,
  borderRadius,
  shadowStyle,
  roles,
  isIconButton,
  reducedMotion,
}: ButtonStyleParams): ViewStyle => {
  const control = getControlSize(theme, size);

  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: control.height,
    minHeight: control.height,
    minWidth: control.height,
    // Icon buttons are square; everything else pads horizontally.
    ...(isIconButton ? { width: control.height } : { paddingHorizontal: control.paddingX }),
    paddingVertical: Math.round(control.paddingX * 0.25),
    borderWidth: 1,
    borderRadius,
    opacity: disabled ? DISABLED_OPACITY : loading ? LOADING_OPACITY : 1,
    ...webStyle({
      transitionProperty: 'background-color, border-color, opacity',
      transitionDuration: reducedMotion ? '0ms' : theme.motion?.duration?.fast ?? '150ms',
      transitionTimingFunction: theme.motion?.easing?.easeOut ?? 'ease-out',
    }),
  };

  // Color-bearing variants resolve fill + border through the shared variant
  // model. Buttons are flat unless the consumer opts in via `shadow`.
  if (roles) {
    return { ...base, backgroundColor: roles.fill, borderColor: roles.border, ...shadowStyle };
  }

  switch (variant) {
    case 'default':
      // A neutral recessed fill plus a visible border, so it reads as a button
      // without claiming the accent color.
      return {
        ...base,
        backgroundColor: theme.backgrounds.subtle,
        borderColor: theme.backgrounds.borderStrong,
        ...shadowStyle,
      };
    case 'secondary':
      // The raised surface — the inverse of `default`.
      return {
        ...base,
        backgroundColor: theme.backgrounds.elevated,
        borderColor: theme.backgrounds.borderStrong,
        ...shadowStyle,
      };
    case 'link':
      return {
        ...base,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
      };
    case 'none':
      return {
        ...base,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        // An icon-only `none` button keeps its square hit area; a text one hugs its label.
        ...(isIconButton ? null : { height: 'auto', minHeight: undefined, paddingHorizontal: 0, paddingVertical: 0 }),
      };
    case 'ghost':
    default:
      return { ...base, backgroundColor: 'transparent', borderColor: 'transparent' };
  }
};

/**
 * Tint color for the color-bearing variants. Core palette tokens pass through
 * as tokens (the shared resolver does its own palette lookup); `palette.shade`
 * and raw CSS colors are pre-resolved to a concrete value.
 */
export const resolveRoleColor = (theme: PlatformBlocksTheme, token?: string): string => {
  if (!token) return 'primary';
  if ((CORE_COLORS as readonly string[]).includes(token)) return token;
  return resolveAccentColor(theme, token) ?? token;
};

export interface ButtonTextColorParams {
  theme: PlatformBlocksTheme;
  variant: ButtonVariant;
  roles: VariantRoles | null;
  /** Explicit `textColor` prop, if any — always wins. */
  textColorProp?: string;
  /** Whether the consumer asked for a specific tint via `color`. */
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
  if (textColorProp) return resolveAccentColor(theme, textColorProp) || textColorProp;
  if (roles) return roles.text;

  switch (variant) {
    case 'secondary':
      return theme.text.secondary;
    case 'ghost':
      return hasExplicitColor ? accentText : theme.text.secondary;
    case 'link':
      return hasExplicitColor ? accentText : theme.text.link;
    case 'none':
      // Unstyled: inherit on web; native has no color inheritance.
      return isWeb ? 'currentColor' : theme.text.primary;
    case 'default':
    default:
      return theme.text.primary;
  }
};

/**
 * Fill/border/text for a color-bearing variant. Returns `null` for the neutral
 * variants (default, secondary, ghost, link, none), which keep their bespoke styling.
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

const PRESSED_STYLE_SOFT: ViewStyle = { opacity: 0.6 };
const PRESSED_STYLE: ViewStyle = { opacity: 0.9 };
const NATIVE_PRESS_NUDGE: ViewStyle = { transform: [{ translateY: 1 }] };

/**
 * Extra feedback layered on top of the press scale: a dip in opacity, plus a
 * 1px nudge downward on native (where it reads as a physical press).
 */
export const getButtonPressedStyle = (variant: ButtonVariant): StyleProp<ViewStyle> => [
  variant === 'ghost' || variant === 'none' ? PRESSED_STYLE_SOFT : PRESSED_STYLE,
  isNative ? NATIVE_PRESS_NUDGE : null,
];

/** Accent text color used by ghost/link when the consumer requests a tint. */
export const resolveAccentTextColor = (theme: PlatformBlocksTheme, roleColor: string): string =>
  resolveVariantRoles(theme, { variant: 'outline', color: roleColor }).text;

/** Gap between the label and any start/end section. */
export const getButtonIconSpacing = (theme: PlatformBlocksTheme, size: SizeValue): number =>
  getControlSize(theme, size).gap;

/** Base label style, before `labelProps` is merged over it. */
export const getButtonLabelStyle = (theme: PlatformBlocksTheme, size: SizeValue, variant: ButtonVariant): TextStyle => ({
  lineHeight: Math.round(getControlSize(theme, size).fontSize * 1.3),
  textAlignVertical: 'center',
  ...(variant === 'link' ? { textDecorationLine: 'underline' } : null),
});

export interface ButtonLayoutSplit {
  /** Spacing, width-family and opacity style props + hoisted flex — belongs on the outer wrapper. */
  outer: ViewStyle;
  /** Height-family style props and `bg` — belong on the Pressable. */
  pressableLayout: ViewStyle;
  /** Consumer `style` minus the flex props hoisted to the wrapper. */
  pressableStyle: ViewStyle;
}

/**
 * Splits the root style between the Button's outer wrapper and its inner Pressable.
 *
 * The Pressable is nested two Views deep, so width/flex applied to it can't
 * size the button within a flex row. Spacing, width-family (`fullWidth`/`w`/
 * `maw`/`miw`) and `opacity`, `alignSelf`, and any flex props in the
 * consumer's `style` go to the outer wrapper; height-family (`h`/`mah`/`mih`),
 * `bg` and all other visual style stay on the Pressable, the visible button.
 * `style` may be an array (it is flattened, not spread).
 */
export const splitButtonLayoutStyles = (
  rootStyles: ViewStyle,
  style: StyleProp<ViewStyle>,
): ButtonLayoutSplit => {
  const { height, minHeight, maxHeight, backgroundColor, ...outer } = rootStyles;

  const pressableLayout: ViewStyle = {};
  if (height !== undefined) pressableLayout.height = height;
  if (minHeight !== undefined) pressableLayout.minHeight = minHeight;
  if (maxHeight !== undefined) pressableLayout.maxHeight = maxHeight;
  if (backgroundColor !== undefined) pressableLayout.backgroundColor = backgroundColor;

  const flatStyle: ViewStyle = StyleSheet.flatten(style) || {};
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

const FILL_STYLE: ViewStyle = { alignItems: 'stretch' };
const HUG_STYLE: ViewStyle = { alignItems: 'flex-start' };

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
export const getButtonFillStyle = (outer: ViewStyle): ViewStyle => {
  const fills =
    outer.width !== undefined ||
    outer.flex !== undefined ||
    outer.flexGrow !== undefined ||
    outer.flexBasis !== undefined;
  return fills ? FILL_STYLE : HUG_STYLE;
};
