import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps, RadiusValue } from '../../core/types/base';
import type { ShadowToken } from '../../core/theme/shadow';
export interface FloatingWindowPosition { x: number; y: number }
export interface FloatingWindowInitialPosition { top?: number; left?: number; right?: number; bottom?: number }
export interface FloatingWindowDimensions { initialWidth?: number; initialHeight?: number; minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number }
export interface FloatingWindowHandle { setPosition: (position: FloatingWindowInitialPosition) => void }
export interface UseFloatingWindowOptions {
  initialPosition?: FloatingWindowInitialPosition;
  enabled?: boolean;
  constrainToViewport?: boolean;
  constrainOffset?: number;
  axis?: 'x' | 'y';
  onPositionChange?: (position: FloatingWindowPosition) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  setPositionRef?: React.RefObject<FloatingWindowHandle | null>;
}
export interface UseFloatingWindowReturn {
  position: FloatingWindowPosition;
  isDragging: boolean;
  setPosition: (position: FloatingWindowInitialPosition) => void;
  setSize: (width: number, height: number) => void;
  dragHandlers: ReturnType<typeof import('../../core/gestures/useDragGesture').useDragGesture>;
}
export interface FloatingWindowProps extends BaseProps<ViewStyle>, UseFloatingWindowOptions {
  children?: React.ReactNode;
  /** Dimensions and resize limits. */ dimensions?: FloatingWindowDimensions;
  /** Called when resized. */ onSizeChange?: (size: { width: number; height: number }) => void;
  onResizeStart?: () => void; onResizeEnd?: () => void;
  /** Surface border. */ withBorder?: boolean;
  /** Surface radius. */ radius?: RadiusValue;
  /** Surface shadow. */ shadow?: ShadowToken;
  /** Overlay stack order. */ zIndex?: number;
  /** Render at app root. @default true */ withinPortal?: boolean;
}
export interface FloatingWindowDragHandleProps extends BaseProps<ViewStyle> { children?: React.ReactNode }
export interface FloatingWindowResizeHandleProps extends BaseProps<ViewStyle> { children?: React.ReactNode }
