import { StackedBarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
	return (
		<StackedBarChart
			title="Quarterly ARR by motion"
			width={520}
			height={320}
			series={SERIES}
			barSpacing={0.25}
			xAxis={{ show: true, title: 'Quarter' }}
			yAxis={{
				show: true,
				title: 'ARR (USD thousands)',
				labelFormatter: (value) => `$${value}`,
			}}
			grid={{ show: true }}
			legend={{ show: true, position: 'bottom' }}
			animation={{ duration: 500 }}
		/>
	);
}
