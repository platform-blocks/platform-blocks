import { withChartAutoSize } from '../../core/autoSize';
import { LineChart as LineChartBase } from './LineChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `LineChartBase`.
 */
export const LineChart = withChartAutoSize(LineChartBase, { width: 400, height: 300 });

export type { LineChartProps, LineChartSeries } from './types';