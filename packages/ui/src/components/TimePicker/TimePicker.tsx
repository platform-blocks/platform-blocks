import React, { useCallback, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { resolveFontSize, resolveSpacing } from '../../core/theme/tokens';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
// NOTE: Using direct relative imports to avoid barrel (index.ts) circular dependency
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

const MERIDIEM_ITEMS = [
  { value: 'am', label: 'AM' },
  { value: 'pm', label: 'PM' },
] as const;

/**
 * Inline time selection: one wheel per column (hour, minute, optional second
 * and AM/PM). Each wheel is an adjustable control named by its column; the
 * visible column captions are hidden from assistive technology so they aren't
 * read twice.
 */
export const TimePicker = factory<{ props: TimePickerProps; ref: View }>(
  function TimePicker(props, ref) {
    const {
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
      accessibilityLabel = 'Time',
      style,
      testID,
    } = props;

    const spacingStyles = useStyleProps(props);
    const is12h = format === 12;
    const onChangeLatest = useLatestCallback(onChange);
    const onChangeCompleteLatest = useLatestCallback(onChangeComplete);

    const [current, setCurrent] = useControllableState<TimePickerValue>({
      // `null` is "no time": the panel shows its default position.
      value: value === undefined ? undefined : buildTimeValue(format, withSeconds, value),
      defaultValue: () => buildTimeValue(format, withSeconds, defaultValue ?? null),
      onChange: (next: TimePickerValue) => onChangeLatest(next),
    });

    // Columns can fire in quick succession before a controlled parent re-renders;
    // merge each pick into the latest known value, not the last rendered one.
    const latestRef = useRef(current);
    latestRef.current = current;

    const commit = useCallback(
      (next: Partial<TimePickerValue>) => {
        if (disabled) return;
        const merged: TimePickerValue = { ...latestRef.current, ...next };
        latestRef.current = merged;
        setCurrent(merged);
      },
      [disabled, setCurrent]
    );

    const complete = useCallback(
      (next: Partial<TimePickerValue>) => {
        if (disabled) return;
        onChangeCompleteLatest({ ...latestRef.current, ...next });
      },
      [disabled, onChangeCompleteLatest]
    );

    const hourItems = useMemo(() => {
      const hours = is12h ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i);
      return hours.map((item) => ({ value: item, label: pad(item) }));
    }, [is12h]);
    const minuteItems = useMemo(
      () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep).map((item) => ({ value: item, label: pad(item) })),
      [minuteStep]
    );
    const secondItems = useMemo(
      () => Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => i * secondStep).map((item) => ({ value: item, label: pad(item) })),
      [secondStep]
    );

    const setMeridiem = (pm: boolean) => {
      if (!is12h) return;
      const hours = latestRef.current.hours;
      if (hours >= 12 === pm) return;
      commit({ hours: (hours + 12) % 24 });
    };

    const setHourDisplay = (hDisplay: number) => {
      let hour24 = hDisplay;
      if (is12h) {
        const currentIsPM = latestRef.current.hours >= 12;
        if (hDisplay === 12) hour24 = currentIsPM ? 12 : 0;
        else hour24 = currentIsPM ? hDisplay + 12 : hDisplay;
      }
      commit({ hours: hour24 });
    };

    const styles = useThemedStyles(
      (theme) => ({
        root: { opacity: disabled ? 0.5 : 1 } as ViewStyle,
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: resolveSpacing(theme, 'xs') as number,
        } as ViewStyle,
        column: { width: columnWidth, alignItems: 'center' } as ViewStyle,
        caption: {
          marginBottom: resolveSpacing(theme, 'sm') as number,
          textAlign: 'center',
          fontSize: resolveFontSize(theme, 'sm'),
          fontWeight: '500',
          fontFamily: theme.fontFamily,
          color: theme.text.secondary,
        } as TextStyle,
      }),
      [disabled, columnWidth]
    );

    // Visible captions: the wheels carry the same name as their accessible label.
    const renderCaption = (caption: string) => (
      <Text
        style={styles.caption}
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {caption}
      </Text>
    );

    return (
      <View
        ref={ref}
        style={[styles.root, spacingStyles, style]}
        testID={testID}
        {...a11yProps({ role: 'group', label: accessibilityLabel })}
      >
        <View style={styles.row}>
          <View style={styles.column}>
            {renderCaption('Hour')}
            <Wheel
              label="Hour"
              items={hourItems}
              value={is12h ? ((current.hours + 11) % 12) + 1 : current.hours}
              onChange={setHourDisplay}
              w={columnWidth}
              h={columnHeight}
              disabled={disabled}
            />
          </View>

          <View style={styles.column}>
            {renderCaption('Minute')}
            <Wheel
              label="Minute"
              items={minuteItems}
              value={current.minutes}
              onChange={(minutes) => commit({ minutes })}
              onChangeComplete={withSeconds ? undefined : (minutes) => complete({ minutes })}
              w={columnWidth}
              h={columnHeight}
              disabled={disabled}
            />
          </View>

          {withSeconds && (
            <View style={styles.column}>
              {renderCaption('Second')}
              <Wheel
                label="Second"
                items={secondItems}
                value={current.seconds ?? 0}
                onChange={(seconds) => commit({ seconds })}
                onChangeComplete={(seconds) => complete({ seconds })}
                w={columnWidth}
                h={columnHeight}
                disabled={disabled}
              />
            </View>
          )}

          {is12h && (
            <View style={styles.column}>
              {renderCaption('Period')}
              <Wheel
                label="Period"
                items={MERIDIEM_ITEMS}
                value={current.hours < 12 ? 'am' : 'pm'}
                onChange={(period) => setMeridiem(period === 'pm')}
                w={columnWidth}
                h={columnHeight}
                disabled={disabled}
              />
            </View>
          )}
        </View>
      </View>
    );
  },
  { displayName: 'TimePicker' }
);
