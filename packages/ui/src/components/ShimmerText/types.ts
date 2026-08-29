import type { ReactNode } from 'react';
import type { TextProps } from '../Text';

export type ShimmerDirection = 'ltr' | 'rtl';

export interface ShimmerTextProps extends Omit<TextProps, 'children' | 'color' | 'onLayout' | 'value'> {
  /** Text node children. Overrides `text` when provided */
  children?: ReactNode;
  /** Text content to render when not using children */
  text?: string;
  /** Base text color rendered underneath the shimmer */
  color?: string;
  /** Optional gradient stops override */
  colors?: string[];
  /** Highlight color used for the shimmer pass */
  shimmerColor?: string;
  /**
   * Width of the highlight band as a multiple of the text width (higher = wider
   * highlight). The band always travels from fully clear of one edge to fully
   * clear of the other, so this also sets how far it moves per cycle.
   */
  spread?: number;
  /** Duration of a single shimmer cycle in seconds */
  duration?: number;
  /** Delay before the shimmer starts (seconds) */
  delay?: number;
  /** Pause held at the end of each cycle, with the band off screen (seconds) */
  repeatDelay?: number;
  /** Whether the shimmer should repeat indefinitely */
  repeat?: boolean;
  /** Animate only once after becoming visible */
  once?: boolean;
  /** Direction of shimmer movement */
  direction?: ShimmerDirection;
  /** Enable verbose logging for debugging */
  debug?: boolean;
  /** Called with the layout of the shimmer container */
  onLayout?: TextProps['onLayout'];
  /** Start shimmering once the component enters the viewport (web only) */
  startOnView?: boolean;
  /** `rootMargin` for the `startOnView` IntersectionObserver (web only) */
  inViewMargin?: string;
  /** Optional container style */
  containerStyle?: any;
  /** Optional test identifier */
  testID?: string;
}
