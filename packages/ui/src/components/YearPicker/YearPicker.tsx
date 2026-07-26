import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { Text } from '../Text';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { getCurrentPeriodStyles, getCurrentPeriodTextColor } from '../Calendar/currentPeriod';
import { getMonthGridWidth } from '../Calendar/utils';
import { useTheme } from '../../core/theme';
import { DESIGN_TOKENS } from '../../core';
import { resolveResponsiveProp, type ResponsiveProp } from '../../core/theme/breakpoints';
import type { YearPickerProps } from './types';
import { useControllableState } from '../../hooks/useControllableState';

const DEFAULT_YEARS_PER_ROW: ResponsiveProp<number> = { base: 3, md: 4 };

export const YearPicker = React.forwardRef<View, YearPickerProps>(({
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
}, ref) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [currentDecade, setCurrentDecade] = useControllableState<number>({
    value: controlledDecade,
    defaultValue: () => {
      const year = value?.getFullYear() ?? new Date().getFullYear();
      return Math.floor(year / 10) * 10;
    },
    onChange: onDecadeChange,
  });

  const resolvedYearsPerRow = useMemo(() => {
    const fallback = size === 'xs' || size === 'sm' ? 3 : 4;
    const resolved = resolveResponsiveProp<number>(yearsPerRow ?? DEFAULT_YEARS_PER_ROW, width);
    const candidate = resolved ?? (width < 640 ? 3 : fallback);
    return Math.max(1, Math.floor(candidate));
  }, [yearsPerRow, size, width]);

  const years = useMemo(() => {
    const startYear = currentDecade;
    const rowCount = Math.ceil(totalYears / resolvedYearsPerRow);
    const count = rowCount * resolvedYearsPerRow;
    return Array.from({ length: count }, (_, i) => startYear + i);
  }, [currentDecade, totalYears, resolvedYearsPerRow]);

  const handleDecadeChange = useCallback(
    (newDecade: number) => setCurrentDecade(newDecade),
    [setCurrentDecade]
  );

  const handlePreviousDecade = () => {
    handleDecadeChange(currentDecade - 10);
  };

  const handleNextDecade = () => {
    handleDecadeChange(currentDecade + 10);
  };

  const handleYearPress = useCallback(
    (year: number) => {
      if (minDate && year < minDate.getFullYear()) return;
      if (maxDate && year > maxDate.getFullYear()) return;

      const newDate = new Date(
        year,
        value?.getMonth() ?? 0,
        value?.getDate() ?? 1
      );
      onChange?.(newDate);
    },
    [onChange, minDate, maxDate, value]
  );

  const isYearDisabled = useCallback(
    (year: number): boolean => {
      if (minDate && year < minDate.getFullYear()) return true;
      if (maxDate && year > maxDate.getFullYear()) return true;
      return false;
    },
    [minDate, maxDate]
  );

  const isYearSelected = useCallback(
    (year: number): boolean => {
      if (!value) return false;
      return value.getFullYear() === year;
    },
    [value]
  );

  const rows = Math.ceil(years.length / resolvedYearsPerRow);

  // Year tiles are flex-sized, so an unconstrained picker balloons to fill its
  // container. Default to the same natural width as a calendar's day grid.
  const pickerWidth = fullWidth ? undefined : getMonthGridWidth(size);

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
            onPress={handlePreviousDecade}
            accessibilityRole="button"
            accessibilityLabel="Previous decade"
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
            {currentDecade}s
          </Text>

          <Pressable
            onPress={handleNextDecade}
            accessibilityRole="button"
            accessibilityLabel="Next decade"
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
            {Array.from({ length: resolvedYearsPerRow }, (_, colIndex) => {
              const yearIndex = rowIndex * resolvedYearsPerRow + colIndex;

              if (yearIndex >= years.length) {
                return <View key={colIndex} style={{ flex: 1, marginHorizontal: DESIGN_TOKENS.spacing.xs }} />;
              }

              const year = years[yearIndex];
              const disabled = isYearDisabled(year);
              const isSelected = isYearSelected(year);
              // Mark the year we're actually in, so the grid shows where "now" sits.
              const currentPeriod = {
                isCurrent: year === new Date().getFullYear() && !disabled,
                isSelected,
              };

              return (
                <Pressable
                  key={year}
                  onPress={() => handleYearPress(year)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={String(year)}
                  accessibilityState={{ disabled, selected: isSelected }}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      marginHorizontal: DESIGN_TOKENS.spacing.xs,
                      aspectRatio: 1.4,
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
                    size={size === 'xs' ? 'sm' : size === 'sm' ? 'md' : 'lg'}
                    weight={isSelected || currentPeriod.isCurrent ? 'semibold' : 'medium'}
                    style={{
                      color: isSelected
                        ? 'white'
                        : disabled
                        ? theme.colors.gray[4]
                        : getCurrentPeriodTextColor(theme, currentPeriod) ?? theme.colors.gray[9],
                      textAlign: 'center',
                    }}
                  >
                    {year}
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

YearPicker.displayName = 'YearPicker';
