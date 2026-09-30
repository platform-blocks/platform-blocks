import type React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { ShadowToken } from '../../core/theme/shadow';
import type { SizeValue } from '../../core/theme/sizes';
import type { BaseProps, ColorProp, RadiusValue } from '../../core/types/base';
import type { PassthroughAccessibilityProps } from '../Button/types';
import type { TextProps } from '../Text';

export type ChipVariant = 'filled' | 'outline' | 'light' | 'subtle' | 'surface' | 'gradient';

export interface ChipProps
  extends BaseProps<ViewStyle>,
    PassthroughAccessibilityProps {
  children: React.ReactNode;
  /** Size token; the chip renders one step smaller than a control of the same size. */
  size?: SizeValue;
  /**
   * Visual style (of the checked state, for a selectable chip). `surface` is the
   * neutral option — it fills from the theme's background tokens instead of the
   * `color` palette, sitting one step darker than the surface behind it (input
   * tokens, filter pills). Ignores `color`.
   */
  variant?: ChipVariant;
  /** Theme palette name, `'primary.6'` shade syntax, or CSS color. Not used by the `surface` variant. */
  color?: ColorProp;
  /** Makes the chip a button. */
  onPress?: () => void;
  /** Pressed state for a button chip, exposed as `aria-pressed` on web. */
  pressed?: boolean;
  /**
   * Checked state. Setting `checked`, `defaultChecked` or `onChange` makes the
   * chip selectable: a checkbox (`aria-checked`) that toggles on press.
   */
  checked?: boolean;
  /** Initial checked state (uncontrolled selectable chip). */
  defaultChecked?: boolean;
  /** Called with the next checked state when a selectable chip is pressed. */
  onChange?: (checked: boolean) => void;
  /** Variant of an unchecked selectable chip. @default 'outline' */
  uncheckedVariant?: ChipVariant;
  /** Show a small leading status dot. Defaults to the chip's resolved text color. */
  dot?: boolean;
  /** Override the dot color (any CSS/theme color string). Only used when `dot` is set. */
  dotColor?: ColorProp;
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
  /** Drop shadow token. Chips are flat by default. */
  shadow?: ShadowToken;
}
