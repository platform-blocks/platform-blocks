import { RadialBarChart } from '@platform-blocks/charts';

import { GOAL } from './data';

export default function Demo() {
	return (
		<RadialBarChart
			title="Fundraising Goal"
			subtitle="$74k raised of $100k"
			width={300}
			height={300}
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
