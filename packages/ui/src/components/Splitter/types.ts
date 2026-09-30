import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';

export type SplitterPaneSize = number | `${number}%` | `${number}px` | `${number}rem`;

export interface SplitterPanelOptions {
  defaultSize?: SplitterPaneSize;
  min?: SplitterPaneSize;
  max?: SplitterPaneSize;
  collapsible?: boolean;
  collapseThreshold?: SplitterPaneSize;
}

export interface SplitterHandle {
  sizes: SplitterPaneSize[];
  collapsed: boolean[];
  setSizes: (sizes: SplitterPaneSize[]) => void;
  collapse: (index: number) => void;
  expand: (index: number) => void;
  toggleCollapse: (index: number) => void;
}

export interface UseSplitterOptions {
  panels: SplitterPanelOptions[];
  orientation?: 'horizontal' | 'vertical';
  sizes?: SplitterPaneSize[];
  onSizeChange?: (sizes: SplitterPaneSize[]) => void;
  onCollapseChange?: (index: number, collapsed: boolean) => void;
  redistribute?:
    | 'nearest'
    | 'equal'
    | ((sizes: SplitterPaneSize[], index: number, delta: number) => SplitterPaneSize[]);
}

export interface UseSplitterReturn extends SplitterHandle {
  containerSize: number;
  onLayout: (event: { nativeEvent: { layout: { width: number; height: number } } }) => void;
  resize: (index: number, delta: number) => void;
}

export interface SplitterProps extends BaseProps<ViewStyle>, Omit<UseSplitterOptions, 'panels'> {
  children: React.ReactNode;
  onResizeStart?: (index: number) => void;
  onResizeEnd?: (index: number) => void;
  step?: number;
  shiftStep?: number;
  lineSize?: number;
  handleColor?: string;
  withHandle?: boolean;
  handleIcon?: React.ReactNode;
  resetOnDoubleClick?: boolean;
  splitterRef?: React.RefObject<SplitterHandle | null>;
}

export interface SplitterPaneProps extends BaseProps<ViewStyle>, SplitterPanelOptions {
  children?: React.ReactNode;
}
