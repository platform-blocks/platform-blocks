import type { CalendarValue } from '../Calendar/types';

// Extract first concrete Date instance from CalendarValue collections
export const extractFirstDate = (val: CalendarValue | null | undefined): Date | undefined => {
  if (!val) return undefined;
  if (val instanceof Date) return val;
  if (Array.isArray(val)) {
    for (const item of val) {
      if (item instanceof Date) return item;
    }
  }
  return undefined;
};

// Date utility functions for DatePicker
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
};
