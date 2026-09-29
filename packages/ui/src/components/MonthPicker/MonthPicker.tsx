import React, { useCallback, useMemo } from 'react';
import type { View } from 'react-native';

import { factory } from '../../core/factory';
import { resolveResponsiveValue, useBreakpoint } from '../../core/responsive';
import type { ResponsiveProp } from '../../core/theme/breakpoints';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { PickerGrid, type PickerGridItem } from '../Calendar/PickerGrid';
import { dateUtils, formatMonthYear, getDateFormatter, getMonthGridWidth, stepUpSize } from '../Calendar/utils';
import type { MonthPickerProps } from './types';

const DEFAULT_GRID: ResponsiveProp<number> = { base: 3 };

export const MonthPicker = factory<{ props: MonthPickerProps; ref: View }>((props, ref) => {
  const {
    value,
    onChange,
    year: controlledYear,
    onYearChange,
    minDate,
    maxDate,
    locale = 'en-US',
    size = 'md',
    monthLabelFormat = 'long',
    hideHeader = false,
    monthsPerRow,
    fullWidth = false,
    style,
    testID,
  } = props;
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const spacingStyles = useStyleProps(props);

  const [currentYear, setCurrentYear] = useControllableState<number>({
    value: controlledYear,
    defaultValue: () => value?.getFullYear() ?? new Date().getFullYear(),
    onChange: onYearChange,
  });

  const monthNames = useMemo(() => {
    const format = monthLabelFormat === 'short' ? 'short' : 'long';
    const formatter = getDateFormatter(locale, { month: format }, `month-${format}`);
    return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)));
  }, [locale, monthLabelFormat]);

  const resolvedMonthsPerRow = Math.max(
    1,
    Math.floor(resolveResponsiveValue(monthsPerRow ?? DEFAULT_GRID, breakpoint) ?? 3)
  );

  const handleMonthPress = useCallback(
    (monthIndex: number) => {
      const newDate = new Date(currentYear, monthIndex, 1);

      if (minDate && newDate < dateUtils.startOfMonth(minDate)) return;
      if (maxDate && newDate > dateUtils.endOfMonth(maxDate)) return;

      onChange?.(newDate);
    },
    [currentYear, onChange, minDate, maxDate]
  );

  const isMonthDisabled = (monthIndex: number): boolean => {
    const monthDate = new Date(currentYear, monthIndex, 1);
    if (minDate && dateUtils.endOfMonth(monthDate) < dateUtils.startOfMonth(minDate)) return true;
    if (maxDate && dateUtils.startOfMonth(monthDate) > dateUtils.endOfMonth(maxDate)) return true;
    return false;
  };

  // Mark the month we're actually in, so the grid shows where "now" sits.
  const now = new Date();
  const items: PickerGridItem[] = monthNames.map((monthName, monthIndex) => ({
    key: monthIndex,
    label: monthLabelFormat === 'short' && monthName.length > 3 ? monthName.substring(0, 3) : monthName,
    accessibilityLabel: formatMonthYear(new Date(currentYear, monthIndex, 1), locale),
    selected: !!value && value.getFullYear() === currentYear && value.getMonth() === monthIndex,
    current: now.getFullYear() === currentYear && now.getMonth() === monthIndex,
    disabled: isMonthDisabled(monthIndex),
  }));

  // Month tiles are flex-sized, so an unconstrained picker balloons to fill its
  // container. Default to the same natural width as a calendar's day grid.
  const pickerWidth = fullWidth ? undefined : getMonthGridWidth(theme, size);

  return (
    <PickerGrid
      ref={ref}
      items={items}
      columns={resolvedMonthsPerRow}
      onSelect={handleMonthPress}
      gridLabel={String(currentYear)}
      textSize={stepUpSize(size)}
      aspectRatio={1.6}
      padText
      width={pickerWidth}
      hideHeader={hideHeader}
      title={String(currentYear)}
      previousLabel="Previous year"
      nextLabel="Next year"
      onPrevious={() => setCurrentYear(currentYear - 1)}
      onNext={() => setCurrentYear(currentYear + 1)}
      style={[spacingStyles, style]}
      testID={testID}
    />
  );
}, { displayName: 'MonthPicker' });
