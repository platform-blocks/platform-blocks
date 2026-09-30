import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

import {
  a11yProps,
  Button,
  extractStyleProps,
  factory,
  getControlSize,
  isAndroid,
  isComponentSize,
  resolveBg,
  resolveShadow,
  resolveStyleProps,
  Text,
  useTheme,
  warnOnce,
  webStyle,
} from '@plocks/ui';
import type { ButtonVariant, ComponentSize, PlocksTheme, SizeValue } from '@plocks/ui';
import { BrandIcon } from '../BrandIcon';
import { isBrandName } from '../../registry';
import { resolveBrandConfig, type BrandButtonProps } from './types';

const roundToEven = (value: number) => Math.round(value / 2) * 2;

/**
 * Store-badge metrics. The headline font size is derived from the control
 * height (`getControlSize`) — `md` reproduces the original 13px/40px badge —
 * and every other metric from the headline, so the shell keeps the same
 * proportions at every size instead of the padding outgrowing the type.
 */
function getBadgeMetrics(theme: PlocksTheme, size: ComponentSize) {
  const secondaryFontSize = Math.round(getControlSize(theme, size).height / 3.08);
  return {
    secondaryFontSize,
    primaryFontSize: Math.round(secondaryFontSize * 0.76),
    iconSize: roundToEven(secondaryFontSize * 1.54),
    paddingHorizontal: Math.round(secondaryFontSize * 0.9),
    paddingVertical: Math.round(secondaryFontSize * 0.45),
    borderRadius: Math.round(secondaryFontSize * 0.46),
    spacing: Math.round(secondaryFontSize * 0.62),
    height: roundToEven(secondaryFontSize * 3.08),
  };
}

/** Brand marks come in four sizes; map the button size onto them. */
function getBrandIconSize(size: SizeValue): 'sm' | 'md' | 'lg' | 'xl' {
  if (size === 'xs') return 'sm';
  if (size === '2xl' || size === '3xl') return 'xl';
  if (size === 'sm' || size === 'md' || size === 'lg' || size === 'xl') return size;
  return 'md';
}

/**
 * Official store-badge chrome ("Download on the App Store"): the badge
 * guidelines prescribe a black shell with white type in both schemes, so these
 * are brand colors, not theme chrome.
 */
const BADGE_COLORS = {
  background: '#000000',
  backgroundDark: '#1a1a1a',
  text: '#ffffff',
  border: 'rgba(255, 255, 255, 0.1)',
  borderDark: 'rgba(255, 255, 255, 0.15)',
} as const;

/**
 * A branded button ("Continue with Google") or, with `primaryText` /
 * `secondaryText`, a two-line store badge ("Download on the App Store").
 */
export const BrandButton = factory<{ props: BrandButtonProps; ref: View }>((props, ref) => {
  const {
    brand,
    iconPosition = 'left',
    icon,
    title,
    primaryText,
    secondaryText,
    variant = 'plain',
    size = 'md',
    color,
    iconVariant,
    bg,
    textColor: textColorOverride,
    borderColor,
    darkMode,
    style,
    ...buttonProps
  } = props;

  const theme = useTheme();
  const brandConfig = resolveBrandConfig(brand);
  // `bg` replaces the brand / badge fill instead of reaching Button's root under it.
  const backgroundColor = resolveBg(theme, bg);
  // A color override only takes effect on the mono variant, so switch to mono
  // when a color is provided and the caller hasn't forced a variant.
  const resolvedIconVariant = iconVariant ?? (color ? 'mono' : 'full');
  const iconAtStart = iconPosition === 'left' || iconPosition === 'start';

  // Resolve through the registry rather than a hand-maintained list, so a brand
  // can never be configured here without a matching icon.
  const iconName = brandConfig.icon;
  const hasBrandIcon = isBrandName(iconName);
  if (!hasBrandIcon) {
    warnOnce(`brand-button:${brand}`, `BrandButton: no brand icon registered for "${brand}"`);
  }

  // Two lines of text mean a store badge — "Download on the / App Store" — which
  // is a different shell from the single-line brand button below. Empty strings
  // read as absent so a cleared text control doesn't strand an empty badge.
  const isBadge = Boolean(primaryText || secondaryText);

  if (isBadge) {
    const { onPress, onPressIn, onPressOut, onLongPress, onLayout, disabled = false, testID, accessibilityLabel, accessibilityHint } =
      buttonProps;

    const isDarkMode = darkMode ?? theme.colorScheme === 'dark';
    // An unrecognized size falls back to `md` rather than an out-of-range badge.
    const metrics = getBadgeMetrics(theme, isComponentSize(size) ? size : 'md');

    const badgeStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: backgroundColor || (isDarkMode ? BADGE_COLORS.backgroundDark : BADGE_COLORS.background),
      borderRadius: metrics.borderRadius,
      paddingHorizontal: metrics.paddingHorizontal,
      paddingVertical: metrics.paddingVertical,
      minHeight: metrics.height,
      opacity: disabled ? 0.6 : 1,
      borderWidth: 1,
      borderColor: borderColor || (isDarkMode ? BADGE_COLORS.borderDark : BADGE_COLORS.border),
      ...resolveShadow(theme, 'sm'),
      // Android measures the two-line label short without a floor.
      ...(isAndroid ? { minWidth: 120 } : null),
      ...webStyle({ cursor: disabled ? 'default' : 'pointer', transitionProperty: 'opacity, transform', transitionDuration: '200ms' }),
    };
    const pressedStyle: ViewStyle = { opacity: disabled ? 0.6 : 0.8, transform: [{ scale: 0.98 }] };
    const textColor = textColorOverride || BADGE_COLORS.text;

    const badgeIcon =
      icon ??
      (hasBrandIcon ? (
        <BrandIcon
          brand={iconName}
          size={metrics.iconSize}
          color={color}
          variant={resolvedIconVariant}
          invertInDarkMode={false} // The badge shell owns the colors
        />
      ) : null);

    const textSpacing: ViewStyle = iconAtStart ? { marginStart: metrics.spacing } : { marginEnd: metrics.spacing };

    return (
      <Pressable
        ref={ref}
        onPress={disabled ? undefined : onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
        onLayout={onLayout}
        disabled={disabled}
        style={({ pressed }) => [
          badgeStyle,
          pressed ? pressedStyle : null,
          resolveStyleProps(extractStyleProps(buttonProps).styleProps, theme),
          style,
        ]}
        testID={testID}
        {...a11yProps({
          role: 'button',
          label: accessibilityLabel ?? `${primaryText ?? ''} ${secondaryText ?? ''}`.trim(),
          hint: accessibilityHint,
          disabled,
        })}
      >
        {iconAtStart ? badgeIcon : null}
        <View style={textSpacing}>
          {primaryText ? (
            <Text
              style={{
                fontSize: metrics.primaryFontSize,
                color: textColor,
                opacity: 0.85,
                lineHeight: metrics.primaryFontSize + 2,
                fontWeight: '400',
              }}
            >
              {primaryText}
            </Text>
          ) : null}
          {secondaryText ? (
            <Text
              style={{
                fontSize: metrics.secondaryFontSize,
                color: textColor,
                fontWeight: '600',
                lineHeight: metrics.secondaryFontSize + 2,
                marginTop: -1,
              }}
            >
              {secondaryText}
            </Text>
          ) : null}
        </View>
        {iconAtStart ? null : badgeIcon}
      </Pressable>
    );
  }

  const brandIcon = hasBrandIcon ? (
    <BrandIcon brand={iconName} size={getBrandIconSize(size)} color={color} variant={resolvedIconVariant} />
  ) : null;

  const buttonVariant: ButtonVariant = variant === 'plain' ? 'default' : variant;

  // Variant-aware brand chrome, so outline/ghost etc. still read as the brand.
  const brandStyles: ViewStyle = (() => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: borderColor || brandConfig.borderColor || brandConfig.backgroundColor,
        };
      case 'ghost':
      case 'link':
        return { backgroundColor: 'transparent', borderColor: 'transparent' };
      case 'plain':
        return {
          backgroundColor: backgroundColor || theme.backgrounds.elevated,
          borderColor: borderColor || 'transparent',
        };
      default: // filled/light/subtle/gradient/default/secondary: the brand fill
        return {
          backgroundColor: backgroundColor || brandConfig.backgroundColor,
          borderColor: borderColor || brandConfig.borderColor || brandConfig.backgroundColor,
        };
    }
  })();

  // Outline/link use the brand color, plain/ghost body text, fills the brand's text color.
  const textColor =
    textColorOverride ??
    (variant === 'plain' || variant === 'ghost'
      ? theme.text.primary
      : variant === 'outline' || variant === 'link'
        ? brandConfig.borderColor || brandConfig.backgroundColor
        : brandConfig.textColor);

  const brandMark = icon || brandIcon;

  return (
    <Button
      ref={ref}
      {...buttonProps}
      title={title}
      variant={buttonVariant}
      size={size}
      textColor={textColor}
      startSection={iconAtStart ? brandMark : undefined}
      endSection={iconAtStart ? undefined : brandMark}
      style={[brandStyles, style]}
    />
  );
}, { displayName: 'BrandButton' });
