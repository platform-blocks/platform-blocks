import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { Flex } from '../Flex';
import { Day } from './Day';
import { dateUtils, getDaySize, getMonthGridWidth } from './utils';
import { DESIGN_TOKENS } from '../../core';
import type { MonthProps } from './types';

export const Month = React.forwardRef<View, MonthProps>(({
  month,
  value,
  onChange,
  type = 'single',
  hoveredDate,
  onDayHover,
  onDayHoverEnd,
  minDate,
  maxDate,
  firstDayOfWeek = 0,
  weekendDays = [0, 6],
  locale = 'en-US',
  size = 'md',
  hideOutsideDates = false,
  hideWeekdays = false,
  highlightToday = true,
  withCellSpacing = true,
  excludeDate,
  getDayProps,
  renderDay,
}, ref) => {
  const calendar = useMemo(() =>
    dateUtils.getMonthCalendar(month, firstDayOfWeek),
    [month, firstDayOfWeek]
  );

  const daySize = getDaySize(size);
  // Pin the grid to the width its seven cells actually need — without this the
  // rows stretch to the container and `space-between` fans the days apart.
  const gridWidth = getMonthGridWidth(size, withCellSpacing);

  const rangeValue = useMemo<[Date | null, Date | null]>(() => {
    if (Array.isArray(value) && value.length === 2) {
      return [value[0] instanceof Date ? value[0] : null, value[1] instanceof Date ? value[1] : null];
    }
    return [null, null];
  }, [value]);

  const [rangeStart, rangeEnd] = rangeValue;

  const isRangeSelectionInProgress = type === 'range' && rangeStart instanceof Date && !(rangeEnd instanceof Date);

  const previewRange = useMemo(() => {
    if (!isRangeSelectionInProgress || !hoveredDate || !(rangeStart instanceof Date)) {
      return null;
    }

    if (dateUtils.isDateDisabled(hoveredDate, minDate, maxDate, excludeDate)) {
      return null;
    }

    const startTime = rangeStart.getTime();
    const hoverTime = hoveredDate.getTime();
    if (startTime === hoverTime) {
      return {
        start: rangeStart,
        end: hoveredDate,
      };
    }

    return startTime < hoverTime
      ? { start: rangeStart, end: hoveredDate }
      : { start: hoveredDate, end: rangeStart };
  }, [excludeDate, hoveredDate, isRangeSelectionInProgress, maxDate, minDate, rangeStart]);

  const handleMonthMouseLeave = useCallback(() => {
    if (isRangeSelectionInProgress) {
      onDayHoverEnd?.();
    }
  }, [isRangeSelectionInProgress, onDayHoverEnd]);

  const weekdayNames = useMemo(() => {
    const names = dateUtils.getWeekdayNames(locale, 'narrow');
    // Reorder based on firstDayOfWeek
    return [...names.slice(firstDayOfWeek), ...names.slice(0, firstDayOfWeek)];
  }, [locale, firstDayOfWeek]);

  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    
    if (type === 'single') {
      return value instanceof Date && dateUtils.isSameDay(date, value);
    }
    
    if (type === 'multiple') {
      return Array.isArray(value) && value.some(v => v instanceof Date && dateUtils.isSameDay(date, v));
    }
    
    if (type === 'range') {
      if (Array.isArray(value) && value.length === 2) {
        const [start, end] = value;
        if (start && dateUtils.isSameDay(date, start)) return true;
        if (end && dateUtils.isSameDay(date, end)) return true;
      }
    }
    
    return false;
  };

  const isInRange = (date: Date): boolean => {
    if (type !== 'range' || !Array.isArray(value) || value.length !== 2) return false;
    const [start, end] = value;
    return !!(start && end && dateUtils.isInRange(date, start, end));
  };

  const isFirstInRange = (date: Date): boolean => {
    if (type !== 'range' || !Array.isArray(value)) return false;
    const [start] = value;
    return !!(start && dateUtils.isSameDay(date, start));
  };

  const isLastInRange = (date: Date): boolean => {
    if (type !== 'range' || !Array.isArray(value)) return false;
    const [, end] = value;
    return !!(end && dateUtils.isSameDay(date, end));
  };

  const handleDayPress = (date: Date) => {
    if (!onChange) return;
    
    if (type === 'single') {
      onChange(date);
    } else if (type === 'multiple') {
      const currentArray = Array.isArray(value) ? value.filter(v => v instanceof Date) as Date[] : [];
      const exists = currentArray.find(v => dateUtils.isSameDay(v, date));
      
      if (exists) {
        onChange(currentArray.filter(v => !dateUtils.isSameDay(v, date)));
      } else {
        onChange([...currentArray, date]);
      }
    } else if (type === 'range') {
      const currentRange = Array.isArray(value) ? value : [null, null];
      const [start, end] = currentRange;
      
      if (!start || (start && end)) {
        // Start new range
        onChange([date, null]);
      } else if (start && !end) {
        // Complete the range
        if (date < start) {
          onChange([date, start]);
        } else {
          onChange([start, date]);
        }
      }
    }
  };

  return (
    <View
      ref={ref}
      style={{ width: gridWidth }}
      {...(onDayHoverEnd ? { onMouseLeave: handleMonthMouseLeave } : {})}
    >
      {/* Weekday headers */}
      {!hideWeekdays && (
        <Flex
          direction="row"
          justify="space-between"
          style={{
            marginBottom: withCellSpacing ? DESIGN_TOKENS.spacing.sm : 0,
          }}
        >
          {weekdayNames.map((weekday, index) => (
            <View
              key={index}
              style={{
                height: daySize,
                width: daySize,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text 
                size="sm" 
                weight="semibold" 
                style={{ 
                  color: '#8B8B8B',
                  textTransform: 'uppercase',
                  fontSize: DESIGN_TOKENS.typography.fontSize.xs,
                  letterSpacing: 0.5,
                }}
              >
                {weekday}
              </Text>
            </View>
          ))}
        </Flex>
      )}
      
      {/* Calendar days */}
      <View>
        {calendar.map((week, weekIndex) => (
          <Flex 
            key={weekIndex} 
            direction="row" 
            justify="space-between" 
            style={{ 
              marginBottom: withCellSpacing ? DESIGN_TOKENS.spacing.xs : 0,
              gap: withCellSpacing ? DESIGN_TOKENS.spacing.xs : 0,
            }}
          >
            {week.map((date) => {
              const isOutside = !dateUtils.isSameMonth(date, month);
              const isWeekend = dateUtils.isWeekend(date, weekendDays);
              const isToday = highlightToday && dateUtils.isToday(date);
              const selected = isSelected(date);
              const inRange = isInRange(date);
              const firstInRange = isFirstInRange(date);
              const lastInRange = isLastInRange(date);
              const isDisabled = dateUtils.isDateDisabled(date, minDate, maxDate, excludeDate);

              const previewedInRange = !!(
                previewRange && dateUtils.isInRange(date, previewRange.start, previewRange.end)
              );
              const previewedFirstInRange = !!(
                previewRange && dateUtils.isSameDay(date, previewRange.start)
              );
              const previewedLastInRange = !!(
                previewRange && dateUtils.isSameDay(date, previewRange.end)
              );
              const previewed = !!(
                hoveredDate && isRangeSelectionInProgress && dateUtils.isSameDay(date, hoveredDate)
              );
              
              // Get custom day props if provided
              const dayProps = getDayProps ? getDayProps(date) : {};
              const { onMouseEnter: customOnMouseEnter, onMouseLeave: customOnMouseLeave, ...restDayProps } = dayProps;

              const handleMouseEnter = (event?: any) => {
                if (!isDisabled && isRangeSelectionInProgress) {
                  onDayHover?.(date);
                }
                if (typeof customOnMouseEnter === 'function') {
                  (customOnMouseEnter as (event?: any) => void)(event);
                }
              };

              const handleMouseLeave = (event?: any) => {
                if (typeof customOnMouseLeave === 'function') {
                  (customOnMouseLeave as (event?: any) => void)(event);
                }
              };
              
              // Don't render outside dates if hideOutsideDates is true
              if (hideOutsideDates && isOutside) {
                return (
                  <View
                    key={date.toISOString()}
                    style={{ width: daySize, height: daySize }}
                  />
                );
              }

              // Custom render function
              if (renderDay) {
                return (
                  <View key={date.toISOString()}>
                    {renderDay(date)}
                  </View>
                );
              }

              return (
                <Day
                  key={date.toISOString()}
                  date={date}
                  selected={selected}
                  inRange={inRange}
                  firstInRange={firstInRange}
                  lastInRange={lastInRange}
                  previewed={previewed}
                  previewedInRange={previewedInRange}
                  previewedFirstInRange={previewedFirstInRange}
                  previewedLastInRange={previewedLastInRange}
                  weekend={isWeekend}
                  outside={isOutside}
                  today={isToday}
                  disabled={isDisabled}
                  onPress={() => handleDayPress(date)}
                  size={size}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  {...restDayProps}
                />
              );
            })}
          </Flex>
        ))}
      </View>
    </View>
  );
});

Month.displayName = 'Month';