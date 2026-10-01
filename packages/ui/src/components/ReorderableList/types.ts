import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';

export interface ReorderResult<T> {
  data: T[];
  from: number;
  to: number;
}

export interface ReorderableListProps<T> extends BaseProps<ViewStyle> {
  /** Ordered items. Update this array in onReorder to commit a move. */
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: { item: T; index: number; isActive: boolean }) => React.ReactNode;
  /** Used in the drag handle's accessible name. */
  getItemLabel?: (item: T, index: number) => string;
  onReorder: (result: ReorderResult<T>) => void;
  disabled?: boolean;
  /** Enable the native list's own scrolling. Disable inside a parent ScrollView. @default true */
  scrollEnabled?: boolean;
}
