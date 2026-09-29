import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { BorderRadiusProps } from '../../core/theme/radius';
import type { BaseProps, ColorProp } from '../../core/types/base';
import type { LayoutProps } from '../../core/utils/layout';

export interface KeyCapMetrics {
  height: number;
  minWidth: number;
  paddingHorizontal: number;
  fontSize: number;
}

export type KeyCapVariant = 'default' | 'minimal' | 'outline' | 'filled';
export type KeyCapModifier = 'ctrl' | 'cmd' | 'alt' | 'shift' | 'meta';

export interface KeyCapProps extends BaseProps<ViewStyle>, LayoutProps, BorderRadiusProps {
  /**
   * The key or text to display
   */
  children: ReactNode;

  /**
   * Size token (a key cap renders below a control of the same size), or the height in px
   */
  size?: ComponentSizeValue;

  /**
   * Visual variant of the key cap
   */
  variant?: KeyCapVariant;

  /**
   * Color for the `minimal`, `outline` and `filled` variants: a palette token,
   * `'primary.6'` shade syntax, or any CSS color. `default` stays neutral.
   * @default 'gray'
   */
  color?: ColorProp;

  /**
   * Whether the key should animate when the actual key is pressed
   * Only works on web platforms
   */
  animateOnPress?: boolean;
  /**
   * Length of the press-down/up animation in ms; both legs scale against a
   * 250ms baseline. `0` leaves the cap at rest. Always 0 under reduced motion.
   * @default 250
   */
  transitionDuration?: number;

  /**
   * The actual key code to listen for (e.g., 'Enter', 'Space', 'Escape')
   * If provided, the component will animate when this key is pressed (web)
   */
  keyCode?: string;

  /**
   * Modifier keys that must be pressed along with the main key
   */
  modifiers?: KeyCapModifier[];

  /**
   * Whether the key cap should appear pressed
   */
  pressed?: boolean;

  /**
   * Callback when the key combination is pressed (web)
   */
  onKeyPress?: () => void;

  /** Custom font family (overrides the theme's monospace stack) */
  ff?: string;

}

export interface KeyCapStyleProps {
  metrics: KeyCapMetrics;
  variant: KeyCapVariant;
  color: ColorProp;
  pressed: boolean;
}
