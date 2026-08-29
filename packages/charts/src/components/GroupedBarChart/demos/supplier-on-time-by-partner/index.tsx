import { GroupedBarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="On-time delivery by logistics partner"
      subtitle="Share of shipments delivered within committed window"
      width={620}
      height={360}
      series={SERIES}
      barSpacing={0.18}
      innerBarSpacing={0.16}
      xAxis={{
        show: true,
        title: 'Logistics partner',
      }}
      yAxis={{
        show: true,
        title: 'On-time shipments (%)',
        labelFormatter: (value) => `${value}%`,
        ticks: [80, 85, 90, 95, 100],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'inside',
        formatter: ({ value }) => `${Math.round(value)}%`,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
        minBarHeightForInside: 22,
      }}
      animation={{ duration: 440 }}
    />
  );
}
