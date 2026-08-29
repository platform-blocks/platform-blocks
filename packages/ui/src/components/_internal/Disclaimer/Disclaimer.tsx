import React from 'react';
import { View } from 'react-native';
import { Text, type TextProps } from '../../Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import type { SpacingValue } from '../../../core/theme/types';

export interface DisclaimerProps extends Omit<TextProps, 'children'> {
  children: React.ReactNode;
  mt?: SpacingValue;
}

/**
 * Disclaimer component for showing muted helper text below components
 */
export const Disclaimer: React.FC<DisclaimerProps> = ({
  children,
  mt = 'xs',
  size = 'sm',
  color = 'muted',
  ...textProps
}) => {
  return (
    <Text
      size={size}
      color={color}
      mt={mt}
      {...textProps}
    >
      {children}
    </Text>
  );
};