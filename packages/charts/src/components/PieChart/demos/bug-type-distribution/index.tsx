import { PieChart, type PieChartDataPoint } from '@platform-blocks/charts';

import { BUG_TYPES } from './data';

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${slice.value}%`;

const formatTooltip = (slice: PieChartDataPoint) => `${slice.label}: ${slice.value}% of release defects`;

export function Demo() {
  return (
    <PieChart
      title="Bug type distribution"
      subtitle="Latest release cycle"
      width={560}
      height={380}
      data={BUG_TYPES}
      innerRadius={70}
      outerRadius={150}
      showLabels
      labelPosition="center"
      labelFormatter={formatLabel}
      padAngle={1}
      legend={{ show: true, position: 'right' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'bounce', duration: 800, stagger: 80 }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
