import { PieChart, type PieChartDataPoint } from '@platform-blocks/charts';

import { OPERATING_EXPENSES, TOTAL_EXPENSE } from './data';

const formatTooltip = (slice: PieChartDataPoint) => {
  const share = Math.round((slice.value / TOTAL_EXPENSE) * 100);
  return `${slice.label}: $${slice.value}M (${share}%)`;
};

export function Demo() {
  return (
    <PieChart
      title="Operating expense mix"
      subtitle="FY25 year-to-date"
      maxWidth={520}
      height={440}
      data={OPERATING_EXPENSES}
      innerRadius={90}
      outerRadius={160}
      showLabels
      labelPosition="outside"
      padAngle={1.5}
      labelFormatter={(slice) => `${slice.label} · $${slice.value}M`}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
