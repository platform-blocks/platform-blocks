import React, { useCallback, useMemo, useState, forwardRef } from 'react';
import { View, Pressable, Keyboard } from 'react-native';
import { Input } from '../Input';
import { Icon } from '../Icon';
import { Dialog } from '../Dialog';
import { YearPicker } from '../YearPicker';
import { DESIGN_TOKENS } from '../../core';
import type { YearPickerInputProps } from './types';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';
import { useControllableState } from '../../hooks/useControllableState';

const defaultFormat = (date: Date) => date.getFullYear().toString();

export const YearPickerInput = forwardRef<View, YearPickerInputProps>(function YearPickerInput(
  {
    value,
    defaultValue,
    onChange,
    formatValue,
    placeholder = 'Select year',
    clearable = false,
    closeOnSelect = true,
    yearPickerProps,
    modalTitle = 'Select year',
    size = 'md',
    disabled = false,
    withAsterisk,
    onOpen,
    onClose,
    ...inputProps
  },
  ref
) {
  const [opened, setOpened] = useState(false);
  const [selectedValue, setValue] = useControllableState<Date | null>({
    value,
    defaultValue: defaultValue ?? null,
    finalValue: null,
    onChange,
  });
  const currentValue = selectedValue ?? null;
  const keyboardManager = useKeyboardManagerOptional();

  const {
    required = false,
    endSection,
    onFocus,
    onBlur,
    style,
    ...restInputProps
  } = inputProps;

  const inputClearable = (inputProps as { clearable?: boolean }).clearable;
  const inputOnClear = (inputProps as { onClear?: () => void }).onClear;

  const format = useMemo(() => formatValue ?? defaultFormat, [formatValue]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    if (keyboardManager) {
      keyboardManager.dismissKeyboard();
    } else {
      Keyboard.dismiss();
    }
    setOpened(true);
    onFocus?.();
    onOpen?.();
  }, [disabled, onFocus, onOpen, keyboardManager]);

  const handleClose = useCallback(() => {
    setOpened(false);
    onBlur?.();
    onClose?.();
  }, [onBlur, onClose]);

  const handleClear = useCallback(() => {
    setValue(null);
    inputOnClear?.();
  }, [inputOnClear, setValue]);

  const { onChange: yearPickerOnChange, ...restYearPickerProps } = yearPickerProps ?? {};

  const handleYearChange = useCallback(
    (next: Date | null) => {
      setValue(next);
      yearPickerOnChange?.(next ?? null);
      if (closeOnSelect && next) {
        handleClose();
      }
    },
    [closeOnSelect, handleClose, setValue, yearPickerOnChange]
  );

  const inputValue = currentValue ? format(currentValue) : '';
  const shouldShowClear = (clearable || inputClearable) && !!currentValue;
  const showAsterisk = withAsterisk ?? required;
  const resolvedSize = restYearPickerProps.size ?? size;

  return (
    <View ref={ref}>
      <Pressable
        onPress={handleOpen}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={inputValue || placeholder}
        accessibilityHint="Opens year picker"
        accessibilityState={{ disabled }}
        style={{ width: '100%' }}
      >
        <Input
          {...restInputProps}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          required={required}
          withAsterisk={showAsterisk}
          clearable={shouldShowClear}
          onClear={shouldShowClear ? handleClear : undefined}
          endSection={endSection ?? <Icon name="calendar" size={16} />}
          onFocus={onFocus}
          onBlur={onBlur}
          style={style}
          textInputProps={{
            editable: false,
            pointerEvents: 'none',
            accessible: false,
            focusable: false,
          }}
        />
      </Pressable>

      <Dialog
        visible={opened}
        variant="modal"
        onClose={handleClose}
        title={modalTitle}
        w={360}
      >
        <View
          style={{
            padding: DESIGN_TOKENS.spacing.lg,
          }}
        >
          <YearPicker
            {...restYearPickerProps}
            value={currentValue}
            onChange={handleYearChange}
            size={resolvedSize}
          />
        </View>
      </Dialog>
    </View>
  );
});

YearPickerInput.displayName = 'YearPickerInput';
