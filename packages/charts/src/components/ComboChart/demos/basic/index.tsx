import { ComboChart } from '@platform-blocks/charts';

import { LAYERS } from './data';

export default function Demo() {
	return (
		<ComboChart
			title="Revenue vs. active users"
			subtitle="First half of FY25"
			width={540}
			height={340}
			layers={LAYERS}
			enableCrosshair
			multiTooltip
			liveTooltip
			xAxis={{
				show: true,
				title: 'Month',
				labelFormatter: (value) => `M${value}`,
			}}
			yAxis={{
				show: true,
				title: 'Revenue (USD thousands)',
				labelFormatter: (value) => `$${value}`,
			}}
			yAxisRight={{
				show: true,
				title: 'Active users (thousands)',
				labelFormatter: (value) => `${value}k`,
			}}
			yDomain={[0, 650]}
			yDomainRight={[80, 200]}
			grid={{ show: true, style: 'dashed' }}
			legend={{ show: true, position: 'bottom' }}
		/>
	);
}
