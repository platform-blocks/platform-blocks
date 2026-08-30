import { withChartAutoSize } from '../../core/autoSize';
import { ComboChart as ComboChartBase } from './ComboChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `ComboChartBase`.
 */
export const ComboChart = withChartAutoSize(ComboChartBase, { width: 520, height: 320 });

export type { ComboChartProps, ComboChartLayer } from './types';