import React, { useCallback, useMemo, useState } from 'react';

import { factory } from '../../core/factory/factory';
import { useControllableState } from '../../hooks/useControllableState';
import { PickerField } from '../DatePickerInput/PickerField';
import { MonthPicker } from '../MonthPicker';
import type { MonthPickerInputHandle, MonthPickerInputProps } from './types';

const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric',
};

/**
 * A form field that opens a month grid in a sheet (or a desktop dropdown with
 * `dropdownType="popover"`). The field is a button announcing its label and
 * the chosen month.
 */
export const MonthPickerInput = factory<{ props: MonthPickerInputProps; ref: MonthPickerInputHandle }>(
  function MonthPickerInput(props, ref) {
    const {
      value,
      defaultValue,
      onChange,
      locale = 'en-US',
      formatOptions,
      formatValue,
      placeholder = 'Select month',
      clearable = false,
      closeOnSelect = true,
      monthPickerProps,
      modalTitle = 'Select month',
      dropdownType = 'modal',
      size = 'md',
      onOpen,
      onClose,
      ...fieldProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [selectedValue, setValue] = useControllableState<Date | null>({
      value,
      defaultValue: defaultValue ?? null,
      finalValue: null,
      onChange,
    });
    const currentValue = selectedValue ?? null;

    const formatter = useMemo(() => {
      if (typeof formatValue === 'function') return formatValue;
      const intl = new Intl.DateTimeFormat(locale, formatOptions ?? DEFAULT_FORMAT_OPTIONS);
      return (date: Date) => intl.format(date);
    }, [formatValue, formatOptions, locale]);

    const open = useCallback(() => {
      setOpened(true);
      onOpen?.();
    }, [onOpen]);

    const close = useCallback(() => {
      setOpened(false);
      onClose?.();
    }, [onClose]);

    const { onChange: monthPickerOnChange, ...restMonthPickerProps } = monthPickerProps ?? {};

    const handleMonthChange = useCallback(
      (next: Date | null) => {
        setValue(next);
        monthPickerOnChange?.(next ?? null);
        if (closeOnSelect && next) close();
      },
      [setValue, monthPickerOnChange, closeOnSelect, close]
    );

    const clearValue = useCallback(() => setValue(null), [setValue]);
    const displayValue = currentValue ? formatter(currentValue) : '';

    return (
      <PickerField
        {...fieldProps}
        handleRef={ref}
        size={size}
        placeholder={placeholder}
        clearable={clearable}
        displayValue={displayValue}
        hasValue={!!currentValue}
        opened={opened}
        onOpenRequest={open}
        onCloseRequest={close}
        onClearValue={clearValue}
        dropdownType={dropdownType}
        panelTitle={modalTitle}
        panelWidth={360}
        icon="calendar"
      >
        <MonthPicker
          {...restMonthPickerProps}
          value={currentValue}
          onChange={handleMonthChange}
          locale={restMonthPickerProps.locale ?? locale}
          size={restMonthPickerProps.size ?? size}
        />
      </PickerField>
    );
  },
  { displayName: 'MonthPickerInput' }
);
