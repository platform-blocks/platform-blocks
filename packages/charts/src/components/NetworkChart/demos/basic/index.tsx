import { NetworkChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<NetworkChart
			title="Cross-team collaboration"
			h={420}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
