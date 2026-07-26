import React from 'react';
import { Pressable, Text as RNText, View, ViewStyle, TextStyle, Platform, Linking } from 'react-native';

import { useTheme } from '../../core/theme';
import { SizeValue, getFontSize } from '../../core/theme/sizes';
import { SpacingProps, getSpacingStyles, extractSpacingProps } from '../../core/utils';
import type { PlatformBlocksTheme } from '../../core/theme/types';

export interface LinkProps extends SpacingProps {
  /** Link text content */
  children: React.ReactNode;
  /** URL or handler for the link */
  href?: string;
  /** Custom onPress handler (overrides href) */
  onPress?: () => void;
  /** Size of the link text (default: 'lg' = 16px to match Text component) */
  size?: SizeValue;
  /** Color variant or custom color string */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray' | 'inherit' | string;
  /** Link variant */
  variant?: 'default' | 'subtle' | 'hover-underline';
  /** Whether the link is disabled */
  disabled?: boolean;
  /** Whether to show external link indicator */
  external?: boolean;
  /** Custom style for container */
  style?: ViewStyle;
  /** Custom style for text */
  textStyle?: TextStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Whether this link opens in a new tab/window (web only) */
  target?: '_blank' | '_self';
  /** Custom font family (overrides theme font) */
  fontFamily?: string;
  /** Shorthand alias for `fontFamily` */
  ff?: string;
}

const getLinkStyles = (
  theme: PlatformBlocksTheme,
  color: LinkProps['color'] = 'primary',
  variant: LinkProps['variant'] = 'default',
  size: SizeValue = 'lg', // Changed from 'md' to 'lg' to match Text component's 16px default
  disabled: boolean = false,
  fontFamily?: string
) => {
  const fontSize = getFontSize(size);

  // Color resolution
  let textColor: string;
  if (color === 'inherit') {
    textColor = 'inherit';
  } else if (color === 'primary' || color === 'secondary' || color === 'success' || color === 'warning' || color === 'error' || color === 'gray') {
    textColor = disabled ? theme.colors.gray[5] : theme.colors[color][6];
  } else {
    textColor = disabled ? theme.colors.gray[5] : color;
  }

  const baseStyles: TextStyle = {
    fontSize,
    color: textColor,
    fontFamily: fontFamily ?? theme.fontFamily,
    textDecorationLine: variant === 'default' ? 'underline' : 'none',
    // Ensure proper text baseline alignment
    textAlignVertical: 'center',
    includeFontPadding: false,
  };

  if (variant === 'hover-underline') {
    // Note: React Native doesn't support :hover, but this prepares the structure
    baseStyles.textDecorationLine = 'none';
  }

  if (disabled) {
    baseStyles.opacity = 0.6;
  }

  return baseStyles;
};

export const Link = React.forwardRef<View, LinkProps>((props, ref) => {
  const {
    children,
    href,
    onPress,
    size = 'lg', // Changed from 'md' to 'lg' to match Text component's 16px default
    color = 'primary',
    variant = 'default',
    disabled = false,
    external = false,
    style,
    textStyle,
    accessibilityLabel,
    target = '_self',
    fontFamily,
    ff,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const spacingStyles = getSpacingStyles(spacingProps);

  const linkStyles = getLinkStyles(theme, color, variant, size, disabled, ff ?? fontFamily);

  const handlePress = () => {
    if (disabled) return;
    
    if (onPress) {
      onPress();
    } else if (href) {
      // Handle different platforms
      if (Platform.OS === 'web') {
        // Web platform
        if (target === '_blank' || external) {
          window.open(href, '_blank');
        } else {
          window.location.href = href;
        }
      } else {
        // React Native - use Linking API to open URLs
        Linking.openURL(href).catch((err) => {
          console.error('Failed to open URL:', href, err);
        });
      }
    }
  };

  const accessibilityProps = {
    accessibilityLabel: accessibilityLabel || (typeof children === 'string' ? children : undefined),
    accessibilityRole: 'link' as const,
    accessibilityState: { disabled },
  };

  // On web, render as an actual anchor element
  if (Platform.OS === 'web') {
    const webStyles = {
      ...spacingStyles,
      ...style,
      // Container styles for proper alignment
      display: 'inline-flex' as const,
      // alignItems: 'center' as const,
      textDecoration: 'none' as const,
      cursor: disabled ? 'not-allowed' : 'pointer',
      marginTop:'auto',
      marginBottom:'auto'
    };

    const webTextStyles = {
      ...linkStyles,
      ...textStyle,
      // Ensure proper baseline alignment on web
      lineHeight: 'inherit' as const,
      verticalAlign: 'baseline' as const,
      // Use theme font family instead of hardcoded font
      fontFamily: linkStyles.fontFamily,
      // Add transition for smooth hover effect
      transition: 'text-decoration 0.2s ease' as const,
    };

    return React.createElement(
      'a',
      {
        href: disabled ? undefined : href,
        target: (target === '_blank' || external) ? '_blank' : '_self',
        rel: (target === '_blank' || external) ? 'noopener noreferrer' : undefined,
        onClick: onPress ? (e: Event) => {
          e.preventDefault();
          if (!disabled) onPress();
        } : undefined,
        style: webStyles,
        onMouseEnter: !disabled ? (e: any) => {
          // Add underline on hover for all variants except when disabled
          e.target.style.textDecoration = 'underline';
        } : undefined,
        onMouseLeave: !disabled ? (e: any) => {
          // Restore original text decoration
          e.target.style.textDecoration = variant === 'default' ? 'underline' : 'none';
        } : undefined,
        'aria-label': accessibilityLabel,
        'aria-disabled': disabled,
      },
      React.createElement(
        'span',
        {
          style: webTextStyles,
        },
        children,
        external && ' ↗'
      )
    );
  }

  // On React Native, use Pressable
  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      disabled={disabled}
      style={[
        spacingStyles, 
        style,
        // Ensure proper alignment in flex containers
        { alignSelf: 'flex-start' }
      ]}
      {...accessibilityProps}
    >
      {({ pressed }) => (
        <RNText
          style={[
            linkStyles,
            pressed && !disabled && { opacity: 0.7 },
            textStyle
          ]}
        >
          {children}
          {external && ' ↗'}
        </RNText>
      )}
    </Pressable>
  );
});

Link.displayName = 'Link';
