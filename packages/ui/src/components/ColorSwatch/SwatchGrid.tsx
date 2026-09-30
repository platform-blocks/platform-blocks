import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { isSameColor } from '../ColorInput/utils';
import { ColorSwatch } from './ColorSwatch';

/** @internal */
export interface SwatchGridProps {
  swatches: readonly string[];
  /** The selected color (compared after hex normalization). */
  value: string;
  onSelect: (color: string) => void;
  swatchSize: number;
  swatchRadius: number;
  gap: number;
  /**
   * Fixed number of swatches per row: the grid is sized to exactly that many.
   * Without it the grid wraps to its container and measures its columns.
   */
  columns?: number;
  /** Readable names for swatches, keyed by color (falls back to the color string). */
  labels?: Readonly<Record<string, string>>;
  /** Name of the radio group. @default 'Color swatches' */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Swatch `i` gets `${testID}-${i}`. */
  testID?: string;
}

/**
 * @internal The swatch palette of ColorInput / ColorPicker: a labelled
 * `radiogroup` of `radio` swatches with one tab stop and 2-D arrow-key
 * navigation (web). Arrows move focus only; Enter / Space / press selects, so
 * browsing the palette doesn't fire `onChange` or close the dropdown.
 */
export function SwatchGrid({
  swatches,
  value,
  onSelect,
  swatchSize,
  swatchRadius,
  gap,
  columns,
  labels,
  accessibilityLabel = 'Color swatches',
  style,
  testID,
}: SwatchGridProps) {
  const selectedIndex = useMemo(() => swatches.findIndex((swatch) => isSameColor(swatch, value)), [swatches, value]);

  // Wrapping grids report how many swatches fit a row, for Up / Down.
  const [measuredColumns, setMeasuredColumns] = useState<number | null>(null);
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width <= 0) return;
      const perRow = Math.max(1, Math.floor((width + gap) / (swatchSize + gap)));
      setMeasuredColumns((previous) => (previous === perRow ? previous : perRow));
    },
    [gap, swatchSize]
  );
  const rowLength = columns ?? measuredColumns ?? swatches.length;

  // The tab stop starts on the selected swatch and then follows focus.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const roving = useRovingFocus({
    count: swatches.length,
    orientation: 'both',
    columns: Math.max(1, rowLength),
    activeIndex: focusIndex ?? Math.max(0, selectedIndex),
    onActiveChange: setFocusIndex,
  });

  const gridStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap,
      ...(columns ? { width: columns * swatchSize + (columns - 1) * gap } : null),
    }),
    [gap, columns, swatchSize]
  );

  return (
    <View
      {...a11yProps({ role: 'radiogroup', label: accessibilityLabel })}
      onLayout={columns ? undefined : handleLayout}
      style={[gridStyle, style]}
      testID={testID}
    >
      {swatches.map((color, index) => {
        const item = roving.getItemProps(index);
        return (
          <ColorSwatch
            key={`${color}-${index}`}
            ref={item.ref}
            role="radio"
            color={color}
            size={swatchSize}
            borderRadius={swatchRadius}
            showBorder={false}
            selected={index === selectedIndex}
            accessibilityLabel={labels?.[color] ?? color}
            onPress={() => onSelect(color)}
            onFocus={item.onFocus}
            onKeyDown={item.onKeyDown}
            tabIndex={item.tabIndex}
            testID={testID ? `${testID}-${index}` : undefined}
          />
        );
      })}
    </View>
  );
}
