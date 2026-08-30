import { withChartAutoSize } from '../../core/autoSize';
import { BubbleChart as BubbleChartBase } from './BubbleChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `BubbleChartBase`.
 */
export const BubbleChart = withChartAutoSize(BubbleChartBase, { width: 400, height: 300 });

export type { BubbleChartProps, SimpleBubbleChartProps } from './types';