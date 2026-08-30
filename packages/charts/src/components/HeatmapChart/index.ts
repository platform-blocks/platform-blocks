import { withChartAutoSize } from '../../core/autoSize';
import { HeatmapChart as HeatmapChartBase } from './HeatmapChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `HeatmapChartBase`.
 */
export const HeatmapChart = withChartAutoSize(HeatmapChartBase, { width: 420, height: 320 });
export default HeatmapChart;

export type { HeatmapChartProps, HeatmapCell } from './types';