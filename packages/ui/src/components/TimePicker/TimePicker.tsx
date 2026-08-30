import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
// NOTE: Using direct relative imports to avoid barrel (index.ts) circular dependency
import { Text } from '../Text';
import { Flex } from '../Flex';
import { Wheel } from '../Wheel';
import type { TimePickerProps, TimePickerValue } from './types';

const pad = (n: number) => n.toString().padStart(2, '0');

export const buildTimeValue = (
  format: 12 | 24,
  withSeconds: boolean,
  source?: TimePickerValue | null
): TimePickerValue => {
  if (source) {
    return {
      hours: source.hours,
      minutes: source.minutes,
      ...(withSeconds ? { seconds: source.seconds ?? 0 } : {}),
    };
  }

  return {
    hours: format === 12 ? 12 : 0,
    minutes: 0,
    ...(withSeconds ? { seconds: 0 } : {}),
  };
};

export const TimePicker = React.forwardRef<View, TimePickerProps>(({
  value,
  defaultValue,
  onChange,
  onChangeComplete,
  format = 24,
  withSeconds = false,
  minuteStep = 5,
  secondStep = 5,
  columnWidth = 88,
  columnHeight = 200,
  disabled = false,
  style,
}, ref) => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<TimePickerValue>(() =>
    buildTimeValue(format, withSeconds, value ?? defaultValue ?? null)
  );
  const internalRef = useRef(internal);
  const is12h = format === 12;

  useEffect(() => {
    if (!isControlled || !value) return;
    const nextInternal = buildTimeValue(format, withSeconds, value);
    internalRef.current = nextInternal;
    setInternal(nextInternal);
  }, [isControlled, value?.hours, value?.minutes, value?.seconds, value, format, withSeconds]);

  const commit = useCallback(
    (next: Partial<TimePickerValue>) => {
      if (disabled) return;
      const merged: TimePickerValue = { ...internalRef.current, ...next };
      internalRef.current = merged;
      setInternal(merged);
      onChange?.(merged);
    },
    [disabled, onChange]
  );

  const complete = useCallback(
    (next: Partial<TimePickerValue>) => {
      if (disabled) return;
      onChangeComplete?.({ ...internalRef.current, ...next });
    },
    [disabled, onChangeComplete]
  );

  const hoursOptions = useMemo(() => {
    if (is12h) return Array.from({ length: 12 }, (_, i) => i + 1);
    return Array.from({ length: 24 }, (_, i) => i);
  }, [is12h]);
  const minuteOptions = useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep]
  );
  const secondOptions = useMemo(
    () => Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => i * secondStep),
    [secondStep]
  );

  const setMeridiem = (pm: boolean) => {
    if (!is12h) return;
    if (internal.hours >= 12 === pm) return;
    commit({ hours: (internal.hours + 12) % 24 });
  };

  const setHourDisplay = (hDisplay: number) => {
    let hour24 = hDisplay;
    if (is12h) {
      const currentIsPM = internal.hours >= 12;
      if (hDisplay === 12) hour24 = currentIsPM ? 12 : 0;
      else hour24 = currentIsPM ? hDisplay + 12 : hDisplay;
    }
    commit({ hours: hour24 });
  };

  const renderColumnLabel = (label: string) => (
    <Text size="sm" weight="medium" style={{ marginBottom: 12, textAlign: 'center' }}>
      {label}
    </Text>
  );

  return (
    <View ref={ref} style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
      <Flex direction="row" gap={6} align="flex-start" justify="center">
        <View style={{ width: columnWidth, alignItems: 'center' }}>
          {renderColumnLabel('Hour')}
          <Wheel
            label="Hour"
            items={hoursOptions.map((item) => ({ value: item, label: pad(item) }))}
            value={is12h ? ((internal.hours + 11) % 12) + 1 : internal.hours}
            onValueChange={setHourDisplay}
            width={columnWidth}
            height={columnHeight}
            disabled={disabled}
          />
        </View>

        <View style={{ width: columnWidth, alignItems: 'center' }}>
          {renderColumnLabel('Minute')}
          <Wheel
            label="Minute"
            items={minuteOptions.map((item) => ({ value: item, label: pad(item) }))}
            value={internal.minutes}
            onValueChange={(minutes) => commit({ minutes })}
            onChangeComplete={withSeconds ? undefined : (minutes) => complete({ minutes })}
            width={columnWidth}
            height={columnHeight}
            disabled={disabled}
          />
        </View>

        {withSeconds && (
          <View style={{ width: columnWidth, alignItems: 'center' }}>
            {renderColumnLabel('Second')}
            <Wheel
              label="Second"
              items={secondOptions.map((item) => ({ value: item, label: pad(item) }))}
              value={internal.seconds ?? 0}
              onValueChange={(seconds) => commit({ seconds })}
              onChangeComplete={(seconds) => complete({ seconds })}
              width={columnWidth}
              height={columnHeight}
              disabled={disabled}
            />
          </View>
        )}

        {is12h && (
          <View style={{ width: columnWidth, alignItems: 'center' }}>
            {renderColumnLabel('Period')}
            <Wheel
              label="Period"
              items={[
                { value: 'am', label: 'AM' },
                { value: 'pm', label: 'PM' },
              ]}
              value={internal.hours < 12 ? 'am' : 'pm'}
              onValueChange={(period) => setMeridiem(period === 'pm')}
              width={columnWidth}
              height={columnHeight}
              disabled={disabled}
            />
          </View>
        )}
      </Flex>
    </View>
  );
});

TimePicker.displayName = 'TimePicker';
