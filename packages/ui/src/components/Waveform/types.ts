import type { ViewProps, ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';
import type { SizeValue } from '../../core/theme/types';
import type { ComponentSizeValue } from '../../core/theme/componentSize';

/** Metrics a single `size` token resolves to. */
export interface WaveformSizeMetrics {
  /** Height of the waveform canvas */
  height: number;
  /** Width of an individual bar */
  barWidth: number;
  /** Gap between bars */
  barGap: number;
  /** Stroke width of the `line` variant */
  strokeWidth: number;
  /** Floor applied to bar heights so silent passages stay visible */
  minBarHeight: number;
  /** Font size for timestamp and marker labels */
  labelFontSize: number;
}

/**
 * Waveform props. Extra React Native `View` props (`onLayout`, `pointerEvents`,
 * web `onKeyDown`, ...) pass through to the root view.
 */
export interface WaveformProps extends BaseProps<ViewStyle>, Omit<ViewProps, 'children' | 'style' | 'testID'> {
  /** Array of peak values (normalized between -1 and 1) */
  peaks: number[];
  /** Width in px; it sets the drawing's geometry. Use `fullWidth` to fill the parent. @default 300 */
  w?: number;
  /** Height in px (the drawing's geometry). Defaults to the `size` token's height. */
  h?: number;
  /** Color of the waveform */
  color?: string;
  /** Visual variant of the waveform */
  variant?: 'bars' | 'line' | 'rounded' | 'gradient';
  /**
   * Size token controlling height, bar width/gap, stroke width, and label type.
   * Accepts any of the seven component tokens (`xs`–`3xl`) or a number, which
   * is read as the waveform height and scales the bar metrics proportionally.
   * Individual props (`h`, `barWidth`, `barGap`, `strokeWidth`, `minBarHeight`)
   * override the token they derive from.
   * @default 'md'
   */
  size?: ComponentSizeValue;
  /** Width of individual bars (for bar variants) */
  barWidth?: number;
  /** Gap between bars (for bar variants) */
  barGap?: number;
  /** Stroke width for line variant */
  strokeWidth?: number;
  /** Colors for gradient variant */
  gradientColors?: string[];
  /** Progress value (0-1) to show playback position */
  progress?: number;
  /** Color for the progress indicator */
  progressColor?: string;
  /**
   * Whether the waveform is interactive. With `onSeek` it becomes a seek
   * slider: pointer press/drag, arrow keys (5 s steps when `duration` is set,
   * else 1%), PageUp/PageDown, Home/End, and screen-reader adjust actions.
   */
  interactive?: boolean;
  /** Callback fired when user clicks/seeks to a position (0-1) */
  onSeek?: (position: number) => void;
  /** Callback fired when user starts dragging */
  onDragStart?: (position: number) => void;
  /** Callback fired when user is dragging */
  onDrag?: (position: number) => void;
  /** Callback fired when user ends dragging */
  onDragEnd?: (position: number) => void;
  /**
   * Accessible name. Interactive waveforms are announced as a slider (default
   * name "Audio waveform"), others as an image ("Audio waveform visualization").
   */
  accessibilityLabel?: string;
  /** Accessibility hint for interactive waveforms (native) */
  accessibilityHint?: string;
  /** Minimum height for bars (prevents invisible bars) */
  minBarHeight?: number;
  /** Whether to normalize waveform heights so the tallest bar uses full height */
  normalize?: boolean;
  /** Whether the waveform should take the full width of its container */
  fullWidth?: boolean;
  /** Maximum number of bars to render (for performance with large datasets) */
  maxVisibleBars?: number;
  /** Whether to show a vertical progress line indicator */
  showProgressLine?: boolean;
  /** Style configuration for the progress line */
  progressLineStyle?: {
    color?: string;
    width?: number;
    opacity?: number;
  };
  /** Whether to show time stamps along the waveform */
  showTimeStamps?: boolean;
  /**
   * Duration in seconds, for time stamps and for the seek slider's spoken value
   * ("1:05 of 3:20") and keyboard step.
   */
  duration?: number;
  /** Time stamp interval in seconds */
  timeStampInterval?: number;
  
  // Loading & Error States
  /** Whether the waveform is in a loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Loading progress (0-1): fills that share of the loading skeleton's bars */
  loadingProgress?: number;
  
  // Selection
  /** Selected time range [start, end] in normalized coordinates (0-1) */
  selection?: [number, number];
  /**
   * Callback when selection changes. When set, Shift+press-and-drag (web)
   * selects a range instead of seeking.
   */
  onSelectionChange?: (selection: [number, number]) => void;

  // Visual Enhancements
  /** Whether to show RMS (average) levels alongside peaks */
  showRMS?: boolean;
  /** RMS data array (should match peaks length) */
  rmsData?: number[];
  /** Custom markers to display on the waveform */
  markers?: WaveformMarker[];
  
  // Performance
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Callback for performance metrics */
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
}

export interface WaveformMarker {
  /** Position on waveform (0-1) */
  position: number;
  /** Marker label */
  label?: string;
  /** Marker color */
  color?: string;
  /** Marker type */
  type?: 'line' | 'flag' | 'dot';
  /** Click handler */
  onPress?: () => void;
}

export interface PerformanceMetrics {
  /** Render time in milliseconds */
  renderTime: number;
  /** Number of elements rendered */
  elementsRendered: number;
  /** Memory usage estimate */
  memoryUsage: number;
  /** FPS during interactions */
  averageFPS: number;
}

export interface WaveformStyleProps {
  width: number;
  height: number;
  color: string;
  backgroundColor?: string;
  barWidth: number;
  barGap: number;
  variant: WaveformProps['variant'];
  size: SizeValue;
  interactive: boolean;
  minBarHeight: number;
}
