import { withChartAutoSize } from '../../core/autoSize';
import { MarimekkoChart as MarimekkoChartBase } from './MarimekkoChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `MarimekkoChartBase`.
 */
export const MarimekkoChart = withChartAutoSize(MarimekkoChartBase, { width: 640, height: 400 });

export type { MarimekkoChartProps, MarimekkoCategory, MarimekkoSegment, MarimekkoDataPoint } from './types';
