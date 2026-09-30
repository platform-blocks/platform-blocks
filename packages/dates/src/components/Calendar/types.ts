import type React from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import type { SizeValue, BaseProps, DisclaimerSupport } from '@plocks/ui';

// Calendar displays days at the 'month' level. Higher levels navigate selection context.
export type CalendarLevel = 'month' | 'year' | 'decade';
export type CalendarType = 'single' | 'multiple' | 'range';
export type CalendarValue = Date | Date[] | [Date | null, Date | null] | null;

export interface CalendarProps extends BaseProps, DisclaimerSupport {
  // View control
  level?: CalendarLevel;
  defaultLevel?: CalendarLevel;
  onLevelChange?: (level: CalendarLevel) => void;

  // Date management
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;

  // Value handling (for selection)
  value?: CalendarValue;
  onChange?: (value: CalendarValue) => void;
  type?: CalendarType;

  // Constraints
  minDate?: Date;
  maxDate?: Date;
  excludeDate?: (date: Date) => boolean;

  // Localization
  /** Locale for month / weekday names and the day cells' accessible names. Default `'en-US'`. */
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  weekendDays?: number[];

  // Display options
  withCellSpacing?: boolean;
  hideOutsideDates?: boolean;
  hideWeekdays?: boolean;
  highlightToday?: boolean;
  numberOfMonths?: number;

  // Customization
  getDayProps?: (date: Date) => Partial<DayProps>;
  renderDay?: (date: Date) => React.ReactNode;
  size?: SizeValue;
  /** Stretch to fill the container instead of sizing to the day grid. Default `false`. */
  fullWidth?: boolean;

  /**
   * Static mode: the calendar only displays — navigation, day selection, hover
   * previews and keyboard focus are all off.
   */
  static?: boolean;
}

/** Props for the prev/next controls of `MiniCalendar` (forwarded to their `Pressable`). */
export type MiniCalendarControlProps = Partial<PressableProps>;

export interface MiniCalendarProps extends BaseProps {
  // Value
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  defaultValue?: Date | null;

  // Display
  /** Days shown in the strip. Default `7`. */
  numberOfDays?: number;
  defaultDate?: Date;

  // Constraints
  minDate?: Date;
  maxDate?: Date;

  // Navigation
  /** Extra props for the "next days" control (label, testID, style, ...). */
  nextControlProps?: MiniCalendarControlProps;
  /** Extra props for the "previous days" control (label, testID, style, ...). */
  previousControlProps?: MiniCalendarControlProps;

  // Customization
  getDayProps?: (date: Date) => Partial<DayProps>;
  renderDay?: (date: Date) => React.ReactNode;

  // Localization
  locale?: string;
  size?: SizeValue;
}
export type { MonthPickerProps } from '../MonthPicker/types';
export type { YearPickerProps } from '../YearPicker/types';

export interface MonthProps extends BaseProps {
  month: Date;

  // Selection
  value?: CalendarValue;
  onChange?: (value: CalendarValue) => void;
  type?: CalendarType;
  hoveredDate?: Date | null;
  onDayHover?: (date: Date) => void;
  onDayHoverEnd?: () => void;

  // Constraints
  minDate?: Date;
  maxDate?: Date;
  excludeDate?: (date: Date) => boolean;

  // Display
  firstDayOfWeek?: number;
  weekendDays?: number[];
  hideOutsideDates?: boolean;
  hideWeekdays?: boolean;
  highlightToday?: boolean;
  withCellSpacing?: boolean;

  // Customization
  getDayProps?: (date: Date) => Partial<DayProps>;
  renderDay?: (date: Date) => React.ReactNode;
  size?: SizeValue;
  locale?: string;
}

/**
 * A day cell. Besides its own state flags it accepts any `Pressable` prop
 * (`testID`, `accessibilityLabel`, `onLongPress`, `hitSlop`, ...), which is what
 * `getDayProps` may return.
 */
export interface DayProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled'> {
  date: Date;

  // States
  selected?: boolean;
  inRange?: boolean;
  firstInRange?: boolean;
  lastInRange?: boolean;
  previewed?: boolean;
  previewedInRange?: boolean;
  previewedFirstInRange?: boolean;
  previewedLastInRange?: boolean;
  weekend?: boolean;
  outside?: boolean;
  today?: boolean;
  disabled?: boolean;

  // Styling
  size?: SizeValue;
  style?: StyleProp<ViewStyle>;

  /** Locale for the cell's accessible name (the full date). Default: the runtime locale. */
  locale?: string;

  // Custom content
  children?: React.ReactNode;
}
