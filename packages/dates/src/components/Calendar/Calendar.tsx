import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type DimensionValue } from 'react-native';

import {
  a11yProps,
  focusNode,
  factory,
  useLatestCallback,
  createThemedStyles,
  isWeb,
  useTheme,
  resolveIconSize,
  resolveRadius,
  resolveSpacing,
  useStyleProps,
  useControllableState,
  Icon,
  Text,
  extractDisclaimerProps,
  useDisclaimer,
} from '@plocks/ui';
import type { PlocksTheme } from '@plocks/ui';
import { MonthPicker } from '../MonthPicker';
import { YearPicker } from '../YearPicker';
import {
  CalendarFocusContext,
  type CalendarFocusContextValue,
  type CalendarFocusRequest,
} from './CalendarFocusContext';
import { Month } from './Month';
import type { CalendarLevel, CalendarProps } from './types';
import { collectDates, dateUtils, getCalendarWidth, monthDiff, shiftMonths, stepUpSize } from './utils';

const DEFAULT_WEEKEND_DAYS = [0, 6];
/** How far keyboard navigation looks past disabled days before giving up. */
const MAX_DISABLED_RUN = 366;

/** Months each prev/next press moves the view by, per level. */
const LEVEL_STEP: Record<CalendarLevel, number> = { month: 1, year: 12, decade: 120 };
const NAV_LABELS: Record<CalendarLevel, { previous: string; next: string }> = {
  month: { previous: 'Previous month', next: 'Next month' },
  year: { previous: 'Previous year', next: 'Next year' },
  decade: { previous: 'Previous decade', next: 'Next decade' },
};
/** What the header button does at each level (it is disabled at `decade`). */
const LEVEL_HINTS: Partial<Record<CalendarLevel, string>> = { month: 'Show months', year: 'Show years' };

const px = (value: number | 'auto'): number => (typeof value === 'number' ? value : 0);

const getCalendarStyles = createThemedStyles((theme: PlocksTheme) => {
  const styles = StyleSheet.create({
    fill: { width: '100%' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: px(resolveSpacing(theme, 'xl')),
      paddingHorizontal: px(resolveSpacing(theme, 'xs')),
    },
    navButton: { padding: px(resolveSpacing(theme, 'md')), borderRadius: resolveRadius(theme, 'lg') },
    levelButton: {
      paddingHorizontal: px(resolveSpacing(theme, 'lg')),
      paddingVertical: px(resolveSpacing(theme, 'sm')),
      borderRadius: resolveRadius(theme, 'lg'),
    },
    pressed: { backgroundColor: theme.backgrounds.pressed },
    dimmed: { opacity: 0.5 },
    headerText: { color: theme.text.primary, textAlign: 'center' },
    months: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: px(resolveSpacing(theme, 'lg')) },
  });
  return styles;
});

export const Calendar = factory<{ props: CalendarProps; ref: View }>((incomingProps, ref) => {
  const { disclaimerProps: disclaimerData, otherProps: props } = extractDisclaimerProps(incomingProps);
  const {
    level,
    defaultLevel = 'month',
    onLevelChange,

    // Date management
    date: controlledDate,
    defaultDate,
    onDateChange,

    // Value handling (for selection)
    value,
    onChange,
    type = 'single',

    // Constraints
    minDate,
    maxDate,
    excludeDate,

    // Localization
    locale = 'en-US',
    firstDayOfWeek = 0,
    weekendDays = DEFAULT_WEEKEND_DAYS,

    // Display options
    withCellSpacing = true,
    hideOutsideDates = false,
    hideWeekdays = false,
    highlightToday = true,
    numberOfMonths = 1,

    // Customization
    getDayProps,
    renderDay,
    size = 'md',
    fullWidth = false,

    // Static mode (non-interactive)
    static: isStatic = false,

    style,
    testID,
  } = props;
  const theme = useTheme();
  const styles = getCalendarStyles(theme);
  const spacingStyles = useStyleProps(props);
  const headerTextSize = stepUpSize(size);
  const iconSize = resolveIconSize(theme, 'md');

  // A calendar has a natural width — seven day columns. Left to stretch it fans
  // the days apart and reads as an oddly long block, so size to the grid and
  // let `fullWidth` opt back into filling the container.
  const months = Math.max(1, numberOfMonths);
  const calendarWidth: DimensionValue = fullWidth
    ? '100%'
    : getCalendarWidth(theme, size, withCellSpacing, months);
  const rootStyle = useMemo(() => ({ width: calendarWidth, maxWidth: '100%' as const }), [calendarWidth]);
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);

  const [currentDate, setCurrentDate] = useControllableState<Date>({
    value: controlledDate,
    defaultValue: () => defaultDate || new Date(),
    onChange: onDateChange,
  });

  const [currentLevel, setCurrentLevel] = useControllableState<CalendarLevel>({
    value: level,
    defaultValue: defaultLevel,
    finalValue: 'month',
    onChange: onLevelChange,
  });

  const rangeStart = Array.isArray(value) && value.length === 2 && value[0] instanceof Date ? value[0] : null;
  const rangeEnd = Array.isArray(value) && value.length === 2 && value[1] instanceof Date ? value[1] : null;
  const isRangeSelectionInProgress = type === 'range' && rangeStart !== null && rangeEnd === null;

  // The hover preview only exists while a range is half-picked.
  const [hoveredState, setHoveredDate] = useState<Date | null>(null);
  const hoveredDate = isRangeSelectionInProgress ? hoveredState : null;

  const handleDayHover = useCallback(
    (date: Date) => {
      if (!isRangeSelectionInProgress) return;
      setHoveredDate(date);
    },
    [isRangeSelectionInProgress]
  );

  const handleDayHoverEnd = useCallback(() => {
    setHoveredDate(null);
  }, []);

  const monthNames = useMemo(() => dateUtils.getMonthNames(locale), [locale]);

  // ---------- Keyboard focus across the visible months ----------
  const firstVisibleMonth = useMemo(() => dateUtils.startOfMonth(currentDate), [currentDate]);
  const monthDates = useMemo(
    () => Array.from({ length: months }, (_, i) => (i === 0 ? currentDate : shiftMonths(currentDate, i))),
    [currentDate, months]
  );
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [focusRequest, setFocusRequest] = useState<CalendarFocusRequest | null>(null);

  const isDayEnabled = useCallback(
    (date: Date) => !dateUtils.isDateDisabled(date, minDate, maxDate, excludeDate),
    [minDate, maxDate, excludeDate]
  );

  // One tab stop: the last focused day, else a selected day, else today, else
  // (null) the first month's first enabled day — whichever is visible.
  const tabStopDate = useMemo(() => {
    const isVisible = (date: Date) => {
      const diff = monthDiff(firstVisibleMonth, date);
      return diff >= 0 && diff < months;
    };
    if (activeDate && isVisible(activeDate) && isDayEnabled(activeDate)) return activeDate;
    const selected = collectDates(value).find((date) => isVisible(date) && isDayEnabled(date));
    if (selected) return selected;
    const today = dateUtils.startOfDay(new Date());
    return isVisible(today) && isDayEnabled(today) ? today : null;
  }, [activeDate, firstVisibleMonth, months, value, isDayEnabled]);

  const navigate = useLatestCallback((target: Date, step: 1 | -1) => {
    if (isStatic) return;
    let date = dateUtils.startOfDay(target);
    for (let i = 0; i < MAX_DISABLED_RUN && !isDayEnabled(date); i += 1) {
      date = dateUtils.addDays(date, step);
    }
    if (!isDayEnabled(date)) return;
    const diff = monthDiff(firstVisibleMonth, date);
    if (diff < 0) setCurrentDate(date);
    else if (diff >= months) setCurrentDate(shiftMonths(date, -(months - 1)));
    setActiveDate(date);
    setFocusRequest((previous) => ({ date, seq: (previous?.seq ?? 0) + 1 }));
  });

  const focusContext = useMemo<CalendarFocusContextValue>(
    () => ({
      tabStopDate,
      firstVisibleMonth,
      focusRequest,
      setActiveDate,
      navigate,
      interactive: !isStatic,
    }),
    [tabStopDate, firstVisibleMonth, focusRequest, navigate, isStatic]
  );

  // After a month / year is picked the picked tile unmounts; keep keyboard
  // focus in the calendar by moving it to the header button (web).
  const headerButtonRef = useRef<View>(null);
  const focusHeaderOnLevelChange = useRef(false);
  useEffect(() => {
    if (!focusHeaderOnLevelChange.current) return;
    focusHeaderOnLevelChange.current = false;
    if (isWeb) focusNode(headerButtonRef.current);
  }, [currentLevel]);

  const pickLevel = (next: CalendarLevel) => {
    focusHeaderOnLevelChange.current = true;
    setCurrentLevel(next);
  };

  const shiftView = (direction: 1 | -1) => {
    if (isStatic) return;
    setFocusRequest(null);
    setCurrentDate(shiftMonths(currentDate, direction * LEVEL_STEP[currentLevel]));
  };

  const handleHeaderClick = () => {
    if (isStatic) return;
    setFocusRequest(null);
    if (currentLevel === 'month') {
      setCurrentLevel('year');
    } else if (currentLevel === 'year') {
      setCurrentLevel('decade');
    }
  };

  const getHeaderText = () => {
    if (currentLevel === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentLevel === 'year') {
      return currentDate.getFullYear().toString();
    } else if (currentLevel === 'decade') {
      const [start, end] = dateUtils.getDecadeRange(currentDate.getFullYear());
      return `${start} - ${end}`;
    }
    return '';
  };

  const monthProps = {
    value,
    onChange,
    type,
    hoveredDate,
    onDayHover: handleDayHover,
    onDayHoverEnd: handleDayHoverEnd,
    minDate,
    maxDate,
    firstDayOfWeek,
    weekendDays,
    locale,
    size,
    hideOutsideDates,
    hideWeekdays,
    highlightToday,
    withCellSpacing,
    excludeDate,
    getDayProps,
    renderDay,
  };

  const renderMonthLevel = () => {
    if (months === 1) {
      return <Month month={currentDate} {...monthProps} />;
    }

    return (
      <View style={styles.months}>
        {monthDates.map((monthDate, index) => (
          <Month key={index} month={monthDate} {...monthProps} />
        ))}
      </View>
    );
  };

  const renderYearLevel = () => (
    <MonthPicker
      value={currentDate}
      onChange={(newDate: Date | null) => {
        if (newDate) {
          setCurrentDate(newDate);
          pickLevel('month');
        }
      }}
      year={currentDate.getFullYear()}
      onYearChange={(year: number) => {
        setCurrentDate(new Date(year, currentDate.getMonth(), currentDate.getDate()));
      }}
      minDate={minDate}
      maxDate={maxDate}
      locale={locale}
      size={size}
      hideHeader
      fullWidth
      monthLabelFormat="short"
    />
  );

  const renderDecadeLevel = () => (
    <YearPicker
      value={currentDate}
      onChange={(newDate: Date | null) => {
        if (newDate) {
          setCurrentDate(newDate);
          pickLevel('year');
        }
      }}
      decade={Math.floor(currentDate.getFullYear() / 10) * 10}
      onDecadeChange={(decade: number) => {
        setCurrentDate(new Date(decade, currentDate.getMonth(), currentDate.getDate()));
      }}
      minDate={minDate}
      maxDate={maxDate}
      size={size}
      hideHeader
      fullWidth
    />
  );

  const renderContent = () => {
    if (currentLevel === 'year') return renderYearLevel();
    if (currentLevel === 'decade') return renderDecadeLevel();
    return renderMonthLevel();
  };

  const disclaimerNode = renderDisclaimer();
  const headerText = getHeaderText();
  const navLabels = NAV_LABELS[currentLevel] ?? NAV_LABELS.month;
  const levelHint = LEVEL_HINTS[currentLevel];
  const headerDisabled = isStatic || currentLevel === 'decade';

  return (
    <View ref={ref} style={[rootStyle, spacingStyles, style]} testID={testID}>
      <View style={styles.fill}>
        {/* Header: logical row, so it (and the chevrons, via Icon) mirror in RTL. */}
        <View style={styles.header}>
          <Pressable
            onPress={() => shiftView(-1)}
            disabled={isStatic}
            {...a11yProps({ role: 'button', label: navLabels.previous, disabled: isStatic })}
            style={({ pressed }) => [styles.navButton, pressed && !isStatic && styles.pressed, isStatic && styles.dimmed]}
          >
            <Icon name="chevron-left" size={iconSize} color={theme.text.secondary} />
          </Pressable>

          <Pressable
            ref={headerButtonRef}
            onPress={handleHeaderClick}
            disabled={headerDisabled}
            {...a11yProps({
              role: 'button',
              // Web has no hint attribute, so the action rides along in the name.
              label: isWeb && levelHint && !headerDisabled ? `${headerText}, ${levelHint}` : headerText,
              hint: headerDisabled ? undefined : levelHint,
              disabled: headerDisabled,
              live: 'polite',
            })}
            style={({ pressed }) => [styles.levelButton, pressed && !headerDisabled && styles.pressed]}
          >
            <Text size={headerTextSize} fw="semibold" style={styles.headerText}>
              {headerText}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => shiftView(1)}
            disabled={isStatic}
            {...a11yProps({ role: 'button', label: navLabels.next, disabled: isStatic })}
            style={({ pressed }) => [styles.navButton, pressed && !isStatic && styles.pressed, isStatic && styles.dimmed]}
          >
            <Icon name="chevron-right" size={iconSize} color={theme.text.secondary} />
          </Pressable>
        </View>

        {/* Content */}
        <CalendarFocusContext.Provider value={focusContext}>{renderContent()}</CalendarFocusContext.Provider>
      </View>
      {disclaimerNode ? <View style={styles.fill}>{disclaimerNode}</View> : null}
    </View>
  );
}, { displayName: 'Calendar' });
