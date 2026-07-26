import type { PlatformBlocksTheme } from '../../core/theme/types';

/**
 * Shared "this is now" treatment for every date grid — Calendar days,
 * MiniCalendar days, MonthPicker months and YearPicker years.
 *
 * The rule: the current period is drawn as a 1px ring, never a fill. Selection
 * owns the solid `primary[5]` fill, so the two can't be confused, and a filled
 * "today" no longer reads as a permanently-pressed cell (the grids all use
 * `gray[2]` as their pressed background).
 *
 * Selection always wins: a cell that is both current and selected shows only
 * the selected fill.
 */
export interface CurrentPeriodState {
  /** Cell represents the current day / month / year. */
  isCurrent: boolean;
  /** Cell is the selected value. Selection outranks the current-period ring. */
  isSelected: boolean;
}

export const getCurrentPeriodStyles = (
  theme: PlatformBlocksTheme,
  { isCurrent, isSelected }: CurrentPeriodState
): { borderWidth: number; borderColor: string } =>
  isCurrent && !isSelected
    ? { borderWidth: 1, borderColor: theme.colors.primary[4] }
    : { borderWidth: 0, borderColor: 'transparent' };

/**
 * Text color for a current-period cell, or `undefined` when the cell should
 * keep whatever color its own state (disabled / outside / weekend) resolves to.
 */
export const getCurrentPeriodTextColor = (
  theme: PlatformBlocksTheme,
  { isCurrent, isSelected }: CurrentPeriodState
): string | undefined => (isCurrent && !isSelected ? theme.colors.primary[6] : undefined);
