import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  a11yProps,
  type A11yOptions,
  type A11yProps,
  consumeEvent,
  readKey,
  type KeyboardEventLike,
  useRovingFocus,
  factory,
  createThemedStyles,
  isWeb,
  webProps,
  useTheme,
  onColor,
  resolveIconSize,
  resolveRadius,
  resolveSpacing,
  Icon,
  Text,
} from '@plocks/ui';
import type { PlocksTheme, SizeValue } from '@plocks/ui';
import { getCurrentPeriodStyles, getCurrentPeriodTextColor } from './currentPeriod';

/** One tile of a month / year grid. */
export interface PickerGridItem {
  key: number;
  /** Visible text. */
  label: string;
  /** Accessible name ("March 2026", "2031"). */
  accessibilityLabel: string;
  selected: boolean;
  /** The current month / year (ringed, `aria-current="date"`). */
  current: boolean;
  disabled: boolean;
}

export interface PickerGridProps {
  items: PickerGridItem[];
  columns: number;
  onSelect: (index: number) => void;
  /** Accessible name of the grid (web), e.g. the year of a month grid. */
  gridLabel: string;
  textSize: SizeValue;
  /** Width / height of a tile. */
  aspectRatio: number;
  /** Extra horizontal text inset inside a tile (long month names). */
  padText?: boolean;
  /** Width of the whole picker; omit to fill the container. */
  width?: number;
  hideHeader?: boolean;
  title: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const NO_PROPS: A11yProps = Object.freeze({}) as A11yProps;
const webA11y = (opts: A11yOptions): A11yProps => (isWeb ? a11yProps(opts) : NO_PROPS);
const px = (value: number | 'auto'): number => (typeof value === 'number' ? value : 0);

const getPickerStyles = createThemedStyles((theme: PlocksTheme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: px(resolveSpacing(theme, 'xl')),
    },
    navButton: { padding: px(resolveSpacing(theme, 'md')), borderRadius: resolveRadius(theme, 'sm') },
    pressed: { backgroundColor: theme.backgrounds.pressed },
    title: { color: theme.text.primary },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: px(resolveSpacing(theme, 'md')) },
    tile: {
      flex: 1,
      marginHorizontal: px(resolveSpacing(theme, 'xs')),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderRadius: resolveRadius(theme, 'md'),
    },
    filler: { flex: 1, marginHorizontal: px(resolveSpacing(theme, 'xs')) },
    selected: { backgroundColor: theme.colors.primary[5] },
    dimmed: { opacity: 0.5 },
    text: { color: theme.text.primary, textAlign: 'center' },
    textInset: { paddingHorizontal: px(resolveSpacing(theme, 'xs')) },
    textSelected: { color: theme.text.onPrimary ?? onColor(theme, theme.colors.primary[5]) },
    textDisabled: { color: theme.text.disabled },
  })
);

/**
 * The month / year grid shared by MonthPicker and YearPicker: optional
 * prev/next header, then tiles in rows. Web: `role="grid"` > `row` >
 * `gridcell` with `aria-selected` / `aria-current="date"` / `aria-disabled` and
 * a roving tab stop (arrow keys move by tile / row, Home/End to the row ends);
 * native: labelled buttons with selected / disabled state.
 * @internal
 */
export const PickerGrid = factory<{ props: PickerGridProps; ref: View }>(
  (props, ref) => {
    const {
      items,
      columns: requestedColumns,
      onSelect,
      gridLabel,
      textSize,
      aspectRatio,
      padText = false,
      width,
      hideHeader = false,
      title,
      previousLabel,
      nextLabel,
      onPrevious,
      onNext,
      style,
      testID,
    } = props;
    const theme = useTheme();
    const styles = getPickerStyles(theme);
    const columns = Math.max(1, Math.floor(requestedColumns));
    const rows = Math.ceil(items.length / columns);
    const iconSize = resolveIconSize(theme, 'md');
    const tileShape = useMemo(() => ({ aspectRatio }), [aspectRatio]);
    const rootStyle = useMemo(() => (width === undefined ? null : { width, maxWidth: '100%' as const }), [width]);

    // Tab stop: the last focused tile, else the selected one, else the current one.
    const [focusedKey, setFocusedKey] = useState<number | null>(null);
    const focusedIndex = focusedKey === null ? -1 : items.findIndex((item) => item.key === focusedKey);
    const selectedIndex = items.findIndex((item) => item.selected && !item.disabled);
    const currentIndex = items.findIndex((item) => item.current && !item.disabled);
    // -1 falls back to the first enabled tile.
    const preferredIndex = focusedIndex >= 0 ? focusedIndex : selectedIndex >= 0 ? selectedIndex : currentIndex;

    const roving = useRovingFocus({
      count: items.length,
      orientation: 'both',
      columns,
      loop: false,
      activeIndex: preferredIndex,
      onActiveChange: (index) => setFocusedKey(items[index]?.key ?? null),
      isDisabled: (index) => !!items[index]?.disabled,
    });

    const handleKeyDown = (event: KeyboardEventLike, index: number) => {
      const { key } = readKey(event);
      // Pressable activates a gridcell on Enter only; grids also select on Space.
      if (key === ' ' || key === 'Spacebar') {
        consumeEvent(event);
        if (!items[index]?.disabled) onSelect(index);
        return;
      }
      roving.handleKeyDown(event, index);
    };

    return (
      <View ref={ref} style={[rootStyle, style]} testID={testID}>
        {!hideHeader && (
          <View style={styles.header}>
            <Pressable
              onPress={onPrevious}
              {...a11yProps({ role: 'button', label: previousLabel })}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-left" size={iconSize} color={theme.text.secondary} />
            </Pressable>

            <Text size="xl" fw="bold" style={styles.title} {...a11yProps({ live: 'polite' })}>
              {title}
            </Text>

            <Pressable
              onPress={onNext}
              {...a11yProps({ role: 'button', label: nextLabel })}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <Icon name="chevron-right" size={iconSize} color={theme.text.secondary} />
            </Pressable>
          </View>
        )}

        <View {...webA11y({ role: 'grid', label: gridLabel })}>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.row} {...webA11y({ role: 'row' })}>
              {Array.from({ length: columns }, (_, colIndex) => {
                const index = rowIndex * columns + colIndex;
                const item = items[index];

                if (!item) {
                  return <View key={`filler-${colIndex}`} style={styles.filler} />;
                }

                const { selected, disabled } = item;
                const currentPeriod = { isCurrent: item.current && !disabled, isSelected: selected };
                const currentColor = getCurrentPeriodTextColor(theme, currentPeriod);
                const itemProps = roving.getItemProps(index);

                return (
                  <Pressable
                    key={item.key}
                    ref={itemProps.ref}
                    onPress={() => onSelect(index)}
                    onFocus={itemProps.onFocus}
                    disabled={disabled}
                    {...a11yProps({
                      role: isWeb ? 'gridcell' : 'button',
                      label: item.accessibilityLabel,
                      selected,
                      current: currentPeriod.isCurrent ? 'date' : undefined,
                      disabled,
                    })}
                    {...webProps({ tabIndex: itemProps.tabIndex, onKeyDown: (event) => handleKeyDown(event, index) })}
                    style={({ pressed }) => [
                      styles.tile,
                      tileShape,
                      selected ? styles.selected : pressed && !disabled ? styles.pressed : null,
                      getCurrentPeriodStyles(theme, currentPeriod),
                      disabled ? styles.dimmed : null,
                    ]}
                  >
                    <Text
                      size={textSize}
                      fw={selected || currentPeriod.isCurrent ? 'semibold' : 'medium'}
                      style={[
                        styles.text,
                        padText ? styles.textInset : null,
                        selected
                          ? styles.textSelected
                          : disabled
                            ? styles.textDisabled
                            : currentColor
                              ? { color: currentColor }
                              : null,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  },
  { displayName: 'PickerGrid', memo: false }
);
