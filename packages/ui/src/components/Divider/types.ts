import React from 'react';
import { ViewStyle, View, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/utils';
import { SizeValue } from '../../core/theme/sizes';
import type { TextProps } from '../Text';
import type { ThemeColor } from '../../core/theme/resolveColors';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted' | 'gradient';

export interface DividerProps extends SpacingProps {
  /** Layout direction of the line. `'horizontal'` spans width; `'vertical'` spans height. Defaults to `'horizontal'`. */
  orientation?: DividerOrientation;
  /** Visual style of the line. `'gradient'` fades transparent → color → transparent. Defaults to `'solid'`. */
  variant?: DividerVariant;
  /**
   * Line color. Accepts the named tokens `'border'` / `'subtle'` / `'muted'`, a
   * palette name (`'success'` → a shade well below the accent, so a tinted rule
   * still reads as chrome), `'primary.6'` shade syntax, or any CSS color.
   * Defaults to `'border'`.
   */
  color?: ThemeColor;
  /** Thickness of the divider (default 1). Accepts a size token or pixel value. */
  size?: SizeValue | number;
  /** Multiplied with the divider's overall opacity. Convenience prop equivalent to `style={{ opacity }}`. */
  opacity?: number;
  /** Optional content rendered in the middle of the line. */
  label?: React.ReactNode;
  /** Where the `label` sits along the line. Defaults to `'center'`. */
  labelPosition?: 'left' | 'center' | 'right';
  /** Override props applied to the label `<Text>` (only when `label` is a string). */
  labelProps?: Omit<TextProps, 'children'>;
  /** Style override applied to the outer wrapping `View`. */
  style?: StyleProp<ViewStyle>;
  /** Test identifier forwarded to the wrapping `View`. */
  testID?: string;
}

export interface DividerFactoryPayload {
  props: DividerProps;
  ref: View;
}
