import React from 'react';
import type { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { Flex, type FlexProps } from '../Flex/Flex';

export interface RowProps extends Omit<FlexProps, 'direction'> {
  /** Override direction - defaults to 'row' but can be changed to 'row-reverse' */
  direction?: 'row' | 'row-reverse';
}

export interface ColumnProps extends Omit<FlexProps, 'direction'> {
  /** Override direction - defaults to 'column' but can be changed to 'column-reverse' */
  direction?: 'column' | 'column-reverse';
}

/**
 * Row component - alias for Flex with direction="row" (mirrored automatically
 * in right-to-left layouts).
 */
export const Row = factory<{ props: RowProps; ref: View }>(
  ({ direction = 'row', gap = 'sm', ...props }, ref) => <Flex ref={ref} direction={direction} gap={gap} {...props} />,
  { displayName: 'Row' }
);

/**
 * Column component - alias for Flex with direction="column"
 * Defaults to fullWidth={true} since vertical layouts typically fill available width
 */
export const Column = factory<{ props: ColumnProps; ref: View }>(
  ({ direction = 'column', gap = 'sm', fullWidth = true, ...props }, ref) => (
    <Flex ref={ref} direction={direction} gap={gap} fullWidth={fullWidth} {...props} />
  ),
  { displayName: 'Column' }
);
