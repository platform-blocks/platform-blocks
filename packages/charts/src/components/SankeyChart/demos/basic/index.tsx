import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<SankeyChart
			title="Renewable energy flow"
			h={360}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
