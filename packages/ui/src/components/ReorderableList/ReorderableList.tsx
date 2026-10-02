import React from 'react';
import { View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { IconButton } from '../IconButton';
import { moveItem } from './moveItem';
import type { ReorderableListProps } from './types';

/** Native long-press drag reordering with accessible move actions. */
export function ReorderableList<T>(props: ReorderableListProps<T>) {
  const { data, keyExtractor, renderItem, getItemLabel, onReorder, disabled = false, scrollEnabled = true, style, testID, ...rest } = props;
  const theme = useTheme();
  const { styleProps, otherProps } = extractStyleProps(rest);
  const move = (from: number, to: number) => {
    if (disabled) return;
    const result = moveItem(data, from, to);
    if (result) onReorder(result);
  };

  return (
    <View {...otherProps} testID={testID} style={[resolveStyleProps(styleProps, theme), style]}>
      <DraggableFlatList
        data={data}
        scrollEnabled={scrollEnabled}
        style={{ flexGrow: 0 }}
        keyExtractor={keyExtractor}
        onDragEnd={({ from, to }) => move(from, to)}
        renderItem={({ item, drag, isActive, getIndex }) => {
          const index = getIndex() ?? data.indexOf(item);
          const label = getItemLabel?.(item, index) ?? `item ${index + 1}`;
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.backgrounds.surface, borderBottomColor: theme.backgrounds.border, borderBottomWidth: 1 }}>
              <IconButton
                icon="sort"
                variant="ghost"
                accessibilityLabel={`Reorder ${label}`}
                accessibilityHint="Long press and drag, or use accessibility actions to move"
                accessibilityActions={[{ name: 'increment', label: 'Move down' }, { name: 'decrement', label: 'Move up' }]}
                onAccessibilityAction={(event) => {
                  if (event.nativeEvent.actionName === 'increment') move(index, index + 1);
                  if (event.nativeEvent.actionName === 'decrement') move(index, index - 1);
                }}
                disabled={disabled}
                onLongPress={drag}
              />
              <View style={{ flex: 1 }}>{renderItem({ item, index, isActive })}</View>
            </View>
          );
        }}
      />
    </View>
  );
}
