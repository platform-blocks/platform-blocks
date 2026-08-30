import { withChartAutoSize } from '../../core/autoSize';
import { CandlestickChart as CandlestickChartBase } from './CandlestickChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `CandlestickChartBase`.
 */
export const CandlestickChart = withChartAutoSize(CandlestickChartBase, { width: 400, height: 300 });

export type { CandlestickChartProps } from './types';