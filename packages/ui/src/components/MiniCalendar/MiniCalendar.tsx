import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '../Text';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { dateUtils } from '../Calendar/utils';
import { useControllableState } from '../../hooks/useControllableState';
import { getCurrentPeriodStyles } from '../Calendar/currentPeriod';
import { useTheme } from '../../core/theme';
import type { MiniCalendarProps } from '../Calendar/types';

export const MiniCalendar = React.forwardRef<View, MiniCalendarProps>(({
  value,
  onChange,
  defaultValue,
  numberOfDays = 7,
  defaultDate,
  minDate,
  maxDate,
  nextControlProps,
  previousControlProps,
  getDayProps,
  renderDay,
  locale = 'en-US',
  size = 'md',
}, ref) => {
  const theme = useTheme();

  const [selectedValue, setSelectedDate] = useControllableState<Date | null>({
    value,
    defaultValue: defaultValue ?? null,
    finalValue: null,
    onChange,
  });
  const selectedDate = selectedValue ?? null;
  const previousSelectedRef = useRef<Date | null>(selectedDate ?? null);

  const centerOffset = useMemo(() => Math.floor(numberOfDays / 2), [numberOfDays]);

  const [viewStartDate, setViewStartDate] = useState<Date>(() => {
    const base = defaultDate ?? selectedDate ?? new Date();
    return selectedDate ? dateUtils.addDays(base, -centerOffset) : base;
  });

  useEffect(() => {
    if (selectedDate) return;
    if (!defaultDate) return;

    setViewStartDate((prev) => (dateUtils.isSameDay(prev, defaultDate) ? prev : defaultDate));
  }, [defaultDate, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      previousSelectedRef.current = null;
      return;
    }

    if (previousSelectedRef.current && dateUtils.isSameDay(previousSelectedRef.current, selectedDate)) {
      return;
    }

    previousSelectedRef.current = selectedDate;
    const centered = dateUtils.addDays(selectedDate, -centerOffset);
    setViewStartDate((prev) => (dateUtils.isSameDay(prev, centered) ? prev : centered));
  }, [selectedDate, centerOffset]);

  const days = useMemo(
    () => dateUtils.getDaysInRange(viewStartDate, numberOfDays),
    [viewStartDate, numberOfDays],
  );

  const weekdayNames = useMemo(() => dateUtils.getWeekdayNames(locale, 'short'), [locale]);

  const handlePrevious = useCallback(() => {
    setViewStartDate((prev) => dateUtils.addDays(prev, -numberOfDays));
  }, [numberOfDays]);

  const handleNext = useCallback(() => {
    setViewStartDate((prev) => dateUtils.addDays(prev, numberOfDays));
  }, [numberOfDays]);

  const handleDayPress = useCallback(
    (date: Date) => {
      if (dateUtils.isDateDisabled(date, minDate, maxDate)) return;
      setSelectedDate(date);
    },
    [maxDate, minDate, setSelectedDate],
  );

  return (
    <View ref={ref} style={{ alignSelf: 'flex-start' }}>
      <Flex
        direction="row"
        justify="space-between"
        align="center"
        style={{ marginBottom: 16 }}
      >
        <Pressable
          onPress={handlePrevious}
          style={({ pressed }) => [
            {
              padding: 8,
              borderRadius: 6,
              backgroundColor: pressed ? theme.colors.gray[2] : 'transparent',
            },
          ]}
          {...previousControlProps}
        >
          <Icon name="chevron-left" size={16} color={theme.colors.gray[6]} />
        </Pressable>

        <Text size="md" weight="semibold" style={{ color: theme.colors.gray[8] }}>
          {dateUtils.formatDate(viewStartDate, 'MMM yyyy', locale)}
        </Text>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            {
              padding: 8,
              borderRadius: 6,
              backgroundColor: pressed ? theme.colors.gray[2] : 'transparent',
            },
          ]}
          {...nextControlProps}
        >
          <Icon name="chevron-right" size={16} color={theme.colors.gray[6]} />
        </Pressable>
      </Flex>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 0 }}
        style={{ flexGrow: 0 }}
      >
        <Flex direction="row" gap={4}>
          {days.map((date) => {
            const isSelected = selectedDate ? dateUtils.isSameDay(date, selectedDate) : false;
            const isToday = dateUtils.isToday(date);
            const isWeekend = dateUtils.isWeekend(date);
            const isDisabled = dateUtils.isDateDisabled(date, minDate, maxDate);

            const dayProps = getDayProps ? getDayProps(date) : {};
            const weekdayName = weekdayNames[date.getDay()];

            if (renderDay) {
              return (
                <View key={date.toISOString()} style={{ alignItems: 'center' }}>
                  <Text
                    size="xs"
                    style={{
                      marginBottom: 4,
                      color: theme.colors.gray[5],
                      textTransform: 'uppercase',
                      fontWeight: '500',
                    }}
                  >
                    {weekdayName}
                  </Text>
                  {renderDay(date)}
                </View>
              );
            }

            return (
              <View key={date.toISOString()} style={{ alignItems: 'center' }}>
                <Text
                  size="xs"
                  style={{
                    marginBottom: 8,
                    color: theme.colors.gray[5],
                    textTransform: 'uppercase',
                    fontWeight: '500',
                    letterSpacing: 0.5,
                  }}
                >
                  {weekdayName}
                </Text>

                <Pressable
                  onPress={() => handleDayPress(date)}
                  disabled={isDisabled}
                  style={({ pressed }) => [
                    {
                      width: size === 'xs' ? 32 : size === 'sm' ? 36 : size === 'md' ? 40 : 44,
                      height: size === 'xs' ? 32 : size === 'sm' ? 36 : size === 'md' ? 40 : 44,
                      borderRadius: size === 'xs' ? 16 : size === 'sm' ? 18 : size === 'md' ? 20 : 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? theme.colors.primary[5]
                        : pressed && !isDisabled
                        ? theme.colors.gray[1]
                        : 'transparent',
                      ...getCurrentPeriodStyles(theme, {
                        isCurrent: isToday && !isDisabled,
                        isSelected,
                      }),
                      opacity: isDisabled ? 0.5 : 1,
                    },
                  ]}
                  {...dayProps}
                >
                  <Text
                    size={size === 'xs' ? 'xs' : 'sm'}
                    weight={isSelected || isToday ? 'semibold' : 'medium'}
                    style={{
                      color: isSelected
                        ? 'white'
                        : isDisabled
                        ? theme.colors.gray[4]
                        : isWeekend && !isSelected
                        ? theme.colors.gray[6]
                        : isToday
                        ? theme.colors.primary[6]
                        : theme.colors.gray[9],
                    }}
                  >
                    {date.getDate()}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </Flex>
      </ScrollView>
    </View>
  );
});

MiniCalendar.displayName = 'MiniCalendar';