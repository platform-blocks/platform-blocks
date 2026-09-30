import { StackedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
	return (
		<StackedBarChart
			title="Quarterly ARR by motion"
			h={320}
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
