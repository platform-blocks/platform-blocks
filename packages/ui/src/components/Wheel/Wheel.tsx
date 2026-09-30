import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';

import { getNodeText } from '../../core/accessibility/useA11yId';
import { useAdjustable } from '../../core/accessibility/useAdjustable';
import { factory } from '../../core/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { isWeb, webProps } from '../../core/platform';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { useHaptics } from '../../hooks/useHaptics';
import { Text } from '../Text';
import type { WheelItem, WheelProps, WheelValue } from './types';

const clampIndex = (index: number, length: number) => Math.max(0, Math.min(index, Math.max(0, length - 1)));

/** Web-only CSS scroll snapping (not modelled by RN's style types). */
const WEB_SNAP_LIST = isWeb ? ({ scrollSnapType: 'y mandatory' } as unknown as ViewStyle) : undefined;
const WEB_SNAP_ITEM = isWeb ? ({ scrollSnapAlign: 'center' } as unknown as ViewStyle) : undefined;

const itemText = <T extends WheelValue>(item: WheelItem<T> | undefined) =>
  item ? getNodeText(item.label) || String(item.value) : '';

/**
 * A spinning picker column (hours, minutes, AM/PM…).
 *
 * Semantics: one `role="slider"` (native: adjustable, the role iOS gives a
 * picker wheel) whose value text is the centered item's label — not a
 * listbox. A wheel always has exactly one value, moved by nudging it; that is
 * the adjustable pattern (increment / decrement actions for VoiceOver and
 * TalkBack, arrows / PageUp / PageDown / Home / End on the web), and it keeps
 * the whole column a single tab stop. Up / increment moves to the next item —
 * the same direction a drag-up spins the wheel.
 */
function WheelInner<T extends WheelValue>(props: WheelProps<T>, ref: React.ForwardedRef<View>) {
  const {
    items,
    value,
    defaultValue,
    onChange,
    onChangeComplete,
    label,
    h = 200,
    itemHeight = 40,
    disabled = false,
    haptics = true,
    style,
    ...rest
  } = props;
  const { otherProps: viewProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(props);

  const { selection } = useHaptics({ disabled: disabled || !haptics });
  const listRef = useRef<FlatList<WheelItem<T>>>(null);
  const hasPositionedRef = useRef(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedValue, setSelectedValue] = useControllableState<T | undefined>({
    value,
    defaultValue: defaultValue ?? items[0]?.value,
    onChange: (next) => {
      if (next === undefined) return;
      onChange?.(next);
    },
  });
  const selectedIndex = Math.max(0, items.findIndex((item) => item.value === selectedValue));
  const scrollOffsetRef = useRef(selectedIndex * itemHeight);
  const currentIndexRef = useRef(selectedIndex);
  const completedIndexRef = useRef<number | null>(null);
  const [visualIndex, setVisualIndex] = useState(selectedIndex);
  const verticalPadding = Math.max(0, (h - itemHeight) / 2);

  const clearCompletionTimer = useCallback(() => {
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearCompletionTimer, [clearCompletionTimer]);

  // A controlled value that moves from outside scrolls the column to it.
  useEffect(() => {
    const nextIndex = items.findIndex((item) => item.value === selectedValue);
    if (nextIndex < 0 || nextIndex === currentIndexRef.current) return;
    currentIndexRef.current = nextIndex;
    setVisualIndex(nextIndex);
    scrollOffsetRef.current = nextIndex * itemHeight;
    listRef.current?.scrollToOffset({ offset: nextIndex * itemHeight, animated: false });
  }, [itemHeight, items, selectedValue]);

  const selectIndex = useCallback(
    (rawIndex: number) => {
      if (disabled || items.length === 0) return false;
      const index = clampIndex(rawIndex, items.length);
      if (index === currentIndexRef.current) return false;
      currentIndexRef.current = index;
      completedIndexRef.current = null;
      setVisualIndex(index);
      setSelectedValue(items[index].value);
      selection();
      return true;
    },
    [disabled, items, setSelectedValue, selection]
  );

  const completeSelection = useCallback(() => {
    const index = currentIndexRef.current;
    if (completedIndexRef.current === index || !items[index]) return;
    completedIndexRef.current = index;
    onChangeComplete?.(items[index].value);
  }, [items, onChangeComplete]);

  const settleSelection = useCallback(() => {
    const targetOffset = currentIndexRef.current * itemHeight;
    if (Math.abs(scrollOffsetRef.current - targetOffset) > 0.5) {
      listRef.current?.scrollToOffset({ offset: targetOffset, animated: true });
    }
    completeSelection();
  }, [completeSelection, itemHeight]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.y;
      scrollOffsetRef.current = offset;
      selectIndex(Math.round(offset / itemHeight));
      clearCompletionTimer();
      completionTimerRef.current = setTimeout(settleSelection, 100);
    },
    [clearCompletionTimer, itemHeight, selectIndex, settleSelection]
  );

  const handlePress = useCallback(
    (index: number) => {
      selectIndex(index);
      completedIndexRef.current = index;
      onChangeComplete?.(items[index].value);
      scrollOffsetRef.current = index * itemHeight;
      listRef.current?.scrollToOffset({ offset: index * itemHeight, animated: true });
    },
    [itemHeight, items, onChangeComplete, selectIndex]
  );

  /** Keyboard / assistive move: select, scroll there, and settle at once. */
  const moveTo = useCallback(
    (index: number) => {
      const nextIndex = clampIndex(index, items.length);
      if (!selectIndex(nextIndex)) return;
      scrollOffsetRef.current = nextIndex * itemHeight;
      listRef.current?.scrollToOffset({ offset: nextIndex * itemHeight, animated: true });
      completedIndexRef.current = nextIndex;
      if (items[nextIndex]) onChangeComplete?.(items[nextIndex].value);
    },
    [itemHeight, items, onChangeComplete, selectIndex]
  );

  const { adjustableProps } = useAdjustable({
    value: visualIndex,
    min: 0,
    max: Math.max(0, items.length - 1),
    step: 1,
    largeStep: 5,
    onChange: moveTo,
    label,
    valueText: (index) => itemText(items[index]),
    orientation: 'vertical',
    disabled,
  });

  const styles = useThemedStyles(
    (theme) => ({
      root: {
        width: 88,
        height: h,
        overflow: 'hidden',
        borderRadius: 8,
        backgroundColor: theme.backgrounds.subtle,
        opacity: disabled ? 0.5 : 1,
      } as ViewStyle,
      highlight: {
        position: 'absolute',
        top: verticalPadding,
        start: 4,
        end: 4,
        height: itemHeight,
        borderRadius: 6,
        backgroundColor: theme.backgrounds.selected,
        borderWidth: 1,
        borderColor: theme.backgrounds.border,
        pointerEvents: 'none',
      } as ViewStyle,
      item: { height: itemHeight, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
      activeText: { color: theme.text.primary },
      idleText: { color: theme.text.secondary },
    }),
    [h, disabled, verticalPadding, itemHeight]
  );

  return (
    <View
      {...viewProps}
      ref={ref}
      accessible
      {...adjustableProps}
      style={[styles.root, spacingStyles, style]}
    >
      <View style={styles.highlight} />
      <FlatList
        ref={listRef}
        data={items as WheelItem<T>[]}
        keyExtractor={(item, index) => `${String(item.value)}-${index}`}
        renderItem={({ item, index }) => {
          const active = index === visualIndex;
          return (
            <Pressable
              // The column is the control: items are pointer targets only, not
              // separate tab stops. (A slider's children are presentational for
              // assistive tech, and natively the accessible column groups them.)
              {...webProps({ tabIndex: -1 })}
              disabled={disabled}
              onPress={() => handlePress(index)}
              style={({ pressed }) => [styles.item, { opacity: active ? 1 : pressed ? 0.8 : 0.5 }, WEB_SNAP_ITEM]}
            >
              {typeof item.label === 'string' || typeof item.label === 'number' || item.label == null ? (
                <Text size="md" fw={active ? 'semibold' : 'medium'} style={active ? styles.activeText : styles.idleText}>
                  {item.label ?? String(item.value)}
                </Text>
              ) : (
                item.label
              )}
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingVertical: verticalPadding }}
        decelerationRate="fast"
        disableIntervalMomentum={false}
        getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
        initialNumToRender={items.length <= 12 ? items.length : undefined}
        onContentSizeChange={() => {
          if (hasPositionedRef.current) return;
          hasPositionedRef.current = true;
          const targetOffset = selectedIndex * itemHeight;
          scrollOffsetRef.current = targetOffset;
          listRef.current?.scrollToOffset({ offset: targetOffset, animated: false });
        }}
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          clearCompletionTimer();
          completedIndexRef.current = null;
        }}
        onMomentumScrollBegin={clearCompletionTimer}
        onMomentumScrollEnd={(event) => {
          clearCompletionTimer();
          const offset = event.nativeEvent.contentOffset.y;
          scrollOffsetRef.current = offset;
          selectIndex(Math.round(offset / itemHeight));
          settleSelection();
        }}
        onScrollEndDrag={() => {
          clearCompletionTimer();
          completionTimerRef.current = setTimeout(() => {
            settleSelection();
          }, 100);
        }}
        scrollEnabled={!disabled && items.length > 1}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={itemHeight}
        style={WEB_SNAP_LIST}
      />
    </View>
  );
}

const WheelBase = factory<{ props: WheelProps<WheelValue>; ref: View }>(WheelInner, { displayName: 'Wheel' });
WheelBase.displayName = 'Wheel';

/** Generic call signature: `<Wheel<number> …>` keeps `value` / `onChange` typed to the items. */
export const Wheel = WheelBase as unknown as (<T extends WheelValue>(
  props: WheelProps<T> & React.RefAttributes<View>
) => React.ReactElement) & { displayName?: string };
