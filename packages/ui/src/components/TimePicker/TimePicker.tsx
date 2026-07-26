import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Pressable, FlatList, ViewStyle } from 'react-native';
// NOTE: Using direct relative imports to avoid barrel (index.ts) circular dependency
import { Text } from '../Text';
import { Flex } from '../Flex';
import { useTheme } from '../../core/theme';
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
  const theme = useTheme();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<TimePickerValue>(() =>
    buildTimeValue(format, withSeconds, value ?? defaultValue ?? null)
  );
  const is12h = format === 12;

  useEffect(() => {
    if (!isControlled || !value) return;
    setInternal(buildTimeValue(format, withSeconds, value));
  }, [isControlled, value?.hours, value?.minutes, value?.seconds, value, format, withSeconds]);

  const commit = useCallback(
    (next: Partial<TimePickerValue>, isFinalColumn = false) => {
      if (disabled) return;
      setInternal((prev) => {
        const merged: TimePickerValue = { ...prev, ...next };
        onChange?.(merged);
        if (isFinalColumn) {
          onChangeComplete?.(merged);
        }
        return merged;
      });
    },
    [disabled, onChange, onChangeComplete]
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

  const listCommon: ViewStyle = {
    maxHeight: columnHeight,
    width: '100%',
  };

  const columnListStyle = [
    listCommon,
    { borderRadius: 12, backgroundColor: theme.colors.gray[1] },
  ];

  const renderPill = (
    key: React.Key,
    label: string,
    active: boolean,
    onPress: () => void
  ) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: active
          ? theme.colors.primary[5]
          : pressed
          ? theme.colors.gray[2]
          : 'transparent',
        marginVertical: 2,
        marginHorizontal: 4,
        minWidth: 48,
        alignItems: 'center',
      })}
    >
      <Text
        size="md"
        weight={active ? 'semibold' : 'medium'}
        style={{
          color: active ? 'white' : theme.colors.gray[8],
          fontSize: 16,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderNumber = (n: number, active: boolean, onPress: () => void) =>
    renderPill(n, pad(n), active, onPress);

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
          <FlatList
            data={hoursOptions}
            keyExtractor={(item) => 'h-' + item}
            renderItem={({ item }) =>
              renderNumber(
                item,
                (is12h ? ((internal.hours + 11) % 12) + 1 : internal.hours) === item,
                () => setHourDisplay(item)
              )
            }
            style={columnListStyle}
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={{ width: columnWidth, alignItems: 'center' }}>
          {renderColumnLabel('Minute')}
          <FlatList
            data={minuteOptions}
            keyExtractor={(item) => 'm-' + item}
            renderItem={({ item }) =>
              renderNumber(item, internal.minutes === item, () =>
                commit({ minutes: item }, !withSeconds)
              )
            }
            style={columnListStyle}
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {withSeconds && (
          <View style={{ width: columnWidth, alignItems: 'center' }}>
            {renderColumnLabel('Second')}
            <FlatList
              data={secondOptions}
              keyExtractor={(item) => 's-' + item}
              renderItem={({ item }) =>
                renderNumber(item, (internal.seconds ?? 0) === item, () =>
                  commit({ seconds: item }, true)
                )
              }
              style={columnListStyle}
              contentContainerStyle={{ paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {is12h && (
          <View style={{ alignItems: 'center' }}>
            {renderColumnLabel('Period')}
            <Flex
              direction="column"
              align="center"
              justify="center"
              style={{
                height: columnHeight,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: theme.colors.gray[1],
              }}
            >
              {renderPill('am', 'AM', internal.hours < 12, () => setMeridiem(false))}
              {renderPill('pm', 'PM', internal.hours >= 12, () => setMeridiem(true))}
            </Flex>
          </View>
        )}
      </Flex>
    </View>
  );
});

TimePicker.displayName = 'TimePicker';
