import { withChartAutoSize } from '../../core/autoSize';
import { GroupedBarChart as GroupedBarChartBase } from './GroupedBarChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `GroupedBarChartBase`.
 */
export const GroupedBarChart = withChartAutoSize(GroupedBarChartBase, { width: 400, height: 300 });

export type { GroupedBarChartProps } from './types';