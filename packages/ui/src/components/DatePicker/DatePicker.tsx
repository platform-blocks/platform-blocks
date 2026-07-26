import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { View } from 'react-native';
import { Calendar } from '../Calendar/Calendar';
import { extractFirstDate } from './utils';
import type { DatePickerProps, CalendarLevel, CalendarValue } from './types';
import { useControllableState } from '../../hooks/useControllableState';

export const DatePicker = forwardRef<View, DatePickerProps>(({
  value,
  defaultValue,
  onChange,
  type = 'single',
  calendarProps,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}, ref) => {
  const calendarOverrides = calendarProps ?? {};
  const {
    level: calendarLevelProp,
    defaultLevel: calendarDefaultLevelProp,
    onLevelChange: calendarOnLevelChange,
    date: calendarDateProp,
    defaultDate: calendarDefaultDateProp,
    onDateChange: calendarOnDateChange,
    numberOfMonths = 1,
    locale = 'en-US',
    ...calendarRest
  } = calendarOverrides;

  const [selectedValue, setValue] = useControllableState<CalendarValue>({
    value,
    defaultValue: defaultValue ?? null,
    finalValue: null,
    onChange: (next) => onChange?.(next ?? null),
  });
  const currentValue: CalendarValue = selectedValue ?? null;

  const initialDate = calendarDateProp
    ?? calendarDefaultDateProp
    ?? extractFirstDate(currentValue)
    ?? extractFirstDate(defaultValue ?? null)
    ?? new Date();

  const initialLevel = (calendarLevelProp ?? calendarDefaultLevelProp ?? 'month') as CalendarLevel;

  const [viewDate, setViewDate] = useState<Date>(initialDate);
  const [viewLevel, setViewLevel] = useState<CalendarLevel>(initialLevel);

  useEffect(() => {
    if (calendarDateProp) {
      setViewDate(calendarDateProp);
    }
  }, [calendarDateProp]);

  useEffect(() => {
    if (!calendarDateProp && calendarDefaultDateProp) {
      setViewDate(calendarDefaultDateProp);
    }
  }, [calendarDateProp, calendarDefaultDateProp]);

  useEffect(() => {
    if (calendarLevelProp) {
      setViewLevel(calendarLevelProp as CalendarLevel);
    }
  }, [calendarLevelProp]);

  useEffect(() => {
    if (!calendarLevelProp && calendarDefaultLevelProp) {
      setViewLevel(calendarDefaultLevelProp as CalendarLevel);
    }
  }, [calendarLevelProp, calendarDefaultLevelProp]);

  useEffect(() => {
    if (calendarDateProp) return;
    const candidate = extractFirstDate(currentValue) ?? extractFirstDate(defaultValue ?? null);
    if (candidate) {
      setViewDate(candidate);
    }
  }, [calendarDateProp, currentValue, defaultValue]);

  const handleDateChange = (next: Date) => {
    if (!calendarDateProp) {
      setViewDate(next);
    }
    calendarOnDateChange?.(next);
  };

  const handleLevelChange = (next: CalendarLevel) => {
    if (!calendarLevelProp) {
      setViewLevel(next);
    }
    calendarOnLevelChange?.(next);
  };

  const handleValueChange = (next: CalendarValue) => {
    setValue(next);
    if (!calendarDateProp) {
      const candidate = extractFirstDate(next);
      if (candidate) {
        setViewDate(candidate);
      }
    }
  };

  return (
    <View
      ref={ref}
      style={style}
      testID={testID}
      accessible={!!(accessibilityLabel || accessibilityHint)}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Calendar
        {...calendarRest}
        locale={locale}
        numberOfMonths={numberOfMonths}
        date={viewDate}
        onDateChange={handleDateChange}
        level={viewLevel}
        onLevelChange={handleLevelChange}
        value={currentValue}
        onChange={handleValueChange}
        type={type}
      />
    </View>
  );
});

DatePicker.displayName = 'DatePicker';
