import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { SizeValue } from '../../core/theme/types';
import type { DisclaimerSupport } from '../_internal/Disclaimer';

// Calendar displays days at the 'month' level. Higher levels navigate selection context.
export type CalendarLevel = 'month' | 'year' | 'decade';
export type CalendarType = 'single' | 'multiple' | 'range';
export type CalendarValue = Date | Date[] | [Date | null, Date | null] | null;

export interface CalendarProps extends DisclaimerSupport {
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

  // Static mode (non-interactive)
  static?: boolean;
}

export interface MiniCalendarProps {
  // Value
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  defaultValue?: Date | null;
  
  // Display
  numberOfDays?: number; // default 7
  defaultDate?: Date;
  
  // Constraints
  minDate?: Date;
  maxDate?: Date;
  
  // Navigation
  nextControlProps?: any;
  previousControlProps?: any;
  
  // Customization
  getDayProps?: (date: Date) => Partial<DayProps>;
  renderDay?: (date: Date) => React.ReactNode;
  
  // Localization
  locale?: string;
  size?: SizeValue;
}
export type { MonthPickerProps } from '../MonthPicker/types';
export type { YearPickerProps } from '../YearPicker/types';

export interface MonthProps {
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

export interface DayProps {
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
  
  // Events
  onPress?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  
  // Styling
  size?: SizeValue;
  style?: StyleProp<ViewStyle>;
  
  // Custom content
  children?: React.ReactNode;
  
  // Additional props for customization
  [key: string]: any;
}