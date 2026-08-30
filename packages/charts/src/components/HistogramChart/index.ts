import { withChartAutoSize } from '../../core/autoSize';
import { HistogramChart as HistogramChartBase } from './HistogramChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `HistogramChartBase`.
 */
export const HistogramChart = withChartAutoSize(HistogramChartBase, { width: 400, height: 260 });

export type { HistogramChartProps, HistogramBinSummary } from './types';