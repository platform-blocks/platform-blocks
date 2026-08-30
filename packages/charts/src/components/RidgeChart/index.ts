import { withChartAutoSize } from '../../core/autoSize';
import { RidgeChart as RidgeChartBase } from './RidgeChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `RidgeChartBase`.
 */
export const RidgeChart = withChartAutoSize(RidgeChartBase, { width: 600, height: 300 });

export type { RidgeChartProps } from './types';