import { NetworkChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<NetworkChart
			title="Cross-team collaboration"
			height={420}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
