import type React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { ShadowToken } from '../../core/theme/shadow';
import type { BaseProps, ColorProp, RadiusValue } from '../../core/types/base';
import type { PassthroughAccessibilityProps } from '../Button/types';
import type { TextProps } from '../Text';

export type BadgeVariant = 'filled' | 'outline' | 'light' | 'subtle' | 'gradient';

export interface BadgeProps
  extends BaseProps<ViewStyle>,
    PassthroughAccessibilityProps {
  children: React.ReactNode;
  /** Size token (the badge renders well below a control of the same size), or height in px. */
  size?: ComponentSizeValue;
  /** @default 'subtle' */
  variant?: BadgeVariant;
  /** Shorthand alias for `variant`. `variant` wins when both are set. */
  v?: BadgeVariant;
  /** Badge color. A palette token, `'primary.6'` shade syntax, or any CSS color. */
  color?: ColorProp;
  /** Shorthand alias for `color`, resolved identically. `color` wins when both are set. */
  c?: ColorProp;
  /** Makes the badge a button. */
  onPress?: () => void;
  /** Content (usually an icon) before the label. */
  startSection?: React.ReactNode;
  /** Content (usually an icon) after the label. */
  endSection?: React.ReactNode;
  /** Show a remove (×) button that calls this. */
  onRemove?: () => void;
  /** Which side the remove button sits on (`left`/`right` follow the reading direction). */
  removePosition?: 'left' | 'right';
  /** Accessible name of the remove button. @default `Remove <label>` */
  removeButtonLabel?: string;
  disabled?: boolean;
  textStyle?: StyleProp<TextStyle>;
  /** Override props applied to the inner label `<Text>` (style, fw, ff, size, c). */
  labelProps?: Omit<TextProps, 'children'>;
  /** Corner radius. @default 'full' */
  radius?: RadiusValue;
  /** Drop shadow token. Badges are flat by default. */
  shadow?: ShadowToken;
}
