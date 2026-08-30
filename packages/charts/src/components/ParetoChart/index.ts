import { withChartAutoSize } from '../../core/autoSize';
import { ParetoChart as ParetoChartBase } from './ParetoChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `ParetoChartBase`.
 */
export const ParetoChart = withChartAutoSize(ParetoChartBase, { width: 640, height: 360 });

export type { ParetoChartProps, ParetoChartDatum } from './types';
