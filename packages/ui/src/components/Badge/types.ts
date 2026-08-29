import React from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';
import { type ComponentSizeValue } from '../../core/theme/componentSize';
import { SpacingProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import type { ThemeColor } from '../../core/theme/resolveColors';
import { ShadowProps } from '../../core/theme/shadow';
import type { TextProps } from '../Text';

export interface BadgeProps extends SpacingProps, BorderRadiusProps, ShadowProps {
  children: React.ReactNode;
  size?: ComponentSizeValue;
  variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'gradient';
  /** Shorthand alias for `variant`. `variant` wins when both are set. */
  v?: 'filled' | 'outline' | 'light' | 'subtle' | 'gradient';
  /** Badge color. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ThemeColor;
  /** Shorthand alias for `color`, resolved identically. `color` wins when both are set. */
  c?: ThemeColor;
  onPress?: () => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onRemove?: () => void;
  removePosition?: 'left' | 'right';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Override props applied to the inner label `<Text>` (style, weight, ff, size, color). */
  labelProps?: Omit<TextProps, 'children'>;
  radius?: any;
  shadow?: any;
}
