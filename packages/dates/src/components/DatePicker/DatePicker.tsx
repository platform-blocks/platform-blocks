import React, { useState } from 'react';
import { View } from 'react-native';

import {
  a11yProps,
  factory,
  useStyleProps,
  useControllableState,
} from '@plocks/ui';
import { Calendar } from '../Calendar/Calendar';
import { monthDiff } from '../Calendar/utils';
import type { CalendarLevel, CalendarValue, DatePickerProps } from './types';
import { extractFirstDate } from './utils';

const NO_PROPS = Object.freeze({});

/**
 * Inline calendar selection (no input). The calendar sits in a labelled
 * `group` when `accessibilityLabel` is given; its days stay individually
 * reachable by screen readers.
 */
export const DatePicker = factory<{ props: DatePickerProps; ref: View }>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    type = 'single',
    calendarProps,
    style,
    testID,
    accessibilityLabel,
    accessibilityHint,
  } = props;
  const spacingStyles = useStyleProps(props);
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
  } = calendarProps ?? {};

  const [selectedValue, setValue] = useControllableState<CalendarValue>({
    value,
    defaultValue: defaultValue ?? null,
    finalValue: null,
    onChange: (next) => onChange?.(next ?? null),
  });
  const currentValue: CalendarValue = selectedValue ?? null;

  const [viewLevel, setViewLevel] = useControllableState<CalendarLevel>({
    value: calendarLevelProp,
    defaultValue: calendarDefaultLevelProp ?? 'month',
    finalValue: 'month',
    onChange: calendarOnLevelChange,
  });

  // The visible month: `calendarProps.date` when controlled, else internal state.
  const [internalViewDate, setInternalViewDate] = useState<Date>(
    () => calendarDefaultDateProp ?? extractFirstDate(currentValue) ?? new Date()
  );
  const viewDate = calendarDateProp ?? internalViewDate;
  const visibleMonths = Math.max(1, numberOfMonths);

  // When the value moves somewhere not on screen (picked outside day, or a new
  // controlled value), bring it into view. Derived during render, not in an effect.
  const anchor = extractFirstDate(currentValue);
  const anchorKey = anchor ? anchor.getTime() : null;
  const [trackedAnchorKey, setTrackedAnchorKey] = useState(anchorKey);
  if (trackedAnchorKey !== anchorKey) {
    setTrackedAnchorKey(anchorKey);
    if (!calendarDateProp && anchor) {
      const offset = monthDiff(viewDate, anchor);
      if (offset < 0 || offset >= visibleMonths) setInternalViewDate(anchor);
    }
  }

  const handleDateChange = (next: Date) => {
    if (!calendarDateProp) setInternalViewDate(next);
    calendarOnDateChange?.(next);
  };

  const groupProps =
    accessibilityLabel || accessibilityHint
      ? a11yProps({ role: 'group', label: accessibilityLabel, hint: accessibilityHint })
      : NO_PROPS;

  return (
    <View ref={ref} style={[spacingStyles, style]} testID={testID} {...groupProps}>
      <Calendar
        {...calendarRest}
        locale={locale}
        numberOfMonths={numberOfMonths}
        date={viewDate}
        onDateChange={handleDateChange}
        level={viewLevel}
        onLevelChange={setViewLevel}
        value={currentValue}
        onChange={setValue}
        type={type}
      />
    </View>
  );
}, { displayName: 'DatePicker' });
