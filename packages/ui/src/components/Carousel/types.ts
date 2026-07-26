import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { SpacingProps } from '../../core/utils';
import type { ResponsiveSize } from '../AppShell/types';
import type { ComponentSizeValue } from '../../core/theme/componentSize';

export interface CarouselProps extends SpacingProps {
  /** Array of carousel slide elements */
  children: React.ReactNode[];
  /** Orientation of the carousel */
  orientation?: 'horizontal' | 'vertical';
  /** Show navigation arrow buttons */
  showArrows?: boolean;
  /** Show navigation dots */
  showDots?: boolean;
  /** Enable autoplay */
  autoPlay?: boolean;
  /** Autoplay interval in ms */
  autoPlayInterval?: number;
  /** Pause autoplay on user interaction */
  autoPlayPauseOnTouch?: boolean;
  /** Enable looping */
  loop?: boolean;
  /** Number of visible items per page */
  itemsPerPage?: number;
  /** Number of slides to advance per snap (defaults to itemsPerPage for backwards compatibility) */
  slidesToScroll?: number;
  /** Align the visible slides within the viewport when there is extra space */
  align?: 'start' | 'center' | 'end';
  /** Contain leading/trailing space by trimming or keeping snap points */
  containScroll?: false | 'trimSnaps' | 'keepSnaps';
  /** Initial slide index to show on mount */
  startIndex?: number;
  /** Allow momentum scrolling without forced snaps */
  dragFree?: boolean;
  /** Permit gestures to skip over multiple snap points (default true) */
  skipSnaps?: boolean;
  /** Drag distance (in px) required before a swipe is committed */
  dragThreshold?: number;
  /** Duration (ms) for programmatic scroll animations */
  duration?: number;
  /**
   * Slide transition length in ms. Cross-component spelling that takes
   * precedence over `duration`; `0` jumps between slides with no animation
   * (and also stills the pagination dots).
   */
  transitionDuration?: number;
  /** Embla-style breakpoint overrides applied via media queries */
  breakpoints?: Record<string, Partial<CarouselProps>>;
  /**
   * Explicit slide size. Accepts:
   *  - percentage string: e.g. "70%"
   *  - fraction (0..1) number: 0.7 -> 70% of container
   *  - absolute pixel number (>1)
   * When provided it overrides width derived from itemsPerPage. itemsPerPage still controls cloning + pagination grouping.
   */
  slideSize?: number | string | { base?: number | string; xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string; };
  /** Responsive gap between slides (overrides itemGap). Accepts spacing token string or number or responsive map. */
  slideGap?: ResponsiveSize;
  /** Gap between slides in pixels */
  itemGap?: number;
  /** Fixed height of the carousel container */
  height?: number;
  /** Callback fired when the active slide changes */
  onSlideChange?: (index: number) => void;
  /** Style override for the carousel container */
  style?: StyleProp<ViewStyle>;
  /** Style override applied to each slide item */
  itemStyle?: StyleProp<ViewStyle>;
  /** Enable snapping to individual items */
  snapToItem?: boolean;
  /** Position of navigation arrows relative to the carousel */
  arrowPosition?: 'inside' | 'outside';
  /** Size of the navigation arrow buttons */
  arrowSize?: ComponentSizeValue;
  /** Size of the navigation dots */
  dotSize?: ComponentSizeValue;
  /** Enable or disable scroll gestures */
  scrollEnabled?: boolean;
  /** Disable animated width/color transitions for dots and snapping */
  reducedMotion?: boolean;
  /** Number of logical pages to render for virtualization */
  windowSize?: number;
}
