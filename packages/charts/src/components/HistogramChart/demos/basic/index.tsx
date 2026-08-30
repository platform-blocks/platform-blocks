import { HistogramChart } from '@platform-blocks/charts';

import { SESSION_DURATIONS } from './data';

export function Demo() {
	return (
		<HistogramChart
			title="Session duration distribution"
			subtitle="Product analytics cohort"
			height={280}
			data={SESSION_DURATIONS}
			bins={10}
			showDensity
			densityThickness={3}
			densityColor="#12B886"
			barGap={0.15}
			tooltip={{
				show: true,
				formatter: (bin) => `${bin.count} sessions between ${bin.start}-${bin.end} min`,
			}}
			valueFormatter={(count, bin) => `${count} • ${bin.density.toFixed(2)} pdf`}
			enableCrosshair
			liveTooltip
		/>
	);
}
