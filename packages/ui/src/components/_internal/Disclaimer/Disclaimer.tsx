import React from 'react';
import { Text, type TextProps } from '../../Text';
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
  c: color = 'muted',
  ...textProps
}) => {
  return (
    <Text
      size={size}
      c={color}
      mt={mt}
      {...textProps}
    >
      {children}
    </Text>
  );
};