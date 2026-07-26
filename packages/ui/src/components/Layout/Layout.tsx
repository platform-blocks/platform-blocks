import React from 'react';
import type { View } from 'react-native';

import { Flex, FlexProps } from '../Flex';

export interface RowProps extends Omit<FlexProps, 'direction'> {
  /** Override direction - defaults to 'row' but can be changed to 'row-reverse' */
  direction?: 'row' | 'row-reverse';
}

export interface ColumnProps extends Omit<FlexProps, 'direction'> {
  /** Override direction - defaults to 'column' but can be changed to 'column-reverse' */
  direction?: 'column' | 'column-reverse';
}

/**
 * Row component - alias for Flex with direction="row"
 */
export const Row = React.forwardRef<View, RowProps>(
  ({ direction = 'row', gap = 'sm', ...props }, ref) => {
    return <Flex ref={ref} direction={direction} gap={gap} {...props} />;
  },
);

/**
 * Column component - alias for Flex with direction="column"
 * Defaults to fullWidth={true} since vertical layouts typically fill available width
 */
export const Column = React.forwardRef<View, ColumnProps>(
  ({ direction = 'column', gap = 'sm', fullWidth = true, ...props }, ref) => {
    return <Flex ref={ref} direction={direction} gap={gap} fullWidth={fullWidth} {...props} />;
  },
);

Row.displayName = 'Row';
Column.displayName = 'Column';
