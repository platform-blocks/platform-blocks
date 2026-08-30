import { BarChart } from '@platform-blocks/charts';

import { SLA_COMPLIANCE } from './data';

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function Demo() {
  return (
    <BarChart
      title="SLA compliance by response team"
      subtitle="Rolling 12-month attainment"
      height={420}
      orientation="horizontal"
      data={SLA_COMPLIANCE}
      barSpacing={0.3}
      legend={{ show: false }}
      valueFormatter={(value) => `${formatPercent(value)} SLA met`}
      valueLabel={{
        color: '#111827',
        fontSize: 12,
        offset: 12,
        formatter: (value) => formatPercent(value),
      }}
      xAxis={{
        title: 'Tickets meeting SLA target',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      yAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const last = datum.data?.lastQuarter ?? datum.value;
          const delta = datum.value - last;
          const direction = delta >= 0 ? '+' : '-';
          return [
            datum.category,
            `Current: ${formatPercent(datum.value)}`,
            `Last quarter: ${formatPercent(last)}`,
            `Change: ${direction}${Math.abs(delta).toFixed(1)} pts`,
          ].join('\n');
        },
      }}
    />
  );
}
