import { SankeyChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<SankeyChart
			title="Renewable energy flow"
			height={360}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
