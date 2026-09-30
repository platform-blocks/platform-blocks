import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
  resolveSpacing,
  useStyleProps,
  Text,
} from '@plocks/ui';
import type { PlocksTheme, SizeValue } from '@plocks/ui';
import { useCalendarFocus } from './CalendarFocusContext';
import { Day } from './Day';
import type { CalendarValue, MonthProps } from './types';
import {
  DAYS_PER_WEEK,
  collectDates,
  dateUtils,
  formatMonthYear,
  getCellGap,
  getDaySize,
  getMonthGridWidth,
  shiftMonths,
} from './utils';

const DEFAULT_WEEKEND_DAYS = [0, 6];
const NO_PROPS: A11yProps = Object.freeze({}) as A11yProps;

/** Structural grid ARIA (grid / row / columnheader) is web-only; native reads the day buttons directly. */
const webA11y = (opts: A11yOptions): A11yProps => (isWeb ? a11yProps(opts) : NO_PROPS);
/** The weekday header repeats what every day's name already says, so native skips it. */
const NATIVE_HIDDEN: A11yProps = isWeb ? NO_PROPS : a11yProps({ hidden: true });

const getMonthStyles = createThemedStyles((theme: PlocksTheme, size: SizeValue, withCellSpacing: boolean) => {
  const daySize = getDaySize(theme, size);
  const gap = getCellGap(theme, withCellSpacing);
  const headerGap = resolveSpacing(theme, 'sm');
  return StyleSheet.create({
    root: { width: getMonthGridWidth(theme, size, withCellSpacing) },
    weekdayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: withCellSpacing && typeof headerGap === 'number' ? headerGap : 0,
    },
    cell: { width: daySize, height: daySize, alignItems: 'center', justifyContent: 'center' },
    weekdayText: { color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    week: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: gap, gap },
  });
});

interface CellInfo {
  date: Date;
  outside: boolean;
  disabled: boolean;
  /** In the keyboard (arrow-key) order. */
  focusable: boolean;
}

export const Month = factory<{ props: MonthProps; ref: View }>((props, ref) => {
  const {
    month,
    value,
    onChange,
    type = 'single',
    hoveredDate,
    onDayHover,
    onDayHoverEnd,
    minDate,
    maxDate,
    firstDayOfWeek = 0,
    weekendDays = DEFAULT_WEEKEND_DAYS,
    locale = 'en-US',
    size = 'md',
    hideOutsideDates = false,
    hideWeekdays = false,
    highlightToday = true,
    withCellSpacing = true,
    excludeDate,
    getDayProps,
    renderDay,
    style,
    testID,
  } = props;
  const theme = useTheme();
  const styles = getMonthStyles(theme, size, withCellSpacing);
  const spacingStyles = useStyleProps(props);
  const { isRTL } = useDirection();
  const focus = useCalendarFocus();
  const interactive = focus?.interactive ?? true;

  const calendar = useMemo(() => dateUtils.getMonthCalendar(month, firstDayOfWeek), [month, firstDayOfWeek]);
  const cells = useMemo(() => calendar.flat(), [calendar]);

  const rangeValue = useMemo<[Date | null, Date | null]>(() => {
    if (Array.isArray(value) && value.length === 2) {
      return [value[0] instanceof Date ? value[0] : null, value[1] instanceof Date ? value[1] : null];
    }
    return [null, null];
  }, [value]);

  const [rangeStart, rangeEnd] = rangeValue;

  const isRangeSelectionInProgress = type === 'range' && rangeStart instanceof Date && !(rangeEnd instanceof Date);

  const previewRange = useMemo(() => {
    if (!isRangeSelectionInProgress || !hoveredDate || !(rangeStart instanceof Date)) {
      return null;
    }

    if (dateUtils.isDateDisabled(hoveredDate, minDate, maxDate, excludeDate)) {
      return null;
    }

    const startTime = rangeStart.getTime();
    const hoverTime = hoveredDate.getTime();
    return startTime <= hoverTime
      ? { start: rangeStart, end: hoveredDate }
      : { start: hoveredDate, end: rangeStart };
  }, [excludeDate, hoveredDate, isRangeSelectionInProgress, maxDate, minDate, rangeStart]);

  const handleMonthMouseLeave = useCallback(() => {
    if (isRangeSelectionInProgress) {
      onDayHoverEnd?.();
    }
  }, [isRangeSelectionInProgress, onDayHoverEnd]);

  const weekdays = useMemo(() => {
    const narrow = dateUtils.getWeekdayNames(locale, 'narrow');
    const long = dateUtils.getWeekdayNames(locale, 'long');
    // Reorder based on firstDayOfWeek
    return Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
      const day = (i + firstDayOfWeek) % DAYS_PER_WEEK;
      return { day, narrow: narrow[day], long: long[day] };
    });
  }, [locale, firstDayOfWeek]);

  const isSelected = (date: Date): boolean => {
    if (!value) return false;

    if (type === 'single') {
      return value instanceof Date && dateUtils.isSameDay(date, value);
    }

    if (type === 'multiple') {
      return Array.isArray(value) && value.some((v) => v instanceof Date && dateUtils.isSameDay(date, v));
    }

    if (type === 'range') {
      if (Array.isArray(value) && value.length === 2) {
        const [start, end] = value;
        if (start && dateUtils.isSameDay(date, start)) return true;
        if (end && dateUtils.isSameDay(date, end)) return true;
      }
    }

    return false;
  };

  const isInRange = (date: Date): boolean => {
    if (type !== 'range' || !Array.isArray(value) || value.length !== 2) return false;
    const [start, end] = value;
    return !!(start && end && dateUtils.isInRange(date, start, end));
  };

  const isFirstInRange = (date: Date): boolean => {
    if (type !== 'range' || !Array.isArray(value)) return false;
    const [start] = value;
    return !!(start && dateUtils.isSameDay(date, start));
  };

  const isLastInRange = (date: Date): boolean => {
    if (type !== 'range' || !Array.isArray(value)) return false;
    const [, end] = value;
    return !!(end && dateUtils.isSameDay(date, end));
  };

  const handleDayPress = (date: Date) => {
    if (!onChange || !interactive) return;

    if (type === 'single') {
      onChange(date);
    } else if (type === 'multiple') {
      const currentArray = collectDates(value);
      const exists = currentArray.find((v) => dateUtils.isSameDay(v, date));

      if (exists) {
        onChange(currentArray.filter((v) => !dateUtils.isSameDay(v, date)));
      } else {
        onChange([...currentArray, date]);
      }
    } else if (type === 'range') {
      const currentRange: CalendarValue = Array.isArray(value) ? value : [null, null];
      const [start, end] = currentRange;

      if (!start || (start && end)) {
        // Start new range
        onChange([date, null]);
      } else if (start && !end) {
        // Complete the range
        if (date < start) {
          onChange([date, start]);
        } else {
          onChange([start, date]);
        }
      }
    }
  };

  // ---------- Keyboard: one tab stop, arrows move by day / week ----------
  const cellInfo: CellInfo[] = cells.map((date) => {
    const outside = !dateUtils.isSameMonth(date, month);
    const disabled = dateUtils.isDateDisabled(date, minDate, maxDate, excludeDate);
    return { date, outside, disabled, focusable: interactive && !renderDay && !outside && !disabled };
  });

  /** Index of `date` among this month's own days (never an outside day), or -1. */
  const indexOfDay = (date: Date | null | undefined): number =>
    date ? cells.findIndex((cell) => dateUtils.isSameMonth(cell, month) && dateUtils.isSameDay(cell, date)) : -1;

  // Standalone Month: the tab stop is the focused day, else the selection, else today.
  const [localActive, setLocalActive] = useState<Date | null>(null);
  const standaloneStop = focus
    ? null
    : (localActive && indexOfDay(localActive) >= 0 ? localActive : null) ??
      collectDates(value).find((date) => indexOfDay(date) >= 0) ??
      new Date();

  const tabStopDate = focus ? focus.tabStopDate : standaloneStop;
  const ownsTabStop = focus
    ? dateUtils.isSameMonth(focus.tabStopDate ?? focus.firstVisibleMonth, month)
    : true;

  const roving = useRovingFocus({
    count: cells.length,
    orientation: 'both',
    columns: DAYS_PER_WEEK,
    loop: false,
    // -1 (not in this month) falls back to the first enabled day.
    activeIndex: indexOfDay(tabStopDate),
    onActiveChange: (index) => {
      const date = cells[index];
      if (!date) return;
      if (focus) focus.setActiveDate(date);
      else setLocalActive(date);
    },
    isDisabled: (index) => !cellInfo[index]?.focusable,
  });

  // Focus a day the Calendar navigated to (after the view changed).
  const focusRequest = focus?.focusRequest ?? null;
  const requestIndex = focusRequest ? indexOfDay(focusRequest.date) : -1;
  const handledRequest = useRef(0);
  const { focusItem } = roving;
  useEffect(() => {
    if (!focusRequest || requestIndex < 0 || handledRequest.current === focusRequest.seq) return;
    handledRequest.current = focusRequest.seq;
    focusItem(requestIndex);
  }, [focusRequest, requestIndex, focusItem]);

  const handleCellKeyDown = (event: KeyboardEventLike, index: number) => {
    const info = cellInfo[index];
    const { key, shift, ctrl, meta, alt } = readKey(event);

    // Pressable activates a gridcell on Enter only; grids also select on Space.
    if (key === ' ' || key === 'Spacebar') {
      consumeEvent(event);
      if (info?.focusable) handleDayPress(info.date);
      return;
    }

    // Moves that leave the month go through the Calendar, which changes the view.
    if (focus && info && !ctrl && !meta && !alt) {
      let target: Date | null = null;
      let step: 1 | -1 = 1;
      if (!shift && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        step = (key === 'ArrowRight') !== isRTL ? 1 : -1;
        target = dateUtils.addDays(info.date, step);
      } else if (!shift && (key === 'ArrowUp' || key === 'ArrowDown')) {
        step = key === 'ArrowDown' ? 1 : -1;
        target = dateUtils.addDays(info.date, step * DAYS_PER_WEEK);
      } else if (key === 'PageUp' || key === 'PageDown') {
        // PageUp/Down: previous/next month; with Shift: previous/next year.
        step = key === 'PageDown' ? 1 : -1;
        target = shiftMonths(info.date, step * (shift ? 12 : 1));
      }
      if (target && (key.startsWith('Page') || !dateUtils.isSameMonth(target, month))) {
        consumeEvent(event);
        focus.navigate(target, step);
        return;
      }
    }

    roving.handleKeyDown(event, index);
  };

  const monthLabel = formatMonthYear(month, locale);

  return (
    <View
      ref={ref}
      style={[styles.root, spacingStyles, style]}
      testID={testID}
      {...webA11y({ role: 'grid', label: monthLabel })}
      {...(onDayHoverEnd && interactive ? webProps({ onMouseLeave: handleMonthMouseLeave }) : NO_PROPS)}
    >
      {/* Weekday headers */}
      {!hideWeekdays && (
        <View style={styles.weekdayRow} {...webA11y({ role: 'row' })} {...NATIVE_HIDDEN}>
          {weekdays.map(({ day, narrow, long }) => (
            <View key={day} style={styles.cell} {...webA11y({ role: 'columnheader', label: long })}>
              <Text size="sm" fw="semibold" style={styles.weekdayText}>
                {narrow}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Calendar days */}
      <View>
        {calendar.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week} {...webA11y({ role: 'row' })}>
            {week.map((date, dayIndex) => {
              const index = weekIndex * DAYS_PER_WEEK + dayIndex;
              const info = cellInfo[index];
              const { outside: isOutside, disabled: isDisabled } = info;
              const key = date.getTime();

              // Don't render outside dates if hideOutsideDates is true
              if (hideOutsideDates && isOutside) {
                return <View key={key} style={styles.cell} {...webA11y({ role: 'gridcell' })} />;
              }

              // Custom render function
              if (renderDay) {
                return (
                  <View key={key} {...webA11y({ role: 'gridcell' })}>
                    {renderDay(date)}
                  </View>
                );
              }

              const isWeekend = dateUtils.isWeekend(date, weekendDays);
              const isToday = highlightToday && dateUtils.isToday(date);
              const selected = isSelected(date);

              const previewedInRange = !!(
                previewRange && dateUtils.isInRange(date, previewRange.start, previewRange.end)
              );
              const previewedFirstInRange = !!(previewRange && dateUtils.isSameDay(date, previewRange.start));
              const previewedLastInRange = !!(previewRange && dateUtils.isSameDay(date, previewRange.end));
              const previewed = !!(
                hoveredDate && isRangeSelectionInProgress && dateUtils.isSameDay(date, hoveredDate)
              );
              const canPreview = interactive && !isDisabled && isRangeSelectionInProgress;

              // Custom day props; hover / focus handlers are composed with the grid's own.
              const {
                onHoverIn: customHoverIn,
                onFocus: customFocus,
                ...restDayProps
              } = getDayProps ? getDayProps(date) : {};
              const itemProps = roving.getItemProps(index);

              return (
                <Day
                  key={key}
                  ref={itemProps.ref}
                  date={date}
                  locale={locale}
                  selected={selected}
                  inRange={isInRange(date)}
                  firstInRange={isFirstInRange(date)}
                  lastInRange={isLastInRange(date)}
                  previewed={previewed}
                  previewedInRange={previewedInRange}
                  previewedFirstInRange={previewedFirstInRange}
                  previewedLastInRange={previewedLastInRange}
                  weekend={isWeekend}
                  outside={isOutside}
                  today={isToday}
                  disabled={isDisabled}
                  onPress={interactive ? () => handleDayPress(date) : undefined}
                  size={size}
                  onHoverIn={(event) => {
                    if (canPreview) onDayHover?.(date);
                    customHoverIn?.(event);
                  }}
                  onFocus={(event) => {
                    itemProps.onFocus();
                    // Keyboard users get the same range preview as pointer users.
                    if (canPreview) onDayHover?.(date);
                    customFocus?.(event);
                  }}
                  {...webProps({
                    tabIndex: ownsTabStop ? itemProps.tabIndex : -1,
                    onKeyDown: (event) => handleCellKeyDown(event, index),
                  })}
                  {...restDayProps}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}, { displayName: 'Month' });
