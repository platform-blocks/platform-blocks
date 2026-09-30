import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  a11yProps,
  type A11yOptions,
  type A11yProps,
  consumeEvent,
  readKey,
  type KeyboardEventLike,
  useRovingFocus,
  factory,
  createThemedStyles,
  isWeb,
  webProps,
  useDirection,
  useTheme,
  getControlSize,
  onColor,
  resolveIconSize,
  resolveRadius,
  resolveSpacing,
  useStyleProps,
  useControllableState,
  Icon,
  Text,
} from '@plocks/ui';
import type { PlocksTheme, SizeValue } from '@plocks/ui';
import { getCurrentPeriodStyles, getCurrentPeriodTextColor } from '../Calendar/currentPeriod';
import type { DayProps, MiniCalendarProps } from '../Calendar/types';
import { dateUtils, formatFullDate, formatMonthYear } from '../Calendar/utils';

const NO_PROPS: A11yProps = Object.freeze({}) as A11yProps;
const webA11y = (opts: A11yOptions): A11yProps => (isWeb ? a11yProps(opts) : NO_PROPS);
const px = (value: number | 'auto'): number => (typeof value === 'number' ? value : 0);
/** Extra touch area around the 32px paging buttons (native; web ignores hitSlop). */
const NAV_HIT_SLOP = 6;
/** Smallest day button, so `xs` / `sm` strips stay tappable. */
const MIN_DAY_SIZE = 32;

const getMiniCalendarStyles = createThemedStyles((theme: PlocksTheme, size: SizeValue) => {
  const daySize = Math.max(MIN_DAY_SIZE, getControlSize(theme, size).height);
  return StyleSheet.create({
    root: { alignSelf: 'flex-start' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: px(resolveSpacing(theme, 'lg')),
    },
    navButton: { padding: px(resolveSpacing(theme, 'sm')), borderRadius: resolveRadius(theme, 'md') },
    pressed: { backgroundColor: theme.backgrounds.pressed },
    title: { color: theme.text.primary },
    scroll: { flexGrow: 0 },
    days: { flexDirection: 'row', gap: px(resolveSpacing(theme, 'xs')) },
    column: { alignItems: 'center' },
    weekday: {
      marginBottom: px(resolveSpacing(theme, 'sm')),
      color: theme.text.muted,
      textTransform: 'uppercase',
      fontWeight: '500',
      letterSpacing: 0.5,
    },
    weekdayCompact: { marginBottom: px(resolveSpacing(theme, 'xs')) },
    day: {
      width: daySize,
      height: daySize,
      borderRadius: resolveRadius(theme, 'full'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    selected: { backgroundColor: theme.colors.primary[5] },
    dimmed: { opacity: 0.5 },
    text: { color: theme.text.primary },
    textSelected: { color: theme.text.onPrimary ?? onColor(theme, theme.colors.primary[5]) },
    textDisabled: { color: theme.text.disabled },
    textWeekend: { color: theme.text.secondary },
  });
});

/** DayProps keys that describe Calendar day state; the rest are Pressable props. */
const stripDayState = ({
  date: _date,
  selected: _selected,
  inRange: _inRange,
  firstInRange: _firstInRange,
  lastInRange: _lastInRange,
  previewed: _previewed,
  previewedInRange: _previewedInRange,
  previewedFirstInRange: _previewedFirstInRange,
  previewedLastInRange: _previewedLastInRange,
  weekend: _weekend,
  outside: _outside,
  today: _today,
  size: _size,
  locale: _locale,
  children: _children,
  ...pressableProps
}: Partial<DayProps>) => pressableProps;

/**
 * A horizontal strip of `numberOfDays` days with prev/next paging. Web: a
 * one-row `grid` of `gridcell`s (arrow keys move by day and page at the ends);
 * native: labelled day buttons with selected / disabled state.
 */
export const MiniCalendar = factory<{ props: MiniCalendarProps; ref: View }>((props, ref) => {
  const {
    value,
    onChange,
    defaultValue,
    numberOfDays = 7,
    defaultDate,
    minDate,
    maxDate,
    nextControlProps,
    previousControlProps,
    getDayProps,
    renderDay,
    locale = 'en-US',
    size = 'md',
    style,
    testID,
  } = props;
  const theme = useTheme();
  const styles = getMiniCalendarStyles(theme, size);
  const spacingStyles = useStyleProps(props);
  const { isRTL } = useDirection();
  const iconSize = resolveIconSize(theme, 'sm');

  const [selectedValue, setSelectedDate] = useControllableState<Date | null>({
    value,
    defaultValue: defaultValue ?? null,
    finalValue: null,
    onChange,
  });
  const selectedDate = selectedValue ?? null;

  const centerOffset = Math.floor(numberOfDays / 2);

  const [viewStartDate, setViewStartDate] = useState<Date>(() => {
    const base = defaultDate ?? selectedDate ?? new Date();
    return selectedDate ? dateUtils.addDays(base, -centerOffset) : base;
  });

  // Follow the props during render (no effect round-trip): re-center on a newly
  // selected day; with nothing selected, show a changed `defaultDate`.
  const selectedKey = selectedDate ? dateUtils.startOfDay(selectedDate).getTime() : null;
  const defaultKey = defaultDate ? dateUtils.startOfDay(defaultDate).getTime() : null;
  const [synced, setSynced] = useState({ selectedKey, defaultKey });
  if (synced.selectedKey !== selectedKey || synced.defaultKey !== defaultKey) {
    setSynced({ selectedKey, defaultKey });
    if (selectedDate && synced.selectedKey !== selectedKey) {
      const centered = dateUtils.addDays(selectedDate, -centerOffset);
      if (!dateUtils.isSameDay(viewStartDate, centered)) setViewStartDate(centered);
    } else if (!selectedDate && defaultDate && !dateUtils.isSameDay(viewStartDate, defaultDate)) {
      setViewStartDate(defaultDate);
    }
  }

  const days = useMemo(
    () => dateUtils.getDaysInRange(viewStartDate, numberOfDays),
    [viewStartDate, numberOfDays],
  );

  const weekdayNames = useMemo(() => dateUtils.getWeekdayNames(locale, 'short'), [locale]);

  const handlePrevious = useCallback(() => {
    setViewStartDate((prev) => dateUtils.addDays(prev, -numberOfDays));
  }, [numberOfDays]);

  const handleNext = useCallback(() => {
    setViewStartDate((prev) => dateUtils.addDays(prev, numberOfDays));
  }, [numberOfDays]);

  const isDayDisabled = useCallback(
    (date: Date) => dateUtils.isDateDisabled(date, minDate, maxDate),
    [maxDate, minDate],
  );

  const handleDayPress = useCallback(
    (date: Date) => {
      if (isDayDisabled(date)) return;
      setSelectedDate(date);
    },
    [isDayDisabled, setSelectedDate],
  );

  // ---------- Keyboard: one tab stop; arrows move by day and page at the ends ----------
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const indexOfDay = (date: Date | null) =>
    date ? days.findIndex((day) => dateUtils.isSameDay(day, date)) : -1;
  const focusedIndex = indexOfDay(focusedDate);
  const selectedIndex = indexOfDay(selectedDate);
  const roving = useRovingFocus({
    count: days.length,
    orientation: 'horizontal',
    loop: false,
    activeIndex: focusedIndex >= 0 ? focusedIndex : selectedIndex >= 0 ? selectedIndex : indexOfDay(new Date()),
    onActiveChange: (index) => setFocusedDate(days[index] ?? null),
    isDisabled: (index) => !!renderDay || !days[index] || isDayDisabled(days[index]),
  });

  // After paging by keyboard, focus the day the arrow pointed at.
  const [focusRequest, setFocusRequest] = useState<{ date: Date; seq: number } | null>(null);
  const requestIndex = indexOfDay(focusRequest?.date ?? null);
  const handledRequest = useRef(0);
  const { focusItem } = roving;
  useEffect(() => {
    if (!focusRequest || requestIndex < 0 || handledRequest.current === focusRequest.seq) return;
    handledRequest.current = focusRequest.seq;
    focusItem(requestIndex);
  }, [focusRequest, requestIndex, focusItem]);

  const handleDayKeyDown = (event: KeyboardEventLike, index: number) => {
    const { key, shift, ctrl, meta, alt } = readKey(event);
    const date = days[index];
    if (!date) return;
    if (key === ' ' || key === 'Spacebar') {
      consumeEvent(event);
      handleDayPress(date);
      return;
    }
    if ((key === 'ArrowLeft' || key === 'ArrowRight') && !shift && !ctrl && !meta && !alt) {
      const step = (key === 'ArrowRight') !== isRTL ? 1 : -1;
      const target = dateUtils.addDays(date, step);
      const atEdge = step === 1 ? index === days.length - 1 : index === 0;
      if (atEdge && !isDayDisabled(target)) {
        consumeEvent(event);
        setFocusedDate(target);
        setFocusRequest((previous) => ({ date: target, seq: (previous?.seq ?? 0) + 1 }));
        setViewStartDate((prev) => dateUtils.addDays(prev, step * numberOfDays));
        return;
      }
    }
    roving.handleKeyDown(event, index);
  };

  return (
    <View ref={ref} style={[styles.root, spacingStyles, style]} testID={testID}>
      <View style={styles.header}>
        <Pressable
          onPress={handlePrevious}
          {...a11yProps({ role: 'button', label: `Previous ${numberOfDays} days` })}
          // 32px on web (>= 24); the slop brings native touch targets to 44pt.
          hitSlop={NAV_HIT_SLOP}
          {...previousControlProps}
          style={(state) => [
            styles.navButton,
            state.pressed && styles.pressed,
            typeof previousControlProps?.style === 'function' ? previousControlProps.style(state) : previousControlProps?.style,
          ]}
        >
          <Icon name="chevron-left" size={iconSize} color={theme.text.secondary} />
        </Pressable>

        <Text size="md" fw="semibold" style={styles.title} {...a11yProps({ live: 'polite' })}>
          {dateUtils.formatDate(viewStartDate, 'MMM yyyy', locale)}
        </Text>

        <Pressable
          onPress={handleNext}
          {...a11yProps({ role: 'button', label: `Next ${numberOfDays} days` })}
          hitSlop={NAV_HIT_SLOP}
          {...nextControlProps}
          style={(state) => [
            styles.navButton,
            state.pressed && styles.pressed,
            typeof nextControlProps?.style === 'function' ? nextControlProps.style(state) : nextControlProps?.style,
          ]}
        >
          <Icon name="chevron-right" size={iconSize} color={theme.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        style={styles.scroll}
      >
        <View {...webA11y({ role: 'grid', label: formatMonthYear(viewStartDate, locale) })}>
          <View style={styles.days} {...webA11y({ role: 'row' })}>
            {days.map((date, index) => {
              const isSelected = selectedDate ? dateUtils.isSameDay(date, selectedDate) : false;
              const isToday = dateUtils.isToday(date);
              const isWeekend = dateUtils.isWeekend(date);
              const isDisabled = isDayDisabled(date);
              const weekdayName = weekdayNames[date.getDay()];

              if (renderDay) {
                return (
                  <View key={date.getTime()} style={styles.column} {...webA11y({ role: 'gridcell' })}>
                    <Text size="xs" style={[styles.weekday, styles.weekdayCompact]} {...a11yProps({ hidden: true })}>
                      {weekdayName}
                    </Text>
                    {renderDay(date)}
                  </View>
                );
              }

              const { style: dayStyle, onFocus: customFocus, ...dayPressableProps } = stripDayState(
                getDayProps ? getDayProps(date) : {}
              );
              const itemProps = roving.getItemProps(index);
              const currentPeriod = { isCurrent: isToday && !isDisabled, isSelected };
              const currentColor = getCurrentPeriodTextColor(theme, currentPeriod);

              return (
                <View key={date.getTime()} style={styles.column}>
                  {/* The day's accessible name already includes the weekday. */}
                  <Text size="xs" style={styles.weekday} {...a11yProps({ hidden: true })}>
                    {weekdayName}
                  </Text>

                  <Pressable
                    ref={itemProps.ref}
                    onPress={() => handleDayPress(date)}
                    disabled={isDisabled}
                    {...a11yProps({
                      role: isWeb ? 'gridcell' : 'button',
                      label: formatFullDate(date, locale),
                      selected: isSelected,
                      current: isToday ? 'date' : undefined,
                      disabled: isDisabled,
                    })}
                    {...webProps({ tabIndex: itemProps.tabIndex, onKeyDown: (event) => handleDayKeyDown(event, index) })}
                    {...dayPressableProps}
                    onFocus={(event) => {
                      itemProps.onFocus();
                      customFocus?.(event);
                    }}
                    style={({ pressed }) => [
                      styles.day,
                      isSelected ? styles.selected : pressed && !isDisabled ? styles.pressed : null,
                      getCurrentPeriodStyles(theme, currentPeriod),
                      isDisabled ? styles.dimmed : null,
                      dayStyle,
                    ]}
                  >
                    <Text
                      size={size === 'xs' ? 'xs' : 'sm'}
                      fw={isSelected || isToday ? 'semibold' : 'medium'}
                      style={[
                        styles.text,
                        isSelected
                          ? styles.textSelected
                          : isDisabled
                            ? styles.textDisabled
                            : isWeekend
                              ? styles.textWeekend
                              : currentColor
                                ? { color: currentColor }
                                : null,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}, { displayName: 'MiniCalendar' });
