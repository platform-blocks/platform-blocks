import { withChartAutoSize } from '../../core/autoSize';
import { ScatterChart as ScatterChartBase } from './ScatterChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `ScatterChartBase`.
 */
export const ScatterChart = withChartAutoSize(ScatterChartBase, { width: 400, height: 300 });
