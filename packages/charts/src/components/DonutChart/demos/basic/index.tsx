import { DonutChart } from '@plocks/charts';

import { SEGMENTS } from './data';

export function Demo() {
	return (
		<DonutChart
			title="Team allocation"
			size={260}
			data={SEGMENTS}
		/>
	);
}
