import { SankeyChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<SankeyChart
			title="Renewable energy flow"
			width={660}
			height={360}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
