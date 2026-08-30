import { withChartAutoSize } from '../../core/autoSize';
import { ViolinChart as ViolinChartBase } from './ViolinChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `ViolinChartBase`.
 */
export const ViolinChart = withChartAutoSize(ViolinChartBase, { width: 400, height: 300 });

export type {
	ViolinChartProps,
	ViolinStatsMarkersConfig,
	ViolinValueBand,
	ViolinLayout,
	ViolinDensitySeries,
	ViolinSeriesStats,
	ViolinSeriesInteractionEvent,
} from './types';