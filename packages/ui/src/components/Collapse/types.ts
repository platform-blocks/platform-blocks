import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface CollapseProps {
  /**
   * Whether the content is collapsed (hidden). `false` reveals/expands it.
   */
  isCollapsed: boolean;
  
  /**
   * Content to show/hide
   */
  children: ReactNode;
  
  /**
   * Animation duration in milliseconds
   * @default 300
   */
  duration?: number;

  /**
   * Duration (ms) of the height transition. Cross-component spelling that takes
   * precedence over `duration`; `0` snaps open/closed with no animation.
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Animation timing function
   * @default 'ease-out'
   */
  timing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Style for the content wrapper
   */
  contentStyle?: StyleProp<ViewStyle>;
  
  /**
   * Callback fired when animation starts
   */
  onAnimationStart?: () => void;
  
  /**
   * Callback fired when animation completes
   */
  onAnimationEnd?: () => void;

  /**
   * Custom easing function overriding the timing preset
   */
  easing?: (value: number) => number;
  
  /**
   * Whether to animate on initial mount
   * @default false
   */
  animateOnMount?: boolean;
  
  /**
   * Custom height when collapsed (useful for partial reveals)
   * @default 0
   */
  collapsedHeight?: number;
  
  /**
   * Whether to fade content in/out along with height animation
   * @default true
   */
  fadeContent?: boolean;
}