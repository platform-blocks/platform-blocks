import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Button } from '../Button';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { BrandButtonProps, resolveBrandConfig } from './types';
import { BrandIcon, brandIcons } from '../BrandIcon';
import { extractUniversalProps, useShouldHideComponent } from '../../core/utils/universalSimple';
import { isComponentSize, type ComponentSize } from '../../core/theme/componentSize';

const roundToEven = (value: number) => Math.round(value / 2) * 2;

/**
 * Every badge metric is derived from the headline font size, so the shell keeps the
 * same proportions at every token instead of the padding outgrowing the type: at
 * `3xl` the horizontal padding is the same fraction of the text as it is at `xs`.
 * Hand-tuned per-token padding drifted here before — `xs` sat at 0.67× the text and
 * `3xl` at 1.33×.
 */
const createBadgeSizeConfig = (secondaryFontSize: number) => ({
  secondaryFontSize,
  primaryFontSize: Math.round(secondaryFontSize * 0.76),
  iconSize: roundToEven(secondaryFontSize * 1.54),
  paddingHorizontal: Math.round(secondaryFontSize * 0.9),
  paddingVertical: Math.round(secondaryFontSize * 0.45),
  borderRadius: Math.round(secondaryFontSize * 0.46),
  spacing: Math.round(secondaryFontSize * 0.62),
  height: roundToEven(secondaryFontSize * 3.08),
});

// The type scale is the only hand-set input; `md` reproduces the original 13px badge.
const BADGE_SIZE_CONFIGS: Record<ComponentSize, ReturnType<typeof createBadgeSizeConfig>> = {
  xs: createBadgeSizeConfig(9),
  sm: createBadgeSizeConfig(11),
  md: createBadgeSizeConfig(13),
  lg: createBadgeSizeConfig(15),
  xl: createBadgeSizeConfig(17),
  '2xl': createBadgeSizeConfig(19),
  '3xl': createBadgeSizeConfig(21),
};

export const BrandButton = React.forwardRef<View, BrandButtonProps>((props, ref) => {
  const theme = useTheme();
  const { universalProps, componentProps } = extractUniversalProps(props);
  const shouldHide = useShouldHideComponent(universalProps, theme.colorScheme);
  if (shouldHide) return null;

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
    backgroundColor,
    textColor: textColorOverride,
    borderColor,
    darkMode,
    style,
    ...buttonProps
  } = componentProps;

  const brandConfig = resolveBrandConfig(brand);
  const iconColor: string | undefined = color || undefined;
  // A color override only takes effect on the mono variant, so switch to mono
  // when a color is provided and the caller hasn't forced a variant.
  const resolvedIconVariant = iconVariant ?? (color ? 'mono' : 'full');

  // Resolve through the registry rather than a hand-maintained list, so a brand
  // can never be configured here without a matching icon.
  const iconName = brandConfig.icon;
  const hasBrandIcon = iconName in brandIcons;
  if (!hasBrandIcon) {
    console.warn(`BrandButton: no brand icon registered for "${brand}"`);
  }

  // Two lines of text mean a store badge — "Download on the / App Store" — which
  // is a different shell from the single-line brand button below. Empty strings
  // read as absent so a cleared text control doesn't strand an empty badge.
  const isBadge = Boolean(primaryText || secondaryText);

  if (isBadge) {
    const {
      onPress,
      onPressIn,
      onPressOut,
      onLongPress,
      onLayout,
      disabled = false,
      testID,
      accessibilityLabel,
      accessibilityHint,
    } = buttonProps;

    const isDarkMode = darkMode ?? theme.colorScheme === 'dark';
    const finalBackgroundColor = backgroundColor || (isDarkMode ? '#1a1a1a' : '#000000');
    const finalTextColor = textColorOverride || '#ffffff';
    const finalBorderColor =
      borderColor || (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)');

    // An unrecognized token falls back to `md` rather than crashing on an undefined config.
    const sizeConfig = (isComponentSize(size) && BADGE_SIZE_CONFIGS[size]) || BADGE_SIZE_CONFIGS.md;

    const badgeStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: finalBackgroundColor,
      borderRadius: sizeConfig.borderRadius,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      paddingVertical: sizeConfig.paddingVertical,
      minHeight: sizeConfig.height,
      minWidth: 'fit-content',
      opacity: disabled ? 0.6 : 1,
      borderWidth: 1,
      borderColor: finalBorderColor,
      ...(Platform.OS === 'ios' && {
        boxShadow: isDarkMode
          ? '0 2px 3px rgba(255, 255, 255, 0.1)'
          : '0 2px 3px rgba(0, 0, 0, 0.25)',
      }),
      ...(Platform.OS === 'android' && {
        elevation: 3,
        minWidth: 120, // hack to prevent Android from being too small...
      }),
      ...(Platform.OS === 'web' && {
        boxShadow: isDarkMode
          ? '0 2px 8px rgba(255, 255, 255, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.15)',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
      }),
    };

    const pressedStyle = {
      ...badgeStyle,
      opacity: disabled ? 0.6 : 0.8,
      transform: [{ scale: 0.98 }],
    };

    const badgeIcon = icon ?? (hasBrandIcon ? (
      <BrandIcon
        brand={iconName}
        size={sizeConfig.iconSize}
        color={iconColor}
        variant={resolvedIconVariant}
        invertInDarkMode={false} // The badge shell owns the colors
      />
    ) : null);

    const iconSpacing = iconPosition === 'right'
      ? { marginRight: sizeConfig.spacing }
      : { marginLeft: sizeConfig.spacing };

    return (
      <Pressable
        ref={ref}
        onPress={disabled ? undefined : onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
        onLayout={onLayout}
        disabled={disabled}
        style={({ pressed }) => [pressed ? pressedStyle : badgeStyle, style]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `${primaryText ?? ''} ${secondaryText ?? ''}`.trim()}
        accessibilityHint={accessibilityHint}
      >
        {iconPosition === 'left' ? badgeIcon : null}

        <View style={iconSpacing}>
          {primaryText ? (
            <Text
              style={{
                fontSize: sizeConfig.primaryFontSize,
                color: finalTextColor,
                opacity: 0.85,
                lineHeight: sizeConfig.primaryFontSize + 2,
                fontWeight: '400',
              }}
            >
              {primaryText}
            </Text>
          ) : null}
          {secondaryText ? (
            <Text
              style={{
                fontSize: sizeConfig.secondaryFontSize,
                color: finalTextColor,
                fontWeight: '600',
                lineHeight: sizeConfig.secondaryFontSize + 2,
                marginTop: -1,
              }}
            >
              {secondaryText}
            </Text>
          ) : null}
        </View>

        {iconPosition === 'right' ? badgeIcon : null}
      </Pressable>
    );
  }

  const brandIcon = (() => {
    // Map button sizes to icon sizes (BrandIcon only supports sm, md, lg, xl)
    const iconSize: 'sm' | 'md' | 'lg' | 'xl' =
      size === 'xs' ? 'sm' :
        size === '2xl' || size === '3xl' ? 'xl' :
          typeof size === 'number' ? 'md' :
            ['sm', 'md', 'lg', 'xl'].includes(size) ? size as 'sm' | 'md' | 'lg' | 'xl' : 'md';

    if (!hasBrandIcon) return null;

    // BrandIcon supports multi-color brand logos with color override
    return <BrandIcon brand={iconName} size={iconSize}
      color={iconColor}
      variant={resolvedIconVariant} />;
  })();

  // Brand-specific styles
  // Variant-aware style mapping so outline/ghost etc work correctly
  const isPrimaryVariant = (variant as unknown as string) === 'primary';
  const effectiveVariant = isPrimaryVariant ? 'filled' : variant;

  const brandStyles = (() => {
    switch (effectiveVariant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: borderColor || brandConfig.borderColor || brandConfig.backgroundColor,
          paddingHorizontal: 16,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          paddingHorizontal: 16,
        };
      case 'link':
        return { backgroundColor: 'transparent', borderColor: 'transparent' };
      case 'plain':
        return {
          backgroundColor: backgroundColor || (theme.colorScheme === 'dark' ? theme.backgrounds.elevated : 'white'),
          borderColor: borderColor || 'transparent',
          paddingHorizontal: 16,
          minWidth: 0,
          height: 'auto',
          color: theme.colorScheme === 'dark' ? theme.text.primary : 'black'
        };
      default: // primary/filled/secondary/gradient etc treat as filled brand color
        return {
          backgroundColor: backgroundColor || brandConfig.backgroundColor,
          borderColor: borderColor || brandConfig.borderColor || brandConfig.backgroundColor,
          paddingHorizontal: 16,
        };
    }
  })();

  // Compute textColor override: outline/link use brand color, ghost uses default text color, filled-like use contrasting light text
  const textColor = textColorOverride ??
    (effectiveVariant === 'plain' ? (theme.colorScheme === 'dark' ? theme.text.primary : 'black') :
      effectiveVariant === 'ghost'
        ? theme.text.primary
        : (effectiveVariant === 'outline' || effectiveVariant === 'link')
          ? (brandConfig.borderColor || brandConfig.backgroundColor)
          : brandConfig.textColor);

  return (
    <Button
      ref={ref}
      {...buttonProps}
      title={title}
      variant={effectiveVariant as any}
      size={size}
      textColor={textColor}
      startIcon={iconPosition === 'left' ? (icon || brandIcon) : undefined}
      endIcon={iconPosition === 'right' ? (icon || brandIcon) : undefined}
      style={[brandStyles, style, { width: 'auto' }]}
    />
  );
});

BrandButton.displayName = 'BrandButton';
