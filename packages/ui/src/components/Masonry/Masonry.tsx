import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import { resolveStyleProps, useStyleProps } from '../../core/utils/spacing';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { Text } from '../Text';
import { Loader } from '../Loader';
import type { MasonryProps, MasonryItem } from './types';

export type { MasonryProps, MasonryItem } from './types';

/**
 * The slice of FlashList's component type Masonry renders through. Props are
 * forwarded structurally (FlashList is an optional peer, so its own types
 * can't be referenced here).
 */
type FlashListComponent = React.ComponentType<Record<string, unknown>>;

/**
 * Resolved lazily so apps that never render a Masonry neither bundle
 * @shopify/flash-list nor need it installed. Without it, the fallback below
 * still lays items out in columns — just without virtualization.
 */
const resolveFlashList = () =>
  resolveOptionalModule<FlashListComponent>('@shopify/flash-list', {
    accessor: (mod: { FlashList?: FlashListComponent } | null | undefined) => mod?.FlashList,
    devWarning:
      '@shopify/flash-list is not installed; <Masonry> renders all items in a ScrollView instead of a virtualized list.',
  });

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  columns: { alignItems: 'flex-start', flexDirection: 'row' },
  column: { flex: 1 },
  list: { flex: 1, width: '100%' },
});

const keyExtractor = (item: MasonryItem) => item.id;

const getItemType = (item: MasonryItem) =>
  item.heightRatio ? `height-${Math.ceil(item.heightRatio * 10)}` : 'default';

const DefaultItemRenderer = React.memo(function DefaultItemRenderer({ item, gap }: { item: MasonryItem; gap: number }) {
  return <View style={[{ padding: gap / 2 }, item.style]}>{item.content}</View>;
});

export const Masonry = factory<{ props: MasonryProps; ref: View }>((props, ref) => {
  const {
    data = [],
    numColumns = 2,
    gap = 'sm',
    optimizeItemArrangement = true,
    renderItem,
    contentContainerStyle,
    contentProps,
    style,
    testID,
    loading = false,
    emptyContent,
    flashListProps,
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
  } = props;

  const theme = useTheme();
  const spacingStyles = useStyleProps(props);
  const contentStyle = [resolveStyleProps(contentProps ?? {}, theme), contentContainerStyle];
  const resolvedGap = resolveSpacing(theme, gap);
  const gapPx = typeof resolvedGap === 'number' ? resolvedGap : 0;

  // First-class passthrough props; explicit `flashListProps` entries win.
  const finalFlashListProps = React.useMemo(() => {
    const passthrough: Record<string, unknown> = {
      estimatedItemSize: estimatedItemSize ?? 180,
      keyExtractor,
      onEndReached,
      onEndReachedThreshold,
      onViewableItemsChanged,
      scrollEnabled,
      ListEmptyComponent,
      ListFooterComponent,
      ListHeaderComponent,
      refreshControl,
      onScroll,
      scrollEventThrottle,
    };
    const merged: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(passthrough)) {
      if (value !== undefined) merged[key] = value;
    }
    for (const [key, value] of Object.entries(flashListProps ?? {})) {
      if (value != null) merged[key] = value;
    }
    return merged;
  }, [flashListProps, estimatedItemSize, onEndReached, onEndReachedThreshold, onViewableItemsChanged, scrollEnabled, ListEmptyComponent, ListFooterComponent, ListHeaderComponent, refreshControl, onScroll, scrollEventThrottle]);

  const renderMasonryItem = ({ item, index }: { item: MasonryItem; index: number }): React.ReactElement => {
    if (renderItem) {
      return <View>{renderItem(item, index)}</View>;
    }
    return <DefaultItemRenderer item={item} gap={gapPx} />;
  };

  const rootStyle = [spacingStyles, style];

  // Show loading state
  if (loading) {
    return (
      <View ref={ref} style={[styles.centered, rootStyle]} testID={testID} aria-busy>
        <Loader size="lg" />
      </View>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <View ref={ref} style={rootStyle} testID={testID}>
        {emptyContent || (
          <View style={styles.centered}>
            <Text variant="p" style={{ color: theme.text.muted }}>
              No items to display
            </Text>
          </View>
        )}
      </View>
    );
  }

  const FlashList = resolveFlashList();

  if (!FlashList) {
    // Non-virtualized fallback: round-robin the items into columns. Keeps
    // content visible (and roughly masonry-shaped) when the optional
    // dependency is absent.
    const columns: { item: MasonryItem; index: number }[][] = Array.from({ length: Math.max(1, numColumns) }, () => []);
    data.forEach((item, index) => {
      columns[index % columns.length].push({ item, index });
    });

    return (
      <View ref={ref} style={[styles.list, rootStyle]} testID={testID}>
        <ScrollView
          scrollEnabled={scrollEnabled}
          contentContainerStyle={contentStyle}
          refreshControl={refreshControl}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
        >
          <View style={styles.columns}>
            {columns.map((column, columnIndex) => (
              <View key={`masonry-column-${columnIndex}`} style={styles.column}>
                {column.map(({ item, index }) => (
                  <React.Fragment key={item.id}>{renderMasonryItem({ item, index })}</React.Fragment>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // The root view carries the ref, testID, spacing and style on every path.
  return (
    <View ref={ref} style={[styles.list, rootStyle]} testID={testID}>
      <FlashList
        masonry
        data={data}
        renderItem={renderMasonryItem}
        numColumns={numColumns}
        key={`masonry-${numColumns}`} // Force re-render when numColumns changes
        // FlashList takes a single style object here, not a style array.
        contentContainerStyle={StyleSheet.flatten(contentStyle)}
        style={styles.list}
        {...(optimizeItemArrangement ? { getItemType } : null)}
        {...finalFlashListProps}
      />
    </View>
  );
}, { displayName: 'Masonry' });
