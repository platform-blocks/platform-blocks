import {
  SCALE_KEYS,
  type ScaleKey,
  getControlSize,
  resolveSpacing,
} from '@plocks/ui';
import type { PlocksTheme, SizeValue } from '@plocks/ui';

/** Anything with (some of) the theme's scales; the token resolvers fall back to defaults. */
type ThemeLike = Partial<PlocksTheme> | null | undefined;

export const DAYS_PER_WEEK = 7;

/** Smallest day cell, so `xs` calendars stay tappable. */
const MIN_DAY_SIZE = 24;

const px = (value: number | 'auto'): number => (typeof value === 'number' ? value : 0);

/** Size token for a date grid: a numeric `size` is a font size, not a cell size, so it falls back to `md`. */
const gridToken = (size: SizeValue | undefined): ScaleKey =>
  typeof size === 'string' && (SCALE_KEYS as readonly string[]).includes(size) ? (size as ScaleKey) : 'md';

/**
 * Edge length of a single day cell: the control height of the same size, one
 * `spacing.sm` inset (md: 40 - 8 = 32). Shared by Day, Month and Calendar so the
 * grid, its weekday header and the calendar frame all agree on one number.
 */
export const getDaySize = (theme: ThemeLike, size: SizeValue = 'md'): number =>
  Math.max(MIN_DAY_SIZE, getControlSize(theme, gridToken(size)).height - px(resolveSpacing(theme, 'sm')));

/** Gap between day cells (`spacing.xs`), or 0 without cell spacing. */
export const getCellGap = (theme: ThemeLike, withCellSpacing = true): number =>
  withCellSpacing ? px(resolveSpacing(theme, 'xs')) : 0;

/** Intrinsic width of a month grid: seven day cells plus the gaps between them.
 *  Calendars size to this instead of stretching to fill their container. */
export const getMonthGridWidth = (theme: ThemeLike, size: SizeValue = 'md', withCellSpacing = true): number =>
  getDaySize(theme, size) * DAYS_PER_WEEK + getCellGap(theme, withCellSpacing) * (DAYS_PER_WEEK - 1);

/** Intrinsic width of a (non-`fullWidth`) Calendar: its month grids side by side,
 *  `spacing.lg` apart. Containers that hug a calendar size to this. */
export const getCalendarWidth = (
  theme: ThemeLike,
  size: SizeValue = 'md',
  withCellSpacing = true,
  numberOfMonths = 1
): number => {
  const months = Math.max(1, numberOfMonths);
  return getMonthGridWidth(theme, size, withCellSpacing) * months + px(resolveSpacing(theme, 'lg')) * (months - 1);
};

/** One step up the size ladder (`md` → `lg`, `3xl` stays `3xl`); numbers pass through. */
export const stepUpSize = (size: SizeValue | undefined): SizeValue => {
  if (typeof size === 'number') return size;
  const index = SCALE_KEYS.indexOf(gridToken(size));
  return SCALE_KEYS[Math.min(SCALE_KEYS.length - 1, index + 1)];
};

// ---------------------------------------------------------------------------
// Localized labels (formatters are cached: Intl.DateTimeFormat is costly to build)
// ---------------------------------------------------------------------------

const formatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * A cached `Intl.DateTimeFormat`; an invalid locale falls back to the runtime
 * default. `name` identifies `options` in the cache key (defaults to their JSON).
 */
export const getDateFormatter = (
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
  name: string = JSON.stringify(options)
): Intl.DateTimeFormat => {
  const key = `${locale ?? ''}|${name}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat(locale, options);
    } catch {
      formatter = new Intl.DateTimeFormat(undefined, options);
    }
    formatterCache.set(key, formatter);
  }
  return formatter;
};

const FULL_DATE_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
const MONTH_YEAR_FORMAT: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

/** Accessible name of a day cell, e.g. "Tuesday, March 3, 2026" (en-US) / "Tuesday 3 March 2026" (en-GB). */
export const formatFullDate = (date: Date, locale?: string): string =>
  getDateFormatter(locale, FULL_DATE_FORMAT, 'full').format(date);

/** e.g. "March 2026" — month grid and month tile names. */
export const formatMonthYear = (date: Date, locale?: string): string =>
  getDateFormatter(locale, MONTH_YEAR_FORMAT, 'month-year').format(date);

// ---------------------------------------------------------------------------
// Month arithmetic that never skips a month
// ---------------------------------------------------------------------------

/**
 * `date` moved by `months`, keeping the day of month where it exists and
 * clamping it otherwise (Jan 31 + 1 month = Feb 28/29, not Mar 3 as
 * `dateUtils.addMonths` gives).
 */
export const shiftMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
};

/** Whole months from `from`'s month to `to`'s month (negative when `to` is earlier). */
export const monthDiff = (from: Date, to: Date): number =>
  (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

/** Every real `Date` in a `CalendarValue` (single, multiple or range). */
export const collectDates = (value: unknown): Date[] => {
  if (value instanceof Date) return [value];
  if (Array.isArray(value)) return value.filter((item): item is Date => item instanceof Date);
  return [];
};

// Date utility functions for Calendar system
export const dateUtils = {
  // Get start of day
  startOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of day
  endOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get start of month
  startOfMonth: (date: Date): Date => {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of month
  endOfMonth: (date: Date): Date => {
    const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get start of year
  startOfYear: (date: Date): Date => {
    const result = new Date(date.getFullYear(), 0, 1);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of year
  endOfYear: (date: Date): Date => {
    const result = new Date(date.getFullYear(), 11, 31);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Add days
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Add months
  addMonths: (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  // Add years
  addYears: (date: Date, years: number): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },

  // Check if dates are same day
  isSameDay: (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  },

  // Check if dates are same month
  isSameMonth: (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
  },

  // Check if dates are same year
  isSameYear: (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear();
  },

  // Check if date is today
  isToday: (date: Date): boolean => {
    return dateUtils.isSameDay(date, new Date());
  },

  // Check if date is weekend
  isWeekend: (date: Date, weekendDays: number[] = [0, 6]): boolean => {
    return weekendDays.includes(date.getDay());
  },

  // Check if date is in range
  isInRange: (date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    const time = date.getTime();
    return time >= start.getTime() && time <= end.getTime();
  },

  // Check if date is between two dates (exclusive)
  isBetween: (date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    const time = date.getTime();
    return time > start.getTime() && time < end.getTime();
  },

  // Get days in month
  getDaysInMonth: (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  },

  // Get month calendar (6 weeks of days)
  getMonthCalendar: (date: Date, firstDayOfWeek: number = 0): Date[][] => {
    const start = dateUtils.startOfMonth(date);
    const startDay = start.getDay();
    const firstDay = dateUtils.addDays(start, -(startDay - firstDayOfWeek + 7) % 7);
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const currentDate = dateUtils.addDays(firstDay, i);
      currentWeek.push(currentDate);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return weeks;
  },

  // Get month names
  getMonthNames: (locale: string = 'en-US'): string[] => {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, i) =>
      formatter.format(new Date(2000, i, 1))
    );
  },

  // Get weekday names
  getWeekdayNames: (locale: string = 'en-US', format: 'long' | 'short' | 'narrow' = 'short'): string[] => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
    // Start from Sunday
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(2000, 0, 2 + i))
    );
  },

  // Format date
  formatDate: (date: Date, format: string, locale: string = 'en-US'): string => {
    // Simple format implementation
    const options: Intl.DateTimeFormatOptions = {};
    
    if (format.includes('yyyy')) {
      options.year = 'numeric';
    } else if (format.includes('yy')) {
      options.year = '2-digit';
    }
    
    if (format.includes('MMMM')) {
      options.month = 'long';
    } else if (format.includes('MMM')) {
      options.month = 'short';
    } else if (format.includes('MM')) {
      options.month = '2-digit';
    } else if (format.includes('M')) {
      options.month = 'numeric';
    }
    
    if (format.includes('dd')) {
      options.day = '2-digit';
    } else if (format.includes('d')) {
      options.day = 'numeric';
    }
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  },

  // Parse date string
  parseDate: (value: string): Date | null => {
    if (!value) return null;
    
    // Try various formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/dd/yyyy or M/d/yyyy
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-MM-dd or yyyy-M-d
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-dd-yyyy or M-d-yyyy
    ];
    
    for (const format of formats) {
      const match = value.match(format);
      if (match) {
        const [, first, second, third] = match;
        
        // Determine if it's MM/dd/yyyy or yyyy-MM-dd
        if (third.length === 4) {
          // First format: MM/dd/yyyy
          const month = parseInt(first, 10) - 1;
          const day = parseInt(second, 10);
          const year = parseInt(third, 10);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) return date;
        } else if (first.length === 4) {
          // Second format: yyyy-MM-dd
          const year = parseInt(first, 10);
          const month = parseInt(second, 10) - 1;
          const day = parseInt(third, 10);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) return date;
        }
      }
    }
    
    // Fallback to Date constructor
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },

  // Get decade range
  getDecadeRange: (year: number): [number, number] => {
    const start = Math.floor(year / 10) * 10;
    return [start, start + 9];
  },

  // Get years in decade
  getYearsInDecade: (date: Date): number[] => {
    const year = date.getFullYear();
    const [start] = dateUtils.getDecadeRange(year);
    return Array.from({ length: 10 }, (_, i) => start + i);
  },

  // Clamp date between min and max
  clampDate: (date: Date, minDate?: Date, maxDate?: Date): Date => {
    let result = new Date(date);
    
    if (minDate && result < minDate) {
      result = new Date(minDate);
    }
    
    if (maxDate && result > maxDate) {
      result = new Date(maxDate);
    }
    
    return result;
  },

  // Check if date is disabled
  isDateDisabled: (date: Date, minDate?: Date, maxDate?: Date, excludeDate?: (date: Date) => boolean): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (excludeDate && excludeDate(date)) return true;
    return false;
  },

  // Get days in range for MiniCalendar
  getDaysInRange: (startDate: Date, numberOfDays: number): Date[] => {
    return Array.from({ length: numberOfDays }, (_, i) =>
      dateUtils.addDays(startDate, i)
    );
  },

  // Get start of week
  startOfWeek: (date: Date, firstDayOfWeek: number = 0): Date => {
    const day = date.getDay();
    const diff = (day - firstDayOfWeek + 7) % 7;
    return dateUtils.addDays(date, -diff);
  },

  // Get months in year
  getMonthsInYear: (year: number): Date[] => {
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  },
};