import { withChartAutoSize } from '../../core/autoSize';
import { GaugeChart as GaugeChartBase } from './GaugeChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `GaugeChartBase`.
 */
export const GaugeChart = withChartAutoSize(GaugeChartBase, { width: 320, height: 240 });

export type {
  GaugeChartProps,
  GaugeChartRange,
  GaugeChartTickConfig,
  GaugeChartLabelConfig,
  GaugeChartNeedleConfig,
  GaugeChartCenterLabelConfig,
  GaugeChartTrackConfig,
  GaugeChartMarker,
} from './types';
