import { DonutChart } from '../../';

import { SEGMENTS } from './data';

export default function Demo() {
	return (
		<DonutChart
			title="Team allocation"
			size={260}
			data={SEGMENTS}
		/>
	);
}
