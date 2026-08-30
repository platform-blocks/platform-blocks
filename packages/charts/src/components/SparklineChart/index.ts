import { withChartAutoSize } from '../../core/autoSize';
import { SparklineChart as SparklineChartBase } from './SparklineChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `SparklineChartBase`.
 */
export const SparklineChart = withChartAutoSize(SparklineChartBase, { width: 120, height: 48 });
export default SparklineChart;

export type { SparklineChartProps } from './types';
