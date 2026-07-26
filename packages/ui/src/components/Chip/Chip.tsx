import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';

import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { SizeValue, getFontSize, getSpacing, getHeight } from '../../core/theme/sizes';
import { createRadiusStyles } from '../../core/theme/radius';
import { hexToRgb } from '../../core/theme/colorUtils';
import { resolveVariantRoles, resolveGradientStops } from '../../core/theme/variantRoles';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { getSpacingStyles, extractSpacingProps, extractShadowProps, getShadowStyles, mergeSlotProps } from '../../core/utils';
import type { ChipProps } from './types';
import { Icon } from '../Icon';
import { resolveLinearGradient } from '../../utils/optionalDependencies';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

/**
 * Circular remove ("×") button rendered inside a Chip. The icon inherits the
 * chip's resolved label color so it stays legible on every variant, and a
 * translucent scrim of that same color fades in on hover / press to give the
 * control a clear, tappable affordance.
 *
 * It's drawn deliberately light — a hairline stroke at partial opacity — so the
 * chip reads as its label first and the affordance second. Hover / press bring
 * it to full strength, so the control still announces itself when aimed at.
 */
const CLOSE_ICON_STROKE = 1.75;
const CLOSE_ICON_REST_OPACITY = 0.55;
const ChipCloseButton: React.FC<{
  size: SizeValue;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  position: 'left' | 'right';
  label?: string;
}> = ({ size, color, onPress, disabled, position, label }) => {
  // Track just above the label rather than a fixed 18px floor, which made the ×
  // larger than the text it sat next to on sm/xs chips.
  const iconSize = Math.max(12, Math.round(getFontSize(size) * 1.15));
  const buttonSize = iconSize + 6;
  const rgb = hexToRgb(color);
  const scrim = (alpha: number) => (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : `rgba(128, 128, 128, ${alpha})`);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label ?? 'Remove'}
      hitSlop={6}
      style={({ hovered, pressed }: any) => [
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          marginLeft: position === 'right' ? 1 : 0,
          marginRight: position === 'left' ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
          backgroundColor: pressed ? scrim(0.18) : hovered ? scrim(0.1) : 'transparent',
          ...(Platform.OS === 'web'
            ? ({ cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background-color 0.12s ease' } as any)
            : {}),
        },
      ]}
    >
      {/*
        Function children give the icon the same interaction state the scrim uses.
        `hovered` is web-only (undefined on native), so the rest → press step
        still works everywhere.
      */}
      {({ hovered, pressed }: any) => (
        <Icon
          name="close"
          size={iconSize}
          stroke={CLOSE_ICON_STROKE}
          color={color}
          style={{
            opacity: hovered || pressed ? 1 : CLOSE_ICON_REST_OPACITY,
            ...(Platform.OS === 'web' ? ({ transition: 'opacity 0.12s ease' } as any) : {}),
          }}
        />
      )}
    </Pressable>
  );
};

type ChipVariant = NonNullable<ChipProps['variant']>;

const getChipStyles = (
  theme: PlatformBlocksTheme,
  variant: ChipProps['variant'] = 'filled',
  color: ChipProps['color'] = 'primary',
  size: SizeValue = 'md',
  disabled: boolean = false,
  height: number,
  radiusStyles: any,
  shadowStyles: any,
  gradientStops?: [string, string]
) => {
  const horizontalSpacing = getSpacing(size);

  const baseStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height,
    paddingHorizontal: horizontalSpacing,
    borderWidth: 1,
    opacity: disabled ? 0.5 : 1,
    position: 'relative' as const,
    ...radiusStyles
  };

  const roles = resolveVariantRoles(theme, { variant, color, gradientStops });

  const styleForVariant = {
    ...baseStyles,
    backgroundColor: roles.fill,
    borderColor: roles.border,
    ...(variant === 'gradient' ? { overflow: 'hidden' as const } : {})
  };

  // Chips are flat unless the consumer opts in via `shadow`, in which case every
  // variant honors it.
  return { ...styleForVariant, ...shadowStyles };
};

const getChipTextStyles = (
  theme: PlatformBlocksTheme,
  variant: ChipProps['variant'] = 'filled',
  color: ChipProps['color'] = 'primary',
  size: SizeValue = 'md'
) => {
  const fontSize = getFontSize(size);

  const roles = resolveVariantRoles(theme, { variant, color });

  return {
    fontSize,
    textAlign: 'center' as const,
    color: roles.text,
  };
};

export const Chip = React.forwardRef<View, ChipProps>((props, ref) => {
  const {
    children,
    size = 'md',
    variant = 'filled',
    color = 'primary',
    onPress,
    dot = false,
    dotColor,
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

  const requestedVariant = variant;
  const resolvedColor = color;
  const isCustomColor = typeof resolvedColor === 'string' && !['primary', 'secondary', 'success', 'warning', 'error', 'gray'].includes(resolvedColor as string);
  const shouldUseGradient = requestedVariant === 'gradient' && hasLinearGradient;
  const effectiveVariant = shouldUseGradient ? 'gradient' : (requestedVariant === 'gradient' ? 'filled' : requestedVariant);

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const { shadowProps } = extractShadowProps({ shadow });
  const spacingStyles = getSpacingStyles(spacingProps);

  const theme = useTheme();

  // Handle radius prop with 'chip' as default
  const radiusStyles = createRadiusStyles(radius || 'chip');

  // Chips are flat by default on every variant; opt in with the `shadow` prop.
  const effectiveShadow = shadowProps.shadow ?? 'none';
  const shadowStyles = getShadowStyles({ shadow: effectiveShadow }, theme, 'chip');

  const height = getHeight(size);
  const gradientStops = React.useMemo(() => (
    shouldUseGradient ? resolveGradientStops(theme, resolvedColor as string) : undefined
  ), [shouldUseGradient, theme, resolvedColor, isCustomColor]);

  const chipStyles = getChipStyles(theme, effectiveVariant, resolvedColor, size, disabled, height - 10, radiusStyles, shadowStyles, gradientStops);
  const chipTextStyles = getChipTextStyles(theme, effectiveVariant, resolvedColor, size);
  const iconSpacing = getSpacing(size) / 2;

  // Leading status dot. Defaults to the resolved label color so it stays legible
  // across every variant + color scheme; caller can override via `dotColor`.
  const dotSize = Math.max(6, Math.round(getFontSize(size) * 0.42));
  const dotNode = dot ? (
    <View
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: dotColor ?? chipTextStyles.color,
        opacity: dotColor ? 1 : 0.9,
      }}
    />
  ) : null;

  // Foreground row that must paint above the absolute gradient fill (see JSX below).
  const contentStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    zIndex: 1,
  };

  const Component = onPress ? Pressable : View;

  const removeButton = onRemove ? (
    <ChipCloseButton
      size={size}
      color={chipTextStyles.color}
      onPress={onRemove}
      disabled={disabled}
      position={removePosition}
    />
  ) : null;

  // Pull the remove button toward the chip edge by trimming the padding on its
  // side (the circular button already carries its own internal breathing room).
  const removeEdgeStyle = onRemove
    ? removePosition === 'right'
      ? { paddingRight: Math.max(2, getSpacing(size) - 6) }
      : { paddingLeft: Math.max(2, getSpacing(size) - 6) }
    : null;

  return (
    <Component
      ref={ref as any}
      style={[chipStyles, removeEdgeStyle, spacingStyles, style]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      {...otherProps}
    >
      {shouldUseGradient && gradientStops && (
        <OptionalLinearGradient
          pointerEvents="none"
          colors={gradientStops}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, radiusStyles]}
        />
      )}
      {/*
        The gradient above is absolutely positioned. On web, positioned elements
        paint above non-positioned in-flow siblings regardless of DOM order, so an
        opaque gradient would cover the label. Keep the foreground content in a
        positioned wrapper with a higher zIndex so it always sits above the fill.
      */}
      <View style={contentStyles}>
        {removePosition === 'left' && removeButton && (
          <View style={{ marginRight: iconSpacing }}>
            {removeButton}
          </View>
        )}

        {dotNode && (
          <View style={{ marginRight: iconSpacing }}>
            {dotNode}
          </View>
        )}

        {startIcon && (
          <View style={{ marginRight: iconSpacing }}>
            {startIcon}
          </View>
        )}

        <Text
          {...mergeSlotProps(
            { weight: '500' as const, style: [chipTextStyles, textStyle] },
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

Chip.displayName = 'Chip';

export default Chip;
