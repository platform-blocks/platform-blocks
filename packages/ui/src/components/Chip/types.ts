import React from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';
import { SizeValue } from '../../core/theme/sizes';
import { SpacingProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';
import { ShadowProps } from '../../core/theme/shadow';
import type { TextProps } from '../Text';

export interface ChipProps extends SpacingProps, BorderRadiusProps, ShadowProps {
  children: React.ReactNode;
  size?: SizeValue;
  /**
   * Visual style. `surface` is the neutral option — it fills from the theme's
   * background tokens instead of the `color` palette, sitting one step darker
   * than the surface behind it (input tokens, filter pills). Ignores `color`.
   */
  variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'surface' | 'gradient';
  /** Theme palette name or CSS color. Not used by the `surface` variant. */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray' | string;
  onPress?: () => void;
  /** Show a small leading status dot. Defaults to the chip's resolved text color. */
  dot?: boolean;
  /** Override the dot color (any CSS/theme color string). Only used when `dot` is set. */
  dotColor?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onRemove?: () => void;
  removePosition?: 'left' | 'right';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Override props applied to the inner label `<Text>` (style, weight, ff, size, colorVariant). */
  labelProps?: Omit<TextProps, 'children'>;
  radius?: any;
  shadow?: any;
}
