import type React from 'react';
import type { ReactNode } from 'react';
import type { ViewStyle, StyleProp, ScrollViewProps } from 'react-native';

import type { BaseProps } from '../../core/types/base';
import type { SizeValue } from '../../core/theme/types';

// @shopify/flash-list is an optional peer, so the public types below describe
// the parts of its API that Masonry forwards structurally instead of importing
// them. Emitted declarations must not reference an optional peer: consumers
// without it installed would otherwise get unresolved (silently `any`) types.

/** Mirrors FlashList's `ViewToken<T>` (see @shopify/flash-list). */
export interface MasonryViewToken<T = MasonryItem> {
  item: T;
  key: string;
  index: number | null;
  isViewable: boolean;
  timestamp?: number;
}

/**
 * Extra props forwarded verbatim to FlashList. FlashList's props extend
 * `ScrollViewProps`; anything else it accepts passes through untyped.
 */
export type MasonryFlashListProps = Partial<ScrollViewProps> & Record<string, unknown>;

export interface MasonryItem {
  /** Unique identifier for the item */
  id: string;
  /** Content to render inside the item */
  content: ReactNode;
  /** Optional custom height ratio (default: 1) */
  heightRatio?: number;
  /** Optional custom styling for the item */
  style?: StyleProp<ViewStyle>;
}

export interface MasonryProps extends BaseProps<ViewStyle> {
  /** Array of items to display in masonry layout */
  data: MasonryItem[];
  /** Number of columns (default: 2) */
  numColumns?: number;
  /** Spacing between items (spacing token or px) — applied by the default item renderer */
  gap?: SizeValue;
  /** Whether to optimize for staggered grid layout */
  optimizeItemArrangement?: boolean;
  /** Custom item renderer - receives item and index */
  renderItem?: (item: MasonryItem, index: number) => ReactNode;
  /** Content container style */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Loading state */
  loading?: boolean;
  /** Empty state content */
  emptyContent?: ReactNode;
  /** Flash list props to pass through */
  flashListProps?: MasonryFlashListProps;

  // --- Native FlashList passthrough props ---

  /** Callback when the end of the list is reached (for pagination / infinite scroll) */
  onEndReached?: ((info: { distanceFromEnd: number }) => void) | null;

  /** Distance from end (in pixels) to trigger onEndReached (default: FlashList default) */
  onEndReachedThreshold?: number;

  /** Callback when viewable items change */
  onViewableItemsChanged?: ((info: { viewableItems: MasonryViewToken<MasonryItem>[]; changed: MasonryViewToken<MasonryItem>[] }) => void) | null;

  /** Whether scrolling is enabled */
  scrollEnabled?: boolean;

  /** Component rendered when the list is empty */
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;

  /** Component rendered at the bottom of the list */
  ListFooterComponent?: React.ComponentType | React.ReactElement | null;

  /** Component rendered at the top of the list */
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;

  /** Estimated size of each item (performance hint) */
  estimatedItemSize?: number;

  /** Pull-to-refresh control */
  refreshControl?: ScrollViewProps['refreshControl'];

  /** Scroll event callback */
  onScroll?: ScrollViewProps['onScroll'];

  /** Throttle interval for scroll events in ms */
  scrollEventThrottle?: number;
}