import { RadialBarChart } from '@plocks/charts';

import { GOAL } from './data';

export function Demo() {
	return (
		<RadialBarChart
			title="Fundraising Goal"
			subtitle="$74k raised of $100k"
			maw={300}
			h={300}
			data={GOAL}
			barThickness={24}
			showValueLabels={false}
			centerLabel="74%"
			centerSubLabel="of goal"
			multiTooltip
			liveTooltip
		/>
	);
}
