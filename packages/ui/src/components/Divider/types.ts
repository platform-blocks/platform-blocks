import type React from 'react';
import type { View, ViewProps, ViewStyle } from 'react-native';

import type { ThemeColor } from '../../core/theme/resolveColors';
import type { SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import type { TextProps } from '../Text';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted' | 'gradient';

export interface DividerProps extends BaseProps<ViewStyle>, Omit<ViewProps, 'style' | 'testID' | 'children'> {
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
  /** Optional content rendered in the middle of the line. A string label is also the separator's accessible name. */
  label?: React.ReactNode;
  /**
   * Where the `label` sits along the line. `'left'` / `'right'` are the leading /
   * trailing ends, so they mirror in right-to-left layouts. Defaults to `'center'`.
   */
  labelPosition?: 'left' | 'center' | 'right';
  /** Override props applied to the label `<Text>` (only when `label` is a string). */
  labelProps?: Omit<TextProps, 'children'>;
}

export interface DividerFactoryPayload {
  props: DividerProps;
  ref: View;
}
