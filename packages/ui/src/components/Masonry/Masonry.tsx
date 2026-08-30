import React from 'react';
import { View, ViewStyle, StyleSheet, ScrollView } from 'react-native';
import { factory, Factory } from '../../core/factory';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils/spacing';
import { getSpacing } from '../../core/theme/sizes';
import { Text } from '../Text';
import { Loader } from '../Loader';
import type { MasonryProps, MasonryItem } from './types';
import { Block } from '../Block';

export type {
  MasonryFlashListProps,
  MasonryItem,
  MasonryProps,
  MasonryViewabilityCallback,
  MasonryViewToken,
} from './types';

/**
 * Resolved lazily so apps that never render a Masonry neither bundle
 * @shopify/flash-list nor need it installed. Without it, the fallback below
 * still lays items out in columns — just without virtualization.
 */
const resolveFlashList = () =>
  resolveOptionalModule<any>('@shopify/flash-list', {
    accessor: (mod) => mod?.FlashList,
    devWarning:
      '@shopify/flash-list is not installed; <Masonry> renders all items in a ScrollView instead of a virtualized list.',
  });

const DefaultItemRenderer: React.FC<{ item: MasonryItem; index: number; gap: number }> = ({
  item,
  index,
  gap
}) => {
  return (
    <View style={{ padding: gap / 2, ...item.style }} key={item.id}>
      {item.content}
    </View>
  );
};

export const Masonry = factory<Factory<{ props: MasonryProps; ref: View }>>(
  (props, ref) => {
    // const { width } = useWindowDimensions();
    const { spacingProps, otherProps } = extractSpacingProps(props);
    
    const {
      data = [],
      numColumns = 2,
      gap = 'sm',
      optimizeItemArrangement = true,
      renderItem,
      contentContainerStyle,
      style,
      testID,
      loading = false,
      emptyContent,
      flashListProps = {},
      // Native FlashList passthrough props
      onEndReached,
      onEndReachedThreshold,
      onViewableItemsChanged,
      scrollEnabled,
      ListEmptyComponent,
      ListFooterComponent,
      ListHeaderComponent,
      estimatedItemSize,
      refreshControl,
      onScroll,
      scrollEventThrottle,
      ...restProps
    } = otherProps;

    const resolvedGap = getSpacing(gap);
    const spacingStyle = getSpacingStyles(spacingProps);

    // FlashList performance hints (overridable via flashListProps). Use loose typing to avoid version/type mismatches.
    const finalFlashListProps = React.useMemo(() => {
      const p: any = { ...flashListProps };
      if (p.estimatedItemSize == null) p.estimatedItemSize = estimatedItemSize ?? 180;
      if (p.keyExtractor == null) p.keyExtractor = (item: MasonryItem) => item.id;
      // Merge first-class passthrough props (explicit flashListProps overrides these)
      if (onEndReached !== undefined && p.onEndReached == null) p.onEndReached = onEndReached;
      if (onEndReachedThreshold !== undefined && p.onEndReachedThreshold == null) p.onEndReachedThreshold = onEndReachedThreshold;
      if (onViewableItemsChanged !== undefined && p.onViewableItemsChanged == null) p.onViewableItemsChanged = onViewableItemsChanged;
      if (scrollEnabled !== undefined && p.scrollEnabled == null) p.scrollEnabled = scrollEnabled;
      if (ListEmptyComponent !== undefined && p.ListEmptyComponent == null) p.ListEmptyComponent = ListEmptyComponent;
      if (ListFooterComponent !== undefined && p.ListFooterComponent == null) p.ListFooterComponent = ListFooterComponent;
      if (ListHeaderComponent !== undefined && p.ListHeaderComponent == null) p.ListHeaderComponent = ListHeaderComponent;
      if (refreshControl !== undefined && p.refreshControl == null) p.refreshControl = refreshControl;
      if (onScroll !== undefined && p.onScroll == null) p.onScroll = onScroll;
      if (scrollEventThrottle !== undefined && p.scrollEventThrottle == null) p.scrollEventThrottle = scrollEventThrottle;
      return p;
    }, [flashListProps, estimatedItemSize, onEndReached, onEndReachedThreshold, onViewableItemsChanged, scrollEnabled, ListEmptyComponent, ListFooterComponent, ListHeaderComponent, refreshControl, onScroll, scrollEventThrottle]);

    const renderMasonryItem = ({ item, index }: { item: MasonryItem; index: number }): React.ReactElement => {
      if (renderItem) {
        return (
          <View>
            {renderItem(item, index)}
          </View>
        );
      }

      return (
        <DefaultItemRenderer item={item} index={index} gap={resolvedGap} />
      );
    };

    const masonryStyle: ViewStyle = {
      flex: 1,
      width: '100%',
    };

    const containerStyle: ViewStyle = {
      ...spacingStyle,
      ...StyleSheet.flatten(style),
    };

    // Show loading state
    if (loading) {
      return (
        <View ref={ref} style={[containerStyle, { justifyContent: 'center', alignItems: 'center', minHeight: 200 }]} testID={testID}>
          <Loader size="lg" />
        </View>
      );
    }

    // Show empty state
    if (data.length === 0) {
      const defaultEmptyContent = (
        <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Text variant="p" style={{ color: '#888' }}>No items to display</Text>
        </View>
      );

      return (
        <View ref={ref} style={containerStyle} testID={testID}>
          {emptyContent || defaultEmptyContent}
        </View>
      );
    }

    const FlashList = resolveFlashList();

    if (!FlashList) {
      // Non-virtualized fallback: round-robin the items into columns. Keeps
      // content visible (and roughly masonry-shaped) when the optional
      // dependency is absent.
      const columns: { item: MasonryItem; index: number }[][] = Array.from(
        { length: Math.max(1, numColumns) },
        () => []
      );
      data.forEach((item, index) => {
        columns[index % columns.length].push({ item, index });
      });

      return (
        <View ref={ref} style={[masonryStyle, containerStyle]} testID={testID}>
          <ScrollView
            scrollEnabled={scrollEnabled}
            contentContainerStyle={contentContainerStyle as any}
            refreshControl={refreshControl as any}
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {columns.map((column, columnIndex) => (
                <View key={`masonry-column-${columnIndex}`} style={{ flex: 1 }}>
                  {column.map(({ item, index }) => (
                    <React.Fragment key={item.id}>
                      {renderMasonryItem({ item, index })}
                    </React.Fragment>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }

    return (
        <FlashList
        masonry
          data={data}
          renderItem={renderMasonryItem}
          numColumns={numColumns}
          
          key={`masonry-${numColumns}`} // Force re-render when numColumns changes
          contentContainerStyle={[
            {
            //   paddingHorizontal: resolvedGap / 2,
            //   paddingVertical: resolvedGap / 2,
            },
            contentContainerStyle as any
          ]}
          style={masonryStyle}
          {...(optimizeItemArrangement && {
            // Enable staggered grid layout for true masonry effect
            getItemType: (item: MasonryItem) => 
              item.heightRatio ? `height-${Math.ceil(item.heightRatio * 10)}` : 'default'
          })}
          {...finalFlashListProps}
        />
    );
  }
);

Masonry.displayName = 'Masonry';