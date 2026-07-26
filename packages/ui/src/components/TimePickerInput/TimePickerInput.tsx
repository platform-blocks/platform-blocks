import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useMergedRef } from '../../core/utils';
// NOTE: Using direct relative imports to avoid barrel (index.ts) circular dependency
import { Text } from '../Text';
import { Input } from '../Input';
import { Dialog } from '../Dialog';
import { Flex } from '../Flex';
import { Icon } from '../Icon';
import { useTheme } from '../../core/theme';
import { TimePicker, buildTimeValue } from '../TimePicker/TimePicker';
import type { TimePickerValue } from '../TimePicker/types';
import type { TimePickerInputProps } from './types';

const pad = (n: number) => n.toString().padStart(2, '0');

export const TimePickerInput = React.forwardRef<View, TimePickerInputProps>(({
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
  inputWidth,
  disabled,
  size = 'md',
  label = 'Time',
  error,
  helperText,
  style,
  onOpen,
  onClose,
  title,
  autoClose = false,
  fullWidth,
  clearable = false,
  clearButtonLabel = 'Clear time',
  description,
  labelProps,
  descriptionProps,
  placeholderTextColor,
  startSectionProps,
  endSectionProps,
}, ref) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<TimePickerValue>(() =>
    buildTimeValue(format, withSeconds, value ?? defaultValue ?? null)
  );
  const [hasValue, setHasValue] = useState<boolean>(() => (value ?? defaultValue) != null);
  const containerRef = React.useRef<View | null>(null);
  const is12h = format === 12;

  useEffect(() => {
    if (!isControlled) return;

    if (value) {
      setInternal(buildTimeValue(format, withSeconds, value));
      setHasValue(true);
    } else if (value === null) {
      setHasValue(false);
    }
  }, [isControlled, value?.hours, value?.minutes, value?.seconds, value, format, withSeconds]);

  const display = useMemo(() => {
    if (!hasValue) return '';
    const source = (isControlled ? value : internal) ?? internal;
    const displayHours = is12h ? ((source.hours + 11) % 12) + 1 : source.hours;
    const base = `${pad(displayHours)}:${pad(source.minutes)}${
      withSeconds ? ':' + pad(source.seconds ?? 0) : ''
    }`;
    const suffix = is12h ? (source.hours >= 12 ? ' PM' : ' AM') : '';
    return base + suffix;
  }, [hasValue, isControlled, value?.hours, value?.minutes, value?.seconds, internal, is12h, withSeconds]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    onOpen?.();
  }, [disabled, onOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  const commit = useCallback(
    (next: TimePickerValue) => {
      setInternal(next);
      setHasValue(true);
      onChange?.(next);
    },
    [onChange]
  );

  const clearValue = useCallback(() => {
    if (disabled) return;

    const fallback = buildTimeValue(format, withSeconds, defaultValue ?? null);
    setInternal(fallback);
    setHasValue(false);
    onChange?.(null);
  }, [defaultValue, disabled, format, onChange, withSeconds]);

  const containerStyles = { position: 'relative' as const };

  const computedPanelWidth: number | string =
    panelWidth !== undefined
      ? panelWidth
      : (() => {
          const cols = withSeconds ? 3 : 2;
          const meridiemWidth = format === 12 ? columnWidth : 0;
          const padding = 48;
          return cols * columnWidth + meridiemWidth + padding;
        })();

  return (
    <View
      ref={useMergedRef<View>(containerRef, ref) as any}
      style={[containerStyles, inputWidth != null ? { width: inputWidth } : null, style]}
    >
      <Pressable onPress={handleOpen} disabled={disabled} {...(Platform.OS === 'web' ? { role: 'group' as any } : { accessibilityRole: 'button' })}>
        <Input
          value={display}
          onChangeText={(text) => {
            if (!allowInput) return;
            const trimmed = text.trim();

            if (trimmed.length === 0) {
              clearValue();
              return;
            }

            const match = trimmed.match(
              /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/
            );
            if (match) {
              let h = parseInt(match[1], 10);
              const m = parseInt(match[2], 10);
              const s = match[3] ? parseInt(match[3], 10) : internal.seconds ?? 0;
              if (is12h) {
                const mer = match[4]?.toLowerCase();
                if (mer === 'pm' && h < 12) h += 12;
                if (mer === 'am' && h === 12) h = 0;
              }
              if (h >= 0 && h < 24 && m < 60 && s < 60) {
                commit({ hours: h, minutes: m, ...(withSeconds ? { seconds: s } : {}) });
              }
            }
          }}
          label={label}
          description={description}
          placeholder={is12h ? 'hh:mm AM' : 'hh:mm'}
          endSection={
            <Icon name="clock" size={16} color={disabled ? theme.text.disabled : theme.text.muted} />
          }
          disabled={disabled}
          error={error}
          helperText={helperText}
          size={size}
          fullWidth={fullWidth}
          clearable={clearable && hasValue}
          clearButtonLabel={clearButtonLabel}
          onClear={clearValue}
          labelProps={labelProps}
          descriptionProps={descriptionProps}
          placeholderTextColor={placeholderTextColor}
          startSectionProps={startSectionProps}
          endSectionProps={endSectionProps}
        />
      </Pressable>

      <Dialog
        visible={open}
        onClose={handleClose}
        w={typeof computedPanelWidth === 'number' ? computedPanelWidth : 360}
        title={title || 'Select Time'}
      >
        <Pressable
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TimePicker
            value={internal}
            onChange={commit}
            onChangeComplete={autoClose ? handleClose : undefined}
            format={format}
            withSeconds={withSeconds}
            minuteStep={minuteStep}
            secondStep={secondStep}
            columnWidth={columnWidth}
            disabled={disabled}
          />

          {!autoClose && (
            <View
              style={{
                paddingHorizontal: 20,
                paddingBottom: 20,
                borderTopWidth: 1,
                borderTopColor: theme.colors.gray[2],
              }}
            >
              <Flex direction="row" justify="flex-end" gap={12} style={{ paddingTop: 16 }}>
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => ({
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: pressed
                      ? theme.colors.primary[6]
                      : theme.colors.primary[5],
                    minWidth: 80,
                    alignItems: 'center',
                  })}
                >
                  <Text size="md" weight="semibold" style={{ color: 'white' }}>
                    Done
                  </Text>
                </Pressable>
              </Flex>
            </View>
          )}
        </Pressable>
      </Dialog>
    </View>
  );
});

TimePickerInput.displayName = 'TimePickerInput';
