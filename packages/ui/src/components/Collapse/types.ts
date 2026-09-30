import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';

/** Named easing presets for the height transition. */
export type CollapseTiming = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface CollapseProps extends BaseProps<ViewStyle> {
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
   * Always 0 when the user prefers reduced motion.
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Animation timing function
   * @default 'ease-out'
   */
  timing?: CollapseTiming;

  /**
   * Style for the content wrapper
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Callback fired when animation starts. Safe to pass inline — a new function
   * identity does not restart the animation.
   */
  onAnimationStart?: () => void;

  /**
   * Callback fired when animation completes. Safe to pass inline.
   */
  onAnimationEnd?: () => void;

  /**
   * Custom easing function overriding the timing preset. On iOS/Android it must
   * be a Reanimated worklet (e.g. `Easing.bezier(...)` from
   * `react-native-reanimated`); a plain JS function is ignored there (the
   * `timing` preset is used instead, with a dev warning). Web accepts any function.
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
