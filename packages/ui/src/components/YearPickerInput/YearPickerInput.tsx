import React, { useCallback, useState } from 'react';

import { factory } from '../../core/factory/factory';
import { useControllableState } from '../../hooks/useControllableState';
import { PickerField } from '../DatePickerInput/PickerField';
import { YearPicker } from '../YearPicker';
import type { YearPickerInputHandle, YearPickerInputProps } from './types';

const defaultFormat = (date: Date) => date.getFullYear().toString();

/**
 * A form field that opens a year grid in a sheet (or a desktop dropdown with
 * `dropdownType="popover"`). The field is a button announcing its label and
 * the chosen year.
 */
export const YearPickerInput = factory<{ props: YearPickerInputProps; ref: YearPickerInputHandle }>(
  function YearPickerInput(props, ref) {
    const {
      value,
      defaultValue,
      onChange,
      formatValue = defaultFormat,
      placeholder = 'Select year',
      clearable = false,
      closeOnSelect = true,
      yearPickerProps,
      modalTitle = 'Select year',
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

    const open = useCallback(() => {
      setOpened(true);
      onOpen?.();
    }, [onOpen]);

    const close = useCallback(() => {
      setOpened(false);
      onClose?.();
    }, [onClose]);

    const { onChange: yearPickerOnChange, ...restYearPickerProps } = yearPickerProps ?? {};

    const handleYearChange = useCallback(
      (next: Date | null) => {
        setValue(next);
        yearPickerOnChange?.(next ?? null);
        if (closeOnSelect && next) close();
      },
      [setValue, yearPickerOnChange, closeOnSelect, close]
    );

    const clearValue = useCallback(() => setValue(null), [setValue]);
    const displayValue = currentValue ? formatValue(currentValue) : '';

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
        <YearPicker
          {...restYearPickerProps}
          value={currentValue}
          onChange={handleYearChange}
          size={restYearPickerProps.size ?? size}
        />
      </PickerField>
    );
  },
  { displayName: 'YearPickerInput' }
);
