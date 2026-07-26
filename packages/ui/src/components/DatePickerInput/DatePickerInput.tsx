import React, { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import { View, Pressable, Keyboard, Platform } from 'react-native';
import { Text } from '../Text';
import { Input } from '../Input';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { Dialog } from '../Dialog';
import { useControllableState } from '../../hooks/useControllableState';
import { Calendar } from '../Calendar/Calendar';
import { dateUtils, extractFirstDate } from '../DatePicker/utils';
import { useTheme } from '../../core/theme';
import { DESIGN_TOKENS } from '../../core/design-tokens';
import { useFocusTrap } from '../../core/accessibility/advancedHooks';
import { DatePicker } from '../DatePicker/DatePicker';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';
import type { DatePickerInputProps, CalendarLevel, CalendarValue } from './types';

export const DatePickerInput = forwardRef(function DatePickerInputInner(
  {
    value,
    defaultValue,
    onChange,
    type = 'single',
    calendarProps,
    placeholder = 'Pick date',
    displayFormat = 'MMMM d, yyyy',
    valueFormat,
    clearable = false,
    size = 'md',
    disabled = false,
    withAsterisk,
    withInput = true,
    dropdownType = 'modal',
    closeOnSelect,
    onOpen,
    onClose,
    onFocus,
    onBlur,
    ...inputProps
  }: DatePickerInputProps,
  ref: React.ForwardedRef<View>
) {
  const theme = useTheme();
  const keyboardManager = useKeyboardManagerOptional();
  const {
    label,
    error,
    required = false,
    endSection,
    ...restInputProps
  } = inputProps;

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

  void valueFormat;

  const shouldCloseOnSelect = closeOnSelect ?? type === 'single';

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
  const initialLevelRef = useRef(initialLevel);

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
      initialLevelRef.current = calendarDefaultLevelProp as CalendarLevel;
      setViewLevel(calendarDefaultLevelProp as CalendarLevel);
    }
  }, [calendarLevelProp, calendarDefaultLevelProp]);

  const [isOpen, setIsOpen] = useState(false);

  const { containerRef: focusTrapRef } = useFocusTrap(isOpen);

  const formatDate = useCallback(
    (date: Date): string => dateUtils.formatDate(date, displayFormat || 'MMMM d, yyyy', locale),
    [displayFormat, locale]
  );

  const formatValue = useCallback((val: CalendarValue): string => {
    if (!val) return '';
    if (val instanceof Date) return formatDate(val);
    if (Array.isArray(val)) {
      if (type === 'multiple') {
        return (val as Date[])
          .filter((item): item is Date => item instanceof Date)
          .map((date) => formatDate(date))
          .join(', ');
      }
      if (type === 'range') {
        const [start, end] = val as [Date | null, Date | null];
        if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
        if (start) return formatDate(start);
        if (end) return formatDate(end);
      }
    }
    return '';
  }, [type, formatDate]);

  const syncViewDateToValue = useCallback((val: CalendarValue) => {
    if (calendarDateProp) return;
    const candidate = extractFirstDate(val) ?? extractFirstDate(defaultValue ?? null);
    if (candidate) {
      setViewDate(candidate);
    }
  }, [calendarDateProp, defaultValue]);

  const handleInputPress = () => {
    if (disabled) return;
    if (keyboardManager) {
      keyboardManager.dismissKeyboard();
    } else {
      Keyboard.dismiss();
    }
    syncViewDateToValue(currentValue);
    if (!calendarLevelProp && calendarDefaultLevelProp) {
      setViewLevel(calendarDefaultLevelProp as CalendarLevel);
    }
    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!calendarLevelProp) {
      setViewLevel(initialLevelRef.current);
    }
    onClose?.();
  };

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
    if (withInput && shouldCloseOnSelect) {
      if (type === 'single' && next instanceof Date) {
        handleClose();
      } else if (type === 'range' && Array.isArray(next)) {
        const [start, end] = next as [Date | null, Date | null];
        if (start && end) {
          handleClose();
        }
      }
    }
  };

  const handleClear = useCallback(() => {
    if (type === 'multiple') {
      setValue([]);
    } else if (type === 'range') {
      setValue([null, null]);
    } else {
      setValue(null);
    }
  }, [setValue, type]);

  const inputValue = formatValue(currentValue);
  const showAsterisk = withAsterisk ?? required;

  const renderInput = () => (
    <Pressable
      onPress={handleInputPress}
      disabled={disabled}
      accessible={true}
      // On web, `accessibilityRole="button"` makes react-native-web render a
      // native <button>, which then illegally nests the Input's clear <button>.
      // Use the combobox role on web (matches Select) to render a <div> instead.
      {...(Platform.OS === 'web'
        ? { role: 'combobox' as const }
        : { accessibilityRole: 'button' as const })}
      accessibilityLabel={`Date picker. ${inputValue || placeholder}`}
      accessibilityHint="Tap to open calendar"
      accessibilityState={{ disabled }}
    >
      <Input
        value={inputValue}
        placeholder={placeholder}
        label={label}
        error={error}
        disabled={disabled}
        required={required}
        withAsterisk={showAsterisk}
        size={size}
        endSection={endSection ?? <Icon name="calendar" size={16} />}
        clearable={clearable}
        onClear={handleClear}
        onFocus={onFocus}
        onBlur={onBlur}
        textInputProps={{
          editable: false,
          pointerEvents: 'none',
          accessible: false,
          importantForAccessibility: 'no-hide-descendants',
          focusable: false,
        }}
        {...restInputProps}
      />
    </Pressable>
  );

  const renderCalendar = () => (
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
  );

  if (!withInput) {
    if (__DEV__) {
      console.warn('DatePickerInput: `withInput={false}` is deprecated. Use the new <DatePicker /> component instead.');
    }

    return (
      <DatePicker
        ref={ref}
        value={currentValue}
        defaultValue={defaultValue}
        onChange={setValue}
        type={type}
        calendarProps={{
          ...calendarRest,
          numberOfMonths,
          locale,
          level: calendarLevelProp,
          defaultLevel: calendarDefaultLevelProp,
          onLevelChange: calendarOnLevelChange,
          date: calendarDateProp,
          defaultDate: calendarDefaultDateProp,
          onDateChange: calendarOnDateChange,
        }}
      />
    );
  }

  if (dropdownType === 'modal') {
    return (
      <View ref={ref}>
        {renderInput()}

        <Dialog
          visible={isOpen}
          variant="modal"
          onClose={handleClose}
          w={numberOfMonths > 1 ? Math.min(700, 380 * numberOfMonths + 40) : 400}
          title={
            type === 'range'
              ? 'Select Date Range'
              : type === 'multiple'
              ? 'Select Dates'
              : 'Select Date'
          }
        >
          <View
            ref={focusTrapRef}
            style={{ padding: DESIGN_TOKENS.spacing.lg }}
            accessible={true}
            accessibilityLabel={
              type === 'range'
                ? 'Date range picker dialog'
                : type === 'multiple'
                ? 'Multiple date picker dialog'
                : 'Date picker dialog'
            }
          >
            {/* The calendar sizes to its day grid, so center it in the wider dialog. */}
            <View style={{ alignItems: 'center' }}>{renderCalendar()}</View>

            {(type === 'multiple' || type === 'range') && (
              <View
                style={{
                  paddingTop: DESIGN_TOKENS.spacing.lg,
                  marginTop: DESIGN_TOKENS.spacing.lg,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.gray[2],
                }}
              >
                <Flex direction="row" justify="space-between" align="center">
                  <Text size="sm" style={{ color: theme.colors.gray[6] }}>
                    {type === 'range' && Array.isArray(currentValue) && currentValue.length === 2
                      ? `${formatValue(currentValue)}`
                      : type === 'multiple' && Array.isArray(currentValue)
                      ? `${currentValue.length} date${currentValue.length !== 1 ? 's' : ''} selected`
                      : 'Select dates'}
                  </Text>
                  <Flex direction="row" gap={8}>
                    <Pressable
                      onPress={() => setValue(type === 'range' ? [null, null] : [])}
                      style={({ pressed }) => ({
                        paddingHorizontal: DESIGN_TOKENS.spacing.lg,
                        paddingVertical: DESIGN_TOKENS.spacing.sm,
                        borderRadius: DESIGN_TOKENS.radius.sm,
                        backgroundColor: pressed ? theme.colors.gray[2] : theme.colors.gray[1],
                      })}
                    >
                      <Text size="sm" weight="medium" style={{ color: theme.colors.gray[7] }}>
                        Clear
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleClose}
                      style={({ pressed }) => ({
                        paddingHorizontal: DESIGN_TOKENS.spacing.xl,
                        paddingVertical: DESIGN_TOKENS.spacing.sm,
                        borderRadius: DESIGN_TOKENS.radius.sm,
                        backgroundColor: pressed ? theme.colors.primary[6] : theme.colors.primary[5],
                      })}
                    >
                      <Text size="sm" weight="semibold" style={{ color: 'white' }}>
                        Done
                      </Text>
                    </Pressable>
                  </Flex>
                </Flex>
              </View>
            )}
          </View>
        </Dialog>
      </View>
    );
  }

  return (
    <View ref={ref}>
      {renderInput()}

      <Dialog
        visible={isOpen}
        variant="modal"
        onClose={handleClose}
        w={numberOfMonths > 1 ? Math.min(600, 320 * numberOfMonths + 40) : 350}
      >
        <View
          ref={focusTrapRef}
          style={{ padding: DESIGN_TOKENS.spacing.lg }}
          accessible={true}
          accessibilityLabel={
            type === 'range'
              ? 'Date range picker dialog'
              : type === 'multiple'
              ? 'Multiple date picker dialog'
              : 'Date picker dialog'
          }
        >
          <View style={{ alignItems: 'center' }}>{renderCalendar()}</View>

          {(type === 'multiple' || type === 'range') && (
            <View
              style={{
                paddingTop: DESIGN_TOKENS.spacing.lg,
                marginTop: DESIGN_TOKENS.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.gray[2],
              }}
            >
              <Flex direction="row" justify="space-between" align="center">
                <Text size="sm" style={{ color: theme.colors.gray[6] }}>
                  {type === 'range' && Array.isArray(currentValue) && currentValue.length === 2
                    ? `${formatValue(currentValue)}`
                    : type === 'multiple' && Array.isArray(currentValue)
                    ? `${currentValue.length} date${currentValue.length !== 1 ? 's' : ''} selected`
                    : 'Select dates'}
                </Text>
                <Flex direction="row" gap={8}>
                  <Pressable
                    onPress={() => setValue(type === 'range' ? [null, null] : [])}
                    style={({ pressed }) => ({
                      paddingHorizontal: DESIGN_TOKENS.spacing.lg,
                      paddingVertical: DESIGN_TOKENS.spacing.sm,
                      borderRadius: DESIGN_TOKENS.radius.sm,
                      backgroundColor: pressed ? theme.colors.gray[2] : theme.colors.gray[1],
                    })}
                  >
                    <Text size="sm" weight="medium" style={{ color: theme.colors.gray[7] }}>
                      Clear
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleClose}
                    style={({ pressed }) => ({
                      paddingHorizontal: DESIGN_TOKENS.spacing.xl,
                      paddingVertical: DESIGN_TOKENS.spacing.sm,
                      borderRadius: DESIGN_TOKENS.radius.sm,
                      backgroundColor: pressed ? theme.colors.primary[6] : theme.colors.primary[5],
                    })}
                  >
                    <Text size="sm" weight="semibold" style={{ color: 'white' }}>
                      Done
                    </Text>
                  </Pressable>
                </Flex>
              </Flex>
            </View>
          )}
        </View>
      </Dialog>
    </View>
  );
});

DatePickerInput.displayName = 'DatePickerInput';
