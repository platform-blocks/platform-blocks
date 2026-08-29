import { PieChart, type PieChartDataPoint } from '@platform-blocks/charts';

import { SUPPORT_CHANNELS, TOTAL_INTERACTIONS } from './data';

const toShare = (value: number) => Math.round((value / TOTAL_INTERACTIONS) * 100);

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${toShare(slice.value)}%`;

const formatTooltip = (slice: PieChartDataPoint) => {
  const share = toShare(slice.value);
  return `${slice.label}: ${slice.value.toLocaleString()} interactions (${share}%)`;
};

export function Demo() {
  return (
    <PieChart
      title="Support contact mix"
      subtitle="Last 30 days"
      width={580}
      height={380}
      data={SUPPORT_CHANNELS}
      innerRadius={80}
      outerRadius={150}
      showLabels
      labelPosition="outside"
      padAngle={1}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'right' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      startAngle={-70}
      endAngle={290}
    />
  );
}
