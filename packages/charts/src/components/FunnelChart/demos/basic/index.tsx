import { FunnelChart, formatCompactNumber } from '@platform-blocks/charts';

import { SALES_FUNNEL } from './data';

export function Demo() {
	return (
		<FunnelChart
			title="Product acquisition funnel"
			maw={420}
			h={420}
			series={SALES_FUNNEL}
			layout={{
				shape: 'trapezoid',
				gap: 8,
				showConversion: false,
				align: 'center',
				connectors: { show: false },
			}}
			valueFormatter={(value) => formatCompactNumber(value)}
			legend={{ show: false }}
			tooltip={{
				show: true,
				formatter: (step) => `${step.label}: ${step.value.toLocaleString()}`,
			}}
		/>
	);
}
