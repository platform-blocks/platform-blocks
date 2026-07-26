import React from 'react';
import { View } from 'react-native';
import { DESIGN_TOKENS } from '../../core';
import { useTheme } from '../../core/theme';
import type { FormLayoutProps } from './types';

export const FormLayout = React.forwardRef<View, FormLayoutProps>(({
  children,
  maxWidth = 600,
  spacing = 'lg',
  variant = 'default',
}, ref) => {
  const theme = useTheme();

  const getSpacing = () => {
    switch (spacing) {
      case 'sm': return DESIGN_TOKENS.spacing.sm;
      case 'md': return DESIGN_TOKENS.spacing.md;
      case 'lg': return DESIGN_TOKENS.spacing.lg;
      case 'xl': return DESIGN_TOKENS.spacing.xl;
      default: return DESIGN_TOKENS.spacing.lg;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return {
          backgroundColor: theme.colors.gray[1],
          borderRadius: DESIGN_TOKENS.radius.lg,
          padding: DESIGN_TOKENS.spacing.xl,
          borderWidth: 1,
          borderColor: theme.colors.gray[3],
        };
      case 'modal':
        return {
          backgroundColor: 'white',
          borderRadius: DESIGN_TOKENS.radius.xl,
          padding: DESIGN_TOKENS.spacing.xl,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        };
      default:
        return {
          backgroundColor: 'transparent',
          padding: 0,
        };
    }
  };

  return (
    <View
      ref={ref}
      style={{
        maxWidth,
        width: '100%',
        alignSelf: 'center',
        gap: getSpacing(),
        ...getVariantStyles(),
      }}
    >
      {children}
    </View>
  );
});

FormLayout.displayName = 'FormLayout';