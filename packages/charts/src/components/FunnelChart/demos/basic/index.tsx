import { FunnelChart } from '@platform-blocks/charts';

import { SALES_FUNNEL } from './data';

const compact = (value: number) => {
	const abs = Math.abs(value);
	if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
	return `${value}`;
};

export function Demo() {
	return (
		<FunnelChart
			title="Product acquisition funnel"
			width={420}
			height={420}
			series={SALES_FUNNEL}
			layout={{
				shape: 'trapezoid',
				gap: 8,
				showConversion: false,
				align: 'center',
				connectors: { show: false },
			}}
			valueFormatter={(value) => compact(value)}
			legend={{ show: false }}
			tooltip={{
				show: true,
				formatter: (step) => `${step.label}: ${step.value.toLocaleString()}`,
			}}
		/>
	);
}
