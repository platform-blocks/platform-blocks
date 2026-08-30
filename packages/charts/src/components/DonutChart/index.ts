import { withChartAutoSize } from '../../core/autoSize';
import { DonutChart as DonutChartBase } from './DonutChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `DonutChartBase`.
 */
export const DonutChart = withChartAutoSize(DonutChartBase, { width: 320, height: 320 });

export type {
	DonutChartProps,
	SimpleDonutChartProps,
	DonutChartDataPoint,
	DonutChartRing,
		DonutChartRingDetails,
		DonutChartSliceDetails,
		DonutChartCenterRenderer,
		DonutChartCenterRenderContext,
		DonutChartLabelsConfig,
		DonutChartLabelFormatterContext,
} from './types';