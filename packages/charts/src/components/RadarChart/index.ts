import { withChartAutoSize } from '../../core/autoSize';
import { RadarChart as RadarChartBase } from './RadarChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `RadarChartBase`.
 */
export const RadarChart = withChartAutoSize(RadarChartBase, { width: 400, height: 400 });
