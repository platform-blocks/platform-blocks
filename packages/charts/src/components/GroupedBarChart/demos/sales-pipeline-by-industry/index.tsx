import { GroupedBarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="Sales pipeline by industry"
      subtitle="Qualified pipeline this quarter (USD millions)"
      width={620}
      height={360}
      series={SERIES}
      barSpacing={0.2}
      innerBarSpacing={0.22}
      xAxis={{
        show: true,
        title: 'Industry vertical',
      }}
      yAxis={{
        show: true,
        title: 'Pipeline value (USD millions)',
        labelFormatter: (value) => `$${value.toFixed(1)}M`,
        ticks: [0, 2, 4, 6],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'outside',
        formatter: ({ value }) => `$${value.toFixed(1)}M`,
        color: '#2F2F35',
        fontWeight: '600',
        offset: 10,
      }}
      animation={{ duration: 440 }}
    />
  );
}
