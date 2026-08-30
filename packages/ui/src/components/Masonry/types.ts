import type { ReactNode } from 'react';
import type {
  ScrollViewProps,
  StyleProp,
  ViewabilityConfig,
  ViewStyle,
} from 'react-native';

import type { SpacingProps } from '../../core/utils/spacing';
import type { SizeValue } from '../../core/theme/sizes';

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

/**
 * Stable viewability payload exposed by Masonry without coupling consumers to
 * FlashList's internal source declarations.
 */
export interface MasonryViewToken<T> {
  item: T;
  key: string;
  index: number | null;
  isViewable: boolean;
  timestamp: number;
}

/**
 * FlashList options that Masonry forwards to the optional virtualized renderer.
 *
 * This intentionally mirrors the supported public surface instead of extending
 * FlashListProps. FlashList 2.x publishes declarations that re-export its raw
 * source, which makes consumers type-check the dependency internals.
 */
export type MasonryFlashListProps = Omit<
  Partial<ScrollViewProps>,
  'onViewableItemsChanged'
> & {
  drawDistance?: number;
  estimatedItemSize?: number;
  extraData?: unknown;
  getItemType?: (item: MasonryItem, index: number, extraData?: unknown) => string | number | undefined;
  keyExtractor?: (item: MasonryItem, index: number) => string;
  maxItemsInRecyclePool?: number;
  onLoad?: (info: { elapsedTimeInMs: number }) => void;
  onViewableItemsChanged?: MasonryViewabilityCallback;
  optimizeItemArrangement?: boolean;
  overrideItemLayout?: (
    layout: { span?: number; size?: number },
    item: MasonryItem,
    index: number,
    maxColumns: number,
    extraData?: unknown
  ) => void;
  viewabilityConfig?: ViewabilityConfig | null;
};

export type MasonryViewabilityCallback = ((info: {
  viewableItems: MasonryViewToken<MasonryItem>[];
  changed: MasonryViewToken<MasonryItem>[];
}) => void) | null;

export interface MasonryProps extends SpacingProps {
  /** Array of items to display in masonry layout */
  data: MasonryItem[];
  /** Number of columns (default: 2) */
  numColumns?: number;
  /** Spacing between items */
  gap?: SizeValue;
  /** Whether to optimize for staggered grid layout */
  optimizeItemArrangement?: boolean;
  /** Custom item renderer - receives item and index */
  renderItem?: (item: MasonryItem, index: number) => ReactNode;
  /** Content container style */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
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
  onViewableItemsChanged?: MasonryViewabilityCallback;

  /** Whether scrolling is enabled */
  scrollEnabled?: boolean;

  /** Component rendered when the list is empty */
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;

  /** Component rendered at the bottom of the list */
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;

  /** Component rendered at the top of the list */
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;

  /** Estimated size of each item (performance hint) */
  estimatedItemSize?: number;

  /** Pull-to-refresh control */
  refreshControl?: React.ReactElement;

  /** Scroll event callback */
  onScroll?: ScrollViewProps['onScroll'];

  /** Throttle interval for scroll events in ms */
  scrollEventThrottle?: number;
}