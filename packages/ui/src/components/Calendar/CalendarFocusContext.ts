import { createContext, useContext } from 'react';

/** Ask the month grid holding `date` to move DOM focus to it (web). */
export interface CalendarFocusRequest {
  date: Date;
  /** Increments per request, so the same date can be requested twice. */
  seq: number;
}

/**
 * Keyboard coordination between a `Calendar` and the `Month` grids it renders:
 * ONE tab stop across every visible month, and arrow / PageUp / PageDown moves
 * that leave a month change the view and land focus on the matching day.
 * A standalone `Month` (no provider) roves within its own days only.
 * @internal
 */
export interface CalendarFocusContextValue {
  /** The day that holds the tab stop, or `null` for "first enabled day of the first month". */
  tabStopDate: Date | null;
  /** First visible month (it holds the tab stop when `tabStopDate` is `null`). */
  firstVisibleMonth: Date;
  /** Latest focus request; a Month focuses the day when the date is in it. */
  focusRequest: CalendarFocusRequest | null;
  /** Record the focused / tab-stop day. */
  setActiveDate: (date: Date) => void;
  /**
   * Move focus to `target`, changing the visible months when needed. When
   * `target` is disabled the nearest enabled day in `step` direction is used.
   */
  navigate: (target: Date, step: 1 | -1) => void;
  /** `false` in static mode: days are display-only. */
  interactive: boolean;
}

export const CalendarFocusContext = createContext<CalendarFocusContextValue | null>(null);

/** @internal */
export const useCalendarFocus = (): CalendarFocusContextValue | null => useContext(CalendarFocusContext);
