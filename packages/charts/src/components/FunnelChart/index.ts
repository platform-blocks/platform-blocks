import { withChartAutoSize } from '../../core/autoSize';
import { FunnelChart as FunnelChartBase } from './FunnelChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `FunnelChartBase`.
 */
export const FunnelChart = withChartAutoSize(FunnelChartBase, { width: 360, height: 420 });

export type {
	FunnelChartProps,
	FunnelValueFormatter,
	FunnelValueFormatterContext,
	FunnelConnectorConfig,
	FunnelConversionLabelFormatter,
	FunnelAccessibilityTableOptions,
	FunnelDataTablePayload,
} from './types';