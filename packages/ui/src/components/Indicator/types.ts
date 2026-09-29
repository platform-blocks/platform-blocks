import type React from 'react';
import type { ViewStyle } from 'react-native';

import type { SizeValue } from '../../core/theme/types';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { TextProps } from '../Text';

export interface IndicatorProps extends BaseProps<ViewStyle> {
  /** Dot diameter: a size token (the font size of that token) or px. @default 'sm' */
  size?: SizeValue | number;
  /** Fill: palette token, `'primary.6'` shade syntax, or CSS color. @default 'success' */
  color?: ColorProp;
  /** Ring color separating the dot from what it sits on. @default theme.backgrounds.surface */
  borderColor?: ColorProp;
  borderWidth?: number;
  /** Corner of the parent. `left` / `right` follow the reading direction (they mirror under RTL). */
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  offset?: number;
  /**
   * Free-form content rendered inside the indicator dot. Useful when a custom
   * icon is needed; for plain text counts prefer `label`, which auto-resizes
   * the dot and applies a contrast-aware text color.
   */
  children?: React.ReactNode;
  /**
   * Convenience text content (typically a count). When set, the dot expands to
   * fit the label and the text uses a contrast-aware color.
   */
  label?: React.ReactNode;
  /** Override props applied to the label `<Text>` (style, fw, ff, size, c). */
  labelProps?: Omit<TextProps, 'children'>;
  /**
   * Accessible description of what the indicator means ("Online", "3 unread
   * messages"). Without it a plain dot is decorative.
   */
  accessibilityLabel?: string;
  invisible?: boolean;
}
