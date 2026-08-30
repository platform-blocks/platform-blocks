import { withChartAutoSize } from '../../core/autoSize';
import { NetworkChart as NetworkChartBase } from './NetworkChart';

/**
 * Fills the box it is given unless `width` says otherwise — see
 * `withChartAutoSize`. The unwrapped component is `NetworkChartBase`.
 */
export const NetworkChart = withChartAutoSize(NetworkChartBase, { width: 600, height: 400 });

export type {
	NetworkChartProps,
	NetworkNode,
	NetworkLink,
	NetworkLayoutMode,
	NetworkLinkShape,
	NetworkNodeInteractionEvent,
	NetworkLinkInteractionEvent,
} from './types';