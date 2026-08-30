import { PieChart, type PieChartDataPoint } from '@platform-blocks/charts';

import { BROWSER_USAGE } from './data';

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${slice.value}%`;

const formatTooltip = (slice: PieChartDataPoint) => `${slice.label}: ${slice.value}% of sessions`;

export function Demo() {
  return (
    <PieChart
      title="Browser usage share"
      subtitle="Active sessions"
      maxWidth={520}
      height={420}
      data={BROWSER_USAGE}
      outerRadius={150}
      showLabels
      labelPosition="outside"
      padAngle={1.5}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'spiral', duration: 900 }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
