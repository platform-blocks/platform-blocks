import React, { useRef, useState } from 'react';
import { View } from 'react-native';

import { webProps } from '../../core/platform/webProps';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { IconButton } from '../IconButton';
import { moveItem } from './moveItem';
import type { ReorderableListProps } from './types';

/** Browser drag and drop with keyboard controls on every handle. */
export function ReorderableList<T>(props: ReorderableListProps<T>) {
  const { data, keyExtractor, renderItem, getItemLabel, onReorder, disabled = false, scrollEnabled: _scrollEnabled, style, testID, ...rest } = props;
  const theme = useTheme();
  const { styleProps, otherProps } = extractStyleProps(rest);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const touchDrag = useRef<{ key: string; pointerId: number } | null>(null);
  const keyAtPoint = (x: number, y: number) =>
    document.elementFromPoint(x, y)?.closest('[data-reorder-key]')?.getAttribute('data-reorder-key') ?? null;
  const resetDrag = () => { touchDrag.current = null; setDraggedKey(null); setOverKey(null); };
  const move = (from: number, to: number) => {
    if (disabled) return;
    const result = moveItem(data, from, to);
    if (result) onReorder(result);
  };

  return (
    <View {...otherProps} testID={testID} role="list" style={[resolveStyleProps(styleProps, theme), style]}>
      {data.map((item, index) => {
        const key = keyExtractor(item, index);
        const label = getItemLabel?.(item, index) ?? `item ${index + 1}`;
        return (
          <div
            key={key}
            role="listitem"
            data-reorder-key={key}
            draggable={!disabled}
            onDragStart={(event) => {
              if (disabled) return;
              setDraggedKey(key);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', key);
            }}
            onDragOver={(event) => {
              if (disabled || draggedKey === key) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setOverKey(key);
            }}
            onDragLeave={() => setOverKey((current) => current === key ? null : current)}
            onDrop={(event) => {
              event.preventDefault();
              const sourceKey = draggedKey ?? event.dataTransfer.getData('text/plain');
              const from = data.findIndex((entry, entryIndex) => keyExtractor(entry, entryIndex) === sourceKey);
              move(from, index);
              resetDrag();
            }}
            onDragEnd={resetDrag}
            style={{ borderTop: overKey === key ? `2px solid ${theme.backgrounds.border}` : undefined, borderBottom: `1px solid ${theme.backgrounds.border}`, opacity: draggedKey === key ? 0.55 : 1 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.backgrounds.surface }}>
              <div
                data-reorder-handle={key}
                style={{ touchAction: 'none' }}
                onPointerDown={(event) => {
                  if (disabled || event.pointerType === 'mouse') return;
                  touchDrag.current = { key, pointerId: event.pointerId };
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDraggedKey(key);
                }}
                onPointerMove={(event) => {
                  if (touchDrag.current?.pointerId !== event.pointerId) return;
                  setOverKey(keyAtPoint(event.clientX, event.clientY));
                }}
                onPointerUp={(event) => {
                  if (touchDrag.current?.pointerId !== event.pointerId) return;
                  const target = keyAtPoint(event.clientX, event.clientY);
                  const to = data.findIndex((entry, entryIndex) => keyExtractor(entry, entryIndex) === target);
                  move(index, to);
                  resetDrag();
                }}
                onPointerCancel={resetDrag}
              >
                <IconButton
                  icon="sort"
                  variant="ghost"
                  accessibilityLabel={`Reorder ${label}`}
                  accessibilityHint="Drag to reorder, or press Up or Down arrow"
                  disabled={disabled}
                  {...webProps({ onKeyDown: (event) => {
                    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                      event.preventDefault();
                      move(index, index + (event.key === 'ArrowDown' ? 1 : -1));
                    }
                  } })}
                />
              </div>
              <View style={{ flex: 1 }}>{renderItem({ item, index, isActive: draggedKey === key })}</View>
            </View>
          </div>
        );
      })}
    </View>
  );
}
