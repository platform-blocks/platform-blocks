import { withChartAutoSize } from '../../core/autoSize';
import { PieChart as PieChartBase } from './PieChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `PieChartBase`.
 */
export const PieChart = withChartAutoSize(PieChartBase, { width: 320, height: 320 });

export type {
	PieChartProps,
	PieChartDataPoint,
	PieChartLabelTextStyle,
} from './types';