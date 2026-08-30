import { withChartAutoSize } from '../../core/autoSize';
import { SankeyChart as SankeyChartBase } from './SankeyChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `SankeyChartBase`.
 */
export const SankeyChart = withChartAutoSize(SankeyChartBase, { width: 600, height: 400 });

export type { SankeyChartProps } from './types';