import { withChartAutoSize } from '../../core/autoSize';
import { StackedAreaChart as StackedAreaChartBase } from './StackedAreaChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `StackedAreaChartBase`.
 */
export const StackedAreaChart = withChartAutoSize(StackedAreaChartBase, { width: 400, height: 300 });

export type { StackedAreaChartProps } from './types';