import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  View,
} from 'react-native';

import { useTheme } from '../../core/theme';
import { useHaptics } from '../../hooks/useHaptics';
import { Text } from '../Text';
import type { WheelItem, WheelProps, WheelValue } from './types';

const clampIndex = (index: number, length: number) =>
  Math.max(0, Math.min(index, Math.max(0, length - 1)));

const WheelInner = <T extends WheelValue>(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    onChangeComplete,
    label,
    width = 88,
    height = 200,
    itemHeight = 40,
    disabled = false,
    haptics = true,
    style,
    ...viewProps
  }: WheelProps<T>,
  ref: React.ForwardedRef<View>
) => {
  const theme = useTheme();
  const { selection } = useHaptics({ disabled: disabled || !haptics });
  const listRef = useRef<FlatList<WheelItem<T>>>(null);
  const hasPositionedRef = useRef(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [internalValue, setInternalValue] = useState<T | undefined>(() =>
    defaultValue ?? items[0]?.value
  );
  const selectedValue = value !== undefined ? value : internalValue;
  const selectedIndex = Math.max(0, items.findIndex((item) => item.value === selectedValue));
  const scrollOffsetRef = useRef(selectedIndex * itemHeight);
  const currentIndexRef = useRef(selectedIndex);
  const completedIndexRef = useRef<number | null>(null);
  const [visualIndex, setVisualIndex] = useState(selectedIndex);
  const verticalPadding = Math.max(0, (height - itemHeight) / 2);

  const clearCompletionTimer = useCallback(() => {
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearCompletionTimer, [clearCompletionTimer]);

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
      const nextValue = items[index].value;
      currentIndexRef.current = index;
      completedIndexRef.current = null;
      setVisualIndex(index);
      if (value === undefined) setInternalValue(nextValue);
      onValueChange?.(nextValue);
      selection();
      return true;
    },
    [disabled, items, onValueChange, selection, value]
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

  const adjust = useCallback(
    (delta: number) => {
      const nextIndex = clampIndex(currentIndexRef.current + delta, items.length);
      if (!selectIndex(nextIndex)) return;
      scrollOffsetRef.current = nextIndex * itemHeight;
      listRef.current?.scrollToOffset({ offset: nextIndex * itemHeight, animated: true });
      completedIndexRef.current = nextIndex;
      if (items[nextIndex]) onChangeComplete?.(items[nextIndex].value);
    },
    [itemHeight, items, onChangeComplete, selectIndex]
  );

  return (
    <View
      {...viewProps}
      ref={ref}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      accessibilityValue={{ text: String(items[visualIndex]?.label ?? items[visualIndex]?.value ?? '') }}
      accessibilityActions={[
        { name: 'increment', label: `Increase ${label}` },
        { name: 'decrement', label: `Decrease ${label}` },
      ]}
      onAccessibilityAction={(event) => adjust(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
      style={[
        {
          width,
          height,
          overflow: 'hidden',
          borderRadius: 8,
          backgroundColor: theme.colors.gray[1],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: verticalPadding,
          left: 4,
          right: 4,
          height: itemHeight,
          borderRadius: 6,
          backgroundColor: theme.colors.primary[1],
          borderWidth: 1,
          borderColor: theme.colors.primary[3],
        }}
      />
      <FlatList
        ref={listRef}
        data={items as WheelItem<T>[]}
        keyExtractor={(item, index) => `${String(item.value)}-${index}`}
        renderItem={({ item, index }) => {
          const active = index === visualIndex;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled }}
              disabled={disabled}
              onPress={() => handlePress(index)}
              style={({ pressed }) => ({
                height: itemHeight,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: active ? 1 : pressed ? 0.8 : 0.5,
                ...(Platform.OS === 'web' ? ({ scrollSnapAlign: 'center' } as any) : {}),
              })}
            >
              {typeof item.label === 'string' || typeof item.label === 'number' || item.label == null ? (
                <Text
                  size="md"
                  weight={active ? 'semibold' : 'medium'}
                  style={{ color: active ? theme.colors.primary[7] : theme.colors.gray[7] }}
                >
                  {item.label ?? String(item.value)}
                </Text>
              ) : item.label}
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
        style={Platform.OS === 'web' ? ({ scrollSnapType: 'y mandatory' } as any) : undefined}
      />
    </View>
  );
};

const ForwardedWheel = React.forwardRef(WheelInner);
ForwardedWheel.displayName = 'Wheel';

export const Wheel = ForwardedWheel as <T extends WheelValue>(
  props: WheelProps<T> & React.RefAttributes<View>
) => React.ReactElement;