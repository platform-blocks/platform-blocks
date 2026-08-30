import { withChartAutoSize } from '../../core/autoSize';
import { BarChart as BarChartBase } from './BarChart';

/** Fills its container by default; see `withChartAutoSize`. */
export const BarChart = withChartAutoSize(BarChartBase, { width: 400, height: 300 });

export type { BarChartProps, BarChartDataPoint, BarChartValueLabelConfig } from './types';
