import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import {
  factory,
  useLatestCallback,
  useTheme,
  useControllableState,
} from '@plocks/ui';
import { Calendar } from '../Calendar/Calendar';
import { getCalendarWidth } from '../Calendar/utils';
import { dateUtils, extractFirstDate } from '../DatePicker/utils';
import { PickerActions } from './PickerActions';
import { getSheetWidthFor, PickerField } from './PickerField';
import type { CalendarLevel, CalendarValue, DatePickerInputHandle, DatePickerInputProps } from './types';

const DEFAULT_TITLES = {
  single: 'Select date',
  multiple: 'Select dates',
  range: 'Select date range',
} as const;

const PANEL_CENTER: ViewStyle = { alignItems: 'center' };

/**
 * A form field that opens a calendar in a sheet (or, with
 * `dropdownType="popover"`, a dropdown on desktop web). The field is a button
 * announcing its label and value; the calendar stays navigable cell by cell
 * (nothing collapses it into one accessibility element).
 */
export const DatePickerInput = factory<{ props: DatePickerInputProps; ref: DatePickerInputHandle }>(
  function DatePickerInput(props, ref) {
    const {
      value,
      defaultValue,
      onChange,
      type = 'single',
      calendarProps,
      placeholder = 'Pick date',
      displayFormat = 'MMMM d, yyyy',
      clearable = false,
      dropdownType = 'modal',
      closeOnSelect,
      modalTitle,
      onOpen,
      onClose,
      ...fieldProps
    } = props;

    const {
      level: calendarLevel,
      defaultLevel: calendarDefaultLevel,
      onLevelChange: calendarOnLevelChange,
      date: calendarDate,
      defaultDate: calendarDefaultDate,
      onDateChange: calendarOnDateChange,
      numberOfMonths = 1,
      locale = 'en-US',
      ...calendarRest
    } = calendarProps ?? {};

    const theme = useTheme();
    const shouldCloseOnSelect = closeOnSelect ?? type === 'single';
    const onChangeLatest = useLatestCallback(onChange);

    const [selectedValue, setValue] = useControllableState<CalendarValue>({
      value,
      defaultValue: defaultValue ?? null,
      finalValue: null,
      onChange: (next: CalendarValue) => onChangeLatest(next ?? null),
    });
    const currentValue: CalendarValue = selectedValue ?? null;

    const [opened, setOpened] = useState(false);

    const open = useCallback(() => {
      setOpened(true);
      onOpen?.();
    }, [onOpen]);

    const close = useCallback(() => {
      setOpened(false);
      onClose?.();
    }, [onClose]);

    const formatDate = useCallback(
      (date: Date) => dateUtils.formatDate(date, displayFormat || 'MMMM d, yyyy', locale),
      [displayFormat, locale]
    );

    const displayValue = useMemo(() => {
      if (!currentValue) return '';
      if (currentValue instanceof Date) return formatDate(currentValue);
      if (type === 'multiple') {
        return (currentValue as Date[]).filter((item): item is Date => item instanceof Date).map(formatDate).join(', ');
      }
      if (type === 'range') {
        const [start, end] = currentValue as [Date | null, Date | null];
        if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
        if (start) return formatDate(start);
        if (end) return formatDate(end);
      }
      return '';
    }, [currentValue, type, formatDate]);

    const emptyValue = useCallback((): CalendarValue => {
      if (type === 'multiple') return [];
      if (type === 'range') return [null, null];
      return null;
    }, [type]);

    const handleValueChange = useCallback(
      (next: CalendarValue) => {
        setValue(next);
        if (!shouldCloseOnSelect) return;
        if (type === 'single' && next instanceof Date) close();
        else if (type === 'range' && Array.isArray(next) && next[0] instanceof Date && next[1] instanceof Date) close();
      },
      [setValue, shouldCloseOnSelect, type, close]
    );

    const clearValue = useCallback(() => setValue(emptyValue()), [setValue, emptyValue]);

    const summary = useMemo(() => {
      if (type === 'multiple' && Array.isArray(currentValue)) {
        const count = currentValue.filter((item) => item instanceof Date).length;
        return `${count} date${count === 1 ? '' : 's'} selected`;
      }
      if (type === 'range') return displayValue || 'Select dates';
      return undefined;
    }, [type, currentValue, displayValue]);

    // The panel mounts each time it opens, so the calendar starts on the
    // selected date (or the caller's date / level).
    const initialDate = calendarDefaultDate ?? extractFirstDate(currentValue) ?? new Date();
    const initialLevel: CalendarLevel = calendarDefaultLevel ?? 'month';

    // The calendar keeps its grid width, so the sheet hugs it; a fixed width
    // leaves the grid floating in empty space on phones. A `fullWidth`
    // calendar stretches to whatever it gets.
    const panelWidth = calendarRest.fullWidth
      ? numberOfMonths > 1 ? Math.min(700, 380 * numberOfMonths + 40) : 400
      : getSheetWidthFor(theme, getCalendarWidth(theme, calendarRest.size, calendarRest.withCellSpacing, numberOfMonths));

    const panel = (
      <>
        <View style={PANEL_CENTER}>
          <Calendar
            {...calendarRest}
            locale={locale}
            numberOfMonths={numberOfMonths}
            date={calendarDate}
            defaultDate={initialDate}
            onDateChange={calendarOnDateChange}
            level={calendarLevel}
            defaultLevel={initialLevel}
            onLevelChange={calendarOnLevelChange}
            value={currentValue}
            onChange={handleValueChange}
            type={type}
          />
        </View>
        {type === 'multiple' || type === 'range' ? (
          <PickerActions summary={summary} onClear={clearValue} onDone={close} />
        ) : null}
      </>
    );

    return (
      <PickerField
        {...fieldProps}
        handleRef={ref}
        placeholder={placeholder}
        clearable={clearable}
        displayValue={displayValue}
        hasValue={displayValue !== ''}
        opened={opened}
        onOpenRequest={open}
        onCloseRequest={close}
        onClearValue={clearValue}
        dropdownType={dropdownType}
        panelTitle={modalTitle ?? DEFAULT_TITLES[type]}
        panelWidth={panelWidth}
        icon="calendar"
      >
        {panel}
      </PickerField>
    );
  },
  { displayName: 'DatePickerInput' }
);
