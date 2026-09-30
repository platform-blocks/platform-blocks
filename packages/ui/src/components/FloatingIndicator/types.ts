import type { View, ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
export interface FloatingIndicatorProps extends BaseProps<ViewStyle> {
  /** Element to highlight; null hides the indicator. */ target: View | HTMLElement | null;
  /** Positioned ancestor used for relative coordinates. */ parent: View | HTMLElement | null;
  /** Animation time in ms. @default 150 */ transitionDuration?: number;
  /** Called before animated movement. */ onTransitionStart?: () => void;
  /** Called when animated movement finishes. */ onTransitionEnd?: () => void;
  /** Defer appearance until a parent CSS transition finishes on web. */ displayAfterTransitionEnd?: boolean;
}
