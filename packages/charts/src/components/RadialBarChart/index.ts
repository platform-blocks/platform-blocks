import { withChartAutoSize } from '../../core/autoSize';
import { RadialBarChart as RadialBarChartBase } from './RadialBarChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `RadialBarChartBase`.
 */
export const RadialBarChart = withChartAutoSize(RadialBarChartBase, { width: 240, height: 240 });

export type { RadialBarChartProps, RadialBarDatum } from './types';