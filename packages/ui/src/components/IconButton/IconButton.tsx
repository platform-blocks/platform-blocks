import React, { useMemo, useRef, useState } from 'react';
import { Pressable, View, Animated, Easing, Platform } from 'react-native';
import { useTheme } from '../../core/theme';
import { SizeValue, getFontSize, getSpacing, getHeight } from '../../core/theme/sizes';
import { createRadiusStyles } from '../../core/theme/radius';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { getSpacingStyles, extractSpacingProps, extractShadowProps, getShadowStyles, getLayoutStyles, extractLayoutProps } from '../../core/utils';
import { Loader } from '../Loader';
import { Icon } from '../Icon';
import { Tooltip, resolveTooltipProps } from '../Tooltip';
import { IconButtonProps } from './types';
import { useHaptics } from '../../hooks/useHaptics';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { resolveLinearGradient } from '../../utils/optionalDependencies';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

const getIconButtonStyles = (
  theme: PlatformBlocksTheme,
  variant: IconButtonProps['variant'] = 'default',
  size: SizeValue = 'md',
  disabled: boolean = false,
  loading: boolean = false,
  height: number,
  radiusStyles: any,
  shadowStyles: any,
  customColor?: string
): any => {
  const baseStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height,
    width: height, // Make it square by default
    minHeight: height,
    minWidth: height,
    borderWidth: 1,
    opacity: disabled ? 0.5 : loading ? 0.8 : 1,
    ...radiusStyles,
    ...shadowStyles
  };

  // If custom color is provided, use it for filled/secondary variants
  if (customColor) {
    const resolvedColor = resolveColor(customColor, theme);
    
    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: resolvedColor,
          borderColor: resolvedColor,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: `${resolvedColor}20`, // 20% opacity
          borderColor: `${resolvedColor}40`, // 40% opacity
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderColor: resolvedColor,
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
    }
  }

  // Default theme-based styles
  const isDark = theme.colorScheme === 'dark';
  switch (variant) {
    case 'default':
      // Matches Button's `default`: card surface plus a neutral hairline. Stays
      // neutral even when a `color` is supplied, which is the point of the variant.
      return {
        ...baseStyles,
        backgroundColor: theme.backgrounds?.surface ?? theme.colors.surface[0],
        borderColor: isDark ? theme.colors.gray[3] : theme.colors.gray[2],
      };
    case 'filled':
      return {
        ...baseStyles,
        backgroundColor: theme.colors.primary[5],
        borderColor: theme.colors.primary[5],
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: theme.colors.gray[1],
        borderColor: theme.colors.gray[3],
      };
    case 'outline':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: theme.colors.primary[5],
      };
    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      };
    case 'gradient':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      };
    case 'none':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
      };
    default:
      return {
        ...baseStyles,
        backgroundColor: theme.colors.primary[5],
        borderColor: theme.colors.primary[5],
      };
  }
};

const getIconColor = (
  theme: PlatformBlocksTheme,
  variant: IconButtonProps['variant'] = 'default',
  customColor?: string,
  iconColor?: string
): string => {
  // If explicit icon color is provided, use it
  if (iconColor) {
    return resolveColor(iconColor, theme);
  }

  // If custom color is provided, derive icon color
  if (customColor) {
    const resolvedColor = resolveColor(customColor, theme);
    switch (variant) {
      case 'filled':
        return theme.colors.surface[0]; // White/light text on colored background
      case 'secondary':
      case 'outline':
      case 'ghost':
        return resolvedColor; // Use the custom color for icon
      case 'gradient':
        return theme.colors.surface[0];
      default:
        return resolvedColor;
    }
  }

  // Default theme-based icon colors
  switch (variant) {
    case 'default':
      return theme.text.primary; // Neutral chrome, like Button's `default`
    case 'filled':
      return theme.colors.surface[0]; // White/light on primary background
    case 'secondary':
      return theme.colors.gray[7];
    case 'outline':
      return theme.colors.primary[6];
    case 'ghost':
      return theme.colors.gray[6];
    case 'gradient':
      return theme.colors.surface[0];
    case 'none':
      return theme.colors.gray[6];
    default:
      return theme.colors.surface[0];
  }
};

const resolveColor = (color: string, theme: PlatformBlocksTheme): string => {
  // If it's already a valid CSS color (hex, rgb, etc.), return as-is
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
    return color;
  }
  
  // Handle theme token syntax like 'primary' or 'primary.6'
  const [palette, shade] = color.split('.');
  const shadeIndex = shade ? parseInt(shade, 10) : 5; // Default to middle shade
  
  if (theme.colors[palette as keyof typeof theme.colors]) {
    const paletteColors = theme.colors[palette as keyof typeof theme.colors] as any;
    return paletteColors[shadeIndex] || paletteColors[5] || color;
  }
  
  return color;
};

const getDefaultIconSize = (buttonSize: SizeValue): SizeValue => {
  const sizeMap: Record<SizeValue, SizeValue> = {
    'xs': 'xs',
    'sm': 'sm',
    'md': 'md',
    'lg': 'lg',
    'xl': 'xl',
    '2xl': 'xl',
    '3xl': 'xl'
  };
  return sizeMap[buttonSize] || 'md';
};

export const IconButton = React.forwardRef<View, IconButtonProps>((allProps, ref) => {
  const { spacingProps, otherProps: withoutSpacing } = extractSpacingProps(allProps);
  const { shadowProps, otherProps: withoutShadow } = extractShadowProps(withoutSpacing);
  const { layoutProps, otherProps } = extractLayoutProps(withoutShadow);

  const {
    icon,
    onPress,
    onLayout,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    colorVariant,
    iconColor,
    iconVariant,
    iconSize,
    tooltip,
    tooltipPosition = 'top',
    accessibilityLabel,
    transitionDuration,
    style,
    testID,
    radius = 'md', // Default to medium radius (square-ish), 'xl' will be circular
    ...restProps
  } = otherProps;

  const theme = useTheme();
  const { impactPressIn, impactPressOut } = useHaptics();

  const effectiveVariant = variant === 'gradient' && !hasLinearGradient ? 'filled' : variant;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressInDuration = useTransitionDuration(transitionDuration, 100);
  const pressOutDuration = useTransitionDuration(transitionDuration, 150);
  const [isPressed, setIsPressed] = useState(false);

  // Calculate button height based on size
  const height = getHeight(size);

  // Create radius styles - xl radius makes it circular
  const radiusStyles = createRadiusStyles(radius, height, 'button');
  
  // Create shadow styles
  const shadowStyles = getShadowStyles(shadowProps, theme);

  // Get button styles
  const buttonStyles = useMemo(() => 
    getIconButtonStyles(theme, effectiveVariant, size, disabled, loading, height, radiusStyles, shadowStyles, colorVariant),
    [theme, effectiveVariant, size, disabled, loading, height, radiusStyles, shadowStyles, colorVariant]
  );

  // Get icon color
  const resolvedIconColor = useMemo(() => 
    getIconColor(theme, effectiveVariant, colorVariant, iconColor),
    [theme, effectiveVariant, colorVariant, iconColor]
  );

  // Get icon size
  const resolvedIconSize = iconSize || getDefaultIconSize(size);

  // `transitionDuration={0}` (and reduced motion) snap to the end state —
  // a 0ms timing would still cost a frame.
  const animateScale = (toValue: number, duration: number) => {
    if (duration === 0) {
      scaleAnim.setValue(toValue);
      return;
    }
    Animated.timing(scaleAnim, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
      impactPressIn();
      animateScale(0.95, pressInDuration);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    impactPressOut();
    animateScale(1, pressOutDuration);
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Loader 
          size={resolvedIconSize} 
          color={resolvedIconColor}
        />
      );
    }

    const iconProps = typeof icon === 'string' ? { name: icon } : { icon };
    return (
      <Icon
        {...iconProps}
        size={resolvedIconSize}
        color={resolvedIconColor}
        variant={iconVariant}
      />
    );
  };

  const buttonElement = (
    <Animated.View
      style={[
        getSpacingStyles(spacingProps),
        getLayoutStyles(layoutProps),
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
  {variant === 'gradient' && hasLinearGradient ? (
        <OptionalLinearGradient
          colors={[theme.colors.primary[4], theme.colors.primary[6]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[buttonStyles, { borderWidth: 0 }]}
        >
          <Pressable
            ref={ref}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLayout={onLayout}
            disabled={disabled || loading}
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{
              disabled: disabled || loading,
              busy: loading,
            }}
            testID={testID}
            {...restProps}
          >
            {renderContent()}
          </Pressable>
        </OptionalLinearGradient>
      ) : (
        <Pressable
          ref={ref}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLayout={onLayout}
          disabled={disabled || loading}
          style={[
            buttonStyles,
            isPressed && !disabled && !loading && {
              backgroundColor: effectiveVariant === 'filled' 
                ? theme.colors.primary[6] 
                : effectiveVariant === 'secondary'
                ? theme.colors.gray[2]
                : buttonStyles.backgroundColor,
            },
          ]}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{
            disabled: disabled || loading,
            busy: loading,
          }}
          testID={testID}
          {...restProps}
        >
          {renderContent()}
        </Pressable>
      )}
    </Animated.View>
  );

  // Wrap with tooltip if provided — string shorthand or full Tooltip config.
  const tooltipProps = resolveTooltipProps(tooltip, { position: tooltipPosition });
  if (tooltipProps) {
    return (
      <Tooltip {...tooltipProps}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
});

IconButton.displayName = 'IconButton';