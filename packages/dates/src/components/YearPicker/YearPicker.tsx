import React, { useCallback } from 'react';
import type { View } from 'react-native';

import {
  factory,
  resolveResponsiveValue,
  useBreakpoint,
  useTheme,
  useStyleProps,
  useControllableState,
} from '@plocks/ui';
import type { ResponsiveProp, SizeValue } from '@plocks/ui';
import { PickerGrid, type PickerGridItem } from '../Calendar/PickerGrid';
import { getMonthGridWidth } from '../Calendar/utils';
import type { YearPickerProps } from './types';

const DEFAULT_YEARS_PER_ROW: ResponsiveProp<number> = { base: 3, md: 4 };

const yearTextSize = (size: SizeValue): SizeValue => (size === 'xs' ? 'sm' : size === 'sm' ? 'md' : 'lg');

export const YearPicker = factory<{ props: YearPickerProps; ref: View }>((props, ref) => {
  const {
    value,
    onChange,
    decade: controlledDecade,
    onDecadeChange,
    minDate,
    maxDate,
    size = 'md',
    yearsPerRow,
    hideHeader = false,
    totalYears = 20,
    fullWidth = false,
    style,
    testID,
  } = props;
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const spacingStyles = useStyleProps(props);

  const [currentDecade, setCurrentDecade] = useControllableState<number>({
    value: controlledDecade,
    defaultValue: () => {
      const year = value?.getFullYear() ?? new Date().getFullYear();
      return Math.floor(year / 10) * 10;
    },
    onChange: onDecadeChange,
  });

  const resolvedYearsPerRow = Math.max(
    1,
    Math.floor(resolveResponsiveValue(yearsPerRow ?? DEFAULT_YEARS_PER_ROW, breakpoint) ?? 3)
  );

  const handleYearPress = useCallback(
    (year: number) => {
      if (minDate && year < minDate.getFullYear()) return;
      if (maxDate && year > maxDate.getFullYear()) return;

      const newDate = new Date(year, value?.getMonth() ?? 0, value?.getDate() ?? 1);
      onChange?.(newDate);
    },
    [onChange, minDate, maxDate, value]
  );

  // Whole rows: the year count rounds up to a multiple of the row length.
  const count = Math.ceil(Math.max(1, totalYears) / resolvedYearsPerRow) * resolvedYearsPerRow;
  // Mark the year we're actually in, so the grid shows where "now" sits.
  const thisYear = new Date().getFullYear();
  const items: PickerGridItem[] = Array.from({ length: count }, (_, i) => {
    const year = currentDecade + i;
    return {
      key: year,
      label: String(year),
      accessibilityLabel: String(year),
      selected: !!value && value.getFullYear() === year,
      current: year === thisYear,
      disabled: (!!minDate && year < minDate.getFullYear()) || (!!maxDate && year > maxDate.getFullYear()),
    };
  });

  // Year tiles are flex-sized, so an unconstrained picker balloons to fill its
  // container. Default to the same natural width as a calendar's day grid.
  const pickerWidth = fullWidth ? undefined : getMonthGridWidth(theme, size);
  const lastYear = currentDecade + count - 1;

  return (
    <PickerGrid
      ref={ref}
      items={items}
      columns={resolvedYearsPerRow}
      onSelect={(index) => handleYearPress(currentDecade + index)}
      gridLabel={`${currentDecade} – ${lastYear}`}
      textSize={yearTextSize(size)}
      aspectRatio={1.4}
      width={pickerWidth}
      hideHeader={hideHeader}
      title={`${currentDecade}s`}
      previousLabel="Previous decade"
      nextLabel="Next decade"
      onPrevious={() => setCurrentDecade(currentDecade - 10)}
      onNext={() => setCurrentDecade(currentDecade + 10)}
      style={[spacingStyles, style]}
      testID={testID}
    />
  );
}, { displayName: 'YearPicker' });
