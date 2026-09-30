import React from 'react';
import { Pressable, StyleSheet, type View } from 'react-native';

import {
  a11yProps,
  factory,
  createThemedStyles,
  isWeb,
  useTheme,
  onColor,
  Text,
} from '@plocks/ui';
import type { PlocksTheme, SizeValue } from '@plocks/ui';
import { getCurrentPeriodStyles, getCurrentPeriodTextColor } from './currentPeriod';
import type { DayProps } from './types';
import { formatFullDate, getDaySize } from './utils';

/** Day number text size per cell size (one step above the cell's own token). */
const DAY_FONT_SIZE = {
  xs: 'sm',
  sm: 'md',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
  '2xl': 'lg',
  '3xl': 'lg',
} as const;

const dayFontSize = (size: SizeValue) =>
  typeof size === 'string' && size in DAY_FONT_SIZE ? DAY_FONT_SIZE[size as keyof typeof DAY_FONT_SIZE] : 'md';

const getDayStyles = createThemedStyles((theme: PlocksTheme, size: SizeValue) => {
  const daySize = getDaySize(theme, size);
  const half = daySize / 2;
  return StyleSheet.create({
    cell: { width: daySize, height: daySize, alignItems: 'center', justifyContent: 'center' },
    round: { borderRadius: half },
    rangeStart: { borderTopStartRadius: half, borderBottomStartRadius: half },
    rangeEnd: { borderTopEndRadius: half, borderBottomEndRadius: half },
    selected: { backgroundColor: theme.colors.primary[5] },
    // The range strip and its hover preview use the theme's selected-item fill,
    // which is readable under `text.primary` in both schemes.
    range: { backgroundColor: theme.backgrounds.selected },
    pressed: { opacity: 0.8 },
    text: { color: theme.text.primary },
    textSelected: { color: theme.text.onPrimary ?? onColor(theme, theme.colors.primary[5]) },
    textDisabled: { color: theme.text.disabled },
    textOutside: { color: theme.text.muted },
    textWeekend: { color: theme.text.secondary },
  });
});

const getRadiusStyle = (styles: ReturnType<typeof getDayStyles>, props: DayProps) => {
  const {
    selected,
    firstInRange,
    lastInRange,
    previewedFirstInRange,
    previewedLastInRange,
    today,
  } = props;
  // Logical corners, so a range strip caps on the correct side in RTL.
  if (previewedFirstInRange && !previewedLastInRange) return styles.rangeStart;
  if (previewedLastInRange && !previewedFirstInRange) return styles.rangeEnd;
  if (previewedFirstInRange && previewedLastInRange) return styles.round;
  if (firstInRange && !lastInRange) return styles.rangeStart;
  if (lastInRange && !firstInRange) return styles.rangeEnd;
  if (selected || (firstInRange && lastInRange)) return styles.round;
  // Keep the today ring circular when the day isn't part of a range strip.
  if (today) return styles.round;
  return null;
};

/**
 * One day cell of a month grid. Web: `role="gridcell"` (inside Month's
 * grid/row) with `aria-selected`, `aria-current="date"` for today and
 * `aria-disabled`; native: a button with the selected / disabled state. Its
 * accessible name is the full localized date ("Tuesday, March 3, 2026").
 */
export const Day = factory<{ props: DayProps; ref: View }>((props, ref) => {
  const {
    date,
    selected = false,
    inRange = false,
    previewed = false,
    previewedInRange = false,
    weekend = false,
    outside = false,
    today = false,
    disabled = false,
    // Consumed by getRadiusStyle (read from `props`).
    firstInRange: _firstInRange,
    lastInRange: _lastInRange,
    previewedFirstInRange: _previewedFirstInRange,
    previewedLastInRange: _previewedLastInRange,
    onPress,
    onHoverIn,
    onHoverOut,
    size = 'md',
    locale,
    style,
    children,
    ...rest
  } = props;
  const theme = useTheme();
  const styles = getDayStyles(theme, size);

  const fill = disabled
    ? null
    : selected
      ? styles.selected
      : inRange || previewed || previewedInRange
        ? styles.range
        : null;

  const textColor = disabled
    ? styles.textDisabled
    : selected
      ? styles.textSelected
      : outside
        ? styles.textOutside
        : weekend
          ? styles.textWeekend
          : null;
  const currentPeriod = { isCurrent: today && !disabled, isSelected: selected };
  const todayColor = !disabled && !outside && !weekend ? getCurrentPeriodTextColor(theme, currentPeriod) : undefined;

  const label = rest.accessibilityLabel ?? rest['aria-label'] ?? formatFullDate(date, locale);
  const radiusStyle = getRadiusStyle(styles, props);
  const currentPeriodStyle = getCurrentPeriodStyles(theme, currentPeriod);

  return (
    <Pressable
      ref={ref}
      {...a11yProps({
        role: isWeb ? 'gridcell' : 'button',
        label,
        selected,
        current: today ? 'date' : undefined,
        disabled,
      })}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      android_ripple={
        disabled ? undefined : { color: theme.backgrounds.pressed, borderless: false, radius: getDaySize(theme, size) / 2 }
      }
      {...rest}
      style={({ pressed }) => [
        styles.cell,
        fill,
        currentPeriodStyle,
        radiusStyle,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      {children || (
        <Text
          size={dayFontSize(size)}
          fw={today || selected ? 'semibold' : 'medium'}
          style={[styles.text, textColor, todayColor ? { color: todayColor } : null]}
        >
          {date.getDate()}
        </Text>
      )}
    </Pressable>
  );
}, { displayName: 'Day' });
