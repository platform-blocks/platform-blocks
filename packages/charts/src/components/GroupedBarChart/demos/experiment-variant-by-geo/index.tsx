import { GroupedBarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="Experiment conversion uplift by region"
      subtitle="Completed purchases per 100 sessions"
      height={340}
      series={SERIES}
      barSpacing={0.22}
      innerBarSpacing={0.18}
      xAxis={{
        show: true,
        title: 'Region',
      }}
      yAxis={{
        show: true,
        title: 'Conversion rate (%)',
        labelFormatter: (value) => `${value.toFixed(1)}%`,
        ticks: [3, 4, 5, 6],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      multiTooltip
      liveTooltip
      valueLabels={{
        show: true,
        position: 'outside',
        formatter: ({ value }) => `${value.toFixed(1)}%`,
        color: '#1F1F24',
        fontWeight: '600',
        offset: 8,
      }}
      animation={{ duration: 420 }}
    />
  );
}
