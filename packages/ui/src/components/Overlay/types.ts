import type { ReactNode } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ThemeColor } from '../../core/theme/resolveColors';

export interface OverlayProps extends Omit<ViewProps, 'style'>, BaseProps {
  /**
   * Background color for the overlay: a raw color, a palette token
   * (`'primary'`, `'primary.6'`) or a `theme.backgrounds` / `theme.text` key.
   * @default theme.backgrounds.scrim
   */
  color?: ThemeColor;
  /**
   * Opacity of the background color only — children stay opaque. Defaults to
   * 0.6 with a `color`; without one, the theme scrim keeps its own alpha unless this is set.
   */
  opacity?: number;
  /** Opacity applied to the background color; takes precedence over `opacity`. */
  backgroundOpacity?: number;
  /** Web-only CSS gradient string. Falls back to `color` on native platforms. */
  gradient?: string;
  /** Amount of backdrop blur (px number or CSS length). Web only. */
  blur?: number | string;
  /** Corner radius for the overlay surface. */
  radius?: RadiusValue;
  /**
   * z-index applied to the overlay container. Defaults to 1 so the overlay covers
   * its siblings wherever it is rendered, or the theme's `overlay` layer when `fixed`.
   */
  zIndex?: number;
  /** Use viewport-fixed positioning instead of absolute positioning (web only). */
  fixed?: boolean;
  /** Center children horizontally and vertically. */
  center?: boolean;
  /** Optional style overrides applied after computed styles. */
  style?: StyleProp<ViewStyle>;
  /** Overlay content rendered on top of the dimmed background. */
  children?: ReactNode;
}

export interface OverlayFactoryPayload {
  props: OverlayProps;
  ref: View;
}
