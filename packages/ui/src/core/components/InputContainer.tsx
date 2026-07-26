import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SizeValue } from '../theme/types';
import { createRadiusStyles } from '../theme/radius';
import { createInteractiveStyles, getSectionSpacing } from '../theme/unified-sizing';

export interface InputContainerProps {
  children: React.ReactNode;
  size?: SizeValue;
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
  radius?: any;
  startSection?: React.ReactNode;
  endSection?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Unified input container that provides consistent styling
 * for all input-like components (Input, Select, AutoComplete, etc.)
 */
export function InputContainer({
  children,
  size = 'md',
  disabled = false,
  error = false,
  focused = false,
  radius,
  startSection,
  endSection,
  style,
}: InputContainerProps) {
  const theme = useTheme();
  const radiusStyles = createRadiusStyles(radius || 'md');
  const spacing = getSectionSpacing(size);

  const containerStyles = createInteractiveStyles(
    theme,
    size,
    'outline',
    disabled ? 'disabled' : focused ? 'focus' : 'default'
  );

  const finalStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: disabled
      ? (theme.colorScheme === 'dark' ? '#2C2C2E' : theme.colors.gray[0])
      : theme.backgrounds.surface,
    borderColor: error
      ? theme.colors.error[5]
      : focused
        ? theme.colors.primary[5]
        : disabled
          ? theme.backgrounds.border
          : 'transparent',
    borderWidth: 1, // Constant in every state — focus/error only change borderColor
    ...radiusStyles,
    // Override base container styles but preserve border behavior
    minHeight: containerStyles.minHeight,
    paddingHorizontal: containerStyles.paddingHorizontal,
    paddingVertical: containerStyles.paddingVertical,
    fontSize: containerStyles.fontSize,
    // No focus ring/glow — focus is carried by `borderColor` above.
    // Add subtle shadow for depth
    ...(!disabled && theme.colorScheme === 'light' && {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    }),
    elevation: disabled ? 0 : 1,
    // Web-only affordances for disabled state
    ...(typeof window !== 'undefined' && disabled && ({ 
      cursor: 'not-allowed', 
      opacity: 0.75 
    } as any)),
  };

  return (
    <View style={[finalStyles, style]}>
      {startSection && (
        <View style={{ paddingRight: spacing }}>
          {startSection}
        </View>
      )}
      
      <View style={{ flex: 1 }}>
        {children}
      </View>
      
      {endSection && (
        <View style={{ 
          paddingLeft: spacing,
          flexDirection: 'row',
          alignItems: 'center' 
        }}>
          {endSection}
        </View>
      )}
    </View>
  );
}