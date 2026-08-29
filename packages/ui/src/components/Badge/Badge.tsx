import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { getFontSize, getSpacing, getHeight } from '../../core/theme/sizes';
import { clampComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { createRadiusStyles } from '../../core/theme/radius';
import { resolveVariantRoles, resolveGradientStops } from '../../core/theme/variantRoles';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { getSpacingStyles, extractSpacingProps, extractShadowProps, getShadowStyles, mergeSlotProps } from '../../core/utils';
import type { BadgeProps } from './types';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { DESIGN_TOKENS } from '../../core/unified-styles';
import { resolveLinearGradient } from '../../utils/optionalDependencies';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();


const BADGE_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const getBadgeStyles = (
  theme: PlatformBlocksTheme,
  variant: BadgeProps['variant'] = 'filled',
  color: BadgeProps['color'] = 'primary',
  disabled: boolean = false,
  height: number,
  radiusStyles: any,
  shadowStyles: any,
  gradientStops?: [string, string]
) => {
  // Use design tokens for consistent badge sizing
  const badgeHeight = Math.max(DESIGN_TOKENS.component.badge.height, height * 0.7);
  const horizontalPadding = Math.max(DESIGN_TOKENS.component.badge.padding, height * 0.3);

  const baseStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: badgeHeight,
    minHeight: badgeHeight,
    paddingHorizontal: horizontalPadding,
    borderWidth: 1,
    opacity: disabled ? 0.5 : 1,
    position: 'relative' as const,
    ...radiusStyles
  };

  // Fill + border come from the shared variant system so a Badge matches Alert,
  // Chip, and Button for the same variant+color on every theme and color scheme.
  const roles = resolveVariantRoles(theme, { variant, color, gradientStops });

  return {
    ...baseStyles,
    backgroundColor: roles.fill,
    borderColor: roles.border,
    ...(variant === 'gradient' ? { overflow: 'hidden' as const } : {}),
    ...shadowStyles
  };
};

const getBadgeTextStyles = (
  theme: PlatformBlocksTheme,
  variant: BadgeProps['variant'] = 'filled',
  color: BadgeProps['color'] = 'primary',
  size: ComponentSizeValue = 'md'
) => {
  const fontSize = getFontSize(size);

  // Legible label color via the same shared system (measured contrast for
  // filled/gradient, surface-readable tint for light/outline/subtle).
  const roles = resolveVariantRoles(theme, { variant, color });

  return {
    fontSize,
    textAlign: 'center' as const,
    color: roles.text,
  };
};

export const Badge = React.forwardRef<View, BadgeProps>((props, ref) => {
  const {
    children,
    size = 'md',
    variant,
    v, // variant alias
    color,
    c, // color alias
    onPress,
    startIcon,
    endIcon,
    onRemove,
    removePosition = 'right',
    disabled = false,
    style,
    textStyle,
    labelProps,
    radius,
    shadow,
    ...rest
  } = props;

  // The canonical name wins over its shorthand, matching Text and RollingNumber.
  const requestedVariant = variant || v || 'subtle';
  const resolvedColor = color || c || 'primary';
  const shouldUseGradient = requestedVariant === 'gradient' && hasLinearGradient;
  const effectiveVariant = shouldUseGradient ? 'gradient' : (requestedVariant === 'gradient' ? 'filled' : requestedVariant);

  const clampedSize = clampComponentSize(size, BADGE_ALLOWED_SIZES);

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const { shadowProps } = extractShadowProps({ shadow });
  const spacingStyles = getSpacingStyles(spacingProps);

  const theme = useTheme();

  // Handle radius prop with 'chip' as default
  const radiusStyles = createRadiusStyles(radius || 'badge');

  // Badges are flat by default on every variant; opt in with the `shadow` prop.
  const effectiveShadow = shadowProps.shadow ?? 'none';
  const shadowStyles = getShadowStyles({ shadow: effectiveShadow }, theme, 'badge');

  const height = getHeight(clampedSize);

  const gradientStops = React.useMemo(() => (
    shouldUseGradient ? resolveGradientStops(theme, resolvedColor as string) : undefined
  ), [shouldUseGradient, theme, resolvedColor]);

  const badgeStyles = getBadgeStyles(theme, effectiveVariant, resolvedColor, disabled, height - 10, radiusStyles, shadowStyles, gradientStops);
  const badgeTextStyles = getBadgeTextStyles(theme, effectiveVariant, resolvedColor, clampedSize);
  const iconSpacing = getSpacing(clampedSize) / 2;

  const Component = onPress ? Pressable : View;

  const removeButton = onRemove ? (
    <Button
      icon={<Icon name="x" size="sm" />}
      variant="none"
      onPress={onRemove}
      disabled={disabled}
      style={{ marginLeft: removePosition === 'right' ? DESIGN_TOKENS.spacing.xs : 0, marginRight: removePosition === 'left' ? DESIGN_TOKENS.spacing.xs : 0 }}
    />
  ) : null;

  const gradientOverlay = shouldUseGradient && gradientStops ? (
    <OptionalLinearGradient
      pointerEvents="none"
      colors={gradientStops}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, radiusStyles]}
    />
  ) : null;

  // Foreground row that must paint above the absolute gradient fill. On web,
  // positioned elements paint above non-positioned in-flow siblings regardless
  // of DOM order, so an opaque gradient would otherwise cover the label.
  const contentStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    zIndex: 1,
  };

  return (
    <Component
      ref={ref as any}
      style={[badgeStyles, spacingStyles, style]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      {...otherProps}
    >
      {gradientOverlay}
      <View style={contentStyles}>
        {removePosition === 'left' && removeButton && (
          <View style={{ marginRight: iconSpacing }}>
            {removeButton}
          </View>
        )}

        {startIcon && (
          <View style={{ marginRight: iconSpacing }}>
            {startIcon}
          </View>
        )}

        <Text
          {...mergeSlotProps(
            { weight: '500' as const, style: [badgeTextStyles, textStyle] },
            labelProps,
          )}
        >
          {children}
        </Text>

        {(endIcon || (onRemove && removePosition === 'right')) && (
          <View style={{ marginLeft: iconSpacing }}>
            {removePosition === 'right' && removeButton ? removeButton : endIcon}
          </View>
        )}
      </View>
    </Component>
  );
});

Badge.displayName = 'Badge';

export default Badge;
