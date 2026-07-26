import { SankeyChart } from '../../';

import { LINKS, NODES } from './data';

export default function Demo() {
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
