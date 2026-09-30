import type React from 'react';
import type { ImageSourcePropType, ViewStyle } from 'react-native';

import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { TextProps } from '../Text';

export interface AvatarProps extends BaseProps<ViewStyle> {
  /** Size of the avatar: a token or the diameter in px */
  size?: ComponentSizeValue;
  /** Image for the avatar: a remote URL string or a bundled asset (`require('./avatar.png')`) */
  src?: string | ImageSourcePropType;
  /** Fallback shown when no image is provided: initials string or a custom React node (e.g. an icon). */
  fallback?: React.ReactNode;
  /**
   * Fill of the avatar circle — not the root, which also holds the label. Resolves
   * like every `bg`: a palette name is its subtle tint, `'primary.5'` a shade.
   * @default theme.text.muted
   */
  bg?: ColorProp;
  /** Text color for the fallback initials. @default a readable color on the background */
  textColor?: ColorProp;
  /** Whether to show online status indicator */
  online?: boolean;
  /** Color override for the status indicator */
  indicatorColor?: ColorProp;
  /** Accessible name of the avatar ("Jane Doe"). The avatar is an image with this name; without it, it is decorative. */
  accessibilityLabel?: string;
  /** Primary label displayed beside the avatar (string or custom React node) */
  label?: React.ReactNode;
  /** Secondary description/subtext under the label */
  description?: React.ReactNode;
  /** Spacing between avatar and text block (px) */
  gap?: number;
  /** Force horizontal layout off (set false to hide label/description wrapper) */
  showText?: boolean;
  /** Override props applied to the fallback initials `<Text>` (style, fw, ff, size, c). */
  fallbackProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the adjacent label `<Text>` (only when `label` is a string). */
  labelProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the secondary description `<Text>` (only when `description` is a string). */
  descriptionProps?: Omit<TextProps, 'children'>;
}

export interface AvatarGroupProps extends BaseProps<ViewStyle> {
  children: React.ReactNode;
  /** Show at most this many avatars, then a `+N` surplus avatar. */
  limit?: number;
  /** Overlap between avatars (negative px). @default -8 */
  spacing?: number;
  size?: ComponentSizeValue;
  /** Whether to add borders around avatars for separation */
  bordered?: boolean;
  /** When `limit` hides avatars, wrap the `+N` surplus indicator in a Tooltip with this label. */
  surplusTooltip?: string;
  /** Accessible name of the surplus avatar. @default `${N} more` */
  surplusLabel?: string;
}
