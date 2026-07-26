import type { ReactNode } from 'react';
import type { SpacingProps } from '../../core/theme/types';
import type { LayoutProps } from '../../core/utils';
import type { BorderRadiusProps } from '../../core/theme/radius';
import type { ComponentSizeValue } from '../../core/theme/componentSize';

export interface KeyCapMetrics {
  height: number;
  minWidth: number;
  paddingHorizontal: number;
  fontSize: number;
}

export interface KeyCapProps extends SpacingProps, LayoutProps, BorderRadiusProps {
  /**
   * The key or text to display
   */
  children: ReactNode;
  
  /**
   * Size variant of the key cap
   */
  size?: ComponentSizeValue;
  
  /**
   * Visual variant of the key cap
   */
  variant?: 'default' | 'minimal' | 'outline' | 'filled';
  
  /**
   * Color scheme for the key cap
   */
  color?: 'primary' | 'secondary' | 'gray' | 'success' | 'warning' | 'error';
  
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
   * If provided, the component will animate when this key is pressed
   */
  keyCode?: string;
  
  /**
   * Modifier keys that must be pressed along with the main key
   */
  modifiers?: Array<'ctrl' | 'cmd' | 'alt' | 'shift' | 'meta'>;
  
  /**
   * Whether the key cap should appear pressed
   */
  pressed?: boolean;
  
  /**
   * Callback when the key combination is pressed
   */
  onKeyPress?: () => void;
  
  /**
   * Custom test ID for testing
   */
  testID?: string;

  /** Custom font family (overrides the default monospace stack) */
  fontFamily?: string;

  /** Shorthand alias for `fontFamily` */
  ff?: string;
}

export interface KeyCapStyleProps {
  metrics: KeyCapMetrics;
  variant: NonNullable<KeyCapProps['variant']>;
  color: NonNullable<KeyCapProps['color']>;
  pressed: boolean;
}
