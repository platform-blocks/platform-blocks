import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { TextInput, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isNative, webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { FieldHandle } from '../../core/types/base';
import { useControllableState } from '../../hooks/useControllableState';
import { DropdownSheet } from '../_internal/DropdownSheet/DropdownSheet';
import { PickerActions } from '../DatePickerInput/PickerActions';
import { PickerField } from '../DatePickerInput/PickerField';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { TimePicker, buildTimeValue } from '../TimePicker/TimePicker';
import type { TimePickerValue } from '../TimePicker/types';
import type { TimePickerInputHandle, TimePickerInputProps } from './types';

const pad = (n: number) => n.toString().padStart(2, '0');
const TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/;

/** Parses typed text: a time, `null` for empty text, `undefined` when it isn't a (complete) time. */
function parseTime(text: string, is12h: boolean, withSeconds: boolean): TimePickerValue | null | undefined {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = trimmed.match(TIME_PATTERN);
  if (!match) return undefined;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const meridiem = match[4]?.toLowerCase();
  if (is12h && meridiem) {
    if (hours < 1 || hours > 12) return undefined;
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
  }
  if (hours > 23 || minutes > 59 || seconds > 59) return undefined;
  return { hours, minutes, ...(withSeconds ? { seconds } : {}) };
}

/**
 * A time field. With `allowInput` (default) it is a text field that accepts a
 * typed time, with a clock button opening the wheel panel in a sheet; without
 * it the whole field is a button opening the panel.
 */
export const TimePickerInput = factory<{ props: TimePickerInputProps; ref: TimePickerInputHandle }>(
  function TimePickerInput(props, ref) {
    const {
      value,
      defaultValue,
      onChange,
      format = 24,
      withSeconds = false,
      allowInput = true,
      minuteStep = 5,
      secondStep = 5,
      panelWidth,
      columnWidth = 88,
      onOpen,
      onClose,
      title = 'Select time',
      autoClose = false,
      pickerButtonLabel = 'Choose time',
      label = 'Time',
      clearable = false,
      clearButtonLabel = 'Clear time',
      placeholder,
      disabled = false,
      readOnly = false,
      size = 'md',
      style,
      ...fieldProps
    } = props;

    const theme = useTheme();
    const is12h = format === 12;
    const onChangeLatest = useLatestCallback(onChange);

    const [current, setCurrent] = useControllableState<TimePickerValue | null>({
      value,
      defaultValue: defaultValue ?? null,
      finalValue: null,
      onChange: (next: TimePickerValue | null) => onChangeLatest(next),
    });
    const [opened, setOpened] = useState(false);
    // Text being typed; `null` shows the formatted value.
    const [draft, setDraft] = useState<string | null>(null);
    const inputRef = useRef<TextInput | null>(null);
    const handleRef = useRef<FieldHandle | null>(null);

    const display = useMemo(() => {
      if (!current) return '';
      const hours = is12h ? ((current.hours + 11) % 12) + 1 : current.hours;
      const base = `${pad(hours)}:${pad(current.minutes)}${withSeconds ? `:${pad(current.seconds ?? 0)}` : ''}`;
      return is12h ? `${base} ${current.hours >= 12 ? 'PM' : 'AM'}` : base;
    }, [current, is12h, withSeconds]);

    const open = useCallback(() => {
      if (disabled || readOnly) return;
      setOpened(true);
      onOpen?.();
    }, [disabled, readOnly, onOpen]);

    const close = useCallback(() => {
      setOpened(false);
      onClose?.();
    }, [onClose]);

    const commit = useCallback((next: TimePickerValue) => setCurrent(next), [setCurrent]);

    const clearValue = useCallback(() => {
      if (disabled) return;
      setDraft(null);
      setCurrent(null);
    }, [disabled, setCurrent]);

    const handleChangeText = useCallback(
      (text: string) => {
        setDraft(text);
        const parsed = parseTime(text, is12h, withSeconds);
        if (parsed === null) setCurrent(null);
        else if (parsed) setCurrent(parsed);
      },
      [is12h, withSeconds, setCurrent]
    );

    // Leaving the field shows the committed value (an incomplete entry reverts).
    const settleDraft = useCallback(() => setDraft(null), []);

    useImperativeHandle(
      ref,
      (): FieldHandle => ({
        focus: () => (allowInput ? inputRef.current?.focus() : handleRef.current?.focus()),
        blur: () => (allowInput ? inputRef.current?.blur() : handleRef.current?.blur()),
        clear: clearValue,
        isFocused: () => (allowInput ? !!inputRef.current?.isFocused?.() : !!handleRef.current?.isFocused?.()),
      }),
      [allowInput, clearValue]
    );

    const panel = (
      <View style={PANEL}>
        <TimePicker
          value={current ?? buildTimeValue(format, withSeconds, defaultValue ?? null)}
          onChange={commit}
          onChangeComplete={autoClose ? close : undefined}
          format={format}
          withSeconds={withSeconds}
          minuteStep={minuteStep}
          secondStep={secondStep}
          columnWidth={columnWidth}
          disabled={disabled || readOnly}
          accessibilityLabel={title}
        />
        {!autoClose ? <PickerActions onDone={close} /> : null}
      </View>
    );

    const computedPanelWidth =
      panelWidth ?? (withSeconds ? 3 : 2) * columnWidth + (is12h ? columnWidth : 0) + 48;
    if (!allowInput) {
      return (
        <PickerField
          {...fieldProps}
          handleRef={handleRef}
          label={label}
          placeholder={placeholder ?? (is12h ? 'hh:mm AM' : 'hh:mm')}
          disabled={disabled}
          readOnly={readOnly}
          size={size}
          clearable={clearable}
          clearButtonLabel={clearButtonLabel}
          style={style}
          displayValue={display}
          hasValue={!!current}
          opened={opened}
          onOpenRequest={open}
          onCloseRequest={close}
          onClearValue={clearValue}
          dropdownType="modal"
          panelTitle={title}
          panelWidth={computedPanelWidth}
          icon="clock"
        >
          {panel}
        </PickerField>
      );
    }

    const iconSize = getControlSize(theme, size).iconSize;
    const pickerButton = (
      <Pressable
        onPress={open}
        disabled={disabled || readOnly}
        {...a11yProps({
          role: 'button',
          label: pickerButtonLabel,
          hasPopup: 'dialog',
          expanded: opened,
          disabled: disabled || readOnly,
        })}
        hitSlop={isNative ? 10 : undefined}
        style={[PICKER_BUTTON, webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' })]}
        testID={fieldProps.testID ? `${fieldProps.testID}-picker-button` : undefined}
      >
        <Icon name="clock" size={iconSize} color={disabled ? theme.text.disabled : theme.text.muted} decorative />
      </Pressable>
    );

    return (
      <View style={style}>
        <Input
          {...fieldProps}
          ref={inputRef}
          label={label}
          value={draft ?? display}
          onChangeText={handleChangeText}
          onBlur={() => {
            settleDraft();
            fieldProps.onBlur?.();
          }}
          onEnter={settleDraft}
          placeholder={placeholder ?? (is12h ? 'hh:mm AM' : 'hh:mm')}
          disabled={disabled}
          readOnly={readOnly}
          size={size}
          clearable={clearable && !!current}
          clearButtonLabel={clearButtonLabel}
          onClear={() => {
            clearValue();
            fieldProps.onClear?.();
          }}
          endSection={fieldProps.endSection ?? pickerButton}
        />
        <DropdownSheet
          opened={opened}
          onClose={close}
          title={title}
          withCloseButton
          maxWidth={computedPanelWidth}
          testID={fieldProps.testID ? `${fieldProps.testID}-sheet` : undefined}
        >
          {panel}
        </DropdownSheet>
      </View>
    );
  },
  { displayName: 'TimePickerInput' }
);

const PANEL: ViewStyle = { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 };
const PICKER_BUTTON: ViewStyle = {
  minWidth: 24,
  minHeight: 24,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
};
