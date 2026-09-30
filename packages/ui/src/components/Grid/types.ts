import type React from 'react';
import type { ViewProps, ViewStyle } from 'react-native';

import type { ResponsiveProp } from '../../core/theme/breakpoints';
import type { SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';

export interface GridProps extends BaseProps<ViewStyle>, Omit<ViewProps, 'style' | 'testID' | 'children'> {
  /** Number of columns (can be responsive) */
  columns?: ResponsiveProp<number>;
  /** Gap between items */
  gap?: SizeValue;
  /** Row gap between items */
  rowGap?: SizeValue;
  /** Column gap between items */
  columnGap?: SizeValue;
  /** Make the grid take full width (100%) */
  fullWidth?: boolean;
  /** Children elements */
  children?: React.ReactNode;
}

export interface GridItemProps extends BaseProps<ViewStyle>, Omit<ViewProps, 'style' | 'testID' | 'children'> {
  /** Column span (how many columns this item should span) - can be responsive */
  span?: ResponsiveProp<number>;
  /** Children elements */
  children?: React.ReactNode;
}
