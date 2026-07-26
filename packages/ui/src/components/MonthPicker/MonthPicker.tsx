import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { Text } from '../Text';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { dateUtils, getMonthGridWidth } from '../Calendar/utils';
import { getCurrentPeriodStyles, getCurrentPeriodTextColor } from '../Calendar/currentPeriod';
import { useTheme } from '../../core/theme';
import { DESIGN_TOKENS } from '../../core';
import { resolveResponsiveProp, type ResponsiveProp } from '../../core/theme/breakpoints';
import { clampComponentSize, resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import type { MonthPickerProps } from './types';
import { useControllableState } from '../../hooks/useControllableState';

const DEFAULT_GRID: ResponsiveProp<number> = { 
  base: 3 //, md: 4
 };

type MonthPickerSizeConfig = {
  textSize: ComponentSizeValue;
  columns: number;
};

const MONTH_PICKER_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const MONTH_PICKER_SIZE_SCALE: Record<ComponentSize, MonthPickerSizeConfig> = {
  xs: { textSize: 'sm', columns: 3 },
  sm: { textSize: 'md', columns: 3 },
  md: { textSize: 'lg', columns: 4 },
  lg: { textSize: 'xl', columns: 4 },
  xl: { textSize: '2xl', columns: 5 },
  '2xl': { textSize: '3xl', columns: 6 },
  '3xl': { textSize: 26, columns: 6 },
};

const resolveMonthPickerSize = (value: ComponentSizeValue): MonthPickerSizeConfig => {
  if (typeof value === 'number') {
    if (value <= 14) {
      return { textSize: value, columns: 3 };
    }
    if (value <= 18) {
      return { textSize: value, columns: 4 };
    }
    return { textSize: value, columns: 5 };
  }

  const resolved = resolveComponentSize(value, MONTH_PICKER_SIZE_SCALE, {
    allowedSizes: MONTH_PICKER_ALLOWED_SIZES,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return resolveMonthPickerSize(resolved);
  }

  return resolved;
};

export const MonthPicker = React.forwardRef<View, MonthPickerProps>(({
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
}, ref) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [currentYear, setCurrentYear] = useControllableState<number>({
    value: controlledYear,
    defaultValue: () => value?.getFullYear() ?? new Date().getFullYear(),
    onChange: onYearChange,
  });

  const monthNames = useMemo(() => {
    const format = monthLabelFormat === 'short' ? 'short' : 'long';
    const formatter = new Intl.DateTimeFormat(locale, { month: format });
    return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)));
  }, [locale, monthLabelFormat]);

  const clampedSize = clampComponentSize(size, MONTH_PICKER_ALLOWED_SIZES);
  const sizeConfig = resolveMonthPickerSize(clampedSize);

  const resolvedMonthsPerRow = useMemo(() => {
    const fallback = sizeConfig.columns;
    const resolved = resolveResponsiveProp<number>(monthsPerRow ?? DEFAULT_GRID, width);
    const candidate = resolved ?? (width < 640 ? 3 : fallback);
    return Math.max(1, Math.floor(candidate));
  }, [monthsPerRow, sizeConfig.columns, width]);

  const handleYearChange = useCallback(
    (newYear: number) => setCurrentYear(newYear),
    [setCurrentYear]
  );

  const handlePreviousYear = () => {
    handleYearChange(currentYear - 1);
  };

  const handleNextYear = () => {
    handleYearChange(currentYear + 1);
  };

  const handleMonthPress = useCallback(
    (monthIndex: number) => {
      const newDate = new Date(currentYear, monthIndex, 1);

      if (minDate && newDate < dateUtils.startOfMonth(minDate)) return;
      if (maxDate && newDate > dateUtils.endOfMonth(maxDate)) return;

      onChange?.(newDate);
    },
    [currentYear, onChange, minDate, maxDate]
  );

  const isMonthDisabled = useCallback(
    (monthIndex: number): boolean => {
      const monthDate = new Date(currentYear, monthIndex, 1);

      if (minDate && dateUtils.endOfMonth(monthDate) < dateUtils.startOfMonth(minDate)) {
        return true;
      }

      if (maxDate && dateUtils.startOfMonth(monthDate) > dateUtils.endOfMonth(maxDate)) {
        return true;
      }

      return false;
    },
    [currentYear, minDate, maxDate]
  );

  const isMonthSelected = useCallback(
    (monthIndex: number): boolean => {
      if (!value) return false;
      return value.getFullYear() === currentYear && value.getMonth() === monthIndex;
    },
    [value, currentYear]
  );

  // Mark the month we're actually in, so the grid shows where "now" sits.
  const isMonthCurrent = useCallback(
    (monthIndex: number): boolean => {
      const now = new Date();
      return now.getFullYear() === currentYear && now.getMonth() === monthIndex;
    },
    [currentYear]
  );

  const rows = Math.ceil(12 / resolvedMonthsPerRow);

  // Month tiles are flex-sized, so an unconstrained picker balloons to fill its
  // container. Default to the same natural width as a calendar's day grid.
  const pickerWidth = fullWidth ? undefined : getMonthGridWidth(clampedSize);

  return (
    <View ref={ref} style={pickerWidth === undefined ? undefined : { width: pickerWidth, maxWidth: '100%' }}>
      {!hideHeader && (
        <Flex
          direction="row"
          justify="space-between"
          align="center"
          style={{ marginBottom: DESIGN_TOKENS.spacing.xl }}
        >
          <Pressable
            onPress={handlePreviousYear}
            accessibilityRole="button"
            accessibilityLabel="Previous year"
            style={({ pressed }) => [
              {
                padding: DESIGN_TOKENS.spacing.md,
                borderRadius: DESIGN_TOKENS.radius.sm,
                backgroundColor: pressed ? theme.colors.gray[2] : 'transparent',
              },
            ]}
          >
            <Icon name="chevron-left" size={20} color={theme.colors.gray[6]} />
          </Pressable>

          <Text
            size="xl"
            weight="bold"
            style={{
              color: theme.colors.gray[9],
            }}
          >
            {currentYear}
          </Text>

          <Pressable
            onPress={handleNextYear}
            accessibilityRole="button"
            accessibilityLabel="Next year"
            style={({ pressed }) => [
              {
                padding: DESIGN_TOKENS.spacing.md,
                borderRadius: DESIGN_TOKENS.radius.sm,
                backgroundColor: pressed ? theme.colors.gray[2] : 'transparent',
              },
            ]}
          >
            <Icon name="chevron-right" size={20} color={theme.colors.gray[6]} />
          </Pressable>
        </Flex>
      )}

      <View>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <Flex
            key={rowIndex}
            direction="row"
            justify="space-between"
            style={{ marginBottom: DESIGN_TOKENS.spacing.md }}
          >
            {Array.from({ length: resolvedMonthsPerRow }, (_, colIndex) => {
              const monthIndex = rowIndex * resolvedMonthsPerRow + colIndex;

              if (monthIndex >= 12) {
                return <View key={colIndex} style={{ flex: 1, marginHorizontal: DESIGN_TOKENS.spacing.xs }} />;
              }

              const isSelected = isMonthSelected(monthIndex);
              const disabled = isMonthDisabled(monthIndex);
              const monthName = monthNames[monthIndex];
              const currentPeriod = { isCurrent: isMonthCurrent(monthIndex) && !disabled, isSelected };

              return (
                <Pressable
                  key={monthIndex}
                  onPress={() => handleMonthPress(monthIndex)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`${monthName} ${currentYear}`}
                  accessibilityState={{ disabled, selected: isSelected }}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      marginHorizontal: DESIGN_TOKENS.spacing.xs,
                      aspectRatio: 1.6,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? theme.colors.primary[5]
                        : pressed && !disabled
                        ? theme.colors.gray[2]
                        : 'transparent',
                      borderRadius: DESIGN_TOKENS.radius.md,
                      ...getCurrentPeriodStyles(theme, currentPeriod),
                      opacity: disabled ? 0.5 : 1,
                    },
                  ]}
                >
                  <Text
                    size={sizeConfig.textSize}
                    weight={isSelected || currentPeriod.isCurrent ? 'semibold' : 'medium'}
                    style={{
                      color: isSelected
                        ? 'white'
                        : disabled
                        ? theme.colors.gray[4]
                        : getCurrentPeriodTextColor(theme, currentPeriod) ?? theme.colors.gray[9],
                      textAlign: 'center',
                      paddingHorizontal: DESIGN_TOKENS.spacing.xs,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {monthLabelFormat === 'short' && monthName.length > 3
                      ? monthName.substring(0, 3)
                      : monthName}
                  </Text>
                </Pressable>
              );
            })}
          </Flex>
        ))}
      </View>
    </View>
  );
});

MonthPicker.displayName = 'MonthPicker';
