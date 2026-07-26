import { NetworkChart } from '../../';

import { LINKS, NODES } from './data';

export default function Demo() {
	return (
		<NetworkChart
			title="Cross-team collaboration"
			width={640}
			height={420}
			nodes={NODES}
			links={LINKS}
		/>
	);
}
