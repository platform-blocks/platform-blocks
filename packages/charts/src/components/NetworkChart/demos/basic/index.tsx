import { NetworkChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
	return (
		<NetworkChart
			title="Cross-team collaboration"
			h={460}
			layout="circular"
			nodes={NODES}
			links={LINKS}
		/>
	);
}
