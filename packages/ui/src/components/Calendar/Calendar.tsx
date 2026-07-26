import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../Text';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { Month } from './Month';
import { MonthPicker } from '../MonthPicker';
import { YearPicker } from '../YearPicker';
import { dateUtils, getMonthGridWidth } from './utils';
import { useTheme } from '../../core/theme';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer';
import type { CalendarProps, CalendarLevel } from './types';
import { useControllableState } from '../../hooks/useControllableState';

const MONTH_GAP = 16;

export const Calendar = React.forwardRef<View, CalendarProps>((incomingProps, ref) => {
  const { disclaimerProps: disclaimerData, otherProps: props } = extractDisclaimerProps(incomingProps);
  const {
    level,
    defaultLevel = 'month',
    onLevelChange,
    
    // Date management
    date: controlledDate,
    defaultDate,
    onDateChange,
    
    // Value handling (for selection)
    value,
    onChange,
    type = 'single',
    
    // Constraints
    minDate,
    maxDate,
    excludeDate,
    
    // Localization
    locale = 'en-US',
    firstDayOfWeek = 0,
    weekendDays = [0, 6],
    
    // Display options
    withCellSpacing = true,
    hideOutsideDates = false,
    hideWeekdays = false,
    highlightToday = true,
    numberOfMonths = 1,
    
    // Customization
    getDayProps,
    renderDay,
    size = 'md',
    fullWidth = false,

    // Static mode (non-interactive)
    static: isStatic = false,
  } = props;
  const theme = useTheme();
  const headerTextSize = typeof size === 'number'
    ? size
    : ({
        xs: 'sm',
        sm: 'md',
        md: 'lg',
        lg: 'xl',
        xl: '2xl',
        '2xl': '3xl',
        '3xl': '3xl',
      } as const)[size] ?? 'lg';
  const { isRTL } = useDirection();
  // A calendar has a natural width — seven day columns. Left to stretch it fans
  // the days apart and reads as an oddly long block, so size to the grid and
  // let `fullWidth` opt back into filling the container.
  const months = Math.max(1, numberOfMonths);
  const calendarWidth = fullWidth
    ? '100%'
    : getMonthGridWidth(size, withCellSpacing) * months + MONTH_GAP * (months - 1);
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);
  
  const [currentDate, setCurrentDate] = useControllableState<Date>({
    value: controlledDate,
    defaultValue: () => defaultDate || new Date(),
    onChange: onDateChange,
  });

  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const [currentLevel, setCurrentLevel] = useControllableState<CalendarLevel>({
    value: level,
    defaultValue: defaultLevel,
    finalValue: 'month',
    onChange: onLevelChange,
  });

  const rangeValue = useMemo(() => (
    Array.isArray(value) && value.length === 2
      ? [value[0] instanceof Date ? value[0] : null, value[1] instanceof Date ? value[1] : null]
      : [null, null]
  ), [value]);

  const rangeStart = rangeValue[0];
  const rangeEnd = rangeValue[1];

  const isRangeSelectionInProgress = type === 'range' && rangeStart instanceof Date && !(rangeEnd instanceof Date);

  const handleDayHover = useCallback((date: Date) => {
    if (!isRangeSelectionInProgress) return;
    setHoveredDate(date);
  }, [isRangeSelectionInProgress]);

  const handleDayHoverEnd = useCallback(() => {
    setHoveredDate(null);
  }, []);

  useEffect(() => {
    if (!isRangeSelectionInProgress) {
      setHoveredDate(null);
    }
  }, [isRangeSelectionInProgress]);

  const monthNames = useMemo(() => dateUtils.getMonthNames(locale), [locale]);

  const handleDateChange = useCallback(
    (newDate: Date) => setCurrentDate(newDate),
    [setCurrentDate],
  );

  const handleLevelChange = useCallback(
    (newLevel: CalendarLevel) => setCurrentLevel(newLevel),
    [setCurrentLevel],
  );

  const handlePreviousClick = () => {
    if (isStatic) return;
    
    if (currentLevel === 'month') {
      handleDateChange(dateUtils.addMonths(currentDate, -1));
    } else if (currentLevel === 'year') {
      handleDateChange(dateUtils.addYears(currentDate, -1));
    } else if (currentLevel === 'decade') {
      handleDateChange(dateUtils.addYears(currentDate, -10));
    }
  };

  const handleNextClick = () => {
    if (isStatic) return;
    
    if (currentLevel === 'month') {
      handleDateChange(dateUtils.addMonths(currentDate, 1));
    } else if (currentLevel === 'year') {
      handleDateChange(dateUtils.addYears(currentDate, 1));
    } else if (currentLevel === 'decade') {
      handleDateChange(dateUtils.addYears(currentDate, 10));
    }
  };

  const handleHeaderClick = () => {
    if (isStatic) return;
    
    if (currentLevel === 'month') {
      handleLevelChange('year');
    } else if (currentLevel === 'year') {
      handleLevelChange('decade');
    }
  };

  const getHeaderText = () => {
    if (currentLevel === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentLevel === 'year') {
      return currentDate.getFullYear().toString();
    } else if (currentLevel === 'decade') {
      const [start, end] = dateUtils.getDecadeRange(currentDate.getFullYear());
      return `${start} - ${end}`;
    }
    return '';
  };

  const renderMonthLevel = () => {
    if (numberOfMonths === 1) {
      return (
        <Month
          month={currentDate}
          value={value}
          onChange={onChange}
          type={type}
          hoveredDate={hoveredDate}
          onDayHover={handleDayHover}
          onDayHoverEnd={handleDayHoverEnd}
          minDate={minDate}
          maxDate={maxDate}
          firstDayOfWeek={firstDayOfWeek}
          weekendDays={weekendDays}
          locale={locale}
          size={size}
          hideOutsideDates={hideOutsideDates}
          hideWeekdays={hideWeekdays}
          highlightToday={highlightToday}
          withCellSpacing={withCellSpacing}
          excludeDate={excludeDate}
          getDayProps={getDayProps}
          renderDay={renderDay}
        />
      );
    }

    // Multiple months
    const monthDates = Array.from({ length: months }, (_, i) =>
      dateUtils.addMonths(currentDate, i)
    );

    return (
      <Flex direction="row" gap={MONTH_GAP} justify="center" style={{ flexWrap: 'wrap' }}>
        {monthDates.map((monthDate, index) => (
          <View key={index}>
            <Month
              month={monthDate}
              value={value}
              onChange={onChange}
              type={type}
              hoveredDate={hoveredDate}
              onDayHover={handleDayHover}
              onDayHoverEnd={handleDayHoverEnd}
              minDate={minDate}
              maxDate={maxDate}
              firstDayOfWeek={firstDayOfWeek}
              weekendDays={weekendDays}
              locale={locale}
              size={size}
              hideOutsideDates={hideOutsideDates}
              hideWeekdays={hideWeekdays}
              highlightToday={highlightToday}
              withCellSpacing={withCellSpacing}
              excludeDate={excludeDate}
              getDayProps={getDayProps}
              renderDay={renderDay}
            />
          </View>
        ))}
      </Flex>
    );
  };

  const renderContent = () => {
    if (currentLevel === 'month') return renderMonthLevel();
    if (currentLevel === 'year') return renderYearLevel();
    if (currentLevel === 'decade') return renderDecadeLevel();
    return renderMonthLevel();
  };

  const renderYearLevel = () => {
    return (
      <MonthPicker
        value={currentDate}
  onChange={(newDate: Date | null) => {
          if (newDate) {
            handleDateChange(newDate);
            handleLevelChange('month');
          }
        }}
        year={currentDate.getFullYear()}
  onYearChange={(year: number) => {
          const newDate = new Date(year, currentDate.getMonth(), currentDate.getDate());
          handleDateChange(newDate);
        }}
        minDate={minDate}
        maxDate={maxDate}
        size={size}
        hideHeader={true}
        fullWidth
        monthLabelFormat="short"
      />
    );
  };

  const renderDecadeLevel = () => {
    return (
      <YearPicker
        value={currentDate}
  onChange={(newDate: Date | null) => {
          if (newDate) {
            handleDateChange(newDate);
            handleLevelChange('year');
          }
        }}
        decade={Math.floor(currentDate.getFullYear() / 10) * 10}
  onDecadeChange={(decade: number) => {
          const newDate = new Date(decade, currentDate.getMonth(), currentDate.getDate());
          handleDateChange(newDate);
        }}
        minDate={minDate}
        maxDate={maxDate}
        size={size}
        hideHeader={true}
        fullWidth
      />
    );
  };

  const disclaimerNode = renderDisclaimer();

  return (
    <View ref={ref} style={{ width: calendarWidth, maxWidth: '100%' }}>
      <View
        style={{ width: '100%' }}
        {...(type === 'range' ? { onMouseLeave: handleDayHoverEnd } : {})}
      >
        {/* Header */}
        <Flex 
          direction="row" 
          justify="space-between" 
          align="center" 
          style={{ 
            marginBottom: 20,
            paddingHorizontal: 4,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          <Pressable
            onPress={handlePreviousClick}
            disabled={isStatic}
            style={({ pressed }) => [
              {
                padding: 12,
                borderRadius: 8,
                backgroundColor: pressed && !isStatic ? theme.colors.gray[2] : 'transparent',
                opacity: isStatic ? 0.5 : 1,
              },
            ]}
          >
            <Icon name={isRTL ? 'chevron-right' : 'chevron-left'} size={20} color={theme.colors.gray[6]} />
          </Pressable>

          <Pressable 
            onPress={handleHeaderClick}
            disabled={isStatic || currentLevel === 'decade'}
            style={({ pressed }) => [
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: pressed && !isStatic && currentLevel !== 'decade' 
                  ? theme.colors.gray[2] 
                  : 'transparent',
              },
            ]}
          >
            <Text
              size={headerTextSize}
              weight="semibold"
              style={{ 
                color: theme.colors.gray[9],
                textAlign: 'center',
              }}
            >
              {getHeaderText()}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNextClick}
            disabled={isStatic}
            style={({ pressed }) => [
              {
                padding: 12,
                borderRadius: 8,
                backgroundColor: pressed && !isStatic ? theme.colors.gray[2] : 'transparent',
                opacity: isStatic ? 0.5 : 1,
              },
            ]}
          >
            <Icon name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={theme.colors.gray[6]} />
          </Pressable>
        </Flex>

        {/* Content */}
        {renderContent()}
      </View>
      {disclaimerNode ? (
        <View style={{ width: '100%' }}>
          {disclaimerNode}
        </View>
      ) : null}
    </View>
  );
});

Calendar.displayName = 'Calendar';
