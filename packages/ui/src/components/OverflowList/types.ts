import type React from 'react';
import type { ViewStyle } from 'react-native';
import type { BaseProps } from '../../core/types/base';
import type { SpacingValue } from '../../core/theme/types';
export interface OverflowListProps<T> extends BaseProps<ViewStyle> {
  /** Items to fit. */ data: readonly T[];
  /** Renders an item at its original index. */ renderItem: (item: T, index: number) => React.ReactNode;
  /** Renders the item that replaces hidden entries. */ renderOverflow: (hiddenItems: T[]) => React.ReactNode;
  /** Space between items. @default 'sm' */ gap?: SpacingValue;
  /** Maximum lines before collapsing. @default 1 */ maxRows?: number;
  /** Hard cap on shown entries. */ maxVisibleItems?: number;
  /** Side from which entries disappear. @default 'end' */ collapseFrom?: 'start' | 'end';
  /** Stable key for each item. */ getItemKey?: (item: T, index: number) => React.Key;
}
