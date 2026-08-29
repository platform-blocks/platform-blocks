import { RidgeChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
	return (
		<RidgeChart
			title="Customer satisfaction distribution"
			subtitle="Annual NPS density"
			width={560}
			height={360}
			series={SERIES}
			samples={96}
			bandwidth={3}
			statsMarkers={{ enabled: true, showP90: true, showLabels: true }}
		/>
	);
}
