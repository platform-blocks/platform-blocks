import { PieChart, type PieChartDataPoint } from '@platform-blocks/charts';

import { TOTAL_COMPLETIONS, TRAINING_COMPLETIONS } from './data';

const toPercent = (value: number) => Math.round((value / TOTAL_COMPLETIONS) * 100);

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${toPercent(slice.value)}%`;

const formatTooltip = (slice: PieChartDataPoint) => {
  const share = toPercent(slice.value);
  return `${slice.label}: ${slice.value.toLocaleString()} completions (${share}%)`;
};

export function Demo() {
  return (
    <PieChart
      title="Training completion share"
      subtitle="Annual compliance program"
      width={520}
      height={440}
      data={TRAINING_COMPLETIONS}
      innerRadius={100}
      outerRadius={160}
      showLabels
      labelPosition="outside"
      padAngle={1.2}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'wave', duration: 900, stagger: 70 }}
      startAngle={-100}
      endAngle={260}
    />
  );
}
