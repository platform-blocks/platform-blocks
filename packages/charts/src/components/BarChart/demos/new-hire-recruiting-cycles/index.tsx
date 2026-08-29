import { BarChart } from '@platform-blocks/charts';

import { RECRUITING_PROGRESS } from './data';

const formatDelta = (value: number, datum: (typeof RECRUITING_PROGRESS)[number]) => {
  const previous = datum.data?.previous ?? 0;
  const delta = value - previous;
  if (delta === 0) return 'No change vs last cycle';
  const sign = delta > 0 ? '+' : '-';
  return `${sign}${Math.abs(delta)} vs last cycle`;
};

export function Demo() {
  return (
    <BarChart
      title="New hires secured this recruiting cycle"
      subtitle="Compared with winter intake"
      width={720}
      height={440}
      orientation="horizontal"
      data={RECRUITING_PROGRESS}
      barSpacing={0.25}
      legend={{ show: false }}
      valueFormatter={(value) => `${value} hires`}
      valueLabel={{
        formatter: (value, datum) => formatDelta(value, datum as (typeof RECRUITING_PROGRESS)[number]),
        color: '#1f2937',
        fontSize: 12,
        offset: 10,
      }}
      xAxis={{
        title: 'Hires confirmed',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const previous = datum.data?.previous ?? 0;
          const delta = datum.value - previous;
          const direction = delta >= 0 ? '+' : '-';
          return [
            `${datum.category}`,
            `This cycle: ${datum.value} hires`,
            `Last cycle: ${previous} hires`,
            `Delta: ${direction}${Math.abs(delta)}`,
            datum.data?.priority ? `Focus: ${datum.data.priority}` : undefined,
            datum.data?.openRoles != null ? `Open roles: ${datum.data.openRoles}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
