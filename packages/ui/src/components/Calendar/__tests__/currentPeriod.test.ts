import { getCurrentPeriodStyles, getCurrentPeriodTextColor } from '../currentPeriod';
import type { PlatformBlocksTheme } from '../../../core/theme/types';

const theme = {
  colors: {
    primary: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'],
  },
} as unknown as PlatformBlocksTheme;

describe('currentPeriod', () => {
  describe('getCurrentPeriodStyles', () => {
    it('draws a ring on the current period', () => {
      expect(getCurrentPeriodStyles(theme, { isCurrent: true, isSelected: false })).toEqual({
        borderWidth: 1,
        borderColor: theme.colors.primary[4],
      });
    });

    it('yields to selection so the two never stack', () => {
      expect(getCurrentPeriodStyles(theme, { isCurrent: true, isSelected: true })).toEqual({
        borderWidth: 0,
        borderColor: 'transparent',
      });
    });

    it('leaves ordinary cells unringed', () => {
      expect(getCurrentPeriodStyles(theme, { isCurrent: false, isSelected: false })).toEqual({
        borderWidth: 0,
        borderColor: 'transparent',
      });
    });
  });

  describe('getCurrentPeriodTextColor', () => {
    it('tints the current period', () => {
      expect(getCurrentPeriodTextColor(theme, { isCurrent: true, isSelected: false })).toBe(
        theme.colors.primary[6]
      );
    });

    it('returns undefined when the cell should keep its own color', () => {
      expect(getCurrentPeriodTextColor(theme, { isCurrent: true, isSelected: true })).toBeUndefined();
      expect(getCurrentPeriodTextColor(theme, { isCurrent: false, isSelected: false })).toBeUndefined();
    });
  });
});
