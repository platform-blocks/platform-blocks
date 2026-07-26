import { RadialBarChart } from '../../';

import { AVG, METRICS } from './data';

export default function Demo() {
	return (
		<RadialBarChart
			title="Quarterly KPIs"
			subtitle="Progress toward goals"
			width={400}
			height={400}
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
