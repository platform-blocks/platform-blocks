import { GroupedBarChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export default function Demo() {
  return (
    <GroupedBarChart
      title="Assessment results by grade level"
      subtitle="Spring benchmark proficiency rates"
      width={600}
      height={360}
      series={SERIES}
      barSpacing={0.18}
      innerBarSpacing={0.18}
      xAxis={{
        show: true,
        title: 'Subject area',
      }}
      yAxis={{
        show: true,
        title: 'Students meeting or exceeding standard (%)',
        labelFormatter: (value) => `${value}%`,
        ticks: [60, 70, 80, 90, 100],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'inside',
        formatter: ({ value }) => `${Math.round(value)}%`,
        color: 'rgba(255,255,255,0.94)',
        fontWeight: '600',
        minBarHeightForInside: 20,
      }}
      animation={{ duration: 430 }}
    />
  );
}
