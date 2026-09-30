import { RadialBarChart } from '@plocks/charts';

import { AVG, METRICS } from './data';

export function Demo() {
	return (
		<RadialBarChart
			title="Quarterly KPIs"
			subtitle="Progress toward goals"
			maw={400}
			h={400}
			data={METRICS}
			barThickness={18}
			gap={12}
			showValueLabels
			valueFormatter={(value) => `${value}%`}
			centerLabel={`${AVG}%`}
			centerSubLabel="Avg score"
			multiTooltip
			liveTooltip
			legend={{ show: true, position: 'bottom' }}
		/>
	);
}
