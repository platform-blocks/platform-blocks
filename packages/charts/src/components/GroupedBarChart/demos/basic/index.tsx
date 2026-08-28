import { GroupedBarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export default function Demo() {
	return (
		<GroupedBarChart
			title="Product revenue by segment"
			subtitle="Comparison vs targets"
			width={520}
			height={320}
			series={SERIES}
			barSpacing={0.15}
			innerBarSpacing={0.2}
			xAxis={{ show: true, title: 'Segment' }}
			yAxis={{
				show: true,
				title: 'Revenue (USD thousands)',
				labelFormatter: (value) => `$${value}`,
			}}
			grid={{ show: true }}
			legend={{ show: true, position: 'bottom' }}
			animation={{ duration: 450 }}
			colorOptions={{ hash: false }}
		/>
	);
}
