import { RidgeChart } from '../../';

import { SERIES } from './data';

export default function Demo() {
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
