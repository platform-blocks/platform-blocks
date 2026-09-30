import { RadialBarChart } from '@plocks/charts';

import { SCORE } from './data';

export function Demo() {
	return (
		<RadialBarChart
			title="Customer Satisfaction"
			subtitle="Rolling 30-day CSAT"
			maw={340}
			h={240}
			startAngle={-90}
			endAngle={90}
			data={SCORE}
			barThickness={24}
			showValueLabels={false}
			centerLabel="82"
			centerSubLabel="out of 100"
			multiTooltip
			liveTooltip
		/>
	);
}
