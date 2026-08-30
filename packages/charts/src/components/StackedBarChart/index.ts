import { withChartAutoSize } from '../../core/autoSize';
import { StackedBarChart as StackedBarChartBase } from './StackedBarChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `StackedBarChartBase`.
 */
export const StackedBarChart = withChartAutoSize(StackedBarChartBase, { width: 400, height: 300 });

export type { StackedBarChartProps } from './types';