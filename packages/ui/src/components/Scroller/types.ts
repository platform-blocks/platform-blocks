import type React from 'react';
import type { ScrollView, ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { SizeValue } from '../../core/theme/types';
import type { IconButtonProps } from '../IconButton';
export interface UseScrollerOptions { scrollAmount?: number; draggable?: boolean }
export interface UseScrollerReturn {
  ref: React.RefObject<ScrollView | null>;
  canScrollStart: boolean; canScrollEnd: boolean; isDragging: boolean;
  scrollStart: () => void; scrollEnd: () => void;
  onScroll: (event: { nativeEvent: { contentOffset: { x: number } } }) => void;
  onLayout: (event: { nativeEvent: { layout: { width: number } } }) => void;
  onContentSizeChange: (width: number) => void;
  dragHandlers: { onMouseDown: (event: { clientX?: number }) => void; onMouseUp: () => void; onMouseLeave: () => void; onMouseMove: (event: { clientX?: number }) => void };
}
export interface ScrollerProps extends BaseProps<ViewStyle>, UseScrollerOptions {
  children: React.ReactNode;
  /** Control button size. */ controlSize?: SizeValue;
  /** Replaces the start chevron. */ startControlIcon?: React.ReactNode;
  /** Replaces the end chevron. */ endControlIcon?: React.ReactNode;
  /** Props forwarded to the start button. */ startControlProps?: Partial<IconButtonProps>;
  /** Props forwarded to the end button. */ endControlProps?: Partial<IconButtonProps>;
  /** Always show the start button. */ showStartControl?: boolean;
  /** Always show the end button. */ showEndControl?: boolean;
  /** Gradient end color. */ edgeGradientColor?: string;
}
