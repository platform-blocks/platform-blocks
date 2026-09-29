import type React from 'react';
import type {
  ImageErrorEventData,
  ImageSourcePropType,
  ImageStyle,
  NativeSyntheticEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ColorValue, SizeValue } from '../../core/theme/types';
import type { LayoutProps } from '../../core/utils/layout';

/**
 * Props for `Image`. `w` / `h` size the image itself as well as its root box;
 * the other box props (`maw`, `bg`, `opacity`, …) apply to the root only.
 */
export interface ImageProps extends BaseProps<ViewStyle>, LayoutProps {
  /** Remote image URI, or a bundled asset from `require('./photo.png')` */
  src?: string | ImageSourcePropType;

  /** Image source object (alternative to src) */
  source?: ImageSourcePropType;

  /**
   * Text alternative, announced by screen readers (`aria-label` on web,
   * `accessibilityLabel` on native). Pass `alt=""` for a purely decorative
   * image: it is then hidden from assistive technology. An image with neither
   * `alt` nor `accessibilityLabel` is treated as decorative too.
   */
  alt?: string;

  /** Accessible name; takes precedence over `alt`. */
  accessibilityLabel?: string;

  /** Image resize mode */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';

  /** Size preset (`xs` 24 … `3xl` 96) or a square size in px. `w` / `h` win over it. */
  size?: SizeValue;

  /** Aspect ratio */
  aspectRatio?: number;

  /** Border width */
  borderWidth?: number;

  /** Border color (defaults to the theme border color) */
  borderColor?: ColorValue;

  /** Corner radius: size token, px number, `'none'` or `'full'`. Wins over `rounded`. */
  radius?: RadiusValue;

  /** Round the corners with the theme's `md` radius */
  rounded?: boolean;

  /** Render as a circle (radius = half the width) */
  circle?: boolean;

  /** Fallback element to show on error */
  fallback?: React.ReactNode;

  /** Loading state element */
  loading?: React.ReactNode;

  /** Called when image loads successfully */
  onLoad?: () => void;

  /** Called when image fails to load */
  onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;

  /** Called when image starts loading */
  onLoadStart?: () => void;

  /** Called when image finishes loading (success or error) */
  onLoadEnd?: () => void;

  /** Container style (applied before `style`) */
  containerStyle?: StyleProp<ViewStyle>;

  /** Image style overrides */
  imageStyle?: StyleProp<ImageStyle>;
}
